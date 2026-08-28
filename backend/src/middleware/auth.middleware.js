import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies our own JWT (issued at login — see modules/auth/auth.service.js),
 * then loads the matching profile row (the authoritative source of role)
 * and attaches it to req.user. Every protected route depends on this running
 * first — role checks in role.middleware.js trust req.user.role completely.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) throw ApiError.unauthorized('Missing or malformed Authorization header');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', payload.sub)
    .single();

  if (error || !profile) throw ApiError.unauthorized('User profile not found');

  req.user = profile;
  next();
});
