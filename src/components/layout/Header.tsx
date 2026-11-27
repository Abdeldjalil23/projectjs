
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
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
  const initials = userRole ? ROLE_INITIALS[userRole] : 'US';
  const roleLabel = staffRole ? t(`roles.${staffRole}`, { defaultValue: accountRole ?? '' }) : '';
  const specialtyLabel = specialty || null;
  const idLabel = userId ? t('nav.staffId', { id: userId }) : null;
  const displayName = fullName || idLabel || roleLabel;
  const subtitle = [roleLabel, specialtyLabel, fullName ? idLabel : null].filter(Boolean).join(' · ');
  // Every page passes its title already translated.
  const pageTitle = title;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/95 backdrop-blur px-4">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger aria-label={t('nav.toggleSidebar')} className="rtl:-scale-x-100" />
        {/* Page title in capitals with a short bar under it, as the headings of sonatrach.com. */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold uppercase leading-tight tracking-wide md:text-lg">{pageTitle}</h1>
          <span className="title-bar mt-1" aria-hidden />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-foreground text-xs font-bold text-white">
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
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <User className="me-2 h-4 w-4" />
                <span>{t('nav.myProfile')}</span>
              </Link>
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
