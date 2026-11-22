// LoginScreen component for Sonatrach MedSuite
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Briefcase, Stethoscope, Users, Smile } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { dashboardPathFor, DEMO_STAFF_ROLE } from '@/lib/roles';
import PageLoader from '@/components/shared/PageLoader';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { toast } from 'sonner';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';

// Demo login tabs: one per workspace.
const DEMO_TABS = [
  { value: 'doctor', icon: Stethoscope },
  { value: 'admin', icon: Briefcase },
  { value: 'social', icon: Users },
  { value: 'dentist', icon: Smile },
] as const;

const SPECIALTIES = ['MEDECINE', 'INFERMIER'] as const;

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { login, signIn, isLoggedIn, userRole, loading, isDemo } = useAuth();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real login: the role and permissions come from the account in the database.
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

  // Demo login, used while no server is configured: the role is picked on this screen.
  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const idPattern = /^\d{4}[A-Z]$/;

    if (!ID.trim()) {
      toast.error(t('login.errors.enterId'));
      return;
    }
    if (!password) {
      toast.error(t('login.errors.enterPassword'));
      return;
    }

    if (selectedRole === 'doctor' && !specialty) {
      toast.error(t('login.errors.selectSpecialty'));
      return;
    }

    if (!idPattern.test(ID)) {
      toast.error(t('login.errors.idFormat'));
      return;
    }

    login(selectedRole, { id: ID, specialty: selectedRole === 'doctor' ? specialty : undefined });
    const roleName = selectedRole ? t(`roles.${DEMO_STAFF_ROLE[selectedRole]}`) : '';
    const specialtyName = selectedRole === 'doctor' ? ` (${t(`login.specialties.${specialty}`)})` : '';
    toast.success(t('login.loggedInAs', { role: roleName + specialtyName }));
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
            <CardDescription>{isDemo ? t('login.demoHint') : t('login.staffHint')}</CardDescription>
          </CardHeader>

          <CardContent>
            {isDemo && (
              <Tabs
                defaultValue="doctor"
                className="mb-6"
                onValueChange={(value) => setSelectedRole(value as UserRole)}
              >
                <TabsList className="grid w-full grid-cols-4">
                  {DEMO_TABS.map(({ value, icon: Icon }) => (
                    <TabsTrigger key={value} value={value} className="flex items-center gap-1">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t(`login.tabs.${value}`)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {DEMO_TABS.map(({ value }) => (
                  <TabsContent key={value} value={value}>
                    <p className="text-sm text-muted-foreground mb-4">{t(`login.tabHints.${value}`)}</p>
                  </TabsContent>
                ))}
              </Tabs>
            )}

            <form onSubmit={isDemo ? handleDemoLogin : handleSignIn}>
              <div className="grid gap-4">
                {isDemo && selectedRole === 'doctor' && (
                  <div className="grid gap-2">
                    <Label htmlFor="specialty">{t('login.specialty')}</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder={t('login.specialtyPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {t(`login.specialties.${spec}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('login.password')}</Label>
                    {isDemo && (
                      <a href="#" className="text-sm text-medsuite-primary hover:underline">
                        {t('login.forgotLink')}
                      </a>
                    )}
                  </div>
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
                {!isDemo && (
                  <p className="text-center text-xs text-muted-foreground">{t('login.forgotHint')}</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
