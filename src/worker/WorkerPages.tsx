// The other pages of the workers' app: home, contracted doctors, appointments, notifications and
// contacts of the centre.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Bell, CalendarCheck, ClipboardList, Download, FileCheck2, LogOut, MapPin, Phone, Plus, Search, Share, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDateFormat } from '@/hooks/useDateFormat';
import { intlLocale } from '@/lib/format';
import {
  WorkerNotification,
  fetchWorkerAppointments,
  fetchWorkerContacts,
  fetchWorkerDoctors,
  fetchWorkerNotifications,
  fetchWorkerRequests,
  markWorkerNotificationsRead,
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

export const WorkerAppointmentsPage = () => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const appointments = useQuery({ queryKey: ['worker', 'appointments'], queryFn: fetchWorkerAppointments });
  return (
    <WorkerLayout title={t('worker.nav.appointments')} back="/app">
      <SectionTitle>{t('worker.appointments.title')}</SectionTitle>
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
            <Card key={a.id} className={a.status === 'missed' ? 'border-red-300' : ''}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-md bg-secondary py-2 text-secondary-foreground">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{formatDate(a.scheduled_on)}</p>
                  <p className="text-sm">{t(`reports.visitTypes.${a.visit_type}`)}</p>
                  <p className="text-xs text-muted-foreground">{a.beneficiary_name}</p>
                </div>
                <span className={`text-xs font-semibold ${a.status === 'missed' ? 'text-red-700' : a.status === 'done' ? 'text-muted-foreground' : 'text-green-700'}`}>
                  {t(`worker.appointments.status.${a.status}`)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
};

const notificationText = (n: WorkerNotification, t: TFunction, formatDate: (v?: string | null) => string) =>
  t(`worker.notifications.kinds.${n.kind}`, {
    number: n.data.number ?? '',
    prestation: n.data.prestation ?? '',
    reason: n.data.reason ?? '',
    date: formatDate(n.data.valid_until),
    name: n.data.beneficiary ?? '',
  });

export const WorkerNotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const formatDate = useDateFormat();
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ['worker', 'notifications'], queryFn: fetchWorkerNotifications });
  const time = new Intl.DateTimeFormat(intlLocale(i18n.language), { dateStyle: 'medium', timeStyle: 'short' });
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
            <Link key={n.id} to={n.data.request_id ? `/app/requests/${n.data.request_id}` : '/app/requests'} className="block">
              <Card className={n.read_at ? '' : 'border-primary bg-secondary/60'}>
                <CardContent className="space-y-1 p-4">
                  <p className="text-sm">{notificationText(n, t, formatDate)}</p>
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
