import { axiosClient, unwrap } from './axiosClient';
import { supabase } from './supabaseClient';
import type { Profile, Role } from '@/types';

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  role: Extract<Role, 'user' | 'sales_person'>;
}

/**
 * Registration and login are delegated to Supabase Auth (bcrypt-grade hashing
 * and signed sessions come for free); the backend is only consulted afterwards
 * to read back the role-bearing profile row.
 */
export const authApi = {
  signUp: async ({ email, password, fullName, role }: SignUpPayload) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  me: () => unwrap<Profile>(axiosClient.get('/auth/me')),
};
