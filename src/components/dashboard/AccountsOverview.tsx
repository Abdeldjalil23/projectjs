import { Link } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StaffAccount } from '@/lib/accounts';

/** Dashboard card with real staff accounts, counted by role. */
export const AccountsOverview = ({ accounts }: { accounts: UseQueryResult<StaffAccount[]> }) => {
  const list = accounts.data ?? [];
  const byRole = new Map<string, { label: string; active: number; inactive: number }>();
  for (const account of list) {
    const label = account.role?.name_en ?? 'No role yet';
    const entry = byRole.get(label) ?? { label, active: 0, inactive: 0 };
    if (account.active) entry.active += 1;
    else entry.inactive += 1;
    byRole.set(label, entry);
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1.5">
          <CardTitle>Staff accounts</CardTitle>
          <CardDescription>Who can sign in, by role</CardDescription>
        </div>
        <Button asChild>
          <Link to="/admin/accounts">
            <UserCog className="mr-2 h-4 w-4" />
            Manage accounts
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : accounts.isError ? (
          <p className="py-6 text-center text-sm text-destructive">Could not load the accounts.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {[...byRole.values()].map((row) => (
              <li key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{row.label}</span>
                <span className="text-muted-foreground">
                  {row.active} active{row.inactive > 0 ? ` · ${row.inactive} inactive` : ''}
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
