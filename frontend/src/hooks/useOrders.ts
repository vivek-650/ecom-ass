import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';

export function useMyOrders() {
  return useQuery({ queryKey: ['orders', 'mine'], queryFn: ordersApi.mine });
}

export function useSellerOrders() {
  return useQuery({ queryKey: ['orders', 'seller'], queryFn: ordersApi.sellerOrders });
}

export function useAllOrders() {
  return useQuery({ queryKey: ['orders', 'all'], queryFn: ordersApi.allOrders });
}

export function useSalesStats() {
  return useQuery({ queryKey: ['orders', 'stats'], queryFn: ordersApi.stats });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  const createRazorpayOrder = useMutation({ mutationFn: ordersApi.createRazorpayOrder });

  const verifyPayment = useMutation({
    mutationFn: ordersApi.verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return { createRazorpayOrder, verifyPayment };
}
