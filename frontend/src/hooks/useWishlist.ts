import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { wishlistApi } from '@/api/wishlist.api';
import { ApiRequestError } from '@/api/axiosClient';
import { useAuth } from '@/context/AuthContext';
import type { WishlistItem } from '@/types';

const WISHLIST_KEY = ['wishlist'];

export function useWishlist() {
  const { token } = useAuth();
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: wishlistApi.get,
    enabled: Boolean(token),
    initialData: [] as WishlistItem[],
  });
}

export function useIsWishlisted(productId: string) {
  const { data: items } = useWishlist();
  return items.some((item) => item.product.id === productId);
}

export function useWishlistMutations() {
  const queryClient = useQueryClient();
  const setWishlist = (data: WishlistItem[]) => queryClient.setQueryData(WISHLIST_KEY, data);

  // Same reasoning as cart: a heart icon double-tapped fast enough fires two
  // requests (add then remove, or vice versa) that can resolve out of order.
  // This guard makes sure only the response to the most recently *sent*
  // mutation ever gets written to the cache.
  const latestOpId = useRef(0);
  const guardedSetWishlist = (opId: number, data: WishlistItem[]) => {
    if (opId === latestOpId.current) setWishlist(data);
  };

  const rollbackOnError = (
    error: unknown,
    _vars: unknown,
    context?: { previousWishlist?: WishlistItem[] }
  ) => {
    if (context?.previousWishlist) setWishlist(context.previousWishlist);
    toast.error(error instanceof ApiRequestError ? error.message : 'Something went wrong');
  };

  const addItem = useMutation({
    mutationFn: (productId: string) => {
      const opId = ++latestOpId.current;
      return wishlistApi.add(productId).then((data) => ({ opId, data }));
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      return { previousWishlist: queryClient.getQueryData<WishlistItem[]>(WISHLIST_KEY) };
    },
    onSuccess: ({ opId, data }) => {
      guardedSetWishlist(opId, data);
      toast.success('Saved to wishlist');
    },
    onError: rollbackOnError,
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => {
      const opId = ++latestOpId.current;
      return wishlistApi.remove(productId).then((data) => ({ opId, data }));
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_KEY);
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_KEY, (old) =>
        (old ?? []).filter((item) => item.product.id !== productId)
      );
      return { previousWishlist };
    },
    onSuccess: ({ opId, data }) => {
      guardedSetWishlist(opId, data);
      toast.success('Removed from wishlist');
    },
    onError: rollbackOnError,
  });

  return { addItem, removeItem };
}
