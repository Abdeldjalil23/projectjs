// The number (Matricule) of a beneficiary. Dependents imported without their own number got one
// made from their worker's number ("100101/amina/1982-07-05"): only the worker's number is shown,
// with a mark, and the full number stays visible on hover or in the details.
import { useTranslation } from 'react-i18next';
import type { PersonRef } from '@/lib/beneficiaries';

export const BeneficiaryNumber = ({ beneficiary, full = false }: { beneficiary: Pick<PersonRef, 'external_id'>; full?: boolean }) => {
  const { t } = useTranslation();
  const number = beneficiary.external_id;
  if (!number) return <span>—</span>;
  const generated = number.includes('/');
  if (!generated || full) {
    return (
      <span dir="ltr" className={full && generated ? 'break-all' : undefined}>
        {number}
      </span>
    );
  }
  return (
    <span title={number}>
      <span dir="ltr">{number.split('/')[0]}</span>
      <span className="ms-1 text-[10px] text-muted-foreground">{t('beneficiaries.dependentMark')}</span>
    </span>
  );
};

export default BeneficiaryNumber;
