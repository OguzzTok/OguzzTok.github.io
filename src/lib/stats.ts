/**
 * Ana sayfa sayaçları (src/data/stats.yaml). Değerler build sırasında hesaplanır.
 */
import type { CollectionEntry } from 'astro:content';
import { getCollectionInFileOrder } from './content';
import { l, type Locale } from './i18n';
import { getProjects, type Project } from './projects';

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export function computeStat(entry: CollectionEntry<'stats'>, projects: Project[], now = new Date()): number {
  const { data } = entry;
  switch (data.kind) {
    case 'manual':
      return data.value;
    case 'count':
      return projects.filter(
        (p) => (!data.status || p.data.status === data.status) && (!data.category || p.data.category.id === data.category.id),
      ).length;
    case 'yearsSince':
      return Math.max(0, now.getUTCFullYear() - data.year);
  }
}

export async function getStats(locale: Locale): Promise<Stat[]> {
  const [entries, projects] = await Promise.all([getCollectionInFileOrder('stats', 'stats.yaml'), getProjects()]);
  return entries.map((entry) => ({
    id: entry.id,
    value: computeStat(entry, projects),
    suffix: entry.data.suffix ?? '',
    label: l(entry.data.label, locale),
  }));
}
