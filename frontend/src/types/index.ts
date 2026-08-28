export type Role = 'admin' | 'sales_person' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  category_id: string;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  created_at: string;
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock' | 'category' | 'owner_id'>;
}

export interface WishlistItem {
  id: string;
  created_at: string;
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock' | 'category'>;
}

export type OrderStatus = 'created' | 'paid' | 'failed';

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  seller_id: string;
}

export interface Order {
  id: string;
  total_amount: number;
  status: OrderStatus;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export interface SellerOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  order: { id: string; status: OrderStatus; created_at: string; user_id: string };
}

export interface SalesStats {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalUsers: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}
