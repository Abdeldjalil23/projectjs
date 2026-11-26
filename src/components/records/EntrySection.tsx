// A list of entries of the medical record (positions, history, vaccinations…): a table, and a
// dialog to add or edit an entry. The fields of each list are described by FieldDef.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Entry, EntryTable, deleteEntry, fetchEntries, saveEntry } from '@/lib/records';
import { useDateFormat } from '@/hooks/useDateFormat';

export interface FieldDef {
  /** Column name, or "details.name" for a field kept in the details of the entry. */
  key: string;
  /** Text key of the label. */
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select';
  /** Values of a select; their labels are the texts `${optionsKey}.${value}`. */
  options?: readonly string[];
  optionsKey?: string;
  required?: boolean;
  /** Shown as a column of the table. */
  inTable?: boolean;
  /** Takes the whole width of the form. */
  wide?: boolean;
  max?: number;
}

const NONE = '__none__';

const readValue = (entry: Entry | undefined, key: string): string => {
  if (!entry) return '';
  const value = key.startsWith('details.')
    ? (entry.details as Record<string, unknown> | undefined)?.[key.slice(8)]
    : entry[key];
  return value === null || value === undefined ? '' : String(value);
};

interface EntrySectionProps {
  title: string;
  table: EntryTable;
  beneficiaryId: string;
  /** For medical_history: personal, family, intoxication or work_accident. */
  kind?: string;
  fields: FieldDef[];
  canWrite: boolean;
  /** Test id of the section, to find it on the page. */
  id: string;
}

export const EntrySection = ({ title, table, beneficiaryId, kind, fields, canWrite, id }: EntrySectionProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const formatDate = useDateFormat();
  const queryKey = ['entries', table, beneficiaryId, kind ?? ''];
  const entries = useQuery({ queryKey, queryFn: () => fetchEntries(table, beneficiaryId, kind) });

  const [editing, setEditing] = useState<Entry | 'new' | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<Entry | null>(null);

  const open = (entry: Entry | 'new') => {
    setValues(Object.fromEntries(fields.map((f) => [f.key, readValue(entry === 'new' ? undefined : entry, f.key)])));
    setEditing(entry);
  };

  const save = useMutation({
    mutationFn: async () => {
      const existing = editing === 'new' ? undefined : editing!;
      const row: Record<string, unknown> = {};
      const details: Record<string, unknown> = { ...((existing?.details as Record<string, unknown>) ?? {}) };
      for (const field of fields) {
        const raw = values[field.key]?.trim() ?? '';
        const value = raw === '' ? null : field.type === 'number' ? Number(raw) : raw;
        if (field.key.startsWith('details.')) {
          if (value === null) delete details[field.key.slice(8)];
          else details[field.key.slice(8)] = value;
        } else {
          row[field.key] = value;
        }
      }
      if (table === 'medical_history') row.details = details;
      if (!existing) {
        row.beneficiary_id = beneficiaryId;
        if (kind) row.kind = kind;
      }
      await saveEntry(table, row, existing?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t('record.entries.saved'));
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const remove = useMutation({
    mutationFn: (entry: Entry) => deleteEntry(table, entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(t('record.entries.deleted'));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
    onSettled: () => setRemoving(null),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !values[f.key]?.trim());
    if (missing) return void toast.error(t('record.entries.required', { field: t(missing.label) }));
    save.mutate();
  };

  const display = (entry: Entry, field: FieldDef) => {
    const value = readValue(entry, field.key);
    if (!value) return '—';
    if (field.type === 'date') return formatDate(value);
    if (field.type === 'select') return t(`${field.optionsKey}.${value}`, { defaultValue: value });
    return value;
  };

  const columns = fields.filter((f) => f.inTable);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card data-section={id}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {canWrite && (
          <Button size="sm" variant="outline" onClick={() => open('new')}>
            <Plus className="me-2 h-4 w-4" />
            {t('record.entries.add')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {entries.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : entries.isError ? (
          <p className="text-sm text-destructive">
            {entries.error instanceof Error ? entries.error.message : t('common.requestFailed')}
          </p>
        ) : (entries.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('record.entries.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((f) => (
                    <TableHead key={f.key}>{t(f.label)}</TableHead>
                  ))}
                  {canWrite && (
                    <TableHead className="w-20">
                      <span className="sr-only">{t('common.actions')}</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.data!.map((entry) => (
                  <TableRow key={entry.id}>
                    {columns.map((f) => (
                      <TableCell key={f.key} className="max-w-[260px] truncate" title={readValue(entry, f.key)}>
                        {display(entry, f)}
                      </TableCell>
                    ))}
                    {canWrite && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" aria-label={t('record.entries.edit')} onClick={() => open(entry)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label={t('record.entries.delete')} onClick={() => setRemoving(entry)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {editing && (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <form onSubmit={submit}>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 sm:grid-cols-2">
                {fields.map((f) => {
                  const fieldId = `${id}-${f.key.replace('.', '-')}`;
                  const set = (v: string) => setValues((prev) => ({ ...prev, [f.key]: v }));
                  return (
                    <div key={f.key} className={`grid gap-2 ${f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                      <Label htmlFor={fieldId}>
                        {t(f.label)}
                        {f.required ? ' *' : ''}
                      </Label>
                      {f.type === 'textarea' ? (
                        <Textarea id={fieldId} rows={2} value={values[f.key] ?? ''} onChange={(e) => set(e.target.value)} maxLength={f.max ?? 2000} />
                      ) : f.type === 'select' ? (
                        <Select value={values[f.key] || NONE} onValueChange={(v) => set(v === NONE ? '' : v)}>
                          <SelectTrigger id={fieldId}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>—</SelectItem>
                            {(f.options ?? []).map((o) => (
                              <SelectItem key={o} value={o}>
                                {t(`${f.optionsKey}.${o}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={fieldId}
                          type={f.type}
                          value={values[f.key] ?? ''}
                          onChange={(e) => set(e.target.value)}
                          maxLength={f.type === 'text' ? f.max ?? 300 : undefined}
                          max={f.type === 'date' && f.key !== 'next_due_date' && f.key !== 'end_date' ? today : f.max}
                          min={f.type === 'number' ? 0 : undefined}
                          step={f.type === 'number' ? 'any' : undefined}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('record.entries.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('record.entries.deleteBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => removing && remove.mutate(removing)}>{t('record.entries.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EntrySection;
