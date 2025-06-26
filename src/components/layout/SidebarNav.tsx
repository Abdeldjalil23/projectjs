import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, 
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, 
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger
} from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, FileText, User, Users, BarChart3, Settings, 
  LogOut, Bell, Pill, HeartPulse
} from 'lucide-react';

type MenuItem = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  url: string;
};

export const SidebarNav = () => {
  const { userRole, logout } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (userRole === 'doctor') {
      setMenuItems([
        { title: 'Dashboard', icon: Home, url: '/' },
        { title: 'Prescriptions', icon: Pill, url: '/prescriptions' },
        // New Pages
        { title: 'Dossiers Médicaux', icon: FileText, url: '/dossiers-medicaux' },
        { title: 'Visite Périodique', icon: FileText, url: '/visite-periodique' },
      ]);
    } else if (userRole === 'admin') {
      setMenuItems([
        { title: 'Dashboard', icon: Home, url: '/' },
        { title: 'Employee Stats', icon: BarChart3, url: '/stats' },
        { title: 'Doctors', icon: User, url: '/doctors' },
        { title: 'Departments', icon: Users, url: '/departments' },
        { title: 'Reports', icon: FileText, url: '/reports' },
        { title: 'Visite Périodique', icon: FileText, url: '/visite-perdue' },
      ]);
    }
  }, [userRole]);

  const userRoleLabel = () => {
    switch (userRole) {
      case 'doctor':
        return 'Doctor';
      case 'admin':
        return 'Administrator';
      default:
        return '';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1">
          <HeartPulse className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">MedSuite</h1>
            <p className="text-xs opacity-80">{userRoleLabel()} Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/settings"}>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/notifications"}>
                  <Link to="/notifications">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>

    </Sidebar>
  );
};

export default SidebarNav;
