import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Only gates on token presence, which is read synchronously from
 * localStorage — there's no async session bootstrap to wait on with our
 * own JWT (unlike Supabase's old getSession() promise), so no spinner here.
 * Pages needing the actual profile (role, name) wait on that themselves.
 */
export function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
