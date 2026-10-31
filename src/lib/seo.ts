/**
 * Arama motoru ve paylaşım (Open Graph) yardımcıları.
 */
import { getAbout, getSite } from './content';
import ogEn from '../assets/og/og-en.png';
import ogTr from '../assets/og/og-tr.png';
import { l, type Locale } from './i18n';
import { socialLinks } from './profile';
import { absoluteUrl, pagePath } from './urls';

/**
 * Kendi görseli olmayan sayfalarda (ana sayfa, projeler, 404) paylaşım görseli: hero sahnesinden üretilen
 * 1200×630 PNG (scripts/make-og.mjs). Proje detay sayfaları kendi kapağını kullanır.
 */
export function getDefaultShareImage(locale: Locale): ImageMetadata {
  return locale === 'tr' ? ogTr : ogEn;
}

/** Ana sayfa için schema.org Person verisi (Google'ın kişi bilgisi). */
export async function personJsonLd(locale: Locale) {
  const [site, about] = await Promise.all([getSite(), getAbout()]);
  const school = l(about.school, locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: absoluteUrl(pagePath(locale)),
    email: `mailto:${site.email}`,
    description: l(site.intro, locale),
    ...(school && { affiliation: { '@type': 'CollegeOrUniversity', name: school } }),
    sameAs: socialLinks(site.socials).map((s) => s.url),
  };
}
