import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import { RetryState } from '@/components/ui/RetryState';
import type { Role } from '@/types';

/**
 * Frontend-side gate so the wrong role never even sees the page — the actual
 * security boundary is the Express `restrictTo` middleware, which rejects the
 * same request server-side regardless of what this component decides.
 *
 * Importantly, a failed profile fetch (slow network, DB hiccup) is NOT the
 * same as "wrong role" — treating it that way silently bounces the user back
 * to "/" every time they retry a slow connection, which looks like the page
 * refusing to load rather than what's actually happening.
 */
export function RoleRoute({ allow }: { allow: Role[] }) {
  const { profile, isLoading, hasError, refetchProfile } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (hasError) {
    return (
      <RetryState
        message="We couldn't load your account details — this is usually a temporary connection issue, not a permissions problem."
        onRetry={refetchProfile}
      />
    );
  }
  if (!profile || !allow.includes(profile.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
