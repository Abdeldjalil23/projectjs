// Appointments of the centre's consultations: the day's schedule with the doctor and the time,
// the requests sent from the workers' app, and booking, moving or cancelling an appointment.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Ban, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, Pencil, UserX } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PersonPicker from '@/components/shared/PersonPicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import {
  APPOINTMENT_SERVICES,
  Appointment,
  AppointmentService,
  AppointmentStatus,
  DURATIONS,
  centreParts,
  countRequestedAppointments,
  createAppointment,
  fetchAppointmentStaff,
  fetchDayAppointments,
  fetchRequestedAppointments,
  nextDay,
  scheduleAppointment,
  setAppointmentStatus,
} from '@/lib/appointments';
import { PersonRef, personLabel } from '@/lib/beneficiaries';
import { searchActiveBeneficiaries } from '@/lib/careRequests';
import { today } from '@/lib/visits';

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  requested: 'border-amber-500 bg-amber-50 text-amber-800',
  scheduled: 'border-sky-600 bg-sky-50 text-sky-800',
  done: 'border-green-600 bg-green-50 text-green-800',
  missed: 'border-red-600 bg-red-50 text-red-800',
  cancelled: 'border-zinc-400 bg-zinc-100 text-zinc-600',
};

const NO_STAFF = '__none__';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const errorText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

const endTime = (start: string, minutes: number) => {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className={`whitespace-nowrap ${STATUS_STYLE[status]}`}>
      {t(`appointments.status.${status}`)}
    </Badge>
  );
};

export const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'requests' ? 'requests' : 'planning';
  const day = DATE.test(params.get('day') ?? '') ? params.get('day')! : today();
  const service = (APPOINTMENT_SERVICES as readonly string[]).includes(params.get('service') ?? '') ? (params.get('service') as AppointmentService) : 'all';
  const canWrite = can('appointments.write');
  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };
  const requested = useQuery({ queryKey: ['appointments', 'requested-count'], queryFn: countRequestedAppointments });
  const [dialog, setDialog] = useState<{ mode: 'create' | 'schedule' | 'edit'; appointment?: Appointment } | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);

  return (
    <AppLayout title={t('appointments.title')}>
      <Tabs value={tab} onValueChange={(v) => set({ tab: v === 'requests' ? 'requests' : null })} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="planning">{t('appointments.tabs.planning')}</TabsTrigger>
            <TabsTrigger value="requests">
              {t('appointments.tabs.requests')}
              {(requested.data ?? 0) > 0 && <span className="ms-2 rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{requested.data}</span>}
            </TabsTrigger>
          </TabsList>
          {canWrite && (
            <Button onClick={() => setDialog({ mode: 'create' })}>
              <CalendarPlus className="me-2 h-4 w-4" />
              {t('appointments.new')}
            </Button>
          )}
        </div>
        <TabsContent value="planning">
          <PlanningTab
            day={day}
            service={service}
            onDay={(d) => set({ day: d === today() ? null : d })}
            onService={(s) => set({ service: s === 'all' ? null : s })}
            onEdit={(a) => setDialog({ mode: 'edit', appointment: a })}
            onCancel={setCancelling}
          />
        </TabsContent>
        <TabsContent value="requests">
          <RequestsTab onSchedule={(a) => setDialog({ mode: 'schedule', appointment: a })} onRefuse={setCancelling} />
        </TabsContent>
      </Tabs>
      {dialog && <AppointmentDialog mode={dialog.mode} appointment={dialog.appointment} defaultDay={day} onClose={() => setDialog(null)} />}
      {cancelling && <CancelDialog appointment={cancelling} onClose={() => setCancelling(null)} />}
    </AppLayout>
  );
};

const PlanningTab = ({
  day,
  service,
  onDay,
  onService,
  onEdit,
  onCancel,
}: {
  day: string;
  service: AppointmentService | 'all';
  onDay: (d: string) => void;
  onService: (s: AppointmentService | 'all') => void;
  onEdit: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
}) => {
  const { t, i18n } = useTranslation();
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const canWrite = can('appointments.write');
  const list = useQuery({ queryKey: ['appointments', 'day', day, service], queryFn: () => fetchDayAppointments(day, service) });
  const longDate = new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'en' ? 'en' : 'fr-DZ', { dateStyle: 'full' }).format(new Date(`${day}T12:00:00`));
  const mark = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'done' | 'missed' }) => setAppointmentStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    onError: (e) => toast.error(errorText(e, t('common.requestFailed'))),
  });

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onDay(nextDay(day, -1))} aria-label={t('appointments.previousDay')} title={t('appointments.previousDay')}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Input type="date" className="w-44" value={day} onChange={(e) => DATE.test(e.target.value) && onDay(e.target.value)} aria-label={t('appointments.day')} />
          <Button variant="outline" size="icon" onClick={() => onDay(nextDay(day, 1))} aria-label={t('appointments.nextDay')} title={t('appointments.nextDay')}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDay(today())} disabled={day === today()}>
            {t('appointments.today')}
          </Button>
          <Select value={service} onValueChange={(v) => onService(v as AppointmentService | 'all')}>
            <SelectTrigger className="w-48" aria-label={t('appointments.fields.service')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('appointments.allServices')}</SelectItem>
              {APPOINTMENT_SERVICES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`consultations.services.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <h2 className="font-semibold first-letter:uppercase">{longDate}</h2>

        {list.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="py-6 text-center text-sm text-destructive">{errorText(list.error, t('common.requestFailed'))}</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{t('appointments.emptyDay')}</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {list.data!.map((a) => {
              const start = a.starts_at ? centreParts(a.starts_at).time : '—';
              return (
                <li key={a.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 p-3 ${a.status === 'cancelled' ? 'opacity-60' : ''}`} data-appointment={a.id}>
                  <div className="w-24 shrink-0 font-mono text-sm tabular-nums" dir="ltr">
                    <p className="font-semibold">{start}</p>
                    <p className="text-xs text-muted-foreground">{a.starts_at ? endTime(start, a.duration_minutes) : ''}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    {a.beneficiary ? (
                      <Link to={`/beneficiaries/${a.beneficiary.id}`} className="font-medium hover:underline">
                        {personLabel(a.beneficiary)}
                      </Link>
                    ) : (
                      '—'
                    )}
                    <p className="truncate text-sm text-muted-foreground">
                      {[t(`consultations.services.${a.service}`), a.staff_name, a.reason].filter(Boolean).join(' · ')}
                    </p>
                    {a.status === 'cancelled' && a.cancel_reason && <p className="text-xs text-muted-foreground">{a.cancel_reason}</p>}
                  </div>
                  <StatusBadge status={a.status} />
                  {canWrite && a.status === 'scheduled' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => mark.mutate({ id: a.id, status: 'done' })} title={t('appointments.markDone')}>
                        <Check className="me-1 h-4 w-4" />
                        {t('appointments.markDone')}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => mark.mutate({ id: a.id, status: 'missed' })} title={t('appointments.markMissed')} aria-label={t('appointments.markMissed')}>
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onEdit(a)} title={t('appointments.edit')} aria-label={t('appointments.edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onCancel(a)} title={t('appointments.cancel')} aria-label={t('appointments.cancel')}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const RequestsTab = ({ onSchedule, onRefuse }: { onSchedule: (a: Appointment) => void; onRefuse: (a: Appointment) => void }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const formatDate = useDateFormat();
  const list = useQuery({ queryKey: ['appointments', 'requested'], queryFn: fetchRequestedAppointments });
  const canWrite = can('appointments.write');
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground">{t('appointments.requestsHint')}</p>
        {list.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="py-6 text-center text-sm text-destructive">{errorText(list.error, t('common.requestFailed'))}</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{t('appointments.noRequest')}</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {list.data!.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3" data-request={a.id}>
                <div className="min-w-0 flex-1">
                  {a.beneficiary ? (
                    <Link to={`/beneficiaries/${a.beneficiary.id}`} className="font-medium hover:underline">
                      {personLabel(a.beneficiary)}
                    </Link>
                  ) : (
                    '—'
                  )}
                  <p className="text-sm">
                    {t(`consultations.services.${a.service}`)}
                    {a.reason ? ` · ${a.reason}` : ''}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t('appointments.preferred', {
                      date: formatDate(a.preferred_date),
                      slot: a.preferred_slot ? t(`appointments.slots.${a.preferred_slot}`) : t('appointments.slots.any'),
                    })}
                    {' · '}
                    {t('appointments.askedOn', { date: formatDate(a.created_at) })}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onSchedule(a)}>
                      <CalendarPlus className="me-1 h-4 w-4" />
                      {t('appointments.schedule')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRefuse(a)}>
                      {t('appointments.refuse')}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const AppointmentDialog = ({
  mode,
  appointment,
  defaultDay,
  onClose,
}: {
  mode: 'create' | 'schedule' | 'edit';
  appointment?: Appointment;
  defaultDay: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const existing = appointment?.starts_at ? centreParts(appointment.starts_at) : null;
  const [person, setPerson] = useState<PersonRef | null>(appointment?.beneficiary ?? null);
  const [service, setService] = useState<AppointmentService>(appointment?.service ?? 'general');
  const [staffId, setStaffId] = useState(appointment?.staff_id ?? NO_STAFF);
  const [date, setDate] = useState(existing?.date ?? appointment?.preferred_date ?? (defaultDay < today() ? today() : defaultDay));
  const [time, setTime] = useState(existing?.time ?? (appointment?.preferred_slot === 'afternoon' ? '14:00' : '09:00'));
  const [duration, setDuration] = useState(String(appointment?.duration_minutes ?? 20));
  const [reason, setReason] = useState(appointment?.reason ?? '');
  const [notes, setNotes] = useState(appointment?.notes ?? '');
  const staff = useQuery({ queryKey: ['appointment-staff', service], queryFn: () => fetchAppointmentStaff(service) });

  const save = useMutation({
    mutationFn: () => {
      const input = {
        beneficiary_id: person!.id,
        service,
        date,
        time,
        duration_minutes: Number(duration),
        staff_id: staffId === NO_STAFF ? null : staffId,
        reason,
        notes,
      };
      return mode === 'create' ? createAppointment(input) : scheduleAppointment(appointment!.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'appointment-requests'] });
      toast.success(t('appointments.saved'));
      onClose();
    },
    onError: (e) => toast.error(errorText(e, t('common.requestFailed'))),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return void toast.error(t('careRequests.form.beneficiaryNeeded'));
    if (!DATE.test(date) || !/^\d{2}:\d{2}$/.test(time)) return void toast.error(t('appointments.errors.time'));
    save.mutate();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{t(`appointments.dialog.${mode}`)}</DialogTitle>
            {appointment?.source === 'app' && appointment.preferred_date && (
              <DialogDescription>{t('appointments.dialog.fromApp')}</DialogDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="ap-person">{t('appointments.fields.beneficiary')} *</Label>
              {mode === 'create' ? (
                <PersonPicker
                  id="ap-person"
                  value={person}
                  onChange={setPerson}
                  search={searchActiveBeneficiaries}
                  queryKey="appointment-beneficiaries"
                  placeholder={t('careRequests.form.beneficiaryPlaceholder')}
                  searchPlaceholder={t('careRequests.form.beneficiarySearch')}
                  empty={t('careRequests.form.beneficiaryNone')}
                  clearLabel={t('careRequests.form.beneficiaryClear')}
                />
              ) : (
                <p className="font-medium">{person ? personLabel(person) : '—'}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ap-service">{t('appointments.fields.service')}</Label>
              <Select
                value={service}
                onValueChange={(v) => {
                  setService(v as AppointmentService);
                  setStaffId(NO_STAFF);
                }}
              >
                <SelectTrigger id="ap-service">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`consultations.services.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ap-staff">{t('appointments.fields.staff')}</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger id="ap-staff">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_STAFF}>{t('appointments.anyStaff')}</SelectItem>
                  {(staff.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ap-date">{t('appointments.fields.date')} *</Label>
              <Input id="ap-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="ap-time">{t('appointments.fields.time')} *</Label>
                <Input id="ap-time" type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ap-duration">{t('appointments.fields.duration')}</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="ap-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {t('appointments.minutes', { count: d })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="ap-reason">{t('appointments.fields.reason')}</Label>
              <Input id="ap-reason" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('appointments.reasonHint')}</p>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="ap-notes">{t('appointments.fields.notes')}</Label>
              <Textarea id="ap-notes" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
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

const CancelDialog = ({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const refusing = appointment.status === 'requested';
  const save = useMutation({
    mutationFn: () => setAppointmentStatus(appointment.id, 'cancelled', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'appointment-requests'] });
      toast.success(t(refusing ? 'appointments.refused' : 'appointments.cancelled'));
      onClose();
    },
    onError: (e) => toast.error(errorText(e, t('common.requestFailed'))),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (reason.trim().length < 3) return void toast.error(t('appointments.errors.reason'));
            save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t(refusing ? 'appointments.refuseTitle' : 'appointments.cancelTitle')}</DialogTitle>
            <DialogDescription>
              {appointment.beneficiary ? personLabel(appointment.beneficiary) : ''} · {t(`consultations.services.${appointment.service}`)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="ap-cancel">{t('appointments.cancelReason')} *</Label>
            <Textarea id="ap-cancel" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t('appointments.cancelHint')}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t(refusing ? 'appointments.refuse' : 'appointments.cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentsPage;
