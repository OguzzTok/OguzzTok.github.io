/**
 * Proje lightbox'ı (PhotoSwipe üzerine). Bu modül sadece ilk açılışta yüklenir.
 *
 * Tüm görünür lightbox projelerinin görselleri tek bir slayt listesinde durur: ok tuşları
 * projenin görsellerini bitirince sıradaki projeye geçer. Altta o projenin küçük resimleri,
 * sağda (mobilde altta) bilgi paneli, varsa "3D Görüntüle".
 */
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import './lightbox.css';
import type { LightboxLabels } from '../../lib/explorer';
import type { LightboxProject } from '../../lib/lightbox';
import { openModelView, type ModelView } from './model-view';

export interface LightboxData {
  projects: LightboxProject[];
  labels: LightboxLabels;
}

interface Slide {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
  msrc: string;
  project: number;
  image: number;
}

/** CSS'teki panel genişliği ve kırılım noktasıyla aynı olmalı (lightbox.css). */
const DESKTOP = 1024;
const PANEL_WIDTH = 380;

export function openLightbox({ data, order, start }: { data: LightboxData; order: string[]; start: string }) {
  const bySlug = new Map(data.projects.map((p) => [p.slug, p]));
  if (!bySlug.has(start)) return;

  const projects = (order.includes(start) ? order : [start])
    .map((slug) => bySlug.get(slug))
    .filter((p): p is LightboxProject => Boolean(p));
  const slides: Slide[] = projects.flatMap((p, project) =>
    p.images.map((img, image) => ({ ...img, msrc: img.thumb, project, image })),
  );
  const firstSlideOf = (project: number) => slides.findIndex((s) => s.project === project);
  const L = data.labels;

  const pswp = new PhotoSwipe({
    dataSource: slides,
    index: firstSlideOf(projects.findIndex((p) => p.slug === start)),
    mainClass: 'pswp--portfolio',
    bgOpacity: 1,
    showHideAnimationType: 'fade',
    counter: false, // kendi sayacımız proje içindeki sırayı gösterir
    returnFocus: false, // kapanınca odağı son bakılan projenin kartına biz veriyoruz
    closeTitle: L['lightbox.close'],
    zoomTitle: L['lightbox.zoom'],
    arrowPrevTitle: L['lightbox.prev'],
    arrowNextTitle: L['lightbox.next'],
    errorMsg: L['lightbox.error'],
    paddingFn: (viewport) =>
      viewport.x >= DESKTOP
        ? { top: 64, bottom: 104, left: 72, right: PANEL_WIDTH + 72 }
        : { top: 56, bottom: 176, left: 8, right: 8 },
  });

  let info: HTMLElement | undefined;
  let thumbs: HTMLElement | undefined;
  let currentProject = -1;
  let model: ModelView | undefined;

  const current = () => slides[pswp.currIndex]!;

  // ---------- Bilgi paneli ----------

  function renderInfo(index: number) {
    const p = projects[index]!;
    info!.replaceChildren();

    const head = el('div', 'lb-head');
    head.append(el('p', 'lb-eyebrow', [p.category, p.date].join(' · ')));
    const title = el('h2', 'lb-title', p.title);
    if (p.lang) title.lang = p.lang;
    head.append(title, el('p', 'lb-counter'));

    const toggle = el('button', 'lb-toggle', L['lightbox.info']);
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'lb-body');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(expanded));
      info!.dataset.expanded = String(expanded);
    });
    head.append(toggle);

    const body = el('div', 'lb-body');
    body.id = 'lb-body';
    if (p.summary) body.append(el('p', 'lb-summary', p.summary));

    const meta = el('dl', 'lb-meta');
    const number = new Intl.NumberFormat(document.documentElement.lang);
    const rows: [string, string | undefined][] = [
      [L['meta.date'], p.date],
      [L['meta.tools'], p.tools.join(', ') || undefined],
      [L['meta.tris'], p.model?.tris ? number.format(p.model.tris) : undefined],
      [L['meta.texture'], p.model?.texture],
      [L['meta.renderer'], p.model?.renderer],
    ];
    for (const [label, value] of rows) {
      if (!value) continue;
      meta.append(el('dt', '', label), el('dd', '', value));
    }
    body.append(meta);

    const actions = el('div', 'lb-actions');
    if (p.model) {
      const button = el('button', 'lb-3d', L['lightbox.view3d']);
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.dataset.view3d = '';
      button.addEventListener('click', () => (model?.isOpen ? closeModel() : openModel(p, button)));
      actions.append(button);
    }
    for (const link of p.links) {
      const a = el('a', 'lb-link', `${link.label} ↗`);
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener';
      actions.append(a);
    }
    if (actions.childElementCount) body.append(actions);

    info!.append(head, body);
    info!.dataset.expanded = 'false';

    if (projects.length > 1) {
      const nav = el('div', 'lb-nav');
      for (const dir of [-1, 1] as const) {
        const target = (index + dir + projects.length) % projects.length;
        const button = el('button', 'lb-nav__btn');
        button.type = 'button';
        button.dataset.dir = String(dir);
        button.append(
          el('span', 'lb-nav__label', dir < 0 ? `← ${L['lightbox.prevProject']}` : `${L['lightbox.nextProject']} →`),
          el('span', 'lb-nav__title', projects[target]!.title),
        );
        button.addEventListener('click', () => pswp.goTo(firstSlideOf(target)));
        nav.append(button);
      }
      info!.append(nav);
    }
  }

  // ---------- Küçük resim şeridi ----------

  function renderThumbs(index: number) {
    const p = projects[index]!;
    thumbs!.replaceChildren();
    thumbs!.hidden = p.images.length < 2;
    p.images.forEach((img, i) => {
      const button = el('button', 'lb-thumb');
      button.type = 'button';
      button.setAttribute('aria-label', fill(L['lightbox.imageLabel'], i + 1, p.images.length));
      const image = el('img');
      image.src = img.thumb;
      image.alt = '';
      image.loading = 'lazy';
      button.append(image);
      button.addEventListener('click', () => pswp.goTo(firstSlideOf(index) + i));
      thumbs!.append(button);
    });
  }

  function onChange() {
    const slide = current();
    if (slide.project !== currentProject) {
      closeModel();
      currentProject = slide.project;
      renderInfo(slide.project);
      renderThumbs(slide.project);
      setItemParam(projects[slide.project]!.slug);
    }
    const total = projects[slide.project]!.images.length;
    info!.querySelector('.lb-counter')!.textContent = total > 1 ? `${slide.image + 1} / ${total}` : '';
    thumbs!.querySelectorAll('.lb-thumb').forEach((thumb, i) => {
      if (i === slide.image) {
        thumb.setAttribute('aria-current', 'true');
        thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } else thumb.removeAttribute('aria-current');
    });
  }

  // ---------- 3D ----------

  function openModel(p: LightboxProject, button: HTMLButtonElement) {
    model = openModelView(pswp.element!, { url: p.model!.url, title: p.title, labels: L, onClose: closeModel });
    button.textContent = L['lightbox.close3d'];
    button.setAttribute('aria-pressed', 'true');
  }

  function closeModel() {
    if (!model?.isOpen) return;
    model.close();
    const button = info?.querySelector<HTMLButtonElement>('[data-view3d]');
    if (button) {
      button.textContent = L['lightbox.view3d'];
      button.setAttribute('aria-pressed', 'false');
      button.focus();
    }
  }

  // ---------- PhotoSwipe olayları ----------

  pswp.on('uiRegister', () => {
    pswp.element?.setAttribute('aria-label', L['lightbox.dialog']);
    pswp.ui!.registerElement({
      name: 'project-info',
      appendTo: 'root',
      tagName: 'aside',
      className: 'lb-info',
      onInit: (element) => (info = element),
    });
    pswp.ui!.registerElement({
      name: 'thumbs',
      appendTo: 'root',
      className: 'lb-thumbs',
      onInit: (element) => {
        thumbs = element;
        element.setAttribute('role', 'group');
        element.setAttribute('aria-label', L['lightbox.thumbnails']);
      },
    });
  });

  pswp.on('change', onChange);

  // 3D açıkken klavye modele ait: PhotoSwipe ok/ESC tuşlarını işlemesin; ESC önce 3D'yi kapatır.
  pswp.on('keydown', (event) => {
    if (!model?.isOpen) return;
    event.preventDefault();
    if (event.originalEvent.key === 'Escape') closeModel();
  });

  pswp.on('beforeOpen', () => document.documentElement.classList.add('lb-open'));

  pswp.on('destroy', () => {
    model?.close();
    document.documentElement.classList.remove('lb-open');
    const slug = projects[currentProject]?.slug;
    setItemParam(null);
    if (slug) focusCard(slug);
  });

  pswp.init();
}

// ---------- Yardımcılar ----------

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const fill = (template: string, current: number, total: number) =>
  template.replace('{current}', String(current)).replace('{total}', String(total));

/** Adres çubuğunda ?item=slug: link paylaşılınca aynı proje açılır. Geçmişe kayıt eklemez. */
function setItemParam(slug: string | null) {
  const url = new URL(location.href);
  if (slug) url.searchParams.set('item', slug);
  else url.searchParams.delete('item');
  history.replaceState(history.state, '', url);
}

/** Kapanınca odak son bakılan projenin kartına döner (kart görünürse). */
function focusCard(slug: string) {
  const selector = `[data-lightbox-open="${CSS.escape(slug)}"]`;
  const trigger =
    document.querySelector<HTMLElement>(`[data-project]:not([hidden]) ${selector}`) ??
    document.querySelector<HTMLElement>(selector);
  if (!trigger) return;
  trigger.focus({ preventScroll: true });
  trigger.closest('[data-project]')?.scrollIntoView({ block: 'nearest' });
}
