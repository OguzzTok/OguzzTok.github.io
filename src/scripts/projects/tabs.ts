/**
 * Sekme linklerini ARIA tablist'e çevirir: ok tuşları, Home/End, otomatik seçim.
 * /projects/ sayfalarında (urlMode=push) adres çubuğunu günceller; geri tuşu sekmeyi geri alır.
 */
import { revealHorizontally } from '../dom';
import type { Explorer } from './explorer';

const isModifiedClick = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

export function initTabs(explorer: Explorer) {
  const { root } = explorer;
  const list = root.querySelector<HTMLElement>('[data-tablist]');
  const panel = root.querySelector<HTMLElement>('[data-project-grid]');
  if (!list || !panel) return;

  const tabs = [...list.querySelectorAll<HTMLAnchorElement>('a[data-tab]')];
  const pushUrl = root.dataset.urlMode === 'push';

  list.setAttribute('role', 'tablist');
  if (list.dataset.label) list.setAttribute('aria-label', list.dataset.label);
  panel.setAttribute('role', 'tabpanel');
  for (const tab of tabs) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    tab.removeAttribute('aria-current');
  }

  function select(id: string) {
    for (const tab of tabs) {
      const selected = tab.dataset.tab === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) {
        panel!.setAttribute('aria-labelledby', tab.id);
        revealHorizontally(list!.parentElement!, tab); // mobilde seçili sekme şeritte görünsün; sayfa kaymaz
      }
    }
  }

  function activate(tab: HTMLAnchorElement, { push }: { push: boolean }) {
    const id = tab.dataset.tab!;
    select(id);
    if (explorer.state.category !== id) explorer.update({ category: id, tag: null, tool: null });
    if (pushUrl) {
      if (push && location.pathname !== new URL(tab.href).pathname) history.pushState({ tab: id }, '', tab.href);
      if (tab.dataset.title) document.title = tab.dataset.title;
    }
  }

  list.addEventListener('click', (event) => {
    const tab = (event.target as Element).closest<HTMLAnchorElement>('a[data-tab]');
    if (!tab || isModifiedClick(event)) return; // Ctrl+tık: yeni sekmede açılsın
    event.preventDefault();
    activate(tab, { push: true });
  });

  list.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) return;
    const next = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    tabs[next]!.focus();
    activate(tabs[next]!, { push: true });
  });

  if (pushUrl) {
    window.addEventListener('popstate', () => {
      const tab = tabs.find((t) => new URL(t.href).pathname === location.pathname);
      if (tab) activate(tab, { push: false });
    });
  }

  select(explorer.state.category);
}
