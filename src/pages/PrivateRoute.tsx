// src/pages/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { dashboardPathFor } from '@/lib/roles';

interface PrivateRouteProps {
  children: JSX.Element;
  /** Roles allowed to open this page. Leave empty to allow every logged-in user. */
  roles?: UserRole[];
}

const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const { isLoggedIn, userRole } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(userRole)) {
    return <Navigate to={dashboardPathFor(userRole)} replace />;
  }

  return children;
};

export default PrivateRoute;
