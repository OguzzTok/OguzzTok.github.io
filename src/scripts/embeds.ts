/**
 * Tıklayınca yüklenen içerikler: YouTube, itch.io (iframe) ve 3D model.
 * Sayfa ilk açıldığında hiçbiri yüklenmez; dış sitelere istek gitmez.
 */
import { mountModelViewer } from './model-viewer';

const isModifiedClick = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

export function initEmbeds() {
  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target || isModifiedClick(event)) return;

    const trigger = target.closest<HTMLElement>('[data-embed-trigger]');
    if (trigger) {
      event.preventDefault();
      activateIframe(trigger.closest<HTMLElement>('[data-embed]')!);
      return;
    }

    // "Fragmanı izle": sayfadaki fragmanı başlatır ve ona kaydırır
    const play = target.closest('[data-play-trailer]');
    const trailer = document.getElementById('trailer');
    if (play && trailer) {
      event.preventDefault();
      activateIframe(trailer);
      trailer.scrollIntoView({ block: 'center' });
      return;
    }

    const fullscreen = target.closest<HTMLElement>('[data-embed-fullscreen]');
    if (fullscreen) {
      const frame = fullscreen.closest('figure')?.querySelector('iframe');
      void frame?.requestFullscreen?.();
      return;
    }

    const modelTrigger = target.closest<HTMLElement>('[data-model-trigger]');
    if (modelTrigger) {
      event.preventDefault();
      activateModel(modelTrigger.closest<HTMLElement>('[data-model-embed]')!);
    }
  });
}

function activateIframe(container: HTMLElement) {
  if (container.querySelector('iframe')) return;
  const { embedSrc, embedTitle, embedAllow } = container.dataset;
  const frame = document.createElement('iframe');
  frame.src = embedSrc!;
  frame.title = embedTitle ?? '';
  frame.allow = embedAllow ?? '';
  frame.allowFullscreen = true;
  frame.className = 'absolute inset-0 size-full border-0';
  container.replaceChildren(frame);
  frame.focus();
  container.closest('figure')?.querySelector<HTMLElement>('[data-embed-fullscreen]')?.removeAttribute('hidden');
}

function activateModel(container: HTMLElement) {
  const { modelUrl, modelTitle, loading, ready, error } = container.dataset;
  container.querySelector('[data-model-trigger]')?.remove();
  void mountModelViewer(
    container.querySelector<HTMLElement>('[data-model-stage]')!,
    container.querySelector<HTMLElement>('[data-model-status]')!,
    modelUrl!,
    modelTitle ?? '',
    { loading: loading!, ready: ready!, error: error! },
  );
}
