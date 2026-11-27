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
  const rtl = i18n.dir() === 'rtl';
  // When the menu is folded to its icons, the name of each item shows beside it on hover.
  const tooltip = (children: string) => ({ children, side: rtl ? ('left' as const) : ('right' as const) });

  return (
    // In Arabic the menu sits on the right, where reading starts. Folded, it keeps its icons.
    <Sidebar side={rtl ? 'right' : 'left'} collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:px-0">
          <HeartPulse className="h-6 w-6 shrink-0" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-semibold">MedSuite</h1>
            <p className="truncate text-xs opacity-80">{t('nav.portal', { role: roleName })}</p>
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
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={tooltip(t(`nav.${item.label}`))}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip={tooltip(t('nav.signOut'))}
              className="bg-background text-medsuite-primary hover:bg-background/90 hover:text-medsuite-accent"
            >
              <LogOut className="h-4 w-4 rtl:-scale-x-100" />
              <span>{t('nav.signOut')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
