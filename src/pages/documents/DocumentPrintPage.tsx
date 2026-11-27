// A medical document ready to print, with the centre's header, its serial number, the patient
// and the doctor's signature box. Printed in French by default, or in Arabic. A cancelled
// document is shown with a mark and its reason.
import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ageOn, fetchBeneficiary } from '@/lib/beneficiaries';
import { MedicalDocument, PrescriptionLine, fetchDocument, fetchPrintHeader } from '@/lib/consultations';

const LANGS = ['fr', 'ar'] as const;

const printCss = (size: 'A4' | 'A5') => `
@media print {
  @page { size: ${size} portrait; margin: 1cm; }
  .no-print { display: none !important; }
  body { background: white; }
  .sheet { box-shadow: none !important; margin: 0 !important; max-width: none !important; width: auto !important; }
}
`;

export const DocumentPrintPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { i18n, t: ui } = useTranslation();
  const lang = params.get('lang') === 'ar' ? 'ar' : 'fr';
  const t = i18n.getFixedT(lang);

  const doc = useQuery({ queryKey: ['document', id], queryFn: () => fetchDocument(id), enabled: Boolean(id) });
  const person = useQuery({
    queryKey: ['beneficiary', doc.data?.beneficiary_id],
    queryFn: () => fetchBeneficiary(doc.data!.beneficiary_id),
    enabled: Boolean(doc.data?.beneficiary_id),
  });
  const header = useQuery({ queryKey: ['print-header'], queryFn: fetchPrintHeader, staleTime: 3600_000 });


  const d = doc.data;
  const b = person.data;
  const error = doc.error ?? person.error;
  const size = d?.doc_type === 'evacuation' ? 'A4' : 'A5';
  const date = (value: unknown) =>
    typeof value === 'string' && value
      ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', { dateStyle: 'long' }).format(new Date(`${value.slice(0, 10)}T00:00:00`))
      : '…';
  const age = b ? ageOn(b.birth_date) : null;

  return (
    <div className="min-h-screen bg-muted/40 py-6">
      <style>{printCss(size)}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[21cm] flex-wrap items-center gap-2 px-4">
        <Button variant="outline" size="sm" onClick={() => (d ? navigate(`/beneficiaries/${d.beneficiary_id}?tab=documents`) : navigate(-1))}>
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
        <Button size="sm" onClick={() => window.print()} disabled={!d || !b}>
          <Printer className="me-2 h-4 w-4" />
          {ui('visits.certificate.print')}
        </Button>
      </div>

      {error ? (
        <p className="text-center text-sm text-destructive">{error instanceof Error ? error.message : ui('common.requestFailed')}</p>
      ) : !d || !b ? (
        <p className="text-center text-sm text-muted-foreground">{ui('common.loading')}</p>
      ) : (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          lang={lang}
          className={`sheet relative mx-auto bg-white p-8 text-[13px] leading-relaxed text-black shadow ${size === 'A4' ? 'max-w-[21cm]' : 'max-w-[14.8cm]'}`}
          data-testid="document"
        >
          {d.cancelled_at && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="-rotate-12 rounded border-4 border-red-600 px-6 py-2 text-4xl font-bold text-red-600 opacity-60">{t('documents.print.cancelled')}</span>
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
                {t('documents.print.number')} <span className="font-mono font-semibold" dir="ltr">{d.serial}</span>
              </p>
              <p>{t('documents.print.date', { date: date(d.issued_on) })}</p>
            </div>
          </header>

          <h1 className="my-4 text-center text-lg font-bold uppercase tracking-wide">{t(`documents.print.titles.${d.doc_type}`)}</h1>

          <section className="grid grid-cols-2 gap-x-6 gap-y-1">
            <p>
              <span className="font-semibold">{t('visits.certificate.lastName')} : </span>
              {b.last_name}
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.firstName')} : </span>
              {b.first_name}
            </p>
            <p>
              <span className="font-semibold">{t('documents.print.age')} : </span>
              {age !== null ? t('documents.print.years', { age }) : '—'}
            </p>
            <p>
              <span className="font-semibold">{t('visits.certificate.number')} : </span>
              <span dir="ltr">{b.external_id ?? '—'}</span>
            </p>
          </section>

          <section className="mt-4 border-t pt-3">
            <DocumentBody doc={d} t={t} date={date} />
          </section>

          <footer className="mt-8 flex justify-end">
            <div className="w-52 text-center">
              <p className="font-semibold">{t('documents.print.signature')}</p>
              <p>{d.author_name ?? ''}</p>
              <div className="mt-2 h-20 border border-dashed border-gray-400" />
              <p className="mt-1 text-[10px] text-gray-600">{t('visits.certificate.stamp')}</p>
            </div>
          </footer>
          {d.cancelled_at && (
            <p className="mt-4 text-[11px] text-red-700">
              {t('documents.print.cancelReason')} : {d.cancel_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

type T = TFunction;

const Line = ({ label, children }: { label: string; children: ReactNode }) => (
  <p>
    <span className="font-semibold">{label} : </span>
    {children}
  </p>
);

const DocumentBody = ({ doc, t, date }: { doc: MedicalDocument; t: T; date: (v: unknown) => string }) => {
  const c = doc.content as Record<string, unknown>;
  const s = (key: string) => (c[key] === undefined || c[key] === null || c[key] === '' ? null : String(c[key]));
  const f = (key: string) => t(`documents.fields.${key}`);
  const arr = (key: string) => (Array.isArray(c[key]) ? (c[key] as string[]) : []);

  switch (doc.doc_type) {
    case 'consultation_report':
      return (
        <div className="space-y-2">
          {s('nature') && <Line label={f('nature')}>{t(`consultations.natures.${s('nature')}`)}</Line>}
          {s('specialty') && <Line label={f('specialty')}>{s('specialty')}</Line>}
          <p className="font-semibold">{f('diagnosis')} :</p>
          <p className="whitespace-pre-wrap">{s('diagnosis')}</p>
          {s('work_stoppage_days') && <Line label={f('work_stoppage_days')}>{t('documents.print.days', { count: s('work_stoppage_days') })}</Line>}
        </div>
      );
    case 'prescription': {
      const items = (c.items as PrescriptionLine[] | undefined) ?? [];
      return (
        <div>
          <ol className="list-decimal space-y-2 ps-5">
            {items.map((it, i) => (
              <li key={i}>
                <p className="font-semibold">{it.medicine}</p>
                {(it.dosage || it.duration) && <p className="text-[12px]">{[it.dosage, it.duration].filter(Boolean).join(' — ')}</p>}
              </li>
            ))}
          </ol>
          {s('notes') && <p className="mt-3 whitespace-pre-wrap">{s('notes')}</p>}
        </div>
      );
    }
    case 'referral':
      return (
        <div className="space-y-2">
          <p>{t('documents.print.referralIntro', { specialty: s('specialty') ?? '…' })}</p>
          {s('purpose') && <Line label={f('purpose')}>{t(`documents.purposes.${s('purpose')}`)}</Line>}
          {s('recipient') && <Line label={f('recipient')}>{s('recipient')}</Line>}
          {s('summary') && (
            <>
              <p className="font-semibold">{f('summary')} :</p>
              <p className="whitespace-pre-wrap">{s('summary')}</p>
            </>
          )}
          <p className="pt-2">{t('documents.print.thanks')}</p>
        </div>
      );
    case 'lab_request':
      return (
        <div className="space-y-2">
          {s('scope') && <Line label={f('scope')}>{t(`documents.scopes.${s('scope')}`)}</Line>}
          <p className="font-semibold">{t('documents.print.testsRequested')} :</p>
          <ul className="list-disc ps-5">
            {arr('tests').map((x) => (
              <li key={x}>{x}</li>
            ))}
            {s('other_tests') && <li>{s('other_tests')}</li>}
          </ul>
          {s('comments') && <Line label={f('comments')}>{s('comments')}</Line>}
        </div>
      );
    case 'imaging_request':
      return (
        <div className="space-y-2">
          {s('modality') && <Line label={f('modality')}>{t(`documents.modalities.${s('modality')}`)}</Line>}
          <p className="font-semibold">{t('documents.print.examsRequested')} :</p>
          <ul className="list-disc ps-5">
            {arr('exams').map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {s('region') && <Line label={f('region')}>{s('region')}</Line>}
          {s('indication') && <Line label={f('indication')}>{s('indication')}</Line>}
          {s('comments') && <Line label={f('comments')}>{s('comments')}</Line>}
        </div>
      );
    case 'evacuation':
      return (
        <div className="space-y-2">
          {s('function') && <Line label={f('function')}>{s('function')}</Line>}
          {s('structure') && <Line label={f('structure')}>{s('structure')}</Line>}
          {s('home') && <Line label={f('home')}>{s('home')}</Line>}
          <p>{t('documents.print.evacuationIntro')}</p>
          <Line label={f('hospital')}>{s('hospital')}</Line>
          {s('specialist') && <Line label={f('specialist')}>{s('specialist')}</Line>}
          {s('delay') && <Line label={f('delay')}>{s('delay')}</Line>}
          <Line label={f('reason')}>{s('reason') === 'other' ? s('other_reason') : s('reason') ? t(`documents.reasons.${s('reason')}`) : '—'}</Line>
          <Line label={f('transport')}>{arr('transport').map((m) => t(`documents.transports.${m}`)).join(', ') || '—'}</Line>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Line label={f('nurse')}>{s('nurse') ?? ''}</Line>
            <Line label={f('assistant')}>{s('assistant') ?? ''}</Line>
          </div>
        </div>
      );
    case 'medical_certificate': {
      const kind = s('kind');
      return (
        <div className="space-y-2">
          <p>{t('documents.print.certificateIntro')}</p>
          {kind === 'sick_leave' && <p className="font-semibold">{t('documents.print.sickLeave', { count: s('days'), from: date(c.from), to: date(c.to) })}</p>}
          {kind === 'extension' && <p className="font-semibold">{t('documents.print.extension', { count: s('days'), from: date(c.from), to: date(c.to) })}</p>}
          {kind === 'return_to_work' && <p className="font-semibold">{t('documents.print.returnToWork', { date: date(c.return_date) })}</p>}
          {kind === 'hospitalisation' && <p className="font-semibold">{t('documents.print.hospitalisation', { hospital: s('hospital') })}</p>}
          {s('accident_date') && <Line label={f('accident_date')}>{date(c.accident_date)}</Line>}
          {s('employer_service') && <Line label={f('employer_service')}>{s('employer_service')}</Line>}
          {s('company') && <Line label={f('company')}>{s('company')}</Line>}
          <p className="pt-2 text-[11px]">{t('documents.print.certificateUse')}</p>
        </div>
      );
    }
  }
};

export default DocumentPrintPage;
