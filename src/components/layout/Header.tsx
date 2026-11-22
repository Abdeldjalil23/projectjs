
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { ROLE_INITIALS } from '@/lib/roles';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { t } = useTranslation();
  const { userRole, userId, specialty, fullName, staffRole, roleLabel: accountRole, logout } = useAuth();
  const [notifications] = useState(3);

  const initials = userRole ? ROLE_INITIALS[userRole] : 'US';
  const roleLabel = staffRole ? t(`roles.${staffRole}`, { defaultValue: accountRole ?? '' }) : '';
  const specialtyLabel = specialty ? t(`login.specialties.${specialty}`, { defaultValue: specialty }) : null;
  const idLabel = userId ? t('nav.staffId', { id: userId }) : null;
  const displayName = fullName || idLabel || roleLabel;
  const subtitle = [roleLabel, specialtyLabel, fullName ? idLabel : null].filter(Boolean).join(' · ');
  // Pages not translated yet pass their title as is; known titles are translated here.
  const pageTitle = t(`pageTitles.${title}`, { defaultValue: title });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger aria-label={t('nav.toggleSidebar')} className="rtl:-scale-x-100" />
        <h1 className="text-lg font-medium md:text-xl">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <LanguageSwitcher />

        <Button variant="ghost" size="icon" className="relative" aria-label={t('nav.notifications')}>
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute top-1 end-1 flex h-4 w-4 items-center justify-center rounded-full bg-medsuite-primary text-[10px] text-white">
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
              <User className="me-2 h-4 w-4" />
              <span>{t('nav.myProfile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <span>{t('nav.signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
