/**
 * Sayfadaki proje gezginlerini başlatır. Lightbox kodu (PhotoSwipe) sadece ilk kullanımda yüklenir.
 */
import { Explorer } from './explorer';
import { initFilters } from './filters';
import { initTabs } from './tabs';

const isModifiedClick = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

export function initProjectExplorers() {
  document.querySelectorAll<HTMLElement>('[data-explorer]').forEach((root) => {
    const explorer = new Explorer(root);
    initTabs(explorer);
    initFilters(explorer);
    initLightboxTriggers(explorer);
  });
}

function initLightboxTriggers(explorer: Explorer) {
  const dataElement = explorer.root.querySelector<HTMLScriptElement>('[data-lightbox-data]');
  if (!dataElement) return;

  explorer.root.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLElement>('[data-lightbox-open]');
    if (!trigger || isModifiedClick(event)) return;
    event.preventDefault();
    void open(explorer, dataElement, trigger.dataset.lightboxOpen!);
  });

  // Paylaşılan link: /projects/models/?item=lowpoly-crate → doğrudan lightbox açılır
  const item = new URLSearchParams(location.search).get('item');
  if (item) void open(explorer, dataElement, item);
}

async function open(explorer: Explorer, dataElement: HTMLScriptElement, slug: string) {
  // Lightbox'ta gezinme sırası: görünen kartlardaki lightbox projeleri (aktif sekme + filtreler)
  const order = explorer
    .visibleCards()
    .filter((card) => card.dataset.mode === 'lightbox')
    .map((card) => card.dataset.slug!);
  const { openLightbox } = await import('../lightbox');
  openLightbox({ data: JSON.parse(dataElement.textContent ?? '{}'), order, start: slug });
}
