// Settings of the centre kept in app_settings and changed by the administration (settings.manage):
// the header of printed documents, the rules of care coverage, the workers' app and the reports.
// Each value is checked here before it is saved; every change is written to the audit log.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export interface WorkerContact {
  label: string;
  phone: string;
  hours: string;
}

export interface CentreSettings {
  print_header: string[];
  care_request_validity_days: number;
  care_request_single_use: boolean;
  care_request_refusal_reasons: string[];
  worker_invitation_days: number;
  worker_contacts: WorkerContact[];
  report_child_max_age: number;
}

export type SettingKey = keyof CentreSettings;

/** Values used when a setting is missing, the same as the database files. */
const DEFAULTS: CentreSettings = {
  print_header: ['Sonatrach', 'Centre de Médecine du Travail'],
  care_request_validity_days: 30,
  care_request_single_use: true,
  care_request_refusal_reasons: ['Dossier incomplet', 'Hors convention', 'Prestation non couverte', 'Autre'],
  worker_invitation_days: 7,
  worker_contacts: [],
  report_child_max_age: 15,
};

/** Descriptions stored with each setting (same text as the database files). */
const DESCRIPTIONS: Record<SettingKey, string> = {
  print_header: 'Lines printed at the top of the medical documents',
  care_request_validity_days: 'Days an approved care coverage stays valid',
  care_request_single_use: 'An approved care coverage can be used once',
  care_request_refusal_reasons: 'Reasons offered when refusing a request',
  worker_invitation_days: 'Days an app activation code stays valid',
  worker_contacts: 'Contacts shown in the workers\' app: [{"label": "…", "phone": "…", "hours": "…"}]',
  report_child_max_age: 'Age up to which a beneficiary is counted as "Enfant" in reports',
};

/** Limits of the numbers, also shown next to the fields. */
export const LIMITS = {
  care_request_validity_days: { min: 1, max: 365 },
  worker_invitation_days: { min: 1, max: 60 },
  report_child_max_age: { min: 1, max: 21 },
} as const;

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const strings = (value: unknown, fallback: string[]) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : fallback;

const integer = (value: unknown, fallback: number) => (typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback);

export const fetchCentreSettings = async (): Promise<{ values: CentreSettings; updatedAt: Partial<Record<SettingKey, string>> }> => {
  const keys = Object.keys(DEFAULTS) as SettingKey[];
  const { data, error } = await client().from('app_settings').select('key, value, updated_at').in('key', keys);
  if (error) throw new Error(error.message || i18n.t('common.requestFailed'));
  const rows = new Map((data ?? []).map((row) => [row.key as SettingKey, row as { value: unknown; updated_at: string }]));
  const value = (key: SettingKey) => rows.get(key)?.value;
  const contacts = value('worker_contacts');
  return {
    values: {
      print_header: strings(value('print_header'), DEFAULTS.print_header),
      care_request_validity_days: integer(value('care_request_validity_days'), DEFAULTS.care_request_validity_days),
      care_request_single_use: typeof value('care_request_single_use') === 'boolean' ? (value('care_request_single_use') as boolean) : DEFAULTS.care_request_single_use,
      care_request_refusal_reasons: strings(value('care_request_refusal_reasons'), DEFAULTS.care_request_refusal_reasons),
      worker_invitation_days: integer(value('worker_invitation_days'), DEFAULTS.worker_invitation_days),
      worker_contacts: Array.isArray(contacts)
        ? (contacts as Partial<WorkerContact>[])
            .filter((c) => c && typeof c.label === 'string')
            .map((c) => ({ label: c.label ?? '', phone: c.phone ?? '', hours: c.hours ?? '' }))
        : [],
      report_child_max_age: integer(value('report_child_max_age'), DEFAULTS.report_child_max_age),
    },
    updatedAt: Object.fromEntries([...rows.entries()].map(([key, row]) => [key, row.updated_at])),
  };
};

/** Cleans a group of settings and returns the first problem, or the values to save. */
export const cleanSettings = (changes: Partial<CentreSettings>): { error: string } | { values: Partial<CentreSettings> } => {
  const out: Partial<CentreSettings> = {};
  const t = i18n.t.bind(i18n);
  for (const key of Object.keys(changes) as SettingKey[]) {
    switch (key) {
      case 'print_header': {
        const lines = (changes.print_header ?? []).map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0 || lines.length > 6 || lines.some((l) => l.length > 120)) return { error: t('centreSettings.errors.header') };
        out.print_header = lines;
        break;
      }
      case 'care_request_refusal_reasons': {
        const reasons = [...new Set((changes.care_request_refusal_reasons ?? []).map((r) => r.trim()).filter(Boolean))];
        if (reasons.length === 0 || reasons.length > 20 || reasons.some((r) => r.length > 100)) return { error: t('centreSettings.errors.reasons') };
        out.care_request_refusal_reasons = reasons;
        break;
      }
      case 'worker_contacts': {
        const contacts = (changes.worker_contacts ?? [])
          .map((c) => ({ label: c.label.trim(), phone: c.phone.trim(), hours: c.hours.trim() }))
          .filter((c) => c.label || c.phone || c.hours);
        if (contacts.length > 10 || contacts.some((c) => !c.label || c.label.length > 80 || c.phone.length > 30 || c.hours.length > 80))
          return { error: t('centreSettings.errors.contacts') };
        if (contacts.some((c) => c.phone && !/^[+\d][\d\s().-]{1,29}$/.test(c.phone))) return { error: t('centreSettings.errors.phone') };
        out.worker_contacts = contacts;
        break;
      }
      case 'care_request_single_use':
        out.care_request_single_use = Boolean(changes.care_request_single_use);
        break;
      default: {
        const limit = LIMITS[key];
        const n = Number(changes[key]);
        if (!Number.isInteger(n) || n < limit.min || n > limit.max) return { error: t('centreSettings.errors.number', { min: limit.min, max: limit.max }) };
        out[key] = n;
      }
    }
  }
  return { values: out };
};

export const saveCentreSettings = async (changes: Partial<CentreSettings>) => {
  const cleaned = cleanSettings(changes);
  if ('error' in cleaned) throw new Error(cleaned.error);
  const rows = (Object.keys(cleaned.values) as SettingKey[]).map((key) => ({
    key,
    value: cleaned.values[key],
    description: DESCRIPTIONS[key],
  }));
  const { error } = await client().from('app_settings').upsert(rows, { onConflict: 'key' });
  if (error) {
    if (error.code === '42501') throw new Error(i18n.t('centreSettings.errors.notAllowed'));
    throw new Error(error.message || i18n.t('common.requestFailed'));
  }
};
