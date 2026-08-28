const TOKEN_KEY = 'lumos_auth_token';

/**
 * Plain localStorage wrapper for our own JWT (issued by POST /auth/login).
 * Kept as a standalone module — rather than only living in AuthContext's
 * React state — so axiosClient's request interceptor can read it
 * synchronously outside of any component tree.
 */
export const authToken = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};
