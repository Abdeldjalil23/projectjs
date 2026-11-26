// Data access for the medicine stock: products and their movements (receipts, dispensing,
// adjustments, disposals). The stock on hand is computed by the server from the movements.
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export const FORMS = ['tablet', 'capsule', 'syrup', 'injection', 'infusion', 'cream', 'drops', 'inhaler', 'suppository', 'sachet', 'dressing', 'other'] as const;
export const UNITS = ['box', 'tablet', 'vial', 'ampoule', 'bottle', 'tube', 'sachet', 'unit'] as const;
export const MOVEMENT_KINDS = ['in', 'out', 'adjust', 'discard'] as const;

export type MovementKind = (typeof MOVEMENT_KINDS)[number];

/** Days before expiry from which a medicine is flagged. */
export const EXPIRY_WARNING_DAYS = 90;

export interface Medicine {
  id?: string;
  name: string;
  generic_name: string | null;
  form: (typeof FORMS)[number] | null;
  strength: string | null;
  category: string | null;
  unit: (typeof UNITS)[number];
  quantity?: number;
  threshold: number;
  expiry_date: string | null;
  location: string | null;
  prescription_required: boolean;
  active: boolean;
  notes: string | null;
}

export interface Movement {
  id: string;
  medicine_id: string;
  kind: MovementKind;
  quantity: number;
  movement_date: string;
  lot_number: string | null;
  expiry_date: string | null;
  reference: string | null;
  notes: string | null;
  balance_after: number | null;
  author_name: string | null;
  created_at: string;
}

export interface MovementInput {
  medicine_id: string;
  kind: MovementKind;
  quantity: number;
  movement_date: string;
  lot_number: string | null;
  expiry_date: string | null;
  reference: string | null;
  notes: string | null;
}

const client = () => {
  if (!supabase) throw new Error(i18n.t('common.serverNotConfigured'));
  return supabase;
};

const fail = (error: { message?: string; code?: string } | null): never => {
  const message = error?.message ?? '';
  const short = /^Not enough stock: (\d+) available/.exec(message);
  if (short) throw new Error(i18n.t('medicines.errors.notEnough', { available: Number(short[1]) }));
  if (error?.code === '23505') throw new Error(i18n.t('medicines.errors.duplicate'));
  throw new Error(message || i18n.t('common.requestFailed'));
};

export const fetchMedicines = async (): Promise<Medicine[]> => {
  const { data, error } = await client().from('medicines').select('*').order('name').limit(2000);
  if (error) fail(error);
  return (data ?? []) as Medicine[];
};

/** Names of the active medicines, offered when writing a prescription. */
export const fetchMedicineNames = async (): Promise<string[]> => {
  const { data, error } = await client().from('medicines').select('name, strength, form').eq('active', true).order('name').limit(2000);
  if (error) fail(error);
  return ((data ?? []) as Pick<Medicine, 'name' | 'strength'>[]).map(medicineLabel);
};

const MEDICINE_COLUMNS = [
  'name',
  'generic_name',
  'form',
  'strength',
  'category',
  'unit',
  'threshold',
  'expiry_date',
  'location',
  'prescription_required',
  'active',
  'notes',
] as const;

/** Adds or updates a medicine; a new one can start with an opening stock (a first receipt). */
export const saveMedicine = async (medicine: Medicine, openingStock = 0): Promise<string> => {
  const fields = Object.fromEntries(MEDICINE_COLUMNS.map((c) => [c, medicine[c]]));
  if (medicine.id) {
    const { error } = await client().from('medicines').update(fields).eq('id', medicine.id);
    if (error) fail(error);
    return medicine.id;
  }
  const { data, error } = await client().from('medicines').insert(fields).select('id').single();
  if (error) fail(error);
  const id = (data as { id: string }).id;
  if (openingStock > 0) {
    await addMovement({
      medicine_id: id,
      kind: 'in',
      quantity: openingStock,
      movement_date: new Date().toISOString().slice(0, 10),
      lot_number: null,
      expiry_date: medicine.expiry_date,
      reference: i18n.t('medicines.openingStock'),
      notes: null,
    });
  }
  return id;
};

export const fetchMovements = async (medicineId: string): Promise<Movement[]> => {
  const { data, error } = await client()
    .from('medicine_movements')
    .select('*')
    .eq('medicine_id', medicineId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) fail(error);
  return (data ?? []) as Movement[];
};

export const addMovement = async (movement: MovementInput) => {
  const { error } = await client().from('medicine_movements').insert(movement);
  if (error) fail(error);
};

/** Name and strength, as written on the shelves ("Paracétamol 500 mg"). */
export const medicineLabel = (m: Pick<Medicine, 'name' | 'strength'>) => [m.name, m.strength].filter(Boolean).join(' ');

/** Stock state of a medicine, for the colours and the filters. */
export const stockState = (m: Medicine, today: string) => {
  const low = (m.quantity ?? 0) <= m.threshold;
  const expired = Boolean(m.expiry_date && m.expiry_date < today);
  const limit = new Date(`${today}T12:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() + EXPIRY_WARNING_DAYS);
  const expiring = Boolean(m.expiry_date && !expired && m.expiry_date <= limit.toISOString().slice(0, 10));
  return { low, out: (m.quantity ?? 0) === 0, expired, expiring };
};
