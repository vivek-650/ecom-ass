import { useMemo, useState } from 'react';
import { useSellerOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { SearchIcon } from '@/components/ui/Icons';

export function SalesOrdersTab() {
  const { data: items, isLoading } = useSellerOrders();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.product_name.toLowerCase().includes(q) || item.order.id.toLowerCase().includes(q));
  }, [items, search]);

  if (isLoading) return <PageSpinner />;

  if (!items || items.length === 0) {
    return <EmptyState title="No orders yet" description="Orders containing your products will appear here." />;
  }

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          placeholder="Search by product or order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink-muted">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Line total</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-3 text-xs text-ink-muted">#{item.order.id.slice(0, 8)}</td>
                <td className="px-5 py-3 font-medium text-ink">{item.product_name}</td>
                <td className="px-5 py-3">{item.quantity}</td>
                <td className="price px-5 py-3">{formatCurrency(item.price_at_purchase * item.quantity)}</td>
                <td className="px-5 py-3 text-ink-muted">{new Date(item.order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-ink-muted">
                  No matching orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
