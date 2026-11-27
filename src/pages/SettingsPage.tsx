// The signed-in user's own account: who they are in the database, their language, and their
// password. Name, role and identifier are changed by the administration, not here.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { KeyRound, UserRound } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { MIN_PASSWORD_LENGTH, changeMyPassword } from '@/lib/accounts';

const Detail = ({ label, value }: { label: string; value: string | null }) => (
  <div className="space-y-1">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="font-medium">{value || '—'}</dd>
  </div>
);

const PasswordForm = () => {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) {
      toast.error(t('settings.password.enterCurrent'));
      return;
    }
    if (next.length < MIN_PASSWORD_LENGTH) {
      toast.error(t('settings.password.tooShort', { count: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (next !== confirm) {
      toast.error(t('settings.password.mismatch'));
      return;
    }
    if (!userId) return;
    setSaving(true);
    try {
      await changeMyPassword(userId, current, next);
      toast.success(t('settings.password.changed'));
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.requestFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-md gap-4">
      <div className="grid gap-2">
        <Label htmlFor="current-password">{t('settings.password.current')}</Label>
        <Input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-password">{t('settings.password.new')}</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder={t('password.placeholder')}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">{t('settings.password.confirm')}</Label>
        <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('settings.password.submit')}
        </Button>
      </div>
    </form>
  );
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const { userId, fullName, staffRole, roleLabel, specialty } = useAuth();
  const roleName = staffRole ? t(`roles.${staffRole}`, { defaultValue: roleLabel ?? staffRole }) : null;

  return (
    <AppLayout title={t('settings.title')}>
      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4" />
              {t('settings.account.title')}
            </CardTitle>
            <CardDescription>{t('settings.account.hint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label={t('settings.account.fullName')} value={fullName} />
              <Detail label={t('settings.account.staffId')} value={userId} />
              <Detail label={t('settings.account.role')} value={roleName} />
              {specialty && <Detail label={t('settings.account.specialty')} value={specialty} />}
            </dl>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t('language.label')}</span>
              <LanguageSwitcher showName />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" />
              {t('settings.password.title')}
            </CardTitle>
            <CardDescription>{t('settings.password.hint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
