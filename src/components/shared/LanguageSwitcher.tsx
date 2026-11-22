import { Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { LANGUAGES, LANGUAGE_NAMES, Language } from '@/i18n';
import { saveMyLanguage } from '@/lib/accounts';

/** Language menu. Once signed in, the choice is also saved in the account. */
export const LanguageSwitcher = ({ showName = false }: { showName?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, isDemo } = useAuth();
  const current = i18n.resolvedLanguage as Language;

  const choose = async (language: Language) => {
    if (language === current) return;
    await i18n.changeLanguage(language);
    if (isLoggedIn && !isDemo) {
      try {
        await saveMyLanguage(language);
      } catch {
        toast.error(t('language.saveFailed'));
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={showName ? 'sm' : 'icon'} aria-label={t('language.label')} title={t('language.label')}>
          <Globe className="h-5 w-5" />
          {showName && <span>{LANGUAGE_NAMES[current]}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language}
            lang={language}
            dir={i18n.dir(language)}
            onClick={() => void choose(language)}
            className="justify-between"
          >
            {LANGUAGE_NAMES[language]}
            {language === current && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
