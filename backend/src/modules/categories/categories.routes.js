import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';
import { ROLES } from '../../utils/constants.js';
import * as controller from './categories.controller.js';

const router = Router();
const adminOnly = [requireAuth, restrictTo(ROLES.ADMIN)];

// Public read — the storefront's filters, nav, and the seller's product
// form all need the category list regardless of role.
router.get('/', controller.getCategories);

router.post('/', ...adminOnly, controller.createCategory);
router.put('/:id', ...adminOnly, controller.updateCategory);
router.delete('/:id', ...adminOnly, controller.deleteCategory);

export default router;
