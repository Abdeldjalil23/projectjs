// Staff side of the workers' app: activation codes and the state of a worker's access.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

/** Categories that can have an app account; dependents use their worker's. */
export const WORKER_CATEGORIES = ['agent', 'retraite', 'contractor_agent'];

export interface WorkerAccess {
  has_account: boolean;
  active: boolean;
  created_at: string | null;
  last_seen_at: string | null;
  pending_until: string | null;
}

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string } | null): never => {
  const message = error?.message ?? '';
  if (/needs a number/.test(message)) throw new Error(i18n.t('workerAccess.errors.noNumber'));
  if (/Only workers and retirees/.test(message)) throw new Error(i18n.t('workerAccess.errors.notWorker'));
  if (/Not allowed/.test(message)) throw new Error(i18n.t('workerAccess.errors.notAllowed'));
  throw new Error(message || i18n.t('common.requestFailed'));
};

export const fetchWorkerAccess = async (beneficiaryId: string): Promise<WorkerAccess> => {
  const { data, error } = await client().rpc('worker_access_status', { p_beneficiary_id: beneficiaryId });
  if (error) fail(error);
  return ((data ?? []) as WorkerAccess[])[0] ?? { has_account: false, active: false, created_at: null, last_seen_at: null, pending_until: null };
};

export const createActivationCode = async (beneficiaryId: string) => {
  const { data, error } = await client().rpc('create_worker_invitation', { p_beneficiary_id: beneficiaryId });
  if (error) fail(error);
  return ((data ?? []) as { code: string; expires_at: string; matricule: string }[])[0];
};

export const setWorkerAccess = async (beneficiaryId: string, active: boolean) => {
  const { error } = await client().rpc('set_worker_access', { p_beneficiary_id: beneficiaryId, p_active: active });
  if (error) fail(error);
};

/** Link of the activation QR code: the app opens with the number and the code filled in. */
export const activationLink = (matricule: string, code: string) =>
  `${window.location.origin}/app/activate?m=${encodeURIComponent(matricule)}&c=${encodeURIComponent(code)}`;
