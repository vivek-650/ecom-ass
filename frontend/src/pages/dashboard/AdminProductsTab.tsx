import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProducts, useProductMutations } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { ProductForm } from '@/components/product/ProductForm';
import { ApiRequestError } from '@/api/axiosClient';
import type { Product } from '@/types';
import type { ProductPayload } from '@/api/products.api';

export function AdminProductsTab() {
  const { data, isLoading } = useProducts({ page: 1, limit: 100 });
  const { create, update, remove } = useProductMutations();
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; product?: Product } | null>(null);

  const handleSubmit = async (payload: ProductPayload) => {
    try {
      if (modalState?.mode === 'edit' && modalState.product) {
        await update.mutateAsync({ id: modalState.product.id, payload });
        toast.success('Product updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('Product created');
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

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setModalState({ mode: 'create' })}>+ Add product</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink-muted">
              <th className="px-5 py-3 font-normal">Product</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Price</th>
              <th className="px-5 py-3 font-normal">Stock</th>
              <th className="px-5 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((product) => (
              <tr key={product.id} className="border-b border-ink/5 last:border-0">
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-paper-dim">
                    {product.image_url && <img src={product.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium text-ink">{product.name}</span>
                </td>
                <td className="px-5 py-3 text-ink-muted">{product.category}</td>
                <td className="price px-5 py-3">{formatCurrency(product.price)}</td>
                <td className="px-5 py-3">{product.stock}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    className="mr-4 text-xs uppercase tracking-widest text-forest-deep hover:underline"
                    onClick={() => setModalState({ mode: 'edit', product })}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs uppercase tracking-widest text-ember hover:underline"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={Boolean(modalState)}
        onClose={() => setModalState(null)}
        title={modalState?.mode === 'edit' ? 'Edit product' : 'Add product'}
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
