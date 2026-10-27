/**
 * Görsel olmayan dosyalar (.glb, .pdf, .zip, kod parçaları): build'de yayınlanan URL'leri ve boyutları.
 * Görseller Astro'nun image pipeline'ından geçer; burada değil.
 */
import { readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

// Vite bu dosyaları build çıktısına hash'li adla kopyalar ve URL'lerini verir.
const projectFiles = import.meta.glob<string>('/src/content/projects/*/**/*.{glb,gltf,pdf,zip}', {
  query: '?url',
  import: 'default',
  eager: true,
});
const downloadFiles = import.meta.glob<string>('/src/data/downloads/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
});

export interface PublishedFile {
  url: string;
  name: string;
  bytes: number;
}

const toKey = (...parts: string[]) => '/' + join(...parts).replaceAll('\\', '/').replace(/\/\.\//g, '/');

function publish(map: Record<string, string>, key: string, hint: string): PublishedFile {
  const url = map[key];
  if (!url) throw new Error(`Dosya bulunamadı: ${key.slice(1)} (${hint})`);
  return { url, name: basename(key), bytes: statSync(join(process.cwd(), key)).size };
}

/** Proje klasöründeki bir dosya: projectFile('lowpoly-crate', './model.glb') */
export function projectFile(slug: string, relativePath: string): PublishedFile {
  return publish(projectFiles, toKey('src/content/projects', slug, relativePath), `${slug}/index.md`);
}

/** İndirmeler bölümündeki PDF: downloadFile('cv-en.pdf') */
export function downloadFile(fileName: string): PublishedFile {
  return publish(downloadFiles, toKey('src/data/downloads', fileName), 'src/data/downloads.yaml');
}

/** Kod bloğu için dosya içeriği (build sırasında okunur). */
export function projectSource(slug: string, relativePath: string): string {
  return readFileSync(join(process.cwd(), 'src/content/projects', slug, relativePath), 'utf-8');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}
