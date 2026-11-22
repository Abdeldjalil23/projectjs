// Roles and permissions: which role may do what. Changes are saved one tick at a time.
import { Fragment, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ServerRequiredNotice from '@/components/shared/ServerRequiredNotice';
import { useAuth } from '@/context/AuthContext';
import {
  Permission,
  RolePermission,
  StaffRole,
  fetchPermissions,
  fetchRolePermissions,
  fetchRoles,
  setRolePermission,
} from '@/lib/accounts';

const MODULES: { code: string; label: string }[] = [
  { code: 'administration', label: 'Administration' },
  { code: 'beneficiaries', label: 'Beneficiaries' },
  { code: 'clinical', label: 'Clinical data (medical secrecy)' },
  { code: 'care_requests', label: 'Care coverage requests' },
  { code: 'appointments', label: 'Appointments' },
  { code: 'pharmacy', label: 'Pharmacy' },
  { code: 'social', label: 'Social support' },
  { code: 'reports', label: 'Reports' },
];

/** The administration role always keeps these, so nobody is locked out (also enforced by the database). */
const LOCKED = new Set(['users.manage', 'roles.manage']);
/** Roles outside the care team: giving them a medical permission asks for confirmation. */
const NON_CLINICAL = new Set(['admin', 'social_worker', 'contracted_doctor']);

const key = (roleId: string, permissionId: string) => `${roleId}:${permissionId}`;

interface Change {
  role: StaffRole;
  permission: Permission;
  granted: boolean;
}

export const RolesPermissionsPage = () => {
  const { isDemo } = useAuth();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<Change | null>(null);

  const roles = useQuery({ queryKey: ['roles'], queryFn: fetchRoles, enabled: !isDemo });
  const permissions = useQuery({ queryKey: ['permissions'], queryFn: fetchPermissions, enabled: !isDemo });
  const matrix = useQuery({ queryKey: ['role_permissions'], queryFn: fetchRolePermissions, enabled: !isDemo });

  const granted = useMemo(
    () => new Set((matrix.data ?? []).map((rp) => key(rp.role_id, rp.permission_id))),
    [matrix.data],
  );

  const groups = useMemo(() => {
    const list = permissions.data ?? [];
    const known = MODULES.map((m) => ({ ...m, items: list.filter((p) => p.module === m.code) }));
    const others = list.filter((p) => !MODULES.some((m) => m.code === p.module));
    return [...known, { code: 'other', label: 'Other', items: others }].filter((g) => g.items.length > 0);
  }, [permissions.data]);

  const change = useMutation({
    mutationFn: ({ role, permission, granted: on }: Change) => setRolePermission(role.id, permission.id, on),
    // Show the tick at once; undo it if the server refuses.
    onMutate: async ({ role, permission, granted: on }) => {
      await queryClient.cancelQueries({ queryKey: ['role_permissions'] });
      const previous = queryClient.getQueryData<RolePermission[]>(['role_permissions']) ?? [];
      queryClient.setQueryData<RolePermission[]>(
        ['role_permissions'],
        on
          ? [...previous, { role_id: role.id, permission_id: permission.id }]
          : previous.filter((rp) => !(rp.role_id === role.id && rp.permission_id === permission.id)),
      );
      return { previous };
    },
    onError: (e, _change, context) => {
      if (context) queryClient.setQueryData(['role_permissions'], context.previous);
      toast.error(e instanceof Error ? e.message : 'The change was not saved.');
    },
    onSuccess: (_, { role, permission, granted: on }) => {
      toast.success(`${role.name_en}: ${permission.code} ${on ? 'granted' : 'removed'}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['role_permissions'] }),
  });

  const request = (role: StaffRole, permission: Permission, on: boolean) => {
    if (on && permission.is_medical && NON_CLINICAL.has(role.code)) {
      setConfirming({ role, permission, granted: on });
      return;
    }
    change.mutate({ role, permission, granted: on });
  };

  if (isDemo) {
    return (
      <AppLayout title="Roles & permissions">
        <ServerRequiredNotice />
      </AppLayout>
    );
  }

  const loading = roles.isLoading || permissions.isLoading || matrix.isLoading;
  const failed = roles.error || permissions.error || matrix.error;

  return (
    <AppLayout title="Roles & permissions">
      <Card>
        <CardHeader>
          <CardTitle>Roles & permissions</CardTitle>
          <CardDescription>
            Tick what each role may do. Each change is saved at once and written to the audit log. Data access
            changes immediately; menus follow at the person's next sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : failed ? (
            <p className="py-8 text-center text-sm text-destructive">
              {failed instanceof Error ? failed.message : 'Could not load the permissions.'}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[260px]">Permission</TableHead>
                    {(roles.data ?? []).map((role) => (
                      <TableHead key={role.id} className="text-center text-xs">
                        {role.name_en}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <Fragment key={group.code}>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={(roles.data?.length ?? 0) + 1} className="py-2 text-sm font-semibold">
                          {group.label}
                        </TableCell>
                      </TableRow>
                      {group.items.map((permission) => (
                        <TableRow key={permission.id} data-permission={permission.code}>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm">{permission.description}</span>
                              {permission.is_medical && (
                                <Badge variant="outline" className="border-red-300 text-red-700">
                                  medical
                                </Badge>
                              )}
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{permission.code}</span>
                          </TableCell>
                          {(roles.data ?? []).map((role) => {
                            const on = granted.has(key(role.id, permission.id));
                            const locked = role.code === 'admin' && LOCKED.has(permission.code);
                            return (
                              <TableCell key={role.id} className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Checkbox
                                    checked={on}
                                    disabled={locked}
                                    aria-label={`${role.name_en}: ${permission.code}`}
                                    onCheckedChange={(value) => request(role, permission, value === true)}
                                  />
                                  {locked && (
                                    <Lock
                                      className="h-3 w-3 text-muted-foreground"
                                      aria-label="Always kept by the administration role"
                                    />
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Give medical access to {confirming?.role.name_en}?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirming?.permission.description}” gives access to data covered by medical secrecy. This role is
              not part of the care team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirming && change.mutate(confirming)}>Give access</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default RolesPermissionsPage;
