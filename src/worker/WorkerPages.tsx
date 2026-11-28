// The other pages of the workers' app: home, contracted doctors, appointments, notifications and
// contacts of the centre.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Bell, CalendarCheck, ClipboardList, Download, FileCheck2, LogOut, MapPin, Phone, Plus, Search, Share, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDateFormat } from '@/hooks/useDateFormat';
import { intlLocale } from '@/lib/format';
import {
  WorkerAppointment,
  WorkerNotification,
  cancelWorkerAppointment,
  fetchWorkerAppointments,
  fetchWorkerContacts,
  fetchWorkerDoctors,
  fetchWorkerNotifications,
  fetchWorkerRequests,
  markWorkerNotificationsRead,
  requestWorkerAppointment,
} from '@/lib/worker';
import { useInstallPrompt } from './pwa';
import { useWorkerAuth } from './WorkerAuth';
import WorkerLayout, { SectionTitle } from './WorkerLayout';
import { StateBadge } from './WorkerRequests';

const Loading = () => {
  const { t } = useTranslation();
  return <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>;
};

const Failed = ({ error }: { error: unknown }) => {
  const { t } = useTranslation();
  return <p className="py-8 text-center text-sm text-destructive">{error instanceof Error ? error.message : t('common.requestFailed')}</p>;
};

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>
);

export const WorkerHome = () => {
  const { t } = useTranslation();
  const { profile, signOut } = useWorkerAuth();
  const install = useInstallPrompt();
  const requests = useQuery({ queryKey: ['worker', 'requests'], queryFn: fetchWorkerRequests });
  const valid = (requests.data ?? []).filter((r) => r.state === 'approved').length;
  const pending = (requests.data ?? []).filter((r) => r.state === 'pending').length;
  const latest = (requests.data ?? []).slice(0, 3);

  const tiles = [
    { to: '/app/requests/new', icon: Plus, label: t('worker.home.newRequest'), strong: true },
    { to: '/app/requests', icon: ClipboardList, label: t('worker.nav.requests'), count: pending },
    { to: '/app/documents', icon: FileCheck2, label: t('worker.nav.documents'), count: valid },
    { to: '/app/doctors', icon: Stethoscope, label: t('worker.home.findDoctor') },
    { to: '/app/appointments', icon: CalendarCheck, label: t('worker.nav.appointments') },
    { to: '/app/notifications', icon: Bell, label: t('worker.nav.notifications') },
  ];

  return (
    <WorkerLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">{t('worker.home.hello')}</p>
          <h1 className="text-xl font-bold">
            {profile?.me.first_name} {profile?.me.last_name}
          </h1>
          <p className="font-mono text-xs text-muted-foreground" dir="ltr">
            {profile?.me.external_id}
          </p>
        </div>

        {(install.canInstall || install.showIosHint) && (
          <Card className="border-primary/50 bg-secondary">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              {install.canInstall ? <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> : <Share className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
              <div className="flex-1 space-y-2">
                <p className="font-semibold">{t('worker.install.title')}</p>
                <p className="text-muted-foreground">{install.canInstall ? t('worker.install.text') : t('worker.install.ios')}</p>
                {install.canInstall && (
                  <Button size="sm" onClick={() => void install.install()}>
                    {t('worker.install.button')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ to, icon: Icon, label, count, strong }) => (
            <Link key={to} to={to} className="block">
              <Card className={`h-full transition-colors hover:border-primary/60 ${strong ? 'border-primary bg-primary text-primary-foreground' : ''}`}>
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between">
                    <Icon className={`h-7 w-7 ${strong ? '' : 'text-primary'}`} strokeWidth={1.6} />
                    {count ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{count}</span> : null}
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${strong ? '' : 'border-b-2 border-primary pb-1'}`}>{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {latest.length > 0 && (
          <section>
            <SectionTitle>{t('worker.home.latest')}</SectionTitle>
            <div className="divide-y rounded-md border bg-card">
              {latest.map((r) => (
                <Link key={r.id} to={`/app/requests/${r.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.prestation}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.beneficiary_name}</p>
                  </div>
                  <StateBadge state={r.state} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {(profile?.family.length ?? 0) > 0 && (
          <section>
            <SectionTitle>{t('worker.home.family')}</SectionTitle>
            <p className="text-sm text-muted-foreground">{profile!.family.map((p) => p.first_name).join(' · ')}</p>
          </section>
        )}

        <Button variant="outline" className="w-full" onClick={() => void signOut()}>
          <LogOut className="me-2 h-4 w-4 rtl:-scale-x-100" />
          {t('nav.signOut')}
        </Button>
      </div>
    </WorkerLayout>
  );
};

export const WorkerDoctorsPage = () => {
  const { t } = useTranslation();
  const doctors = useQuery({ queryKey: ['worker', 'doctors'], queryFn: fetchWorkerDoctors });
  const [search, setSearch] = useState('');
  const rows = useMemo(() => {
    const words = search.trim().toLowerCase();
    return (doctors.data ?? []).filter((d) => !words || [d.full_name, d.specialty, d.address].some((v) => v?.toLowerCase().includes(words)));
  }, [doctors.data, search]);

  return (
    <WorkerLayout title={t('worker.nav.doctors')}>
      <SectionTitle>{t('worker.doctors.title')}</SectionTitle>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-12 ps-9" placeholder={t('worker.doctors.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {doctors.isLoading ? (
        <Loading />
      ) : doctors.isError ? (
        <Failed error={doctors.error} />
      ) : rows.length === 0 ? (
        <Empty>{t('worker.doctors.empty')}</Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((d) => (
            <Card key={d.id}>
              <CardContent className="space-y-1.5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">{d.specialty}</p>
                <p className="font-semibold">{d.full_name}</p>
                {d.address && (
                  <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {d.address}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {d.phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${d.phone.replace(/\s/g, '')}`} dir="ltr">
                        <Phone className="me-1 h-4 w-4" />
                        {d.phone}
                      </a>
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link to="/app/requests/new">{t('worker.doctors.request')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
};

const SERVICES = ['general', 'dental', 'psychology', 'nursing'] as const;

/** Day and time at the centre (Algeria keeps UTC+1). */
const useCentreTime = () => {
  const { i18n } = useTranslation();
  const format = new Intl.DateTimeFormat(intlLocale(i18n.language), { dateStyle: 'full', timeStyle: 'short', hourCycle: 'h23', timeZone: 'Africa/Algiers' });
  return (iso: string | null | undefined) => (iso ? format.format(new Date(iso)) : '—');
};

const STATUS_COLOR: Record<WorkerAppointment['status'], string> = {
  requested: 'text-amber-700',
  scheduled: 'text-green-700',
  missed: 'text-red-700',
  done: 'text-muted-foreground',
  cancelled: 'text-muted-foreground',
};

export const WorkerAppointmentsPage = () => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const centreTime = useCentreTime();
  const queryClient = useQueryClient();
  const [asking, setAsking] = useState(false);
  const appointments = useQuery({ queryKey: ['worker', 'appointments'], queryFn: fetchWorkerAppointments });
  const cancel = useMutation({
    mutationFn: cancelWorkerAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'appointments'] });
      toast.success(t('worker.appointments.cancelled'));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  return (
    <WorkerLayout title={t('worker.nav.appointments')} back="/app">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle>{t('worker.appointments.title')}</SectionTitle>
        {!asking && (
          <Button onClick={() => setAsking(true)}>
            <Plus className="me-1 h-4 w-4" />
            {t('worker.appointments.ask')}
          </Button>
        )}
      </div>
      {asking ? (
        <AppointmentRequestForm onDone={() => setAsking(false)} />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{t('worker.appointments.hint')}</p>
          {appointments.isLoading ? (
            <Loading />
          ) : appointments.isError ? (
            <Failed error={appointments.error} />
          ) : (appointments.data ?? []).length === 0 ? (
            <Empty>{t('worker.appointments.empty')}</Empty>
          ) : (
            <div className="space-y-3">
              {appointments.data!.map((a) => (
                <Card key={a.id} className={a.status === 'missed' ? 'border-red-300' : a.status === 'cancelled' ? 'opacity-70' : ''} data-appointment={a.id}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold first-letter:uppercase">
                          {a.kind === 'visit'
                            ? formatDate(a.scheduled_on)
                            : a.starts_at
                              ? centreTime(a.starts_at)
                              : t('worker.appointments.preferred', {
                                  date: formatDate(a.preferred_date),
                                  slot: a.preferred_slot ? t(`appointments.slots.${a.preferred_slot}`) : t('appointments.slots.any'),
                                })}
                        </p>
                        <p className="text-sm">
                          {a.kind === 'visit' ? t(`reports.visitTypes.${a.visit_type}`) : t(`consultations.services.${a.service}`)}
                          {a.staff_name ? ` · ${a.staff_name}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.beneficiary_name}
                          {a.reason ? ` · ${a.reason}` : ''}
                        </p>
                        {a.status === 'cancelled' && a.cancel_reason && <p className="text-xs text-muted-foreground">{a.cancel_reason}</p>}
                      </div>
                      <span className={`shrink-0 text-xs font-semibold ${STATUS_COLOR[a.status]}`}>{t(`worker.appointments.status.${a.status}`)}</span>
                    </div>
                    {a.can_cancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={cancel.isPending}
                        onClick={() => window.confirm(t('worker.appointments.confirmCancel')) && cancel.mutate(a.id)}
                      >
                        {t('worker.appointments.cancel')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </WorkerLayout>
  );
};

const AppointmentRequestForm = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation();
  const { profile } = useWorkerAuth();
  const queryClient = useQueryClient();
  const people = profile ? [profile.me, ...profile.family] : [];
  const tomorrow = (() => {
    const d = new Date(Date.now() + 86_400_000 + 3_600_000);
    return d.toISOString().slice(0, 10);
  })();
  const [person, setPerson] = useState(profile?.me.id ?? '');
  const [service, setService] = useState<string>('general');
  const [date, setDate] = useState(tomorrow);
  const [slot, setSlot] = useState<'morning' | 'afternoon' | 'any'>('morning');
  const [reason, setReason] = useState('');
  const save = useMutation({
    mutationFn: () => requestWorkerAppointment({ beneficiary_id: person, service, preferred_date: date, slot: slot === 'any' ? null : slot, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'appointments'] });
      toast.success(t('worker.appointments.sent'));
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!person || !date) return;
        save.mutate();
      }}
    >
      <p className="text-sm text-muted-foreground">{t('worker.appointments.askHint')}</p>
      <div className="grid gap-2">
        <Label htmlFor="ap-person">{t('worker.requests.for')}</Label>
        <Select value={person} onValueChange={setPerson}>
          <SelectTrigger id="ap-person" className="h-12">
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
        <Label htmlFor="ap-service">{t('worker.appointments.service')}</Label>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger id="ap-service" className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`consultations.services.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="ap-date">{t('worker.appointments.day')}</Label>
          <Input id="ap-date" type="date" className="h-12" min={tomorrow} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ap-slot">{t('worker.appointments.slot')}</Label>
          <Select value={slot} onValueChange={(v) => setSlot(v as typeof slot)}>
            <SelectTrigger id="ap-slot" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['morning', 'afternoon', 'any'] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`appointments.slots.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ap-reason">{t('worker.appointments.reason')}</Label>
        <Input id="ap-reason" className="h-12" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        <p className="text-xs text-muted-foreground">{t('worker.appointments.reasonHint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" className="h-12" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="h-12" disabled={save.isPending}>
          {save.isPending ? t('common.saving') : t('worker.appointments.send')}
        </Button>
      </div>
    </form>
  );
};

const notificationText = (n: WorkerNotification, t: TFunction, formatDate: (v?: string | null) => string, locale: string) =>
  t(`worker.notifications.kinds.${n.kind}`, {
    number: n.data.number ?? '',
    prestation: n.data.prestation ?? '',
    reason: n.data.reason ?? '',
    date: formatDate(n.data.valid_until),
    name: n.data.beneficiary ?? '',
    service: n.data.service ? t(`consultations.services.${n.data.service}`) : '',
    when: n.data.starts_at ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23', timeZone: 'Africa/Algiers' }).format(new Date(n.data.starts_at)) : '',
    staff: n.data.staff ? ` — ${n.data.staff}` : '',
  });

export const WorkerNotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const formatDate = useDateFormat();
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ['worker', 'notifications'], queryFn: fetchWorkerNotifications });
  const time = new Intl.DateTimeFormat(intlLocale(i18n.language), { dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' });
  const hasUnread = (notifications.data ?? []).some((n) => !n.read_at);

  // Opening the page marks the notifications as read (the highlight stays until the next visit).
  useEffect(() => {
    if (!hasUnread) return;
    markWorkerNotificationsRead()
      .then(() => setTimeout(() => queryClient.invalidateQueries({ queryKey: ['worker', 'notifications'] }), 4000))
      .catch(() => undefined);
  }, [hasUnread, queryClient]);

  return (
    <WorkerLayout title={t('worker.nav.notifications')} back="/app">
      <SectionTitle>{t('worker.notifications.title')}</SectionTitle>
      {notifications.isLoading ? (
        <Loading />
      ) : notifications.isError ? (
        <Failed error={notifications.error} />
      ) : (notifications.data ?? []).length === 0 ? (
        <Empty>{t('worker.notifications.empty')}</Empty>
      ) : (
        <div className="space-y-2">
          {notifications.data!.map((n) => (
            <Link
              key={n.id}
              to={n.kind.startsWith('appointment_') ? '/app/appointments' : n.data.request_id ? `/app/requests/${n.data.request_id}` : '/app/requests'}
              className="block"
            >
              <Card className={n.read_at ? '' : 'border-primary bg-secondary/60'}>
                <CardContent className="space-y-1 p-4">
                  <p className="text-sm">{notificationText(n, t, formatDate, intlLocale(i18n.language))}</p>
                  <p className="text-xs text-muted-foreground">{time.format(new Date(n.created_at))}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
};

export const WorkerContactsPage = () => {
  const { t } = useTranslation();
  const contacts = useQuery({ queryKey: ['worker', 'contacts'], queryFn: fetchWorkerContacts });
  return (
    <WorkerLayout title={t('worker.nav.contacts')}>
      <SectionTitle>{t('worker.contacts.title')}</SectionTitle>
      {contacts.isLoading ? (
        <Loading />
      ) : contacts.isError ? (
        <Failed error={contacts.error} />
      ) : (
        <div className="space-y-5">
          {(contacts.data?.centre.length ?? 0) > 0 && (
            <Card>
              <CardContent className="p-4 text-sm">
                {contacts.data!.centre.map((line, i) => (
                  <p key={i} className={i === 0 ? 'font-bold uppercase' : 'text-muted-foreground'}>
                    {line}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
          {(contacts.data?.contacts.length ?? 0) === 0 ? (
            <Empty>{t('worker.contacts.empty')}</Empty>
          ) : (
            <div className="space-y-3">
              {contacts.data!.contacts.map((c, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{c.label}</p>
                      {c.hours && <p className="text-xs text-muted-foreground">{c.hours}</p>}
                    </div>
                    {c.phone && (
                      <Button asChild>
                        <a href={`tel:${c.phone.replace(/\s/g, '')}`} dir="ltr">
                          <Phone className="me-1 h-4 w-4" />
                          {c.phone}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Card className="border-dashed">
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-semibold">{t('worker.contacts.assistanceTitle')}</p>
              <p className="text-muted-foreground">{t('worker.contacts.assistance')}</p>
              <p className="text-muted-foreground">{t('worker.contacts.emergency')}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </WorkerLayout>
  );
};
