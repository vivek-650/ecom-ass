import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAuth } from '@/context/AuthContext';
import { useCartMutations } from '@/hooks/useCart';
import { useIsWishlisted, useWishlistMutations } from '@/hooks/useWishlist';
import { cn } from '@/utils/cn';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { token } = useAuth();
  const { addItem } = useCartMutations();
  const { addItem: addWish, removeItem: removeWish } = useWishlistMutations();
  const isWishlisted = useIsWishlisted(product.id);
  const outOfStock = product.stock <= 0;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) return;
    if (isWishlisted) removeWish.mutate(product.id);
    else addWish.mutate(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token || outOfStock) return;
    addItem.mutate({ productId: product.id });
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-dim">
        <div className="absolute inset-0 bg-radial-glow opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center font-display text-4xl text-ink/10">Lumos</div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-paper">
            Sold out
          </span>
        )}

        {token && (
          <button
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
            className={cn(
              'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paper/90 backdrop-blur transition-all',
              isWishlisted ? 'text-ember' : 'text-ink-muted opacity-0 group-hover:opacity-100'
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M12 20s-7-4.4-9.5-9C.7 7.2 3 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19 4 21.3 7.2 19.5 11c-2.5 4.6-7.5 9-7.5 9Z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleAddToCart}
          disabled={outOfStock || addItem.isPending}
          className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-ink py-2.5 text-xs font-medium uppercase tracking-widest text-paper opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed"
        >
          {outOfStock ? 'Unavailable' : 'Add to cart'}
        </button>
      </div>

      <div className="mt-3.5 space-y-1">
        <p className="eyebrow">{product.category}</p>
        <h3 className="font-display text-lg leading-snug text-ink">{product.name}</h3>
        <p className="price text-sm text-ink-muted">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  );
}
