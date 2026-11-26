// Data access for the medical record: general information and its lists of entries
// (positions held, history, intoxications, work accidents, vaccinations).
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export const CHRONIC_CONDITIONS = [
  'hypertension',
  'diabetes_t1',
  'diabetes_t2',
  'asthma',
  'copd',
  'heart_failure',
  'coronary',
  'arrhythmia',
  'stroke',
  'epilepsy',
  'depression',
  'anxiety',
  'hypothyroidism',
  'hyperthyroidism',
  'kidney_disease',
  'hepatitis_b',
  'hepatitis_c',
  'cirrhosis',
  'rheumatoid_arthritis',
  'osteoarthritis',
  'gout',
  'cancer',
  'other',
] as const;

export interface MedicalRecord {
  beneficiary_id: string;
  family_status: string | null;
  children_count: number | null;
  education: string | null;
  qualification: string | null;
  national_service: string | null;
  blood_group: string | null;
  allergies: string | null;
  chronic_conditions: string[];
  chronic_treatment: string | null;
  smoking: string | null;
  alcohol: string | null;
  notes: string | null;
  updated_at?: string;
}

/** Tables holding lists of entries attached to a beneficiary. */
export type EntryTable = 'occupational_positions' | 'medical_history' | 'vaccinations';
export type Entry = { id: string; beneficiary_id: string } & Record<string, unknown>;

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string } | null): never => {
  throw new Error(error?.message || i18n.t('common.requestFailed'));
};

export const fetchMedicalRecord = async (beneficiaryId: string): Promise<MedicalRecord | null> => {
  const { data, error } = await client()
    .from('medical_records')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .maybeSingle();
  if (error) fail(error);
  return (data as MedicalRecord | null) ?? null;
};

export const saveMedicalRecord = async (record: MedicalRecord, exists: boolean) => {
  const { beneficiary_id, ...fields } = record;
  delete (fields as Partial<MedicalRecord>).updated_at;
  const { error } = exists
    ? await client().from('medical_records').update(fields).eq('beneficiary_id', beneficiary_id)
    : await client().from('medical_records').insert(record);
  if (error) fail(error);
};

const ORDER: Record<EntryTable, string> = {
  occupational_positions: 'start_date',
  medical_history: 'event_date',
  vaccinations: 'vaccination_date',
};

export const fetchEntries = async (table: EntryTable, beneficiaryId: string, kind?: string): Promise<Entry[]> => {
  let query = client().from(table).select('*').eq('beneficiary_id', beneficiaryId);
  if (kind) query = query.eq('kind', kind);
  const { data, error } = await query.order(ORDER[table], { ascending: false, nullsFirst: false });
  if (error) fail(error);
  return (data ?? []) as Entry[];
};

export const saveEntry = async (table: EntryTable, row: Record<string, unknown>, id?: string) => {
  const { error } = id
    ? await client().from(table).update(row).eq('id', id)
    : await client().from(table).insert(row);
  if (error) fail(error);
};

export const deleteEntry = async (table: EntryTable, id: string) => {
  const { error } = await client().from(table).delete().eq('id', id);
  if (error) fail(error);
};
