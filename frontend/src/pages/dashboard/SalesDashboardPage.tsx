import { useState } from 'react';
import { SalesOverviewTab } from './SalesOverviewTab';
import { SalesProductsTab } from './SalesProductsTab';
import { SalesOrdersTab } from './SalesOrdersTab';
import { ChartIcon, GridIcon, BagIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';

const TABS = [
  { key: 'Overview', icon: ChartIcon },
  { key: 'Products', icon: GridIcon },
  { key: 'Orders', icon: BagIcon },
] as const;
type Tab = (typeof TABS)[number]['key'];

export function SalesDashboardPage() {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="container-lumos py-8">
      <p className="eyebrow mb-2">Seller dashboard</p>
      <h1 className="mb-6 text-2xl font-bold text-ink">Your store</h1>

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

      {tab === 'Overview' && <SalesOverviewTab />}
      {tab === 'Products' && <SalesProductsTab />}
      {tab === 'Orders' && <SalesOrdersTab />}
    </div>
  );
}
