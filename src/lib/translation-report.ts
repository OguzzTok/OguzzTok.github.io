/**
 * Build sırasında çevirisi eksik içerikleri terminale yazar. Hata değil, uyarı: build devam eder.
 * İçerikteki tüm {en, tr} alanlarını otomatik bulur; yeni bir alan eklendiğinde burada değişiklik gerekmez.
 */
import { getCollection, type CollectionKey } from 'astro:content';
import { LOCALES } from './i18n';
import { getCategories, getProjects } from './projects';

type Issue = { where: string; detail: string };

const isLocalizedObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  !(v instanceof Date) &&
  Object.keys(v).length > 0 &&
  Object.keys(v).every((k) => (LOCALES as readonly string[]).includes(k));

/** Nesnenin içinde dolaşıp tek dili dolu olan {en, tr} alanlarını bulur. */
function findMissing(value: unknown, path: string, out: string[]) {
  if (isLocalizedObject(value)) {
    const filled = LOCALES.filter((l) => typeof value[l] === 'string' && (value[l] as string).trim());
    if (filled.length > 0 && filled.length < LOCALES.length) {
      const missing = LOCALES.filter((l) => !filled.includes(l));
      out.push(`${path || '(kök)'}.${missing.join(',')}`);
    }
    return;
  }
  if (Array.isArray(value)) value.forEach((item, i) => findMissing(item, `${path}[${i}]`, out));
  else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    for (const [key, child] of Object.entries(value)) {
      // Görsel nesneleri (src: ImageMetadata) atla
      if (key === 'src') continue;
      findMissing(child, path ? `${path}.${key}` : key, out);
    }
  }
}

async function collectIssues(): Promise<Issue[]> {
  const issues: Issue[] = [];
  const add = (where: string, data: unknown) => {
    const found: string[] = [];
    findMissing(data, '', found);
    for (const detail of found) issues.push({ where, detail });
  };

  const projects = await getProjects();
  const texts = new Set((await getCollection('projectTexts')).map((t) => t.id));
  const detailCategories = new Set((await getCategories()).filter((c) => c.data.mode === 'detail').map((c) => c.id));

  for (const p of projects) {
    add(`projects/${p.id}`, p.data);
    if (detailCategories.has(p.data.category.id)) {
      for (const locale of LOCALES) {
        if (!texts.has(`${p.id}/${locale}`)) issues.push({ where: `projects/${p.id}`, detail: `${locale}.md yok` });
      }
    }
  }

  const others: CollectionKey[] = ['categories', 'certificates', 'site', 'about', 'stats', 'downloads'];
  for (const name of others) {
    for (const entry of await getCollection(name)) add(`${name}/${entry.id}`, entry.data);
  }
  return issues;
}

const flag = '__translationReportPrinted';

/** Süreç başına bir kez yazdırır (dev sunucusunda da her istekte tekrar etmez). */
export async function printTranslationReport() {
  const g = globalThis as Record<string, unknown>;
  if (g[flag]) return;
  g[flag] = true;

  const issues = await collectIssues();
  if (issues.length === 0) {
    console.info('\n[çeviri] Tüm içerik iki dilde de tam. ✓\n');
    return;
  }
  const width = Math.max(...issues.map((i) => i.where.length));
  const lines = issues.map((i) => `  ${i.where.padEnd(width)}  ${i.detail}`);
  console.warn(
    `\n[çeviri] ${issues.length} eksik çeviri (diğer dile düşülüyor):\n${lines.join('\n')}\n`,
  );
}
