import type { UserRole } from '@/context/AuthContext';

type Role = Exclude<UserRole, null>;

export const ROLES: Role[] = ['admin', 'doctor', 'dentist', 'social', 'patient'];

const DASHBOARD_BY_ROLE: Record<Role, string> = {
  admin: '/admin/dashboard',
  doctor: '/medecin/dashboard',
  dentist: '/dentist/dashboard',
  social: '/social/dashboard',
  patient: '/settings',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  dentist: 'Dentist',
  social: 'Social Worker',
  patient: 'Patient',
};

export const ROLE_INITIALS: Record<Role, string> = {
  admin: 'AD',
  doctor: 'DR',
  dentist: 'DE',
  social: 'SW',
  patient: 'PT',
};

export const dashboardPathFor = (role: UserRole): string =>
  role ? DASHBOARD_BY_ROLE[role] : '/login';
