import { useMemo, useState, type FormEvent } from 'react';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { EditIcon, TrashIcon, CheckIcon, XIcon, PlusIcon } from '@/components/ui/Icons';

export function AdminCategoriesTab() {
  const { data: categories, isLoading } = useCategories();
  const { data: productData } = useProducts({ page: 1, limit: 100 });
  const { create, update, remove } = useCategoryMutations();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of productData?.items ?? []) {
      map.set(product.category_id, (map.get(product.category_id) ?? 0) + 1);
    }
    return map;
  }, [productData]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    create.mutate(newName.trim(), { onSuccess: () => setNewName('') });
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) return;
    update.mutate({ id, name: editValue.trim() }, { onSuccess: () => setEditingId(null) });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this category?')) return;
    remove.mutate(id);
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-4 flex max-w-sm items-end gap-2">
        <Input
          label="New category"
          placeholder="e.g. Kitchen & Dining"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" size="md" isLoading={create.isPending} disabled={!newName.trim()}>
          <PlusIcon size={14} /> Add
        </Button>
      </form>

      <div className="overflow-hidden rounded-md border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink-muted">
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const count = counts.get(category.id) ?? 0;
              const isEditing = editingId === category.id;

              return (
                <tr key={category.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(category.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="rounded border border-forest/40 px-2 py-1 text-sm focus:outline-none"
                      />
                    ) : (
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <Icon size={16} className="text-ink-muted" />
                        {category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{count}</td>
                  <td className="px-5 py-3 text-right">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(category.id)}
                          className="mr-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-deep hover:underline"
                        >
                          <CheckIcon size={13} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:underline"
                        >
                          <XIcon size={13} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(category.id, category.name)}
                          className="mr-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-deep hover:underline"
                        >
                          <EditIcon size={13} /> Rename
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={count > 0}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                          title={count > 0 ? 'Reassign or delete products in this category first' : undefined}
                        >
                          <TrashIcon size={13} /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {categories?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-ink-muted">
                  No categories yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
