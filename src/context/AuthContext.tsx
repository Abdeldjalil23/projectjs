
import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'doctor' | 'admin' | 'patient' | null;

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserRole(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
