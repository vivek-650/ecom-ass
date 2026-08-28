import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import productRoutes from '../modules/products/products.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js';
import orderRoutes from '../modules/orders/orders.routes.js';
import userRoutes from '../modules/users/users.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'Lumos Market API is running' }));

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

export default router;
