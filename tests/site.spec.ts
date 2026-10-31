import { expect, test } from '@playwright/test';
import { firstDetailHref } from './helpers';

test.describe('Dil', () => {
  test('kök adres ilk ziyarette İngilizceye yönlendirir, seçilen dili hatırlar', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.locator('a[data-lang-switch]').click();
    await expect(page).toHaveURL(/\/tr\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');

    await page.goto('');
    await expect(page).toHaveURL(/\/tr\/$/);
  });

  test('dil düğmesi aynı sayfanın diğer dildeki karşılığına gider', async ({ page }) => {
    const href = await firstDetailHref(page);
    test.skip(!href, 'Detay modunda proje yok');
    await page.goto(href!);
    await page.locator('a[data-lang-switch]').click();
    await expect(page).toHaveURL(new RegExp(href!.replace('/en/', '/tr/') + '$'));
  });

  test('çevirisi olmayan metin diğer dile düşer ve doğru lang özniteliği alır', async ({ page }) => {
    for (const locale of ['en', 'tr']) {
      await page.goto(`${locale}/projects/`);
      const langs = await page.locator('[data-fallback]').evaluateAll((els) => els.map((e) => e.getAttribute('lang')));
      for (const lang of langs) expect(lang).not.toBe(locale);
    }
    // Örnek içerikte en az bir fallback olduğu sürece bu kontrol anlamlı; yoksa sadece yapı doğrulanır.
  });

  test('hreflang alternatifleri iki dili de gösterir', async ({ page }) => {
    await page.goto('en/projects/');
    await expect(page.locator('link[rel="alternate"][hreflang="tr"]')).toHaveAttribute('href', /\/tr\/projects\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/projects\/$/);
  });
});

test.describe('Tema', () => {
  test('varsayılan koyu; düğme açık temaya geçirir ve tercih hatırlanır', async ({ page }) => {
    await page.goto('en/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('İletişim', () => {
  test('e-posta kopyala düğmesi adresi panoya kopyalar', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('en/#contact');
    const email = (await page.locator('[data-email]').textContent())!.trim();
    await expect(page.locator('[data-email]')).toHaveAttribute('href', `mailto:${email}`);

    // Ad yerine değişmeyen özellikle bul: tıklayınca butonun adı "Copied" olur
    const button = page.locator(`button[data-copy="${email}"]`);
    await expect(button).toHaveAccessibleName(/copy email/i);
    await button.click();
    await expect(button).toContainText(/copied/i);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
  });
});

test.describe('404 ve SEO dosyaları', () => {
  test('bulunamayan adres iki dilli 404 sayfasını gösterir', async ({ page }) => {
    const response = await page.goto('bu-sayfa-yok/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sayfa bulunamadı' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('paylaşım görseli: ana sayfada dilin pixel görseli, proje sayfasında projenin kapağı', async ({ page, request }) => {
    for (const locale of ['en', 'tr']) {
      await page.goto(`${locale}/`);
      const og = page.locator('meta[property="og:image"]');
      await expect(og).toHaveAttribute('content', new RegExp(`/og-${locale}\\..*\\.png$`));
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
      // Mutlak adres sitenin kendi alan adını gösterir; dosyanın kendisi build çıktısında var mı?
      const file = new URL((await og.getAttribute('content'))!).pathname; // base yolunu zaten içerir
      expect((await request.get(new URL(file, page.url()).href)).ok(), `${file} yok`).toBe(true);
    }

    const href = await firstDetailHref(page);
    test.skip(!href, 'Detay modunda proje yok');
    await page.goto(href!);
    await expect(page.locator('meta[property="og:image"]')).not.toHaveAttribute('content', /\/og-(en|tr)\./);
  });

  test('robots.txt ve sitemap erişilebilir', async ({ request }) => {
    const robots = await request.get('robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('sitemap-index.xml');
    expect((await request.get('sitemap-index.xml')).ok()).toBe(true);
  });
});

test.describe('Sayfa açılışı', () => {
  test('sayfa açılınca kendiliğinden kaymaz (sekme çubuğu sayfayı aşağı çekmez)', async ({ page }) => {
    for (const path of ['en/', 'tr/', 'en/projects/']) {
      await page.goto(path);
      await page.waitForLoadState('load');
      expect(await page.evaluate(() => scrollY), `${path} açılışta kaydı`).toBe(0);
    }
  });
});

test.describe('Mobil düzen', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('hiçbir sayfa yatay taşmaz', async ({ page }) => {
    const pages = ['en/', 'tr/', 'en/projects/', 'tr/projects/'];
    const detail = await firstDetailHref(page);
    if (detail) pages.push(detail);

    for (const path of pages) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} yatay taşıyor`).toBeLessThanOrEqual(0);
    }
  });
});
