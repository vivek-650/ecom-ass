import { Link } from 'react-router-dom';
import { AlertTriangleIcon } from '@/components/ui/Icons';
import type { Product } from '@/types';

const LOW_STOCK_THRESHOLD = 5;

export function LowStockAlert({ products, editHref }: { products: Product[]; editHref: string }) {
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).sort((a, b) => a.stock - b.stock);

  if (lowStock.length === 0) {
    return <p className="text-sm text-ink-muted">All products are adequately stocked.</p>;
  }

  return (
    <ul className="space-y-2">
      {lowStock.slice(0, 6).map((product) => (
        <li key={product.id}>
          <Link
            to={editHref}
            className="flex items-center justify-between rounded-md border border-ember/20 bg-ember/5 px-3 py-2 text-sm hover:border-ember/40"
          >
            <span className="flex items-center gap-2 text-ink">
              <AlertTriangleIcon size={14} className="shrink-0 text-ember" />
              <span className="truncate">{product.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-ember">
              {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
