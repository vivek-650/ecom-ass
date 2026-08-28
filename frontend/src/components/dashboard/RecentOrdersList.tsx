import { formatCurrency } from '@/utils/formatCurrency';
import { Badge } from '@/components/ui/Badge';
import type { Order } from '@/types';

export function RecentOrdersList({ orders }: { orders: Order[] }) {
  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  if (recent.length === 0) return <p className="text-sm text-ink-muted">No orders yet.</p>;

  return (
    <ul className="divide-y divide-ink/6">
      {recent.map((order) => (
        <li key={order.id} className="flex items-center justify-between py-2.5 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">#{order.id.slice(0, 8)}</p>
            <p className="text-xs text-ink-muted">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Badge tone="forest">{order.status}</Badge>
            <span className="price text-ink">{formatCurrency(order.total_amount)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
