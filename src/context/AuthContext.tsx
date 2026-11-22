// src/context/AuthContext.tsx
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { isSupabaseConfigured, staffEmail, supabase } from '@/lib/supabase';
import { ROLE_LABELS, WORKSPACE_BY_STAFF_ROLE } from '@/lib/roles';

export type UserRole = 'admin' | 'doctor' | 'dentist' | 'social' | 'patient' | null;

interface SessionUser {
  /** Staff identifier, shown in the header. */
  id: string;
  /** Workspace of the app the account opens. */
  role: Exclude<UserRole, null>;
  specialty?: string;
  fullName?: string;
  roleLabel?: string;
  /** Permission codes from the database. Undefined in demo mode. */
  permissions?: string[];
}

interface LoginDetails {
  id?: string;
  specialty?: string;
}

interface AuthContextType {
  userRole: UserRole;
  userId: string | null;
  specialty: string | null;
  fullName: string | null;
  roleLabel: string | null;
  isLoggedIn: boolean;
  /** True while a saved session is being checked with the server. */
  loading: boolean;
  /** True when no server is configured and the demo login is used. */
  isDemo: boolean;
  /** Whether the account has a permission (always true in demo mode). */
  can: (permission: string) => boolean;
  /** Demo login: picks a role without checking any password. */
  login: (role: UserRole, details?: LoginDetails) => void;
  /** Real login. Resolves to an error message, or null on success. */
  signIn: (staffId: string, password: string) => Promise<string | null>;
  logout: () => void;
}

// Demo session: kept in sessionStorage so it survives a reload
// and is cleared when the browser tab is closed.
const SESSION_KEY = 'medsuite.session';
const VALID_ROLES = ['admin', 'doctor', 'dentist', 'social', 'patient'];

const readDemoSession = (): SessionUser | null => {
  if (isSupabaseConfigured) return null;
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

const writeDemoSession = (user: SessionUser | null) => {
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

/** Raised when the password is right but the account may not use the app. */
class AccessError extends Error {}

/** Reads the signed-in account's profile, role and permissions from the database. */
const loadStaffUser = async (userId: string): Promise<SessionUser> => {
  if (!supabase) throw new AccessError('The server is not configured.');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('staff_id, full_name, specialty, active, role:roles(code, name_en)')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;

  const role = (Array.isArray(profile?.role) ? profile?.role[0] : profile?.role) as
    | { code: string; name_en: string }
    | null
    | undefined;
  if (!profile || !profile.active || !role) {
    throw new AccessError('This account is not active. Please contact the administrator.');
  }

  const workspace = WORKSPACE_BY_STAFF_ROLE[role.code];
  if (!workspace) {
    throw new AccessError(`The ${role.name_en} workspace is not available yet.`);
  }

  const { data: permissions, error: permissionsError } = await supabase.rpc('my_permissions');
  if (permissionsError) throw permissionsError;

  return {
    id: profile.staff_id ?? '',
    role: workspace.role,
    specialty: profile.specialty || workspace.specialty,
    fullName: profile.full_name || undefined,
    roleLabel: role.name_en,
    permissions: ((permissions ?? []) as unknown[]).map((p) =>
      typeof p === 'string' ? p : String(Object.values(p as object)[0]),
    ),
  };
};

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  userId: null,
  specialty: null,
  fullName: null,
  roleLabel: null,
  isLoggedIn: false,
  loading: false,
  isDemo: !isSupabaseConfigured,
  can: () => false,
  login: () => {},
  signIn: async () => 'Not available',
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, navigate }: { children: ReactNode; navigate: NavigateFunction }) => {
  const [user, setUser] = useState<SessionUser | null>(readDemoSession);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // Restore a saved server session on load, and follow sign-outs (expired session, other tab).
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!data.session) return;
        try {
          const staff = await loadStaffUser(data.session.user.id);
          if (!cancelled) setUser(staff);
        } catch {
          await supabase?.auth.signOut({ scope: 'local' });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUser(null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = (role: UserRole, details: LoginDetails = {}) => {
    if (!role || isSupabaseConfigured) return;
    const next: SessionUser = { id: details.id ?? '', role, specialty: details.specialty || undefined };
    setUser(next);
    writeDemoSession(next);
  };

  const signIn = async (staffId: string, password: string): Promise<string | null> => {
    if (!supabase) return 'The server is not configured.';

    const { data, error } = await supabase.auth.signInWithPassword({
      email: staffEmail(staffId),
      password,
    });
    if (error || !data.user) {
      if (error?.status === 429) return 'Too many attempts. Please wait a moment and try again.';
      if (error?.status === 400 || error?.code === 'invalid_credentials') return 'Incorrect ID or password.';
      return 'Could not reach the server. Please try again.';
    }

    try {
      setUser(await loadStaffUser(data.user.id));
      return null;
    } catch (e) {
      await supabase.auth.signOut({ scope: 'local' });
      return e instanceof AccessError ? e.message : 'Could not load your account. Please try again.';
    }
  };

  const logout = () => {
    setUser(null);
    if (supabase) {
      void supabase.auth.signOut({ scope: 'local' });
    } else {
      writeDemoSession(null);
    }
    navigate('/login');
  };

  const can = useCallback(
    (permission: string) => (user ? !user.permissions || user.permissions.includes(permission) : false),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        userRole: user?.role ?? null,
        userId: user?.id || null,
        specialty: user?.specialty ?? null,
        fullName: user?.fullName ?? null,
        roleLabel: user ? user.roleLabel ?? ROLE_LABELS[user.role] : null,
        isLoggedIn: user !== null,
        loading,
        isDemo: !isSupabaseConfigured,
        can,
        login,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
