// Sign-in of the workers' app, and the first activation with the code given by the centre (also
// used to set a new password). Opened from the activation QR code, the number and code are filled.
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Eye, EyeOff, HeartPulse, KeyRound, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import PageLoader from '@/components/shared/PageLoader';
import { activateWorker, workerClient } from '@/lib/worker';
import { useWorkerAuth } from './WorkerAuth';

/** Password with a button to show it while typing on a phone. */
const PasswordField = (props: React.ComponentProps<typeof Input>) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={`${props.className ?? ''} pe-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 end-0 flex w-12 items-center justify-center text-muted-foreground"
        aria-label={visible ? t('worker.signIn.hidePassword') : t('worker.signIn.showPassword')}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};

const Frame = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <section className="relative overflow-hidden bg-[#141414] px-6 pb-8 pt-6 text-white" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <div className="brand-pattern absolute inset-0 [--pattern-color:rgb(255_255_255/0.045)]" aria-hidden />
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary">
              <HeartPulse className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold uppercase leading-tight tracking-wider">MedSuite</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Sonatrach</p>
            </div>
          </div>
          <LanguageSwitcher className="text-white hover:bg-white/10 hover:text-white" />
        </div>
        <div className="relative mx-auto mt-8 max-w-md">
          <h1 className="text-2xl leading-tight">
            {t('worker.signIn.heroLead')}{' '}
            <span className="inline-block font-bold">
              {t('worker.signIn.heroStrong')}
              <span className="mt-1.5 block h-1 w-full bg-primary" aria-hidden />
            </span>
          </h1>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" aria-hidden />
      </section>
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        {!workerClient ? (
          <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4" role="alert">
            <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="font-medium">{t('common.serverNotConfigured')}</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export const WorkerLogin = () => {
  const { t } = useTranslation();
  const { profile, loading, notice, signIn } = useWorkerAuth();
  const location = useLocation();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (profile) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from.startsWith('/app') ? from : '/app'} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule.trim() || !password) return void toast.error(t('worker.signIn.fillBoth'));
    setBusy(true);
    try {
      await signIn(matricule, password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.requestFailed'));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame>
      <h2 className="text-xl font-bold uppercase tracking-wide">{t('worker.signIn.title')}</h2>
      <span className="title-bar mt-2" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">{t('worker.signIn.hint')}</p>
      {notice && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{notice}</p>}
      <form onSubmit={submit} className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="w-matricule">{t('worker.fields.matricule')}</Label>
          <Input id="w-matricule" className="h-12 text-base" autoComplete="username" autoCapitalize="characters" value={matricule} onChange={(e) => setMatricule(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-password">{t('worker.fields.password')}</Label>
          <PasswordField id="w-password" className="h-12 text-base" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="h-12 uppercase tracking-wide" disabled={busy}>
          {busy ? t('login.signingIn') : t('login.signIn')}
        </Button>
      </form>
      <div className="mt-8 rounded-md border border-dashed p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <KeyRound className="h-4 w-4 text-primary" />
          {t('worker.signIn.firstTime')}
        </p>
        <p className="mt-1 text-muted-foreground">{t('worker.signIn.firstTimeHint')}</p>
        <Button variant="outline" className="mt-3 w-full" asChild>
          <Link to="/app/activate">{t('worker.signIn.activate')}</Link>
        </Button>
      </div>
    </Frame>
  );
};

export const WorkerActivate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn } = useWorkerAuth();
  const [matricule, setMatricule] = useState(params.get('m') ?? '');
  const [code, setCode] = useState(params.get('c') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule.trim() || !code.trim()) return void toast.error(t('worker.activate.fillCode'));
    if (password.length < 8) return void toast.error(t('worker.errors.password'));
    if (password !== confirm) return void toast.error(t('worker.activate.mismatch'));
    setBusy(true);
    try {
      await activateWorker(matricule, code, password);
      await signIn(matricule, password);
      toast.success(t('worker.activate.done'));
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.requestFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame>
      <h2 className="text-xl font-bold uppercase tracking-wide">{t('worker.activate.title')}</h2>
      <span className="title-bar mt-2" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">{t('worker.activate.hint')}</p>
      <form onSubmit={submit} className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="a-matricule">{t('worker.fields.matricule')}</Label>
          <Input id="a-matricule" className="h-12 text-base" autoComplete="username" autoCapitalize="characters" value={matricule} onChange={(e) => setMatricule(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="a-code">{t('worker.fields.code')}</Label>
          <Input
            id="a-code"
            className="h-12 font-mono text-base uppercase tracking-widest"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            placeholder="XXXXX-XXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="a-password">{t('worker.fields.newPassword')}</Label>
          <PasswordField id="a-password" className="h-12 text-base" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-muted-foreground">{t('worker.activate.passwordHint')}</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="a-confirm">{t('worker.fields.confirmPassword')}</Label>
          <PasswordField id="a-confirm" className="h-12 text-base" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="h-12 uppercase tracking-wide" disabled={busy}>
          {busy ? t('common.saving') : t('worker.activate.submit')}
        </Button>
      </form>
      <Button variant="link" className="mt-4 w-full" asChild>
        <Link to="/app/login">{t('worker.activate.haveAccount')}</Link>
      </Button>
    </Frame>
  );
};
