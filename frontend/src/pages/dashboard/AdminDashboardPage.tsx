import { useState } from 'react';
import { useSalesStats, useAllOrders } from '@/hooks/useOrders';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { formatCurrency } from '@/utils/formatCurrency';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

const TABS = ['Overview', 'Products', 'Users', 'Orders'] as const;
type Tab = (typeof TABS)[number];

export function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="container-lumos py-12">
      <p className="eyebrow mb-2">Control center</p>
      <h1 className="mb-8 font-display text-4xl text-ink">Admin dashboard</h1>

      <div className="mb-10 flex gap-1 border-b border-ink/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-3 text-sm transition-colors',
              tab === t ? 'border-b-2 border-forest text-ink' : 'text-ink-muted hover:text-ink'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Products' && <AdminProductsTab />}
      {tab === 'Users' && <AdminUsersTab />}
      {tab === 'Orders' && <OrdersTab />}
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useSalesStats();
  if (isLoading) return <PageSpinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Total sales', value: formatCurrency(stats.totalSales) },
    { label: 'Total orders', value: stats.totalOrders },
    { label: 'Products listed', value: stats.totalProducts },
    { label: 'Registered users', value: stats.totalUsers },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-ink/10 p-6">
          <p className="eyebrow mb-3">{card.label}</p>
          <p className="font-display text-3xl text-ink">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders();
  if (isLoading) return <PageSpinner />;
  if (!orders || orders.length === 0) return <p className="text-sm text-ink-muted">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-ink/10 p-5">
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
  );
}
