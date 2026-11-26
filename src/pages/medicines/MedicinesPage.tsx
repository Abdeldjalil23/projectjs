// Medicine stock of the centre: products with their stock on hand, alert threshold and nearest
// expiry, and their receipts, dispensing, adjustments and disposals.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowDownToLine, ArrowUpFromLine, History, Pencil, Plus, Search, SlidersHorizontal } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ServerRequiredNotice from '@/components/shared/ServerRequiredNotice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { Medicine, MovementKind, fetchMedicines, stockState } from '@/lib/medicines';
import { today } from '@/lib/visits';
import { HistoryDialog, MedicineDialog, MovementDialog } from './MedicineDialogs';

const FILTERS = ['all', 'low', 'expiring', 'expired', 'inactive'] as const;
type Filter = (typeof FILTERS)[number];

export const MedicinesPage = () => {
  const { t } = useTranslation();
  const { isDemo, can } = useAuth();
  const formatDate = useDateFormat();
  const number = useNumberFormat();
  const [params, setParams] = useSearchParams();
  const raw = params.get('filter');
  const filter: Filter = FILTERS.includes(raw as Filter) ? (raw as Filter) : 'all';
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Medicine | 'new' | null>(null);
  const [moving, setMoving] = useState<{ medicine: Medicine; kind: MovementKind } | null>(null);
  const [history, setHistory] = useState<Medicine | null>(null);
  const canWrite = can('medicines.write');
  const list = useQuery({ queryKey: ['medicines'], queryFn: fetchMedicines, enabled: !isDemo });
  const now = today();

  const all = useMemo(() => list.data ?? [], [list.data]);
  const counts = useMemo(() => {
    const active = all.filter((m) => m.active);
    return {
      active: active.length,
      low: active.filter((m) => stockState(m, now).low).length,
      expiring: active.filter((m) => stockState(m, now).expiring).length,
      expired: active.filter((m) => stockState(m, now).expired && (m.quantity ?? 0) > 0).length,
    };
  }, [all, now]);

  const rows = useMemo(() => {
    const words = search.trim().toLowerCase();
    return all.filter((m) => {
      const state = stockState(m, now);
      if (filter === 'inactive' ? m.active : !m.active) return false;
      if (filter === 'low' && !state.low) return false;
      if (filter === 'expiring' && !state.expiring) return false;
      if (filter === 'expired' && !state.expired) return false;
      if (!words) return true;
      return [m.name, m.generic_name, m.category, m.strength, m.location].some((v) => v?.toLowerCase().includes(words));
    });
  }, [all, filter, search, now]);

  return (
    <AppLayout title={t('medicines.title')}>
      {isDemo ? (
        <ServerRequiredNotice />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['active', counts.active, 'all', ''],
                ['low', counts.low, 'low', 'text-orange-700'],
                ['expiring', counts.expiring, 'expiring', 'text-amber-700'],
                ['expired', counts.expired, 'expired', 'text-red-700'],
              ] as const
            ).map(([key, value, target, color]) => (
              <button
                key={key}
                type="button"
                onClick={() => setParams(target === 'all' ? {} : { filter: target }, { replace: true })}
                className="text-start"
                data-testid={`count-${key}`}
              >
                <Card className={filter === target ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t(`medicines.counts.${key}`)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${value > 0 ? color : ''}`}>{number(value)}</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="ps-9" placeholder={t('medicines.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medicines-filter">{t('medicines.show')}</Label>
                  <Select value={filter} onValueChange={(v) => setParams(v === 'all' ? {} : { filter: v }, { replace: true })}>
                    <SelectTrigger id="medicines-filter" className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTERS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {t(`medicines.filters.${f}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {canWrite && (
                  <Button onClick={() => setEditing('new')}>
                    <Plus className="me-2 h-4 w-4" />
                    {t('medicines.add')}
                  </Button>
                )}
              </div>

              {list.isLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
              ) : list.isError ? (
                <p className="py-6 text-center text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
              ) : rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('medicines.empty')}</p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('medicines.fields.name')}</TableHead>
                        <TableHead>{t('medicines.fields.category')}</TableHead>
                        <TableHead className="text-end">{t('medicines.stock')}</TableHead>
                        <TableHead className="text-end">{t('medicines.fields.threshold')}</TableHead>
                        <TableHead>{t('medicines.fields.expiry_date')}</TableHead>
                        <TableHead>{t('medicines.fields.location')}</TableHead>
                        <TableHead>
                          <span className="sr-only">{t('common.actions')}</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((m) => {
                        const state = stockState(m, now);
                        return (
                          <TableRow key={m.id} data-medicine={m.name}>
                            <TableCell>
                              <p className="font-medium">
                                {m.name} {m.strength && <span className="text-muted-foreground">{m.strength}</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {[m.generic_name, m.form ? t(`medicines.forms.${m.form}`) : null, m.prescription_required ? t('medicines.prescriptionOnly') : null].filter(Boolean).join(' · ')}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm">{m.category || '—'}</TableCell>
                            <TableCell className="text-end">
                              <span className={`font-mono ${state.low ? 'font-semibold text-orange-700' : ''}`} dir="ltr">
                                {number(m.quantity ?? 0)}
                              </span>{' '}
                              <span className="text-xs text-muted-foreground">{t(`medicines.units.${m.unit}`)}</span>
                              {state.out ? (
                                <Badge variant="outline" className="ms-2 border-red-600 text-red-700">
                                  {t('medicines.badges.out')}
                                </Badge>
                              ) : state.low ? (
                                <Badge variant="outline" className="ms-2 border-orange-500 text-orange-700">
                                  {t('medicines.badges.low')}
                                </Badge>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-end font-mono text-sm" dir="ltr">
                              {number(m.threshold)}
                            </TableCell>
                            <TableCell className={`text-sm ${state.expired ? 'font-semibold text-red-700' : state.expiring ? 'text-amber-700' : ''}`}>
                              {formatDate(m.expiry_date)}
                              {state.expired && <span className="ms-1">({t('medicines.badges.expired')})</span>}
                            </TableCell>
                            <TableCell className="text-sm">{m.location || '—'}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                {canWrite && m.active && (
                                  <>
                                    <Button variant="ghost" size="icon" aria-label={t('medicines.kinds.in')} title={t('medicines.kinds.in')} onClick={() => setMoving({ medicine: m, kind: 'in' })}>
                                      <ArrowDownToLine className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label={t('medicines.kinds.out')} title={t('medicines.kinds.out')} onClick={() => setMoving({ medicine: m, kind: 'out' })}>
                                      <ArrowUpFromLine className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label={t('medicines.kinds.adjust')} title={t('medicines.kinds.adjust')} onClick={() => setMoving({ medicine: m, kind: 'adjust' })}>
                                      <SlidersHorizontal className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="icon" aria-label={t('medicines.history')} title={t('medicines.history')} onClick={() => setHistory(m)}>
                                  <History className="h-4 w-4" />
                                </Button>
                                {canWrite && (
                                  <Button variant="ghost" size="icon" aria-label={t('medicines.edit')} title={t('medicines.edit')} onClick={() => setEditing(m)}>
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
          </Card>
        </div>
      )}
      {editing && <MedicineDialog medicine={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {moving && <MovementDialog medicine={moving.medicine} kind={moving.kind} onClose={() => setMoving(null)} />}
      {history && <HistoryDialog medicine={history} onClose={() => setHistory(null)} />}
    </AppLayout>
  );
};

export default MedicinesPage;
