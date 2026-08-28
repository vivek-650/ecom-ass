import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { useCartMutations } from '@/hooks/useCart';
import { useIsWishlisted, useWishlistMutations } from '@/hooks/useWishlist';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { session } = useAuth();
  const { addItem } = useCartMutations();
  const { addItem: addWish, removeItem: removeWish } = useWishlistMutations();
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = useIsWishlisted(id ?? '');

  if (isLoading) return <PageSpinner />;
  if (!product) {
    return (
      <div className="container-lumos py-24 text-center">
        <p className="font-display text-2xl text-ink">Product not found</p>
        <Link to="/products" className="mt-4 inline-block text-sm text-gold-deep hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="container-lumos py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-paper-dim">
          <div className="absolute inset-0 bg-radial-glow" />
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center font-display text-5xl text-ink/10">Lumos</div>
          )}
        </div>

        <div className="flex flex-col">
          <Badge tone="gold">{product.category}</Badge>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink">{product.name}</h1>
          <p className="price mt-4 text-2xl text-ink">{formatCurrency(product.price)}</p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-muted">
            {product.description || 'No description provided for this item.'}
          </p>

          <div className="mt-2 font-mono text-xs text-ink-muted">
            {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-ink-muted hover:text-ink"
              >
                −
              </button>
              <span className="w-8 text-center font-mono text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="grid h-11 w-11 place-items-center text-ink-muted hover:text-ink"
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={outOfStock || !session}
              isLoading={addItem.isPending}
              onClick={() => addItem.mutate({ productId: product.id, quantity })}
            >
              {outOfStock ? 'Unavailable' : 'Add to cart'}
            </Button>

            {session && (
              <Button
                size="lg"
                variant="secondary"
                aria-label="Toggle wishlist"
                onClick={() => (isWishlisted ? removeWish.mutate(product.id) : addWish.mutate(product.id))}
              >
                {isWishlisted ? '♥' : '♡'}
              </Button>
            )}
          </div>

          {!session && (
            <p className="mt-4 text-xs text-ink-muted">
              <Link to="/login" className="text-gold-deep hover:underline">
                Sign in
              </Link>{' '}
              to add items to your cart or wishlist.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
