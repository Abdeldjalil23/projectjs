// Printable version of a report (A4 landscape), also used to save it as PDF from the browser's
// print window. In French by default, or in Arabic.
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPrintHeader } from '@/lib/consultations';
import { REPORT_TYPES, ReportType, fetchReport, periodLabel, reportNumber, reportTables } from '@/lib/reports';
import ReportTableView from './ReportTableView';

const PRINT_CSS = `
@media print {
  @page { size: A4 landscape; margin: 1cm; }
  .no-print { display: none !important; }
  body { background: white; }
  .sheet { box-shadow: none !important; margin: 0 !important; max-width: none !important; width: auto !important; padding: 0 !important; }
  .report-block { break-inside: avoid; }
}
`;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const ReportPrintPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { i18n, t: ui } = useTranslation();
  const type: ReportType = REPORT_TYPES.includes(params.get('type') as ReportType) ? (params.get('type') as ReportType) : 'cms';
  const from = DATE.test(params.get('from') ?? '') ? params.get('from')! : '';
  const to = DATE.test(params.get('to') ?? '') ? params.get('to')! : '';
  const lang = params.get('lang') === 'ar' ? 'ar' : 'fr';
  const t = i18n.getFixedT(lang);

  const report = useQuery({ queryKey: ['report', type, from, to], queryFn: () => fetchReport(type, from, to), enabled: Boolean(from && to) });
  const header = useQuery({ queryKey: ['print-header'], queryFn: fetchPrintHeader, staleTime: 3600_000 });
  const tables = report.data ? reportTables(report.data, t) : [];
  const number = reportNumber(lang);
  const switchLang = (l: 'fr' | 'ar') => {
    const next = new URLSearchParams(params);
    next.set('lang', l);
    setParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/40 py-6">
      <style>{PRINT_CSS}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[29.7cm] flex-wrap items-center gap-2 px-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/reports?type=${type}`)}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {ui('reports.back')}
        </Button>
        <div className="ms-auto flex gap-1">
          {(['fr', 'ar'] as const).map((l) => (
            <Button key={l} size="sm" variant={l === lang ? 'default' : 'outline'} onClick={() => switchLang(l)}>
              {l === 'fr' ? 'Français' : 'العربية'}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => window.print()} disabled={!report.data}>
          <Printer className="me-2 h-4 w-4" />
          {ui('reports.printButton')}
        </Button>
      </div>

      {!from || !to ? (
        <p className="text-center text-sm text-destructive">{ui('reports.errors.period')}</p>
      ) : report.isError ? (
        <p className="text-center text-sm text-destructive">{report.error instanceof Error ? report.error.message : ui('common.requestFailed')}</p>
      ) : !report.data ? (
        <p className="text-center text-sm text-muted-foreground">{ui('common.loading')}</p>
      ) : (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} className="sheet mx-auto max-w-[29.7cm] bg-white p-8 text-black shadow" data-testid="report-sheet">
          <header className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
            <div className="text-[11px] leading-tight">
              {(header.data ?? []).map((line, i) => (
                <p key={i} className={i === 0 ? 'font-semibold uppercase' : ''}>
                  {line}
                </p>
              ))}
            </div>
            <div className="text-end text-[11px]">
              <p className="font-semibold">{t(`reports.titles.${type}`)}</p>
              <p className="first-letter:uppercase">{periodLabel(type, from, lang)}</p>
            </div>
          </header>
          <h1 className="my-3 text-center text-base font-bold uppercase">
            {t(`reports.titles.${type}`)} — {periodLabel(type, from, lang)}
          </h1>
          <div className="columns-1 gap-6 lg:columns-2 print:columns-2">
            {tables.map((table) => (
              <ReportTableView key={table.id} table={table} formatNumber={number} print />
            ))}
          </div>
          <footer className="mt-6 flex justify-between gap-4 text-[10px] text-gray-600">
            <p>{t('reports.generated', { date: new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', { dateStyle: 'long' }).format(new Date()) })}</p>
            <div className="w-56 text-center text-[11px] text-black">
              <p className="font-semibold">{t('reports.signature')}</p>
              <div className="mt-2 h-16 border border-dashed border-gray-400" />
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default ReportPrintPage;
