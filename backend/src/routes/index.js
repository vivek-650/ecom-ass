import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

// Health checks are conventionally left unversioned — infra (Render, uptime
// monitors, load balancer probes) shouldn't need to know the API version.
router.get('/health', (_req, res) => res.json({ success: true, message: 'Lumos Market API is running' }));

// A future breaking change ships as routes/v2/index.js mounted alongside
// this, so existing clients on /api/v1 keep working unmodified.
router.use('/v1', v1Routes);

export default router;
