
import { SidebarProvider } from '@/components/ui/sidebar';
import SidebarNav from './SidebarNav';
import Header from './Header';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  const { t } = useTranslation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarNav />
        <div className="flex flex-1 flex-col min-w-0">
          <Header title={title} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
          <footer className="border-t py-3 px-6">
            <div className="text-xs text-muted-foreground text-center">
              {t('footer', { year: new Date().getFullYear() })}
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
