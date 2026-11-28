// Appointments of the centre's consultations, with the doctor and the time
// (supabase/migrations/20261130000001_appointments.sql). Times are the centre's: Algeria keeps
// UTC+1 all year, so a day and a time typed here are sent with « +01:00 ».
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';
import type { PersonRef } from '@/lib/beneficiaries';

export const APPOINTMENT_SERVICES = ['general', 'dental', 'psychology', 'nursing'] as const;
export type AppointmentService = (typeof APPOINTMENT_SERVICES)[number];
export const APPOINTMENT_STATUSES = ['requested', 'scheduled', 'done', 'missed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
export const DURATIONS = [10, 15, 20, 30, 45, 60] as const;

export interface Appointment {
  id: string;
  beneficiary_id: string;
  service: AppointmentService;
  status: AppointmentStatus;
  preferred_date: string | null;
  preferred_slot: 'morning' | 'afternoon' | null;
  starts_at: string | null;
  duration_minutes: number;
  staff_id: string | null;
  staff_name: string | null;
  reason: string | null;
  notes: string | null;
  cancel_reason: string | null;
  source: 'platform' | 'app';
  created_at: string;
  beneficiary: PersonRef | null;
}

export interface StaffMember {
  id: string;
  full_name: string;
  role_code: string;
}

export interface AppointmentInput {
  beneficiary_id: string;
  service: AppointmentService;
  date: string;
  time: string;
  duration_minutes: number;
  staff_id: string | null;
  reason: string | null;
  notes: string | null;
}

const OFFSET = '+01:00';
const HOUR = 3_600_000;

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string } | null): never => {
  const message = error?.message ?? '';
  if (/already has an appointment/.test(message)) throw new Error(i18n.t('appointments.errors.overlap'));
  if (/needs a day and a time/.test(message)) throw new Error(i18n.t('appointments.errors.time'));
  throw new Error(message || i18n.t('common.requestFailed'));
};

/** The moment of a day and a time at the centre. */
export const startsAt = (date: string, time: string) => `${date}T${time}:00${OFFSET}`;

/** Day (YYYY-MM-DD) and time (HH:MM) at the centre of a moment. */
export const centreParts = (iso: string) => {
  const shifted = new Date(new Date(iso).getTime() + HOUR).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
};

/** Next day (YYYY-MM-DD). */
export const nextDay = (date: string, days = 1) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const COLUMNS =
  'id, beneficiary_id, service, status, preferred_date, preferred_slot, starts_at, duration_minutes, staff_id, staff_name, reason, notes, cancel_reason, source, created_at, ' +
  'beneficiary:beneficiaries(id, external_id, last_name, first_name)';

const toAppointment = (row: unknown): Appointment => {
  const r = row as Appointment & { beneficiary: unknown };
  const b = r.beneficiary as PersonRef | PersonRef[] | null;
  return { ...r, beneficiary: Array.isArray(b) ? b[0] ?? null : b };
};

/** Appointments of a day at the centre, by time; cancelled ones last. */
export const fetchDayAppointments = async (day: string, service: AppointmentService | 'all'): Promise<Appointment[]> => {
  let query = client()
    .from('appointments')
    .select(COLUMNS)
    .gte('starts_at', `${day}T00:00:00${OFFSET}`)
    .lt('starts_at', `${nextDay(day)}T00:00:00${OFFSET}`);
  if (service !== 'all') query = query.eq('service', service);
  const { data, error } = await query.order('starts_at').limit(500);
  if (error) fail(error);
  return (data ?? []).map(toAppointment).sort((a, b) => Number(a.status === 'cancelled') - Number(b.status === 'cancelled'));
};

/** Requests made in the workers' app, oldest first. */
export const fetchRequestedAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await client().from('appointments').select(COLUMNS).eq('status', 'requested').order('created_at').limit(500);
  if (error) fail(error);
  return (data ?? []).map(toAppointment);
};

export const countRequestedAppointments = async () => {
  const { count, error } = await client().from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'requested');
  if (error) fail(error);
  return count ?? 0;
};

/** Doctors an appointment of the service can be booked with. */
export const fetchAppointmentStaff = async (service: AppointmentService): Promise<StaffMember[]> => {
  const { data, error } = await client().rpc('appointment_staff', { p_service: service });
  if (error) fail(error);
  return (data ?? []) as StaffMember[];
};

const fields = (input: AppointmentInput) => ({
  service: input.service,
  starts_at: startsAt(input.date, input.time),
  duration_minutes: input.duration_minutes,
  staff_id: input.staff_id,
  reason: input.reason?.trim() || null,
  notes: input.notes?.trim() || null,
});

export const createAppointment = async (input: AppointmentInput) => {
  const { error } = await client()
    .from('appointments')
    .insert({ ...fields(input), beneficiary_id: input.beneficiary_id, status: 'scheduled' });
  if (error) fail(error);
};

/** Books a requested appointment, or changes the time or the doctor of a booked one. */
export const scheduleAppointment = async (id: string, input: AppointmentInput) => {
  const { error } = await client()
    .from('appointments')
    .update({ ...fields(input), status: 'scheduled', cancel_reason: null })
    .eq('id', id);
  if (error) fail(error);
};

export const setAppointmentStatus = async (id: string, status: Exclude<AppointmentStatus, 'requested' | 'scheduled'>, cancelReason?: string) => {
  const { error } = await client()
    .from('appointments')
    .update({ status, cancel_reason: status === 'cancelled' ? cancelReason?.trim() || null : null })
    .eq('id', id);
  if (error) fail(error);
};
