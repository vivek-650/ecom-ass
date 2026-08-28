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

  const rollbackOnError = (
    error: unknown,
    _vars: unknown,
    context?: { previousCart?: CartItem[] }
  ) => {
    if (context?.previousCart) setCart(context.previousCart);
    toast.error(error instanceof ApiRequestError ? error.message : 'Something went wrong');
  };

  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartApi.add(productId, quantity),
    onSuccess: (data) => {
      setCart(data);
      toast.success('Added to cart');
    },
    onError: rollbackOnError,
  });

  // Quantity +/- needs to feel instant (it's clicked repeatedly) — update the
  // cache immediately, fire the request in the background, and only roll
  // back if it actually fails. The server response still lands in onSuccess
  // as the source of truth (e.g. if stock changed server-side), but the
  // click itself never waits on the network.
  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_KEY);
      queryClient.setQueryData<CartItem[]>(CART_KEY, (old) =>
        (old ?? []).map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
      return { previousCart };
    },
    onSuccess: setCart,
    onError: rollbackOnError,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.remove(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_KEY);
      queryClient.setQueryData<CartItem[]>(CART_KEY, (old) => (old ?? []).filter((item) => item.id !== itemId));
      return { previousCart };
    },
    onSuccess: (data) => {
      setCart(data);
      toast.success('Removed from cart');
    },
    onError: rollbackOnError,
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
