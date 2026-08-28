import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as controller from './cart.controller.js';

const router = Router();

// Cart is personal — any authenticated role may use it, no restrictTo needed.
router.use(requireAuth);
router.get('/', controller.getCart);
router.post('/', controller.addToCart);
router.patch('/:itemId', controller.updateCartItem);
router.delete('/:itemId', controller.removeCartItem);

export default router;
