/**
 * Proje gezgininin durumu (aktif sekme + filtreler) ve kartların görünürlüğü.
 * Sekmeler ve filtreler durumu buradan değiştirir; kartları sadece burası gösterir/gizler.
 */
export interface ExplorerState {
  category: string;
  tag: string | null;
  tool: string | null;
}

type Listener = (state: ExplorerState) => void;

const words = (value: string | undefined) => (value ? value.split(' ') : []);

export class Explorer {
  readonly root: HTMLElement;
  readonly cards: HTMLElement[];
  state: ExplorerState;
  private readonly listeners: Listener[] = [];
  private readonly results: HTMLElement | null;
  private readonly empty: HTMLElement | null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.cards = [...root.querySelectorAll<HTMLElement>('[data-project]')];
    this.results = root.querySelector('[data-results]');
    this.empty = root.querySelector('[data-empty]');
    this.state = { category: root.dataset.active ?? 'all', tag: null, tool: null };
  }

  matches(card: HTMLElement, { category, tag, tool } = this.state): boolean {
    if (category !== 'all' && card.dataset.category !== category) return false;
    if (tag && !words(card.dataset.tags).includes(tag)) return false;
    if (tool && !words(card.dataset.tools).includes(tool)) return false;
    return true;
  }

  visibleCards(): HTMLElement[] {
    return this.cards.filter((card) => !card.hidden);
  }

  onChange(listener: Listener) {
    this.listeners.push(listener);
  }

  update(patch: Partial<ExplorerState>) {
    // Durum hemen değişir; sadece kartların yer değiştirmesi animasyonlu (geçiş bir kare sonra çalışır).
    this.state = { ...this.state, ...patch };
    withTransition(this.cards, () => this.render());
    this.listeners.forEach((listener) => listener(this.state));
  }

  private render() {
    let count = 0;
    for (const card of this.cards) {
      const show = this.matches(card);
      card.hidden = !show;
      if (show) count++;
    }
    if (this.empty) this.empty.hidden = count > 0;
    if (this.results) {
      const template = (count === 1 ? this.results.dataset.one : this.results.dataset.other) ?? '{count}';
      this.results.textContent = template.replace('{count}', String(count));
    }
  }
}

/** Kartlar yer değiştirirken yumuşak geçiş (View Transition API). Desteklenmiyorsa veya hareket azaltılmışsa anında. */
function withTransition(cards: HTMLElement[], update: () => void) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion) {
    update();
    return;
  }
  // İsimler sadece geçiş süresince verilir; sayfalar arası geçişi etkilemesin.
  cards.forEach((card) => (card.style.viewTransitionName = `card-${card.dataset.slug}`));
  const transition = document.startViewTransition(update);
  transition.finished.finally(() => cards.forEach((card) => (card.style.viewTransitionName = '')));
}
