import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { cartApi } from '@/api/cart.api';
import { ApiRequestError } from '@/api/axiosClient';
import { useAuth } from '@/context/AuthContext';
import type { CartItem } from '@/types';

const CART_KEY = ['cart'];
const QUANTITY_DEBOUNCE_MS = 400;

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

  // Every cart mutation (add/update/remove) writes the full cart back on
  // success. Fire several in a row -- rapid clicks, or one item updating
  // while another is being removed -- and their responses can land out of
  // order over the network; whichever resolves LAST would normally win,
  // even if it was the first one sent. This counter makes every onSuccess
  // check "am I still the most recently *sent* mutation?" before writing
  // the cache, so a late, stale response can never clobber a newer one.
  const latestOpId = useRef(0);
  const guardedSetCart = (opId: number, data: CartItem[]) => {
    if (opId === latestOpId.current) setCart(data);
  };

  const rollbackOnError = (
    error: unknown,
    _vars: unknown,
    context?: { previousCart?: CartItem[] }
  ) => {
    if (context?.previousCart) setCart(context.previousCart);
    toast.error(error instanceof ApiRequestError ? error.message : 'Something went wrong');
  };

  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) => {
      const opId = ++latestOpId.current;
      return cartApi.add(productId, quantity).then((data) => ({ opId, data }));
    },
    onSuccess: ({ opId, data }) => {
      guardedSetCart(opId, data);
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
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const opId = ++latestOpId.current;
      return cartApi.updateQuantity(itemId, quantity).then((data) => ({ opId, data }));
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_KEY);
      queryClient.setQueryData<CartItem[]>(CART_KEY, (old) =>
        (old ?? []).map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
      return { previousCart };
    },
    onSuccess: ({ opId, data }) => guardedSetCart(opId, data),
    onError: rollbackOnError,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => {
      const opId = ++latestOpId.current;
      return cartApi.remove(itemId).then((data) => ({ opId, data }));
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_KEY);
      queryClient.setQueryData<CartItem[]>(CART_KEY, (old) => (old ?? []).filter((item) => item.id !== itemId));
      return { previousCart };
    },
    onSuccess: ({ opId, data }) => {
      guardedSetCart(opId, data);
      toast.success('Removed from cart');
    },
    onError: rollbackOnError,
  });

  // Per-item debounced network sync for the quantity stepper: the cache
  // updates instantly on every single click (so it still feels immediate),
  // but clicking +5 times in a row sends ONE request 400ms after the last
  // click settles, not five. That also makes the race above moot for this
  // path specifically -- there's only ever one in-flight request per item.
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const setQuantity = (itemId: string, quantity: number) => {
    queryClient.setQueryData<CartItem[]>(CART_KEY, (old) =>
      (old ?? []).map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );

    const timers = debounceTimers.current;
    const existing = timers.get(itemId);
    if (existing) clearTimeout(existing);
    timers.set(
      itemId,
      setTimeout(() => {
        timers.delete(itemId);
        updateQuantity.mutate({ itemId, quantity });
      }, QUANTITY_DEBOUNCE_MS)
    );
  };

  return { addItem, updateQuantity, removeItem, setQuantity };
}

export function useCartCount() {
  const { data: items } = useCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function useCartTotal() {
  const { data: items } = useCart();
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
