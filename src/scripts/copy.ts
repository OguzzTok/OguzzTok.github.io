/** Kopyala butonları (kod blokları, e-posta). Etiket kısa süreliğine "Kopyalandı" olur; ekran okuyucuya da duyurulur. */
export function initCopyButtons() {
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-copy-idle]');
    if (!button) return;

    const { copy, copyTarget } = button.dataset;
    const text = copy ?? (copyTarget ? document.querySelector(copyTarget)?.textContent : null) ?? '';
    const label = button.querySelector('[data-copy-label]');
    const ok = await writeClipboard(text.trim());
    if (!label) return;
    label.textContent = (ok ? button.dataset.copyDone : button.dataset.copyFailed) ?? '';
    button.dataset.copyState = ok ? 'done' : 'failed';
    announce(label.textContent);
    window.setTimeout(() => {
      label.textContent = button.dataset.copyIdle ?? '';
      delete button.dataset.copyState;
    }, 2000);
  });
}

/** Önce Clipboard API; izin yoksa (iframe, eski tarayıcı) gizli textarea + execCommand yedeği. */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

/** Ekran okuyucu için tek, sayfa genelinde canlı bölge. */
function announce(message: string) {
  let region = document.getElementById('copy-status');
  if (!region) {
    region = document.createElement('div');
    region.id = 'copy-status';
    region.className = 'sr-only';
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  region.textContent = message;
}
