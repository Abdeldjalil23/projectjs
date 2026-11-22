import { ServerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** Shown on pages that only work with the real server, while the app runs in demo mode. */
export const ServerRequiredNotice = () => (
  <Card>
    <CardContent className="flex items-start gap-3 p-6">
      <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">This page needs the server</p>
        <p className="text-sm text-muted-foreground">
          The app is running in demo mode. Add the Supabase keys (see docs/SETUP-SUPABASE.md) to manage real
          accounts and permissions.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default ServerRequiredNotice;
