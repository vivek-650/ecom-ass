import { axiosClient, unwrap } from './axiosClient';
import type { WishlistItem } from '@/types';

export const wishlistApi = {
  get: () => unwrap<WishlistItem[]>(axiosClient.get('/wishlist')),
  add: (productId: string) => unwrap<WishlistItem[]>(axiosClient.post('/wishlist', { productId })),
  remove: (productId: string) => unwrap<WishlistItem[]>(axiosClient.delete(`/wishlist/${productId}`)),
};
