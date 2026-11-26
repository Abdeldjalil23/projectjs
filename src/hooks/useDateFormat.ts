import { useTranslation } from 'react-i18next';

/** Formats a date (YYYY-MM-DD or a timestamp) in the language of the interface; "—" when empty. */
export const useDateFormat = () => {
  const { i18n } = useTranslation();
  const format = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  return (value: string | null | undefined) =>
    value ? format.format(new Date(`${String(value).slice(0, 10)}T00:00:00`)) : '—';
};
