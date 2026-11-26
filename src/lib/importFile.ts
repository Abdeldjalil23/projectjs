// Reading a list of beneficiaries from an Excel or CSV file, and turning its rows into
// import rows: column matching, value recognition (categories, sex, dates) and checks.
// The libraries are loaded only when a file is opened, to keep the app light.
import { CATEGORIES, Category, ImportRow, RELATIONSHIPS, isDependent } from '@/lib/beneficiaries';
import { en } from '@/i18n/locales/en';
import { fr } from '@/i18n/locales/fr';
import { ar } from '@/i18n/locales/ar';

export type Cell = string | number | boolean | Date | null;

export interface SheetTable {
  headers: string[];
  rows: Cell[][];
}

export const MAX_IMPORT_ROWS = 20000;

export const IMPORT_FIELDS = [
  'external_id',
  'last_name',
  'first_name',
  'birth_date',
  'sex',
  'category',
  'holder_external_id',
  'relationship',
  'company',
  'unit',
  'phone',
] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];
export const REQUIRED_FIELDS: ImportField[] = ['last_name', 'first_name'];

/** Lower case, no accents, single spaces: "Prénom " → "prenom". */
export const normalize = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[._'’°-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Reads the first sheet of an .xlsx file, or a .csv file (comma or semicolon). */
export const readTable = async (file: File): Promise<SheetTable> => {
  let data: Cell[][];
  if (/\.xlsx$/i.test(file.name)) {
    const { readSheet } = await import('read-excel-file/browser');
    data = (await readSheet(file)) as Cell[][];
  } else if (/\.(csv|txt)$/i.test(file.name)) {
    const Papa = (await import('papaparse')).default;
    const text = await file.text();
    const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { skipEmptyLines: 'greedy' });
    data = parsed.data;
  } else {
    throw new Error('unsupported');
  }
  const nonEmpty = data.filter((row) => row.some((cell) => cell !== null && String(cell).trim() !== ''));
  const [header = [], ...rows] = nonEmpty;
  const width = Math.max(header.length, ...rows.map((r) => r.length));
  const headers = Array.from({ length: width }, (_, i) => String(header[i] ?? '').trim() || `#${i + 1}`);
  return { headers, rows: rows.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? null)) };
};

// Column names recognised for each field (compared after normalize()).
const HEADER_NAMES: Record<ImportField, string[]> = {
  holder_external_id: [
    'matricule agent', 'matricule ouvrant droit', 'matricule titulaire', 'matricule assure', 'ouvrant droit',
    'titulaire', 'matricule du travailleur', 'worker number', 'holder', 'رقم العامل', 'رقم تسجيل العامل',
  ],
  external_id: ['matricule', 'mat', 'numero', 'n', 'no', 'num', 'id', 'identifiant', 'code', 'number', 'staff number', 'رقم التسجيل', 'الرقم', 'المعرف'],
  last_name: ['nom', 'nom de famille', 'last name', 'surname', 'family name', 'اللقب'],
  first_name: ['prenom', 'prenoms', 'first name', 'given name', 'الاسم'],
  birth_date: ['date de naissance', 'date naissance', 'ne le', 'ne e le', 'ddn', 'naissance', 'birth date', 'date of birth', 'dob', 'تاريخ الميلاد', 'تاريخ الازدياد'],
  sex: ['sexe', 'genre', 'sex', 'gender', 'الجنس'],
  category: ['categorie', 'type', 'statut', 'qualite', 'category', 'status', 'الفئة', 'الصفة'],
  relationship: ['lien', 'lien de parente', 'parente', 'relation', 'relationship', 'القرابة', 'صلة القرابة'],
  company: ['entreprise', 'societe', 'employeur', 'company', 'employer', 'الشركة', 'المؤسسة'],
  unit: ['structure', 'unite', 'direction', 'affectation', 'service', 'departement', 'unit', 'الوحدة', 'الهيكل', 'المصلحة'],
  phone: ['telephone', 'tel', 'mobile', 'portable', 'phone', 'الهاتف', 'رقم الهاتف'],
};

/** Guesses which column of the file holds each field; unknown fields stay unmatched (-1). */
export const guessColumns = (headers: string[]): Record<ImportField, number> => {
  const normalized = headers.map(normalize);
  const used = new Set<number>();
  const result = Object.fromEntries(IMPORT_FIELDS.map((f) => [f, -1])) as Record<ImportField, number>;
  // Exact names first (so "Matricule agent" is not taken for "Matricule"), then names contained in a header.
  for (const pass of ['exact', 'contains'] as const) {
    for (const field of Object.keys(HEADER_NAMES) as ImportField[]) {
      if (result[field] !== -1) continue;
      const index = normalized.findIndex(
        (h, i) =>
          !used.has(i) &&
          HEADER_NAMES[field].some((name) => (pass === 'exact' ? h === name : name.length > 3 && h.includes(name))),
      );
      if (index !== -1) {
        result[field] = index;
        used.add(index);
      }
    }
  }
  return result;
};

// Values recognised as categories: the codes, the names in the three languages, and usual short forms.
const CATEGORY_SYNONYMS: Record<string, Category> = (() => {
  const map: Record<string, Category> = {};
  for (const code of CATEGORIES) {
    map[normalize(code)] = code;
    for (const dict of [en, fr, ar]) map[normalize(dict.beneficiaries.categories[code])] = code;
  }
  const extra: Record<string, Category> = {
    agent: 'agent', 'agent sh': 'agent', 'agent sonatrach': 'agent', travailleur: 'agent', employe: 'agent', salarie: 'agent', worker: 'agent', 'عامل': 'agent',
    ad: 'ayant_droit', 'ayant droit': 'ayant_droit', 'ayants droit': 'ayant_droit', 'ayant droit agent': 'ayant_droit', dependent: 'ayant_droit', 'ذو حق': 'ayant_droit', 'ذوو الحقوق': 'ayant_droit',
    retraite: 'retraite', retired: 'retraite', retiree: 'retraite', 'متقاعد': 'retraite',
    'ad retraite': 'ad_retraite', 'ayant droit retraite': 'ad_retraite', 'ayant droit de retraite': 'ad_retraite',
    contractant: 'contractor_agent', 'entreprise contractante': 'contractor_agent', 'agent contractant': 'contractor_agent', 'sous traitant': 'contractor_agent', contractor: 'contractor_agent',
    'ad contractant': 'contractor_ad', 'ayant droit contractant': 'contractor_ad',
    'population locale': 'local_population', local: 'local_population', civil: 'local_population', civile: 'local_population', 'السكان المحليون': 'local_population',
  };
  for (const [k, v] of Object.entries(extra)) map[normalize(k)] = v;
  return map;
})();

export const recognizeCategory = (value: unknown): Category | null => CATEGORY_SYNONYMS[normalize(value)] ?? null;

const SEX_SYNONYMS: Record<string, 'M' | 'F'> = {
  m: 'M', h: 'M', homme: 'M', masculin: 'M', male: 'M', man: 'M', ذكر: 'M', 1: 'M',
  f: 'F', femme: 'F', feminin: 'F', female: 'F', woman: 'F', أنثى: 'F', انثى: 'F', 2: 'F',
};
export const recognizeSex = (value: unknown): 'M' | 'F' | null => SEX_SYNONYMS[normalize(value)] ?? null;

const RELATIONSHIP_SYNONYMS: Record<string, (typeof RELATIONSHIPS)[number]> = {
  spouse: 'spouse', conjoint: 'spouse', conjointe: 'spouse', epoux: 'spouse', epouse: 'spouse', 'conjoint e': 'spouse', wife: 'spouse', husband: 'spouse', زوج: 'spouse', زوجة: 'spouse',
  child: 'child', enfant: 'child', fils: 'child', fille: 'child', son: 'child', daughter: 'child', ابن: 'child', ابنة: 'child', بنت: 'child',
  parent: 'parent', pere: 'parent', mere: 'parent', ascendant: 'parent', father: 'parent', mother: 'parent', أب: 'parent', أم: 'parent',
  other: 'other', autre: 'other', آخر: 'other',
};
export const recognizeRelationship = (value: unknown) => RELATIONSHIP_SYNONYMS[normalize(value)] ?? null;

const pad = (n: number) => String(n).padStart(2, '0');
const validDate = (y: number, m: number, d: number) => {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d && y >= 1900;
};

/** Reads a date written as a spreadsheet date, dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy or yyyy-mm-dd. */
export const recognizeDate = (value: Cell): string | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  if (typeof value === 'number' && value > 0 && value < 80000) {
    // Spreadsheet day number (1 = 1900-01-01, with the 1900 leap-year quirk).
    return recognizeDate(new Date(Math.round((value - 25569) * 86400000)));
  }
  const text = String(value ?? '').trim();
  let m = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m && validDate(+m[3], +m[2], +m[1])) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
  m = text.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})(?:[ T].*)?$/);
  if (m && validDate(+m[1], +m[2], +m[3])) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  return null;
};

const text = (value: Cell) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isInteger(value)) return String(value);
  return String(value).trim();
};

export type Issue =
  | { kind: 'noNumber' | 'noLastName' | 'noFirstName' | 'noCategory' }
  | { kind: 'badCategory' | 'badSex' | 'badDate' | 'badRelationship'; value: string };

export interface PreparedRow {
  row: number;
  data: ImportRow | null;
  issues: Issue[];
  /** True when the number was made from the worker's number (dependents without their own). */
  generatedNumber: boolean;
}

export interface PrepareOptions {
  columns: Record<ImportField, number>;
  defaultCategory: Category | null;
  /** Category chosen by the user for values of the file that were not recognised. */
  categoryOverrides: Record<string, Category>;
}

/** Distinct category values of the file that are not recognised automatically. */
export const unknownCategoryValues = (table: SheetTable, column: number) => {
  if (column < 0) return [];
  const values = new Set<string>();
  for (const row of table.rows) {
    const value = text(row[column]);
    if (value && !recognizeCategory(value)) values.add(value);
  }
  return [...values].slice(0, 30);
};

/** Dependents without a number get one made from the worker's number, first name and birth date. */
const dependentNumber = (holder: string, firstName: string, birthDate: string | null) =>
  `${holder}/${normalize(firstName).replace(/ /g, '-')}${birthDate ? `/${birthDate}` : ''}`.slice(0, 64);

export const prepareRows = (table: SheetTable, { columns, defaultCategory, categoryOverrides }: PrepareOptions): PreparedRow[] =>
  table.rows.map((cells, index) => {
    const get = (field: ImportField) => (columns[field] >= 0 ? cells[columns[field]] : null);
    const issues: Issue[] = [];

    const rawCategory = text(get('category'));
    const category: Category | null = rawCategory
      ? recognizeCategory(rawCategory) ?? categoryOverrides[rawCategory] ?? null
      : defaultCategory;
    if (rawCategory && !category) issues.push({ kind: 'badCategory', value: rawCategory });
    if (!rawCategory && !category) issues.push({ kind: 'noCategory' });

    const lastName = text(get('last_name'));
    const firstName = text(get('first_name'));
    if (!lastName) issues.push({ kind: 'noLastName' });
    if (!firstName) issues.push({ kind: 'noFirstName' });

    const rawDate = get('birth_date');
    const birthDate = text(rawDate) ? recognizeDate(rawDate) : null;
    if (text(rawDate) && !birthDate) issues.push({ kind: 'badDate', value: text(rawDate) });

    const rawSex = text(get('sex'));
    const sex = rawSex ? recognizeSex(rawSex) : null;
    if (rawSex && !sex) issues.push({ kind: 'badSex', value: rawSex });

    const rawRelationship = text(get('relationship'));
    const relationship = rawRelationship ? recognizeRelationship(rawRelationship) : null;
    if (rawRelationship && !relationship) issues.push({ kind: 'badRelationship', value: rawRelationship });

    const holder = text(get('holder_external_id')) || null;
    let number = text(get('external_id'));
    let generatedNumber = false;
    if (!number && holder && category && isDependent(category) && firstName) {
      number = dependentNumber(holder, firstName, birthDate);
      generatedNumber = true;
    }
    if (!number) issues.push({ kind: 'noNumber' });

    const data: ImportRow | null =
      issues.length === 0 && category
        ? {
            row: index + 2, // spreadsheet line: the header is line 1
            external_id: number,
            category,
            last_name: lastName,
            first_name: firstName,
            birth_date: birthDate,
            sex,
            relationship: category && isDependent(category) ? relationship : null,
            company: text(get('company')) || null,
            unit: text(get('unit')) || null,
            phone: text(get('phone')) || null,
            holder_external_id: category && isDependent(category) ? holder : null,
          }
        : null;
    return { row: index + 2, data, issues, generatedNumber };
  });
