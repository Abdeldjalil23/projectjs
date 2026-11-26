// Fitness certificate (Fiche d'aptitude médicale) of a visit, ready to print. It carries the
// decision and the work restrictions only, never a medical finding, so it can be handed to the
// worker's management. Printed in French by default, or in Arabic.
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServerRequiredNotice from '@/components/shared/ServerRequiredNotice';
import { useAuth } from '@/context/AuthContext';
import { fetchBeneficiary } from '@/lib/beneficiaries';
import { DECISIONS, fetchVisit } from '@/lib/visits';

const PRINT_CSS = `
@media print {
  @page { size: A4 portrait; margin: 1.5cm; }
  .no-print { display: none !important; }
  body { background: white; }
  .sheet { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
}
`;

const LANGS = ['fr', 'ar'] as const;

export const VisitCertificatePage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { i18n, t: ui } = useTranslation();
  const { isDemo } = useAuth();
  const lang = params.get('lang') === 'ar' ? 'ar' : 'fr';
  const t = i18n.getFixedT(lang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const visit = useQuery({ queryKey: ['visit', id], queryFn: () => fetchVisit(id), enabled: !isDemo && Boolean(id) });
  const person = useQuery({
    queryKey: ['beneficiary', visit.data?.beneficiary_id],
    queryFn: () => fetchBeneficiary(visit.data!.beneficiary_id),
    enabled: Boolean(visit.data?.beneficiary_id),
  });

  if (isDemo) return <ServerRequiredNotice />;

  const date = (value: string | null | undefined) =>
    value ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`)) : '…';

  const v = visit.data;
  const b = person.data;
  const error = visit.error ?? person.error;

  return (
    <div className="min-h-screen bg-muted/40 py-6">
      <style>{PRINT_CSS}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[21cm] flex-wrap items-center gap-2 px-4">
        <Button variant="outline" size="sm" onClick={() => (v ? navigate(`/beneficiaries/${v.beneficiary_id}?tab=visits`) : navigate(-1))}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {ui('visits.certificate.back')}
        </Button>
        <div className="ms-auto flex gap-1">
          {LANGS.map((l) => (
            <Button key={l} size="sm" variant={l === lang ? 'default' : 'outline'} onClick={() => setParams({ lang: l }, { replace: true })}>
              {l === 'fr' ? 'Français' : 'العربية'}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => window.print()} disabled={!v || !b}>
          <Printer className="me-2 h-4 w-4" />
          {ui('visits.certificate.print')}
        </Button>
      </div>

      {error ? (
        <p className="text-center text-sm text-destructive">{error instanceof Error ? error.message : ui('common.requestFailed')}</p>
      ) : !v || !b ? (
        <p className="text-center text-sm text-muted-foreground">{ui('common.loading')}</p>
      ) : (
        <div dir={dir} lang={lang} className="sheet mx-auto max-w-[21cm] bg-white p-10 text-[13px] leading-relaxed text-black shadow" data-testid="certificate">
          <header className="flex items-center justify-between border-b-2 border-black pb-3">
            <img src="/logo.png" alt="" className="h-14" />
            <div className="text-end">
              <p className="font-semibold">{t('visits.certificate.organisation')}</p>
              <p>{t('visits.certificate.service')}</p>
            </div>
          </header>

          <h1 className="my-6 text-center text-xl font-bold uppercase tracking-wide">{t('visits.certificate.title')}</h1>

          <section className="grid grid-cols-2 gap-x-8 gap-y-1">
            <p>
              <span className="font-semibold">{t('visits.certificate.lastName')} : </span>
              {b.last_name}
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.firstName')} : </span>
              {b.first_name}
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.number')} : </span>
              <span dir="ltr">{b.external_id ?? '—'}</span>
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.birthDate')} : </span>
              {date(b.birth_date)}
            </p>
            <p className="col-span-2">
              <span className="font-semibold">{t('visits.certificate.workplace')} : </span>
              {[b.company, b.unit].filter(Boolean).join(' — ') || '—'}
            </p>
          </section>

          <section className="mt-5 border-t pt-4">
            <p>
              <span className="font-semibold">{t('visits.certificate.visit')} : </span>
              {t(`visits.types.${v.visit_type}`)} — {date(v.visit_date)}
            </p>
          </section>

          <section className="mt-5 space-y-2">
            <p className="font-semibold">{t('visits.certificate.conclusion')} :</p>
            {DECISIONS.map((d) => (
              <p key={d} className="flex items-center gap-3">
                <span className="inline-flex h-4 w-4 items-center justify-center border border-black text-[11px] leading-none">{v.decision === d ? '✕' : ''}</span>
                <span>
                  {t(`visits.decisions.${d}`)}
                  {d === 'temporarily_unfit' && v.decision === d && v.unfit_until ? ` — ${t('visits.certificate.until', { date: date(v.unfit_until) })}` : ''}
                </span>
              </p>
            ))}
          </section>

          {(v.restrictions || v.recommended_positions || v.unsuitable_positions) && (
            <section className="mt-5 space-y-2">
              {v.restrictions && (
                <p>
                  <span className="font-semibold">{t('visits.restrictions')} : </span>
                  {v.restrictions}
                </p>
              )}
              {v.recommended_positions && (
                <p>
                  <span className="font-semibold">{t('visits.recommendedPositions')} : </span>
                  {v.recommended_positions}
                </p>
              )}
              {v.unsuitable_positions && (
                <p>
                  <span className="font-semibold">{t('visits.unsuitablePositions')} : </span>
                  {v.unsuitable_positions}
                </p>
              )}
            </section>
          )}

          <section className="mt-5">
            <p>
              <span className="font-semibold">{t('visits.nextVisit')} : </span>
              {date(v.next_visit_date)}
            </p>
          </section>

          <section className="mt-10 flex justify-end">
            <div className="w-64 text-center">
              <p>{t('visits.certificate.doneOn', { date: date(v.visit_date) })}</p>
              <p className="mt-1 font-semibold">{t('visits.certificate.doctor')}</p>
              <p>{v.doctor_name ?? ''}</p>
              <div className="mt-2 h-24 border border-dashed border-gray-400" aria-label={t('visits.certificate.stamp')} />
              <p className="mt-1 text-[11px] text-gray-600">{t('visits.certificate.stamp')}</p>
            </div>
          </section>

          <footer className="mt-10 border-t pt-2 text-center text-[11px] text-gray-600">{t('visits.certificate.secrecy')}</footer>
        </div>
      )}
    </div>
  );
};

export default VisitCertificatePage;
