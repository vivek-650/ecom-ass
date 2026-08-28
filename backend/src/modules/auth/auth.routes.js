import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as controller from './auth.controller.js';

const router = Router();

router.get('/me', requireAuth, controller.getMe);

export default router;
