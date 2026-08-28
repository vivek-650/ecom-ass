import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getCategoryIcon } from '@/utils/categoryIcons';

const PROMOS = [
  { title: 'New arrivals', sub: 'Freshly listed this week', href: '/products' },
  { title: 'Sell on Lumos', sub: 'List your first product', href: '/register' },
  { title: 'Top picks', sub: 'Loved by shoppers', href: '/products' },
];

// Homepage rows: New arrivals first, then a curated set of category-specific
// rows (mirrors how Flipkart/Amazon homepages are structured -- many
// distinct sections rather than one long grid).
const FEATURED_CATEGORIES = ['Mobiles', 'Electronics', 'Fashion', 'Home & Furniture', 'Beauty'];

export function HomePage() {
  const { data: newArrivals, isLoading: loadingNew } = useProducts({ page: 1, limit: 10 });
  const { data: categories = [] } = useCategories();

  return (
    <div className="bg-paper-dim pb-14">
      <section className="container-lumos pt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PROMOS.map((promo) => (
            <Link
              key={promo.title}
              to={promo.href}
              className="flex flex-col justify-between rounded-md border border-ink/10 bg-white p-5 transition-colors hover:border-ink/20"
            >
              <div>
                <p className="eyebrow text-ink-muted">{promo.sub}</p>
                <p className="mt-1 text-xl font-bold text-ink">{promo.title}</p>
              </div>
              <span className="mt-6 text-sm font-semibold text-forest">Explore now →</span>
            </Link>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-lumos mt-6">
          <div className="rounded-md border border-ink/10 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Shop by category</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-11">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="flex flex-col items-center gap-2 rounded-md border border-ink/10 p-3 text-center transition-colors hover:border-forest/40 hover:bg-forest/5"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink">
                      <Icon size={18} />
                    </span>
                    <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink-muted">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <ProductSection title="New arrivals" href="/products">
        <ProductGrid products={newArrivals?.items ?? []} isLoading={loadingNew} />
      </ProductSection>

      {FEATURED_CATEGORIES.filter((c) => categories.some((cat) => cat.name === c)).map((category) => (
        <CategorySection key={category} category={category} />
      ))}
    </div>
  );
}

function ProductSection({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <section className="container-lumos mt-6">
      <div className="rounded-md border border-ink/10 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <Link to={href} className="text-sm font-semibold text-forest hover:underline">
            View all
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

function CategorySection({ category }: { category: string }) {
  const { data, isLoading } = useProducts({ category, page: 1, limit: 5 });
  if (!isLoading && (!data || data.items.length === 0)) return null;

  return (
    <ProductSection title={category} href={`/products?category=${encodeURIComponent(category)}`}>
      <ProductGrid products={data?.items ?? []} isLoading={isLoading} />
    </ProductSection>
  );
}
