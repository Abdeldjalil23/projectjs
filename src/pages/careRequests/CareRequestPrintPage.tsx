// The care coverage document (Prise en charge) to print and give to the worker: the centre's
// header, the number, the beneficiary, the service, the contracted doctor, the last valid day and
// the QR code the doctor scans. Printed in French by default, or in Arabic. The QR code carries
// only the link to the verification page with a random token: no name, no medical information.
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { careState, fetchCareRequest, fetchCareSettings, verifyUrl } from '@/lib/careRequests';
import { fetchPrintHeader } from '@/lib/consultations';

const LANGS = ['fr', 'ar'] as const;

const PRINT_CSS = `
@media print {
  @page { size: A5 portrait; margin: 1cm; }
  .no-print { display: none !important; }
  body { background: white; }
  .sheet { box-shadow: none !important; margin: 0 !important; max-width: none !important; width: auto !important; }
}
`;

export const CareRequestPrintPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { i18n, t: ui } = useTranslation();
  const lang = params.get('lang') === 'ar' ? 'ar' : 'fr';
  const t = i18n.getFixedT(lang);

  const request = useQuery({ queryKey: ['care-request', id], queryFn: () => fetchCareRequest(id), enabled: Boolean(id) });
  const settings = useQuery({ queryKey: ['care-settings'], queryFn: fetchCareSettings, staleTime: 600_000 });
  const header = useQuery({ queryKey: ['print-header'], queryFn: fetchPrintHeader, staleTime: 3600_000 });

  const r = request.data;
  const b = r?.beneficiary;
  const state = r ? careState(r, settings.data?.singleUse ?? true) : null;
  const date = (value: string | null | undefined) =>
    value
      ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', { dateStyle: 'long' }).format(new Date(`${value.slice(0, 10)}T00:00:00`))
      : '…';
  const printable = r?.status === 'approved' && r.qr_token;

  return (
    <div className="min-h-screen bg-muted/40 py-6">
      <style>{PRINT_CSS}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[14.8cm] flex-wrap items-center gap-2 px-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/care-requests')}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {ui('careRequests.print.back')}
        </Button>
        <div className="ms-auto flex gap-1">
          {LANGS.map((l) => (
            <Button key={l} size="sm" variant={l === lang ? 'default' : 'outline'} onClick={() => setParams({ lang: l }, { replace: true })}>
              {l === 'fr' ? 'Français' : 'العربية'}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => window.print()} disabled={!printable}>
          <Printer className="me-2 h-4 w-4" />
          {ui('careRequests.print.printButton')}
        </Button>
      </div>

      {request.isError ? (
        <p className="text-center text-sm text-destructive">{request.error instanceof Error ? request.error.message : ui('common.requestFailed')}</p>
      ) : !r ? (
        <p className="text-center text-sm text-muted-foreground">{ui('common.loading')}</p>
      ) : !printable ? (
        <p className="text-center text-sm text-muted-foreground">{ui('careRequests.print.notApproved')}</p>
      ) : (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          lang={lang}
          className="sheet relative mx-auto max-w-[14.8cm] bg-white p-8 text-[13px] leading-relaxed text-black shadow"
          data-testid="care-document"
        >
          {(state === 'used' || state === 'expired') && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="-rotate-12 rounded border-4 border-red-600 px-6 py-2 text-4xl font-bold text-red-600 opacity-60">
                {t(`careRequests.print.${state}`)}
              </span>
            </div>
          )}
          <header className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="h-12" />
              <div className="text-[11px] leading-tight">
                {(header.data ?? []).map((line, i) => (
                  <p key={i} className={i === 0 ? 'font-semibold uppercase' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="text-end text-[11px]">
              <p>
                {t('careRequests.print.number')} <span className="font-mono font-semibold" dir="ltr">{r.number}</span>
              </p>
              <p>{t('careRequests.print.approvedOn', { date: date(r.reviewed_at) })}</p>
            </div>
          </header>

          <h1 className="my-4 text-center text-lg font-bold uppercase tracking-wide">{t('careRequests.print.title')}</h1>

          <p>{t('careRequests.print.intro')}</p>
          <section className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
            <p>
              <span className="font-semibold">{t('visits.certificate.lastName')} : </span>
              {b?.last_name ?? '—'}
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.firstName')} : </span>
              {b?.first_name ?? '—'}
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.number')} : </span>
              <span dir="ltr">{b?.external_id ?? '—'}</span>
            </p>
            <p>
              <span className="font-semibold">{t('careRequests.print.category')} : </span>
              {b ? t(`beneficiaries.categories.${b.category}`) : '—'}
            </p>
            {b?.unit && (
              <p className="col-span-2">
                <span className="font-semibold">{t('careRequests.print.unit')} : </span>
                {b.unit}
              </p>
            )}
          </section>

          <section className="mt-4 space-y-1 border-t pt-3">
            <p>
              <span className="font-semibold">{t('careRequests.print.prestation')} : </span>
              {r.prestation}
            </p>
            <p>
              <span className="font-semibold">{t('careRequests.print.doctor')} : </span>
              {r.doctor?.full_name} — {r.doctor?.specialty}
            </p>
            {(r.doctor?.address || r.doctor?.phone) && (
              <p className="text-[12px] text-gray-700">
                {[r.doctor?.address, r.doctor?.phone].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="pt-1 text-[14px]">
              <span className="font-semibold">{t('careRequests.print.validUntil')} : </span>
              <span className="font-bold">{date(r.valid_until)}</span>
            </p>
          </section>

          <footer className="mt-6 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3">
              <QRCodeSVG value={verifyUrl(r.qr_token!)} size={112} level="M" marginSize={0} />
              <p className="max-w-[11rem] text-[10px] leading-snug text-gray-700">{t('careRequests.print.scan')}</p>
            </div>
            <div className="w-44 text-center">
              <p className="font-semibold">{t('careRequests.print.signature')}</p>
              <p>{r.reviewer_name ?? ''}</p>
              <div className="mt-2 h-16 border border-dashed border-gray-400" />
              <p className="mt-1 text-[10px] text-gray-600">{t('visits.certificate.stamp')}</p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default CareRequestPrintPage;
