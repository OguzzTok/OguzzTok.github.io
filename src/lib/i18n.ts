/**
 * Dil yardımcıları: arayüz metinleri (src/i18n/*.json) ve içerikteki {en, tr} alanlarının fallback'i.
 */
import en from '../i18n/en.json';
import tr from '../i18n/tr.json';

export const LOCALES = ['en', 'tr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export type UiKey = keyof typeof en;
// tr.json'da eksik anahtar varsa typecheck burada hata verir.
const dictionaries: Record<Locale, Record<UiKey, string>> = { en, tr };

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'tr' : 'en';
}

/** Arayüz metni: t('nav.projects'), t('x.y', { count: 3 }) → "{count}" yer tutucuları doldurulur. */
export function useTranslations(locale: Locale) {
  return (key: UiKey, vars?: Record<string, string | number>): string => {
    let value = dictionaries[locale][key] || dictionaries[DEFAULT_LOCALE][key];
    if (vars) for (const [name, v] of Object.entries(vars)) value = value.replaceAll(`{${name}}`, String(v));
    return value;
  };
}

/** Tekil/çoğul: plural(t, 'projects.count', 3) → "3 projects" (anahtarlar: <taban>.one / <taban>.other) */
export function plural(t: ReturnType<typeof useTranslations>, base: string, count: number): string {
  return t(`${base}.${count === 1 ? 'one' : 'other'}` as UiKey, { count });
}

export type Localized ={ en?: string | undefined; tr?: string | undefined } | undefined;

export interface LocalizedText {
  text: string;
  /** Metnin gerçek dili; fallback olduysa sayfanın dilinden farklıdır. */
  lang: Locale;
  isFallback: boolean;
}

/** İçerikteki {en, tr} alanını sayfanın diline çözer; boşsa diğer dile düşer. */
export function localize(value: Localized, locale: Locale): LocalizedText | undefined {
  const own = value?.[locale]?.trim();
  if (own) return { text: own, lang: locale, isFallback: false };
  const other = otherLocale(locale);
  const fallback = value?.[other]?.trim();
  if (fallback) return { text: fallback, lang: other, isFallback: true };
  return undefined;
}

/** Sadece metin lazımsa (title, alt, aria-label gibi). */
export function l(value: Localized, locale: Locale): string {
  return localize(value, locale)?.text ?? '';
}

const intlLocale: Record<Locale, string> = { en: 'en-US', tr: 'tr-TR' };

export function formatDate(date: Date, locale: Locale, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: 'UTC', ...options }).format(date);
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}
