import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { wishlistApi } from '@/api/wishlist.api';
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

  const addItem = useMutation({
    mutationFn: (productId: string) => wishlistApi.add(productId),
    onSuccess: (data) => {
      setWishlist(data);
      toast.success('Saved to wishlist');
    },
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: (data) => {
      setWishlist(data);
      toast.success('Removed from wishlist');
    },
  });

  return { addItem, removeItem };
}
