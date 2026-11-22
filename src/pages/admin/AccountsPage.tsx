// Staff accounts: create, edit, activate / deactivate, reset password.
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, MoreHorizontal, Pencil, Plus, Search, UserCheck, UserX } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ServerRequiredNotice from '@/components/shared/ServerRequiredNotice';
import PasswordField from '@/components/shared/PasswordField';
import { useAuth } from '@/context/AuthContext';
import { WORKSPACE_BY_STAFF_ROLE } from '@/lib/roles';
import {
  StaffAccount,
  StaffRole,
  createAccount,
  fetchAccounts,
  fetchRoles,
  generatePassword,
  resetPassword,
  updateAccount,
} from '@/lib/accounts';

const STAFF_ID_PATTERN = /^[A-Za-z0-9._-]{2,32}$/;
const ALL = 'all';

const roleOptionLabel = (role: StaffRole) =>
  WORKSPACE_BY_STAFF_ROLE[role.code] ? role.name_en : `${role.name_en} (no workspace yet)`;

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'The request failed. Please try again.');

// --- Create / edit dialog -------------------------------------------------------------

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: StaffRole[];
  /** Account to edit; undefined to create a new one. */
  account?: StaffAccount;
  /** True when the account is the signed-in user's own: role cannot be changed. */
  isSelf?: boolean;
}

const AccountDialog = ({ open, onOpenChange, roles, account, isSelf }: AccountDialogProps) => {
  const queryClient = useQueryClient();
  const editing = Boolean(account);
  const [staffId, setStaffId] = useState(account?.staff_id ?? '');
  const [fullName, setFullName] = useState(account?.full_name ?? '');
  const [roleId, setRoleId] = useState(account?.role?.id ?? '');
  const [specialty, setSpecialty] = useState(account?.specialty ?? '');
  const [password, setPassword] = useState(() => (account ? '' : generatePassword()));

  const save = useMutation({
    mutationFn: async () => {
      if (account) {
        await updateAccount(account.id, {
          full_name: fullName.trim(),
          specialty: specialty.trim() || null,
          ...(isSelf || roleId === account.role?.id ? {} : { role_id: roleId }),
        });
        return;
      }
      const role = roles.find((r) => r.id === roleId);
      await createAccount({
        staff_id: staffId.trim(),
        full_name: fullName.trim(),
        password,
        role_code: role?.code ?? '',
        specialty: specialty.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(
        editing
          ? 'Account updated'
          : `Account ${staffId.trim()} created. Give the ID and password to ${fullName.trim() || 'the person'}.`,
      );
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !STAFF_ID_PATTERN.test(staffId.trim())) {
      toast.error('The ID may only contain letters, digits, dots, dashes and underscores (2 to 32).');
      return;
    }
    if (!fullName.trim()) {
      toast.error('Please enter the full name');
      return;
    }
    if (!roleId) {
      toast.error('Please choose a role');
      return;
    }
    if (!editing && password.length < 8) {
      toast.error('The password needs at least 8 characters');
      return;
    }
    save.mutate();
  };

  const selectedRole = roles.find((r) => r.id === roleId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit account ${account?.staff_id ?? ''}` : 'New account'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'The ID cannot be changed. To block access, deactivate the account.'
                : 'The person signs in with this ID and password.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!editing && (
              <div className="grid gap-2">
                <Label htmlFor="account-id">ID</Label>
                <Input
                  id="account-id"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="e.g. 1234A"
                  autoComplete="off"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="account-name">Full name</Label>
              <Input id="account-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-role">Role</Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={isSelf}>
                <SelectTrigger id="account-role">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {roleOptionLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf && <p className="text-xs text-muted-foreground">You cannot change your own role.</p>}
              {selectedRole && !WORKSPACE_BY_STAFF_ROLE[selectedRole.code] && (
                <p className="text-xs text-amber-600">
                  This role has no pages yet: the account can be prepared, but cannot sign in for now.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-specialty">Specialty (optional)</Label>
              <Input
                id="account-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Occupational medicine"
              />
            </div>
            {!editing && <PasswordField id="account-password" label="Password" value={password} onChange={setPassword} />}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : editing ? 'Save' : 'Create account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Reset password dialog ------------------------------------------------------------

const ResetPasswordDialog = ({ account, onClose }: { account: StaffAccount; onClose: () => void }) => {
  const [password, setPassword] = useState(() => generatePassword());
  const reset = useMutation({
    mutationFn: () => resetPassword(account.id, password),
    onSuccess: () => {
      toast.success(`New password set for ${account.staff_id}. Give it to ${account.full_name || 'the person'}.`);
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 8) {
              toast.error('The password needs at least 8 characters');
              return;
            }
            reset.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              {account.full_name} ({account.staff_id}). The old password stops working immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PasswordField id="reset-password" label="New password" value={password} onChange={setPassword} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={reset.isPending}>
              {reset.isPending ? 'Saving…' : 'Set password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Page -----------------------------------------------------------------------------

export const AccountsPage = () => {
  const { isDemo, userId } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [resetting, setResetting] = useState<StaffAccount | null>(null);
  const [toggling, setToggling] = useState<StaffAccount | null>(null);

  const accounts = useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts, enabled: !isDemo });
  const roles = useQuery({ queryKey: ['roles'], queryFn: fetchRoles, enabled: !isDemo });

  const toggleActive = useMutation({
    mutationFn: (account: StaffAccount) => updateAccount(account.id, { active: !account.active }),
    onSuccess: (_, account) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(`Account ${account.staff_id} ${account.active ? 'deactivated' : 'activated'}`);
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setToggling(null),
  });

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (accounts.data ?? []).filter((a) => {
      if (roleFilter !== ALL && a.role?.id !== roleFilter) return false;
      if (!term) return true;
      return [a.staff_id, a.full_name, a.specialty, a.role?.name_en].some((v) => v?.toLowerCase().includes(term));
    });
  }, [accounts.data, search, roleFilter]);

  const activeCount = (accounts.data ?? []).filter((a) => a.active).length;
  const isSelf = (account: StaffAccount) => Boolean(userId) && account.staff_id === userId;

  if (isDemo) {
    return (
      <AppLayout title="Staff accounts">
        <ServerRequiredNotice />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Staff accounts">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>Staff accounts</CardTitle>
            <CardDescription>
              {accounts.data
                ? `${accounts.data.length} accounts, ${activeCount} active. Accounts are created here only.`
                : 'Accounts are created here only: nobody can sign up by themselves.'}
            </CardDescription>
          </div>
          <Button onClick={() => setCreating(true)} disabled={!roles.data}>
            <Plus className="mr-2 h-4 w-4" />
            New account
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by ID, name, role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]" aria-label="Filter by role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All roles</SelectItem>
                {(roles.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {accounts.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading accounts…</p>
          ) : accounts.isError ? (
            <div className="py-8 text-center text-sm">
              <p className="text-destructive">{errorMessage(accounts.error)}</p>
              <Button variant="link" onClick={() => accounts.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No account found
                      </TableCell>
                    </TableRow>
                  ) : (
                    visible.map((account) => (
                      <TableRow key={account.id} data-account={account.staff_id ?? ''}>
                        <TableCell className="font-mono">{account.staff_id ?? '—'}</TableCell>
                        <TableCell>
                          {account.full_name || '—'}
                          {isSelf(account) && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                        </TableCell>
                        <TableCell>{account.role?.name_en ?? '—'}</TableCell>
                        <TableCell>{account.specialty || '—'}</TableCell>
                        <TableCell>
                          {account.active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`Actions for ${account.staff_id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditing(account)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setResetting(account)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={isSelf(account) || (!account.active && !account.role)}
                                onClick={() => setToggling(account)}
                              >
                                {account.active ? (
                                  <UserX className="mr-2 h-4 w-4" />
                                ) : (
                                  <UserCheck className="mr-2 h-4 w-4" />
                                )}
                                {account.active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {creating && roles.data && <AccountDialog open onOpenChange={setCreating} roles={roles.data} />}
      {editing && roles.data && (
        <AccountDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          roles={roles.data}
          account={editing}
          isSelf={isSelf(editing)}
        />
      )}
      {resetting && <ResetPasswordDialog account={resetting} onClose={() => setResetting(null)} />}

      <AlertDialog open={toggling !== null} onOpenChange={(open) => !open && setToggling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggling?.active ? 'Deactivate' : 'Activate'} {toggling?.staff_id}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggling?.active
                ? `${toggling?.full_name || 'This person'} will no longer be able to sign in or reach any data. The account and its history are kept.`
                : `${toggling?.full_name || 'This person'} will be able to sign in again with the role ${toggling?.role?.name_en}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toggling && toggleActive.mutate(toggling)}>
              {toggling?.active ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AccountsPage;
