import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { dashboardPathFor } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  LogOut,
  HeartPulse,
  ClipboardCheck,
  UserCog,
  ShieldCheck,
  Contact,
  CalendarCheck,
  FileStack,
  Pill,
} from 'lucide-react';

type MenuItem = {
  /** Text key under "nav". */
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  url: string;
  /** Permission the account needs to see the item; none for the dashboard. */
  permission?: string;
};

// Same menu for every workspace: each account sees the items its role has the permission for.
const ITEMS: MenuItem[] = [
  { label: 'beneficiaries', icon: Contact, url: '/beneficiaries', permission: 'beneficiaries.read' },
  { label: 'visits', icon: CalendarCheck, url: '/visits', permission: 'appointments.read' },
  { label: 'documents', icon: FileStack, url: '/documents', permission: 'documents.read' },
  { label: 'medicines', icon: Pill, url: '/medicines', permission: 'medicines.read' },
  { label: 'careRequests', icon: ClipboardCheck, url: '/care-requests', permission: 'care_requests.read' },
  { label: 'reports', icon: FileText, url: '/reports', permission: 'reports.read' },
  { label: 'staffAccounts', icon: UserCog, url: '/admin/accounts', permission: 'users.manage' },
  { label: 'rolesPermissions', icon: ShieldCheck, url: '/admin/roles', permission: 'roles.manage' },
];

export const SidebarNav = () => {
  const { t, i18n } = useTranslation();
  const { userRole, staffRole, roleLabel, logout, can } = useAuth();
  const location = useLocation();

  const menuItems = useMemo<MenuItem[]>(
    () =>
      userRole
        ? [
            { label: 'dashboard', icon: Home, url: dashboardPathFor(userRole) },
            ...ITEMS.filter((item) => !item.permission || can(item.permission)),
          ]
        : [],
    [userRole, can],
  );

  const roleName = staffRole ? t(`roles.${staffRole}`, { defaultValue: roleLabel ?? '' }) : '';

  return (
    // In Arabic the menu sits on the right, where reading starts.
    <Sidebar side={i18n.dir() === 'rtl' ? 'right' : 'left'}>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1">
          <HeartPulse className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">MedSuite</h1>
            <p className="text-xs opacity-80">{t('nav.portal', { role: roleName })}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.mainMenu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(`nav.${item.label}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="outline"
          className="w-full justify-start border-orange-500 text-orange-500"
          onClick={logout}
        >
          <LogOut className="me-2 h-4 w-4 rtl:-scale-x-100" />
          {t('nav.signOut')}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
