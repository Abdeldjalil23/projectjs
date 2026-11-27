// Care coverage requests: the counters of each state, the list with its review buttons, and the
// contracted doctors the requests are sent to.
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Printer, Search, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useDebounced } from '@/hooks/useDebounced';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { personLabel } from '@/lib/beneficiaries';
import {
  CARE_STATES,
  CareRequest,
  CareState,
  ContractedDoctor,
  PAGE_SIZE,
  careState,
  countCareRequests,
  fetchCareRequests,
  fetchCareSettings,
  fetchContractedDoctors,
} from '@/lib/careRequests';
import { DoctorDialog, NewCareRequestDialog, ReviewDialog } from './CareRequestDialogs';

/** Colour of each state, used for its badge and its counter. */
const STATE_STYLE: Record<CareState, string> = {
  pending: 'border-amber-500 bg-amber-50 text-amber-800',
  approved: 'border-green-600 bg-green-50 text-green-800',
  used: 'border-sky-600 bg-sky-50 text-sky-800',
  expired: 'border-zinc-400 bg-zinc-100 text-zinc-700',
  refused: 'border-red-600 bg-red-50 text-red-800',
};

const errorText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export const CareRequestsPage = () => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'doctors' ? 'doctors' : 'requests';
  const rawState = params.get('state');
  const state: CareState | 'all' = CARE_STATES.includes(rawState as CareState) ? (rawState as CareState) : 'all';
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const canRead = can('care_requests.read');
  const seesDoctors = canRead || can('care_requests.create') || can('contracted_doctors.manage');

  return (
    <AppLayout title={t('careRequests.title')}>
      <Tabs value={tab} onValueChange={(v) => setParam('tab', v === 'doctors' ? 'doctors' : null)} className="space-y-4">
        {seesDoctors && (
          <TabsList>
            <TabsTrigger value="requests">{t('careRequests.tabs.requests')}</TabsTrigger>
            <TabsTrigger value="doctors">{t('careRequests.tabs.doctors')}</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="requests" className="space-y-4">
          <RequestsTab state={state} onState={(s) => setParam('state', s === 'all' ? null : s)} />
        </TabsContent>
        {seesDoctors && (
          <TabsContent value="doctors">
            <DoctorsTab />
          </TabsContent>
        )}
      </Tabs>
    </AppLayout>
  );
};

const RequestsTab = ({ state, onState }: { state: CareState | 'all'; onState: (s: CareState | 'all') => void }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const number = useNumberFormat();
  const formatDate = useDateFormat();
  const [search, setSearch] = useState('');
  const term = useDebounced(search);
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState<{ request: CareRequest; approve: boolean } | null>(null);
  const canReview = can('care_requests.review');

  const settings = useQuery({ queryKey: ['care-settings'], queryFn: fetchCareSettings, staleTime: 600_000 });
  const singleUse = settings.data?.singleUse ?? true;
  const counts = useQuery({
    queryKey: ['care-requests', 'counts', singleUse],
    queryFn: () => countCareRequests(singleUse),
    enabled: settings.isSuccess,
  });
  const list = useQuery({
    queryKey: ['care-requests', 'list', state, term, page, singleUse],
    queryFn: () => fetchCareRequests({ state, search: term, page, singleUse }),
    enabled: settings.isSuccess,
    placeholderData: (previous) => previous,
  });
  const pages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE));

  const choose = (s: CareState | 'all') => {
    setPage(0);
    onState(state === s ? 'all' : s);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARE_STATES.map((s) => (
          <button key={s} type="button" onClick={() => choose(s)} className="text-start" data-testid={`care-count-${s}`}>
            <Card className={`h-full transition-colors hover:border-primary/60 ${state === s ? 'border-primary ring-1 ring-primary' : ''}`}>
              <CardContent className="space-y-2 p-4">
                <p className="border-b-2 border-primary pb-1.5 text-xs font-semibold">{t(`careRequests.states.${s}`)}</p>
                <p className="text-2xl font-bold tabular-nums">{counts.data ? number(counts.data[s]) : counts.isError ? '—' : '…'}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                placeholder={t('careRequests.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            {state !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => choose('all')}>
                <X className="me-1 h-4 w-4" />
                {t(`careRequests.states.${state}`)}
              </Button>
            )}
            {can('care_requests.create') && (
              <Button onClick={() => setCreating(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t('careRequests.new')}
              </Button>
            )}
          </div>

          {list.isLoading || settings.isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : list.isError || settings.isError ? (
            <p className="py-6 text-center text-sm text-destructive">{errorText(list.error ?? settings.error, t('common.requestFailed'))}</p>
          ) : (list.data?.rows.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('careRequests.empty')}</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('careRequests.columns.number')}</TableHead>
                    <TableHead>{t('careRequests.columns.beneficiary')}</TableHead>
                    <TableHead>{t('careRequests.columns.doctor')}</TableHead>
                    <TableHead>{t('careRequests.columns.prestation')}</TableHead>
                    <TableHead>{t('careRequests.columns.requested')}</TableHead>
                    <TableHead>{t('careRequests.columns.state')}</TableHead>
                    <TableHead>
                      <span className="sr-only">{t('common.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.data!.rows.map((r) => {
                    const s = careState(r, singleUse);
                    return (
                      <TableRow key={r.id} data-request={r.number}>
                        <TableCell className="whitespace-nowrap font-mono text-xs" dir="ltr">
                          {r.number}
                        </TableCell>
                        <TableCell>
                          {r.beneficiary ? (
                            can('beneficiaries.read') ? (
                              <Link to={`/beneficiaries/${r.beneficiary.id}`} className="font-medium hover:underline">
                                {personLabel(r.beneficiary)}
                              </Link>
                            ) : (
                              <span className="font-medium">{personLabel(r.beneficiary)}</span>
                            )
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{r.doctor?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{r.doctor?.specialty}</p>
                        </TableCell>
                        <TableCell className="max-w-[16rem] text-sm">
                          <p className="truncate" title={r.prestation}>
                            {r.prestation}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          <p>{formatDate(r.created_at)}</p>
                          {r.requester_name && <p className="text-xs text-muted-foreground">{r.requester_name}</p>}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className={`whitespace-nowrap ${STATE_STYLE[s]}`}>
                            {t(`careRequests.state.${s}`)}
                          </Badge>
                          <p className="mt-1 max-w-[14rem] text-xs text-muted-foreground">
                            {s === 'approved' && t('careRequests.validUntil', { date: formatDate(r.valid_until) })}
                            {s === 'used' && t('careRequests.usedOn', { date: formatDate(r.used_at) })}
                            {s === 'expired' && t('careRequests.expiredOn', { date: formatDate(r.valid_until) })}
                            {s === 'refused' && r.refusal_reason}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {s === 'pending' && canReview && (
                              <>
                                <Button size="sm" onClick={() => setReviewing({ request: r, approve: true })}>
                                  <Check className="me-1 h-4 w-4" />
                                  {t('careRequests.approve')}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setReviewing({ request: r, approve: false })}>
                                  <X className="me-1 h-4 w-4" />
                                  {t('careRequests.refuse')}
                                </Button>
                              </>
                            )}
                            {r.status === 'approved' && (
                              <Button variant="ghost" size="icon" asChild title={t('careRequests.printAction')} aria-label={t('careRequests.printAction')}>
                                <Link to={`/care-requests/${r.id}/print`}>
                                  <Printer className="h-4 w-4" />
                                </Link>
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

          {(list.data?.total ?? 0) > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>{t('careRequests.total', { count: list.data!.total })}</span>
              {pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />
                    {t('careRequests.previous')}
                  </Button>
                  <span>{t('careRequests.page', { page: page + 1, pages })}</span>
                  <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                    {t('careRequests.next')}
                    <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {creating && <NewCareRequestDialog onClose={() => setCreating(false)} />}
      {reviewing && <ReviewDialog request={reviewing.request} approve={reviewing.approve} onClose={() => setReviewing(null)} />}
    </>
  );
};

const DoctorsTab = () => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const canManage = can('contracted_doctors.manage');
  const [editing, setEditing] = useState<ContractedDoctor | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const doctors = useQuery({ queryKey: ['contracted-doctors', 'all'], queryFn: () => fetchContractedDoctors() });
  const rows = useMemo(() => {
    const words = search.trim().toLowerCase();
    return (doctors.data ?? []).filter(
      (d) => !words || [d.full_name, d.specialty, d.address, d.phone].some((v) => v?.toLowerCase().includes(words)),
    );
  }, [doctors.data, search]);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="ps-9" placeholder={t('careRequests.doctors.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {canManage && (
            <Button onClick={() => setEditing('new')}>
              <Plus className="me-2 h-4 w-4" />
              {t('careRequests.doctors.add')}
            </Button>
          )}
        </div>
        {doctors.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : doctors.isError ? (
          <p className="py-6 text-center text-sm text-destructive">{errorText(doctors.error, t('common.requestFailed'))}</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('careRequests.doctors.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('careRequests.doctors.fields.full_name')}</TableHead>
                  <TableHead>{t('careRequests.doctors.fields.specialty')}</TableHead>
                  <TableHead>{t('careRequests.doctors.fields.phone')}</TableHead>
                  <TableHead>{t('careRequests.doctors.fields.address')}</TableHead>
                  <TableHead>{t('careRequests.doctors.status')}</TableHead>
                  {canManage && (
                    <TableHead>
                      <span className="sr-only">{t('common.actions')}</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.full_name}</TableCell>
                    <TableCell>{d.specialty}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-sm" dir="ltr">
                      {d.phone || '—'}
                    </TableCell>
                    <TableCell className="text-sm">{d.address || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={d.active ? 'border-green-600 text-green-800' : 'text-muted-foreground'}>
                        {d.active ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setEditing(d)} title={t('careRequests.doctors.edit')} aria-label={t('careRequests.doctors.edit')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {editing && <DoctorDialog doctor={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
};

export default CareRequestsPage;
