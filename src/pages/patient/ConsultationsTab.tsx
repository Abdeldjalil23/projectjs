// The consultations tab: consultations of every service the user may read (general medicine,
// nursing, dental care, psychology), newest first, and a new consultation for the services the
// user may write.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { Consultation, SERVICES, SERVICE_PERMISSION, Service, fetchConsultations } from '@/lib/consultations';
import ConsultationDialog from './ConsultationDialog';
import DocumentDialog from '@/pages/documents/DocumentDialog';
import type { BeneficiaryDetails } from '@/lib/beneficiaries';

export const ConsultationsTab = ({ beneficiary }: { beneficiary: BeneficiaryDetails }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const formatDate = useDateFormat();
  const writable = SERVICES.filter((s) => can(`${SERVICE_PERMISSION[s]}.write`));
  const list = useQuery({ queryKey: ['consultations', beneficiary.id], queryFn: () => fetchConsultations(beneficiary.id) });
  const [open, setOpen] = useState<{ consultation?: Consultation; service: Service } | null>(null);
  const [issuing, setIssuing] = useState<Consultation | null>(null);

  return (
    <Card data-section="consultations">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{t('consultations.listTitle')}</CardTitle>
        {writable.length === 1 && (
          <Button size="sm" onClick={() => setOpen({ service: writable[0] })}>
            <Plus className="me-2 h-4 w-4" />
            {t('consultations.new')}
          </Button>
        )}
        {writable.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="me-2 h-4 w-4" />
                {t('consultations.new')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {writable.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => setOpen({ service: s })}>
                  {t(`consultations.services.${s}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('consultations.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('consultations.fields.date')}</TableHead>
                  <TableHead>{t('consultations.service')}</TableHead>
                  <TableHead>{t('consultations.fields.nature')}</TableHead>
                  <TableHead>{t('consultations.fields.reason')}</TableHead>
                  <TableHead>{t('consultations.fields.diagnosis')}</TableHead>
                  <TableHead>{t('consultations.author')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data!.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setOpen({ consultation: c, service: c.service })}>
                    <TableCell>{formatDate(c.consultation_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`consultations.services.${c.service}`)}</Badge>
                    </TableCell>
                    <TableCell>{c.nature ? t(`consultations.natures.${c.nature}`) : '—'}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={c.reason ?? ''}>
                      {c.reason || '—'}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate" title={c.diagnosis ?? ''}>
                      {c.diagnosis || '—'}
                    </TableCell>
                    <TableCell>{c.author_name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {open && (
        <ConsultationDialog
          beneficiaryId={beneficiary.id}
          consultation={open.consultation}
          service={open.service}
          canWrite={can(`${SERVICE_PERMISSION[open.service]}.write`)}
          onClose={() => setOpen(null)}
          onIssueDocument={(c) => {
            setOpen(null);
            setIssuing(c);
          }}
        />
      )}
      {issuing && (
        <DocumentDialog
          beneficiaryId={beneficiary.id}
          workplace={[beneficiary.company, beneficiary.unit].filter(Boolean).join(' — ')}
          consultation={issuing}
          onClose={() => setIssuing(null)}
        />
      )}
    </Card>
  );
};

export default ConsultationsTab;
