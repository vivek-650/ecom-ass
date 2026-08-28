import { supabaseAdmin, supabaseAuth } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import { withTimeout } from '../../utils/withTimeout.js';

/**
 * Registration and login are proxied through this backend rather than
 * called directly from the browser against Supabase. Registration uses the
 * Admin API (auth.admin.createUser with email_confirm: true) — it creates
 * the account already confirmed, so there's no dependency on Supabase's
 * transactional email sending, and Admin API calls aren't subject to the
 * same public rate-limiting as the client-facing signup endpoint. Login
 * verifies the password grant server-side and hands the resulting
 * access/refresh tokens back to the frontend, which hydrates them into its
 * own Supabase client via `supabase.auth.setSession(...)`.
 */
export async function registerUser({ email, password, fullName, role }) {
  const { data, error } = await withTimeout(
    supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    }),
    12_000,
    'Account creation service is not responding'
  );
  if (error) throw ApiError.badRequest(error.message);
  return data.user;
}

export async function loginUser({ email, password }) {
  const { data, error } = await withTimeout(
    supabaseAuth.auth.signInWithPassword({ email, password }),
    12_000,
    'Sign-in service is not responding'
  );
  if (error) throw ApiError.unauthorized('Invalid email or password');
  return data;
}

export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) throw ApiError.notFound('Profile not found');
  return data;
}
