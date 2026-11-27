// Importing beneficiaries from an Excel or CSV file: choose the file, match its columns,
// check the rows, then send them to the server in batches.
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ArrowLeft, FileSpreadsheet, Upload } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CATEGORIES, Category, ImportResult, importBeneficiaries } from '@/lib/beneficiaries';
import {
  IMPORT_FIELDS,
  ImportField,
  Issue,
  MAX_IMPORT_ROWS,
  REQUIRED_FIELDS,
  SheetTable,
  guessColumns,
  prepareRows,
  readTable,
  unknownCategoryValues,
} from '@/lib/importFile';

const NONE = 'none';
const SOURCE_PATTERN = /^[a-z0-9_-]{2,32}$/;
const PREVIEW_ROWS = 8;
const LISTED_PROBLEMS = 50;

const issueText = (t: TFunction, issue: Issue) =>
  'value' in issue ? t(`importPage.issues.${issue.kind}`, { value: issue.value }) : t(`importPage.issues.${issue.kind}`);

export const ImportBeneficiariesPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [table, setTable] = useState<SheetTable | null>(null);
  const [readError, setReadError] = useState('');
  const [columns, setColumns] = useState<Record<ImportField, number> | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<Category | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Category>>({});
  const [source, setSource] = useState('excel');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setFileName('');
    setTable(null);
    setReadError('');
    setColumns(null);
    setDefaultCategory(null);
    setOverrides({});
    setProgress(0);
    setResult(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const openFile = async (file: File | undefined) => {
    reset();
    if (!file) return;
    setFileName(file.name);
    try {
      const data = await readTable(file);
      if (data.rows.length === 0) return setReadError(t('importPage.empty'));
      if (data.rows.length > MAX_IMPORT_ROWS) return setReadError(t('importPage.tooMany', { max: MAX_IMPORT_ROWS }));
      setTable(data);
      setColumns(guessColumns(data.headers));
      setSource(/\.csv$/i.test(file.name) ? 'csv' : 'excel');
    } catch {
      setReadError(t('importPage.readFailed'));
    }
  };

  const prepared = useMemo(
    () => (table && columns ? prepareRows(table, { columns, defaultCategory, categoryOverrides: overrides }) : []),
    [table, columns, defaultCategory, overrides],
  );
  const ready = prepared.filter((r) => r.data);
  const problems = prepared.filter((r) => !r.data);
  const unknownValues = table && columns ? unknownCategoryValues(table, columns.category) : [];
  const anyGenerated = prepared.some((r) => r.generatedNumber);
  const sourceValid = SOURCE_PATTERN.test(source) && source !== 'manual';

  const run = useMutation({
    mutationFn: () => importBeneficiaries(source, ready.map((r) => r.data!), setProgress),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });


  const fieldLabel = (field: ImportField) =>
    `${t(`importPage.fields.${field}`)}${REQUIRED_FIELDS.includes(field) ? ` (${t('importPage.required')})` : ''}`;

  return (
    <AppLayout title={t('importPage.title')}>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/beneficiaries">
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('importPage.back')}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('importPage.step1')}</CardTitle>
            <CardDescription>{t('importPage.intro')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInput}
              id="import-file"
              type="file"
              accept=".xlsx,.csv,.txt"
              className="hidden"
              onChange={(e) => void openFile(e.target.files?.[0])}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={run.isPending}>
                <FileSpreadsheet className="me-2 h-4 w-4" />
                {t('importPage.choose')}
              </Button>
              {table && <span className="text-sm">{t('importPage.fileInfo', { name: fileName, rows: table.rows.length })}</span>}
            </div>
            <p className="text-xs text-muted-foreground">{t('importPage.headerHint')}</p>
            {readError && <p className="text-sm text-destructive">{readError}</p>}
          </CardContent>
        </Card>

        {table && columns && !result && (
          <Card>
            <CardHeader>
              <CardTitle>{t('importPage.step2')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {IMPORT_FIELDS.map((field) => (
                  <div key={field} className="grid gap-1.5">
                    <Label htmlFor={`col-${field}`}>{fieldLabel(field)}</Label>
                    <Select
                      value={String(columns[field])}
                      onValueChange={(v) => setColumns({ ...columns, [field]: Number(v) })}
                    >
                      <SelectTrigger id={`col-${field}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">{t('importPage.notInFile')}</SelectItem>
                        {table.headers.map((header, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="default-category">{t('importPage.defaultCategory')}</Label>
                  <Select
                    value={defaultCategory ?? NONE}
                    onValueChange={(v) => setDefaultCategory(v === NONE ? null : (v as Category))}
                  >
                    <SelectTrigger id="default-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t('importPage.noDefault')}</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {t(`beneficiaries.categories.${c}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="import-source">{t('importPage.source')}</Label>
                  <Input id="import-source" dir="ltr" value={source} onChange={(e) => setSource(e.target.value.trim())} />
                  <p className={`text-xs ${sourceValid ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {sourceValid ? t('importPage.sourceHint') : t('importPage.sourceInvalid')}
                  </p>
                </div>
              </div>

              {unknownValues.length > 0 && (
                <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4">
                  <div>
                    <p className="font-medium">{t('importPage.unknownValues')}</p>
                    <p className="text-sm text-muted-foreground">{t('importPage.unknownValuesHint')}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {unknownValues.map((value) => (
                      <div key={value} className="grid gap-1.5">
                        <Label>«{value}»</Label>
                        <Select
                          value={overrides[value] ?? NONE}
                          onValueChange={(v) => {
                            const next = { ...overrides };
                            if (v === NONE) delete next[value];
                            else next[value] = v as Category;
                            setOverrides(next);
                          }}
                        >
                          <SelectTrigger aria-label={value}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>{t('importPage.noDefault')}</SelectItem>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {t(`beneficiaries.categories.${c}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {table && columns && !result && (
          <Card>
            <CardHeader>
              <CardTitle>{t('importPage.step3')}</CardTitle>
              <CardDescription>
                <span className="text-green-700">{t('importPage.ready', { count: ready.length })}</span>
                {problems.length > 0 && (
                  <span className="ms-4 text-destructive">{t('importPage.withProblems', { count: problems.length })}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {anyGenerated && <p className="text-sm text-muted-foreground">{t('importPage.generatedHint')}</p>}

              {ready.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('importPage.preview')}</p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>{t('beneficiaries.columns.number')}</TableHead>
                          <TableHead>{t('beneficiaries.columns.name')}</TableHead>
                          <TableHead>{t('beneficiaries.columns.category')}</TableHead>
                          <TableHead>{t('beneficiaries.form.birthDate')}</TableHead>
                          <TableHead>{t('beneficiaries.columns.sex')}</TableHead>
                          <TableHead>{t('beneficiaries.form.holder')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ready.slice(0, PREVIEW_ROWS).map(({ data }) => (
                          <TableRow key={data!.row}>
                            <TableCell>{data!.row}</TableCell>
                            <TableCell className="font-mono text-xs">
                              <span dir="ltr">{data!.external_id}</span>
                            </TableCell>
                            <TableCell>
                              {data!.last_name} {data!.first_name}
                            </TableCell>
                            <TableCell>{t(`beneficiaries.categories.${data!.category}`)}</TableCell>
                            <TableCell>{data!.birth_date ?? '—'}</TableCell>
                            <TableCell>{data!.sex ? t(`beneficiaries.sexes.${data!.sex}`) : '—'}</TableCell>
                            <TableCell className="font-mono text-xs">
                              <span dir="ltr">{data!.holder_external_id ?? '—'}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {problems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('importPage.problems')}</p>
                  <ul className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-3 text-sm" data-testid="import-problems">
                    {problems.slice(0, LISTED_PROBLEMS).map((p) => (
                      <li key={p.row}>
                        <span className="font-medium">{t('importPage.row', { row: p.row })}</span>:{' '}
                        {p.issues.map((issue) => issueText(t, issue)).join(', ')}
                      </li>
                    ))}
                    {problems.length > LISTED_PROBLEMS && (
                      <li className="text-muted-foreground">
                        {t('importPage.more', { count: problems.length - LISTED_PROBLEMS })}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {run.isPending && (
                <div className="space-y-2">
                  <Progress className="rtl:-scale-x-100" value={(progress / Math.max(1, ready.length)) * 100} />
                  <p className="text-sm text-muted-foreground">
                    {t('importPage.importing', { done: progress, total: ready.length })}
                  </p>
                </div>
              )}
              {run.isError && (
                <p className="text-sm text-destructive">
                  {t('importPage.failed', {
                    message: run.error instanceof Error ? run.error.message : t('common.requestFailed'),
                  })}
                </p>
              )}

              <Button disabled={ready.length === 0 || !sourceValid || run.isPending} onClick={() => run.mutate()}>
                <Upload className="me-2 h-4 w-4" />
                {t('importPage.start', { count: ready.length })}
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{t('importPage.resultTitle')}</CardTitle>
              <CardDescription>{fileName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="grid gap-1 text-sm" data-testid="import-result">
                <li>{t('importPage.inserted', { count: result.inserted })}</li>
                <li>{t('importPage.updatedCount', { count: result.updated })}</li>
                <li>{t('importPage.linked', { count: result.linked })}</li>
                <li className={result.errors.length ? 'text-destructive' : ''}>
                  {t('importPage.refused', { count: result.errors.length })}
                </li>
              </ul>
              {result.errors.length > 0 && (
                <ul className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-3 text-sm" dir="auto">
                  {result.errors.slice(0, LISTED_PROBLEMS).map((e) => (
                    <li key={`${e.row}-${e.message}`}>
                      <span className="font-medium">{t('importPage.row', { row: e.row })}</span>: {e.message}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={reset}>
                  {t('importPage.another')}
                </Button>
                <Button asChild>
                  <Link to="/beneficiaries">{t('importPage.back')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ImportBeneficiariesPage;
