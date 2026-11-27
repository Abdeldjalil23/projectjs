// Signed-in worker of the app: the Supabase session of the workers' client and their profile
// (themselves and their dependents). A session that is not a worker account is closed.
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PageLoader from '@/components/shared/PageLoader';
import { WorkerProfile, fetchWorkerProfile, workerClient, workerSignIn, workerSignOut } from '@/lib/worker';

interface WorkerAuthValue {
  profile: WorkerProfile | null;
  loading: boolean;
  /** Message to show on the sign-in page after a refused session. */
  notice: string | null;
  signIn: (matricule: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const WorkerAuthContext = createContext<WorkerAuthValue>({
  profile: null,
  loading: true,
  notice: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const useWorkerAuth = () => useContext(WorkerAuthContext);

export const WorkerAuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(workerClient));
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setProfile(await fetchWorkerProfile());
      setNotice(null);
    } catch (e) {
      setProfile(null);
      setNotice(e instanceof Error ? e.message : null);
      await workerSignOut().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!workerClient) return;
    let cancelled = false;
    workerClient.auth
      .getSession()
      .then(async ({ data }) => {
        if (data.session && !cancelled) await load();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const { data: subscription } = workerClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setProfile(null);
    });
    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [load]);

  const signIn = async (matricule: string, password: string) => {
    await workerSignIn(matricule, password);
    await load();
  };

  const signOut = async () => {
    await workerSignOut().catch(() => undefined);
    setProfile(null);
    queryClient.removeQueries({ queryKey: ['worker'] });
  };

  return <WorkerAuthContext.Provider value={{ profile, loading, notice, signIn, signOut }}>{children}</WorkerAuthContext.Provider>;
};

/** Pages of the app that need a signed-in worker. */
export const RequireWorker = ({ children }: { children: JSX.Element }) => {
  const { profile, loading } = useWorkerAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!profile) return <Navigate to="/app/login" replace state={{ from: location.pathname }} />;
  return children;
};
