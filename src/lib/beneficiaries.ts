// Data access for beneficiaries (Supabase): list, details, create / edit, import.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export const CATEGORIES = [
  'agent',
  'ayant_droit',
  'retraite',
  'ad_retraite',
  'contractor_agent',
  'contractor_ad',
  'local_population',
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Dependent categories and the category of the person they depend on. */
export const HOLDER_CATEGORY: Partial<Record<Category, Category>> = {
  ayant_droit: 'agent',
  ad_retraite: 'retraite',
  contractor_ad: 'contractor_agent',
};
export const isDependent = (category: string) => category in HOLDER_CATEGORY;

export const SEXES = ['M', 'F'] as const;
export const RELATIONSHIPS = ['spouse', 'child', 'parent', 'other'] as const;

export interface PersonRef {
  id: string;
  external_id: string | null;
  last_name: string;
  first_name: string;
}

/** "Last First · number", as shown in pickers and links. */
export const personLabel = (p: PersonRef) =>
  `${p.last_name} ${p.first_name}${p.external_id ? ` · ${p.external_id}` : ''}`;

export interface Beneficiary extends PersonRef {
  category: Category;
  birth_date: string | null;
  sex: 'M' | 'F' | null;
  holder_id: string | null;
  relationship: (typeof RELATIONSHIPS)[number] | null;
  company: string | null;
  unit: string | null;
  phone: string | null;
  notes: string | null;
  active: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryDetails extends Beneficiary {
  holder: PersonRef | null;
}

export type BeneficiaryInput = Omit<
  Beneficiary,
  'id' | 'source' | 'created_at' | 'updated_at'
>;

export const PAGE_SIZE = 50;

const LIST_COLUMNS =
  'id, external_id, category, last_name, first_name, birth_date, sex, holder_id, relationship, company, unit, phone, notes, active, source, created_at, updated_at';

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

/** Error with a message for the screen; a reused number gets its own message. */
const fail = (error: { message?: string; code?: string } | null): never => {
  if (error?.code === '23505') throw new Error(i18n.t('beneficiaries.errors.numberTaken'));
  throw new Error(error?.message || i18n.t('common.requestFailed'));
};

/** Each word typed must appear in the number, the last name or the first name. */
const searchTerms = (search: string) =>
  search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((term) => `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);

export interface ListFilters {
  search: string;
  category: Category | 'all';
  status: 'all' | 'active' | 'inactive';
  page: number;
}

export const fetchBeneficiaries = async ({ search, category, status, page }: ListFilters) => {
  let query = client().from('beneficiaries').select(LIST_COLUMNS, { count: 'exact' });
  for (const term of searchTerms(search)) query = query.ilike('search_text', term);
  if (category !== 'all') query = query.eq('category', category);
  if (status !== 'all') query = query.eq('active', status === 'active');
  const from = page * PAGE_SIZE;
  const { data, error, count } = await query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (error) fail(error);
  return { rows: (data ?? []) as Beneficiary[], total: count ?? 0 };
};

// The worker a dependent depends on is read with a second query: the server (PostgREST) does not
// embed a table in itself through its own foreign key ("Could not find a relationship between
// 'beneficiaries' and 'beneficiaries'").
export const fetchBeneficiary = async (id: string): Promise<BeneficiaryDetails> => {
  const { data, error } = await client().from('beneficiaries').select(LIST_COLUMNS).eq('id', id).single();
  if (error) fail(error);
  const row = data as unknown as Beneficiary;
  let holder: PersonRef | null = null;
  if (row.holder_id) {
    const { data: found, error: holderError } = await client()
      .from('beneficiaries')
      .select('id, external_id, last_name, first_name')
      .eq('id', row.holder_id)
      .maybeSingle();
    if (holderError) fail(holderError);
    holder = (found as PersonRef | null) ?? null;
  }
  return { ...row, holder };
};

export const fetchDependents = async (holderId: string): Promise<Beneficiary[]> => {
  const { data, error } = await client()
    .from('beneficiaries')
    .select(LIST_COLUMNS)
    .eq('holder_id', holderId)
    .order('birth_date', { ascending: true, nullsFirst: false });
  if (error) fail(error);
  return (data ?? []) as Beneficiary[];
};

/** Workers a dependent of the given category can be linked to. */
export const searchHolders = async (dependentCategory: Category, search: string): Promise<PersonRef[]> => {
  const holderCategory = HOLDER_CATEGORY[dependentCategory];
  if (!holderCategory) return [];
  let query = client()
    .from('beneficiaries')
    .select('id, external_id, last_name, first_name')
    .eq('category', holderCategory)
    .eq('active', true);
  for (const term of searchTerms(search)) query = query.ilike('search_text', term);
  const { data, error } = await query.order('last_name').limit(8);
  if (error) fail(error);
  return (data ?? []) as PersonRef[];
};

const clean = (input: BeneficiaryInput) => ({
  ...input,
  external_id: input.external_id?.trim() || null,
  last_name: input.last_name.trim(),
  first_name: input.first_name.trim(),
  holder_id: isDependent(input.category) ? input.holder_id : null,
  relationship: isDependent(input.category) ? input.relationship : null,
  company: input.company?.trim() || null,
  unit: input.unit?.trim() || null,
  phone: input.phone?.trim() || null,
  notes: input.notes?.trim() || null,
});

export const createBeneficiary = async (input: BeneficiaryInput) => {
  const { data, error } = await client().from('beneficiaries').insert(clean(input)).select('id').single();
  if (error) fail(error);
  return data as { id: string };
};

export const updateBeneficiary = async (id: string, input: BeneficiaryInput) => {
  const { error } = await client().from('beneficiaries').update(clean(input)).eq('id', id);
  if (error) fail(error);
};

export const setBeneficiaryActive = async (id: string, active: boolean) => {
  const { error } = await client().from('beneficiaries').update({ active }).eq('id', id);
  if (error) fail(error);
};

export interface ImportRow {
  row: number;
  external_id: string;
  category: Category;
  last_name: string;
  first_name: string;
  birth_date: string | null;
  sex: 'M' | 'F' | null;
  relationship: string | null;
  company: string | null;
  unit: string | null;
  phone: string | null;
  holder_external_id: string | null;
}

export interface ImportResult {
  inserted: number;
  updated: number;
  linked: number;
  errors: { row: number; message: string }[];
}

const IMPORT_BATCH = 500;

/**
 * Sends the rows in batches, workers first so that their dependents can be linked to them.
 * onProgress receives the number of rows sent so far.
 */
export const importBeneficiaries = async (
  source: string,
  rows: ImportRow[],
  onProgress?: (done: number) => void,
): Promise<ImportResult> => {
  const ordered = [...rows].sort((a, b) => Number(isDependent(a.category)) - Number(isDependent(b.category)));
  const total: ImportResult = { inserted: 0, updated: 0, linked: 0, errors: [] };
  for (let start = 0; start < ordered.length; start += IMPORT_BATCH) {
    const batch = ordered.slice(start, start + IMPORT_BATCH);
    const { data, error } = await client().rpc('import_beneficiaries', { p_source: source, p_rows: batch });
    if (error) fail(error);
    const result = data as ImportResult;
    total.inserted += result.inserted;
    total.updated += result.updated;
    total.linked += result.linked;
    total.errors.push(...result.errors);
    onProgress?.(Math.min(start + batch.length, ordered.length));
  }
  total.errors.sort((a, b) => a.row - b.row);
  return total;
};

/** Age in whole years on the given day. */
export const ageOn = (birthDate: string | null, today = new Date()) => {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
};
