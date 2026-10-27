/**
 * Etiket / araç filtresi. Her gruptan en fazla bir seçim; aynı çipe tekrar basmak kaldırır.
 * Sadece aktif sekmede geçen çipler görünür. Sekme değişince filtreler sıfırlanır (tabs.ts).
 */
import type { Explorer, ExplorerState } from './explorer';

type Kind = 'tag' | 'tool';

export function initFilters(explorer: Explorer) {
  const bar = explorer.root.querySelector<HTMLElement>('[data-filters]');
  if (!bar) return;

  const chips = [...bar.querySelectorAll<HTMLButtonElement>('button[data-filter]')];
  const groups = [...bar.querySelectorAll<HTMLElement>('[data-filter-group]')];
  const clear = bar.querySelector<HTMLButtonElement>('[data-filter-clear]');

  bar.addEventListener('click', (event) => {
    const chip = (event.target as Element).closest<HTMLButtonElement>('button[data-filter]');
    if (!chip) return;
    const kind = chip.dataset.filter as Kind;
    const value = chip.dataset.value!;
    explorer.update({ [kind]: explorer.state[kind] === value ? null : value });
  });

  clear?.addEventListener('click', () => {
    explorer.update({ tag: null, tool: null });
    chips.find((chip) => !chip.hidden)?.focus();
  });

  function sync(state: ExplorerState) {
    for (const chip of chips) {
      const kind = chip.dataset.filter as Kind;
      const categories = chip.dataset.categories?.split(' ') ?? [];
      chip.hidden = state.category !== 'all' && !categories.includes(state.category);
      chip.setAttribute('aria-pressed', String(state[kind] === chip.dataset.value));
    }
    for (const group of groups) group.hidden = !group.querySelector('button[data-filter]:not([hidden])');
    if (clear) clear.hidden = !state.tag && !state.tool;
    bar!.hidden = groups.every((group) => group.hidden);
  }

  explorer.onChange(sync);
  sync(explorer.state);
}
