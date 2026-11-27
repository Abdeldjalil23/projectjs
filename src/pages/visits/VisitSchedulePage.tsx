// Schedule of the occupational health visits: workers whose visit is due, and the appointments
// given to them (scheduled, missed, done, cancelled). It shows no medical content, so the
// administration can organise the visits with the medical team.
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CalendarPlus, Pencil, Search, Stethoscope, UserX } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import BeneficiaryNumber from '@/pages/beneficiaries/BeneficiaryNumber';
import {
  APPOINTMENT_STATUSES,
  Appointment,
  AppointmentStatus,
  DueVisit,
  VISIT_TYPES,
  VisitType,
  addDays,
  createAppointments,
  fetchAppointments,
  fetchDueVisits,
  today,
  updateAppointment,
} from '@/lib/visits';

const HORIZONS = [0, 30, 60, 90, 180, 365] as const;

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  scheduled: 'border-blue-600 text-blue-700',
  missed: 'border-red-600 text-red-700',
  done: 'border-green-600 text-green-700',
  cancelled: 'border-gray-400 text-gray-500',
};

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className={STATUS_STYLE[status]}>
      {t(`visits.statuses.${status}`)}
    </Badge>
  );
};

const PersonCell = ({ id, lastName, firstName }: { id: string; lastName: string; firstName: string }) => {
  const { can } = useAuth();
  const name = `${lastName} ${firstName}`;
  return can('beneficiaries.read') ? (
    <Link to={`/beneficiaries/${id}`} className="font-medium hover:underline">
      {name}
    </Link>
  ) : (
    <span className="font-medium">{name}</span>
  );
};

// Gives an appointment to the selected workers.
const ScheduleDialog = ({ people, onClose }: { people: DueVisit[]; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(addDays(today(), 7));
  const [type, setType] = useState<VisitType>('periodic');
  const [notes, setNotes] = useState('');
  const save = useMutation({
    mutationFn: () => createAppointments(people.map((p) => p.beneficiary_id), date, type, notes.trim() || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits-due'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(t('visits.schedule.scheduled', { count: people.length }));
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!date || date < today()) return void toast.error(t('visits.schedule.dateFuture'));
            save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('visits.schedule.dialogTitle', { count: people.length })}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">{people.map((p) => `${p.last_name} ${p.first_name}`).join(', ')}</p>
            <div className="grid gap-2">
              <Label htmlFor="schedule-date">{t('visits.schedule.date')}</Label>
              <Input id="schedule-date" type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule-type">{t('visits.type')}</Label>
              <Select value={type} onValueChange={(v) => setType(v as VisitType)}>
                <SelectTrigger id="schedule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_TYPES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {t(`visits.types.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule-notes">{t('visits.notes')}</Label>
              <Textarea id="schedule-notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t('visits.schedule.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Changes the date, status, reminder or notes of an appointment.
const AppointmentDialog = ({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(appointment.scheduled_on);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [reminder, setReminder] = useState(appointment.reminder_on ?? '');
  const [notes, setNotes] = useState(appointment.notes ?? '');
  const choices = APPOINTMENT_STATUSES.filter((s) => s !== 'done' || appointment.status === 'done');
  const save = useMutation({
    mutationFn: () =>
      updateAppointment(appointment.id, {
        scheduled_on: date,
        status,
        reminder_on: reminder || null,
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['visits-due'] });
      toast.success(t('visits.schedule.updated'));
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!date) return void toast.error(t('visits.schedule.dateFuture'));
            save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {appointment.beneficiary ? `${appointment.beneficiary.last_name} ${appointment.beneficiary.first_name}` : t('visits.schedule.appointment')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="appointment-date">{t('visits.schedule.date')}</Label>
              <Input id="appointment-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointment-status">{t('visits.schedule.status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)} disabled={appointment.status === 'done'}>
                <SelectTrigger id="appointment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {choices.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`visits.statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointment-reminder">{t('visits.schedule.reminder')}</Label>
              <Input id="appointment-reminder" type="date" value={reminder} onChange={(e) => setReminder(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="appointment-notes">{t('visits.notes')}</Label>
              <Textarea id="appointment-notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
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

const DueList = () => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const formatDate = useDateFormat();
  const [horizon, setHorizon] = useState<number>(30);
  const [includeNever, setIncludeNever] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scheduling, setScheduling] = useState(false);
  const canWrite = can('appointments.write');
  const until = addDays(today(), horizon);
  const due = useQuery({
    queryKey: ['visits-due', until, includeNever, search.trim()],
    queryFn: () => fetchDueVisits(until, includeNever, search),
  });
  const rows = due.data ?? [];
  const selectable = rows.filter((r) => !r.appointment_id);
  const chosen = rows.filter((r) => selected.has(r.beneficiary_id) && !r.appointment_id);
  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="due-horizon">{t('visits.due.horizon')}</Label>
            <Select value={String(horizon)} onValueChange={(v) => setHorizon(Number(v))}>
              <SelectTrigger id="due-horizon" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORIZONS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h === 0 ? t('visits.due.overdue') : t('visits.due.within', { count: h })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="ps-9" placeholder={t('visits.due.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Checkbox id="due-never" checked={includeNever} onCheckedChange={(v) => setIncludeNever(v === true)} />
            <Label htmlFor="due-never">{t('visits.due.includeNever')}</Label>
          </div>
          {canWrite && (
            <Button disabled={chosen.length === 0} onClick={() => setScheduling(true)}>
              <CalendarPlus className="me-2 h-4 w-4" />
              {t('visits.due.schedule', { count: chosen.length })}
            </Button>
          )}
        </div>

        {due.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : due.isError ? (
          <p className="py-6 text-center text-sm text-destructive">{due.error instanceof Error ? due.error.message : t('common.requestFailed')}</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('visits.due.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {canWrite && (
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label={t('visits.due.selectAll')}
                        checked={selectable.length > 0 && selectable.every((r) => selected.has(r.beneficiary_id))}
                        onCheckedChange={(v) => setSelected(v === true ? new Set(selectable.map((r) => r.beneficiary_id)) : new Set())}
                      />
                    </TableHead>
                  )}
                  <TableHead>{t('beneficiaries.columns.number')}</TableHead>
                  <TableHead>{t('visits.due.person')}</TableHead>
                  <TableHead>{t('visits.due.workplace')}</TableHead>
                  <TableHead>{t('visits.due.lastVisit')}</TableHead>
                  <TableHead>{t('visits.due.dueOn')}</TableHead>
                  <TableHead>{t('visits.schedule.appointment')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.beneficiary_id} data-person={r.beneficiary_id}>
                    {canWrite && (
                      <TableCell>
                        <Checkbox
                          aria-label={`${r.last_name} ${r.first_name}`}
                          disabled={Boolean(r.appointment_id)}
                          checked={selected.has(r.beneficiary_id) && !r.appointment_id}
                          onCheckedChange={(v) => toggle(r.beneficiary_id, v === true)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">
                      <BeneficiaryNumber beneficiary={r} />
                    </TableCell>
                    <TableCell>
                      <PersonCell id={r.beneficiary_id} lastName={r.last_name} firstName={r.first_name} />
                    </TableCell>
                    <TableCell className="text-sm">{[r.company, r.unit].filter(Boolean).join(' · ') || '—'}</TableCell>
                    <TableCell className="text-sm">
                      {r.last_visit_on ? `${formatDate(r.last_visit_on)} · ${t(`visits.types.${r.last_visit_type}`)}` : t('visits.due.never')}
                    </TableCell>
                    <TableCell className={`text-sm ${r.due_on && r.due_on < today() ? 'font-semibold text-red-700' : ''}`}>
                      {r.due_on ? formatDate(r.due_on) : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.appointment_id && r.appointment_status ? (
                        <span className="flex items-center gap-2">
                          {formatDate(r.appointment_on)} <StatusBadge status={r.appointment_status} />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t('visits.due.notScheduled')}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {scheduling && (
        <ScheduleDialog
          people={chosen}
          onClose={() => {
            setScheduling(false);
            setSelected(new Set());
          }}
        />
      )}
    </Card>
  );
};

const AppointmentList = ({ status, onStatus }: { status: AppointmentStatus | 'all'; onStatus: (s: AppointmentStatus | 'all') => void }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const formatDate = useDateFormat();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Appointment | null>(null);
  const canWrite = can('appointments.write');
  const canVisit = can('visits.write');
  const list = useQuery({ queryKey: ['appointments', status], queryFn: () => fetchAppointments(status) });
  const missed = useMutation({
    mutationFn: (a: Appointment) => updateAppointment(a.id, { status: 'missed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['visits-due'] });
      toast.success(t('visits.schedule.updated'));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const rows = useMemo(() => {
    const words = search.trim().toLowerCase();
    return (list.data ?? []).filter((a) => {
      if (!words) return true;
      const b = a.beneficiary;
      return `${b?.external_id ?? ''} ${b?.last_name ?? ''} ${b?.first_name ?? ''}`.toLowerCase().includes(words);
    });
  }, [list.data, search]);
  const now = today();

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="appointments-status">{t('visits.schedule.status')}</Label>
            <Select value={status} onValueChange={(v) => onStatus(v as AppointmentStatus | 'all')}>
              <SelectTrigger id="appointments-status" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`visits.statuses.${s}`)}
                  </SelectItem>
                ))}
                <SelectItem value="all">{t('visits.schedule.allStatuses')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="ps-9" placeholder={t('visits.due.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {list.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="py-6 text-center text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('visits.schedule.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('visits.schedule.date')}</TableHead>
                  <TableHead>{t('beneficiaries.columns.number')}</TableHead>
                  <TableHead>{t('visits.due.person')}</TableHead>
                  <TableHead>{t('visits.due.workplace')}</TableHead>
                  <TableHead>{t('visits.type')}</TableHead>
                  <TableHead>{t('visits.schedule.status')}</TableHead>
                  <TableHead>{t('visits.schedule.reminder')}</TableHead>
                  <TableHead>
                    <span className="sr-only">{t('common.actions')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => {
                  const late = a.status === 'scheduled' && a.scheduled_on < now;
                  return (
                    <TableRow key={a.id} data-appointment={a.id}>
                      <TableCell className={`text-sm ${late ? 'font-semibold text-red-700' : ''}`}>{formatDate(a.scheduled_on)}</TableCell>
                      <TableCell className="font-mono text-sm">{a.beneficiary ? <BeneficiaryNumber beneficiary={a.beneficiary} /> : '—'}</TableCell>
                      <TableCell>
                        {a.beneficiary ? <PersonCell id={a.beneficiary.id} lastName={a.beneficiary.last_name} firstName={a.beneficiary.first_name} /> : '—'}
                      </TableCell>
                      <TableCell className="text-sm">{[a.beneficiary?.company, a.beneficiary?.unit].filter(Boolean).join(' · ') || '—'}</TableCell>
                      <TableCell className="text-sm">{t(`visits.types.${a.visit_type}`)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(a.reminder_on)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {canVisit && (a.status === 'scheduled' || a.status === 'missed') && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/beneficiaries/${a.beneficiary_id}?tab=visits`}>
                                <Stethoscope className="me-2 h-4 w-4" />
                                {t('visits.schedule.record')}
                              </Link>
                            </Button>
                          )}
                          {canWrite && late && (
                            <Button variant="ghost" size="sm" onClick={() => missed.mutate(a)} disabled={missed.isPending}>
                              <UserX className="me-2 h-4 w-4" />
                              {t('visits.schedule.markMissed')}
                            </Button>
                          )}
                          {canWrite && a.status !== 'done' && (
                            <Button variant="ghost" size="icon" aria-label={t('visits.schedule.edit')} onClick={() => setEditing(a)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {editing && <AppointmentDialog appointment={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
};

export const VisitSchedulePage = () => {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'appointments' ? 'appointments' : 'due';
  const raw = params.get('status');
  const status: AppointmentStatus | 'all' = raw === 'all' || APPOINTMENT_STATUSES.includes(raw as AppointmentStatus) ? (raw as AppointmentStatus | 'all') : 'scheduled';

  return (
    <AppLayout title={t('visits.schedule.title')}>
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'appointments' ? { tab: v, status } : { tab: v }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="due">{t('visits.due.tab')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('visits.schedule.tab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="due" className="mt-4">
          <DueList />
        </TabsContent>
        <TabsContent value="appointments" className="mt-4">
          <AppointmentList status={status} onStatus={(s) => setParams({ tab: 'appointments', status: s }, { replace: true })} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default VisitSchedulePage;
