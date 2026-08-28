import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
