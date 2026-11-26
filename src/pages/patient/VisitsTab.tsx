// The visits tab: occupational health visits of the beneficiary, newest first, and the form to
// record a new one or open an earlier one.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileCheck2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useDateFormat } from '@/hooks/useDateFormat';
import { Decision, Visit, fetchVisits } from '@/lib/visits';
import VisitDialog from './VisitDialog';

const DECISION_STYLE: Record<Decision, string> = {
  fit: 'border-green-600 text-green-700',
  fit_with_reservations: 'border-amber-500 text-amber-700',
  temporarily_unfit: 'border-orange-600 text-orange-700',
  permanently_unfit: 'border-red-600 text-red-700',
};

export const DecisionBadge = ({ decision }: { decision: Decision | null }) => {
  const { t } = useTranslation();
  if (!decision) return <Badge variant="secondary">{t('visits.pending')}</Badge>;
  return (
    <Badge variant="outline" className={DECISION_STYLE[decision]}>
      {t(`visits.decisions.${decision}`)}
    </Badge>
  );
};

export const VisitsTab = ({ beneficiaryId }: { beneficiaryId: string }) => {
  const { t } = useTranslation();
  const { can } = useAuth();
  const formatDate = useDateFormat();
  const canWrite = can('visits.write');
  const visits = useQuery({ queryKey: ['visits', beneficiaryId], queryFn: () => fetchVisits(beneficiaryId) });
  const [open, setOpen] = useState<Visit | 'new' | null>(null);

  return (
    <Card data-section="visits">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{t('visits.listTitle')}</CardTitle>
        {canWrite && (
          <Button size="sm" onClick={() => setOpen('new')}>
            <Plus className="me-2 h-4 w-4" />
            {t('visits.new')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {visits.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : visits.isError ? (
          <p className="text-sm text-destructive">
            {visits.error instanceof Error ? visits.error.message : t('common.requestFailed')}
          </p>
        ) : (visits.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('visits.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('visits.date')}</TableHead>
                  <TableHead>{t('visits.type')}</TableHead>
                  <TableHead>{t('visits.doctor')}</TableHead>
                  <TableHead>{t('visits.decision')}</TableHead>
                  <TableHead>{t('visits.nextVisit')}</TableHead>
                  <TableHead>
                    <span className="sr-only">{t('common.actions')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.data!.map((visit) => (
                  <TableRow key={visit.id} className="cursor-pointer" onClick={() => setOpen(visit)}>
                    <TableCell>{formatDate(visit.visit_date)}</TableCell>
                    <TableCell>{t(`visits.types.${visit.visit_type}`)}</TableCell>
                    <TableCell>{visit.doctor_name || '—'}</TableCell>
                    <TableCell>
                      <DecisionBadge decision={visit.decision} />
                    </TableCell>
                    <TableCell>{formatDate(visit.next_visit_date)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {visit.decision && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/visits/${visit.id}/certificate`}>
                            <FileCheck2 className="me-2 h-4 w-4" />
                            {t('visits.certificate.open')}
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {open && (
        <VisitDialog
          beneficiaryId={beneficiaryId}
          visit={open === 'new' ? undefined : open}
          canWrite={canWrite}
          onClose={() => setOpen(null)}
        />
      )}
    </Card>
  );
};

export default VisitsTab;
