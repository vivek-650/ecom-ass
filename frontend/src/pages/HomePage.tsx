import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';

const PROMOS = [
  { title: 'New arrivals', sub: 'Freshly listed this week', tone: 'bg-gold text-ink', href: '/products' },
  { title: 'Sell on Lumos', sub: 'List your first product', tone: 'bg-ink text-white', href: '/register' },
  { title: 'Top picks', sub: 'Loved by shoppers', tone: 'bg-gold-pale text-ink border border-gold-deep/30', href: '/products' },
];

export function HomePage() {
  const { data: newArrivals, isLoading: loadingNew } = useProducts({ page: 1, limit: 10 });

  return (
    <div className="bg-paper-dim pb-14">
      <section className="container-lumos pt-4">
        <div className="scroll-rail">
          {PROMOS.map((promo) => (
            <Link
              key={promo.title}
              to={promo.href}
              className={`flex w-64 shrink-0 flex-col justify-between rounded-md p-5 sm:w-80 ${promo.tone}`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{promo.sub}</p>
                <p className="mt-1 text-2xl font-extrabold">{promo.title}</p>
              </div>
              <span className="mt-6 text-sm font-semibold underline underline-offset-4">Explore now →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-lumos mt-8">
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
