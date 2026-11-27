
import { SidebarProvider } from '@/components/ui/sidebar';
import SidebarNav from './SidebarNav';
import Header from './Header';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

// Each page has its own layout, so the menu reads how it was left (open or folded to its icons)
// from the cookie the sidebar writes when it is toggled.
const sidebarWasOpen = () => !document.cookie.split('; ').includes('sidebar:state=false');

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  const { t } = useTranslation();

  return (
    <SidebarProvider defaultOpen={sidebarWasOpen()}>
      <div className="min-h-screen flex w-full">
        <SidebarNav />
        <div className="flex flex-1 flex-col min-w-0">
          <Header title={title} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
          <footer>
            <div className="brand-pattern h-9" aria-hidden />
            <div className="border-t bg-card px-6 py-3 text-center text-xs text-muted-foreground">
              {t('footer', { year: String(new Date().getFullYear()) })}
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
