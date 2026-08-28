import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role client — full DB access, bypasses Row Level Security.
 * Supabase here is just Postgres-over-REST: authentication is our own
 * (see modules/auth), not Supabase Auth, so this is the only client the
 * backend needs. Never expose this key to the frontend.
 */
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
