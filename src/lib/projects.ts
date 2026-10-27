/**
 * Proje ve kategori okuma, sıralama, doğrulama.
 * Sayfalar projelere her zaman buradan erişir; getCollection('projects') doğrudan çağrılmaz.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { otherLocale, type Locale } from './i18n';
import { pagePath } from './urls';

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

/** "Tümü" sekmesinin anahtarı (kategori id'leriyle çakışmaz: id'ler tire/harf). */
export const ALL = 'all';

export function categoryPath(locale: Locale, categoryId: string): string {
  return categoryId === ALL ? pagePath(locale, 'projects') : pagePath(locale, 'projects', categoryId);
}

/** Karta tıklayınca gidilecek adres: detail → detay sayfası, lightbox → kategori sayfasında ?item= */
export function projectHref(project: Project, category: Category, locale: Locale): string {
  return category.data.mode === 'detail'
    ? pagePath(locale, 'projects', category.id, project.id)
    : `${categoryPath(locale, category.id)}?item=${project.id}`;
}

/** Öne çıkan proje: `featured: true` olanların sıralamadaki ilki. */
export function getFeatured(projects: Project[]): Project | undefined {
  return projects.find((p) => p.data.featured);
}

export function countByCategory(projects: Project[]): Map<string, number> {
  const counts = new Map<string, number>([[ALL, projects.length]]);
  for (const p of projects) counts.set(p.data.category.id, (counts.get(p.data.category.id) ?? 0) + 1);
  return counts;
}

/** Filtre seçeneği: etiket veya araç; hangi kategorilerde geçtiği (sekmeye göre gizlemek için). */
export interface Facet {
  key: string;
  label: string;
  categories: string[];
}

/** Etiketler büyük/küçük harfe duyarsız eşleşir: "Low-poly" ve "low-poly" aynı filtredir. */
export const tagKey = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, '-');

export function collectFacets(projects: Project[], toolLabels: Map<string, string>) {
  const build = (pairs: { key: string; label: string; category: string }[]): Facet[] => {
    const map = new Map<string, Facet>();
    for (const { key, label, category } of pairs) {
      const facet = map.get(key) ?? { key, label, categories: [] };
      if (!facet.categories.includes(category)) facet.categories.push(category);
      map.set(key, facet);
    }
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  };
  return {
    tags: build(projects.flatMap((p) => p.data.tags.map((t) => ({ key: tagKey(t), label: t, category: p.data.category.id })))),
    tools: build(
      projects.flatMap((p) =>
        p.data.tools.map((t) => ({ key: t.id, label: toolLabels.get(t.id) ?? t.id, category: p.data.category.id })),
      ),
    ),
  };
}

/** Detay sayfası altındaki önceki/sonraki: aynı kategoride, sıralamaya göre (başa sarmaz). */
export function getNeighbors(project: Project, projects: Project[]) {
  const siblings = projects.filter((p) => p.data.category.id === project.data.category.id);
  const index = siblings.findIndex((p) => p.id === project.id);
  return { prev: siblings[index - 1], next: siblings[index + 1] };
}

/** YouTube linki veya id → id. Tanınmazsa olduğu gibi döner (id kabul edilir). */
export function youtubeId(value: string): string {
  const match = value.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{6,})/);
  return match?.[1] ?? value.trim();
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
