import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';
import { ROLES } from '../../utils/constants.js';
import * as controller from './users.controller.js';

const router = Router();

// Admin-only: full user & role management
router.use(requireAuth, restrictTo(ROLES.ADMIN));
router.get('/', controller.getUsers);
router.patch('/:id/role', controller.updateUserRole);

export default router;
