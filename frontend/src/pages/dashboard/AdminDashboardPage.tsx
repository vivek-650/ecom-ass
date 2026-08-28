import { useMemo, useState } from 'react';
import { useSalesStats, useAllOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminUsersTab } from './AdminUsersTab';
import { formatCurrency } from '@/utils/formatCurrency';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { RecentOrdersList } from '@/components/dashboard/RecentOrdersList';
import { ChartIcon, GridIcon, TagIcon, UsersIcon, BagIcon, SearchIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';

const TABS = [
  { key: 'Overview', icon: ChartIcon },
  { key: 'Products', icon: GridIcon },
  { key: 'Categories', icon: TagIcon },
  { key: 'Users', icon: UsersIcon },
  { key: 'Orders', icon: BagIcon },
] as const;
type Tab = (typeof TABS)[number]['key'];

export function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="container-lumos py-8">
      <p className="eyebrow mb-2">Control center</p>
      <h1 className="mb-6 text-2xl font-bold text-ink">Admin dashboard</h1>

      <div className="scroll-rail mb-8 gap-0 border-b border-ink/10">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4',
              tab === key ? 'border-b-2 border-forest text-ink' : 'text-ink-muted hover:text-ink'
            )}
          >
            <Icon size={15} />
            {key}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Products' && <AdminProductsTab />}
      {tab === 'Categories' && <AdminCategoriesTab />}
      {tab === 'Users' && <AdminUsersTab />}
      {tab === 'Orders' && <OrdersTab />}
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading: statsLoading } = useSalesStats();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: productData, isLoading: productsLoading } = useProducts({ page: 1, limit: 100 });

  if (statsLoading || ordersLoading || productsLoading) return <PageSpinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Total sales', value: formatCurrency(stats.totalSales) },
    { label: 'Total orders', value: stats.totalOrders },
    { label: 'Products listed', value: stats.totalProducts },
    { label: 'Registered users', value: stats.totalUsers },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="min-w-0 rounded-md border border-ink/10 bg-white p-4 sm:p-5">
            <p className="eyebrow mb-2 truncate">{card.label}</p>
            <p className="truncate text-xl font-bold text-ink sm:text-2xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-ink/10 bg-white p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-ink">Sales, last 7 days</h3>
          <SalesTrendChart orders={orders ?? []} />
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-ink">Low stock</h3>
          <LowStockAlert products={productData?.items ?? []} editHref="/dashboard/admin" />
        </div>
      </div>

      <div className="rounded-md border border-ink/10 bg-white p-5">
        <h3 className="mb-2 text-sm font-bold text-ink">Recent orders</h3>
        <RecentOrdersList orders={orders ?? []} />
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.order_items.some((item) => item.product_name.toLowerCase().includes(q))
    );
  }, [orders, search]);

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          placeholder="Search by order ID or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">No matching orders.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-md border border-ink/10 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">Order #{order.id.slice(0, 8)}</p>
                <div className="flex items-center gap-3">
                  <Badge tone="forest">{order.status}</Badge>
                  <span className="price text-sm text-ink">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-ink-muted">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.product_name} × {item.quantity} — {formatCurrency(item.price_at_purchase * item.quantity)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
