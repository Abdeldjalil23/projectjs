// The consultations of the centre in one place, for every service the account works in (general
// medicine, nursing, dental care, psychology): today's booked appointments with a button that
// starts the consultation, a new consultation for anyone, and the register of the consultations
// between two days. The database only returns the services the account may read.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CalendarClock, FolderOpen, Plus, Search, Stethoscope } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PersonPicker from '@/components/shared/PersonPicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useDebounced } from '@/hooks/useDebounced';
import { PersonRef, fetchBeneficiary, personLabel } from '@/lib/beneficiaries';
import {
  Consultation,
  REGISTER_LIMIT,
  RegisterConsultation,
  SERVICES,
  SERVICE_PERMISSION,
  Service,
  fetchConsultationRegister,
} from '@/lib/consultations';
import { Appointment, centreParts, fetchDayAppointments, setAppointmentStatus } from '@/lib/appointments';
import { searchActiveBeneficiaries } from '@/lib/careRequests';
import { addDays, today } from '@/lib/visits';
import ConsultationDialog from '@/pages/patient/ConsultationDialog';
import DocumentDialog from '@/pages/documents/DocumentDialog';

interface OpenConsultation {
  person: PersonRef;
  service: Service;
  consultation?: Consultation;
  initial?: Partial<Consultation>;
  /** The appointment the consultation follows: marked as done once it is saved. */
  appointmentId?: string;
}

/** The document form needs the person's workplace: it is read before the form opens. */
const IssueDocument = ({ consultation, onClose }: { consultation: Consultation; onClose: () => void }) => {
  const { t } = useTranslation();
  const person = useQuery({ queryKey: ['beneficiary', consultation.beneficiary_id], queryFn: () => fetchBeneficiary(consultation.beneficiary_id) });
  if (person.isLoading) return null;
  if (person.isError) {
    toast.error(person.error instanceof Error ? person.error.message : t('common.requestFailed'));
    onClose();
    return null;
  }
  return (
    <DocumentDialog
      beneficiaryId={consultation.beneficiary_id}
      workplace={[person.data?.company, person.data?.unit].filter(Boolean).join(' — ')}
      consultation={consultation}
      onClose={onClose}
    />
  );
};

export const ConsultationsPage = () => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const formatDate = useDateFormat();
  const queryClient = useQueryClient();
  const day = today();

  const readable = SERVICES.filter((s) => can(`${SERVICE_PERMISSION[s]}.read`));
  const writable = SERVICES.filter((s) => can(`${SERVICE_PERMISSION[s]}.write`));

  const [from, setFrom] = useState(day);
  const [to, setTo] = useState(day);
  const [service, setService] = useState<Service | 'all'>(readable.length === 1 ? readable[0] : 'all');
  const [search, setSearch] = useState('');
  const words = useDebounced(search.trim());

  const register = useQuery({
    queryKey: ['consultation-register', from, to, service, words],
    queryFn: () => fetchConsultationRegister({ from, to, service, search: words }),
    enabled: Boolean(from && to && from <= to),
  });

  // Today's booked appointments of the services the account writes, by time.
  const seesAppointments = can('appointments.read') && writable.length > 0;
  const appointments = useQuery({
    queryKey: ['appointments', 'day', day, 'all'],
    queryFn: () => fetchDayAppointments(day, 'all'),
    enabled: seesAppointments,
  });
  const waiting = useMemo(
    () => (appointments.data ?? []).filter((a) => a.status === 'scheduled' && (writable as string[]).includes(a.service)),
    [appointments.data, writable],
  );

  const [open, setOpen] = useState<OpenConsultation | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [issuing, setIssuing] = useState<Consultation | null>(null);

  const markDone = useMutation({
    mutationFn: (id: string) => setAppointmentStatus(id, 'done'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const start = (a: Appointment) => {
    if (!a.beneficiary) return;
    setOpen({ person: a.beneficiary, service: a.service, initial: { reason: a.reason }, appointmentId: a.id });
  };

  const setRange = (days: number) => {
    setFrom(addDays(day, -days));
    setTo(day);
  };

  return (
    <AppLayout title={t('consultationsPage.title')}>
      <div className="space-y-6">
        {seesAppointments && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-primary" />
                {t('consultationsPage.waitingTitle')}
              </CardTitle>
              <Badge variant="secondary">{waiting.length}</Badge>
            </CardHeader>
            <CardContent>
              {appointments.isLoading ? (
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              ) : appointments.isError ? (
                <p className="text-sm text-destructive">{appointments.error instanceof Error ? appointments.error.message : t('common.requestFailed')}</p>
              ) : waiting.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('consultationsPage.noWaiting')}</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {waiting.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-3 p-3">
                      <span className="w-14 font-heading text-lg font-semibold tabular-nums" dir="ltr">
                        {a.starts_at ? centreParts(a.starts_at).time : '—'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{a.beneficiary ? personLabel(a.beneficiary) : '—'}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {t(`consultations.services.${a.service}`)}
                          {a.staff_name ? ` — ${a.staff_name}` : ''}
                          {a.reason ? ` · ${a.reason}` : ''}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => start(a)} disabled={!a.beneficiary}>
                        <Stethoscope className="me-2 h-4 w-4" />
                        {t('consultationsPage.start')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid gap-2">
                <Label htmlFor="register-from">{t('consultationsPage.from')}</Label>
                <Input id="register-from" type="date" className="w-40" max={to} value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-to">{t('consultationsPage.to')}</Label>
                <Input id="register-to" type="date" className="w-40" min={from} max={day} value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRange(0)}>
                  {t('consultationsPage.today')}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setRange(6)}>
                  {t('consultationsPage.week')}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setRange(29)}>
                  {t('consultationsPage.month')}
                </Button>
              </div>
              {readable.length > 1 && (
                <div className="grid gap-2">
                  <Label htmlFor="register-service">{t('consultations.service')}</Label>
                  <Select value={service} onValueChange={(v) => setService(v as Service | 'all')}>
                    <SelectTrigger id="register-service" className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('consultationsPage.allServices')}</SelectItem>
                      {readable.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`consultations.services.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="ps-9" placeholder={t('consultationsPage.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {writable.length > 0 && (
                <Button onClick={() => setChoosing(true)}>
                  <Plus className="me-2 h-4 w-4" />
                  {t('consultations.new')}
                </Button>
              )}
            </div>

            {from > to ? (
              <p className="py-6 text-center text-sm text-destructive">{t('consultationsPage.badRange')}</p>
            ) : register.isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : register.isError ? (
              <p className="py-6 text-center text-sm text-destructive">{register.error instanceof Error ? register.error.message : t('common.requestFailed')}</p>
            ) : (register.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('consultationsPage.empty')}</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('consultations.fields.date')}</TableHead>
                        <TableHead>{t('consultationsPage.patient')}</TableHead>
                        <TableHead>{t('consultations.service')}</TableHead>
                        <TableHead>{t('consultations.fields.nature')}</TableHead>
                        <TableHead>{t('consultations.fields.reason')}</TableHead>
                        <TableHead>{t('consultations.author')}</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {register.data!.map((c: RegisterConsultation) => (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer"
                          onClick={() => c.beneficiary && setOpen({ person: c.beneficiary, service: c.service, consultation: c })}
                        >
                          <TableCell className="whitespace-nowrap">{formatDate(c.consultation_date)}</TableCell>
                          <TableCell className="font-medium">{c.beneficiary ? personLabel(c.beneficiary) : '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{t(`consultations.services.${c.service}`)}</Badge>
                          </TableCell>
                          <TableCell>{c.nature ? t(`consultations.natures.${c.nature}`) : '—'}</TableCell>
                          <TableCell className="max-w-[240px] truncate" title={c.reason ?? ''}>
                            {c.reason || '—'}
                          </TableCell>
                          <TableCell>{c.author_name || '—'}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {c.beneficiary && (
                              <Button asChild variant="ghost" size="icon" title={t('consultationsPage.openFile')}>
                                <Link to={`/beneficiaries/${c.beneficiary.id}?tab=consultations`} aria-label={t('consultationsPage.openFile')}>
                                  <FolderOpen className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {register.data!.length >= REGISTER_LIMIT && (
                  <p className="text-xs text-muted-foreground">{t('consultationsPage.limited', { count: REGISTER_LIMIT })}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {choosing && (
        <NewConsultationDialog
          services={writable}
          onCancel={() => setChoosing(false)}
          onChosen={(person, s) => {
            setChoosing(false);
            setOpen({ person, service: s });
          }}
        />
      )}

      {open && (
        <ConsultationDialog
          beneficiaryId={open.person.id}
          consultation={open.consultation}
          service={open.service}
          initial={open.initial}
          person={personLabel(open.person)}
          canWrite={can(`${SERVICE_PERMISSION[open.service]}.write`)}
          onSaved={() => {
            if (open.appointmentId && can('appointments.write')) markDone.mutate(open.appointmentId);
          }}
          onClose={() => setOpen(null)}
          onIssueDocument={(c) => {
            setOpen(null);
            setIssuing(c);
          }}
        />
      )}
      {issuing && <IssueDocument consultation={issuing} onClose={() => setIssuing(null)} />}
    </AppLayout>
  );
};

/** Who the new consultation is for, and in which service when the account works in several. */
const NewConsultationDialog = ({
  services,
  onCancel,
  onChosen,
}: {
  services: Service[];
  onCancel: () => void;
  onChosen: (person: PersonRef, service: Service) => void;
}) => {
  const { t } = useTranslation();
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [service, setService] = useState<Service>(services[0]);

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!person) return void toast.error(t('consultationsPage.choosePatient'));
            onChosen(person, service);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('consultations.new')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-consultation-person">{t('consultationsPage.patient')} *</Label>
              <PersonPicker
                id="new-consultation-person"
                value={person}
                onChange={setPerson}
                search={searchActiveBeneficiaries}
                queryKey="consultation-beneficiaries"
                placeholder={t('careRequests.form.beneficiaryPlaceholder')}
                searchPlaceholder={t('careRequests.form.beneficiarySearch')}
                empty={t('careRequests.form.beneficiaryNone')}
                clearLabel={t('careRequests.form.beneficiaryClear')}
              />
            </div>
            {services.length > 1 && (
              <div className="grid gap-2">
                <Label htmlFor="new-consultation-service">{t('consultations.service')}</Label>
                <Select value={service} onValueChange={(v) => setService(v as Service)}>
                  <SelectTrigger id="new-consultation-service">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`consultations.services.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('consultationsPage.continue')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationsPage;
