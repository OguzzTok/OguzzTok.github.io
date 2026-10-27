/**
 * Arama motoru ve paylaşım (Open Graph) yardımcıları.
 */
import { getAbout, getSite } from './content';
import { l, type Locale } from './i18n';
import { socialLinks } from './profile';
import { getFeatured, getProjects } from './projects';
import { absoluteUrl, pagePath } from './urls';

/** Kendi görseli olmayan sayfalarda paylaşım görseli: öne çıkan proje, yoksa ilk projenin kapağı. */
export async function getDefaultShareImage(): Promise<ImageMetadata | undefined> {
  const projects = await getProjects();
  return (getFeatured(projects) ?? projects[0])?.data.cover.src;
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
