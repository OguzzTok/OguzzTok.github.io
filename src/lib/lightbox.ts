/**
 * Lightbox verisi: lightbox modundaki projelerin görselleri (WebP, birkaç boyut), küçük resimleri ve bilgileri.
 * Sayfaya JSON olarak gömülür; tarayıcıdaki lightbox script'i bunu okur.
 */
import { getImage } from 'astro:assets';
import { formatDate, l, localize, type Locale, type UiKey } from './i18n';
import { projectFile } from './assets';
import type { Category, Project } from './projects';

export interface LightboxImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
  thumb: string;
  alt: string;
}

export interface LightboxProject {
  slug: string;
  title: string;
  summary: string;
  /** Fallback olduysa metnin gerçek dili */
  lang?: Locale;
  category: string;
  date: string;
  tools: string[];
  model?: { url: string; tris?: number; texture?: string; renderer?: string };
  links: { label: string; url: string }[];
  images: LightboxImage[];
}

const MAX_WIDTH = 2560;
const STEPS = [960, 1600, MAX_WIDTH];

export async function lightboxImage(src: ImageMetadata, alt: string): Promise<LightboxImage> {
  const width = Math.min(src.width, MAX_WIDTH);
  const height = Math.round((src.height / src.width) * width);
  const widths = [...new Set([...STEPS.filter((w) => w < width), width])];
  const [full, thumb] = await Promise.all([
    getImage({ src, width, widths, format: 'webp', quality: 82 }),
    getImage({ src, width: 192, format: 'webp', quality: 70 }),
  ]);
  return { src: full.src, srcset: full.srcSet.attribute, width, height, thumb: thumb.src, alt };
}

export async function buildLightboxProjects(
  projects: Project[],
  categories: Map<string, Category>,
  locale: Locale,
  toolLabels: Map<string, string>,
  t: (key: UiKey) => string,
): Promise<LightboxProject[]> {
  const lightboxProjects = projects.filter((p) => categories.get(p.data.category.id)?.data.mode === 'lightbox');

  return Promise.all(
    lightboxProjects.map(async (p) => {
      const { data } = p;
      const pictures = [data.cover, ...data.gallery];
      const images = await Promise.all(pictures.map((pic) => lightboxImage(pic.src, l(pic.alt, locale))));
      const title = localize(data.title, locale);
      const links = [
        data.links.sketchfab && { label: t('link.sketchfab'), url: data.links.sketchfab },
        data.links.artstation && { label: t('link.artstation'), url: data.links.artstation },
        data.links.website && { label: t('link.website'), url: data.links.website },
      ].filter((x): x is { label: string; url: string } => Boolean(x));

      return {
        slug: p.id,
        title: title?.text ?? p.id,
        summary: l(data.summary, locale),
        lang: title?.isFallback ? title.lang : undefined,
        category: l(categories.get(data.category.id)?.data.name, locale),
        date: formatDate(data.date, locale, { year: 'numeric', month: 'long' }),
        tools: data.tools.map((tool) => toolLabels.get(tool.id) ?? tool.id),
        model: data.model && {
          url: projectFile(p.id, data.model.src).url,
          tris: data.model.tris,
          texture: data.model.texture,
          renderer: data.model.renderer,
        },
        links,
        images,
      } satisfies LightboxProject;
    }),
  );
}
