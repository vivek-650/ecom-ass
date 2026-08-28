import { axiosClient, unwrap } from './axiosClient';
import type { Product, ProductFilters, ProductListResult } from '@/types';

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  stock: number;
  image?: File | null;
}

function toFormData(payload: Partial<ProductPayload>): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value instanceof File ? value : String(value));
  });
  return formData;
}

export const productsApi = {
  list: (filters: ProductFilters) =>
    unwrap<ProductListResult>(axiosClient.get('/products', { params: filters })),

  getById: (id: string) => unwrap<Product>(axiosClient.get(`/products/${id}`)),

  mine: () => unwrap<Product[]>(axiosClient.get('/products/mine')),

  create: (payload: ProductPayload) =>
    unwrap<Product>(
      axiosClient.post('/products', toFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),

  update: (id: string, payload: Partial<ProductPayload>) =>
    unwrap<Product>(
      axiosClient.put(`/products/${id}`, toFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),

  remove: (id: string) => unwrap<null>(axiosClient.delete(`/products/${id}`)),
};
