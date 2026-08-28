import { useMemo } from 'react';
import { useMyProducts } from '@/hooks/useProducts';
import { useSellerOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { PageSpinner } from '@/components/ui/Spinner';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';

export function SalesOverviewTab() {
  const { data: products, isLoading: productsLoading } = useMyProducts();
  const { data: orderItems, isLoading: ordersLoading } = useSellerOrders();

  if (productsLoading || ordersLoading) return <PageSpinner />;

  const items = orderItems ?? [];
  const totalRevenue = items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0);
  const totalOrders = new Set(items.map((item) => item.order.id)).size;

  const cards = [
    { label: 'Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Orders', value: totalOrders },
    { label: 'Products listed', value: products?.length ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
          <SalesTrendChart
            orders={items.map((item) => ({
              total_amount: item.price_at_purchase * item.quantity,
              created_at: item.order.created_at,
            }))}
          />
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-ink">Low stock</h3>
          <LowStockAlert products={products ?? []} editHref="/dashboard/products" />
        </div>
      </div>
    </div>
  );
}
