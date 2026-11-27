// Dialogs of the care coverage requests: a new request on a worker's behalf, its review by the
// administration (approve, or refuse with a reason) and the contracted doctors' records.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PersonPicker from '@/components/shared/PersonPicker';
import { useDateFormat } from '@/hooks/useDateFormat';
import type { PersonRef } from '@/lib/beneficiaries';
import {
  CareRequest,
  ContractedDoctor,
  createCareRequest,
  fetchCareSettings,
  fetchContractedDoctors,
  reviewCareRequest,
  saveContractedDoctor,
  searchActiveBeneficiaries,
} from '@/lib/careRequests';
import { addDays, today } from '@/lib/visits';

const errorText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/** Usual services, offered as suggestions; any other wording can be typed. */
const PRESTATION_KEYS = ['specialist', 'lab', 'imaging', 'dental', 'physiotherapy', 'optics'] as const;

export const NewCareRequestDialog = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [prestation, setPrestation] = useState('');
  const [notes, setNotes] = useState('');
  const doctors = useQuery({ queryKey: ['contracted-doctors', 'active'], queryFn: () => fetchContractedDoctors({ activeOnly: true }) });

  const save = useMutation({
    mutationFn: () =>
      createCareRequest({ beneficiary_id: person!.id, contracted_doctor_id: doctorId, prestation, notes: notes || null }),
    onSuccess: ({ number }) => {
      queryClient.invalidateQueries({ queryKey: ['care-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'care-requests'] });
      toast.success(t('careRequests.form.created', { number }));
      onClose();
    },
    onError: (e) => toast.error(errorText(e, t('common.requestFailed'))),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return void toast.error(t('careRequests.form.beneficiaryNeeded'));
    if (!doctorId) return void toast.error(t('careRequests.form.doctorNeeded'));
    if (prestation.trim().length < 2) return void toast.error(t('careRequests.form.prestationNeeded'));
    save.mutate();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{t('careRequests.form.title')}</DialogTitle>
            <DialogDescription>{t('careRequests.form.intro')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="care-beneficiary">{t('careRequests.form.beneficiary')} *</Label>
              <PersonPicker
                id="care-beneficiary"
                value={person}
                onChange={setPerson}
                search={searchActiveBeneficiaries}
                queryKey="care-beneficiaries"
                placeholder={t('careRequests.form.beneficiaryPlaceholder')}
                searchPlaceholder={t('careRequests.form.beneficiarySearch')}
                empty={t('careRequests.form.beneficiaryNone')}
                clearLabel={t('careRequests.form.beneficiaryClear')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="care-doctor">{t('careRequests.form.doctor')} *</Label>
              {doctors.isSuccess && doctors.data.length === 0 ? (
                <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{t('careRequests.form.noDoctor')}</p>
              ) : (
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger id="care-doctor">
                    <SelectValue placeholder={doctors.isLoading ? t('common.loading') : t('careRequests.form.doctorPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(doctors.data ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id!}>
                        {d.full_name} — {d.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="care-prestation">{t('careRequests.form.prestation')} *</Label>
              <Input
                id="care-prestation"
                list="care-prestations"
                maxLength={200}
                value={prestation}
                onChange={(e) => setPrestation(e.target.value)}
                placeholder={t('careRequests.prestations.specialist')}
              />
              <datalist id="care-prestations">
                {PRESTATION_KEYS.map((key) => (
                  <option key={key} value={t(`careRequests.prestations.${key}`)} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">{t('careRequests.form.prestationHint')}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="care-notes">{t('careRequests.form.notes')}</Label>
              <Textarea id="care-notes" maxLength={1000} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t('careRequests.form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const OTHER = 'Autre';

export const ReviewDialog = ({
  request,
  approve,
  onClose,
}: {
  request: CareRequest;
  approve: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['care-settings'], queryFn: fetchCareSettings, staleTime: 600_000 });
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const days = settings.data?.validityDays ?? 30;
  const isOther = reason === OTHER || reason.toLowerCase() === 'other';

  const save = useMutation({
    mutationFn: () => {
      const text = approve ? undefined : [isOther ? null : reason, details.trim() || null].filter(Boolean).join(' — ');
      return reviewCareRequest(request.id, approve, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'care-requests'] });
      toast.success(t(approve ? 'careRequests.review.approved' : 'careRequests.review.refused', { number: request.number }));
      onClose();
    },
    onError: (e) => toast.error(errorText(e, t('common.requestFailed'))),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approve) {
      if (!reason) return void toast.error(t('careRequests.review.reasonNeeded'));
      if (isOther && details.trim().length < 3) return void toast.error(t('careRequests.review.detailsNeeded'));
    }
    save.mutate();
  };

  const who = request.beneficiary ? `${request.beneficiary.last_name} ${request.beneficiary.first_name}` : '—';

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{t(approve ? 'careRequests.review.approveTitle' : 'careRequests.review.refuseTitle', { number: request.number })}</DialogTitle>
            <DialogDescription>
              {who} · {request.prestation} · {request.doctor?.full_name ?? '—'}
            </DialogDescription>
          </DialogHeader>
          {approve ? (
            <p className="py-4 text-sm">{t('careRequests.review.approveText', { count: days, date: formatDate(addDays(today(), days)) })}</p>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="care-reason">{t('careRequests.review.reason')} *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="care-reason">
                    <SelectValue placeholder={t('careRequests.review.reasonPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(settings.data?.refusalReasons ?? []).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="care-details">
                  {t('careRequests.review.details')}
                  {isOther ? ' *' : ''}
                </Label>
                <Textarea id="care-details" rows={3} maxLength={400} value={details} onChange={(e) => setDetails(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t('careRequests.review.detailsHint')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant={approve ? 'default' : 'destructive'} disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t(approve ? 'careRequests.review.approveConfirm' : 'careRequests.review.refuseConfirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const emptyDoctor = (): ContractedDoctor => ({ full_name: '', specialty: '', address: null, phone: null, notes: null, active: true });

export const DoctorDialog = ({ doctor, onClose }: { doctor?: ContractedDoctor; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContractedDoctor>(() => doctor ?? emptyDoctor());
  const set = <K extends keyof ContractedDoctor>(key: K, value: ContractedDoctor[K]) => setForm((f) => ({ ...f, [key]: value }));
  const save = useMutation({
    mutationFn: () => saveContractedDoctor(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracted-doctors'] });
      toast.success(t('careRequests.doctors.saved'));
      onClose();
    },
    onError: (e) => toast.error(errorText(e, t('common.requestFailed'))),
  });

  const field = (key: 'full_name' | 'specialty' | 'phone' | 'address', max: number, required = false) => (
    <div className="grid gap-2">
      <Label htmlFor={`doctor-${key}`}>
        {t(`careRequests.doctors.fields.${key}`)}
        {required ? ' *' : ''}
      </Label>
      <Input
        id={`doctor-${key}`}
        maxLength={max}
        value={form[key] ?? ''}
        onChange={(e) => set(key, required ? e.target.value : e.target.value || null)}
        dir={key === 'phone' ? 'ltr' : undefined}
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.full_name.trim().length < 2 || form.specialty.trim().length < 2) return void toast.error(t('careRequests.doctors.nameNeeded'));
            save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{doctor?.id ? t('careRequests.doctors.editTitle', { name: doctor.full_name }) : t('careRequests.doctors.newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {field('full_name', 150, true)}
            {field('specialty', 100, true)}
            {field('phone', 30)}
            {field('address', 300)}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="doctor-notes">{t('careRequests.doctors.fields.notes')}</Label>
              <Textarea id="doctor-notes" rows={2} maxLength={1000} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || null)} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <Checkbox checked={form.active} onCheckedChange={(v) => set('active', v === true)} />
              {t('careRequests.doctors.fields.active')}
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
