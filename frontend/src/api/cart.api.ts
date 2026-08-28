import { axiosClient, unwrap } from './axiosClient';
import type { CartItem } from '@/types';

export const cartApi = {
  get: () => unwrap<CartItem[]>(axiosClient.get('/cart')),
  add: (productId: string, quantity = 1) =>
    unwrap<CartItem[]>(axiosClient.post('/cart', { productId, quantity })),
  updateQuantity: (itemId: string, quantity: number) =>
    unwrap<CartItem[]>(axiosClient.patch(`/cart/${itemId}`, { quantity })),
  remove: (itemId: string) => unwrap<CartItem[]>(axiosClient.delete(`/cart/${itemId}`)),
};
