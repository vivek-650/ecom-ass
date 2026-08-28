import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Role } from '@/types';

/**
 * Frontend-side gate so the wrong role never even sees the page — the actual
 * security boundary is the Express `restrictTo` middleware, which rejects the
 * same request server-side regardless of what this component decides.
 */
export function RoleRoute({ allow }: { allow: Role[] }) {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!profile || !allow.includes(profile.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
