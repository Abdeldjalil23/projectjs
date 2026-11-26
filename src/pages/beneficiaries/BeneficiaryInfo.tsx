// A beneficiary's details, actions and dependents. Used in the side panel and on the patient file.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil, UserCheck, UserPlus, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import {
  BeneficiaryDetails,
  Category,
  HOLDER_CATEGORY,
  PersonRef,
  ageOn,
  fetchDependents,
  isDependent,
  personLabel,
  setBeneficiaryActive,
} from '@/lib/beneficiaries';
import BeneficiaryNumber from './BeneficiaryNumber';

export interface BeneficiaryInfoProps {
  beneficiary: BeneficiaryDetails;
  onOpen: (id: string) => void;
  onEdit: (beneficiary: BeneficiaryDetails) => void;
  onAddDependent: (preset: { category: Category; holder: PersonRef; company?: string | null }) => void;
}

const DEPENDENT_OF: Partial<Record<Category, Category>> = Object.fromEntries(
  Object.entries(HOLDER_CATEGORY).map(([dependent, holder]) => [holder, dependent]),
);

export const BeneficiaryInfo = ({ beneficiary: b, onOpen, onEdit, onAddDependent }: BeneficiaryInfoProps) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const formatDate = useDateFormat();
  const canWrite = can('beneficiaries.write');

  const dependents = useQuery({
    queryKey: ['dependents', b.id],
    queryFn: () => fetchDependents(b.id),
    enabled: Boolean(DEPENDENT_OF[b.category]),
  });

  const toggle = useMutation({
    mutationFn: () => setBeneficiaryActive(b.id, !b.active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiary', b.id] });
      toast.success(
        t(b.active ? 'beneficiaries.toasts.deactivated' : 'beneficiaries.toasts.activated', {
          name: `${b.last_name} ${b.first_name}`,
        }),
      );
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });

  const rows: [string, React.ReactNode][] = [
    [t('beneficiaries.columns.number'), <BeneficiaryNumber key="n" beneficiary={b} full />],
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
    [t('beneficiaries.form.phone'), <span key="p" dir="ltr">{b.phone ?? '—'}</span>],
    [t('beneficiaries.form.notes'), b.notes ?? '—'],
    [
      t('beneficiaries.details.source'),
      b.source === 'manual' ? t('beneficiaries.details.manual') : t('beneficiaries.details.imported', { source: b.source }),
    ],
    [t('beneficiaries.details.updatedAt'), formatDate(b.updated_at)],
  ];

  return (
    <div className="space-y-6">
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
          <Button size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate()}>
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
  );
};

export default BeneficiaryInfo;
