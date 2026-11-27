// Frame of the workers' app, made for a phone: a dark bar with the brand, the notifications bell
// and the language, the page, and a bottom bar with the main sections.
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, ClipboardList, FileCheck2, HeartPulse, Home, Phone, Stethoscope } from 'lucide-react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { fetchWorkerNotifications } from '@/lib/worker';

const NAV = [
  { to: '/app', icon: Home, label: 'home', end: true },
  { to: '/app/requests', icon: ClipboardList, label: 'requests', end: false },
  { to: '/app/documents', icon: FileCheck2, label: 'documents', end: false },
  { to: '/app/doctors', icon: Stethoscope, label: 'doctors', end: false },
  { to: '/app/contacts', icon: Phone, label: 'contacts', end: false },
] as const;

const useUnreadCount = () => {
  const notifications = useQuery({
    queryKey: ['worker', 'notifications'],
    queryFn: fetchWorkerNotifications,
    refetchInterval: 60_000,
  });
  return (notifications.data ?? []).filter((n) => !n.read_at).length;
};

export const WorkerLayout = ({ title, back, children }: { title?: string; back?: string; children: ReactNode }) => {
  const { t } = useTranslation();
  const unread = useUnreadCount();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-30 bg-[#141414] text-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          {back ? (
            <Link to={back} className="-ms-1 rounded-sm p-1 hover:bg-white/10" aria-label={t('worker.back')}>
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </Link>
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary">
              <HeartPulse className="h-5 w-5" />
            </span>
          )}
          <p className="min-w-0 flex-1 truncate font-bold uppercase tracking-wide">{title ?? 'MedSuite'}</p>
          <Link to="/app/notifications" className="relative rounded-sm p-2 hover:bg-white/10" aria-label={t('worker.nav.notifications')}>
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold" data-testid="unread">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <LanguageSwitcher className="text-white hover:bg-white/10 hover:text-white" />
        </div>
        <div className="h-[3px] bg-primary" />
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-28 pt-5">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={t('worker.nav.label')}
      >
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b bg-primary" aria-hidden />}
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{t(`worker.nav.${label}`)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

/** Title of a section, with the short brand bar under it. */
export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div className="mb-3">
    <h2 className="text-base font-bold uppercase tracking-wide">{children}</h2>
    <span className="title-bar mt-1.5" aria-hidden />
  </div>
);

export default WorkerLayout;
