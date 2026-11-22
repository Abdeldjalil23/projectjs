// Data access for staff accounts, roles and permissions (Supabase).
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface StaffRole {
  id: string;
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  is_system: boolean;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
  is_medical: boolean;
}

export interface StaffAccount {
  id: string;
  staff_id: string | null;
  full_name: string;
  specialty: string | null;
  active: boolean;
  created_at: string;
  role: Pick<StaffRole, 'id' | 'code' | 'name_en'> | null;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

const ROLE_ORDER = ['admin', 'doctor', 'nurse', 'dentist', 'psychologist', 'social_worker', 'contracted_doctor'];

const client = () => {
  if (!supabase) throw new Error('The server is not configured.');
  return supabase;
};

/** Turns a database or network error into a message for the screen. */
const fail = (error: { message?: string } | null): never => {
  throw new Error(error?.message || 'The request failed. Please try again.');
};

export const fetchAccounts = async (): Promise<StaffAccount[]> => {
  const { data, error } = await client()
    .from('profiles')
    .select('id, staff_id, full_name, specialty, active, created_at, role:roles(id, code, name_en)')
    .order('staff_id', { ascending: true });
  if (error) fail(error);
  return (data ?? []).map((row) => ({
    ...row,
    role: (Array.isArray(row.role) ? row.role[0] : row.role) ?? null,
  })) as StaffAccount[];
};

export const fetchRoles = async (): Promise<StaffRole[]> => {
  const { data, error } = await client().from('roles').select('id, code, name_fr, name_ar, name_en, is_system');
  if (error) fail(error);
  // Built-in roles in a fixed order, then any role added later, by name.
  const rank = (code: string) => {
    const i = ROLE_ORDER.indexOf(code);
    return i === -1 ? ROLE_ORDER.length : i;
  };
  return ((data ?? []) as StaffRole[]).sort(
    (a, b) => rank(a.code) - rank(b.code) || a.name_en.localeCompare(b.name_en),
  );
};

export const fetchPermissions = async (): Promise<Permission[]> => {
  const { data, error } = await client()
    .from('permissions')
    .select('id, code, module, description, is_medical')
    .order('code', { ascending: true });
  if (error) fail(error);
  return (data ?? []) as Permission[];
};

export const fetchRolePermissions = async (): Promise<RolePermission[]> => {
  const { data, error } = await client().from('role_permissions').select('role_id, permission_id');
  if (error) fail(error);
  return (data ?? []) as RolePermission[];
};

export const updateAccount = async (
  id: string,
  patch: Partial<{ full_name: string; specialty: string | null; role_id: string; active: boolean }>,
) => {
  const { error } = await client().from('profiles').update(patch).eq('id', id);
  if (error) fail(error);
};

export const setRolePermission = async (roleId: string, permissionId: string, granted: boolean) => {
  const table = client().from('role_permissions');
  const { error } = granted
    ? await table.insert({ role_id: roleId, permission_id: permissionId })
    : await table.delete().eq('role_id', roleId).eq('permission_id', permissionId);
  if (error) fail(error);
};

/** Calls the admin-users function, which holds the secret key on the server. */
const callAdminUsers = async (body: Record<string, unknown>) => {
  const { data, error } = await client().functions.invoke('admin-users', { body });
  if (!error) return data;

  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response;
    if (response.status === 404) {
      throw new Error('The account service is not deployed yet (docs/SETUP-SUPABASE.md, step 4).');
    }
    const details = await response.json().catch(() => null);
    throw new Error(details?.error || `The account service refused the request (${response.status}).`);
  }
  // No answer at all: usually the function is not deployed, or still checks tokens itself
  // (deploy it with --no-verify-jwt, see docs/SETUP-SUPABASE.md, step 4).
  throw new Error(
    'Could not reach the account service. Check that admin-users is deployed with --no-verify-jwt (docs/SETUP-SUPABASE.md, step 4).',
  );
};

export const createAccount = (input: {
  staff_id: string;
  full_name: string;
  password: string;
  role_code: string;
  specialty?: string;
}) => callAdminUsers({ action: 'create', ...input });

export const resetPassword = (userId: string, password: string) =>
  callAdminUsers({ action: 'reset_password', user_id: userId, password });

/** Random password that is easy to read out: no 0/O or 1/l/I. */
export const generatePassword = (length = 12) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => alphabet[v % alphabet.length]).join('');
};
