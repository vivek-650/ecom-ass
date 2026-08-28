import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoriesApi } from '@/api/categories.api';
import { ApiRequestError } from '@/api/axiosClient';

const CATEGORIES_KEY = ['categories'];

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const onError = (error: unknown) => {
    toast.error(error instanceof ApiRequestError ? error.message : 'Something went wrong');
  };

  const create = useMutation({
    mutationFn: (name: string) => categoriesApi.create(name),
    onSuccess: () => {
      invalidate();
      toast.success('Category created');
    },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoriesApi.update(id, name),
    onSuccess: () => {
      invalidate();
      toast.success('Category renamed');
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Category deleted');
    },
    onError,
  });

  return { create, update, remove };
}
