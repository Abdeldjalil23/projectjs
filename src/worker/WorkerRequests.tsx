// Care coverage in the workers' app: the family's requests, a new request, and each coverage with
// its QR code, shown large so the contracted doctor can scan it from the phone.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronRight, MapPin, Phone, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDateFormat } from '@/hooks/useDateFormat';
import { CareState, verifyUrl } from '@/lib/careRequests';
import { WorkerRequest, createWorkerRequest, fetchWorkerDoctors, fetchWorkerRequests } from '@/lib/worker';
import { useWorkerAuth } from './WorkerAuth';
import WorkerLayout, { SectionTitle } from './WorkerLayout';

const STATE_STYLE: Record<CareState, string> = {
  pending: 'border-amber-500 bg-amber-50 text-amber-800',
  approved: 'border-green-600 bg-green-50 text-green-800',
  used: 'border-sky-600 bg-sky-50 text-sky-800',
  expired: 'border-zinc-400 bg-zinc-100 text-zinc-700',
  refused: 'border-red-600 bg-red-50 text-red-800',
};

const PRESTATION_KEYS = ['specialist', 'lab', 'imaging', 'dental', 'physiotherapy', 'optics'] as const;

const useRequests = () => useQuery({ queryKey: ['worker', 'requests'], queryFn: fetchWorkerRequests });

export const StateBadge = ({ state }: { state: CareState }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className={`whitespace-nowrap ${STATE_STYLE[state]}`}>
      {t(`careRequests.state.${state}`)}
    </Badge>
  );
};

const RequestRow = ({ r }: { r: WorkerRequest }) => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  return (
    <Link to={`/app/requests/${r.id}`} className="block" data-request={r.number}>
      <Card className="transition-colors hover:border-primary/60">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <StateBadge state={r.state} />
              <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                {r.number}
              </span>
            </div>
            <p className="truncate font-semibold">{r.prestation}</p>
            <p className="truncate text-sm text-muted-foreground">
              {r.doctor_name} · {r.beneficiary_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.state === 'approved'
                ? t('careRequests.validUntil', { date: formatDate(r.valid_until) })
                : t('worker.requests.madeOn', { date: formatDate(r.created_at) })}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </CardContent>
      </Card>
    </Link>
  );
};

const ListBody = ({ rows, isLoading, error, empty }: { rows: WorkerRequest[]; isLoading: boolean; error: unknown; empty: string }) => {
  const { t } = useTranslation();
  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (error) return <p className="py-8 text-center text-sm text-destructive">{error instanceof Error ? error.message : t('common.requestFailed')}</p>;
  if (rows.length === 0) return <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <RequestRow key={r.id} r={r} />
      ))}
    </div>
  );
};

export const WorkerRequestsPage = () => {
  const { t } = useTranslation();
  const list = useRequests();
  return (
    <WorkerLayout title={t('worker.nav.requests')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle>{t('worker.requests.title')}</SectionTitle>
        <Button asChild>
          <Link to="/app/requests/new">
            <Plus className="me-1 h-4 w-4" />
            {t('worker.requests.new')}
          </Link>
        </Button>
      </div>
      <ListBody rows={list.data ?? []} isLoading={list.isLoading} error={list.error} empty={t('worker.requests.empty')} />
    </WorkerLayout>
  );
};

/** Mes documents: the coverages that can be used now. */
export const WorkerDocumentsPage = () => {
  const { t } = useTranslation();
  const list = useRequests();
  const rows = (list.data ?? []).filter((r) => r.state === 'approved');
  return (
    <WorkerLayout title={t('worker.nav.documents')}>
      <SectionTitle>{t('worker.documents.title')}</SectionTitle>
      <p className="mb-4 text-sm text-muted-foreground">{t('worker.documents.hint')}</p>
      <ListBody rows={rows} isLoading={list.isLoading} error={list.error} empty={t('worker.documents.empty')} />
    </WorkerLayout>
  );
};

export const WorkerRequestDetail = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const formatDate = useDateFormat();
  const list = useRequests();
  const r = list.data?.find((x) => x.id === id);

  return (
    <WorkerLayout title={r?.number ?? t('worker.nav.requests')} back="/app/requests">
      {list.isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : !r ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('worker.requests.notFound')}</p>
      ) : (
        <div className="space-y-5">
          {r.state === 'approved' && r.qr_token && (
            <Card className="border-2 border-green-600">
              <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-green-800">{t('worker.requests.showToDoctor')}</p>
                <div className="rounded-md bg-white p-3">
                  <QRCodeSVG value={verifyUrl(r.qr_token)} size={220} level="M" marginSize={0} data-testid="worker-qr" />
                </div>
                <p className="text-sm">{t('careRequests.validUntil', { date: formatDate(r.valid_until) })}</p>
                <p className="text-xs text-muted-foreground">{t('worker.requests.qrHint')}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <StateBadge state={r.state} />
            <span className="font-mono text-xs text-muted-foreground" dir="ltr">
              {r.number}
            </span>
          </div>
          {r.state === 'refused' && r.refusal_reason && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              <span className="font-semibold">{t('worker.requests.reason')} : </span>
              {r.refusal_reason}
            </p>
          )}
          {r.state === 'pending' && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{t('worker.requests.pendingHint')}</p>}
          {r.state === 'used' && <p className="rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">{t('worker.requests.usedHint', { date: formatDate(r.used_at) })}</p>}
          {r.state === 'expired' && <p className="rounded-md border p-3 text-sm text-muted-foreground">{t('worker.requests.expiredHint', { date: formatDate(r.valid_until) })}</p>}

          <dl className="divide-y rounded-md border bg-card text-sm">
            <Row label={t('worker.requests.for')}>{r.beneficiary_name}</Row>
            <Row label={t('worker.requests.prestation')}>{r.prestation}</Row>
            <Row label={t('worker.requests.doctor')}>
              <p className="font-semibold">{r.doctor_name}</p>
              <p className="text-xs text-muted-foreground">{r.doctor_specialty}</p>
              {r.doctor_address && (
                <p className="mt-1 flex items-start gap-1 text-xs">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {r.doctor_address}
                </p>
              )}
              {r.doctor_phone && (
                <a href={`tel:${r.doctor_phone.replace(/\s/g, '')}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary" dir="ltr">
                  <Phone className="h-3.5 w-3.5" />
                  {r.doctor_phone}
                </a>
              )}
            </Row>
            <Row label={t('worker.requests.madeOnLabel')}>{formatDate(r.created_at)}</Row>
            {r.notes && <Row label={t('careRequests.form.notes')}>{r.notes}</Row>}
          </dl>
        </div>
      )}
    </WorkerLayout>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </div>
);

export const WorkerNewRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useWorkerAuth();
  const doctors = useQuery({ queryKey: ['worker', 'doctors'], queryFn: fetchWorkerDoctors });
  const people = profile ? [profile.me, ...profile.family] : [];
  const [beneficiaryId, setBeneficiaryId] = useState(profile?.me.id ?? '');
  const [doctorId, setDoctorId] = useState('');
  const [prestation, setPrestation] = useState('');
  const [notes, setNotes] = useState('');

  const save = useMutation({
    mutationFn: () => createWorkerRequest({ beneficiary_id: beneficiaryId, doctor_id: doctorId, prestation, notes: notes || null }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'requests'] });
      toast.success(t('worker.requests.sent', { number: created?.number ?? '' }));
      navigate(created ? `/app/requests/${created.id}` : '/app/requests', { replace: true });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryId) return void toast.error(t('careRequests.form.beneficiaryNeeded'));
    if (!doctorId) return void toast.error(t('careRequests.form.doctorNeeded'));
    if (prestation.trim().length < 2) return void toast.error(t('careRequests.form.prestationNeeded'));
    save.mutate();
  };

  return (
    <WorkerLayout title={t('worker.requests.new')} back="/app/requests">
      <SectionTitle>{t('worker.requests.newTitle')}</SectionTitle>
      <p className="mb-5 text-sm text-muted-foreground">{t('worker.requests.newHint')}</p>
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="r-person">{t('worker.requests.for')}</Label>
          <Select value={beneficiaryId} onValueChange={setBeneficiaryId}>
            <SelectTrigger id="r-person" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {people.map((p, i) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                  {i === 0 ? ` (${t('worker.requests.myself')})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="r-doctor">{t('worker.requests.doctor')}</Label>
          {doctors.isSuccess && doctors.data.length === 0 ? (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{t('worker.doctors.empty')}</p>
          ) : (
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger id="r-doctor" className="h-12">
                <SelectValue placeholder={doctors.isLoading ? t('common.loading') : t('careRequests.form.doctorPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {(doctors.data ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.specialty} — {d.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="r-prestation">{t('worker.requests.prestation')}</Label>
          <Input id="r-prestation" className="h-12" list="r-prestations" maxLength={200} value={prestation} onChange={(e) => setPrestation(e.target.value)} />
          <datalist id="r-prestations">
            {PRESTATION_KEYS.map((key) => (
              <option key={key} value={t(`careRequests.prestations.${key}`)} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">{t('worker.requests.prestationHint')}</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="r-notes">{t('careRequests.form.notes')}</Label>
          <Textarea id="r-notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="h-12 uppercase tracking-wide" disabled={save.isPending}>
          {save.isPending ? t('common.saving') : t('careRequests.form.submit')}
        </Button>
      </form>
    </WorkerLayout>
  );
};
