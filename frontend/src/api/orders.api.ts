import { axiosClient, unwrap } from './axiosClient';
import type { Order, SalesStats, SellerOrderItem } from '@/types';

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  localOrderId: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const ordersApi = {
  createRazorpayOrder: () => unwrap<RazorpayOrderResponse>(axiosClient.post('/orders/razorpay')),
  verifyPayment: (payload: VerifyPaymentPayload) => unwrap<Order>(axiosClient.post('/orders/verify', payload)),
  mine: () => unwrap<Order[]>(axiosClient.get('/orders/mine')),
  sellerOrders: () => unwrap<SellerOrderItem[]>(axiosClient.get('/orders/seller')),
  allOrders: () => unwrap<Order[]>(axiosClient.get('/orders/all')),
  stats: () => unwrap<SalesStats>(axiosClient.get('/orders/stats')),
};
