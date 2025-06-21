
import { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { userRole, logout } = useAuth();
  const [notifications] = useState(3);
  
  const getUserInitials = () => {
    switch(userRole) {
      case 'doctor': return 'DR';
      case 'admin': return 'AD';
      case 'patient': return 'PT';
      default: return 'US';
    }
  };
  
  const getUserName = () => {
    switch(userRole) {
      case 'doctor': return 'Dr. Sarah Johnson';
      case 'admin': return 'Admin Ali Hassan';
      case 'patient': return 'Mohammed Ahmed';
      default: return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-medium md:text-xl">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] pl-8 bg-background sm:w-[260px] focus-visible:ring-medsuite-primary"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-medsuite-primary text-[10px] text-white">
              {notifications}
            </span>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-medsuite-primary text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">{getUserName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole === 'doctor' ? 'Cardiology Department' : 
                   userRole === 'admin' ? 'System Administrator' : 
                   'Production Department'}
                </p>
              </div>
            </div>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
