
import { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { ROLE_INITIALS, ROLE_LABELS } from '@/lib/roles';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { userRole, userId, specialty, fullName, roleLabel: accountRole, logout } = useAuth();
  const [notifications] = useState(3);

  const initials = userRole ? ROLE_INITIALS[userRole] : 'US';
  const roleLabel = accountRole ?? (userRole ? ROLE_LABELS[userRole] : 'User');
  const displayName = fullName || (userId ? `ID ${userId}` : roleLabel);
  const details = [roleLabel, specialty !== roleLabel ? specialty : null, fullName && userId ? `ID ${userId}` : null];
  const subtitle = details.filter(Boolean).join(' · ');

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-medium md:text-xl">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">

        
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
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {subtitle}
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
