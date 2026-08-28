import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart, useCartMutations, useCartTotal } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { openRazorpayCheckout } from '@/utils/razorpay';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MinusIcon, PlusIcon } from '@/components/ui/Icons';
import { ApiRequestError } from '@/api/axiosClient';

export function CartPage() {
  const { data: items, isLoading } = useCart();
  const { updateQuantity, removeItem } = useCartMutations();
  const total = useCartTotal();
  const { profile } = useAuth();
  const { createRazorpayOrder, verifyPayment } = useCheckout();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Minted once per checkout attempt — the Checkout button is disabled
      // while isCheckingOut is true, so this also guards against a
      // double-click firing two requests off the same click.
      const idempotencyKey = crypto.randomUUID();
      const razorpayOrder = await createRazorpayOrder.mutateAsync(idempotencyKey);
      openRazorpayCheckout({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Lumos Market',
        description: 'Order payment (test mode)',
        order_id: razorpayOrder.razorpayOrderId,
        prefill: { name: profile?.full_name ?? undefined, email: profile?.email },
        theme: { color: '#15803D' },
        handler: async (response) => {
          try {
            await verifyPayment.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment verified — order placed!');
            navigate('/orders');
          } catch (err) {
            toast.error(err instanceof ApiRequestError ? err.message : 'Payment verification failed');
          }
        },
        modal: { ondismiss: () => setIsCheckingOut(false) },
      });
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not start checkout');
      setIsCheckingOut(false);
    }
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="container-lumos py-24">
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalogue and add something considered."
          action={
            <Link to="/products">
              <Button className="mt-2">Shop the catalogue</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-lumos py-12">
      <h1 className="mb-6 font-display text-2xl text-ink sm:mb-10 sm:text-4xl">Your cart</h1>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-6 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 border-b border-ink/8 pb-6 sm:gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-dim sm:h-24 sm:w-24">
                {item.product.image_url && (
                  <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="min-w-0">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="line-clamp-2 font-display text-base text-ink hover:text-forest-deep sm:text-lg"
                  >
                    {item.product.name}
                  </Link>
                  <p className="price mt-1 text-sm text-ink-muted">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center rounded-md border border-ink/15">
                    <button
                      onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      className="grid h-8 w-8 place-items-center text-ink-muted hover:text-ink sm:h-9 sm:w-9"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={13} />
                    </button>
                    <span className="w-7 text-center text-sm sm:w-8">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity.mutate({
                          itemId: item.id,
                          quantity: Math.min(item.product.stock, item.quantity + 1),
                        })
                      }
                      className="grid h-8 w-8 place-items-center text-ink-muted hover:text-ink sm:h-9 sm:w-9"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    className="text-xs uppercase tracking-widest text-ember hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-ink/10 p-6">
          <div className="flex items-center justify-between text-sm text-ink-muted">
            <span>Subtotal</span>
            <span className="price text-ink">{formatCurrency(total)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">Taxes and shipping calculated at checkout.</p>
          <Button className="mt-6 w-full" size="lg" isLoading={isCheckingOut} onClick={handleCheckout}>
            Checkout with Razorpay
          </Button>
        </div>
      </div>
    </div>
  );
}
