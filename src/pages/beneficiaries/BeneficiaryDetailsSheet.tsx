// Side panel with a beneficiary's details and, for a worker, their dependents.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil, UserCheck, UserPlus, UserX } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  BeneficiaryDetails,
  Category,
  HOLDER_CATEGORY,
  PersonRef,
  ageOn,
  fetchBeneficiary,
  fetchDependents,
  isDependent,
  personLabel,
  setBeneficiaryActive,
} from '@/lib/beneficiaries';

interface DetailsSheetProps {
  id: string;
  onClose: () => void;
  onOpen: (id: string) => void;
  onEdit: (beneficiary: BeneficiaryDetails) => void;
  onAddDependent: (preset: { category: Category; holder: PersonRef; company?: string | null }) => void;
}

const DEPENDENT_OF: Partial<Record<Category, Category>> = Object.fromEntries(
  Object.entries(HOLDER_CATEGORY).map(([dependent, holder]) => [holder, dependent]),
);

export const BeneficiaryDetailsSheet = ({ id, onClose, onOpen, onEdit, onAddDependent }: DetailsSheetProps) => {
  const { t, i18n } = useTranslation();
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const canWrite = can('beneficiaries.write');

  const details = useQuery({ queryKey: ['beneficiary', id], queryFn: () => fetchBeneficiary(id) });
  const b = details.data;
  const dependents = useQuery({
    queryKey: ['dependents', id],
    queryFn: () => fetchDependents(id),
    enabled: Boolean(b && !isDependent(b.category) && DEPENDENT_OF[b.category]),
  });

  const toggle = useMutation({
    mutationFn: (beneficiary: BeneficiaryDetails) => setBeneficiaryActive(beneficiary.id, !beneficiary.active),
    onSuccess: (_, beneficiary) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiary', beneficiary.id] });
      toast.success(
        t(beneficiary.active ? 'beneficiaries.toasts.deactivated' : 'beneficiaries.toasts.activated', {
          name: `${beneficiary.last_name} ${beneficiary.first_name}`,
        }),
      );
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const dateFormat = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const formatDate = (value: string | null) => (value ? dateFormat.format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '—');

  const rows: [string, React.ReactNode][] = b
    ? [
        [t('beneficiaries.columns.number'), <span dir="ltr">{b.external_id ?? '—'}</span>],
        [t('beneficiaries.columns.category'), t(`beneficiaries.categories.${b.category}`)],
        [
          t('beneficiaries.form.birthDate'),
          b.birth_date ? `${formatDate(b.birth_date)} (${t('beneficiaries.years', { age: ageOn(b.birth_date) })})` : '—',
        ],
        [t('beneficiaries.form.sex'), b.sex ? t(`beneficiaries.sexes.${b.sex}`) : '—'],
        ...(isDependent(b.category)
          ? ([
              [
                t('beneficiaries.details.dependsOn'),
                b.holder ? (
                  <button type="button" className="text-start text-medsuite-primary hover:underline" onClick={() => onOpen(b.holder!.id)}>
                    {personLabel(b.holder)}
                  </button>
                ) : (
                  '—'
                ),
              ],
              [t('beneficiaries.form.relationship'), b.relationship ? t(`beneficiaries.relationships.${b.relationship}`) : '—'],
            ] as [string, React.ReactNode][])
          : []),
        [t('beneficiaries.form.company'), b.company ?? '—'],
        [t('beneficiaries.form.unit'), b.unit ?? '—'],
        [t('beneficiaries.form.phone'), <span dir="ltr">{b.phone ?? '—'}</span>],
        [t('beneficiaries.form.notes'), b.notes ?? '—'],
        [
          t('beneficiaries.details.source'),
          b.source === 'manual' ? t('beneficiaries.details.manual') : t('beneficiaries.details.imported', { source: b.source }),
        ],
        [t('beneficiaries.details.updatedAt'), formatDate(b.updated_at)],
      ]
    : [];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side={i18n.dir() === 'rtl' ? 'left' : 'right'} className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{b ? `${b.last_name} ${b.first_name}` : t('beneficiaries.details.title')}</SheetTitle>
          <SheetDescription>
            {b && (b.active ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t('common.active')}</Badge>
            ) : (
              <Badge variant="secondary">{t('common.inactive')}</Badge>
            ))}
          </SheetDescription>
        </SheetHeader>

        {details.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : details.isError || !b ? (
          <p className="py-8 text-center text-sm text-destructive">
            {details.error instanceof Error ? details.error.message : t('common.requestFailed')}
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 gap-y-3 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>

            {canWrite && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onEdit(b)}>
                  <Pencil className="me-2 h-4 w-4" />
                  {t('beneficiaries.details.edit')}
                </Button>
                <Button size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate(b)}>
                  {b.active ? <UserX className="me-2 h-4 w-4" /> : <UserCheck className="me-2 h-4 w-4" />}
                  {b.active ? t('beneficiaries.details.deactivate') : t('beneficiaries.details.activate')}
                </Button>
              </div>
            )}

            {DEPENDENT_OF[b.category] && (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{t('beneficiaries.details.dependents')}</h3>
                  {canWrite && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddDependent({ category: DEPENDENT_OF[b.category]!, holder: b, company: b.company })}
                    >
                      <UserPlus className="me-2 h-4 w-4" />
                      {t('beneficiaries.details.addDependent')}
                    </Button>
                  )}
                </div>
                {dependents.isLoading ? (
                  <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                ) : (dependents.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('beneficiaries.details.noDependents')}</p>
                ) : (
                  <ul className="divide-y rounded-md border">
                    {(dependents.data ?? []).map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-muted/50"
                          onClick={() => onOpen(d.id)}
                        >
                          <span>
                            {d.last_name} {d.first_name}
                            {!d.active && <span className="ms-2 text-xs text-muted-foreground">({t('common.inactive')})</span>}
                          </span>
                          <span className="text-muted-foreground">
                            {[
                              d.relationship ? t(`beneficiaries.relationships.${d.relationship}`) : null,
                              d.birth_date ? t('beneficiaries.years', { age: ageOn(d.birth_date) }) : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BeneficiaryDetailsSheet;
