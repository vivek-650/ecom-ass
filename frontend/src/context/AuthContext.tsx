import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type SignUpPayload } from '@/api/auth.api';
import { authToken } from '@/utils/authToken';
import type { Profile } from '@/types';

interface AuthContextValue {
  token: string | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => authToken.get());
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', token],
    queryFn: authApi.me,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const signUp = async (payload: SignUpPayload) => {
    await authApi.signUp(payload);
  };

  const signIn = async (email: string, password: string) => {
    const newToken = await authApi.signIn(email, password);
    authToken.set(newToken);
    // A different account may be signing in — drop every cached query so
    // one user never sees a flash of another user's cart/orders/etc.
    queryClient.clear();
    setToken(newToken);
  };

  const signOut = () => {
    authToken.clear();
    queryClient.clear();
    setToken(null);
  };

  const isLoading = Boolean(token) && profileLoading;

  return (
    <AuthContext.Provider value={{ token, profile: profile ?? null, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
