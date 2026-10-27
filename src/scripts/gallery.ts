/**
 * Detay sayfasındaki galeriler: tıklanan görselden başlayan basit lightbox.
 * PhotoSwipe ilk tıklamada yüklenir (proje lightbox'ıyla aynı paket ve görünüm).
 */
const isModifiedClick = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

export function initGalleries() {
  document.addEventListener('click', async (event) => {
    const item = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-gallery-item]');
    if (!item || isModifiedClick(event)) return;
    event.preventDefault();

    const gallery = item.closest<HTMLElement>('[data-gallery]')!;
    const items = [...gallery.querySelectorAll<HTMLAnchorElement>('a[data-gallery-item]')];
    const labels = JSON.parse(gallery.dataset.labels ?? '{}') as Record<string, string>;
    const [{ default: PhotoSwipe }] = await Promise.all([
      import('photoswipe'),
      import('photoswipe/style.css'),
      import('./lightbox/lightbox.css'),
    ]);

    const pswp = new PhotoSwipe({
      dataSource: items.map((a) => ({
        src: a.href,
        srcset: a.dataset.srcset,
        width: Number(a.dataset.width),
        height: Number(a.dataset.height),
        alt: a.querySelector('img')?.alt ?? '',
        msrc: a.querySelector('img')?.currentSrc,
      })),
      index: items.indexOf(item),
      mainClass: 'pswp--portfolio pswp--gallery',
      bgOpacity: 1,
      showHideAnimationType: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'fade',
      closeTitle: labels.close,
      zoomTitle: labels.zoom,
      arrowPrevTitle: labels.prev,
      arrowNextTitle: labels.next,
      errorMsg: labels.error,
    });
    pswp.on('uiRegister', () => pswp.element?.setAttribute('aria-label', labels.dialog ?? ''));
    pswp.on('beforeOpen', () => document.documentElement.classList.add('lb-open'));
    pswp.on('openingAnimationEnd', () => pswp.element?.setAttribute('data-ready', ''));
    pswp.on('destroy', () => document.documentElement.classList.remove('lb-open'));
    pswp.init();
  });
}
