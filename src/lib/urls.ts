/**
 * Base uyumlu URL'ler. Sitede hiçbir iç link elle "/..." diye yazılmaz; hepsi buradan üretilir.
 * Böylece site `/` yerine `/repo-adi/` altında yayınlansa da linkler çalışır.
 */
import { isLocale, type Locale } from './i18n';

const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, '');

/** '' veya 'portfolio' gibi; baştaki/sondaki eğik çizgiler olmadan. */
const BASE = trimSlashes(import.meta.env.BASE_URL);

const hasExtension = (path: string) => /\.[a-z0-9]+$/i.test(path);

/** Kök göreli bir yola base ekler. Uzantısız yollar (sayfalar) eğik çizgiyle biter. */
export function withBase(path = ''): string {
  const clean = trimSlashes(path);
  const joined = '/' + [BASE, clean].filter(Boolean).join('/');
  if (joined === '/') return '/';
  return hasExtension(clean) ? joined : `${joined}/`;
}

/** pagePath('en', 'projects', 'games') → /en/projects/games/ */
export function pagePath(locale: Locale, ...segments: string[]): string {
  return withBase([locale, ...segments].join('/'));
}

/** Ana sayfadaki bir bölüme link: /en/#about */
export function sectionPath(locale: Locale, id: string): string {
  return `${pagePath(locale)}#${id}`;
}

/** Tarayıcı yolundan base'i çıkarır: /portfolio/en/x/ → en/x */
export function stripBase(pathname: string): string {
  const clean = trimSlashes(pathname);
  if (!BASE) return clean;
  return clean === BASE ? '' : clean.startsWith(`${BASE}/`) ? clean.slice(BASE.length + 1) : clean;
}

/** Aynı sayfanın diğer dildeki adresi. Her sayfa iki dilde de üretildiği için her zaman vardır. */
export function alternatePath(pathname: string, target: Locale): string {
  const segments = stripBase(pathname).split('/').filter(Boolean);
  if (isLocale(segments[0])) segments[0] = target;
  else segments.unshift(target);
  return withBase(segments.join('/'));
}

/** Mutlak adres (canonical, Open Graph, hreflang için). */
export function absoluteUrl(path: string): string {
  return new URL(path, import.meta.env.SITE).href;
}
