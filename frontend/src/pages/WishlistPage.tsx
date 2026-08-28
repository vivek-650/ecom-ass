import { Link } from 'react-router-dom';
import { useWishlist, useWishlistMutations } from '@/hooks/useWishlist';
import { useCartMutations } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function WishlistPage() {
  const { data: items, isLoading } = useWishlist();
  const { removeItem } = useWishlistMutations();
  const { addItem } = useCartMutations();

  if (!isLoading && items.length === 0) {
    return (
      <div className="container-lumos py-24">
        <EmptyState
          title="Your wishlist is empty"
          description="Save pieces you're considering — they'll wait here for you."
          action={
            <Link to="/products">
              <Button className="mt-2">Browse products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-lumos py-12">
      <h1 className="mb-6 font-display text-2xl text-ink sm:mb-10 sm:text-4xl">Your wishlist</h1>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group">
            <Link to={`/products/${item.product.id}`} className="block">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-paper-dim">
                {item.product.image_url && (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="eyebrow mt-3">{item.product.category}</p>
              <h3 className="font-display text-lg text-ink">{item.product.name}</h3>
              <p className="price text-sm text-ink-muted">{formatCurrency(item.product.price)}</p>
            </Link>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                isLoading={addItem.isPending}
                onClick={() => addItem.mutate({ productId: item.product.id })}
              >
                Add to cart
              </Button>
              <Button size="sm" variant="danger" onClick={() => removeItem.mutate(item.product.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
