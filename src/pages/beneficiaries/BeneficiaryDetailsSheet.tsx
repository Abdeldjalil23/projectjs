// Side panel with a beneficiary's details and, for a worker, their dependents.
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchBeneficiary } from '@/lib/beneficiaries';
import BeneficiaryInfo, { BeneficiaryInfoProps } from './BeneficiaryInfo';

interface DetailsSheetProps extends Omit<BeneficiaryInfoProps, 'beneficiary'> {
  id: string;
  onClose: () => void;
}

export const BeneficiaryDetailsSheet = ({ id, onClose, ...actions }: DetailsSheetProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const details = useQuery({ queryKey: ['beneficiary', id], queryFn: () => fetchBeneficiary(id) });
  const b = details.data;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side={i18n.dir() === 'rtl' ? 'left' : 'right'} className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{b ? `${b.last_name} ${b.first_name}` : t('beneficiaries.details.title')}</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap items-center gap-2">
              {b &&
                (b.active ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t('common.active')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('common.inactive')}</Badge>
                ))}
              {b && (
                <Button size="sm" variant="secondary" onClick={() => navigate(`/beneficiaries/${b.id}`)}>
                  <FolderOpen className="me-2 h-4 w-4" />
                  {t('patient.openFile')}
                </Button>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        {details.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : details.isError || !b ? (
          <p className="py-8 text-center text-sm text-destructive">
            {details.error instanceof Error ? details.error.message : t('common.requestFailed')}
          </p>
        ) : (
          <div className="mt-6">
            <BeneficiaryInfo beneficiary={b} {...actions} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BeneficiaryDetailsSheet;
