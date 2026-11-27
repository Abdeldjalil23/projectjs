// Access of a worker to the workers' app, in their patient file: whether they have an account, an
// activation code to give them (first sign-in or new password) and closing the access.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { KeyRound, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDateFormat } from '@/hooks/useDateFormat';
import { activationLink, createActivationCode, fetchWorkerAccess, setWorkerAccess } from '@/lib/workerAccess';

export const WorkerAccessCard = ({ beneficiaryId }: { beneficiaryId: string }) => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const queryClient = useQueryClient();
  const [issued, setIssued] = useState<{ code: string; expires_at: string; matricule: string } | null>(null);
  const access = useQuery({ queryKey: ['worker-access', beneficiaryId], queryFn: () => fetchWorkerAccess(beneficiaryId) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['worker-access', beneficiaryId] });

  const issue = useMutation({
    mutationFn: () => createActivationCode(beneficiaryId),
    onSuccess: (data) => {
      setIssued(data);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });
  const toggle = useMutation({
    mutationFn: (active: boolean) => setWorkerAccess(beneficiaryId, active),
    onSuccess: () => {
      refresh();
      toast.success(t('workerAccess.saved'));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const a = access.data;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <Smartphone className="h-4 w-4 text-primary" />
          {t('workerAccess.title')}
        </CardTitle>
        {a && (
          <Badge variant="outline" className={a.has_account && a.active ? 'border-green-600 text-green-800' : 'text-muted-foreground'}>
            {a.has_account ? (a.active ? t('workerAccess.active') : t('workerAccess.closed')) : t('workerAccess.none')}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {access.isLoading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : access.isError ? (
          <p className="text-destructive">{access.error instanceof Error ? access.error.message : t('common.requestFailed')}</p>
        ) : (
          <>
            <p className="text-muted-foreground">
              {a?.has_account
                ? t('workerAccess.since', { date: formatDate(a.created_at), seen: a.last_seen_at ? formatDate(a.last_seen_at) : '—' })
                : t('workerAccess.explain')}
            </p>
            {a?.pending_until && <p className="text-muted-foreground">{t('workerAccess.pending', { date: formatDate(a.pending_until) })}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => issue.mutate()} disabled={issue.isPending}>
                <KeyRound className="me-1 h-4 w-4" />
                {a?.has_account ? t('workerAccess.newCode') : t('workerAccess.createCode')}
              </Button>
              {a?.has_account && (
                <Button size="sm" variant="outline" onClick={() => toggle.mutate(!a.active)} disabled={toggle.isPending}>
                  {a.active ? t('workerAccess.close') : t('workerAccess.reopen')}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={Boolean(issued)} onOpenChange={(open) => !open && setIssued(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('workerAccess.codeTitle')}</DialogTitle>
            <DialogDescription>{t('workerAccess.codeHint')}</DialogDescription>
          </DialogHeader>
          {issued && (
            <div className="flex flex-col items-center gap-4 py-2 text-center" data-testid="activation-code">
              <div className="rounded-md bg-white p-3">
                <QRCodeSVG value={activationLink(issued.matricule, issued.code)} size={180} level="M" marginSize={0} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('worker.fields.matricule')}</p>
                <p className="font-mono text-lg" dir="ltr">
                  {issued.matricule}
                </p>
                <p className="text-xs text-muted-foreground">{t('worker.fields.code')}</p>
                <p className="font-mono text-2xl font-bold tracking-widest" dir="ltr">
                  {issued.code}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{t('workerAccess.codeExpires', { date: formatDate(issued.expires_at) })}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {window.location.origin}/app
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIssued(null)}>{t('workerAccess.done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkerAccessCard;
