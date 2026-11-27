// What makes /app installable on a phone: the manifest, the icons and the service worker. They
// are added only while the workers' app is open, so the staff platform is not installable.
import { useEffect, useState } from 'react';

const addHeadLink = (rel: string, href: string) => {
  if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  document.head.appendChild(link);
};

export const setupWorkerPwa = () => {
  addHeadLink('manifest', '/worker.webmanifest');
  addHeadLink('apple-touch-icon', '/icons/apple-touch-icon.png');
  const theme = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (theme) theme.content = '#141414';
  for (const [name, content] of [
    ['apple-mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-title', 'MedSuite'],
    ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
  ]) {
    if (!document.head.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  }
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/worker-sw.js', { scope: '/app' }).catch(() => undefined);
  }
};

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** The browser's install offer (Android / desktop Chrome), and whether the app already runs installed. */
export const useInstallPrompt = () => {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const installed =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  return {
    installed,
    canInstall: Boolean(event),
    showIosHint: !installed && !event && isIos,
    install: async () => {
      if (!event) return;
      await event.prompt();
      await event.userChoice.catch(() => undefined);
      setEvent(null);
    },
  };
};
