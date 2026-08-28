import { useMemo } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';

interface OrderLike {
  total_amount: number;
  created_at: string;
}

const DAYS = 7;

/** Dependency-free CSS bar chart -- no charting library needed for 7 bars. */
export function SalesTrendChart({ orders }: { orders: OrderLike[] }) {
  const days = useMemo(() => {
    const buckets = new Map<string, number>();
    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const order of orders) {
      const key = order.created_at.slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(order.total_amount));
    }
    return Array.from(buckets.entries()).map(([date, total]) => ({ date, total }));
  }, [orders]);

  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <div>
      <div className="flex h-32 items-end gap-2">
        {days.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5" title={formatCurrency(d.total)}>
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t bg-forest/80 transition-all"
                style={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 6 : 0)}%` }}
              />
            </div>
            <span className="text-[10px] text-ink-muted">
              {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
