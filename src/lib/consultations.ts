// Data access for consultations, the acts performed and the medical documents issued.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export const SERVICES = ['general', 'nursing', 'dental', 'psychology'] as const;
export type Service = (typeof SERVICES)[number];

/** Permission prefix of each service: general medicine uses consultations.*. */
export const SERVICE_PERMISSION: Record<Service, string> = {
  general: 'consultations',
  nursing: 'nursing',
  dental: 'dental',
  psychology: 'psychology',
};

export const NATURES = ['care', 'emergency', 'specific', 'periodic', 'hiring', 'follow_up'] as const;
export type Nature = (typeof NATURES)[number];

export const VITALS = ['bp', 'pulse', 'temperature', 'weight', 'glycemia', 'spo2'] as const;

/** Acts of the centre. Dental acts on a tooth ask for its number (FDI). */
export const ACTS: Record<'nursing' | 'dental', { code: string; tooth?: boolean }[]> = {
  nursing: [
    { code: 'injection_im' },
    { code: 'injection_iv' },
    { code: 'injection_sc' },
    { code: 'infusion' },
    { code: 'dressing_simple' },
    { code: 'dressing_complex' },
    { code: 'suture' },
    { code: 'suture_removal' },
    { code: 'wound_care' },
    { code: 'blood_pressure' },
    { code: 'blood_glucose' },
    { code: 'ecg' },
    { code: 'nebulisation' },
    { code: 'oxygen' },
    { code: 'ear_wash' },
    { code: 'eye_wash' },
    { code: 'urinary_catheter' },
    { code: 'blood_sample' },
    { code: 'vaccination' },
    { code: 'other_nursing' },
  ],
  dental: [
    { code: 'dental_exam' },
    { code: 'scaling' },
    { code: 'extraction_simple', tooth: true },
    { code: 'extraction_surgical', tooth: true },
    { code: 'filling_composite', tooth: true },
    { code: 'filling_amalgam', tooth: true },
    { code: 'root_canal', tooth: true },
    { code: 'dental_dressing', tooth: true },
    { code: 'dental_xray', tooth: true },
    { code: 'abscess_drainage', tooth: true },
    { code: 'curettage', tooth: true },
    { code: 'prosthesis' },
    { code: 'other_dental' },
  ],
};

/** Valid tooth numbers (FDI): 11–18 … 41–48, and milk teeth 51–55 … 81–85. */
export const isTooth = (n: number) => {
  const quadrant = Math.floor(n / 10);
  const tooth = n % 10;
  return (quadrant >= 1 && quadrant <= 4 && tooth >= 1 && tooth <= 8) || (quadrant >= 5 && quadrant <= 8 && tooth >= 1 && tooth <= 5);
};

export const DOC_TYPES = [
  'consultation_report',
  'prescription',
  'referral',
  'lab_request',
  'imaging_request',
  'evacuation',
  'medical_certificate',
] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const IMAGING_MODALITIES = ['radiography', 'ultrasound', 'ct', 'mri', 'other'] as const;
export const CERTIFICATE_KINDS = ['sick_leave', 'extension', 'return_to_work', 'hospitalisation'] as const;
export const EVACUATION_REASONS = ['illness', 'accident', 'other'] as const;
export const TRANSPORTS = ['plane', 'ambulance', 'company_vehicle', 'own_means'] as const;

export interface Consultation {
  id?: string;
  beneficiary_id: string;
  service: Service;
  consultation_date: string;
  nature: Nature | null;
  reason: string | null;
  vitals: Record<string, string>;
  findings: string | null;
  diagnosis: string | null;
  treatment: string | null;
  work_stoppage_days: number | null;
  author_name?: string | null;
  created_at?: string;
}

export interface Act {
  id?: string;
  consultation_id?: string;
  act_code: string;
  tooth: number | null;
  quantity: number;
  notes: string | null;
}

export interface PrescriptionLine {
  medicine: string;
  dosage?: string;
  duration?: string;
}

export type DocumentContent = Record<string, unknown>;

export interface MedicalDocument {
  id: string;
  beneficiary_id: string;
  consultation_id: string | null;
  doc_type: DocType;
  serial: string;
  issued_on: string;
  author_name: string | null;
  content: DocumentContent;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  beneficiary?: { id: string; external_id: string | null; last_name: string; first_name: string } | null;
}

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string } | null): never => {
  throw new Error(error?.message || i18n.t('common.requestFailed'));
};

export const fetchConsultations = async (beneficiaryId: string): Promise<Consultation[]> => {
  const { data, error } = await client()
    .from('consultations')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('consultation_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) fail(error);
  return (data ?? []) as Consultation[];
};

export const fetchActs = async (consultationId: string): Promise<Act[]> => {
  const { data, error } = await client()
    .from('consultation_acts')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at');
  if (error) fail(error);
  return (data ?? []) as Act[];
};

const CONSULTATION_COLUMNS = [
  'consultation_date',
  'nature',
  'reason',
  'vitals',
  'findings',
  'diagnosis',
  'treatment',
  'work_stoppage_days',
] as const;

/**
 * Saves a consultation and its acts: new acts are added, removed ones deleted (acts are not
 * edited in place). Returns the consultation id.
 */
export const saveConsultation = async (consultation: Consultation, acts: Act[], removedActIds: string[]): Promise<string> => {
  const fields: Record<string, unknown> = Object.fromEntries(CONSULTATION_COLUMNS.map((c) => [c, consultation[c]]));
  fields.vitals = Object.fromEntries(Object.entries(consultation.vitals).filter(([, v]) => String(v ?? '').trim() !== ''));
  let id = consultation.id;
  if (id) {
    const { error } = await client().from('consultations').update(fields).eq('id', id);
    if (error) fail(error);
  } else {
    const { data, error } = await client()
      .from('consultations')
      .insert({ ...fields, beneficiary_id: consultation.beneficiary_id, service: consultation.service })
      .select('id')
      .single();
    if (error) fail(error);
    id = (data as { id: string }).id;
  }
  if (removedActIds.length > 0) {
    const { error } = await client().from('consultation_acts').delete().in('id', removedActIds);
    if (error) fail(error);
  }
  const added = acts.filter((a) => !a.id);
  if (added.length > 0) {
    const rows = added.map((a) => ({ consultation_id: id, act_code: a.act_code, tooth: a.tooth, quantity: a.quantity, notes: a.notes }));
    const { error } = await client().from('consultation_acts').insert(rows);
    if (error) fail(error);
  }
  return id!;
};

const DOCUMENT_COLUMNS = 'id, beneficiary_id, consultation_id, doc_type, serial, issued_on, author_name, content, cancelled_at, cancel_reason, created_at';

export const fetchDocuments = async (beneficiaryId: string): Promise<MedicalDocument[]> => {
  const { data, error } = await client()
    .from('documents')
    .select(DOCUMENT_COLUMNS)
    .eq('beneficiary_id', beneficiaryId)
    .order('created_at', { ascending: false });
  if (error) fail(error);
  return (data ?? []) as MedicalDocument[];
};

/**
 * Register of the documents issued, newest first, optionally of one type. The search looks for a
 * serial number (ORD-2026-…) or for the beneficiary's number or name.
 */
export const fetchDocumentRegister = async (docType: DocType | 'all', search: string): Promise<MedicalDocument[]> => {
  const words = search.trim().toLowerCase();
  const bySerial = /^[a-z]{2,3}-\d/.test(words);
  const byPerson = words !== '' && !bySerial;
  let query = client()
    .from('documents')
    .select(`${DOCUMENT_COLUMNS}, beneficiary:beneficiaries${byPerson ? '!inner' : ''}(id, external_id, last_name, first_name)`);
  if (docType !== 'all') query = query.eq('doc_type', docType);
  const pattern = `%${words.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  if (bySerial) query = query.ilike('serial', pattern);
  if (byPerson) query = query.ilike('beneficiary.search_text', pattern);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(300);
  if (error) fail(error);
  return ((data ?? []) as unknown as (MedicalDocument & { beneficiary: unknown })[]).map((d) => ({
    ...d,
    beneficiary: (Array.isArray(d.beneficiary) ? d.beneficiary[0] ?? null : d.beneficiary) as MedicalDocument['beneficiary'],
  }));
};

export const fetchDocument = async (id: string): Promise<MedicalDocument> => {
  const { data, error } = await client().from('documents').select(DOCUMENT_COLUMNS).eq('id', id).single();
  if (error) fail(error);
  return data as MedicalDocument;
};

/** Issues a document; the server gives its number and date. Returns the new document. */
export const issueDocument = async (
  beneficiaryId: string,
  docType: DocType,
  content: DocumentContent,
  consultationId: string | null,
): Promise<MedicalDocument> => {
  const { data, error } = await client()
    .from('documents')
    .insert({ beneficiary_id: beneficiaryId, doc_type: docType, content, consultation_id: consultationId })
    .select(DOCUMENT_COLUMNS)
    .single();
  if (error) fail(error);
  return data as MedicalDocument;
};

export const cancelDocument = async (id: string, reason: string) => {
  const { error } = await client()
    .from('documents')
    .update({ cancelled_at: new Date().toISOString(), cancel_reason: reason })
    .eq('id', id);
  if (error) fail(error);
};

/** Lines printed at the top of the documents (setting print_header). */
export const fetchPrintHeader = async (): Promise<string[]> => {
  const fallback = ['Sonatrach', 'Centre de Médecine du Travail'];
  if (!supabase) return fallback;
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'print_header').maybeSingle();
  const value = (data as { value?: unknown } | null)?.value;
  return Array.isArray(value) && value.every((l) => typeof l === 'string') ? (value as string[]) : fallback;
};
