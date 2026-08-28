import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role client — full DB access, bypasses Row Level Security.
 * All business logic and role checks happen in Express middleware/services,
 * so this is the only Supabase client the backend ever uses.
 * Never expose this key to the frontend.
 */
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
