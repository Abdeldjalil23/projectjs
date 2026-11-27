// Activity reports (phase 4): the monthly report of the CMS and the quarterly consolidation of
// occupational medicine. The server returns counts only (report_cms / report_occupational in
// supabase/migrations/20261128000001_reports.sql); this file lays them out as tables, the same
// tables for the screen, the printed / PDF version and the Excel file.
import type { TFunction } from 'i18next';
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';
import { ACTS } from '@/lib/consultations';
import { formatNumber, intlLocale } from '@/lib/format';

export const REPORT_TYPES = ['cms', 'occupational'] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

/** Columns of the CMS reports. Contracted companies' workers and their dependents share one. */
export const REPORT_CATEGORIES = ['agent', 'ayant_droit', 'retraite', 'ad_retraite', 'contractor', 'local_population'] as const;

/** Homme, Femme, Enfant, and adults whose sex is not recorded. */
const CLASSES = ['M', 'F', 'C', 'U'] as const;

const SERVICES = ['general', 'psychology', 'nursing', 'dental'] as const;
const DOC_TYPES = ['consultation_report', 'prescription', 'referral', 'lab_request', 'imaging_request', 'evacuation', 'medical_certificate'] as const;
const VISIT_TYPES = ['hiring', 'periodic', 'return_to_work', 'on_request'] as const;
const DECISIONS = ['fit', 'fit_with_reservations', 'temporarily_unfit', 'permanently_unfit', 'pending'] as const;
const AGE_BANDS = ['under_20', '20_30', '31_40', '41_50', '51_60', 'over_60', 'unknown'] as const;

interface Counted {
  count: number;
}
interface ByCategory extends Counted {
  category: string;
}

export interface CmsData {
  from: string;
  to: string;
  child_max_age: number;
  consultations: (ByCategory & { service: string; class: string })[];
  acts: (ByCategory & { service: string; act: string; class: string })[];
  contracted: (ByCategory & { doctor_id: string; doctor: string; specialty: string; class: string })[];
  documents: (ByCategory & { type: string })[];
  care_requests: { made: number; approved: number; refused: number; used: number };
}

export interface OccupationalData {
  from: string;
  to: string;
  workforce: (Counted & { group: 'agent' | 'contractor'; sex: string; band: string })[];
  visits: (ByCategory & { type: string; decision: string })[];
  periodic: { group: 'agent' | 'contractor'; subject: number; examined: number }[];
  consultations: (ByCategory & { service: string; nature: string })[];
  documents: (ByCategory & { type: string })[];
  accidents: { without_stop: number; with_stop: number; days_off: number };
  referrals: { specialty: string; count: number }[];
  vaccinations: { vaccine: string; persons: number; doses: number }[];
}

export type ReportData = { type: 'cms'; data: CmsData } | { type: 'occupational'; data: OccupationalData };

/** One table of a report: header cells, then rows of a label and figures. */
export interface ReportTable {
  id: string;
  title: string;
  note?: string;
  /** Header of the label column, then one header per figure column. */
  columns: string[];
  rows: { label: string; values: (number | string)[]; total?: boolean }[];
}

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string } | null): never => {
  const message = error?.message ?? '';
  if (/Not allowed to read reports/.test(message)) throw new Error(i18n.t('reports.errors.notAllowed'));
  if (/Invalid report period/.test(message)) throw new Error(i18n.t('reports.errors.period'));
  throw new Error(message || i18n.t('common.requestFailed'));
};

export const fetchReport = async (type: ReportType, from: string, to: string): Promise<ReportData> => {
  const { data, error } = await client().rpc(type === 'cms' ? 'report_cms' : 'report_occupational', { p_from: from, p_to: to });
  if (error) fail(error);
  return { type, data } as ReportData;
};

// ---------------------------------------------------------------------------
// Periods
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** First and last day of a month (1–12). */
export const monthPeriod = (year: number, month: number) => ({
  from: `${year}-${pad(month)}-01`,
  to: `${year}-${pad(month)}-${pad(lastDay(year, month))}`,
});

/** First and last day of a quarter (1–4). */
export const quarterPeriod = (year: number, quarter: number) => ({
  from: `${year}-${pad(quarter * 3 - 2)}-01`,
  to: `${year}-${pad(quarter * 3)}-${pad(lastDay(year, quarter * 3))}`,
});

/** The month before today: the report usually written at the start of a month. */
export const previousMonth = (now = new Date()) => {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

/** The current quarter. */
export const currentQuarter = (now = new Date()) => ({ year: now.getFullYear(), quarter: Math.floor(now.getMonth() / 3) + 1 });

/** Title of the period in a language: « novembre 2026 », « T4 2026 ». */
export const periodLabel = (type: ReportType, from: string, lang: string) => {
  const date = new Date(`${from}T00:00:00`);
  if (type === 'cms') return new Intl.DateTimeFormat(intlLocale(lang), { month: 'long', year: 'numeric' }).format(date);
  const t = i18n.getFixedT(lang);
  return t('reports.quarterLabel', { quarter: String(Math.floor(date.getMonth() / 3) + 1), year: String(date.getFullYear()) });
};

export const reportFileName = (type: ReportType, from: string) => {
  const d = new Date(`${from}T00:00:00`);
  return type === 'cms'
    ? `MedSuite_Rapport_CMS_${from.slice(0, 7)}.xlsx`
    : `MedSuite_Consolidation_${d.getFullYear()}-T${Math.floor(d.getMonth() / 3) + 1}.xlsx`;
};

/** Numbers in the report language, for the printed version. */
export const reportNumber = (lang: string) => (n: number) => formatNumber(n, lang);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

const sum = <T>(rows: T[], keep: (row: T) => boolean, value: (row: T) => number) =>
  rows.reduce((total, row) => (keep(row) ? total + value(row) : total), 0);

const percent = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 1000) / 10} %` : '—');

/** Adds a total row (sum of each numeric column). */
const withTotal = (rows: ReportTable['rows'], label: string): ReportTable['rows'] => {
  if (rows.length === 0) return rows;
  const width = rows[0].values.length;
  const totals = Array.from({ length: width }, (_, i) => rows.reduce((t, r) => t + (typeof r.values[i] === 'number' ? (r.values[i] as number) : 0), 0));
  return [...rows, { label, values: totals, total: true }];
};

const categoryHeaders = (t: TFunction) => REPORT_CATEGORIES.map((c) => t(`reports.categories.${c}`));

/** Rows of categories with Homme / Femme / Enfant (and Non précisé when there is one). */
const byClassTable = (
  t: TFunction,
  id: string,
  title: string,
  rows: (ByCategory & { class: string })[],
): ReportTable => {
  const showUnknown = rows.some((r) => r.class === 'U' && r.count > 0);
  const classes = CLASSES.filter((c) => c !== 'U' || showUnknown);
  const body = REPORT_CATEGORIES.map((cat) => {
    const values = classes.map((cls) => sum(rows, (r) => r.category === cat && r.class === cls, (r) => r.count));
    return { label: t(`reports.categories.${cat}`), values: [...values, values.reduce((a, b) => a + b, 0)] };
  });
  return {
    id,
    title,
    columns: [t('reports.columns.category'), ...classes.map((c) => t(`reports.classes.${c}`)), t('reports.columns.total')],
    rows: withTotal(body, t('reports.columns.total')),
  };
};

/** Rows of items with one column per category. */
const byCategoryTable = <R extends ByCategory>(
  t: TFunction,
  id: string,
  title: string,
  firstColumn: string,
  items: { key: string; label: string }[],
  rows: R[],
  match: (row: R, key: string) => boolean,
  note?: string,
): ReportTable => {
  const body = items.map(({ key, label }) => {
    const values = REPORT_CATEGORIES.map((cat) => sum(rows, (r) => r.category === cat && match(r, key), (r) => r.count));
    return { label, values: [...values, values.reduce((a, b) => a + b, 0)] };
  });
  return {
    id,
    title,
    note,
    columns: [firstColumn, ...categoryHeaders(t), t('reports.columns.total')],
    rows: withTotal(body, t('reports.columns.total')),
  };
};

export const cmsTables = (d: CmsData, t: TFunction): ReportTable[] => {
  const tables: ReportTable[] = SERVICES.map((service) =>
    byClassTable(
      t,
      `consultations-${service}`,
      t('reports.cms.consultations', { service: t(`consultations.services.${service}`) }),
      d.consultations.filter((c) => c.service === service),
    ),
  );
  tables[0].note = t('reports.childNote', { age: d.child_max_age });

  for (const service of ['nursing', 'dental'] as const) {
    tables.push(
      byCategoryTable(
        t,
        `acts-${service}`,
        t(`reports.cms.acts.${service}`),
        t('reports.columns.act'),
        ACTS[service].map(({ code }) => ({ key: code, label: t(`consultations.actNames.${code}`) })),
        d.acts.filter((a) => a.service === service),
        (r, key) => r.act === key,
      ),
    );
  }

  const doctors = [...new Map(d.contracted.map((c) => [c.doctor_id, `${c.doctor} — ${c.specialty}`])).entries()];
  tables.push(
    byCategoryTable(
      t,
      'contracted',
      t('reports.cms.contracted'),
      t('reports.columns.doctor'),
      doctors.map(([key, label]) => ({ key, label })),
      d.contracted,
      (r, key) => r.doctor_id === key,
      doctors.length === 0 ? t('reports.cms.contractedNone') : t('reports.cms.contractedNote'),
    ),
  );

  tables.push(
    byCategoryTable(
      t,
      'documents',
      t('reports.cms.documents'),
      t('reports.columns.document'),
      DOC_TYPES.map((type) => ({ key: type, label: t(`documents.types.${type}`) })),
      d.documents,
      (r, key) => r.type === key,
      t('reports.cms.documentsNote'),
    ),
  );

  tables.push({
    id: 'care-requests',
    title: t('reports.cms.careRequests'),
    columns: [t('reports.columns.item'), t('reports.columns.count')],
    rows: (['made', 'approved', 'refused', 'used'] as const).map((key) => ({
      label: t(`reports.cms.careRequestRows.${key}`),
      values: [d.care_requests[key]],
    })),
  });
  return tables;
};

export const occupationalTables = (d: OccupationalData, t: TFunction): ReportTable[] => {
  const groups = ['agent', 'contractor'] as const;
  const groupLabel = (g: (typeof groups)[number]) => t(`reports.occupational.groups.${g}`);
  const tables: ReportTable[] = [];

  // 1. Workforce by sex, then by age group.
  const showUnknownSex = d.workforce.some((w) => w.sex === 'U');
  const sexes = (['M', 'F', 'U'] as const).filter((s) => s !== 'U' || showUnknownSex);
  tables.push({
    id: 'workforce-sex',
    title: t('reports.occupational.workforceSex'),
    note: t('reports.occupational.workforceNote'),
    columns: [t('reports.columns.population'), ...sexes.map((s) => t(`reports.sexes.${s}`)), t('reports.columns.total')],
    rows: withTotal(
      groups.map((g) => {
        const values = sexes.map((s) => sum(d.workforce, (w) => w.group === g && w.sex === s, (w) => w.count));
        return { label: groupLabel(g), values: [...values, values.reduce((a, b) => a + b, 0)] };
      }),
      t('reports.columns.total'),
    ),
  });
  const bands = AGE_BANDS.filter((b) => !['under_20', 'over_60', 'unknown'].includes(b) || d.workforce.some((w) => w.band === b));
  tables.push({
    id: 'workforce-age',
    title: t('reports.occupational.workforceAge'),
    columns: [t('reports.columns.population'), ...bands.map((b) => t(`reports.ageBands.${b}`)), t('reports.columns.total')],
    rows: withTotal(
      groups.map((g) => {
        const values = bands.map((b) => sum(d.workforce, (w) => w.group === g && w.band === b, (w) => w.count));
        return { label: groupLabel(g), values: [...values, values.reduce((a, b) => a + b, 0)] };
      }),
      t('reports.columns.total'),
    ),
  });

  // 3. Clinical activity: visits of each kind with their fitness decision.
  tables.push({
    id: 'decisions',
    title: t('reports.occupational.decisions'),
    columns: [t('reports.columns.visit'), ...DECISIONS.map((x) => t(`reports.decisions.${x}`)), t('reports.columns.total')],
    rows: withTotal(
      VISIT_TYPES.map((type) => {
        const values = DECISIONS.map((x) => sum(d.visits, (v) => v.type === type && v.decision === x, (v) => v.count));
        return { label: t(`reports.visitTypes.${type}`), values: [...values, values.reduce((a, b) => a + b, 0)] };
      }),
      t('reports.columns.total'),
    ),
  });

  tables.push({
    id: 'periodic',
    title: t('reports.occupational.periodic'),
    note: t('reports.occupational.periodicNote'),
    columns: [t('reports.columns.population'), t('reports.occupational.subject'), t('reports.occupational.examined'), t('reports.occupational.coverage')],
    rows: groups.map((g) => {
      const p = d.periodic.find((x) => x.group === g) ?? { subject: 0, examined: 0 };
      return { label: groupLabel(g), values: [p.subject, p.examined, percent(p.examined, p.subject)] };
    }),
  });

  // Activity by category: visits, care, emergencies and evacuations (contractors and population
  // are section 3 of the paper form).
  const visitCount = (type: string) => (cat: string) => sum(d.visits, (v) => v.type === type && v.category === cat, (v) => v.count);
  const careCount = (emergency: boolean) => (cat: string) =>
    sum(d.consultations, (c) => c.category === cat && (c.nature === 'emergency') === emergency, (c) => c.count);
  const docCount = (type: string) => (cat: string) => sum(d.documents, (x) => x.type === type && x.category === cat, (x) => x.count);
  const activity: [string, (cat: string) => number][] = [
    ['hiring', visitCount('hiring')],
    ['periodic', visitCount('periodic')],
    ['return_to_work', visitCount('return_to_work')],
    ['on_request', visitCount('on_request')],
    ['care', careCount(false)],
    ['emergency', careCount(true)],
    ['evacuation', docCount('evacuation')],
  ];
  tables.push({
    id: 'activity',
    title: t('reports.occupational.activity'),
    note: t('reports.occupational.activityNote'),
    columns: [t('reports.columns.item'), ...categoryHeaders(t), t('reports.columns.total')],
    rows: activity.map(([key, count]) => {
      const values = REPORT_CATEGORIES.map((cat) => count(cat));
      return { label: t(`reports.occupational.activityRows.${key}`), values: [...values, values.reduce((a, b) => a + b, 0)] };
    }),
  });

  // Nursing care and complementary exams.
  const all = (rows: Counted[]) => rows.reduce((n, r) => n + r.count, 0);
  tables.push({
    id: 'care',
    title: t('reports.occupational.care'),
    columns: [t('reports.columns.item'), t('reports.columns.count')],
    rows: [
      { label: t('reports.occupational.careRows.nursing'), values: [all(d.consultations.filter((c) => c.service === 'nursing'))] },
      { label: t('reports.occupational.careRows.lab'), values: [all(d.documents.filter((x) => x.type === 'lab_request'))] },
      { label: t('reports.occupational.careRows.imaging'), values: [all(d.documents.filter((x) => x.type === 'imaging_request'))] },
    ],
  });

  // 5. Medical conclusions: work accidents and specialised referrals.
  tables.push({
    id: 'accidents',
    title: t('reports.occupational.accidents'),
    columns: [t('reports.columns.item'), t('reports.columns.count')],
    rows: [
      { label: t('reports.occupational.accidentRows.without_stop'), values: [d.accidents.without_stop] },
      { label: t('reports.occupational.accidentRows.with_stop'), values: [d.accidents.with_stop] },
      { label: t('reports.occupational.accidentRows.days_off'), values: [d.accidents.days_off] },
    ],
  });
  tables.push({
    id: 'referrals',
    title: t('reports.occupational.referrals'),
    note: d.referrals.length === 0 ? t('reports.occupational.referralsNone') : undefined,
    columns: [t('reports.columns.specialty'), t('reports.columns.count')],
    rows: withTotal(
      d.referrals.map((r) => ({ label: r.specialty, values: [r.count] })),
      t('reports.columns.total'),
    ),
  });

  // 6. Vaccination.
  tables.push({
    id: 'vaccinations',
    title: t('reports.occupational.vaccinations'),
    note: d.vaccinations.length === 0 ? t('reports.occupational.vaccinationsNone') : t('reports.occupational.vaccinationsNote'),
    columns: [t('reports.columns.vaccine'), t('reports.occupational.vaccinated'), t('reports.occupational.doses')],
    rows: d.vaccinations.map((v) => ({ label: v.vaccine, values: [v.persons, v.doses] })),
  });
  return tables;
};

export const reportTables = (report: ReportData, t: TFunction): ReportTable[] =>
  report.type === 'cms' ? cmsTables(report.data, t) : occupationalTables(report.data, t);
