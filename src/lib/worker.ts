// Data access of the workers' app (/app). It has its own Supabase client: the worker stays signed
// in on their phone (localStorage), while the staff platform keeps its session per browser tab.
// Workers reach nothing but the worker_* functions of
// supabase/migrations/20261129000001_worker_app.sql.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import i18n from '@/i18n';
import type { CareState } from '@/lib/careRequests';

const url = import.meta.env.VITE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const storage = (() => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
})();

export const workerClient: SupabaseClient | null =
  url && publicKey
    ? createClient(url as string, publicKey as string, {
        auth: { persistSession: true, autoRefreshToken: true, storage, storageKey: 'medsuite-worker-auth' },
      })
    : null;

const client = () => {
  if (!workerClient) throw new Error(i18n.t('common.serverNotConfigured'));
  return workerClient;
};

/** Same rule as the server: the number, in lower case, with any other sign turned into « - ». */
export const workerLogin = (matricule: string) => matricule.trim().replace(/[^A-Za-z0-9._-]/g, '-').toLowerCase();
const workerEmail = (matricule: string) => `${workerLogin(matricule)}@worker.medsuite.local`;

const SERVER_ERRORS: [RegExp, string][] = [
  [/Not a worker account/, 'worker.errors.notWorker'],
  [/not in your family/, 'worker.errors.notFamily'],
  [/contracted doctor is not active/, 'careRequests.errors.doctorInactive'],
  [/beneficiary is not active/, 'careRequests.errors.beneficiaryInactive'],
  [/Invalid number or activation code/, 'worker.errors.invalidCode'],
  [/8 to 72 characters/, 'worker.errors.password'],
  [/within the next 90 days/, 'worker.errors.appointmentDay'],
  [/Too many requests waiting/, 'worker.errors.tooManyRequests'],
  [/cannot be cancelled/, 'worker.errors.cannotCancel'],
];

const fail = (error: { message?: string } | null): never => {
  const message = error?.message ?? '';
  const known = SERVER_ERRORS.find(([pattern]) => pattern.test(message));
  throw new Error(known ? i18n.t(known[1]) : message || i18n.t('common.requestFailed'));
};

export interface WorkerPerson {
  id: string;
  external_id: string | null;
  last_name: string;
  first_name: string;
  category?: string;
  relationship?: string | null;
  birth_date?: string | null;
}

export interface WorkerProfile {
  me: WorkerPerson;
  family: WorkerPerson[];
}

export interface WorkerRequest {
  id: string;
  number: string;
  beneficiary_id: string;
  beneficiary_name: string;
  prestation: string;
  notes: string | null;
  source: 'platform' | 'app';
  status: 'pending' | 'approved' | 'refused';
  state: CareState;
  refusal_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  valid_until: string | null;
  used_at: string | null;
  qr_token: string | null;
  doctor_name: string;
  doctor_specialty: string;
  doctor_address: string | null;
  doctor_phone: string | null;
}

export interface WorkerDoctor {
  id: string;
  full_name: string;
  specialty: string;
  address: string | null;
  phone: string | null;
}

export interface WorkerAppointment {
  id: string;
  beneficiary_name: string;
  /** Visit of occupational medicine, or consultation appointment with a doctor and a time. */
  kind: 'visit' | 'consultation';
  visit_type: string | null;
  service: 'general' | 'dental' | 'psychology' | 'nursing' | null;
  scheduled_on: string | null;
  starts_at: string | null;
  preferred_date: string | null;
  preferred_slot: 'morning' | 'afternoon' | null;
  staff_name: string | null;
  reason: string | null;
  cancel_reason: string | null;
  status: 'requested' | 'scheduled' | 'missed' | 'done' | 'cancelled';
  can_cancel: boolean;
}

export interface WorkerNotification {
  id: number;
  kind:
    | 'care_request_created'
    | 'care_request_approved'
    | 'care_request_refused'
    | 'care_request_used'
    | 'appointment_scheduled'
    | 'appointment_moved'
    | 'appointment_cancelled';
  data: {
    request_id?: string;
    number?: string;
    prestation?: string;
    reason?: string | null;
    valid_until?: string | null;
    beneficiary?: string;
    appointment_id?: string;
    service?: string;
    starts_at?: string | null;
    staff?: string | null;
  };
  read_at: string | null;
  created_at: string;
}

export interface WorkerContact {
  label: string;
  phone?: string;
  hours?: string;
}

export const workerSignIn = async (matricule: string, password: string) => {
  const { error } = await client().auth.signInWithPassword({ email: workerEmail(matricule), password });
  if (error) {
    if (error.status === 429) throw new Error(i18n.t('login.errors.tooMany'));
    if (error.status === 400 || error.code === 'invalid_credentials') throw new Error(i18n.t('worker.errors.invalidLogin'));
    throw new Error(i18n.t('login.errors.network'));
  }
};

export const workerSignOut = async () => {
  await client().auth.signOut({ scope: 'local' });
};

/** First sign-in, or a new password: the code given by the centre and the password chosen. */
export const activateWorker = async (matricule: string, code: string, password: string) => {
  const { data, error } = await client().functions.invoke('worker-access', { body: { matricule, code, password } });
  if (error) {
    // The function answers 400 with { error } for a wrong code; read it to say why.
    const context = (error as { context?: Response }).context;
    const body = context ? await context.json().catch(() => null) : null;
    if (body?.error) fail({ message: body.error });
    throw new Error(i18n.t('worker.errors.activationUnavailable'));
  }
  return data as { login: string };
};

export const fetchWorkerProfile = async (): Promise<WorkerProfile> => {
  const { data, error } = await client().rpc('worker_me');
  if (error) fail(error);
  return data as WorkerProfile;
};

export const fetchWorkerRequests = async (): Promise<WorkerRequest[]> => {
  const { data, error } = await client().rpc('worker_care_requests');
  if (error) fail(error);
  return (data ?? []) as WorkerRequest[];
};

export const createWorkerRequest = async (input: { beneficiary_id: string; doctor_id: string; prestation: string; notes: string | null }) => {
  const { data, error } = await client().rpc('worker_create_care_request', {
    p_beneficiary_id: input.beneficiary_id,
    p_doctor_id: input.doctor_id,
    p_prestation: input.prestation.trim(),
    p_notes: input.notes?.trim() || null,
  });
  if (error) fail(error);
  return ((data ?? []) as { id: string; number: string }[])[0];
};

export const fetchWorkerDoctors = async (): Promise<WorkerDoctor[]> => {
  const { data, error } = await client().rpc('worker_doctors');
  if (error) fail(error);
  return (data ?? []) as WorkerDoctor[];
};

export const fetchWorkerAppointments = async (): Promise<WorkerAppointment[]> => {
  const { data, error } = await client().rpc('worker_appointments');
  if (error) fail(error);
  return (data ?? []) as WorkerAppointment[];
};

/** The worker asks for an appointment; the centre books the time and the doctor. */
export const requestWorkerAppointment = async (input: {
  beneficiary_id: string;
  service: string;
  preferred_date: string;
  slot: 'morning' | 'afternoon' | null;
  reason: string | null;
}) => {
  const { error } = await client().rpc('worker_request_appointment', {
    p_beneficiary_id: input.beneficiary_id,
    p_service: input.service,
    p_preferred_date: input.preferred_date,
    p_slot: input.slot,
    p_reason: input.reason?.trim() || null,
  });
  if (error) fail(error);
};

export const cancelWorkerAppointment = async (id: string) => {
  const { error } = await client().rpc('worker_cancel_appointment', { p_id: id });
  if (error) fail(error);
};

export const fetchWorkerNotifications = async (): Promise<WorkerNotification[]> => {
  const { data, error } = await client().rpc('worker_notifications');
  if (error) fail(error);
  return (data ?? []) as WorkerNotification[];
};

export const markWorkerNotificationsRead = async () => {
  const { error } = await client().rpc('worker_read_notifications');
  if (error) fail(error);
};

/** Contacts of the centre (setting worker_contacts) and the centre's name lines (print_header). */
export const fetchWorkerContacts = async (): Promise<{ contacts: WorkerContact[]; centre: string[] }> => {
  const { data, error } = await client().from('app_settings').select('key, value').in('key', ['worker_contacts', 'print_header']);
  if (error) fail(error);
  const values = new Map((data ?? []).map((row) => [row.key as string, row.value as unknown]));
  const contacts = values.get('worker_contacts');
  const centre = values.get('print_header');
  return {
    contacts: Array.isArray(contacts)
      ? (contacts as WorkerContact[]).filter((c) => c && typeof c.label === 'string')
      : [],
    centre: Array.isArray(centre) ? (centre as string[]).filter((l) => typeof l === 'string') : [],
  };
};
