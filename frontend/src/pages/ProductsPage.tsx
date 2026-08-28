import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductFilters, type FilterState } from '@/components/product/ProductFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: '', minPrice: '', maxPrice: '' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search);

  const { data, isLoading, isFetching } = useProducts({
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="container-lumos py-12">
      <div className="mb-10">
        <p className="eyebrow mb-2">The full catalogue</p>
        <h1 className="font-display text-4xl text-ink">Shop everything</h1>
      </div>

      <ProductFilters
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="mt-10">
        <ProductGrid products={data?.items ?? []} isLoading={isLoading} />
      </div>

      {totalPages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="font-mono text-xs text-ink-muted">
            Page {page} of {totalPages} {isFetching && '· updating…'}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
