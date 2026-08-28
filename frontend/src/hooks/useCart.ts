import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cartApi } from '@/api/cart.api';
import { ApiRequestError } from '@/api/axiosClient';
import { useAuth } from '@/context/AuthContext';
import type { CartItem } from '@/types';

const CART_KEY = ['cart'];

export function useCart() {
  const { token } = useAuth();
  return useQuery({
    queryKey: CART_KEY,
    queryFn: cartApi.get,
    enabled: Boolean(token),
    initialData: [] as CartItem[],
  });
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const setCart = (data: CartItem[]) => queryClient.setQueryData(CART_KEY, data);
  const onError = (error: unknown) => {
    toast.error(error instanceof ApiRequestError ? error.message : 'Something went wrong');
  };

  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartApi.add(productId, quantity),
    onSuccess: (data) => {
      setCart(data);
      toast.success('Added to cart');
    },
    onError,
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess: setCart,
    onError,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.remove(itemId),
    onSuccess: (data) => {
      setCart(data);
      toast.success('Removed from cart');
    },
    onError,
  });

  return { addItem, updateQuantity, removeItem };
}

export function useCartCount() {
  const { data: items } = useCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function useCartTotal() {
  const { data: items } = useCart();
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
