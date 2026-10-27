/**
 * Tekil veri dosyaları (src/data/*.yaml) için okuyucular.
 */
import { getCollection, getEntry } from 'astro:content';

export async function getSite() {
  const entry = await getEntry('site', 'main');
  if (!entry) throw new Error('src/data/site.yaml okunamadı');
  return entry.data;
}

export async function getAbout() {
  const entry = await getEntry('about', 'main');
  if (!entry) throw new Error('src/data/about.yaml okunamadı');
  return entry.data;
}

export async function getTools() {
  const tools = await getCollection('tools');
  return new Map(tools.map((t) => [t.id, t.data.label]));
}
