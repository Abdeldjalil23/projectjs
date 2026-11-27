// Beneficiaries: search, filter, add, edit, and open a person's details.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, FileUp, Plus, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useDebounced } from '@/hooks/useDebounced';
import {
  BeneficiaryDetails,
  CATEGORIES,
  Category,
  ListFilters,
  PAGE_SIZE,
  PersonRef,
  ageOn,
  fetchBeneficiaries,
} from '@/lib/beneficiaries';
import BeneficiaryDialog from './BeneficiaryDialog';
import BeneficiaryDetailsSheet from './BeneficiaryDetailsSheet';
import BeneficiaryNumber from './BeneficiaryNumber';

type DialogState =
  | { mode: 'create'; preset?: { category: Category; holder: PersonRef; company?: string | null } }
  | { mode: 'edit'; beneficiary: BeneficiaryDetails }
  | null;

export const BeneficiariesPage = () => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ListFilters['category']>('all');
  const [status, setStatus] = useState<ListFilters['status']>('active');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const term = useDebounced(search);

  // A new search or filter starts again from the first page.
  useEffect(() => setPage(0), [term, category, status]);

  const filters: ListFilters = { search: term, category, status, page };
  const list = useQuery({
    queryKey: ['beneficiaries', filters],
    queryFn: () => fetchBeneficiaries(filters),
    placeholderData: keepPreviousData,
  });


  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppLayout title={t('beneficiaries.title')}>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>{t('beneficiaries.title')}</CardTitle>
            <CardDescription>{t('beneficiaries.subtitle')}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {can('beneficiaries.import') && (
              <Button variant="outline" asChild>
                <Link to="/beneficiaries/import">
                  <FileUp className="me-2 h-4 w-4" />
                  {t('beneficiaries.import')}
                </Link>
              </Button>
            )}
            {can('beneficiaries.write') && (
              <Button onClick={() => setDialog({ mode: 'create' })}>
                <Plus className="me-2 h-4 w-4" />
                {t('beneficiaries.add')}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                placeholder={t('beneficiaries.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as ListFilters['category'])}>
              <SelectTrigger className="w-[230px]" aria-label={t('beneficiaries.columns.category')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('beneficiaries.allCategories')}</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`beneficiaries.categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as ListFilters['status'])}>
              <SelectTrigger className="w-[140px]" aria-label={t('beneficiaries.columns.status')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                <SelectItem value="all">{t('beneficiaries.statusAll')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {list.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : list.isError ? (
            <div className="py-8 text-center text-sm">
              <p className="text-destructive">
                {list.error instanceof Error ? list.error.message : t('common.requestFailed')}
              </p>
              <Button variant="link" onClick={() => list.refetch()}>
                {t('common.tryAgain')}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('beneficiaries.columns.number')}</TableHead>
                      <TableHead>{t('beneficiaries.columns.name')}</TableHead>
                      <TableHead>{t('beneficiaries.columns.category')}</TableHead>
                      <TableHead>{t('beneficiaries.columns.sex')}</TableHead>
                      <TableHead>{t('beneficiaries.columns.age')}</TableHead>
                      <TableHead>{t('beneficiaries.columns.unit')}</TableHead>
                      <TableHead>{t('beneficiaries.columns.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(list.data?.rows ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          {t('beneficiaries.noneFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      list.data!.rows.map((b) => {
                        const age = ageOn(b.birth_date);
                        return (
                          <TableRow
                            key={b.id}
                            data-beneficiary={b.external_id ?? b.id}
                            className="cursor-pointer"
                            onClick={() => setOpenId(b.id)}
                          >
                            <TableCell className="font-mono text-xs">
                              <BeneficiaryNumber beneficiary={b} />
                            </TableCell>
                            <TableCell>
                              <button type="button" className="text-start font-medium hover:underline">
                                {b.last_name} {b.first_name}
                              </button>
                            </TableCell>
                            <TableCell>{t(`beneficiaries.categories.${b.category}`)}</TableCell>
                            <TableCell>{b.sex ? t(`beneficiaries.sexes.${b.sex}`) : '—'}</TableCell>
                            <TableCell>{age === null ? '—' : t('beneficiaries.years', { age })}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{b.unit ?? b.company ?? '—'}</TableCell>
                            <TableCell>
                              {b.active ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t('common.active')}</Badge>
                              ) : (
                                <Badge variant="secondary">{t('common.inactive')}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{t('beneficiaries.total', { count: total })}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0 || list.isFetching}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />
                    {t('beneficiaries.previous')}
                  </Button>
                  <span>{t('beneficiaries.page', { page: page + 1, pages })}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= pages || list.isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t('beneficiaries.next')}
                    <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {openId && (
        <BeneficiaryDetailsSheet
          id={openId}
          onClose={() => setOpenId(null)}
          onOpen={setOpenId}
          onEdit={(beneficiary) => setDialog({ mode: 'edit', beneficiary })}
          onAddDependent={(preset) => setDialog({ mode: 'create', preset })}
        />
      )}
      {dialog?.mode === 'create' && (
        <BeneficiaryDialog preset={dialog.preset} onClose={() => setDialog(null)} onSaved={(id) => setOpenId(id)} />
      )}
      {dialog?.mode === 'edit' && <BeneficiaryDialog beneficiary={dialog.beneficiary} onClose={() => setDialog(null)} />}
    </AppLayout>
  );
};

export default BeneficiariesPage;
