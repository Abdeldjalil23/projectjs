// Table of issued documents, used in the patient file and in the register: serial number, type,
// date, author, state, with links to print and, for those who issue documents, to cancel one.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Ban, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { MedicalDocument, cancelDocument } from '@/lib/consultations';

const CancelDialog = ({ doc, onClose }: { doc: MedicalDocument; onClose: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const cancel = useMutation({
    mutationFn: () => cancelDocument(doc.id, reason.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-register'] });
      toast.success(t('documents.cancelled', { serial: doc.serial }));
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
            if (reason.trim().length < 3) return void toast.error(t('documents.errors.cancelReason'));
            cancel.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('documents.cancelTitle', { serial: doc.serial })}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <p className="text-sm text-muted-foreground">{t('documents.cancelHint')}</p>
            <Label htmlFor="cancel-reason">{t('documents.cancelReason')}</Label>
            <Textarea id="cancel-reason" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={cancel.isPending}>
              {t('documents.cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const DocumentList = ({ documents, showPerson = false }: { documents: MedicalDocument[]; showPerson?: boolean }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const formatDate = useDateFormat();
  const [cancelling, setCancelling] = useState<MedicalDocument | null>(null);
  const canIssue = can('documents.issue');

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('documents.serial')}</TableHead>
            <TableHead>{t('documents.type')}</TableHead>
            {showPerson && <TableHead>{t('visits.due.person')}</TableHead>}
            <TableHead>{t('documents.issuedOn')}</TableHead>
            <TableHead>{t('consultations.author')}</TableHead>
            <TableHead>{t('documents.state')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('common.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((d) => (
            <TableRow key={d.id} data-document={d.serial}>
              <TableCell className="font-mono text-sm" dir="ltr">
                {d.serial}
              </TableCell>
              <TableCell>{t(`documents.types.${d.doc_type}`)}</TableCell>
              {showPerson && (
                <TableCell>
                  {d.beneficiary ? (
                    <Link to={`/beneficiaries/${d.beneficiary.id}?tab=documents`} className="hover:underline">
                      {d.beneficiary.last_name} {d.beneficiary.first_name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
              )}
              <TableCell>{formatDate(d.issued_on)}</TableCell>
              <TableCell>{d.author_name || '—'}</TableCell>
              <TableCell>
                {d.cancelled_at ? (
                  <Badge variant="outline" className="border-red-600 text-red-700" title={d.cancel_reason ?? ''}>
                    {t('documents.stateCancelled')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-600 text-green-700">
                    {t('documents.stateValid')}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/documents/${d.id}/print`}>
                      <Printer className="me-2 h-4 w-4" />
                      {t('documents.open')}
                    </Link>
                  </Button>
                  {canIssue && !d.cancelled_at && (
                    <Button variant="ghost" size="icon" aria-label={t('documents.cancel')} onClick={() => setCancelling(d)}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {cancelling && <CancelDialog doc={cancelling} onClose={() => setCancelling(null)} />}
    </div>
  );
};

export default DocumentList;
