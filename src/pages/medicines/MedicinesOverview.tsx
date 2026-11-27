// Medicine stock at a glance, for the administration dashboard: what is low, expiring or expired,
// with a link to the stock page.
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { fetchMedicines, medicineLabel, stockState } from '@/lib/medicines';
import { today } from '@/lib/visits';

export const MedicinesOverview = () => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const number = useNumberFormat();
  const list = useQuery({ queryKey: ['medicines'], queryFn: fetchMedicines });
  const now = today();
  const watch = (list.data ?? [])
    .filter((m) => m.active)
    .map((m) => ({ m, state: stockState(m, now) }))
    .filter(({ state }) => state.low || state.expiring || state.expired)
    .slice(0, 8);

  return (
    <Card data-testid="medicines-overview">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <Pill className="h-4 w-4 text-primary" />
          {t('medicines.overviewTitle')}
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/medicines">{t('medicines.openStock')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : list.isError ? (
          <p className="text-sm text-destructive">{list.error instanceof Error ? list.error.message : t('common.requestFailed')}</p>
        ) : watch.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('medicines.allGood')}</p>
        ) : (
          <ul className="divide-y">
            {watch.map(({ m, state }) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-medium">{medicineLabel(m)}</span>
                <span className="flex flex-wrap justify-end gap-x-3 text-end">
                  {state.low && (
                    <span className="text-orange-700">
                      {t('medicines.overviewLow', { quantity: number(m.quantity ?? 0), threshold: number(m.threshold) })}
                    </span>
                  )}
                  {(state.expiring || state.expired) && (
                    <span className={state.expired ? 'text-red-700' : 'text-amber-700'}>
                      {t(state.expired ? 'medicines.overviewExpired' : 'medicines.overviewExpiring', { date: formatDate(m.expiry_date) })}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicinesOverview;
