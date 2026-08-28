import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/formatCurrency';
import { SearchIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';

const SUGGESTION_LIMIT = 6;

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 250);
  const trimmed = debouncedQuery.trim();

  // Reuses the same products endpoint the catalogue page uses -- React
  // Query dedupes/caches by query key, so typing "iph" then "iphone" doesn't
  // issue two independent uncached round-trips once "iph" was already seen.
  const { data, isFetching } = useProducts({
    search: trimmed || undefined,
    page: 1,
    limit: SUGGESTION_LIMIT,
  });
  const suggestions = trimmed ? (data?.items ?? []) : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToResults = (q: string) => {
    navigate(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setIsOpen(false);
  };

  const goToProduct = (id: string) => {
    navigate(`/products/${id}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') goToResults(query);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) goToProduct(suggestions[activeIndex].id);
      else goToResults(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center rounded-md border border-ink/15 bg-paper-dim px-3 focus-within:border-forest focus-within:bg-white">
        <SearchIcon className="shrink-0 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, categories…"
          className="h-10 w-full bg-transparent px-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
      </div>

      {isOpen && trimmed && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-ink/10 bg-white shadow-card-hover"
        >
          {isFetching && suggestions.length === 0 ? (
            <div className="p-4 text-sm text-ink-muted">Searching…</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-sm text-ink-muted">No products match "{trimmed}"</div>
          ) : (
            <ul>
              {suggestions.map((product, i) => (
                <li key={product.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={() => goToProduct(product.id)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                      i === activeIndex ? 'bg-forest/5' : 'hover:bg-ink/5'
                    )}
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-ink/5">
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{product.name}</p>
                      <p className="eyebrow text-ink-muted">{product.category}</p>
                    </div>
                    <p className="price shrink-0 text-sm">{formatCurrency(product.price)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onMouseDown={() => goToResults(query)}
            className="flex w-full items-center justify-between border-t border-ink/8 px-3 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5"
          >
            See all results for "{trimmed}"
            <ArrowRightIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
