import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, type ProductPayload } from '@/api/products.api';
import type { ProductFilters } from '@/types';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
    placeholderData: (previousData) => previousData, // keep the grid painted while the next page loads
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.categories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: ['products', 'mine'],
    queryFn: productsApi.mine,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const create = useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: invalidateProductQueries,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productsApi.update(id, payload),
    onSuccess: invalidateProductQueries,
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: invalidateProductQueries,
  });

  return { create, update, remove };
}
