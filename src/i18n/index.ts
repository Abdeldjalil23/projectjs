// Languages of the app: French by default, Arabic (right to left) and English.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { ar } from './locales/ar';

export const LANGUAGES = ['fr', 'ar', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Name of each language written in that language, for the language menu. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);

// The language chosen on this computer is remembered; once signed in, the account's language wins.
const STORAGE_KEY = 'medsuite.lang';

const savedLanguage = (): Language | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
};

const applyToDocument = (language: string) => {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
};

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: savedLanguage() ?? 'fr',
  fallbackLng: 'fr',
  supportedLngs: [...LANGUAGES],
  interpolation: { escapeValue: false }, // React already escapes text
  initAsync: false,
});

applyToDocument(i18n.language);

i18n.on('languageChanged', (language) => {
  applyToDocument(language);
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage can be unavailable: the choice then lasts until the page is closed.
  }
});

/** Text key of a permission description ("users.manage" → "permissions.users_manage"). */
export const permissionKey = (code: string) => `permissions.${code.replace(/\./g, '_')}`;

export default i18n;
