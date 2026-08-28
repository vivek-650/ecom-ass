import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies the Supabase access token sent as `Authorization: Bearer <token>`,
 * then loads the matching profile row (which carries the authoritative role)
 * and attaches it to req.user. Every protected route depends on this running
 * first — role checks in role.middleware.js trust req.user.role completely.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) throw ApiError.unauthorized('Missing or malformed Authorization header');

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) throw ApiError.unauthorized('Invalid or expired session');

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw ApiError.unauthorized('User profile not found');

  req.user = profile;
  next();
});
