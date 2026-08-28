import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CartPage } from '@/pages/CartPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SalesDashboardPage } from '@/pages/dashboard/SalesDashboardPage';
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="orders" element={<OrdersPage />} />

          <Route element={<RoleRoute allow={['sales_person', 'admin']} />}>
            <Route path="dashboard/products" element={<SalesDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="dashboard/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
