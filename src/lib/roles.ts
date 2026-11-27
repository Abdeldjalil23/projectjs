import type { UserRole } from '@/context/AuthContext';

type Role = Exclude<UserRole, null>;

const DASHBOARD_BY_ROLE: Record<Role, string> = {
  admin: '/admin/dashboard',
  doctor: '/medecin/dashboard',
  dentist: '/dentist/dashboard',
  social: '/social/dashboard',
};

export const ROLE_INITIALS: Record<Role, string> = {
  admin: 'AD',
  doctor: 'DR',
  dentist: 'DE',
  social: 'SW',
};

export const dashboardPathFor = (role: UserRole): string =>
  role ? DASHBOARD_BY_ROLE[role] : '/login';

/**
 * Which workspace of the app each account role (roles.code in the database) opens. Nurses and
 * psychologists share the doctors' workspace: the pages they see there follow their permissions.
 * The contracted doctor needs no account: scanning the QR code of a care coverage opens the
 * public page /verify/<token>, which shows the coverage and records its use.
 */
export const WORKSPACE_BY_STAFF_ROLE: Record<string, { role: Role }> = {
  admin: { role: 'admin' },
  doctor: { role: 'doctor' },
  nurse: { role: 'doctor' },
  psychologist: { role: 'doctor' },
  dentist: { role: 'dentist' },
  social_worker: { role: 'social' },
};
