// Public page opened by scanning the QR code of a care coverage. The contracted doctor sees
// whether the coverage is valid, who it is for (to compare with an identity document) and which
// doctor it is addressed to, then records its use. No account is needed and nothing medical is
// shown: the page only knows the random token of the code.
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CircleCheck, CircleX, Clock, HeartPulse, ShieldCheck, ShieldQuestion } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useDateFormat } from '@/hooks/useDateFormat';
import { CareCheck, recordCareUse, verifyCareRequest } from '@/lib/careRequests';
import { isSupabaseConfigured } from '@/lib/supabase';

const STATE_LOOK = {
  approved: { icon: CircleCheck, box: 'border-green-600 bg-green-50 text-green-900', iconColor: 'text-green-600' },
  used: { icon: Clock, box: 'border-sky-600 bg-sky-50 text-sky-900', iconColor: 'text-sky-600' },
  expired: { icon: CircleX, box: 'border-red-600 bg-red-50 text-red-900', iconColor: 'text-red-600' },
} as const;

export const VerifyCareRequestPage = () => {
  const { token = '' } = useParams();
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [justUsed, setJustUsed] = useState(false);

  const check = useQuery({
    queryKey: ['care-check', token],
    queryFn: () => verifyCareRequest(token),
    enabled: isSupabaseConfigured,
    retry: 1,
  });
  const use = useMutation({
    mutationFn: () => recordCareUse(token),
    onSuccess: (row) => {
      queryClient.setQueryData(['care-check', token], row);
      setJustUsed(true);
    },
    onSettled: () => setConfirming(false),
  });

  const data: CareCheck | null | undefined = check.data;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="relative overflow-hidden bg-[#141414] text-white">
        <div className="brand-pattern absolute inset-0 [--pattern-color:rgb(255_255_255/0.045)]" aria-hidden />
        <div className="relative mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold uppercase leading-tight tracking-wider">MedSuite</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Sonatrach</p>
            </div>
          </div>
          <LanguageSwitcher className="text-white hover:bg-white/10 hover:text-white" />
        </div>
        <div className="h-1 bg-primary" />
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <h1 className="text-xl font-bold uppercase tracking-wide">{t('careRequests.verify.title')}</h1>
        <span className="title-bar mt-2" aria-hidden />

        <div className="mt-6">
          {!isSupabaseConfigured ? (
            <p className="text-sm text-destructive">{t('common.serverNotConfigured')}</p>
          ) : check.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : check.isError ? (
            <p className="text-sm text-destructive">{check.error instanceof Error ? check.error.message : t('common.requestFailed')}</p>
          ) : !data ? (
            <div className="flex items-start gap-3 rounded-md border border-zinc-300 bg-card p-5">
              <ShieldQuestion className="mt-0.5 h-7 w-7 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-semibold">{t('careRequests.verify.notFoundTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('careRequests.verify.notFound')}</p>
              </div>
            </div>
          ) : (
            <Result
              data={data}
              justUsed={justUsed}
              formatDate={formatDate}
              onUse={() => setConfirming(true)}
              using={use.isPending}
              useError={use.error instanceof Error ? use.error.message : null}
            />
          )}
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {t('careRequests.verify.privacy')}
        </p>
      </main>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('careRequests.verify.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('careRequests.verify.confirmText')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                use.mutate();
              }}
              disabled={use.isPending}
            >
              {t('careRequests.verify.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Result = ({
  data,
  justUsed,
  formatDate,
  onUse,
  using,
  useError,
}: {
  data: CareCheck;
  justUsed: boolean;
  formatDate: (v: string | null | undefined) => string;
  onUse: () => void;
  using: boolean;
  useError: string | null;
}) => {
  const { t } = useTranslation();
  const look = STATE_LOOK[data.state];
  const Icon = look.icon;

  return (
    <div className="space-y-5">
      <div className={`flex items-start gap-3 rounded-md border-2 p-5 ${look.box}`} data-testid="care-check-state">
        <Icon className={`mt-0.5 h-8 w-8 shrink-0 ${look.iconColor}`} />
        <div>
          <p className="text-lg font-bold">{t(`careRequests.verify.states.${data.state}`)}</p>
          <p className="text-sm">
            {data.state === 'approved' && t('careRequests.verify.validText', { date: formatDate(data.valid_until) })}
            {data.state === 'used' && t('careRequests.verify.usedText', { date: formatDate(data.used_at) })}
            {data.state === 'expired' && t('careRequests.verify.expiredText', { date: formatDate(data.valid_until) })}
          </p>
          {justUsed && <p className="mt-1 text-sm font-semibold">{t('careRequests.verify.confirmed')}</p>}
        </div>
      </div>

      <dl className="divide-y rounded-md border bg-card text-sm">
        <Row label={t('careRequests.verify.number')}>
          <span className="font-mono" dir="ltr">
            {data.number}
          </span>
        </Row>
        <Row label={t('careRequests.verify.beneficiary')}>
          <p className="font-semibold">{data.beneficiary_name}</p>
          {data.beneficiary_number && (
            <p className="font-mono text-xs text-muted-foreground">
              <span dir="ltr">{data.beneficiary_number}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{t('careRequests.verify.idHint')}</p>
        </Row>
        <Row label={t('careRequests.verify.doctor')}>
          <p className="font-semibold">{data.doctor_name}</p>
          <p className="text-xs text-muted-foreground">{data.doctor_specialty}</p>
        </Row>
        <Row label={t('careRequests.verify.validUntil')}>{formatDate(data.valid_until)}</Row>
        {data.used_at && <Row label={t('careRequests.verify.usedAt')}>{formatDate(data.used_at)}</Row>}
      </dl>

      {data.state === 'approved' && (
        <div className="space-y-2">
          <Button size="lg" className="w-full uppercase tracking-wide" onClick={onUse} disabled={using}>
            {using ? t('common.saving') : t('careRequests.verify.confirm')}
          </Button>
          <p className="text-xs text-muted-foreground">{t('careRequests.verify.confirmHint')}</p>
        </div>
      )}
      {useError && <p className="text-sm text-destructive">{useError}</p>}
    </div>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-3">
    <dt className="text-muted-foreground">{label}</dt>
    <dd>{children}</dd>
  </div>
);

export default VerifyCareRequestPage;
