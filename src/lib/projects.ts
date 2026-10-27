/**
 * Proje ve kategori okuma, sıralama, doğrulama.
 * Sayfalar projelere her zaman buradan erişir; getCollection('projects') doğrudan çağrılmaz.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { otherLocale, type Locale } from './i18n';

export type Project = CollectionEntry<'projects'>;
export type Category = CollectionEntry<'categories'>;
export type ProjectText = CollectionEntry<'projectTexts'>;

/** Görünür kategoriler, `order`a göre. */
export async function getCategories(): Promise<Category[]> {
  const all = await getCollection('categories');
  return all.filter((c) => c.data.visible).sort((a, b) => a.data.order - b.data.order);
}

/** Sıralama: önce `order` (küçük önce, olmayanlar sona), sonra tarih (yeni → eski). */
export function compareProjects(a: Project, b: Project): number {
  const oa = a.data.order ?? Number.POSITIVE_INFINITY;
  const ob = b.data.order ?? Number.POSITIVE_INFINITY;
  if (oa !== ob) return oa - ob;
  return b.data.date.getTime() - a.data.date.getTime();
}

let cache: Promise<Project[]> | undefined;

/** Yayındaki projeler: taslaklar ve gizli kategorilerdekiler hariç, sıralı ve doğrulanmış. */
export function getProjects(): Promise<Project[]> {
  cache ??= loadProjects();
  return cache;
}

async function loadProjects(): Promise<Project[]> {
  const [all, categories, texts] = await Promise.all([
    getCollection('projects', (p) => !p.data.draft),
    getCollection('categories'),
    getCollection('projectTexts'),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const textIds = new Set(texts.map((t) => t.id));

  const errors: string[] = [];
  for (const project of all) {
    const category = categoryById.get(project.data.category.id);
    if (!category) {
      errors.push(`${project.id}: "${project.data.category.id}" diye bir kategori yok (src/data/categories.yaml)`);
      continue;
    }
    if (category.data.mode === 'detail' && !textIds.has(`${project.id}/en`) && !textIds.has(`${project.id}/tr`)) {
      errors.push(`${project.id}: "${category.id}" detail modunda; en.md veya tr.md dosyası gerekli`);
    }
  }
  if (errors.length) throw new Error(`Proje içeriği hatalı:\n  - ${errors.join('\n  - ')}`);

  return all.filter((p) => categoryById.get(p.data.category.id)?.data.visible).sort(compareProjects);
}

export async function getCategoryOf(project: Project): Promise<Category> {
  const categories = await getCollection('categories');
  const category = categories.find((c) => c.id === project.data.category.id);
  if (!category) throw new Error(`${project.id}: kategori bulunamadı`);
  return category;
}

/** Detay metni (en.md / tr.md); istenen dil yoksa diğer dile düşer. */
export async function getProjectText(slug: string, locale: Locale) {
  const texts = await getCollection('projectTexts');
  const own = texts.find((t) => t.id === `${slug}/${locale}`);
  if (own) return { entry: own, lang: locale, isFallback: false };
  const other = otherLocale(locale);
  const fallback = texts.find((t) => t.id === `${slug}/${other}`);
  return fallback ? { entry: fallback, lang: other, isFallback: true } : undefined;
}
