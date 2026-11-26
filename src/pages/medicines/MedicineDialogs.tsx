// Dialogs of the medicine stock: add or edit a medicine, record a movement (receipt, dispensing,
// adjustment, disposal) and see the history of movements.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { FORMS, MOVEMENT_KINDS, Medicine, MovementKind, UNITS, addMovement, fetchMovements, medicineLabel, saveMedicine } from '@/lib/medicines';
import { today } from '@/lib/visits';

const NONE = '__none__';

const emptyMedicine = (): Medicine => ({
  name: '',
  generic_name: null,
  form: 'tablet',
  strength: null,
  category: null,
  unit: 'box',
  threshold: 0,
  expiry_date: null,
  location: null,
  prescription_required: false,
  active: true,
  notes: null,
});

export const MedicineDialog = ({ medicine, onClose }: { medicine?: Medicine; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Medicine>(() => medicine ?? emptyMedicine());
  const [opening, setOpening] = useState('');
  const save = useMutation({
    mutationFn: () => saveMedicine(form, Number(opening) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success(t('medicines.saved'));
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });
  const set = <K extends keyof Medicine>(key: K, value: Medicine[K]) => setForm((f) => ({ ...f, [key]: value }));
  const text = (key: 'name' | 'generic_name' | 'strength' | 'category' | 'location', max = 200) => (
    <div className="grid gap-2">
      <Label htmlFor={`medicine-${key}`}>
        {t(`medicines.fields.${key}`)}
        {key === 'name' ? ' *' : ''}
      </Label>
      <Input id={`medicine-${key}`} maxLength={max} value={form[key] ?? ''} onChange={(e) => set(key, key === 'name' ? e.target.value : e.target.value || null)} />
    </div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return void toast.error(t('medicines.errors.name'));
            save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{medicine?.id ? t('medicines.editTitle', { name: medicineLabel(medicine) }) : t('medicines.newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {text('name')}
            {text('generic_name')}
            <div className="grid gap-2">
              <Label htmlFor="medicine-form">{t('medicines.fields.form')}</Label>
              <Select value={form.form ?? NONE} onValueChange={(v) => set('form', v === NONE ? null : (v as Medicine['form']))}>
                <SelectTrigger id="medicine-form">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {FORMS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {t(`medicines.forms.${f}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {text('strength', 50)}
            {text('category', 100)}
            <div className="grid gap-2">
              <Label htmlFor="medicine-unit">{t('medicines.fields.unit')}</Label>
              <Select value={form.unit} onValueChange={(v) => set('unit', v as Medicine['unit'])}>
                <SelectTrigger id="medicine-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {t(`medicines.units.${u}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicine-threshold">{t('medicines.fields.threshold')}</Label>
              <Input id="medicine-threshold" type="number" dir="ltr" min={0} value={form.threshold} onChange={(e) => set('threshold', Math.max(0, Number(e.target.value) || 0))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicine-expiry">{t('medicines.fields.expiry_date')}</Label>
              <Input id="medicine-expiry" type="date" value={form.expiry_date ?? ''} onChange={(e) => set('expiry_date', e.target.value || null)} />
            </div>
            {text('location', 100)}
            {!medicine?.id && (
              <div className="grid gap-2">
                <Label htmlFor="medicine-opening">{t('medicines.openingStock')}</Label>
                <Input id="medicine-opening" type="number" dir="ltr" min={0} value={opening} onChange={(e) => setOpening(e.target.value)} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox id="medicine-prescription" checked={form.prescription_required} onCheckedChange={(v) => set('prescription_required', v === true)} />
              <Label htmlFor="medicine-prescription">{t('medicines.fields.prescription_required')}</Label>
            </div>
            {medicine?.id && (
              <div className="flex items-center gap-2">
                <Checkbox id="medicine-active" checked={form.active} onCheckedChange={(v) => set('active', v === true)} />
                <Label htmlFor="medicine-active">{t('medicines.fields.active')}</Label>
              </div>
            )}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="medicine-notes">{t('medicines.fields.notes')}</Label>
              <Textarea id="medicine-notes" rows={2} maxLength={1000} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const MovementDialog = ({ medicine, kind: initialKind, onClose }: { medicine: Medicine; kind: MovementKind; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const number = useNumberFormat();
  const [kind, setKind] = useState<MovementKind>(initialKind);
  const [direction, setDirection] = useState<'plus' | 'minus'>('minus');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(today());
  const [lot, setLot] = useState('');
  const [expiry, setExpiry] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const save = useMutation({
    mutationFn: () => {
      const amount = Math.round(Number(quantity));
      return addMovement({
        medicine_id: medicine.id!,
        kind,
        quantity: kind === 'adjust' && direction === 'minus' ? -amount : amount,
        movement_date: date,
        lot_number: kind === 'in' ? lot.trim() || null : null,
        expiry_date: kind === 'in' ? expiry || null : null,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['movements', medicine.id] });
      toast.success(t('medicines.movementSaved'));
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amount = Number(quantity);
            if (!Number.isInteger(amount) || amount <= 0) return void toast.error(t('medicines.errors.quantity'));
            if (!date || date > today()) return void toast.error(t('medicines.errors.date'));
            save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{medicineLabel(medicine)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('medicines.inStock', { quantity: number(medicine.quantity ?? 0), unit: t(`medicines.units.${medicine.unit}`) })}
          </p>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="movement-kind">{t('medicines.movement.kind')}</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as MovementKind)}>
                <SelectTrigger id="movement-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {t(`medicines.kinds.${k}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {kind === 'adjust' ? (
              <div className="grid gap-2">
                <Label htmlFor="movement-direction">{t('medicines.movement.direction')}</Label>
                <Select value={direction} onValueChange={(v) => setDirection(v as 'plus' | 'minus')}>
                  <SelectTrigger id="movement-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plus">{t('medicines.movement.plus')}</SelectItem>
                    <SelectItem value="minus">{t('medicines.movement.minus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="hidden sm:block" />
            )}
            <div className="grid gap-2">
              <Label htmlFor="movement-quantity">{t('medicines.movement.quantity', { unit: t(`medicines.units.${medicine.unit}`) })}</Label>
              <Input id="movement-quantity" type="number" dir="ltr" min={1} step={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="movement-date">{t('medicines.movement.date')}</Label>
              <Input id="movement-date" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            {kind === 'in' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="movement-lot">{t('medicines.movement.lot')}</Label>
                  <Input id="movement-lot" maxLength={60} value={lot} onChange={(e) => setLot(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="movement-expiry">{t('medicines.fields.expiry_date')}</Label>
                  <Input id="movement-expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                </div>
              </>
            )}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="movement-reference">{t(`medicines.movement.reference_${kind}`)}</Label>
              <Input id="movement-reference" maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="movement-notes">{t('medicines.fields.notes')}</Label>
              <Textarea id="movement-notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const HistoryDialog = ({ medicine, onClose }: { medicine: Medicine; onClose: () => void }) => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const number = useNumberFormat();
  const list = useQuery({ queryKey: ['movements', medicine.id], queryFn: () => fetchMovements(medicine.id!) });
  const signed = (kind: MovementKind, q: number) => (kind === 'in' || kind === 'adjust' ? q : -q);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('medicines.historyTitle', { name: medicineLabel(medicine) })}</DialogTitle>
        </DialogHeader>
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('medicines.noMovement')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border" data-testid="movements">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('medicines.movement.date')}</TableHead>
                  <TableHead>{t('medicines.movement.kind')}</TableHead>
                  <TableHead className="text-end">{t('medicines.movement.change')}</TableHead>
                  <TableHead className="text-end">{t('medicines.movement.balance')}</TableHead>
                  <TableHead>{t('medicines.movement.details')}</TableHead>
                  <TableHead>{t('consultations.author')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data!.map((m) => {
                  const change = signed(m.kind, m.quantity);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>{formatDate(m.movement_date)}</TableCell>
                      <TableCell>{t(`medicines.kinds.${m.kind}`)}</TableCell>
                      <TableCell className={`text-end font-mono ${change < 0 ? 'text-red-700' : 'text-green-700'}`} dir="ltr">
                        {change > 0 ? '+' : '−'}
                        {number(Math.abs(change))}
                      </TableCell>
                      <TableCell className="text-end font-mono" dir="ltr">
                        {number(m.balance_after)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {[m.reference, m.lot_number && `${t('medicines.movement.lot')} ${m.lot_number}`, m.expiry_date && formatDate(m.expiry_date), m.notes].filter(Boolean).join(' · ') || '—'}
                      </TableCell>
                      <TableCell className="text-sm">{m.author_name ?? '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('visits.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
