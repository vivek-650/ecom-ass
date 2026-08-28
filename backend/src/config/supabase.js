import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role client — full DB access, bypasses Row Level Security, and can
 * call the Admin Auth API (auth.admin.createUser). Used for every table
 * query in the app, plus registration. Never expose this key to the frontend.
 */
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Anon-key client used for exactly one thing: verifying a login password
 * grant (auth.signInWithPassword). Kept separate from supabaseAdmin on
 * purpose — least privilege, so a bug in the login flow can't reach for
 * service-role-only operations. Registration goes through supabaseAdmin
 * instead (see auth.service.js) since creating a user needs the Admin API.
 */
export const supabaseAuth = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
