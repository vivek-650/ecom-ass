import { axiosClient, unwrap } from './axiosClient';
import type { Category } from '@/types';

export const categoriesApi = {
  list: () => unwrap<Category[]>(axiosClient.get('/categories')),
  create: (name: string) => unwrap<Category>(axiosClient.post('/categories', { name })),
  update: (id: string, name: string) => unwrap<Category>(axiosClient.put(`/categories/${id}`, { name })),
  remove: (id: string) => unwrap<null>(axiosClient.delete(`/categories/${id}`)),
};
