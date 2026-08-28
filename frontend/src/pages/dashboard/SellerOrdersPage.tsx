import { useSellerOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';

export function SellerOrdersPage() {
  const { data: items, isLoading } = useSellerOrders();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="container-lumos py-12">
      <p className="eyebrow mb-2">Seller dashboard</p>
      <h1 className="mb-10 font-display text-4xl text-ink">Orders with your products</h1>

      {!items || items.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders containing your products will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink-muted">
                <th className="px-5 py-3 font-normal">Order</th>
                <th className="px-5 py-3 font-normal">Product</th>
                <th className="px-5 py-3 font-normal">Qty</th>
                <th className="px-5 py-3 font-normal">Line total</th>
                <th className="px-5 py-3 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-ink-muted">#{item.order.id.slice(0, 8)}</td>
                  <td className="px-5 py-3 font-medium text-ink">{item.product_name}</td>
                  <td className="px-5 py-3">{item.quantity}</td>
                  <td className="price px-5 py-3">{formatCurrency(item.price_at_purchase * item.quantity)}</td>
                  <td className="px-5 py-3 text-ink-muted">{new Date(item.order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
