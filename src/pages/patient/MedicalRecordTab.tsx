// The medical record tab: general information, then the lists of the "Dossier médical".
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EntrySection, { FieldDef } from '@/components/records/EntrySection';
import { useAuth } from '@/context/AuthContext';
import { CHRONIC_CONDITIONS, MedicalRecord, fetchMedicalRecord, saveMedicalRecord } from '@/lib/records';

const NONE = '__none__';

const OPTIONS = {
  family_status: ['single', 'married', 'divorced', 'widowed'],
  national_service: ['done', 'exempt', 'deferred', 'not_applicable'],
  blood_group: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  smoking: ['never', 'current', 'former'],
  alcohol: ['never', 'occasional', 'regular', 'former'],
} as const;

const empty = (beneficiaryId: string): MedicalRecord => ({
  beneficiary_id: beneficiaryId,
  family_status: null,
  children_count: null,
  education: null,
  qualification: null,
  national_service: null,
  blood_group: null,
  allergies: null,
  chronic_conditions: [],
  chronic_treatment: null,
  smoking: null,
  alcohol: null,
  notes: null,
});

// Lists of the record and their fields, as on the paper "Dossier médical".
const POSITION_FIELDS: FieldDef[] = [
  { key: 'job_title', label: 'record.position.jobTitle', type: 'text', required: true, inTable: true, wide: true },
  { key: 'start_date', label: 'record.position.startDate', type: 'date', inTable: true },
  { key: 'end_date', label: 'record.position.endDate', type: 'date', inTable: true },
  { key: 'risks', label: 'record.position.risks', type: 'textarea', inTable: true },
  { key: 'nuisances', label: 'record.position.nuisances', type: 'textarea' },
  { key: 'change_type', label: 'record.position.changeType', type: 'select', options: ['hiring', 'transfer', 'promotion', 'medical', 'other'], optionsKey: 'record.position.changeTypes', inTable: true },
  { key: 'change_reason', label: 'record.position.changeReason', type: 'textarea' },
  { key: 'change_details', label: 'record.position.changeDetails', type: 'textarea' },
];

const PERSONAL_FIELDS: FieldDef[] = [
  { key: 'details.type', label: 'record.history.type', type: 'select', options: ['medical', 'surgical', 'allergy', 'trauma', 'other'], optionsKey: 'record.history.types', inTable: true },
  { key: 'title', label: 'record.history.title', type: 'text', required: true, inTable: true },
  { key: 'event_date', label: 'record.history.date', type: 'date', inTable: true },
  { key: 'description', label: 'record.history.description', type: 'textarea', inTable: true },
];

const FAMILY_FIELDS: FieldDef[] = [
  { key: 'details.relation', label: 'record.history.relation', type: 'select', options: ['father', 'mother', 'sibling', 'child', 'spouse', 'grandparent', 'other'], optionsKey: 'record.history.relations', inTable: true },
  { key: 'details.type', label: 'record.history.type', type: 'select', options: ['medical', 'surgical', 'allergy', 'trauma', 'other'], optionsKey: 'record.history.types', inTable: true },
  { key: 'title', label: 'record.history.title', type: 'text', required: true, inTable: true },
  { key: 'event_date', label: 'record.history.date', type: 'date' },
  { key: 'description', label: 'record.history.description', type: 'textarea', inTable: true },
];

const INTOXICATION_FIELDS: FieldDef[] = [
  { key: 'title', label: 'record.history.product', type: 'text', required: true, inTable: true },
  { key: 'event_date', label: 'record.history.date', type: 'date', inTable: true },
  { key: 'details.circumstances', label: 'record.history.circumstances', type: 'textarea' },
  { key: 'details.symptoms', label: 'record.history.symptoms', type: 'textarea', inTable: true },
  { key: 'details.treatment', label: 'record.history.treatment', type: 'textarea' },
  { key: 'details.sequelae', label: 'record.history.sequelae', type: 'textarea' },
  { key: 'details.declaration_number', label: 'record.history.declarationNumber', type: 'text' },
  { key: 'description', label: 'record.history.observations', type: 'textarea' },
];

const ACCIDENT_FIELDS: FieldDef[] = [
  { key: 'event_date', label: 'record.history.date', type: 'date', inTable: true },
  { key: 'title', label: 'record.history.injury', type: 'text', required: true, inTable: true },
  { key: 'details.place', label: 'record.history.place', type: 'text', inTable: true },
  { key: 'description', label: 'record.history.circumstances', type: 'textarea' },
  { key: 'details.care', label: 'record.history.care', type: 'textarea' },
  { key: 'details.days_off', label: 'record.history.daysOff', type: 'number', inTable: true },
  { key: 'details.ipp_percent', label: 'record.history.ippPercent', type: 'number', inTable: true, max: 100 },
  { key: 'details.consequences', label: 'record.history.consequences', type: 'textarea' },
  { key: 'details.declaration_number', label: 'record.history.declarationNumber', type: 'text' },
];

const VACCINATION_FIELDS: FieldDef[] = [
  { key: 'vaccine', label: 'record.vaccination.vaccine', type: 'text', required: true, inTable: true },
  { key: 'dose', label: 'record.vaccination.dose', type: 'text', inTable: true, max: 50 },
  { key: 'vaccination_date', label: 'record.vaccination.date', type: 'date', inTable: true },
  { key: 'next_due_date', label: 'record.vaccination.nextDue', type: 'date', inTable: true },
  { key: 'lot_number', label: 'record.vaccination.lot', type: 'text', max: 100 },
  { key: 'centre', label: 'record.vaccination.centre', type: 'text', max: 200 },
  { key: 'doctor', label: 'record.vaccination.doctor', type: 'text', max: 200 },
  { key: 'notes', label: 'record.vaccination.notes', type: 'textarea' },
];

const GeneralInformation = ({ beneficiaryId, canWrite }: { beneficiaryId: string; canWrite: boolean }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const record = useQuery({ queryKey: ['medical-record', beneficiaryId], queryFn: () => fetchMedicalRecord(beneficiaryId) });
  const [form, setForm] = useState<MedicalRecord>(() => empty(beneficiaryId));

  useEffect(() => {
    if (record.data !== undefined) setForm(record.data ?? empty(beneficiaryId));
  }, [record.data, beneficiaryId]);

  const save = useMutation({
    mutationFn: () => saveMedicalRecord(form, Boolean(record.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-record', beneficiaryId] });
      toast.success(t('record.general.saved'));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const set = <K extends keyof MedicalRecord>(key: K, value: MedicalRecord[K]) => setForm((f) => ({ ...f, [key]: value }));
  const text = (key: keyof MedicalRecord) => (form[key] as string | null) ?? '';
  const select = (key: keyof typeof OPTIONS) => (
    <div className="grid gap-2">
      <Label htmlFor={`rec-${key}`}>{t(`record.general.${key}`)}</Label>
      <Select value={text(key) || NONE} onValueChange={(v) => set(key, v === NONE ? null : v)} disabled={!canWrite}>
        <SelectTrigger id={`rec-${key}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>—</SelectItem>
          {OPTIONS[key].map((o) => (
            <SelectItem key={o} value={o}>
              {key === 'blood_group' ? o : t(`record.general.options.${key}.${o}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const input = (key: 'education' | 'qualification') => (
    <div className="grid gap-2">
      <Label htmlFor={`rec-${key}`}>{t(`record.general.${key}`)}</Label>
      <Input id={`rec-${key}`} value={text(key)} onChange={(e) => set(key, e.target.value || null)} disabled={!canWrite} maxLength={200} />
    </div>
  );
  const area = (key: 'allergies' | 'chronic_treatment' | 'notes') => (
    <div className="grid gap-2 sm:col-span-2">
      <Label htmlFor={`rec-${key}`}>{t(`record.general.${key}`)}</Label>
      <Textarea id={`rec-${key}`} rows={2} value={text(key)} onChange={(e) => set(key, e.target.value || null)} disabled={!canWrite} />
    </div>
  );

  return (
    <Card data-section="general">
      <CardHeader>
        <CardTitle className="text-base">{t('record.general.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {record.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : record.isError ? (
          <p className="text-sm text-destructive">{record.error instanceof Error ? record.error.message : t('common.requestFailed')}</p>
        ) : (
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            {select('family_status')}
            <div className="grid gap-2">
              <Label htmlFor="rec-children_count">{t('record.general.children_count')}</Label>
              <Input
                id="rec-children_count"
                type="number"
                min={0}
                max={30}
                value={form.children_count ?? ''}
                onChange={(e) => set('children_count', e.target.value === '' ? null : Number(e.target.value))}
                disabled={!canWrite}
              />
            </div>
            {input('education')}
            {input('qualification')}
            {select('national_service')}
            {select('blood_group')}
            {select('smoking')}
            {select('alcohol')}
            {area('allergies')}
            <div className="grid gap-2 sm:col-span-2">
              <Label>{t('record.general.chronic_conditions')}</Label>
              <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-3">
                {CHRONIC_CONDITIONS.map((code) => (
                  <label key={code} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.chronic_conditions.includes(code)}
                      disabled={!canWrite}
                      onCheckedChange={(on) =>
                        set(
                          'chronic_conditions',
                          on ? [...form.chronic_conditions, code] : form.chronic_conditions.filter((c) => c !== code),
                        )
                      }
                    />
                    {t(`record.chronic.${code}`)}
                  </label>
                ))}
              </div>
            </div>
            {area('chronic_treatment')}
            {area('notes')}
            {canWrite && (
              <div className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export const MedicalRecordTab = ({ beneficiaryId }: { beneficiaryId: string }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const canWrite = can('medical_records.write');
  const canWriteVaccines = canWrite || can('nursing.write');

  return (
    <div className="space-y-6">
      <GeneralInformation beneficiaryId={beneficiaryId} canWrite={canWrite} />
      <EntrySection id="positions" title={t('record.sections.positions')} table="occupational_positions" beneficiaryId={beneficiaryId} fields={POSITION_FIELDS} canWrite={canWrite} />
      <EntrySection id="personal" title={t('record.sections.personal')} table="medical_history" kind="personal" beneficiaryId={beneficiaryId} fields={PERSONAL_FIELDS} canWrite={canWrite} />
      <EntrySection id="family" title={t('record.sections.family')} table="medical_history" kind="family" beneficiaryId={beneficiaryId} fields={FAMILY_FIELDS} canWrite={canWrite} />
      <EntrySection id="intoxications" title={t('record.sections.intoxications')} table="medical_history" kind="intoxication" beneficiaryId={beneficiaryId} fields={INTOXICATION_FIELDS} canWrite={canWrite} />
      <EntrySection id="accidents" title={t('record.sections.accidents')} table="medical_history" kind="work_accident" beneficiaryId={beneficiaryId} fields={ACCIDENT_FIELDS} canWrite={canWrite} />
      <EntrySection id="vaccinations" title={t('record.sections.vaccinations')} table="vaccinations" beneficiaryId={beneficiaryId} fields={VACCINATION_FIELDS} canWrite={canWriteVaccines} />
    </div>
  );
};

export default MedicalRecordTab;
