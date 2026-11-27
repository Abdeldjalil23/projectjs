// Activity reports: the monthly report of the CMS and the quarterly consolidation of occupational
// medicine, computed from what was recorded in the platform, with a printable / PDF version and an
// Excel file. Only counts are shown: the reports reveal no patient.
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FileSpreadsheet, Info, Printer } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import i18n from '@/i18n';
import { fetchPrintHeader } from '@/lib/consultations';
import { intlLocale } from '@/lib/format';
import {
  REPORT_TYPES,
  ReportType,
  currentQuarter,
  fetchReport,
  monthPeriod,
  previousMonth,
  periodLabel,
  quarterPeriod,
  reportFileName,
  reportTables,
} from '@/lib/reports';
import ReportTableView from './ReportTableView';

const EXPORT_LANGS = ['fr', 'ar'] as const;
type ExportLang = (typeof EXPORT_LANGS)[number];

/** Sections of the paper consolidation that are not recorded in the platform yet. */
const MANUAL_SECTIONS = ['healthStaff', 'workplace', 'exposures', 'occupationalDiseases', 'reclassification', 'training'] as const;

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => thisYear - i);

export const ReportsPage = () => {
  const { t } = useTranslation();
  const number = useNumberFormat();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const type: ReportType = REPORT_TYPES.includes(params.get('type') as ReportType) ? (params.get('type') as ReportType) : 'cms';
  const last = previousMonth();
  const quarterNow = currentQuarter();
  const year = Number(params.get('year')) || (type === 'cms' ? last.year : quarterNow.year);
  const month = Math.min(12, Math.max(1, Number(params.get('month')) || last.month));
  const quarter = Math.min(4, Math.max(1, Number(params.get('quarter')) || quarterNow.quarter));
  const { from, to } = type === 'cms' ? monthPeriod(year, month) : quarterPeriod(year, quarter);
  const [lang, setLang] = useState<ExportLang>('fr');
  const [exporting, setExporting] = useState(false);

  const set = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace: true });
  };

  const report = useQuery({ queryKey: ['report', type, from, to], queryFn: () => fetchReport(type, from, to) });
  const header = useQuery({ queryKey: ['print-header'], queryFn: fetchPrintHeader, staleTime: 3600_000 });
  const tables = report.data ? reportTables(report.data, t) : [];
  const monthName = (m: number) => new Intl.DateTimeFormat(intlLocale(i18n.language), { month: 'long' }).format(new Date(2026, m - 1, 1));

  const exportExcel = async () => {
    if (!report.data) return;
    setExporting(true);
    try {
      const { downloadReportExcel } = await import('@/lib/reportExcel');
      const fixed = i18n.getFixedT(lang);
      await downloadReportExcel({
        fileName: reportFileName(type, from),
        sheet: fixed(`reports.sheets.${type}`),
        header: header.data ?? [],
        title: fixed(`reports.titles.${type}`),
        period: periodLabel(type, from, lang),
        tables: reportTables(report.data, fixed),
        rightToLeft: lang === 'ar',
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common.requestFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout title={t('reports.title')}>
      <div className="space-y-4">
        <Tabs value={type} onValueChange={(v) => set({ type: v, year: null, month: null, quarter: null })}>
          <TabsList>
            {REPORT_TYPES.map((r) => (
              <TabsTrigger key={r} value={r}>
                {t(`reports.tabs.${r}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="flex flex-wrap items-end gap-4 p-4">
            <div className="grid gap-2">
              <Label htmlFor="report-year">{t('reports.year')}</Label>
              <Select value={String(year)} onValueChange={(v) => set({ year: v })}>
                <SelectTrigger id="report-year" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {type === 'cms' ? (
              <div className="grid gap-2">
                <Label htmlFor="report-month">{t('reports.month')}</Label>
                <Select value={String(month)} onValueChange={(v) => set({ month: v })}>
                  <SelectTrigger id="report-month" className="w-40 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={String(m)} className="capitalize">
                        {monthName(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="report-quarter">{t('reports.quarter')}</Label>
                <Select value={String(quarter)} onValueChange={(v) => set({ quarter: v })}>
                  <SelectTrigger id="report-quarter" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((q) => (
                      <SelectItem key={q} value={String(q)}>
                        {t(`reports.quarters.${q}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="report-lang">{t('reports.exportLanguage')}</Label>
              <Select value={lang} onValueChange={(v) => setLang(v as ExportLang)}>
                <SelectTrigger id="report-lang" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ms-auto flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={!report.data}
                onClick={() => navigate(`/reports/print?type=${type}&from=${from}&to=${to}&lang=${lang}`)}
              >
                <Printer className="me-2 h-4 w-4" />
                {t('reports.print')}
              </Button>
              <Button disabled={!report.data || exporting} onClick={exportExcel}>
                <FileSpreadsheet className="me-2 h-4 w-4" />
                {exporting ? t('reports.exporting') : t('reports.excel')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wide">{t(`reports.titles.${type}`)}</h2>
              <p className="text-sm text-muted-foreground first-letter:uppercase">{periodLabel(type, from, i18n.language)}</p>
              <span className="title-bar mt-2" aria-hidden />
            </div>

            {report.isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : report.isError ? (
              <p className="py-6 text-center text-sm text-destructive">{report.error instanceof Error ? report.error.message : t('common.requestFailed')}</p>
            ) : (
              <>
                <div className="grid gap-6 xl:grid-cols-2">
                  {tables.map((table) => (
                    // Tables with a column per category need the whole width.
                    <div key={table.id} className={table.columns.length > 6 ? 'xl:col-span-2' : ''}>
                      <ReportTableView table={table} formatNumber={number} />
                    </div>
                  ))}
                </div>
                {type === 'occupational' && (
                  <div className="flex items-start gap-3 rounded-md border border-dashed p-4 text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="font-medium">{t('reports.occupational.manualTitle')}</p>
                      <p className="text-muted-foreground">{MANUAL_SECTIONS.map((s) => t(`reports.occupational.manual.${s}`)).join(' · ')}</p>
                      <p className="text-xs text-muted-foreground">{t('reports.occupational.manualHint')}</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{t('reports.privacy')}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
