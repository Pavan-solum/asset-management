import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/storeHooks';
import { isApiEnabled } from '../services/api/config';
import { getHomeRouteForRole, isEmployeeRole } from '../utils/routing';
import { PageLoader } from './Loader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const bootstrapReady = useAppSelector((s) => s.ui.bootstrapReady);
  const role = useAppSelector((s) => s.auth.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isApiEnabled() && !bootstrapReady && !isEmployeeRole(role)) {
    return <PageLoader message="Loading your workspace…" />;
  }
  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role);
  if (isAuthenticated) return <Navigate to={getHomeRouteForRole(role)} replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (isEmployeeRole(role)) return <Navigate to="/portal" replace />;
  return <>{children}</>;
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (!isEmployeeRole(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
