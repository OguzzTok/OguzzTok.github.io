/**
 * Paylaşım görseli (Open Graph, 1200×630): ana sayfanın pixel sahnesinden, her dil için bir PNG.
 * WhatsApp/LinkedIn vb. ana sayfa ve kendi görseli olmayan sayfalar paylaşılınca bu görünür
 * (proje sayfaları kendi kapağını kullanır).
 *
 * Kullanım (önce build):  npm run build && npm run og
 * Çıktı: src/assets/og/og-en.png, og-tr.png → commit'le, sonra tekrar build.
 * Ne zaman: isim, üst başlık (site.yaml → eyebrow) veya hero tasarımı değişince.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const OUT = path.resolve('src/assets/og');
const PORT = 4333;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };

// dist/'i sunan küçük statik sunucu (astro preview'a gerek kalmasın)
const server = http.createServer(async (req, res) => {
  let file = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(PORT, resolve));

// Sadece sahne + üst başlık + isim; altta site adresi
const css = `
  html { scrollbar-gutter: auto !important; overflow: hidden !important; }
  body > a[href="#main"], header, footer, main > :not(section:first-child),
  section[aria-labelledby="hero-title"] > :not(.hero),
  .hero .relative > p:not(.eyebrow), .hero .relative > div { display: none !important; }
  .hero { height: 630px !important; min-height: 0 !important; padding-bottom: 0 !important; }
  .hero > .relative { padding-top: 150px !important; padding-left: 72px !important; margin: 0 !important; max-width: none !important; }
  .hero .eyebrow { font-size: 26px !important; margin-bottom: 22px !important; }
  .hero-title { font-size: 168px !important; text-shadow: 8px 8px 0 var(--pink) !important; }
  #og-url { position: absolute; left: 72px; bottom: 26px; z-index: 2; font: 600 26px 'Pixelify Sans Variable', monospace; color: var(--muted); }
`;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  for (const locale of ['en', 'tr']) {
    const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('theme', 'dark'));
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/${locale}/`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: css });
    await page.evaluate(() => {
      const url = document.createElement('p');
      url.id = 'og-url';
      url.textContent = location.hostname === 'localhost' ? 'oguzztok.github.io' : location.hostname;
      document.querySelector('.hero')?.append(url);
    });
    await page.evaluate(() => document.fonts.ready);
    // Karakter isme baksın (hareketi azalt açık: sadece imleç hareketinde yeniden çizer)
    await page.mouse.move(420, 300);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `og-${locale}.png`), clip: { x: 0, y: 0, width: 1200, height: 630 } });
    await context.close();
    console.log(`src/assets/og/og-${locale}.png`);
  }
} finally {
  await browser.close();
  server.close();
}
