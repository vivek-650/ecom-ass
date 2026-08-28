import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';
import { uploadImage } from '../../middleware/upload.middleware.js';
import { ROLES } from '../../utils/constants.js';
import * as controller from './products.controller.js';

const router = Router();

const canManageProducts = restrictTo(ROLES.ADMIN, ROLES.SALES_PERSON);

// Public catalogue
router.get('/', controller.getProducts);
router.get('/categories', controller.getCategories);

// Seller's own listings — must come before /:id so "mine" isn't parsed as an id
router.get('/mine', requireAuth, canManageProducts, controller.getMyProducts);

router.get('/:id', controller.getProduct);

// Protected mutations — ownership enforced inside the service layer
router.post('/', requireAuth, canManageProducts, uploadImage, controller.createProduct);
router.put('/:id', requireAuth, canManageProducts, uploadImage, controller.updateProduct);
router.delete('/:id', requireAuth, canManageProducts, controller.deleteProduct);

export default router;
