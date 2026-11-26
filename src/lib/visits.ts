// Data access for occupational health visits and their schedule.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export const VISIT_TYPES = ['hiring', 'periodic', 'return_to_work', 'on_request'] as const;
export const DECISIONS = ['fit', 'fit_with_reservations', 'temporarily_unfit', 'permanently_unfit'] as const;
export const APPOINTMENT_STATUSES = ['scheduled', 'missed', 'done', 'cancelled'] as const;
export const URINE_RESULTS = ['negative', 'traces', 'plus1', 'plus2', 'plus3'] as const;

export type VisitType = (typeof VISIT_TYPES)[number];
export type Decision = (typeof DECISIONS)[number];
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/**
 * Systems examined at the visit, as on the paper form: questions asked (symptoms ticked, plus
 * free text) and what the doctor found (one text per item).
 */
export const SYSTEMS = [
  { key: 'skin', symptoms: ['allergy', 'itching', 'eczema'], exam: ['skin', 'mucosa'] },
  { key: 'eyes', symptoms: ['tearing', 'pain', 'spots', 'red_eye', 'fatigue'], exam: ['conjunctiva', 'cornea', 'pupils', 'fundus'] },
  { key: 'ent', symptoms: ['whistling', 'tonsillitis', 'epistaxis', 'hearing_loss', 'otorrhea', 'sneezing', 'rhinorrhea'], exam: ['nose', 'throat', 'ears'] },
  { key: 'locomotor', symptoms: ['muscle_pain', 'joint_pain', 'back_pain', 'neuralgia', 'discomfort', 'fatigability'], exam: ['mobility', 'strength'] },
  { key: 'respiratory', symptoms: ['cough', 'night_cough', 'dyspnea', 'sputum', 'chest_pain'], exam: ['auscultation', 'percussion'] },
  { key: 'cardio', symptoms: ['palpitations', 'edema', 'walking_pain', 'chest_pain', 'exertion_dyspnea', 'permanent_dyspnea'], exam: ['auscultation', 'varicose_veins', 'cyanosis', 'ecg'] },
  { key: 'digestive', symptoms: ['appetite', 'transit', 'heartburn', 'vomiting', 'rectal_bleeding', 'abdominal_pain'], exam: ['teeth', 'hernia', 'liver', 'abdomen'] },
  { key: 'urogenital', symptoms: ['nocturia', 'pollakiuria', 'hematuria', 'burning', 'discharge', 'menstruation'], exam: ['external_genitalia', 'breasts'] },
  { key: 'neuro', symptoms: ['sleep', 'headache', 'vertigo', 'fear_of_heights', 'fainting', 'paresis', 'paresthesia', 'tremor'], exam: ['romberg', 'coordination', 'sensitivity', 'motor', 'reflexes'] },
  { key: 'hemato', symptoms: ['bruising', 'bleeding'], exam: ['spleen', 'purpura', 'lymph_nodes'] },
  { key: 'endocrine', symptoms: ['family_obesity', 'family_thinness'], exam: ['thyroid'] },
] as const;

export type SystemKey = (typeof SYSTEMS)[number]['key'];

/** Urine dipstick, vision and hearing, kept together. */
export const MEASURE_KEYS = [
  'urine_albumin',
  'urine_sugar',
  'vision_far_right',
  'vision_far_left',
  'vision_near_right',
  'vision_near_left',
  'vision_corrected',
  'colors',
  'hearing_right',
  'hearing_left',
] as const;

export const EXPLORATION_KEYS = ['respiratory', 'circulatory', 'motor', 'radiology', 'biology', 'toxicology'] as const;

export interface Orientation {
  specialty?: string;
  purpose?: 'opinion' | 'treatment';
  hospitalisation?: boolean;
  service?: 'social' | 'employment';
  answer?: string;
}

export interface Visit {
  id?: string;
  beneficiary_id: string;
  visit_type: VisitType;
  visit_date: string;
  doctor_name?: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  pulse: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  measures: Record<string, string | boolean>;
  questionnaire: Record<string, { symptoms?: string[]; other?: string }>;
  examination: Record<string, Record<string, string>>;
  explorations: Record<string, string>;
  orientation: Orientation;
  decision: Decision | null;
  unfit_until: string | null;
  restrictions: string | null;
  recommended_positions: string | null;
  unsuitable_positions: string | null;
  next_visit_date: string | null;
  notes: string | null;
  created_at?: string;
}

export interface Appointment {
  id: string;
  beneficiary_id: string;
  visit_type: VisitType;
  scheduled_on: string;
  status: AppointmentStatus;
  reminder_on: string | null;
  notes: string | null;
  visit_id: string | null;
  beneficiary?: { id: string; external_id: string | null; last_name: string; first_name: string; company: string | null; unit: string | null } | null;
}

export interface DueVisit {
  beneficiary_id: string;
  external_id: string | null;
  last_name: string;
  first_name: string;
  category: string;
  company: string | null;
  unit: string | null;
  last_visit_on: string | null;
  last_visit_type: VisitType | null;
  due_on: string | null;
  appointment_id: string | null;
  appointment_on: string | null;
  appointment_status: AppointmentStatus | null;
}

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string; code?: string } | null): never => {
  if (error?.code === '23505') throw new Error(i18n.t('visits.schedule.alreadyOpen'));
  throw new Error(error?.message || i18n.t('common.requestFailed'));
};

/** Today in the user's time zone, as YYYY-MM-DD. */
export const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const addMonths = (date: string, months: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
};

/** Body mass index, rounded to one decimal, or null when weight or height is missing. */
export const bmi = (weightKg: number | null, heightCm: number | null) =>
  weightKg && heightCm ? Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10 : null;

export const emptyVisit = (beneficiaryId: string): Visit => ({
  beneficiary_id: beneficiaryId,
  visit_type: 'periodic',
  visit_date: today(),
  weight_kg: null,
  height_cm: null,
  pulse: null,
  bp_systolic: null,
  bp_diastolic: null,
  measures: {},
  questionnaire: {},
  examination: {},
  explorations: {},
  orientation: {},
  decision: null,
  unfit_until: null,
  restrictions: null,
  recommended_positions: null,
  unsuitable_positions: null,
  next_visit_date: addMonths(today(), 12),
  notes: null,
});

export const fetchVisits = async (beneficiaryId: string): Promise<Visit[]> => {
  const { data, error } = await client()
    .from('visits')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) fail(error);
  return (data ?? []) as Visit[];
};

export const fetchVisit = async (id: string): Promise<Visit> => {
  const { data, error } = await client().from('visits').select('*').eq('id', id).single();
  if (error) fail(error);
  return data as Visit;
};

/** Columns the doctor fills in; the server writes the doctor's name, the dates and the authors. */
const VISIT_COLUMNS = [
  'visit_type',
  'visit_date',
  'weight_kg',
  'height_cm',
  'pulse',
  'bp_systolic',
  'bp_diastolic',
  'measures',
  'questionnaire',
  'examination',
  'explorations',
  'orientation',
  'decision',
  'unfit_until',
  'restrictions',
  'recommended_positions',
  'unsuitable_positions',
  'next_visit_date',
  'notes',
] as const;

/** Drops the empty answers of the per-system questions and examination. */
const compact = <T extends Record<string, Record<string, unknown>>>(bySystem: T) => {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [system, values] of Object.entries(bySystem)) {
    const kept = Object.fromEntries(
      Object.entries(values).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : v != null)),
    );
    if (Object.keys(kept).length > 0) out[system] = kept;
  }
  return out;
};

/** Saves a visit; returns its id. */
export const saveVisit = async (visit: Visit): Promise<string> => {
  const fields: Record<string, unknown> = Object.fromEntries(VISIT_COLUMNS.map((c) => [c, visit[c]]));
  fields.questionnaire = compact(visit.questionnaire);
  fields.examination = compact(visit.examination);
  if (visit.id) {
    const { error } = await client().from('visits').update(fields).eq('id', visit.id);
    if (error) fail(error);
    return visit.id;
  }
  const { data, error } = await client()
    .from('visits')
    .insert({ ...fields, beneficiary_id: visit.beneficiary_id })
    .select('id')
    .single();
  if (error) fail(error);
  return (data as { id: string }).id;
};

export const fetchDueVisits = async (until: string, includeNever: boolean, search: string): Promise<DueVisit[]> => {
  const { data, error } = await client().rpc('visits_due', {
    p_until: until,
    p_include_never: includeNever,
    p_search: search.trim() || null,
    p_limit: 500,
  });
  if (error) fail(error);
  return (data ?? []) as DueVisit[];
};

export const fetchAppointments = async (status: AppointmentStatus | 'all'): Promise<Appointment[]> => {
  let query = client()
    .from('visit_appointments')
    .select('*, beneficiary:beneficiaries(id, external_id, last_name, first_name, company, unit)');
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query.order('scheduled_on', { ascending: status !== 'done' }).limit(500);
  if (error) fail(error);
  return (data ?? []) as Appointment[];
};

export const createAppointments = async (
  beneficiaryIds: string[],
  scheduledOn: string,
  visitType: VisitType,
  notes: string | null,
) => {
  const rows = beneficiaryIds.map((beneficiary_id) => ({ beneficiary_id, scheduled_on: scheduledOn, visit_type: visitType, notes }));
  const { error } = await client().from('visit_appointments').insert(rows);
  if (error) fail(error);
};

export const updateAppointment = async (
  id: string,
  changes: Partial<Pick<Appointment, 'scheduled_on' | 'status' | 'reminder_on' | 'notes'>>,
) => {
  const { error } = await client().from('visit_appointments').update(changes).eq('id', id);
  if (error) fail(error);
};
