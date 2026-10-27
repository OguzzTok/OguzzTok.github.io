/** Tema düğmesi. İlk tema <head>'deki inline script ile uygulanır; burası sadece değiştirir ve hatırlar. */
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function sync() {
  const isLight = current() === 'light';
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(isLight));
  });
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
}

function setTheme(theme: Theme) {
  const root = document.documentElement;
  // Geçiş animasyonları tema değişirken renkleri yarım bırakmasın diye bir kareliğine kapatılır.
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Gizli sekme vb.: tercih hatırlanmaz ama tema yine değişir.
  }
  sync();
}

export function initThemeToggle() {
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest('[data-theme-toggle]');
    if (button) setTheme(current() === 'light' ? 'dark' : 'light');
  });
  sync();
}
