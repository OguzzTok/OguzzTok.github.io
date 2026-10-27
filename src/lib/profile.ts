/**
 * Hakkımda, sertifikalar, indirmeler ve sosyal linkler için okuyucular.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { downloadFile, type PublishedFile } from './assets';
import { getCollectionInFileOrder } from './content';
import { LOCALES, type Locale } from './i18n';

export type Certificate = CollectionEntry<'certificates'>;

/** Sertifikalar: önce `order` (küçük önce), sonra tarih (yeni → eski). */
export async function getCertificates(): Promise<Certificate[]> {
  const all = await getCollection('certificates');
  return all.sort((a, b) => {
    const oa = a.data.order ?? Number.POSITIVE_INFINITY;
    const ob = b.data.order ?? Number.POSITIVE_INFINITY;
    return oa !== ob ? oa - ob : b.data.date.getTime() - a.data.date.getTime();
  });
}

/** Logo yoksa gösterilecek baş harfler: "Sample Academy" → "SA" */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase('tr'))
    .join('');
}

export interface DownloadFileView extends PublishedFile {
  lang: Locale;
  pages: number;
  updated: Date;
}

/** İndirmeler: her belge için var olan dillerdeki dosyalar; sayfanın dili önce gelir. */
export async function getDownloads(locale: Locale) {
  const entries = await getCollectionInFileOrder('downloads', 'downloads.yaml');
  const order = [locale, ...LOCALES.filter((l) => l !== locale)];
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    files: order.flatMap((lang): DownloadFileView[] => {
      const file = entry.data.files[lang];
      return file ? [{ ...downloadFile(file.file), lang, pages: file.pages, updated: file.updated }] : [];
    }),
  }));
}

/** Sosyal platformlar: site.yaml'daki anahtar → görünen ad. Sıra burada belirlenir. */
export const SOCIAL_LABELS = {
  itch: 'itch.io',
  steam: 'Steam',
  github: 'GitHub',
  artstation: 'ArtStation',
  sketchfab: 'Sketchfab',
  behance: 'Behance',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  discord: 'Discord',
} as const;

export function socialLinks(socials: Partial<Record<keyof typeof SOCIAL_LABELS, string | undefined>>) {
  return (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[])
    .filter((key) => socials[key])
    .map((key) => ({ key, label: SOCIAL_LABELS[key], url: socials[key]! }));
}
