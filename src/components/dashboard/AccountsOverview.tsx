import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCog } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StaffAccount } from '@/lib/accounts';

/** Dashboard card with real staff accounts, counted by role. */
export const AccountsOverview = ({ accounts }: { accounts: UseQueryResult<StaffAccount[]> }) => {
  const { t } = useTranslation();
  const byRole = new Map<string, { label: string; active: number; inactive: number }>();
  for (const account of accounts.data ?? []) {
    const key = account.role?.code ?? '';
    const label = account.role
      ? t(`roles.${account.role.code}`, { defaultValue: account.role.name_en })
      : t('overview.noRole');
    const entry = byRole.get(key) ?? { label, active: 0, inactive: 0 };
    if (account.active) entry.active += 1;
    else entry.inactive += 1;
    byRole.set(key, entry);
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1.5">
          <CardTitle>{t('overview.title')}</CardTitle>
          <CardDescription>{t('overview.subtitle')}</CardDescription>
        </div>
        <Button asChild>
          <Link to="/admin/accounts">
            <UserCog className="me-2 h-4 w-4" />
            {t('overview.manage')}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : accounts.isError ? (
          <p className="py-6 text-center text-sm text-destructive">{t('overview.loadFailed')}</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {[...byRole.entries()].map(([key, row]) => (
              <li key={key} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{row.label}</span>
                <span className="text-muted-foreground">
                  {row.inactive > 0
                    ? t('overview.countsWithInactive', { active: row.active, inactive: row.inactive })
                    : t('overview.counts', { active: row.active })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsOverview;
