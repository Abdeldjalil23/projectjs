// Staff accounts: create, edit, activate / deactivate, reset password.
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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

const roleName = (t: TFunction, role: Pick<StaffRole, 'code' | 'name_en'>) =>
  t(`roles.${role.code}`, { defaultValue: role.name_en });

const roleOptionLabel = (t: TFunction, role: StaffRole) =>
  WORKSPACE_BY_STAFF_ROLE[role.code]
    ? roleName(t, role)
    : `${roleName(t, role)} ${t('accounts.noWorkspaceSuffix')}`;

const errorMessage = (t: TFunction, e: unknown) => (e instanceof Error ? e.message : t('common.requestFailed'));

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
  const { t } = useTranslation();
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
          ? t('accounts.toasts.updated')
          : t('accounts.toasts.created', { id: staffId.trim(), name: fullName.trim() || t('accounts.thePerson') }),
      );
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(t, e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !STAFF_ID_PATTERN.test(staffId.trim())) {
      toast.error(t('accounts.errors.idFormat'));
      return;
    }
    if (!fullName.trim()) {
      toast.error(t('accounts.errors.fullName'));
      return;
    }
    if (!roleId) {
      toast.error(t('accounts.errors.role'));
      return;
    }
    if (!editing && password.length < 8) {
      toast.error(t('accounts.errors.passwordLength'));
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
            <DialogTitle>
              {editing ? t('accounts.dialog.editTitle', { id: account?.staff_id ?? '' }) : t('accounts.dialog.newTitle')}
            </DialogTitle>
            <DialogDescription>{editing ? t('accounts.dialog.editHint') : t('accounts.dialog.newHint')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!editing && (
              <div className="grid gap-2">
                <Label htmlFor="account-id">{t('accounts.dialog.id')}</Label>
                <Input
                  id="account-id"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder={t('accounts.dialog.idPlaceholder')}
                  autoComplete="off"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="account-name">{t('accounts.dialog.fullName')}</Label>
              <Input id="account-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-role">{t('accounts.dialog.role')}</Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={isSelf}>
                <SelectTrigger id="account-role">
                  <SelectValue placeholder={t('accounts.dialog.chooseRole')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {roleOptionLabel(t, role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf && <p className="text-xs text-muted-foreground">{t('accounts.dialog.ownRole')}</p>}
              {selectedRole && !WORKSPACE_BY_STAFF_ROLE[selectedRole.code] && (
                <p className="text-xs text-amber-600">{t('accounts.dialog.noWorkspaceHint')}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-specialty">{t('accounts.dialog.specialty')}</Label>
              <Input
                id="account-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder={t('accounts.dialog.specialtyPlaceholder')}
              />
            </div>
            {!editing && (
              <PasswordField
                id="account-password"
                label={t('accounts.dialog.password')}
                value={password}
                onChange={setPassword}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('common.saving') : editing ? t('common.save') : t('accounts.dialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Reset password dialog ------------------------------------------------------------

const ResetPasswordDialog = ({ account, onClose }: { account: StaffAccount; onClose: () => void }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState(() => generatePassword());
  const reset = useMutation({
    mutationFn: () => resetPassword(account.id, password),
    onSuccess: () => {
      toast.success(
        t('accounts.reset.done', { id: account.staff_id, name: account.full_name || t('accounts.thePerson') }),
      );
      onClose();
    },
    onError: (e) => toast.error(errorMessage(t, e)),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 8) {
              toast.error(t('accounts.errors.passwordLength'));
              return;
            }
            reset.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('accounts.reset.title')}</DialogTitle>
            <DialogDescription>
              {t('accounts.reset.description', { name: account.full_name, id: account.staff_id })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PasswordField
              id="reset-password"
              label={t('accounts.reset.newPassword')}
              value={password}
              onChange={setPassword}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={reset.isPending}>
              {reset.isPending ? t('common.saving') : t('accounts.reset.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Page -----------------------------------------------------------------------------

export const AccountsPage = () => {
  const { t } = useTranslation();
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
      toast.success(
        t(account.active ? 'accounts.toasts.deactivated' : 'accounts.toasts.activated', { id: account.staff_id }),
      );
    },
    onError: (e) => toast.error(errorMessage(t, e)),
    onSettled: () => setToggling(null),
  });

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (accounts.data ?? []).filter((a) => {
      if (roleFilter !== ALL && a.role?.id !== roleFilter) return false;
      if (!term) return true;
      return [a.staff_id, a.full_name, a.specialty, a.role?.name_en, a.role && roleName(t, a.role)].some((v) =>
        v?.toLowerCase().includes(term),
      );
    });
  }, [accounts.data, search, roleFilter, t]);

  const activeCount = (accounts.data ?? []).filter((a) => a.active).length;
  const isSelf = (account: StaffAccount) => Boolean(userId) && account.staff_id === userId;

  if (isDemo) {
    return (
      <AppLayout title={t('accounts.title')}>
        <ServerRequiredNotice />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t('accounts.title')}>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>{t('accounts.title')}</CardTitle>
            <CardDescription>
              {accounts.data
                ? t('accounts.summary', { count: accounts.data.length, active: activeCount })
                : t('accounts.createdHereOnly')}
            </CardDescription>
          </div>
          <Button onClick={() => setCreating(true)} disabled={!roles.data}>
            <Plus className="me-2 h-4 w-4" />
            {t('accounts.newAccount')}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                placeholder={t('accounts.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]" aria-label={t('accounts.filterByRole')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('accounts.allRoles')}</SelectItem>
                {(roles.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {roleName(t, role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {accounts.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('accounts.loadingAccounts')}</p>
          ) : accounts.isError ? (
            <div className="py-8 text-center text-sm">
              <p className="text-destructive">{errorMessage(t, accounts.error)}</p>
              <Button variant="link" onClick={() => accounts.refetch()}>
                {t('common.tryAgain')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounts.columns.id')}</TableHead>
                    <TableHead>{t('accounts.columns.name')}</TableHead>
                    <TableHead>{t('accounts.columns.role')}</TableHead>
                    <TableHead>{t('accounts.columns.specialty')}</TableHead>
                    <TableHead>{t('accounts.columns.status')}</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">{t('common.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        {t('accounts.noneFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visible.map((account) => (
                      <TableRow key={account.id} data-account={account.staff_id ?? ''}>
                        <TableCell className="font-mono">{account.staff_id ?? '—'}</TableCell>
                        <TableCell>
                          {account.full_name || '—'}
                          {isSelf(account) && (
                            <span className="ms-2 text-xs text-muted-foreground">({t('common.you')})</span>
                          )}
                        </TableCell>
                        <TableCell>{account.role ? roleName(t, account.role) : '—'}</TableCell>
                        <TableCell>{account.specialty || '—'}</TableCell>
                        <TableCell>
                          {account.active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              {t('common.active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t('common.inactive')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('accounts.actionsFor', { id: account.staff_id })}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditing(account)}>
                                <Pencil className="me-2 h-4 w-4" />
                                {t('accounts.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setResetting(account)}>
                                <KeyRound className="me-2 h-4 w-4" />
                                {t('accounts.resetPassword')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={isSelf(account) || (!account.active && !account.role)}
                                onClick={() => setToggling(account)}
                              >
                                {account.active ? (
                                  <UserX className="me-2 h-4 w-4" />
                                ) : (
                                  <UserCheck className="me-2 h-4 w-4" />
                                )}
                                {account.active ? t('accounts.deactivate') : t('accounts.activate')}
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
              {t(toggling?.active ? 'accounts.toggle.deactivateTitle' : 'accounts.toggle.activateTitle', {
                id: toggling?.staff_id,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggling?.active
                ? t('accounts.toggle.deactivateBody', { name: toggling?.full_name || t('accounts.thisPerson') })
                : t('accounts.toggle.activateBody', {
                    name: toggling?.full_name || t('accounts.thisPerson'),
                    role: toggling?.role ? roleName(t, toggling.role) : '',
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => toggling && toggleActive.mutate(toggling)}>
              {toggling?.active ? t('accounts.deactivate') : t('accounts.activate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AccountsPage;
