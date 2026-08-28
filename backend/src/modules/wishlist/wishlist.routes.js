import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as controller from './wishlist.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', controller.getWishlist);
router.post('/', controller.addToWishlist);
router.delete('/:productId', controller.removeFromWishlist);

export default router;
