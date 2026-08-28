import { useCategories } from '@/hooks/useCategories';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export function ProductFilters({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const { data: categories = [] } = useCategories();

  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex-1 sm:max-w-sm">
        <Input
          label="Search"
          placeholder="Search the catalogue…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Select label="Category" value={filters.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Min price"
          type="number"
          min={0}
          placeholder="0"
          className="w-28"
          value={filters.minPrice}
          onChange={(e) => set({ minPrice: e.target.value })}
        />
        <Input
          label="Max price"
          type="number"
          min={0}
          placeholder="Any"
          className="w-28"
          value={filters.maxPrice}
          onChange={(e) => set({ maxPrice: e.target.value })}
        />
      </div>
    </div>
  );
}
