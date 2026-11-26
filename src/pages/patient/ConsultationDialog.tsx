// A consultation of one service: reason, vital signs, examination, diagnosis, treatment and,
// for nursing and dental care, the acts performed. Opened read-only for those who may only read
// that service.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FilePlus2, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { ACTS, Act, Consultation, NATURES, Service, VITALS, fetchActs, isTooth, saveConsultation } from '@/lib/consultations';
import { today } from '@/lib/visits';

const NONE = '__none__';

interface ConsultationDialogProps {
  beneficiaryId: string;
  /** The consultation to show or correct; a new one of `service` when absent. */
  consultation?: Consultation;
  service: Service;
  canWrite: boolean;
  onClose: () => void;
  /** Opens the document form for this consultation (after saving it). */
  onIssueDocument?: (consultation: Consultation) => void;
}

const empty = (beneficiaryId: string, service: Service): Consultation => ({
  beneficiary_id: beneficiaryId,
  service,
  consultation_date: today(),
  nature: 'care',
  reason: null,
  vitals: {},
  findings: null,
  diagnosis: null,
  treatment: null,
  work_stoppage_days: null,
});

export const ConsultationDialog = ({ beneficiaryId, consultation, service, canWrite, onClose, onIssueDocument }: ConsultationDialogProps) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Consultation>(() => consultation ?? empty(beneficiaryId, service));
  const catalogue = service === 'nursing' || service === 'dental' ? ACTS[service] : null;
  const savedActs = useQuery({
    queryKey: ['acts', consultation?.id],
    queryFn: () => fetchActs(consultation!.id!),
    enabled: Boolean(consultation?.id && catalogue),
  });
  const [added, setAdded] = useState<Act[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [draft, setDraft] = useState<{ code: string; tooth: string; quantity: string; notes: string }>({ code: '', tooth: '', quantity: '1', notes: '' });
  const acts = [...(savedActs.data ?? []).filter((a) => !removed.includes(a.id!)), ...added];
  const needsTooth = catalogue?.find((a) => a.code === draft.code)?.tooth ?? false;

  const save = useMutation({
    mutationFn: (_withDocument: boolean) => saveConsultation(form, added, removed),
    onSuccess: (id, withDocument) => {
      queryClient.invalidateQueries({ queryKey: ['consultations', beneficiaryId] });
      queryClient.invalidateQueries({ queryKey: ['acts', id] });
      toast.success(t('consultations.saved'));
      onClose();
      if (withDocument) onIssueDocument?.({ ...form, id });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const set = <K extends keyof Consultation>(key: K, value: Consultation[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setVital = (key: string, value: string) => setForm((f) => ({ ...f, vitals: { ...f.vitals, [key]: value } }));

  const addAct = () => {
    if (!draft.code) return void toast.error(t('consultations.acts.chooseAct'));
    const tooth = draft.tooth.trim() === '' ? null : Number(draft.tooth);
    if (needsTooth && tooth === null) return void toast.error(t('consultations.acts.toothRequired'));
    if (tooth !== null && !isTooth(tooth)) return void toast.error(t('consultations.acts.toothInvalid'));
    const quantity = Math.min(50, Math.max(1, Number(draft.quantity) || 1));
    setAdded((list) => [...list, { act_code: draft.code, tooth, quantity, notes: draft.notes.trim() || null }]);
    setDraft({ code: '', tooth: '', quantity: '1', notes: '' });
  };

  const removeAct = (act: Act, index: number) => {
    if (act.id) setRemoved((list) => [...list, act.id!]);
    else setAdded((list) => list.filter((_, i) => i !== index - (acts.length - added.length)));
  };

  const submit = (withDocument: boolean) => {
    if (!form.consultation_date) return void toast.error(t('consultations.errors.date'));
    if (form.consultation_date > today()) return void toast.error(t('consultations.errors.future'));
    save.mutate(withDocument);
  };

  const text = (key: 'reason' | 'findings' | 'diagnosis' | 'treatment', rows = 2) => (
    <div className="grid gap-2 sm:col-span-2">
      <Label htmlFor={`consultation-${key}`}>{t(`consultations.fields.${key}`)}</Label>
      <Textarea id={`consultation-${key}`} rows={rows} maxLength={key === 'reason' ? 1000 : 4000} value={form[key] ?? ''} onChange={(e) => set(key, e.target.value || null)} />
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl" data-testid="consultation-dialog">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t(`consultations.services.${form.service}`)} — {form.id ? t('consultations.titleExisting') : t('consultations.titleNew')}
            </DialogTitle>
          </DialogHeader>
          <fieldset disabled={!canWrite} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="consultation-date">{t('consultations.fields.date')} *</Label>
              <Input id="consultation-date" type="date" max={today()} value={form.consultation_date} onChange={(e) => set('consultation_date', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consultation-nature">{t('consultations.fields.nature')}</Label>
              <Select value={form.nature ?? NONE} onValueChange={(v) => set('nature', v === NONE ? null : (v as Consultation['nature']))}>
                <SelectTrigger id="consultation-nature">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {NATURES.map((n) => (
                    <SelectItem key={n} value={n}>
                      {t(`consultations.natures.${n}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {text('reason')}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-6">
              {VITALS.map((v) => (
                <div key={v} className="grid gap-1">
                  <Label htmlFor={`vital-${v}`} className="text-xs">
                    {t(`consultations.vitals.${v}`)}
                  </Label>
                  <Input id={`vital-${v}`} dir="ltr" maxLength={12} value={form.vitals[v] ?? ''} onChange={(e) => setVital(v, e.target.value)} />
                </div>
              ))}
            </div>
            {text('findings', 3)}
            {text('diagnosis')}
            {text('treatment')}
            <div className="grid gap-2">
              <Label htmlFor="consultation-stoppage">{t('consultations.fields.workStoppageDays')}</Label>
              <Input
                id="consultation-stoppage"
                type="number"
                min={0}
                max={365}
                dir="ltr"
                value={form.work_stoppage_days ?? ''}
                onChange={(e) => set('work_stoppage_days', e.target.value === '' ? null : Number(e.target.value))}
              />
            </div>
          </fieldset>

          {catalogue && (
            <section className="mt-6 space-y-3" data-section="acts">
              <h3 className="text-sm font-semibold">{t('consultations.acts.title')}</h3>
              {acts.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('consultations.acts.act')}</TableHead>
                        {service === 'dental' && <TableHead>{t('consultations.acts.tooth')}</TableHead>}
                        <TableHead>{t('consultations.acts.quantity')}</TableHead>
                        <TableHead>{t('consultations.acts.notes')}</TableHead>
                        {canWrite && <TableHead className="w-12" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acts.map((a, i) => (
                        <TableRow key={a.id ?? `new-${i}`}>
                          <TableCell>{t(`consultations.actNames.${a.act_code}`, { defaultValue: a.act_code })}</TableCell>
                          {service === 'dental' && <TableCell dir="ltr">{a.tooth ?? '—'}</TableCell>}
                          <TableCell dir="ltr">{a.quantity}</TableCell>
                          <TableCell>{a.notes ?? '—'}</TableCell>
                          {canWrite && (
                            <TableCell>
                              <Button type="button" variant="ghost" size="icon" aria-label={t('consultations.acts.remove')} onClick={() => removeAct(a, i)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {acts.length === 0 && !canWrite && <p className="text-sm text-muted-foreground">{t('consultations.acts.none')}</p>}
              {canWrite && (
                <div className="grid items-end gap-2 sm:grid-cols-[2fr_80px_80px_2fr_auto]">
                  <div className="grid gap-1">
                    <Label htmlFor="act-code" className="text-xs">
                      {t('consultations.acts.act')}
                    </Label>
                    <Select value={draft.code || NONE} onValueChange={(v) => setDraft((d) => ({ ...d, code: v === NONE ? '' : v }))}>
                      <SelectTrigger id="act-code">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>—</SelectItem>
                        {catalogue.map((a) => (
                          <SelectItem key={a.code} value={a.code}>
                            {t(`consultations.actNames.${a.code}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="act-tooth" className="text-xs">
                      {t('consultations.acts.tooth')}
                    </Label>
                    <Input id="act-tooth" dir="ltr" inputMode="numeric" maxLength={2} disabled={service !== 'dental'} value={draft.tooth} onChange={(e) => setDraft((d) => ({ ...d, tooth: e.target.value.replace(/\D/g, '') }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="act-quantity" className="text-xs">
                      {t('consultations.acts.quantity')}
                    </Label>
                    <Input id="act-quantity" type="number" dir="ltr" min={1} max={50} value={draft.quantity} onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="act-notes" className="text-xs">
                      {t('consultations.acts.notes')}
                    </Label>
                    <Input id="act-notes" maxLength={500} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
                  </div>
                  <Button type="button" variant="outline" onClick={addAct}>
                    <Plus className="me-2 h-4 w-4" />
                    {t('consultations.acts.add')}
                  </Button>
                </div>
              )}
            </section>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {canWrite ? t('common.cancel') : t('visits.close')}
            </Button>
            {!canWrite && form.id && can('documents.issue') && onIssueDocument && (
              <Button type="button" variant="secondary" onClick={() => onIssueDocument(form)}>
                <FilePlus2 className="me-2 h-4 w-4" />
                {t('consultations.issueDocument')}
              </Button>
            )}
            {canWrite && can('documents.issue') && onIssueDocument && (
              <Button type="button" variant="secondary" disabled={save.isPending} onClick={() => submit(true)}>
                <FilePlus2 className="me-2 h-4 w-4" />
                {t('consultations.saveAndIssue')}
              </Button>
            )}
            {canWrite && (
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? t('common.saving') : t('common.save')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDialog;
