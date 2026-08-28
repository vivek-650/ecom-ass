import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductGrid({ products, isLoading }: { products: Product[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-ink/10 bg-white">
            <div className="aspect-square animate-pulse bg-ink/5" />
            <div className="space-y-2 p-2.5">
              <div className="h-3 w-4/5 animate-pulse rounded bg-ink/5" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-ink/5" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-ink/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState title="No products found" description="Try adjusting your search or filters." />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
