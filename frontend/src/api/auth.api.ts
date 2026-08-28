import { axiosClient, unwrap } from './axiosClient';
import { supabase } from './supabaseClient';
import type { Profile, Role } from '@/types';

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  role: Extract<Role, 'user' | 'sales_person'>;
}

interface LoginResponse {
  user: { id: string; email: string };
  session: { access_token: string; refresh_token: string; expires_at: number };
}

/**
 * Registration and login are proxied through our own Express backend
 * (`/auth/register`, `/auth/login`) rather than calling Supabase directly
 * from the browser — see backend/src/modules/auth/auth.service.js for why.
 * Login hands back raw Supabase tokens, which we hydrate into this tab's
 * Supabase client via `setSession` so the rest of the app (axiosClient's
 * interceptor, AuthContext) keeps working exactly as if supabase-js had
 * signed in directly.
 */
export const authApi = {
  signUp: (payload: SignUpPayload) => unwrap<{ id: string; email: string }>(axiosClient.post('/auth/register', payload)),

  signIn: async (email: string, password: string) => {
    const { session } = await unwrap<LoginResponse>(axiosClient.post('/auth/login', { email, password }));
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  me: () => unwrap<Profile>(axiosClient.get('/auth/me')),
};
