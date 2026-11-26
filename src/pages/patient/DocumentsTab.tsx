// The documents tab: medical documents issued to the beneficiary, and a new one for those who
// may issue documents.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FilePlus2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { fetchDocuments } from '@/lib/consultations';
import type { BeneficiaryDetails } from '@/lib/beneficiaries';
import DocumentDialog from '@/pages/documents/DocumentDialog';
import DocumentList from '@/pages/documents/DocumentList';

export const DocumentsTab = ({ beneficiary }: { beneficiary: BeneficiaryDetails }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const list = useQuery({ queryKey: ['documents', beneficiary.id], queryFn: () => fetchDocuments(beneficiary.id) });
  const [issuing, setIssuing] = useState(false);

  return (
    <Card data-section="documents">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{t('documents.listTitle')}</CardTitle>
        {can('documents.issue') && (
          <Button size="sm" onClick={() => setIssuing(true)}>
            <FilePlus2 className="me-2 h-4 w-4" />
            {t('documents.issueTitle')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('documents.empty')}</p>
        ) : (
          <DocumentList documents={list.data!} />
        )}
      </CardContent>
      {issuing && (
        <DocumentDialog
          beneficiaryId={beneficiary.id}
          workplace={[beneficiary.company, beneficiary.unit].filter(Boolean).join(' — ')}
          onClose={() => setIssuing(false)}
        />
      )}
    </Card>
  );
};

export default DocumentsTab;
