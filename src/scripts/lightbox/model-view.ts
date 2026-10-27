/**
 * Lightbox içindeki 3D görünüm katmanı. Modeli yükleyen kısım ortak: scripts/model-viewer.ts.
 */
import type { LightboxLabels } from '../../lib/explorer';
import { mountModelViewer } from '../model-viewer';

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

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lb-model__close';
  close.textContent = `← ${labels['lightbox.close3d']}`;
  close.addEventListener('click', onClose);

  overlay.append(stage, status, close);
  host.append(overlay);
  host.classList.add('lb-3d-open'); // oklar ve küçük resimler 3D'de gizlenir (lightbox.css)

  const text = { loading: labels['lightbox.loading3d'], ready: labels['lightbox.hint3d'], error: labels['lightbox.error3d'] };
  void mountModelViewer(stage, status, url, title, text, 'none');

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
