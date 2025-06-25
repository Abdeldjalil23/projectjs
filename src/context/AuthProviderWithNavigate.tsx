// src/context/AuthProviderWithNavigate.tsx
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

export const AuthProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return <AuthProvider navigate={navigate}>{children}</AuthProvider>;
};
