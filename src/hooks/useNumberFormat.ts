import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/lib/format';

/** Formats a number in the language of the interface; "—" when empty. */
export const useNumberFormat = () => {
  const { i18n } = useTranslation();
  return (value: number | null | undefined) => (value === null || value === undefined ? '—' : formatNumber(value, i18n.language));
};
