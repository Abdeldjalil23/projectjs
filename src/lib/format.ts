// Locale used to write dates and numbers in each language of the interface. Arabic follows the
// usage in Algeria: Latin digits and the Algerian month names (جانفي، فيفري…).
export const intlLocale = (language?: string) => {
  if (language?.startsWith('ar')) return 'ar-DZ';
  if (language?.startsWith('fr')) return 'fr-DZ';
  return 'en';
};

const numberFormats = new Map<string, Intl.NumberFormat>();

/** A number written the local way (1 250 in French, 1,250 in English, 1.250 in Arabic). */
export const formatNumber = (value: number, language?: string) => {
  const locale = intlLocale(language);
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    numberFormats.set(locale, format);
  }
  return format.format(value);
};
