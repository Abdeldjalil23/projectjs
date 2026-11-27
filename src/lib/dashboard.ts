// Data for the dashboards: what happened today and what needs attention. Every query goes through
// the same row level security as the other pages, so each account only counts what it may read.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';
import type { DocType, Nature, Service } from '@/lib/consultations';
import type { PersonRef } from '@/lib/beneficiaries';
import type { VisitType } from '@/lib/visits';

/** Most rows shown in a list of the day; the counts above them stay exact. */
export const DAY_LIST_LIMIT = 200;

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string } | null): never => {
  throw new Error(error?.message || i18n.t('common.requestFailed'));
};

/** Supabase returns a joined row as an object or, for some relations, as a one-item array. */
const one = <T>(value: T | T[] | null | undefined): T | null => (Array.isArray(value) ? value[0] ?? null : value ?? null);

export interface DayConsultation {
  id: string;
  service: Service;
  nature: Nature | null;
  reason: string | null;
  author_name: string | null;
  created_at: string;
  beneficiary: PersonRef | null;
}

export interface DayDocument {
  id: string;
  doc_type: DocType;
  serial: string;
  author_name: string | null;
  cancelled_at: string | null;
  beneficiary: PersonRef | null;
}

export interface DayAppointment {
  id: string;
  visit_type: VisitType;
  status: string;
  beneficiary: PersonRef | null;
}

const PERSON = 'beneficiary:beneficiaries(id, external_id, last_name, first_name)';

/** Consultations of the day in the services the account may read, newest first. */
export const fetchDayConsultations = async (day: string): Promise<DayConsultation[]> => {
  const { data, error } = await client()
    .from('consultations')
    .select(`id, service, nature, reason, author_name, created_at, ${PERSON}`)
    .eq('consultation_date', day)
    .order('created_at', { ascending: false })
    .limit(DAY_LIST_LIMIT);
  if (error) fail(error);
  return ((data ?? []) as unknown as (DayConsultation & { beneficiary: unknown })[]).map((c) => ({
    ...c,
    beneficiary: one(c.beneficiary as PersonRef | PersonRef[] | null),
  }));
};

/** Documents issued on the day, newest first. */
export const fetchDayDocuments = async (day: string): Promise<DayDocument[]> => {
  const { data, error } = await client()
    .from('documents')
    .select(`id, doc_type, serial, author_name, cancelled_at, ${PERSON}`)
    .eq('issued_on', day)
    .order('created_at', { ascending: false })
    .limit(DAY_LIST_LIMIT);
  if (error) fail(error);
  return ((data ?? []) as unknown as (DayDocument & { beneficiary: unknown })[]).map((d) => ({
    ...d,
    beneficiary: one(d.beneficiary as PersonRef | PersonRef[] | null),
  }));
};

/** Visits planned for the day that have not taken place yet. */
export const fetchDayAppointments = async (day: string): Promise<DayAppointment[]> => {
  const { data, error } = await client()
    .from('visit_appointments')
    .select(`id, visit_type, status, ${PERSON}`)
    .eq('scheduled_on', day)
    .eq('status', 'scheduled')
    .order('created_at')
    .limit(DAY_LIST_LIMIT);
  if (error) fail(error);
  return ((data ?? []) as unknown as (DayAppointment & { beneficiary: unknown })[]).map((a) => ({
    ...a,
    beneficiary: one(a.beneficiary as PersonRef | PersonRef[] | null),
  }));
};

const count = async (query: PromiseLike<{ count: number | null; error: { message?: string } | null }>) => {
  const { count: n, error } = await query;
  if (error) fail(error);
  return n ?? 0;
};

/** Beneficiaries who can receive care. */
export const countActiveBeneficiaries = () =>
  count(client().from('beneficiaries').select('id', { count: 'exact', head: true }).eq('active', true));

/** Visits whose date has passed without the person coming. */
export const countMissedAppointments = () =>
  count(client().from('visit_appointments').select('id', { count: 'exact', head: true }).eq('status', 'missed'));

/** People whose periodic visit is due by the day and who have no visit planned yet. */
export const countDueVisits = async (day: string) => {
  const { data, error } = await client().rpc('visits_due', {
    p_until: day,
    p_include_never: false,
    p_search: null,
    p_limit: 1000,
  });
  if (error) fail(error);
  return ((data ?? []) as { appointment_id: string | null }[]).filter((v) => !v.appointment_id).length;
};
