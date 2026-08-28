import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductFilters, type FilterState } from '@/components/product/ProductFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 20;

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    minPrice: '',
    maxPrice: '',
  });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search);

  // The navbar's search box and category chips link here with query params —
  // re-sync local filter state whenever they change (e.g. clicking a
  // different category chip while already on this page).
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('q') ?? prev.search,
      category: searchParams.get('category') ?? '',
    }));
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

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
    <div className="container-lumos py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-ink">
          {filters.category ? filters.category : 'All products'}
          {data && <span className="ml-2 text-sm font-normal text-ink-muted">({data.total} results)</span>}
        </h1>
      </div>

      <div className="rounded-md border border-ink/10 bg-white p-4">
        <ProductFilters
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-6">
        <ProductGrid products={data?.items ?? []} isLoading={isLoading} />
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-ink-muted">
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
