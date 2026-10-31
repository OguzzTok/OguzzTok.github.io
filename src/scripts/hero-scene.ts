/**
 * Ana sayfa girişindeki pixel sahne: gökyüzü, tepeler, sokak lambası ve imlece bakan karakter.
 * Gece/gündüz temaya göre çizilir (html[data-theme]). Dekoratiftir: canvas aria-hidden.
 *
 * - Karakterin başı ve gözleri imleci (dokunmatikte son dokunulan yeri) izler; tıklayınca zıplar.
 * - Hareketi azalt tercihinde: yıldız/bulut animasyonu ve zıplama yok, sadece imleç hareketinde yeniden çizilir.
 * - Sahne ekranda değilse veya sekme arka plandaysa çizim durur.
 */
type Scene = 'night' | 'day';

/** Deterministik rastgele (yıldız/tepe yerleri yeniden boyutlanınca zıplamasın). */
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

export function initHeroScene() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-scene]');
  const hero = canvas?.parentElement;
  const ctx = canvas?.getContext('2d');
  if (canvas && hero && ctx) setup(canvas, hero, ctx);
}

function setup(canvas: HTMLCanvasElement, hero: HTMLElement, ctx: CanvasRenderingContext2D) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let P = 6; // bir sahne pikseli kaç CSS pikseli
  let W = 0;
  let H = 0;
  let scene: Scene = 'night';
  let colors: Record<string, string> = {};
  let stars: [number, number, number][] = [];
  let mouse: { x: number; y: number } | null = null;
  let lastMove = 0;
  let jump = 0;
  let vy = 0;
  let running = false;
  let visible = true;

  const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function readTheme() {
    scene = document.documentElement.dataset.theme === 'light' ? 'day' : 'night';
    colors = {
      bg: css('--bg'),
      ground: css('--surface-2'),
      grass: css('--teal'),
      frame: css('--frame'),
      accent: css('--accent'),
      pink: css('--pink'),
      fg: css('--fg'),
      star: css('--muted'),
    };
    // Safari (WebKit) modül script'ini stil dosyası yüklenmeden çalıştırabilir: renkler boş gelir.
    // O durumda sayfa tamamen yüklenince renkleri yeniden oku ve sahneyi yeniden çiz.
    if (Object.values(colors).some((c) => !c)) {
      addEventListener(
        'load',
        () => {
          readTheme();
          requestDraw();
        },
        { once: true },
      );
    }
    canvas.dataset.scene = scene;
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    P = rect.width < 640 ? 5 : 7;
    W = Math.ceil(rect.width / P);
    H = Math.ceil(rect.height / P);
    canvas.width = W;
    canvas.height = H;
    const rnd = seeded(7);
    stars = Array.from({ length: Math.round((W * H) / 190) }, () => [Math.floor(rnd() * W), Math.floor(rnd() * (H - 30)), rnd()]);
    requestDraw();
  }

  const px = (x: number, y: number, w: number, h: number, color: string) => {
    if (!color) return; // geçersiz renk canvas'ta önceki rengi kullandırır; hiç çizmemek daha iyi
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };

  const disc = (cx: number, cy: number, r: number, color: string) => {
    for (let y = -Math.ceil(r); y <= r; y++)
      for (let x = -Math.ceil(r); x <= r; x++) if (x * x + y * y <= r * r) px(cx + x, cy + y, 1, 1, color);
  };

  /** Karakterin ve lambanın yeri: genişte sağda, dar ekranda metnin altında sağda. */
  const layout = () => {
    const ground = H - 12;
    const cx = Math.round(W * (W * P < 640 ? 0.6 : 0.7));
    return { ground, cx, lx: cx + 16 };
  };

  function drawSky(t: number) {
    if (scene === 'night') {
      for (const [x, y, k] of stars) {
        if (!reduce && Math.sin(t / 600 + k * 40) < -0.7) continue; // seyrek göz kırpma
        px(x, y, 1, 1, k > 0.85 ? colors.accent : colors.star);
      }
      // Hilal ay: dolu daire, üstüne kaydırılmış gökyüzü renginde daire
      disc(W - 16, 11, 5, colors.fg);
      disc(W - 13, 9, 4.2, colors.bg);
    } else {
      // Gündüz gökyüzü bantları + güneş + kayan bulutlar
      const bands = ['#bfe3f5', '#cbe8f4', '#d8edf1', '#e6f1ec'];
      const bh = Math.ceil((H - 12) / bands.length);
      bands.forEach((c, i) => px(0, i * bh, W, bh, c));
      const sx = W - 20, sy = 6;
      px(sx + 2, sy, 4, 8, colors.accent); px(sx, sy + 2, 8, 4, colors.accent); px(sx + 1, sy + 1, 6, 6, colors.accent);
      const drift = reduce ? 0 : t / 900;
      for (const [x0, y, w] of [[10, 10, 12], [W * 0.45, 6, 16], [W * 0.8, 16, 10]] as const) {
        const x = ((x0 + drift) % (W + 30)) - 15;
        px(x + 2, y, w - 4, 2, '#ffffff'); px(x, y + 2, w, 3, '#ffffff'); px(x + 3, y + 5, w - 6, 1, '#eef6fa');
      }
    }
  }

  function drawLand() {
    const { ground } = layout();
    const far = scene === 'night' ? '#1e1738' : '#b9d8a8';
    for (let x = 0; x < W; x++) {
      const h = 7 + Math.round(Math.sin(x / 9) * 2 + Math.sin(x / 23) * 4);
      px(x, ground - h, 1, h, far);
    }
    px(0, ground, W, H - ground, colors.ground);
    for (let x = 0; x < W; x += 2) px(x, ground, 1, 1, colors.grass);
  }

  function drawLamp() {
    const { ground, lx } = layout();
    const ly = ground - 30;
    if (scene === 'night') {
      // Dither'lı ışık konisi
      for (let y = ly + 5; y < ground; y++) {
        const half = Math.round(2 + (y - ly - 5) * 0.42);
        ctx.globalAlpha = 0.3 - ((y - ly) / 30) * 0.14;
        for (let x = -half; x <= half; x++) if ((x + y) % 2 === 0) px(lx + 7 + x, y, 1, 1, colors.accent);
      }
      ctx.globalAlpha = 0.6;
      px(lx - 6, ground, 26, 1, colors.accent);
      ctx.globalAlpha = 1;
    }
    px(lx, ly, 2, 30, colors.frame);
    px(lx, ly, 8, 2, colors.frame);
    px(lx + 5, ly + 2, 4, 3, scene === 'night' ? colors.accent : '#d9d2c3');
  }

  function drawCharacter(t: number) {
    const { ground, cx } = layout();
    if (vy || jump) {
      jump += vy;
      vy += 0.35;
      if (jump >= 0) {
        jump = 0;
        vy = 0;
      }
    }
    const bob = !reduce && Math.sin(t / 420) > 0.75 ? 1 : 0;
    const cy = ground - 20 + Math.round(jump) + bob;
    // İmleç yönü: kafa 1 piksel, gözbebeği 1 piksel kayar
    let dx = 0;
    let dy = 0;
    const idle = !mouse || (!reduce && t - lastMove > 5000);
    if (!idle && mouse) {
      dx = Math.sign(Math.round((mouse.x - (cx + 6)) / 10));
      dy = Math.max(-1, Math.min(1, Math.round((mouse.y - (cy + 5)) / 12)));
    } else if (!reduce) {
      dx = Math.round(Math.sin(t / 1700)); // kimse yokken etrafa bakınır
    }
    const skin = '#f2c49b', hair = '#3a2a1e', shoe = scene === 'night' ? '#efe9ff' : '#1d1730';
    px(cx + 2, cy + 11, 9, 7, colors.pink); // kapüşonlu
    px(cx + 1, cy + 12, 1, 4, colors.pink);
    px(cx + 11, cy + 12, 1, 4, colors.pink);
    px(cx + 3, cy + 18, 2, 2, shoe);
    px(cx + 8, cy + 18, 2, 2, shoe);
    const hx = cx + 1 + dx, hy = cy + (dy < 0 ? -1 : 0);
    px(hx + 1, hy, 9, 10, skin);
    px(hx, hy - 1, 11, 4, hair);
    px(hx, hy + 2, 1, 4, hair);
    px(hx + 10, hy + 2, 1, 4, hair);
    const blink = !reduce && t % 3600 < 140;
    for (const ex of [hx + 2, hx + 6]) {
      if (blink) {
        px(ex, hy + 5, 3, 1, hair);
        continue;
      }
      px(ex, hy + 4, 3, 3, '#ffffff');
      px(ex + 1 + dx, hy + 5 + dy, 1, 1, '#120e22');
    }
    px(hx + 4 + dx, hy + 8, 3, 1, '#c98f6e');
    // İmleç yakınsa ünlem
    if (mouse && !idle && Math.hypot(mouse.x - (cx + 6), mouse.y - (cy + 8)) < 22) {
      px(cx + 5, cy - 9, 2, 4, colors.accent);
      px(cx + 5, cy - 4, 2, 2, colors.accent);
    }
  }

  function draw(t: number) {
    ctx.clearRect(0, 0, W, H);
    drawSky(t);
    drawLand();
    drawLamp();
    drawCharacter(t);
    canvas.dataset.ready = '';
  }

  // --- Döngü: sadece görünürken ve hareket gerekiyorsa ---
  function loop(t: number) {
    draw(t);
    if (running) requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
  }
  function requestDraw() {
    if (!running) requestAnimationFrame(draw);
  }

  // --- Girdi ---
  const toScene = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / P, y: (e.clientY - r.top) / P };
  };
  addEventListener(
    'pointermove',
    (e) => {
      if (!visible) return;
      mouse = toScene(e);
      lastMove = performance.now();
      if (reduce) requestDraw();
    },
    { passive: true },
  );
  hero.addEventListener('pointerdown', (e) => {
    mouse = toScene(e);
    lastMove = performance.now();
    // Link/düğmeye tıklama zıplatmaz
    if ((e.target as Element).closest('a, button')) return;
    if (!reduce && jump === 0) vy = -3.2;
    requestDraw();
  });

  new ResizeObserver(resize).observe(hero);
  new MutationObserver(() => {
    readTheme();
    requestDraw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  readTheme();
  resize();
  start();
}
