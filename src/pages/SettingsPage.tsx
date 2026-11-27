// The signed-in user's own account: who they are in the database, their language, and their
// password. Name, role and identifier are changed by the administration, not here.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, KeyRound, Palette, UserRound } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { MIN_PASSWORD_LENGTH, changeMyPassword } from '@/lib/accounts';
import { THEMES, THEME_COLORS, Theme, saveTheme, savedTheme } from '@/lib/theme';

const Detail = ({ label, value }: { label: string; value: string | null }) => (
  <div className="space-y-1">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="font-medium">{value || '—'}</dd>
  </div>
);

/** Colour theme of the interface, applied at once and kept for this user on this computer. */
const ThemePicker = () => {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [current, setCurrent] = useState<Theme>(() => savedTheme(userId));

  const choose = (theme: Theme) => {
    setCurrent(theme);
    saveTheme(theme, userId);
  };

  return (
    <div role="radiogroup" aria-label={t('settings.appearance.title')} className="flex flex-wrap gap-4">
      {THEMES.map((theme) => {
        const selected = theme === current;
        return (
          <button
            key={theme}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => choose(theme)}
            className="flex w-20 flex-col items-center gap-2 rounded-md p-2 text-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 ${selected ? 'ring-2 ring-foreground' : ''}`}
              style={{ backgroundColor: THEME_COLORS[theme] }}
            >
              {selected && <Check className="h-5 w-5 text-white" />}
            </span>
            <span className={selected ? 'font-medium' : 'text-muted-foreground'}>{t(`settings.appearance.themes.${theme}`)}</span>
          </button>
        );
      })}
    </div>
  );
};

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
              <Palette className="h-4 w-4" />
              {t('settings.appearance.title')}
            </CardTitle>
            <CardDescription>{t('settings.appearance.hint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePicker />
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
