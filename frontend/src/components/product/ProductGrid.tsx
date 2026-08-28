import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductGrid({ products, isLoading }: { products: Product[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3.5">
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-paper-dim" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-paper-dim" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-paper-dim" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState title="No products found" description="Try adjusting your search or filters." />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
