import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';
import { ROLES } from '../../utils/constants.js';
import * as controller from './orders.controller.js';

const router = Router();

router.use(requireAuth);

// Checkout (any authenticated role can buy)
router.post('/razorpay', controller.createRazorpayOrder);
router.post('/verify', controller.verifyPayment);

// Role-scoped order views
router.get('/mine', controller.getMyOrders);
router.get('/seller', restrictTo(ROLES.SALES_PERSON, ROLES.ADMIN), controller.getSellerOrders);
router.get('/all', restrictTo(ROLES.ADMIN), controller.getAllOrders);
router.get('/stats', restrictTo(ROLES.ADMIN), controller.getSalesStats);

export default router;
