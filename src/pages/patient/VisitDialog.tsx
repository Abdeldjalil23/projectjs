// The occupational health visit form, as on the paper "Visite médicale": measurements, vision
// and hearing, questions and examination of each system, explorations, orientation and the
// fitness decision. Opened read-only for those who may only read visits.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DECISIONS,
  EXPLORATION_KEYS,
  Orientation,
  SYSTEMS,
  URINE_RESULTS,
  VISIT_TYPES,
  Visit,
  addMonths,
  bmi,
  emptyVisit,
  saveVisit,
  today,
} from '@/lib/visits';

const NONE = '__none__';

interface VisitDialogProps {
  beneficiaryId: string;
  /** The visit to show or correct; a new visit when absent. */
  visit?: Visit;
  canWrite: boolean;
  onClose: () => void;
}

export const VisitDialog = ({ beneficiaryId, visit, canWrite, onClose }: VisitDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Visit>(() => visit ?? emptyVisit(beneficiaryId));

  const save = useMutation({
    mutationFn: () => saveVisit(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', beneficiaryId] });
      toast.success(t('visits.saved'));
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const set = <K extends keyof Visit>(key: K, value: Visit[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setMeasure = (key: string, value: string | boolean) =>
    setForm((f) => {
      const measures = { ...f.measures };
      if (value === '' || value === false) delete measures[key];
      else measures[key] = value;
      return { ...f, measures };
    });
  const setOrientation = <K extends keyof Orientation>(key: K, value: Orientation[K] | undefined) =>
    setForm((f) => {
      const orientation = { ...f.orientation };
      if (value === undefined || value === '' || value === false) delete orientation[key];
      else orientation[key] = value;
      return { ...f, orientation };
    });
  const setExploration = (key: string, value: string) =>
    setForm((f) => {
      const explorations = { ...f.explorations };
      if (value.trim() === '') delete explorations[key];
      else explorations[key] = value;
      return { ...f, explorations };
    });
  const toggleSymptom = (system: string, symptom: string, on: boolean) =>
    setForm((f) => {
      const entry = f.questionnaire[system] ?? {};
      const symptoms = new Set(entry.symptoms ?? []);
      if (on) symptoms.add(symptom);
      else symptoms.delete(symptom);
      return { ...f, questionnaire: { ...f.questionnaire, [system]: { ...entry, symptoms: [...symptoms] } } };
    });
  const setSystemOther = (system: string, value: string) =>
    setForm((f) => ({ ...f, questionnaire: { ...f.questionnaire, [system]: { ...(f.questionnaire[system] ?? {}), other: value } } }));
  const setExam = (system: string, item: string, value: string) =>
    setForm((f) => ({ ...f, examination: { ...f.examination, [system]: { ...(f.examination[system] ?? {}), [item]: value } } }));

  const number = (key: 'weight_kg' | 'height_cm' | 'pulse' | 'bp_systolic' | 'bp_diastolic', id: string, min: number, max: number, step = '1') => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{t(`visits.measures.${key}`)}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={form[key] ?? ''}
        onChange={(e) => set(key, e.target.value === '' ? null : Number(e.target.value))}
      />
    </div>
  );

  const pick = <T extends string>(
    id: string,
    label: string,
    value: T | null | undefined,
    options: readonly T[],
    optionLabel: (o: T) => string,
    onChange: (v: T | null) => void,
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? null : (v as T))}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>—</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {optionLabel(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const measureText = (key: string) => (
    <div className="grid gap-2">
      <Label htmlFor={`visit-${key}`}>{t(`visits.measures.${key}`)}</Label>
      <Input
        id={`visit-${key}`}
        dir="ltr"
        maxLength={20}
        value={(form.measures[key] as string | undefined) ?? ''}
        onChange={(e) => setMeasure(key, e.target.value)}
      />
    </div>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visit_date) return void toast.error(t('visits.errors.date'));
    if (form.visit_date > today()) return void toast.error(t('visits.errors.future'));
    if (form.next_visit_date && form.next_visit_date <= form.visit_date) return void toast.error(t('visits.errors.nextVisit'));
    if (form.unfit_until && form.unfit_until < form.visit_date) return void toast.error(t('visits.errors.unfitUntil'));
    save.mutate();
  };

  const bodyMassIndex = bmi(form.weight_kg, form.height_cm);
  const reservations = form.decision === 'fit_with_reservations';
  const temporarilyUnfit = form.decision === 'temporarily_unfit';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl" data-testid="visit-dialog">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{visit?.id ? t('visits.titleExisting') : t('visits.titleNew')}</DialogTitle>
          </DialogHeader>

          <fieldset disabled={!canWrite} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {pick('visit-type', t('visits.type'), form.visit_type, VISIT_TYPES, (o) => t(`visits.types.${o}`), (v) => v && set('visit_type', v))}
              <div className="grid gap-2">
                <Label htmlFor="visit-date">{t('visits.date')} *</Label>
                <Input
                  id="visit-date"
                  type="date"
                  max={today()}
                  value={form.visit_date}
                  onChange={(e) => {
                    const date = e.target.value;
                    setForm((f) => ({
                      ...f,
                      visit_date: date,
                      // A new periodic visit is due one year later by default.
                      next_visit_date: !f.id && date ? addMonths(date, 12) : f.next_visit_date,
                    }));
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('visits.doctor')}</Label>
                <p className="flex h-10 items-center text-sm text-muted-foreground">{form.doctor_name || (form.id ? '—' : t('visits.doctorAuto'))}</p>
              </div>
            </div>

            <Accordion type="multiple" defaultValue={['measures', 'conclusion']} className="rounded-md border px-4">
              <AccordionItem value="measures">
                <AccordionTrigger>{t('visits.sections.measures')}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 p-1 sm:grid-cols-3 lg:grid-cols-6">
                    {number('weight_kg', 'visit-weight', 2, 400, '0.1')}
                    {number('height_cm', 'visit-height', 40, 250, '0.1')}
                    <div className="grid gap-2">
                      <Label>{t('visits.measures.bmi')}</Label>
                      <p className="flex h-10 items-center text-sm" data-testid="visit-bmi" dir="ltr">
                        {bodyMassIndex ?? '—'}
                      </p>
                    </div>
                    {number('pulse', 'visit-pulse', 20, 250)}
                    {number('bp_systolic', 'visit-bp-sys', 50, 300)}
                    {number('bp_diastolic', 'visit-bp-dia', 20, 200)}
                    {pick('visit-urine_albumin', t('visits.measures.urine_albumin'), form.measures.urine_albumin as string | undefined, URINE_RESULTS, (o) => t(`visits.urine.${o}`), (v) => setMeasure('urine_albumin', v ?? ''))}
                    {pick('visit-urine_sugar', t('visits.measures.urine_sugar'), form.measures.urine_sugar as string | undefined, URINE_RESULTS, (o) => t(`visits.urine.${o}`), (v) => setMeasure('urine_sugar', v ?? ''))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="senses">
                <AccordionTrigger>{t('visits.sections.senses')}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 p-1 sm:grid-cols-4">
                    {measureText('vision_far_right')}
                    {measureText('vision_far_left')}
                    {measureText('vision_near_right')}
                    {measureText('vision_near_left')}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="visit-vision_corrected"
                        checked={form.measures.vision_corrected === true}
                        onCheckedChange={(v) => setMeasure('vision_corrected', v === true)}
                      />
                      <Label htmlFor="visit-vision_corrected">{t('visits.measures.vision_corrected')}</Label>
                    </div>
                    {pick('visit-colors', t('visits.measures.colors'), form.measures.colors as string | undefined, ['normal', 'abnormal'] as const, (o) => t(`visits.normality.${o}`), (v) => setMeasure('colors', v ?? ''))}
                    {measureText('hearing_right')}
                    {measureText('hearing_left')}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {SYSTEMS.map((system) => (
                <AccordionItem key={system.key} value={`system-${system.key}`} data-system={system.key}>
                  <AccordionTrigger>
                    <span>
                      {t(`visits.systems.${system.key}.title`)}
                      {(form.questionnaire[system.key]?.symptoms?.length ?? 0) > 0 && (
                        <span className="ms-2 text-xs font-normal text-orange-600">
                          ({form.questionnaire[system.key]!.symptoms!.length})
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-6 p-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">{t('visits.questions')}</p>
                        {system.symptoms.map((symptom) => {
                          const id = `q-${system.key}-${symptom}`;
                          return (
                            <div key={symptom} className="flex items-center gap-2">
                              <Checkbox
                                id={id}
                                checked={form.questionnaire[system.key]?.symptoms?.includes(symptom) ?? false}
                                onCheckedChange={(v) => toggleSymptom(system.key, symptom, v === true)}
                              />
                              <Label htmlFor={id} className="font-normal">
                                {t(`visits.systems.${system.key}.symptoms.${symptom}`)}
                              </Label>
                            </div>
                          );
                        })}
                        <div className="grid gap-2 pt-1">
                          <Label htmlFor={`q-${system.key}-other`}>{t('visits.other')}</Label>
                          <Input
                            id={`q-${system.key}-other`}
                            maxLength={300}
                            value={form.questionnaire[system.key]?.other ?? ''}
                            onChange={(e) => setSystemOther(system.key, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">{t('visits.examination')}</p>
                        {system.exam.map((item) => {
                          const id = `x-${system.key}-${item}`;
                          return (
                            <div key={item} className="grid gap-1">
                              <Label htmlFor={id} className="font-normal">
                                {t(`visits.systems.${system.key}.exam.${item}`)}
                              </Label>
                              <Input
                                id={id}
                                maxLength={300}
                                value={form.examination[system.key]?.[item] ?? ''}
                                onChange={(e) => setExam(system.key, item, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}

              <AccordionItem value="explorations">
                <AccordionTrigger>{t('visits.sections.explorations')}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 p-1 sm:grid-cols-3">
                    {EXPLORATION_KEYS.map((key) => (
                      <div key={key} className="grid gap-2">
                        <Label htmlFor={`visit-exp-${key}`}>{t(`visits.explorations.${key}`)}</Label>
                        <Textarea
                          id={`visit-exp-${key}`}
                          rows={2}
                          maxLength={1000}
                          value={form.explorations[key] ?? ''}
                          onChange={(e) => setExploration(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="orientation">
                <AccordionTrigger>{t('visits.sections.orientation')}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 p-1 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="visit-orientation-specialty">{t('visits.orientation.specialty')}</Label>
                      <Input
                        id="visit-orientation-specialty"
                        maxLength={200}
                        value={form.orientation.specialty ?? ''}
                        onChange={(e) => setOrientation('specialty', e.target.value)}
                      />
                    </div>
                    {pick('visit-orientation-purpose', t('visits.orientation.purpose'), form.orientation.purpose, ['opinion', 'treatment'] as const, (o) => t(`visits.orientation.purposes.${o}`), (v) => setOrientation('purpose', v ?? undefined))}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="visit-orientation-hospitalisation"
                        checked={form.orientation.hospitalisation === true}
                        onCheckedChange={(v) => setOrientation('hospitalisation', v === true)}
                      />
                      <Label htmlFor="visit-orientation-hospitalisation">{t('visits.orientation.hospitalisation')}</Label>
                    </div>
                    {pick('visit-orientation-service', t('visits.orientation.service'), form.orientation.service, ['social', 'employment'] as const, (o) => t(`visits.orientation.services.${o}`), (v) => setOrientation('service', v ?? undefined))}
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="visit-orientation-answer">{t('visits.orientation.answer')}</Label>
                      <Input
                        id="visit-orientation-answer"
                        maxLength={500}
                        value={form.orientation.answer ?? ''}
                        onChange={(e) => setOrientation('answer', e.target.value)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="conclusion">
                <AccordionTrigger>{t('visits.sections.conclusion')}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 p-1 sm:grid-cols-2">
                    {pick('visit-decision', t('visits.decision'), form.decision, DECISIONS, (o) => t(`visits.decisions.${o}`), (v) => setForm((f) => ({ ...f, decision: v, unfit_until: v === 'temporarily_unfit' ? f.unfit_until : null })))}
                    {temporarilyUnfit ? (
                      <div className="grid gap-2">
                        <Label htmlFor="visit-unfit-until">{t('visits.unfitUntil')}</Label>
                        <Input id="visit-unfit-until" type="date" min={form.visit_date} value={form.unfit_until ?? ''} onChange={(e) => set('unfit_until', e.target.value || null)} />
                      </div>
                    ) : (
                      <div className="hidden sm:block" />
                    )}
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="visit-restrictions">{t('visits.restrictions')}</Label>
                      <Textarea id="visit-restrictions" rows={2} maxLength={2000} value={form.restrictions ?? ''} onChange={(e) => set('restrictions', e.target.value || null)} />
                    </div>
                    {(reservations || form.recommended_positions || form.unsuitable_positions) && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="visit-recommended">{t('visits.recommendedPositions')}</Label>
                          <Textarea id="visit-recommended" rows={2} maxLength={1000} value={form.recommended_positions ?? ''} onChange={(e) => set('recommended_positions', e.target.value || null)} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="visit-unsuitable">{t('visits.unsuitablePositions')}</Label>
                          <Textarea id="visit-unsuitable" rows={2} maxLength={1000} value={form.unsuitable_positions ?? ''} onChange={(e) => set('unsuitable_positions', e.target.value || null)} />
                        </div>
                      </>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="visit-next">{t('visits.nextVisit')}</Label>
                      <Input id="visit-next" type="date" min={form.visit_date} value={form.next_visit_date ?? ''} onChange={(e) => set('next_visit_date', e.target.value || null)} />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="visit-notes">{t('visits.notes')}</Label>
                      <Textarea id="visit-notes" rows={2} maxLength={4000} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || null)} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </fieldset>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {canWrite ? t('common.cancel') : t('visits.close')}
            </Button>
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

export default VisitDialog;
