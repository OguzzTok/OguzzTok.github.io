/**
 * Lightbox içindeki 3D görünüm. <model-viewer> (three.js içerir, büyük) sadece ilk açılışta indirilir.
 */
import type { LightboxLabels } from '../../lib/explorer';

export interface ModelView {
  readonly isOpen: boolean;
  close(): void;
}

interface Options {
  url: string;
  title: string;
  labels: LightboxLabels;
  onClose: () => void;
}

export function openModelView(host: HTMLElement, { url, title, labels, onClose }: Options): ModelView {
  let open = true;

  const overlay = document.createElement('div');
  overlay.className = 'lb-model';
  overlay.setAttribute('role', 'region');
  overlay.setAttribute('aria-label', title);

  const stage = document.createElement('div');
  stage.className = 'lb-model__stage';

  const status = document.createElement('p');
  status.className = 'lb-model__status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = labels['lightbox.loading3d'];

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lb-model__close';
  close.textContent = `← ${labels['lightbox.close3d']}`;
  close.addEventListener('click', onClose);

  overlay.append(stage, status, close);
  host.append(overlay);
  host.classList.add('lb-3d-open'); // oklar ve küçük resimler 3D'de gizlenir (lightbox.css)

  import('@google/model-viewer')
    .then(() => {
      if (!open) return;
      const viewer = document.createElement('model-viewer');
      viewer.setAttribute('src', url);
      viewer.setAttribute('alt', title);
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('auto-rotate', '');
      viewer.setAttribute('touch-action', 'none');
      viewer.setAttribute('shadow-intensity', '1');
      viewer.setAttribute('environment-image', 'neutral');
      viewer.setAttribute('interaction-prompt', 'none');
      viewer.addEventListener('load', () => (status.textContent = labels['lightbox.hint3d']));
      viewer.addEventListener('error', () => (status.textContent = labels['lightbox.error3d']));
      stage.append(viewer);
    })
    .catch(() => (status.textContent = labels['lightbox.error3d']));

  return {
    get isOpen() {
      return open;
    },
    close() {
      if (!open) return;
      open = false;
      overlay.remove();
      host.classList.remove('lb-3d-open');
    },
  };
}
