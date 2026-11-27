// LoginScreen component for Sonatrach MedSuite
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-medsuite-light to-white p-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher showName />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Sonatrach MedSuite Logo" className="mx-auto mb-4 h-32 w-auto" />
          <h4 className="text-3xl font-bold text-medsuite-dark mb-3">Sonatrach MedSuite</h4>
        </div>

        <Card className="border-medsuite-primary/20">
          <CardHeader>
            <CardTitle>{t('login.welcome')}</CardTitle>
            <CardDescription>{t('login.staffHint')}</CardDescription>
          </CardHeader>

          <CardContent>
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
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ID">{t('login.id')}</Label>
                    <Input
                      id="ID"
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
                      placeholder={t('login.passwordPlaceholder')}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-medsuite-primary hover:bg-medsuite-accent"
                  >
                    {submitting ? t('login.signingIn') : t('login.signIn')}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">{t('login.forgotHint')}</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
