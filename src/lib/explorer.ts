/**
 * Proje gezgini (öne çıkan kart + sekmeler + filtre + grid + lightbox) için gereken her şeyi tek yerde toplar.
 */
import { getTools } from './content';
import { l, useTranslations, type Locale, type UiKey } from './i18n';
import { buildLightboxProjects } from './lightbox';
import { ALL, collectFacets, countByCategory, getCategories, getFeatured, getProjects } from './projects';

export interface Tab {
  id: string;
  label: string;
  count: number;
}

/** Lightbox'ın tarayıcıda ihtiyaç duyduğu arayüz metinleri. */
const LIGHTBOX_LABELS = [
  'lightbox.dialog',
  'lightbox.close',
  'lightbox.zoom',
  'lightbox.prev',
  'lightbox.next',
  'lightbox.prevProject',
  'lightbox.nextProject',
  'lightbox.thumbnails',
  'lightbox.imageLabel',
  'lightbox.info',
  'lightbox.view3d',
  'lightbox.close3d',
  'lightbox.loading3d',
  'lightbox.error3d',
  'lightbox.hint3d',
  'lightbox.error',
  'meta.date',
  'meta.tools',
  'meta.tris',
  'meta.texture',
  'meta.renderer',
] as const satisfies readonly UiKey[];

export type LightboxLabels = Record<(typeof LIGHTBOX_LABELS)[number], string>;

export async function getExplorerData(locale: Locale) {
  const t = useTranslations(locale);
  const [projects, categories, toolLabels] = await Promise.all([getProjects(), getCategories(), getTools()]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const counts = countByCategory(projects);

  // Boş kategoriler sekme olarak görünmez (sayfaları da üretilmez).
  const tabs: Tab[] = [
    { id: ALL, label: t('projects.tab.all'), count: projects.length },
    ...categories
      .filter((c) => (counts.get(c.id) ?? 0) > 0)
      .map((c) => ({ id: c.id, label: l(c.data.name, locale), count: counts.get(c.id) ?? 0 })),
  ];

  const lightbox = await buildLightboxProjects(projects, categoryById, locale, toolLabels, t);
  const labels = Object.fromEntries(LIGHTBOX_LABELS.map((key) => [key, t(key)])) as LightboxLabels;

  return {
    projects,
    categoryById,
    toolLabels,
    tabs,
    facets: collectFacets(projects, toolLabels),
    featured: getFeatured(projects),
    lightbox: { projects: lightbox, labels },
  };
}

/** Sayfası üretilecek kategoriler (görünür ve en az bir projesi olan). */
export async function getCategoryPages() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()]);
  const counts = countByCategory(projects);
  return categories.filter((c) => (counts.get(c.id) ?? 0) > 0);
}
