// Issues a medical document for a beneficiary: consultation report, prescription, referral letter,
// lab or imaging request, medical evacuation or medical certificate. The server gives the serial
// number and the date; the document opens ready to print.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { imagerieOptions, testOptions } from '@/lib/exams';
import {
  CERTIFICATE_KINDS,
  Consultation,
  DOC_TYPES,
  DocType,
  DocumentContent,
  EVACUATION_REASONS,
  IMAGING_MODALITIES,
  NATURES,
  PrescriptionLine,
  TRANSPORTS,
  issueDocument,
} from '@/lib/consultations';
import { addDays, today } from '@/lib/visits';
import { fetchMedicineNames } from '@/lib/medicines';
import { useAuth } from '@/context/AuthContext';

const NONE = '__none__';

/** Exam lists of the imaging request, by modality (names as used by the centre). */
const IMAGING_EXAMS: Record<(typeof IMAGING_MODALITIES)[number], string[]> = {
  radiography: imagerieOptions.radiographie,
  ultrasound: imagerieOptions.echographie,
  ct: imagerieOptions.scanner,
  mri: imagerieOptions.irm,
  other: imagerieOptions.autres,
};
const LAB_TESTS: Record<'internal' | 'external', string[]> = { internal: testOptions.interne, external: testOptions.externe };

interface DocumentDialogProps {
  beneficiaryId: string;
  /** Workplace of the beneficiary, offered on the evacuation form. */
  workplace?: string;
  consultation?: Consultation | null;
  /** Type chosen beforehand, if any. */
  initialType?: DocType;
  onClose: () => void;
}

const initialContent = (type: DocType, c?: Consultation | null, workplace?: string): DocumentContent => {
  switch (type) {
    case 'consultation_report':
      return {
        nature: c?.nature ?? 'care',
        specialty: c?.service === 'dental' ? 'Chirurgie dentaire' : 'Médecine générale',
        diagnosis: c?.diagnosis ?? '',
        work_stoppage_days: c?.work_stoppage_days ?? '',
      };
    case 'prescription':
      return { items: [{ medicine: '', dosage: '', duration: '' }], notes: '' };
    case 'referral':
      return { specialty: '', recipient: '', purpose: 'opinion', summary: c?.diagnosis ?? '' };
    case 'lab_request':
      return { scope: 'internal', tests: [], other_tests: '', comments: '' };
    case 'imaging_request':
      return { modality: 'radiography', exams: [], region: '', indication: c?.diagnosis ?? '', comments: '' };
    case 'evacuation':
      return { function: '', structure: workplace ?? '', home: '', hospital: '', specialist: '', delay: '', reason: 'illness', other_reason: '', transport: [], nurse: '', assistant: '' };
    case 'medical_certificate': {
      const days = c?.work_stoppage_days ?? '';
      return {
        kind: 'sick_leave',
        days,
        from: today(),
        to: days ? addDays(today(), Number(days) - 1) : '',
        return_date: '',
        hospital: '',
        accident_date: '',
        employer_service: workplace ?? '',
        company: '',
      };
    }
  }
};

export const DocumentDialog = ({ beneficiaryId, workplace, consultation, initialType, onClose }: DocumentDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [type, setType] = useState<DocType | null>(initialType ?? null);
  const [content, setContent] = useState<DocumentContent>(() => (initialType ? initialContent(initialType, consultation, workplace) : {}));
  const { can } = useAuth();
  // Medicines of the stock, offered while writing a prescription.
  const medicineNames = useQuery({
    queryKey: ['medicine-names'],
    queryFn: fetchMedicineNames,
    enabled: type === 'prescription' && can('medicines.read'),
    staleTime: 300_000,
  });

  const issue = useMutation({
    mutationFn: () => issueDocument(beneficiaryId, type!, clean(type!, content), consultation?.id ?? null),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', beneficiaryId] });
      toast.success(t('documents.issued', { serial: doc.serial }));
      onClose();
      navigate(`/documents/${doc.id}/print`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const choose = (value: DocType) => {
    setType(value);
    setContent(initialContent(value, consultation, workplace));
  };
  const str = (key: string) => (content[key] as string | number | undefined) ?? '';
  const set = (key: string, value: unknown) =>
    setContent((c) => ({
      ...c,
      [key]: value,
      // The lists depend on the kind of request.
      ...(key === 'scope' ? { tests: [] } : {}),
      ...(key === 'modality' ? { exams: [] } : {}),
    }));
  const list = (key: string) => (content[key] as string[] | undefined) ?? [];
  const toggle = (key: string, value: string, on: boolean) =>
    setContent((c) => {
      const current = new Set((c[key] as string[] | undefined) ?? []);
      if (on) current.add(value);
      else current.delete(value);
      return { ...c, [key]: [...current] };
    });

  const field = (key: string, opts: { type?: 'text' | 'date' | 'number'; wide?: boolean; area?: boolean; max?: number } = {}) => (
    <div className={`grid gap-2 ${opts.wide || opts.area ? 'sm:col-span-2' : ''}`}>
      <Label htmlFor={`doc-${key}`}>{t(`documents.fields.${key}`)}</Label>
      {opts.area ? (
        <Textarea id={`doc-${key}`} rows={3} maxLength={opts.max ?? 2000} value={String(str(key))} onChange={(e) => set(key, e.target.value)} />
      ) : (
        <Input
          id={`doc-${key}`}
          type={opts.type ?? 'text'}
          dir={opts.type === 'number' ? 'ltr' : undefined}
          min={opts.type === 'number' ? 0 : undefined}
          maxLength={opts.type ? undefined : opts.max ?? 200}
          value={String(str(key))}
          onChange={(e) => set(key, opts.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        />
      )}
    </div>
  );

  const choice = <T extends string>(key: string, options: readonly T[], labelKey: string) => (
    <div className="grid gap-2">
      <Label htmlFor={`doc-${key}`}>{t(`documents.fields.${key}`)}</Label>
      <Select value={String(str(key)) || NONE} onValueChange={(v) => set(key, v === NONE ? '' : v)}>
        <SelectTrigger id={`doc-${key}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {t(`${labelKey}.${String(o)}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const checklist = (key: string, options: string[], label: (o: string) => string, id: string) => (
    <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border p-3 sm:col-span-2 sm:grid-cols-2" data-testid={id}>
      {options.map((o, i) => (
        <div key={o} className="flex items-center gap-2">
          <Checkbox id={`${id}-${i}`} checked={list(key).includes(o)} onCheckedChange={(v) => toggle(key, o, v === true)} />
          <Label htmlFor={`${id}-${i}`} className="font-normal">
            {label(o)}
          </Label>
        </div>
      ))}
    </div>
  );

  const items = (content.items as PrescriptionLine[] | undefined) ?? [];
  const setItem = (index: number, key: keyof PrescriptionLine, value: string) =>
    set('items', items.map((it, i) => (i === index ? { ...it, [key]: value } : it)));

  // Certificate: the end date follows the start and the number of days.
  const setCertificateDays = (from: string, days: string | number) => {
    setContent((c) => ({ ...c, from, days, to: from && days ? addDays(from, Number(days) - 1) : '' }));
  };

  const kind = String(str('kind'));

  const validate = (): string | null => {
    switch (type) {
      case 'consultation_report':
        return String(str('diagnosis')).trim() ? null : t('documents.errors.diagnosis');
      case 'prescription':
        return items.some((it) => it.medicine.trim()) ? null : t('documents.errors.medicine');
      case 'referral':
        return String(str('specialty')).trim() ? null : t('documents.errors.specialty');
      case 'lab_request':
        return list('tests').length || String(str('other_tests')).trim() ? null : t('documents.errors.tests');
      case 'imaging_request':
        return list('exams').length || String(str('region')).trim() ? null : t('documents.errors.exams');
      case 'evacuation':
        return String(str('hospital')).trim() ? null : t('documents.errors.hospital');
      case 'medical_certificate':
        if ((kind === 'sick_leave' || kind === 'extension') && !(Number(str('days')) > 0 && str('from'))) return t('documents.errors.days');
        if (kind === 'return_to_work' && !str('return_date')) return t('documents.errors.returnDate');
        if (kind === 'hospitalisation' && !String(str('hospital')).trim()) return t('documents.errors.hospital');
        return null;
      default:
        return t('documents.errors.type');
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl" data-testid="document-dialog">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const error = validate();
            if (error) return void toast.error(error);
            issue.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('documents.issueTitle')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="doc-type">{t('documents.type')}</Label>
              <Select value={type ?? NONE} onValueChange={(v) => v !== NONE && choose(v as DocType)}>
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder={t('documents.chooseType')} />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {t(`documents.types.${d}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'consultation_report' && (
              <>
                {choice('nature', NATURES, 'consultations.natures')}
                {field('specialty')}
                {field('diagnosis', { area: true })}
                {field('work_stoppage_days', { type: 'number' })}
              </>
            )}

            {type === 'prescription' && (
              <div className="space-y-2 sm:col-span-2" data-testid="prescription-lines">
                {items.map((it, i) => (
                  <div key={i} className="grid items-end gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
                    <div className="grid gap-1">
                      <Label htmlFor={`doc-item-${i}-medicine`} className="text-xs">
                        {t('documents.fields.medicine')}
                      </Label>
                      <Input id={`doc-item-${i}-medicine`} list="stock-medicines" maxLength={200} value={it.medicine} onChange={(e) => setItem(i, 'medicine', e.target.value)} />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor={`doc-item-${i}-dosage`} className="text-xs">
                        {t('documents.fields.dosage')}
                      </Label>
                      <Input id={`doc-item-${i}-dosage`} maxLength={200} value={it.dosage ?? ''} onChange={(e) => setItem(i, 'dosage', e.target.value)} />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor={`doc-item-${i}-duration`} className="text-xs">
                        {t('documents.fields.duration')}
                      </Label>
                      <Input id={`doc-item-${i}-duration`} maxLength={60} value={it.duration ?? ''} onChange={(e) => setItem(i, 'duration', e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" aria-label={t('documents.removeLine')} disabled={items.length === 1} onClick={() => set('items', items.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <datalist id="stock-medicines">
                  {(medicineNames.data ?? []).map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <Button type="button" variant="outline" size="sm" disabled={items.length >= 15} onClick={() => set('items', [...items, { medicine: '', dosage: '', duration: '' }])}>
                  <Plus className="me-2 h-4 w-4" />
                  {t('documents.addLine')}
                </Button>
                {field('notes', { area: true, max: 1000 })}
              </div>
            )}

            {type === 'referral' && (
              <>
                {field('specialty')}
                {field('recipient')}
                {choice('purpose', ['opinion', 'treatment'] as const, 'documents.purposes')}
                <div className="hidden sm:block" />
                {field('summary', { area: true })}
              </>
            )}

            {type === 'lab_request' && (
              <>
                {choice('scope', ['internal', 'external'] as const, 'documents.scopes')}
                <div className="hidden sm:block" />
                {checklist('tests', LAB_TESTS[(str('scope') as 'internal' | 'external') || 'internal'], (o) => o, 'lab-tests')}
                {field('other_tests', { wide: true, max: 500 })}
                {field('comments', { area: true, max: 1000 })}
              </>
            )}

            {type === 'imaging_request' && (
              <>
                {choice('modality', IMAGING_MODALITIES, 'documents.modalities')}
                {field('region')}
                {checklist('exams', IMAGING_EXAMS[(str('modality') as (typeof IMAGING_MODALITIES)[number]) || 'radiography'], (o) => o, 'imaging-exams')}
                {field('indication', { area: true, max: 1000 })}
                {field('comments', { area: true, max: 1000 })}
              </>
            )}

            {type === 'evacuation' && (
              <>
                {field('function')}
                {field('structure')}
                {field('home')}
                {field('hospital')}
                {field('specialist')}
                {field('delay')}
                {choice('reason', EVACUATION_REASONS, 'documents.reasons')}
                {str('reason') === 'other' ? field('other_reason') : <div className="hidden sm:block" />}
                <div className="grid gap-2 sm:col-span-2">
                  <Label>{t('documents.fields.transport')}</Label>
                  <div className="flex flex-wrap gap-4">
                    {TRANSPORTS.map((m) => (
                      <div key={m} className="flex items-center gap-2">
                        <Checkbox id={`doc-transport-${m}`} checked={list('transport').includes(m)} onCheckedChange={(v) => toggle('transport', m, v === true)} />
                        <Label htmlFor={`doc-transport-${m}`} className="font-normal">
                          {t(`documents.transports.${m}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {field('nurse')}
                {field('assistant')}
              </>
            )}

            {type === 'medical_certificate' && (
              <>
                {choice('kind', CERTIFICATE_KINDS, 'documents.certificateKinds')}
                {field('accident_date', { type: 'date' })}
                {(kind === 'sick_leave' || kind === 'extension') && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="doc-days">{t('documents.fields.days')}</Label>
                      <Input id="doc-days" type="number" dir="ltr" min={1} max={365} value={String(str('days'))} onChange={(e) => setCertificateDays(String(str('from')), e.target.value === '' ? '' : Number(e.target.value))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="doc-from">{t('documents.fields.from')}</Label>
                      <Input id="doc-from" type="date" value={String(str('from'))} onChange={(e) => setCertificateDays(e.target.value, str('days'))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="doc-to">{t('documents.fields.to')}</Label>
                      <Input id="doc-to" type="date" value={String(str('to'))} readOnly />
                    </div>
                  </>
                )}
                {kind === 'return_to_work' && field('return_date', { type: 'date' })}
                {kind === 'hospitalisation' && field('hospital', { wide: true })}
                {field('employer_service')}
                {field('company')}
              </>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!type || issue.isPending}>
              {issue.isPending ? t('common.saving') : t('documents.issue')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/** Keeps only what belongs to the type, without empty values and empty prescription lines. */
const clean = (type: DocType, content: DocumentContent): DocumentContent => {
  const out: DocumentContent = {};
  for (const [key, value] of Object.entries(content)) {
    if (key === 'items') {
      const lines = (value as PrescriptionLine[])
        .filter((l) => l.medicine.trim())
        .map((l) => Object.fromEntries(Object.entries(l).filter(([, v]) => String(v ?? '').trim() !== '').map(([k, v]) => [k, String(v).trim()])));
      if (lines.length) out.items = lines;
    } else if (Array.isArray(value)) {
      if (value.length) out[key] = value;
    } else if (typeof value === 'string') {
      if (value.trim()) out[key] = value.trim();
    } else if (value !== null && value !== undefined && value !== '') {
      out[key] = value;
    }
  }
  // A certificate keeps only the dates of its kind.
  if (type === 'medical_certificate') {
    if (out.kind !== 'sick_leave' && out.kind !== 'extension') {
      delete out.days;
      delete out.from;
      delete out.to;
    }
    if (out.kind !== 'return_to_work') delete out.return_date;
    if (out.kind !== 'hospitalisation') delete out.hospital;
  }
  if (type === 'evacuation' && out.reason !== 'other') delete out.other_reason;
  return out;
};

export default DocumentDialog;
