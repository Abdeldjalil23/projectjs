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
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Users,
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
};

export const SidebarNav = () => {
  const { t, i18n } = useTranslation();
  const { userRole, staffRole, roleLabel, logout, isDemo, can } = useAuth();
  const location = useLocation();

  const menuItems = useMemo<MenuItem[]>(() => {
    // Real data pages, shown to every workspace whose role has the permission.
    const beneficiaries: MenuItem[] =
      !isDemo && can('beneficiaries.read') ? [{ label: 'beneficiaries', icon: Contact, url: '/beneficiaries' }] : [];
    // Visit schedule: the real page once the server is connected, the sample page in the demo.
    const visits = (demoUrl: string): MenuItem[] =>
      isDemo
        ? [{ label: 'periodicVisit', icon: FileText, url: demoUrl }]
        : can('appointments.read')
          ? [{ label: 'visits', icon: CalendarCheck, url: '/visits' }]
          : [];
    // Register of the documents issued.
    const documents: MenuItem[] =
      !isDemo && can('documents.read') ? [{ label: 'documents', icon: FileStack, url: '/documents' }] : [];
    // Medicine stock.
    const medicines: MenuItem[] =
      !isDemo && can('medicines.read') ? [{ label: 'medicines', icon: Pill, url: '/medicines' }] : [];
    switch (userRole) {
      case 'doctor':
        return [
          { label: 'dashboard', icon: Home, url: '/medecin/dashboard' },
          ...beneficiaries,
          // Sample pages, replaced by the patient files once the server is connected.
          ...(isDemo ? [{ label: 'medicalRecords', icon: FileText, url: '/dossiers-medicaux' }] : []),
          ...visits('/visite-periodique'),
          ...documents,
          ...medicines,
          { label: 'reports', icon: FileText, url: '/medecin/reports' },
        ];
      case 'admin':
        return [
          { label: 'dashboard', icon: Home, url: '/admin/dashboard' },
          ...beneficiaries,
          { label: 'reports', icon: FileText, url: '/admin/reports' },
          ...visits('/admin/visite-perdue'),
          ...medicines,
          { label: 'careRequests', icon: ClipboardCheck, url: '/admin/requests-prise-en-charge' },
          // Account and permission management works only with the real server.
          ...(!isDemo && can('users.manage') ? [{ label: 'staffAccounts', icon: UserCog, url: '/admin/accounts' }] : []),
          ...(!isDemo && can('roles.manage') ? [{ label: 'rolesPermissions', icon: ShieldCheck, url: '/admin/roles' }] : []),
        ];
      case 'social':
        return [
          { label: 'dashboard', icon: Home, url: '/social/dashboard' },
          ...beneficiaries,
          { label: 'patientSupport', icon: HeartPulse, url: '/social/patients' },
          { label: 'socialServices', icon: Users, url: '/social/services' },
          { label: 'reports', icon: FileText, url: '/social/reports' },
          { label: 'resources', icon: FileText, url: '/social/resources' },
        ];
      case 'dentist':
        return [
          { label: 'dashboard', icon: Home, url: '/dentist/dashboard' },
          ...beneficiaries,
          ...documents,
          ...medicines,
          // Sample page, replaced by the patient files once the server is connected.
          ...(isDemo ? [{ label: 'patientManagement', icon: HeartPulse, url: '/dentist/patient-management' }] : []),
        ];
      default:
        return [];
    }
  }, [userRole, isDemo, can]);

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
