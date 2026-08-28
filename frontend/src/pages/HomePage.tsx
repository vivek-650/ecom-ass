import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';

export function HomePage() {
  const { data, isLoading } = useProducts({ page: 1, limit: 8 });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="container-lumos relative flex flex-col items-center py-24 text-center sm:py-32">
          <p className="eyebrow mb-5">Considered goods, quietly sourced</p>
          <h1 className="max-w-3xl font-display text-5xl font-light leading-[1.08] text-ink sm:text-7xl">
            Light on the things<br className="hidden sm:block" /> worth <em className="italic text-gold-deep">keeping</em>.
          </h1>
          <p className="mt-6 max-w-lg text-base text-ink-muted">
            A small marketplace of well-made objects, listed by people who actually use them.
          </p>
          <Link
            to="/products"
            className="mt-9 rounded-full bg-ink px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5"
          >
            Enter the shop
          </Link>
        </div>
        <div className="hairline" />
      </section>

      <section className="container-lumos py-16 sm:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Recently listed</p>
            <h2 className="font-display text-3xl text-ink">New arrivals</h2>
          </div>
          <Link to="/products" className="hidden text-sm text-gold-deep hover:underline sm:block">
            View all →
          </Link>
        </div>
        <ProductGrid products={data?.items ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
}
