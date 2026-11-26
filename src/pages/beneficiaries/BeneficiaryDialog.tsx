// Adding or editing a beneficiary.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HolderPicker from './HolderPicker';
import {
  BeneficiaryDetails,
  BeneficiaryInput,
  CATEGORIES,
  Category,
  PersonRef,
  RELATIONSHIPS,
  SEXES,
  createBeneficiary,
  isDependent,
  updateBeneficiary,
} from '@/lib/beneficiaries';

const NONE = 'none';

interface BeneficiaryDialogProps {
  onClose: () => void;
  /** Beneficiary to edit; leave out to add a new one. */
  beneficiary?: BeneficiaryDetails;
  /** For "add a dependent": category and worker filled in advance. */
  preset?: { category: Category; holder: PersonRef; company?: string | null };
  onSaved?: (id: string) => void;
}

export const BeneficiaryDialog = ({ onClose, beneficiary, preset, onSaved }: BeneficiaryDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const editing = Boolean(beneficiary);

  const [externalId, setExternalId] = useState(beneficiary?.external_id ?? '');
  const [lastName, setLastName] = useState(beneficiary?.last_name ?? preset?.holder.last_name ?? '');
  const [firstName, setFirstName] = useState(beneficiary?.first_name ?? '');
  const [birthDate, setBirthDate] = useState(beneficiary?.birth_date ?? '');
  const [sex, setSex] = useState<string>(beneficiary?.sex ?? NONE);
  const [category, setCategory] = useState<Category>(beneficiary?.category ?? preset?.category ?? 'agent');
  const [holder, setHolder] = useState<PersonRef | null>(beneficiary?.holder ?? preset?.holder ?? null);
  const [relationship, setRelationship] = useState<string>(beneficiary?.relationship ?? NONE);
  const [company, setCompany] = useState(beneficiary?.company ?? preset?.company ?? '');
  const [unit, setUnit] = useState(beneficiary?.unit ?? '');
  const [phone, setPhone] = useState(beneficiary?.phone ?? '');
  const [notes, setNotes] = useState(beneficiary?.notes ?? '');

  const dependent = isDependent(category);
  const name = `${lastName.trim()} ${firstName.trim()}`;

  const save = useMutation({
    mutationFn: async () => {
      const input: BeneficiaryInput = {
        external_id: externalId,
        last_name: lastName,
        first_name: firstName,
        birth_date: birthDate || null,
        sex: sex === NONE ? null : (sex as 'M' | 'F'),
        category,
        holder_id: dependent ? holder?.id ?? null : null,
        relationship: dependent && relationship !== NONE ? (relationship as BeneficiaryInput['relationship']) : null,
        company,
        unit,
        phone,
        notes,
        active: beneficiary?.active ?? true,
      };
      if (beneficiary) {
        await updateBeneficiary(beneficiary.id, input);
        return beneficiary.id;
      }
      return (await createBeneficiary(input)).id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiary'] });
      queryClient.invalidateQueries({ queryKey: ['dependents'] });
      toast.success(t(editing ? 'beneficiaries.toasts.updated' : 'beneficiaries.toasts.created', { name }));
      onSaved?.(id);
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) return void toast.error(t('beneficiaries.errors.lastName'));
    if (!firstName.trim()) return void toast.error(t('beneficiaries.errors.firstName'));
    save.mutate();
  };

  // A dependent's worker must be of the matching category: changing the category clears the choice.
  const changeCategory = (value: string) => {
    if (value !== category) setHolder(null);
    setCategory(value as Category);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {beneficiary
                ? t('beneficiaries.form.editTitle', { name: `${beneficiary.last_name} ${beneficiary.first_name}` })
                : t('beneficiaries.form.newTitle')}
            </DialogTitle>
            <DialogDescription>{t('beneficiaries.form.hint')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="b-category">{t('beneficiaries.form.category')}</Label>
              <Select value={category} onValueChange={changeCategory}>
                <SelectTrigger id="b-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`beneficiaries.categories.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dependent && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="b-holder">{t('beneficiaries.form.holder')}</Label>
                  <HolderPicker id="b-holder" category={category} value={holder} onChange={setHolder} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-relationship">{t('beneficiaries.form.relationship')}</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger id="b-relationship">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t('beneficiaries.form.notSet')}</SelectItem>
                      {RELATIONSHIPS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {t(`beneficiaries.relationships.${r}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="b-last-name">{t('beneficiaries.form.lastName')}</Label>
              <Input id="b-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-first-name">{t('beneficiaries.form.firstName')}</Label>
              <Input id="b-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="b-number">{t('beneficiaries.form.number')}</Label>
              <Input id="b-number" value={externalId} onChange={(e) => setExternalId(e.target.value)} maxLength={64} />
              <p className="text-xs text-muted-foreground">{t('beneficiaries.form.numberHint')}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-birth">{t('beneficiaries.form.birthDate')}</Label>
              <Input id="b-birth" type="date" min="1900-01-01" max={today} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="b-sex">{t('beneficiaries.form.sex')}</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger id="b-sex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t('beneficiaries.form.notSet')}</SelectItem>
                  {SEXES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`beneficiaries.sexes.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-phone">{t('beneficiaries.form.phone')}</Label>
              <Input id="b-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="b-company">{t('beneficiaries.form.company')}</Label>
              <Input id="b-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={150} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-unit">{t('beneficiaries.form.unit')}</Label>
              <Input id="b-unit" value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={150} />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="b-notes">{t('beneficiaries.form.notes')}</Label>
              <Textarea id="b-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : editing ? t('common.save') : t('beneficiaries.form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiaryDialog;
