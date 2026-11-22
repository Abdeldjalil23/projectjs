import { ServerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

/** Shown on pages that only work with the real server, while the app runs in demo mode. */
export const ServerRequiredNotice = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-6">
        <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium">{t('serverRequired.title')}</p>
          <p className="text-sm text-muted-foreground">{t('serverRequired.body')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerRequiredNotice;
