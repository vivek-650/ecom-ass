import { axiosClient, unwrap } from './axiosClient';
import type { Profile, Role } from '@/types';

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  role: Extract<Role, 'user' | 'sales_person'>;
}

interface LoginResponse {
  token: string;
  user: { id: string; email: string };
}

/**
 * Talks only to our own Express backend — there is no Supabase Auth
 * involved anywhere in this app. Registration/login hash & verify passwords
 * server-side and issue our own JWT (see backend/src/modules/auth).
 */
export const authApi = {
  signUp: (payload: SignUpPayload) => unwrap<Profile>(axiosClient.post('/auth/register', payload)),

  /** Returns the JWT on success; AuthContext is responsible for storing it. */
  signIn: async (email: string, password: string): Promise<string> => {
    const { token } = await unwrap<LoginResponse>(axiosClient.post('/auth/login', { email, password }));
    return token;
  },

  me: () => unwrap<Profile>(axiosClient.get('/auth/me')),
};
