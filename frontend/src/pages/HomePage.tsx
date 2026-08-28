import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';

const PROMOS = [
  { title: 'New arrivals', sub: 'Freshly listed this week', href: '/products' },
  { title: 'Sell on Lumos', sub: 'List your first product', href: '/register' },
  { title: 'Top picks', sub: 'Loved by shoppers', href: '/products' },
];

export function HomePage() {
  const { data: newArrivals, isLoading: loadingNew } = useProducts({ page: 1, limit: 10 });

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

      <section className="container-lumos mt-6">
        <div className="rounded-md border border-ink/10 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-bold text-ink">New arrivals</h2>
            <Link to="/products" className="text-sm font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>
          <ProductGrid products={newArrivals?.items ?? []} isLoading={loadingNew} />
        </div>
      </section>
    </div>
  );
}
