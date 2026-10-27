/** Sayaçlar ekrana girince 0'dan son değere sayar. Azaltılmış hareket tercihinde hiç dokunulmaz. */
const DURATION = 1200;

export function initCounters() {
  const counters = [...document.querySelectorAll<HTMLElement>('[data-counter]')];
  if (counters.length === 0) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        animate(entry.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );

  for (const counter of counters) {
    counter.textContent = '0';
    observer.observe(counter);
  }
}

function animate(element: HTMLElement) {
  const target = Number(element.dataset.counter);
  const format = new Intl.NumberFormat(document.documentElement.lang);
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / DURATION);
    const eased = 1 - (1 - progress) ** 3; // yavaşlayarak dur
    element.textContent = format.format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
