import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMyProducts, useProductMutations } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ProductForm } from '@/components/product/ProductForm';
import { ApiRequestError } from '@/api/axiosClient';
import { EditIcon, TrashIcon, SearchIcon, AlertTriangleIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import type { Product } from '@/types';
import type { ProductPayload } from '@/api/products.api';

const LOW_STOCK_THRESHOLD = 5;

export function SalesProductsTab() {
  const { data: products, isLoading } = useMyProducts();
  const { create, update, remove } = useProductMutations();
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; product?: Product } | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const items = products ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, search]);

  const handleSubmit = async (payload: ProductPayload) => {
    try {
      if (modalState?.mode === 'edit' && modalState.product) {
        await update.mutateAsync({ id: modalState.product.id, payload });
        toast.success('Product updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('Product listed');
      }
      setModalState(null);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Something went wrong');
    }
  };

  if (isLoading) return <PageSpinner />;

  if (!products || products.length === 0) {
    return (
      <>
        <EmptyState
          title="You haven't listed anything yet"
          description="Add your first product to start selling on Lumos."
          action={
            <Button className="mt-2" onClick={() => setModalState({ mode: 'create' })}>
              + Add product
            </Button>
          }
        />
        <Modal isOpen={Boolean(modalState)} onClose={() => setModalState(null)} title="List a new product">
          <ProductForm onSubmit={handleSubmit} isSubmitting={create.isPending} />
        </Modal>
      </>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            placeholder="Search your products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setModalState({ mode: 'create' })}>+ Add product</Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink-muted">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-ink/5 last:border-0">
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="h-10 w-10 overflow-hidden rounded bg-ink/5">
                    {product.image_url && (
                      <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-ink">{product.name}</span>
                </td>
                <td className="px-5 py-3 text-ink-muted">{product.category}</td>
                <td className="price px-5 py-3">{formatCurrency(product.price)}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1',
                      product.stock <= LOW_STOCK_THRESHOLD ? 'font-semibold text-ember' : 'text-ink'
                    )}
                  >
                    {product.stock <= LOW_STOCK_THRESHOLD && <AlertTriangleIcon size={13} />}
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    className="mr-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-deep hover:underline"
                    onClick={() => setModalState({ mode: 'edit', product })}
                  >
                    <EditIcon size={13} /> Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline"
                    onClick={() => handleDelete(product.id)}
                  >
                    <TrashIcon size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-ink-muted">
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={Boolean(modalState)}
        onClose={() => setModalState(null)}
        title={modalState?.mode === 'edit' ? 'Edit product' : 'List a new product'}
      >
        <ProductForm
          initial={modalState?.product}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
