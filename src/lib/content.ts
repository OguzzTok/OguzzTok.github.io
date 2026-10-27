/**
 * Tekil veri dosyaları (src/data/*.yaml) için okuyucular.
 */
import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';
import { parse as parseYaml } from 'yaml';

// Astro, liste dosyalarındaki kayıtları id'ye göre sıralı döndürür. Sıranın anlamlı olduğu
// dosyalarda (stats, downloads) dosyadaki sırayı korumak için ham içeriği okuyoruz.
const rawDataFiles = import.meta.glob<string>('/src/data/*.yaml', { query: '?raw', import: 'default', eager: true });

/** Liste YAML dosyasındaki kayıtları dosyadaki sırayla döndürür. */
export async function getCollectionInFileOrder<C extends CollectionKey>(collection: C, file: string): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  const raw = rawDataFiles[`/src/data/${file}`];
  if (!raw) throw new Error(`src/data/${file} bulunamadı`);
  const order = (parseYaml(raw) as { id: string }[]).map((item) => String(item.id));
  return [...entries].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

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
