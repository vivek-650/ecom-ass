import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import type { Product } from '@/types';
import type { ProductPayload } from '@/api/products.api';

export function ProductForm({
  initial,
  onSubmit,
  isSubmitting,
}: {
  initial?: Product;
  onSubmit: (payload: ProductPayload) => void;
  isSubmitting: boolean;
}) {
  const { data: categories = [] } = useCategories();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.image_url ?? null);

  const handleImageChange = (file: File | null) => {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : initial?.image_url ?? null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      price: Number(price),
      categoryId,
      stock: Number(stock),
      image,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink/5">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center font-mono text-[10px] text-ink-muted">No image</div>
          )}
        </div>
        <label className="flex-1">
          <span className="eyebrow">Product image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="mt-1.5 block w-full text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-paper"
          />
        </label>
      </div>

      <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input label="Price (₹)" type="number" min={0} step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Stock" type="number" min={0} required value={stock} onChange={(e) => setStock(e.target.value)} />
        <Select label="Category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="" disabled>
            Select…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      {categories.length === 0 && (
        <p className="text-xs text-ink-muted">
          No categories exist yet — ask an Admin to add one from the Admin dashboard's Categories tab.
        </p>
      )}

      <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!categoryId}>
        {initial ? 'Save changes' : 'List product'}
      </Button>
    </form>
  );
}
