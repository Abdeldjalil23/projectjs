// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { NavigateFunction } from 'react-router-dom';

export type UserRole = 'admin' | 'doctor' | 'dentist' | 'social' | 'patient' | null;

interface SessionUser {
  id: string;
  role: Exclude<UserRole, null>;
  specialty?: string;
}

interface LoginDetails {
  id?: string;
  specialty?: string;
}

interface AuthContextType {
  userRole: UserRole;
  userId: string | null;
  specialty: string | null;
  isLoggedIn: boolean;
  login: (role: UserRole, details?: LoginDetails) => void;
  logout: () => void;
}

// The session lives in sessionStorage: it survives a page reload
// and is cleared when the browser tab is closed.
const SESSION_KEY = 'medsuite.session';
const VALID_ROLES = ['admin', 'doctor', 'dentist', 'social', 'patient'];

const readSession = (): SessionUser | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !VALID_ROLES.includes(parsed.role)) return null;
    return { id: String(parsed.id ?? ''), role: parsed.role, specialty: parsed.specialty || undefined };
  } catch {
    return null;
  }
};

const writeSession = (user: SessionUser | null) => {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode, blocked cookies): keep the in-memory session only.
  }
};

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  userId: null,
  specialty: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, navigate }: { children: ReactNode; navigate: NavigateFunction }) => {
  const [user, setUser] = useState<SessionUser | null>(readSession);

  const login = (role: UserRole, details: LoginDetails = {}) => {
    if (!role) return;
    const next: SessionUser = { id: details.id ?? '', role, specialty: details.specialty || undefined };
    setUser(next);
    writeSession(next);
  };

  const logout = () => {
    setUser(null);
    writeSession(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        userRole: user?.role ?? null,
        userId: user?.id || null,
        specialty: user?.specialty ?? null,
        isLoggedIn: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
