// Register of the medical documents issued by the centre, newest first: search by serial number,
// patient number or name, and filter by type.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ServerRequiredNotice from '@/components/shared/ServerRequiredNotice';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { DOC_TYPES, DocType, fetchDocumentRegister } from '@/lib/consultations';
import DocumentList from './DocumentList';

export const DocumentsPage = () => {
  const { t } = useTranslation();
  const { isDemo } = useAuth();
  const [type, setType] = useState<DocType | 'all'>('all');
  const [search, setSearch] = useState('');
  const list = useQuery({
    queryKey: ['document-register', type, search.trim()],
    queryFn: () => fetchDocumentRegister(type, search),
    enabled: !isDemo,
  });

  return (
    <AppLayout title={t('documents.registerTitle')}>
      {isDemo ? (
        <ServerRequiredNotice />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid gap-2">
                <Label htmlFor="register-type">{t('documents.type')}</Label>
                <Select value={type} onValueChange={(v) => setType(v as DocType | 'all')}>
                  <SelectTrigger id="register-type" className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('documents.allTypes')}</SelectItem>
                    {DOC_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {t(`documents.types.${d}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="ps-9" placeholder={t('documents.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            {list.isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : list.isError ? (
              <p className="py-6 text-center text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
            ) : (list.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('documents.empty')}</p>
            ) : (
              <DocumentList documents={list.data!} showPerson />
            )}
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
};

export default DocumentsPage;
