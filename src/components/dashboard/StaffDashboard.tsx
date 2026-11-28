// Home page of every workspace: the day at a glance, from the database. Each card appears only
// when the account's role has the permission it needs, so the same page serves the
// administration, doctors, nurses, dentists, psychologists and social workers.
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, CalendarClock, CalendarX, ClipboardCheck, Contact, FileStack, Stethoscope } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import AccountsOverview from '@/components/dashboard/AccountsOverview';
import MedicinesOverview from '@/pages/medicines/MedicinesOverview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { fetchAccounts } from '@/lib/accounts';
import { personLabel } from '@/lib/beneficiaries';
import { countPendingCareRequests } from '@/lib/careRequests';
import { countRequestedAppointments } from '@/lib/appointments';
import { SERVICES, SERVICE_PERMISSION } from '@/lib/consultations';
import {
  DAY_LIST_LIMIT,
  countActiveBeneficiaries,
  countDueVisits,
  countMissedAppointments,
  fetchDayAppointments,
  fetchDayConsultations,
  fetchDayDocuments,
} from '@/lib/dashboard';
import { intlLocale } from '@/lib/format';
import { today } from '@/lib/visits';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/**
 * One figure of the day, linking to the page where it can be worked on. Drawn like the key
 * figures of sonatrach.com: an outlined icon and a label underlined in the brand colour, then a
 * large number.
 */
const StatTile = ({ icon: Icon, label, value, to }: { icon: Icon; label: string; value: string; to?: string }) => {
  const body = (
    <Card className="h-full transition-colors hover:border-primary/60">
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2 border-b-2 border-primary pb-2 sm:flex-row sm:items-end sm:gap-2.5">
          <Icon className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" strokeWidth={1.6} />
          <p className="text-xs font-semibold leading-snug sm:text-[13px]">{label}</p>
        </div>
        <p className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
  return to ? (
    <Link to={to} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {body}
    </Link>
  ) : (
    body
  );
};

/** Card with a list of the day, its loading and error states. */
const DayCard = ({
  title,
  icon: Icon,
  action,
  query,
  empty,
  children,
}: {
  title: string;
  icon: Icon;
  action?: ReactNode;
  query: { isLoading: boolean; isError: boolean; error: unknown; data?: unknown[] };
  empty: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : query.isError ? (
          <p className="text-sm text-destructive">{errorText(query.error, t('dashboard.loadFailed'))}</p>
        ) : (query.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <>
            {children}
            {(query.data?.length ?? 0) >= DAY_LIST_LIMIT && (
              <p className="pt-2 text-xs text-muted-foreground">{t('dashboard.listLimited', { count: DAY_LIST_LIMIT })}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const StaffDashboard = () => {
  const { t, i18n } = useTranslation();
  const { fullName, can } = useAuth();
  const formatDate = useDateFormat();
  const number = useNumberFormat();
  const day = today();
  const time = new Intl.DateTimeFormat(intlLocale(i18n.language), { timeStyle: 'short', hourCycle: 'h23' });

  const services = SERVICES.filter((s) => can(`${SERVICE_PERMISSION[s]}.read`));
  const seesConsultations = services.length > 0;
  const seesDocuments = can('documents.read');
  const seesAppointments = can('appointments.read');
  const seesBeneficiaries = can('beneficiaries.read');
  const seesDueVisits = seesAppointments || can('visits.read');

  const consultations = useQuery({
    queryKey: ['dashboard', 'consultations', day],
    queryFn: () => fetchDayConsultations(day),
    enabled: seesConsultations,
  });
  const documents = useQuery({
    queryKey: ['dashboard', 'documents', day],
    queryFn: () => fetchDayDocuments(day),
    enabled: seesDocuments,
  });
  const appointments = useQuery({
    queryKey: ['dashboard', 'appointments', day],
    queryFn: () => fetchDayAppointments(day),
    enabled: seesAppointments,
  });
  const missed = useQuery({ queryKey: ['dashboard', 'missed'], queryFn: countMissedAppointments, enabled: seesAppointments });
  const due = useQuery({ queryKey: ['dashboard', 'due', day], queryFn: () => countDueVisits(day), enabled: seesDueVisits });
  const beneficiaries = useQuery({ queryKey: ['dashboard', 'beneficiaries'], queryFn: countActiveBeneficiaries, enabled: seesBeneficiaries });
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts, enabled: can('users.manage') });
  // Care coverage requests waiting for the administration.
  const reviewsCare = can('care_requests.review');
  const pendingCare = useQuery({ queryKey: ['dashboard', 'care-requests'], queryFn: countPendingCareRequests, enabled: reviewsCare });
  // Appointments asked for in the workers' app, waiting for a time and a doctor.
  const booksAppointments = can('appointments.write');
  const appointmentRequests = useQuery({ queryKey: ['dashboard', 'appointment-requests'], queryFn: countRequestedAppointments, enabled: booksAppointments });

  /** A figure, "…" while it loads and "—" when it could not be read. */
  const figure = (q: { isLoading: boolean; isError: boolean; data?: number }) =>
    q.isLoading ? '…' : q.isError || q.data === undefined ? '—' : number(q.data);
  const listFigure = (q: { isLoading: boolean; isError: boolean; data?: unknown[] }) =>
    figure({ ...q, data: q.data?.length }) + ((q.data?.length ?? 0) >= DAY_LIST_LIMIT ? '+' : '');

  const validDocuments = documents.data?.filter((d) => !d.cancelled_at);
  const byService = new Map<string, number>();
  for (const c of consultations.data ?? []) byService.set(c.service, (byService.get(c.service) ?? 0) + 1);

  return (
    <AppLayout title={t('dashboard.title')}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">{fullName ? t('dashboard.greeting', { name: fullName }) : t('dashboard.greetingNoName')}</h2>
          <p className="text-sm text-muted-foreground">{t('dashboard.today', { date: formatDate(day) })}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {seesConsultations && <StatTile icon={Stethoscope} label={t('dashboard.tiles.consultations')} value={listFigure(consultations)} />}
          {seesDocuments && (
            <StatTile
              icon={FileStack}
              label={t('dashboard.tiles.documents')}
              value={listFigure({ ...documents, data: validDocuments })}
              to="/documents"
            />
          )}
          {seesAppointments && (
            <StatTile
              icon={CalendarCheck}
              label={t('dashboard.tiles.appointments')}
              value={listFigure(appointments)}
              to="/visits?tab=appointments&status=scheduled"
            />
          )}
          {seesAppointments && (
            <StatTile icon={CalendarX} label={t('dashboard.tiles.missed')} value={figure(missed)} to="/visits?tab=appointments&status=missed" />
          )}
          {seesDueVisits && seesAppointments && (
            <StatTile icon={CalendarClock} label={t('dashboard.tiles.due')} value={figure(due)} to="/visits" />
          )}
          {seesBeneficiaries && (
            <StatTile icon={Contact} label={t('dashboard.tiles.beneficiaries')} value={figure(beneficiaries)} to="/beneficiaries" />
          )}
          {reviewsCare && (
            <StatTile icon={ClipboardCheck} label={t('dashboard.tiles.careRequests')} value={figure(pendingCare)} to="/care-requests?state=pending" />
          )}
          {booksAppointments && (
            <StatTile icon={CalendarClock} label={t('dashboard.tiles.appointmentRequests')} value={figure(appointmentRequests)} to="/appointments?tab=requests" />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {seesConsultations && (
            <DayCard
              title={t('dashboard.consultations.title')}
              icon={Stethoscope}
              query={consultations}
              empty={t('dashboard.consultations.empty')}
            >
              {services.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <Badge key={s} variant="secondary">
                      {t(`consultations.services.${s}`)} · {number(byService.get(s) ?? 0)}
                    </Badge>
                  ))}
                </div>
              )}
              <ul className="divide-y">
                {(consultations.data ?? []).map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0 space-y-0.5">
                      {c.beneficiary ? (
                        <Link to={`/beneficiaries/${c.beneficiary.id}?tab=consultations`} className="font-medium hover:underline">
                          {personLabel(c.beneficiary)}
                        </Link>
                      ) : (
                        <span className="font-medium">—</span>
                      )}
                      <p className="truncate text-muted-foreground">
                        {[
                          t(`consultations.services.${c.service}`),
                          c.nature ? t(`consultations.natures.${c.nature}`) : null,
                          c.author_name,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{time.format(new Date(c.created_at))}</span>
                  </li>
                ))}
              </ul>
            </DayCard>
          )}

          {seesAppointments && (
            <DayCard
              title={t('dashboard.appointments.title')}
              icon={CalendarCheck}
              query={appointments}
              empty={t('dashboard.appointments.empty')}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to="/visits?tab=appointments">{t('dashboard.appointments.open')}</Link>
                </Button>
              }
            >
              <ul className="divide-y">
                {(appointments.data ?? []).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    {a.beneficiary ? (
                      <Link to={`/beneficiaries/${a.beneficiary.id}?tab=visits`} className="font-medium hover:underline">
                        {personLabel(a.beneficiary)}
                      </Link>
                    ) : (
                      <span className="font-medium">—</span>
                    )}
                    <span className="text-muted-foreground">{t(`visits.types.${a.visit_type}`)}</span>
                  </li>
                ))}
              </ul>
            </DayCard>
          )}

          {seesDocuments && (
            <DayCard
              title={t('dashboard.documents.title')}
              icon={FileStack}
              query={documents}
              empty={t('dashboard.documents.empty')}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to="/documents">{t('dashboard.documents.open')}</Link>
                </Button>
              }
            >
              <ul className="divide-y">
                {(documents.data ?? []).map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0 space-y-0.5">
                      <Link
                        to={`/documents/${d.id}/print`}
                        className={`font-medium tabular-nums hover:underline ${d.cancelled_at ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {d.serial}
                      </Link>
                      <p className="truncate text-muted-foreground">
                        {[t(`documents.types.${d.doc_type}`), d.beneficiary ? personLabel(d.beneficiary) : null].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    {d.cancelled_at && <Badge variant="outline">{t('documents.stateCancelled')}</Badge>}
                  </li>
                ))}
              </ul>
            </DayCard>
          )}

          {can('medicines.read') && <MedicinesOverview />}
          {can('users.manage') && <AccountsOverview accounts={accounts} />}
        </div>
      </div>
    </AppLayout>
  );
};

export default StaffDashboard;
