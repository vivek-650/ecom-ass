import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes.js';
import productRoutes from '../../modules/products/products.routes.js';
import categoryRoutes from '../../modules/categories/categories.routes.js';
import cartRoutes from '../../modules/cart/cart.routes.js';
import wishlistRoutes from '../../modules/wishlist/wishlist.routes.js';
import orderRoutes from '../../modules/orders/orders.routes.js';
import userRoutes from '../../modules/users/users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

export default router;
