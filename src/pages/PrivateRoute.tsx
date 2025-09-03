// src/components/PrivateRoute.tsx
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
