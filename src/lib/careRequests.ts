// Data access for care coverage requests (Prise en charge) and the contracted doctors they are
// sent to. The server numbers the requests, reviews them through review_care_request and checks
// the QR code through verify_care_request / use_care_request (supabase/migrations/
// 20261127000001_care_requests.sql). The same calls will serve the workers' app.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';
import type { Category, PersonRef } from '@/lib/beneficiaries';
import { today } from '@/lib/visits';

/** States as people see them. "used" and "expired" are worked out from the approved requests. */
export const CARE_STATES = ['pending', 'approved', 'used', 'expired', 'refused'] as const;
export type CareState = (typeof CARE_STATES)[number];

export const PAGE_SIZE = 50;

export interface ContractedDoctor {
  id?: string;
  full_name: string;
  specialty: string;
  address: string | null;
  phone: string | null;
  notes: string | null;
  active: boolean;
}

export interface CareRequest {
  id: string;
  number: string;
  beneficiary_id: string;
  contracted_doctor_id: string;
  prestation: string;
  notes: string | null;
  source: 'platform' | 'app';
  status: 'pending' | 'approved' | 'refused';
  requester_name: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewer_name: string | null;
  refusal_reason: string | null;
  qr_token: string | null;
  valid_until: string | null;
  used_at: string | null;
  use_count: number;
  beneficiary: (PersonRef & { category: Category; unit: string | null; company: string | null }) | null;
  doctor: Omit<ContractedDoctor, 'notes' | 'active'> | null;
}

export interface NewCareRequest {
  beneficiary_id: string;
  contracted_doctor_id: string;
  prestation: string;
  notes: string | null;
}

/** What the verification page shows: no medical information. */
export interface CareCheck {
  number: string;
  state: Exclude<CareState, 'pending' | 'refused'>;
  beneficiary_name: string;
  beneficiary_number: string | null;
  doctor_name: string;
  doctor_specialty: string;
  valid_until: string;
  used_at: string | null;
  use_count: number;
}

/** The rules of the coverage, from the application settings. */
export interface CareSettings {
  validityDays: number;
  singleUse: boolean;
  refusalReasons: string[];
}

const DEFAULT_SETTINGS: CareSettings = {
  validityDays: 30,
  singleUse: true,
  refusalReasons: ['Dossier incomplet', 'Hors convention', 'Prestation non couverte', 'Autre'],
};

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

/** Server messages in the language of the interface. */
const SERVER_ERRORS: [RegExp, string][] = [
  [/already been used/, 'careRequests.errors.alreadyUsed'],
  [/has expired/, 'careRequests.errors.expired'],
  [/Unknown care coverage/, 'careRequests.errors.unknown'],
  [/already been reviewed/, 'careRequests.errors.alreadyReviewed'],
  [/contracted doctor is not active/, 'careRequests.errors.doctorInactive'],
  [/beneficiary is not active/, 'careRequests.errors.beneficiaryInactive'],
  [/reason is needed/, 'careRequests.errors.reasonNeeded'],
];

const fail = (error: { message?: string } | null): never => {
  const message = error?.message ?? '';
  const known = SERVER_ERRORS.find(([pattern]) => pattern.test(message));
  throw new Error(known ? i18n.t(known[1]) : message || i18n.t('common.requestFailed'));
};

/** Supabase returns a joined row as an object or, for some relations, as a one-item array. */
const one = <T>(value: T | T[] | null | undefined): T | null => (Array.isArray(value) ? value[0] ?? null : value ?? null);

/** State of a request, the same way the server works it out (care_request_state). */
export const careState = (
  request: Pick<CareRequest, 'status' | 'used_at' | 'valid_until'>,
  singleUse: boolean,
  day: string = today(),
): CareState => {
  if (request.status !== 'approved') return request.status;
  if (request.used_at && singleUse) return 'used';
  if (request.valid_until && request.valid_until < day) return 'expired';
  return 'approved';
};

/** Link printed in the QR code. It opens the public verification page of this platform. */
export const verifyUrl = (token: string) => `${window.location.origin}/verify/${token}`;

export const fetchCareSettings = async (): Promise<CareSettings> => {
  const { data, error } = await client()
    .from('app_settings')
    .select('key, value')
    .in('key', ['care_request_validity_days', 'care_request_single_use', 'care_request_refusal_reasons']);
  if (error) fail(error);
  const values = new Map((data ?? []).map((row) => [row.key as string, row.value as unknown]));
  const days = values.get('care_request_validity_days');
  const single = values.get('care_request_single_use');
  const reasons = values.get('care_request_refusal_reasons');
  return {
    validityDays: typeof days === 'number' && days >= 1 ? Math.floor(days) : DEFAULT_SETTINGS.validityDays,
    singleUse: typeof single === 'boolean' ? single : DEFAULT_SETTINGS.singleUse,
    refusalReasons:
      Array.isArray(reasons) && reasons.every((r) => typeof r === 'string') && reasons.length > 0
        ? (reasons as string[])
        : DEFAULT_SETTINGS.refusalReasons,
  };
};

const COLUMNS =
  'id, number, beneficiary_id, contracted_doctor_id, prestation, notes, source, status, requester_name, created_at, ' +
  'reviewed_at, reviewer_name, refusal_reason, qr_token, valid_until, used_at, use_count, ' +
  'doctor:contracted_doctors(id, full_name, specialty, address, phone)';
const PERSON = 'beneficiary:beneficiaries(id, external_id, last_name, first_name, category, unit, company)';
// With a search, only the requests whose beneficiary matches are kept.
const PERSON_FILTERED = PERSON.replace('beneficiaries(', 'beneficiaries!inner(');

const toRequest = (row: unknown): CareRequest => {
  const r = row as CareRequest & { beneficiary: unknown; doctor: unknown };
  return {
    ...r,
    beneficiary: one(r.beneficiary as CareRequest['beneficiary'] | CareRequest['beneficiary'][]),
    doctor: one(r.doctor as CareRequest['doctor'] | CareRequest['doctor'][]),
  };
};

/** Keeps the requests of a state. Used / expired only exist among approved requests. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the query builder type changes with every filter
const filterState = (query: any, state: CareState, singleUse: boolean, day: string) => {
  switch (state) {
    case 'pending':
    case 'refused':
      return query.eq('status', state);
    case 'used':
      return singleUse ? query.eq('status', 'approved').not('used_at', 'is', null) : query.eq('status', 'approved').is('id', null);
    case 'expired':
      query = query.eq('status', 'approved').lt('valid_until', day);
      return singleUse ? query.is('used_at', null) : query;
    case 'approved':
      query = query.eq('status', 'approved').gte('valid_until', day);
      return singleUse ? query.is('used_at', null) : query;
  }
};

const searchTerms = (search: string) =>
  search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => `%${word.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);

export const fetchCareRequests = async ({
  state,
  search,
  page,
  singleUse,
}: {
  state: CareState | 'all';
  search: string;
  page: number;
  singleUse: boolean;
}) => {
  const words = search.trim();
  const byNumber = /^pec-/i.test(words);
  let query = client()
    .from('care_requests')
    .select(`${COLUMNS}, ${words && !byNumber ? PERSON_FILTERED : PERSON}`, { count: 'exact' });
  if (state !== 'all') query = filterState(query, state, singleUse, today());
  if (byNumber) query = query.ilike('number', `${words.replace(/[%_\\]/g, '')}%`);
  else for (const term of searchTerms(words)) query = query.ilike('beneficiary.search_text', term);
  const from = page * PAGE_SIZE;
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) fail(error);
  return { rows: (data ?? []).map(toRequest), total: count ?? 0 };
};

/** Number of requests in each state, for the counters above the list. */
export const countCareRequests = async (singleUse: boolean): Promise<Record<CareState, number>> => {
  const day = today();
  const counts = await Promise.all(
    CARE_STATES.map(async (state) => {
      const { count, error } = await filterState(client().from('care_requests').select('id', { count: 'exact', head: true }), state, singleUse, day);
      if (error) fail(error);
      return [state, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<CareState, number>;
};

export const countPendingCareRequests = async () => {
  const { count, error } = await client().from('care_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  if (error) fail(error);
  return count ?? 0;
};

export const fetchCareRequest = async (id: string): Promise<CareRequest> => {
  const { data, error } = await client().from('care_requests').select(`${COLUMNS}, ${PERSON}`).eq('id', id).single();
  if (error) fail(error);
  return toRequest(data);
};

export const createCareRequest = async (input: NewCareRequest): Promise<{ id: string; number: string }> => {
  const { data, error } = await client()
    .from('care_requests')
    .insert({ ...input, prestation: input.prestation.trim(), notes: input.notes?.trim() || null })
    .select('id, number')
    .single();
  if (error) fail(error);
  return data as { id: string; number: string };
};

export const reviewCareRequest = async (id: string, approve: boolean, reason?: string) => {
  const { data, error } = await client().rpc('review_care_request', { p_id: id, p_approve: approve, p_reason: reason ?? null });
  if (error) fail(error);
  return data as { number: string; status: CareRequest['status']; valid_until: string | null };
};

/** Checks the token of a QR code. Null when it matches no approved coverage. */
export const verifyCareRequest = async (token: string): Promise<CareCheck | null> => {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const { data, error } = await client().rpc('verify_care_request', { p_token: token });
  if (error) fail(error);
  return ((data ?? []) as CareCheck[])[0] ?? null;
};

/** Records that the contracted doctor used the coverage. */
export const recordCareUse = async (token: string): Promise<CareCheck> => {
  const { data, error } = await client().rpc('use_care_request', { p_token: token });
  if (error) fail(error);
  const row = ((data ?? []) as CareCheck[])[0];
  if (!row) throw new Error(i18n.t('careRequests.errors.unknown'));
  return row;
};

export const fetchContractedDoctors = async ({ activeOnly = false } = {}): Promise<ContractedDoctor[]> => {
  let query = client().from('contracted_doctors').select('id, full_name, specialty, address, phone, notes, active');
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query.order('full_name').limit(1000);
  if (error) fail(error);
  return (data ?? []) as ContractedDoctor[];
};

export const saveContractedDoctor = async (doctor: ContractedDoctor) => {
  const fields = {
    full_name: doctor.full_name.trim(),
    specialty: doctor.specialty.trim(),
    address: doctor.address?.trim() || null,
    phone: doctor.phone?.trim() || null,
    notes: doctor.notes?.trim() || null,
    active: doctor.active,
  };
  const { error } = doctor.id
    ? await client().from('contracted_doctors').update(fields).eq('id', doctor.id)
    : await client().from('contracted_doctors').insert(fields);
  if (error) fail(error);
};

/** Active beneficiaries matching a search, for choosing who a request is for. */
export const searchActiveBeneficiaries = async (search: string): Promise<PersonRef[]> => {
  let query = client().from('beneficiaries').select('id, external_id, last_name, first_name').eq('active', true);
  for (const term of searchTerms(search)) query = query.ilike('search_text', term);
  const { data, error } = await query.order('last_name').limit(8);
  if (error) fail(error);
  return (data ?? []) as PersonRef[];
};
