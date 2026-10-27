/**
 * <model-viewer> oluşturucu. Paket (three.js dahil ~1 MB) sadece ilk çağrıda indirilir.
 * Lightbox'taki "3D Görüntüle" ve detay sayfasındaki model bloğu bunu kullanır.
 */
let loading: Promise<unknown> | undefined;

export interface ModelStatus {
  loading: string;
  ready: string;
  error: string;
}

/**
 * Modeli `stage` içine yerleştirir; durum metinlerini `status` elemanına yazar.
 * touchAction: sayfa içinde 'pan-y' (dikey kaydırma çalışsın), tam ekran lightbox'ta 'none'.
 */
export async function mountModelViewer(
  stage: HTMLElement,
  status: HTMLElement,
  url: string,
  title: string,
  text: ModelStatus,
  touchAction: 'pan-y' | 'none' = 'pan-y',
) {
  status.textContent = text.loading;
  try {
    loading ??= import('@google/model-viewer');
    await loading;
  } catch {
    status.textContent = text.error;
    return;
  }
  if (!stage.isConnected) return; // kullanıcı beklerken kapattıysa

  const viewer = document.createElement('model-viewer');
  viewer.setAttribute('src', url);
  viewer.setAttribute('alt', title);
  viewer.setAttribute('camera-controls', '');
  viewer.setAttribute('auto-rotate', '');
  viewer.setAttribute('touch-action', touchAction);
  viewer.setAttribute('shadow-intensity', '1');
  viewer.setAttribute('environment-image', 'neutral');
  viewer.setAttribute('interaction-prompt', 'none');
  viewer.style.width = '100%';
  viewer.style.height = '100%';
  viewer.addEventListener('load', () => (status.textContent = text.ready));
  viewer.addEventListener('error', () => (status.textContent = text.error));
  stage.append(viewer);
}
