import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Registration and login themselves are handled client-side by supabase-js
 * (see frontend/src/api/supabaseClient.js) — that's what gives us bcrypt-grade
 * password hashing and signed session tokens "for free" from Supabase Auth.
 * This backend only ever needs to read back the profile for a verified token.
 */
export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) throw ApiError.notFound('Profile not found');
  return data;
}
