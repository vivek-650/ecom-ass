import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAuth } from '@/context/AuthContext';
import { useCartMutations } from '@/hooks/useCart';
import { useIsWishlisted, useWishlistMutations } from '@/hooks/useWishlist';
import { cn } from '@/utils/cn';
import { HeartIcon } from '@/components/ui/Icons';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { token } = useAuth();
  const { addItem } = useCartMutations();
  const { addItem: addWish, removeItem: removeWish } = useWishlistMutations();
  const isWishlisted = useIsWishlisted(product.id);
  const outOfStock = product.stock <= 0;

  const wishlistPending = addWish.isPending || removeWish.isPending;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    // Ignore a second tap while the first is still in flight, rather than
    // firing add-then-remove (or vice versa) back to back.
    if (!token || wishlistPending) return;
    if (isWishlisted) removeWish.mutate(product.id);
    else addWish.mutate(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token || outOfStock) return;
    addItem.mutate({ productId: product.id });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-md border border-ink/10 bg-white transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-square bg-ink/5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-ink/15">Lumos</div>
        )}

        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-ink/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Sold out
          </span>
        )}

        {token && (
          <button
            onClick={toggleWishlist}
            disabled={wishlistPending}
            aria-label="Toggle wishlist"
            className={cn(
              'absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow-card transition-colors',
              isWishlisted ? 'text-ember' : 'text-ink-muted hover:text-ink'
            )}
          >
            <HeartIcon size={14} filled={isWishlisted} />
          </button>
        )}
      </div>

      <div className="p-2.5">
        <p className="line-clamp-2 text-sm text-ink">{product.name}</p>
        <p className="eyebrow mt-1 text-ink-muted">{product.category}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="price text-base">{formatCurrency(product.price)}</p>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || addItem.isPending}
            className="rounded bg-forest px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {outOfStock ? 'N/A' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
