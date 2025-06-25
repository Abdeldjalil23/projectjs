// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { NavigateFunction } from 'react-router-dom';

export type UserRole = 'admin' | 'doctor' | 'patient' | null;

interface AuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  setUserRole: () => {},
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, navigate }: { children: ReactNode; navigate: NavigateFunction }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserRole(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
