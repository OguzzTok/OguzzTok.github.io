/** Dil düğmesi: seçimi hatırlar, sayfadaki konumu (#bölüm, ?item=) korur. */
export const LANG_STORAGE_KEY = 'lang';

export function initLangSwitch() {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-lang-switch]');
    if (!link) return;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, link.dataset.langSwitch ?? '');
    } catch {
      // Hatırlanamazsa sorun değil; link yine çalışır.
    }
    const url = new URL(link.href);
    url.search = location.search;
    url.hash = location.hash;
    link.href = url.href;
  });
}
