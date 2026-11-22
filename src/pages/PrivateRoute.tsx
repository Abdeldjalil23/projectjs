// src/pages/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { dashboardPathFor } from '@/lib/roles';
import PageLoader from '@/components/shared/PageLoader';

interface PrivateRouteProps {
  children: JSX.Element;
  /** Roles allowed to open this page. Leave empty to allow every logged-in user. */
  roles?: UserRole[];
  /** Permission needed to open this page (checked against the database permissions). */
  permission?: string;
}

const PrivateRoute = ({ children, roles, permission }: PrivateRouteProps) => {
  const { isLoggedIn, userRole, loading, can } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if ((roles && !roles.includes(userRole)) || (permission && !can(permission))) {
    return <Navigate to={dashboardPathFor(userRole)} replace />;
  }

  return children;
};

export default PrivateRoute;
