/**
 * Ana sayfa bölümleri: sıra burada belirlenir. Header menüsü ve bölüm numaraları ("01 — Projeler") buradan gelir.
 */
import type { UiKey } from './i18n';

export const SECTIONS = [
  { id: 'projects', nav: 'nav.projects', title: 'section.projects' },
  { id: 'about', nav: 'nav.about', title: 'section.about' },
  { id: 'certificates', nav: 'nav.certificates', title: 'section.certificates' },
  { id: 'downloads', nav: 'nav.downloads', title: 'section.downloads' },
  { id: 'contact', nav: 'nav.contact', title: 'section.contact' },
] as const satisfies readonly { id: string; nav: UiKey; title: UiKey }[];

export type SectionId = (typeof SECTIONS)[number]['id'];

/** Bölüm numarası: 1'den başlar. */
export function sectionNumber(id: SectionId): number {
  return SECTIONS.findIndex((s) => s.id === id) + 1;
}
