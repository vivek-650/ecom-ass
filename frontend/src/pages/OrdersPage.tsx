import { Link } from 'react-router-dom';
import { useMyOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export function OrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) return <PageSpinner />;

  if (!orders || orders.length === 0) {
    return (
      <div className="container-lumos py-24">
        <EmptyState
          title="No orders yet"
          description="Your completed purchases will show up here."
          action={
            <Link to="/products">
              <Button className="mt-2">Start shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-lumos py-12">
      <h1 className="mb-10 font-display text-4xl text-ink">Order history</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-ink/10 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 pb-4">
              <div>
                <p className="eyebrow">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-ink-muted">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="forest">{order.status}</Badge>
                <span className="price text-lg text-ink">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-ink-muted">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="price">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
