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
  CalendarClock,
  FileStack,
  Pill,
  SlidersHorizontal,
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
  { label: 'appointments', icon: CalendarClock, url: '/appointments', permission: 'appointments.read' },
  { label: 'documents', icon: FileStack, url: '/documents', permission: 'documents.read' },
  { label: 'medicines', icon: Pill, url: '/medicines', permission: 'medicines.read' },
  { label: 'careRequests', icon: ClipboardCheck, url: '/care-requests', permission: 'care_requests.read' },
  { label: 'reports', icon: FileText, url: '/reports', permission: 'reports.read' },
  { label: 'staffAccounts', icon: UserCog, url: '/admin/accounts', permission: 'users.manage' },
  { label: 'rolesPermissions', icon: ShieldCheck, url: '/admin/roles', permission: 'roles.manage' },
  { label: 'centreSettings', icon: SlidersHorizontal, url: '/admin/settings', permission: 'settings.manage' },
];

// Menu entries in capitals, as in the menu of sonatrach.com; the open page is marked by a bar and
// its name in the brand colour.
// Long names (« Demandes de prise en charge ») go on two lines instead of being cut.
const ITEM_CLASS = [
  'relative h-auto min-h-8 py-2 font-semibold uppercase tracking-wide text-[0.78rem] leading-tight text-sidebar-foreground',
  '[&>span:last-child]:whitespace-normal',
  'before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full before:bg-transparent',
  'data-[active=true]:text-primary data-[active=true]:before:bg-primary',
  '[&>svg]:data-[active=true]:text-primary',
].join(' ');

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
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-1 py-1.5 group-data-[collapsible=icon]:px-0">
          {/* Square brand mark, after the square logo of sonatrach.com. */}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-heading text-base font-bold uppercase leading-tight tracking-wider text-white">MedSuite</p>
            <p className="truncate text-[11px] text-sidebar-foreground/70">{t('nav.portal', { role: roleName })}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider text-sidebar-foreground/50">{t('nav.mainMenu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={tooltip(t(`nav.${item.label}`))}
                    className={ITEM_CLASS}
                  >
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
              className="border border-sidebar-border font-semibold hover:border-primary hover:bg-transparent hover:text-primary"
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
