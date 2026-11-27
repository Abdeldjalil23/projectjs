// Place of a part of the platform that is built in a later phase of the plan. It says what is
// coming instead of showing sample data that could be taken for real records.
import { useTranslation } from 'react-i18next';
import { Hourglass } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';

export type PlannedFeature = 'careRequests' | 'reports';

const PHASE: Record<PlannedFeature, number> = { careRequests: 3, reports: 4 };

const PlannedPage = ({ feature }: { feature: PlannedFeature }) => {
  const { t } = useTranslation();
  return (
    <AppLayout title={t(`nav.${feature}`)}>
      <Card className="max-w-2xl">
        <CardContent className="flex items-start gap-3 p-6">
          <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">{t('planned.title', { phase: PHASE[feature] })}</p>
            <p className="text-sm text-muted-foreground">{t(`planned.${feature}`)}</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default PlannedPage;
