// LoginScreen component for Sonatrach MedSuite
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { HeartPulse, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { dashboardPathFor } from '@/lib/roles';
import { isSupabaseConfigured } from '@/lib/supabase';
import PageLoader from '@/components/shared/PageLoader';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { signIn, isLoggedIn, userRole, loading } = useAuth();
  const location = useLocation();

  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // The role and permissions come from the account in the database.
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ID.trim()) {
      toast.error(t('login.errors.enterId'));
      return;
    }
    if (!password) {
      toast.error(t('login.errors.enterPassword'));
      return;
    }

    setSubmitting(true);
    const error = await signIn(ID, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      setPassword('');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  // Once logged in, go back to the page that was requested before login, otherwise to the dashboard.
  if (isLoggedIn) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== '/' ? from : dashboardPathFor(userRole)} replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      {/* Brand panel: dark like the header of sonatrach.com, with its tiled band and a headline
          whose strong part is underlined in the brand colour. */}
      <section className="relative flex flex-col justify-between gap-8 overflow-hidden bg-[#141414] px-6 py-7 text-white sm:gap-10 sm:px-10 lg:px-16 lg:py-12">
        <div className="brand-pattern absolute inset-0 [--pattern-color:rgb(255_255_255/0.045)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary lg:inset-x-auto lg:end-0 lg:top-0 lg:h-auto lg:w-1" aria-hidden />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary">
            <HeartPulse className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-bold uppercase leading-tight tracking-wider">MedSuite</p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Sonatrach</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <h1 className="text-2xl font-normal leading-tight sm:text-4xl">
            {t('login.heroLead')}{' '}
            <span className="inline-block font-bold">
              {t('login.heroStrong')}
              <span className="mt-2 block h-1 w-full bg-primary" aria-hidden />
            </span>
          </h1>
          <p className="mt-6 hidden max-w-md leading-relaxed text-white/75 sm:block">{t('login.heroText')}</p>
        </div>

        <p className="relative hidden text-xs text-white/50 lg:block">{t('footer', { year: String(new Date().getFullYear()) })}</p>
      </section>

      <section className="relative flex flex-col items-center justify-center bg-background px-6 py-10 sm:px-10">
        <div className="absolute end-4 top-4">
          <LanguageSwitcher showName />
        </div>

        <div className="w-full max-w-sm animate-fade-in">
          <h2 className="text-2xl font-bold uppercase tracking-wide">{t('login.welcome')}</h2>
          <span className="title-bar mt-2" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">{t('login.staffHint')}</p>

          <div className="mt-8">
            {!isSupabaseConfigured ? (
              // Without the server keys nobody can sign in: say what is missing instead of a form that cannot work.
              <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4" role="alert">
                <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">{t('common.serverNotConfigured')}</p>
                  <p className="text-sm text-muted-foreground">{t('login.serverMissing')}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignIn}>
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="ID">{t('login.id')}</Label>
                    <Input
                      id="ID"
                      className="h-11"
                      placeholder={t('login.idPlaceholder')}
                      autoComplete="username"
                      value={ID}
                      onChange={(e) => setID(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">{t('login.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      className="h-11"
                      placeholder={t('login.passwordPlaceholder')}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={submitting} className="mt-1 uppercase tracking-wide">
                    {submitting ? t('login.signingIn') : t('login.signIn')}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t('login.forgotHint')}</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginScreen;
