import { expect, test } from '@playwright/test';

test.describe('Hero pixel sahnesi', () => {
  test('dekoratif canvas çizilir; tema değişince gece/gündüz sahnesi değişir', async ({ page }) => {
    await page.goto('en/');
    const scene = page.locator('[data-hero-scene]');
    await expect(scene).toHaveAttribute('aria-hidden', 'true');
    await expect(scene).toHaveAttribute('data-ready', '');
    await expect(scene).toHaveAttribute('data-scene', 'night');

    await page.locator('[data-theme-toggle]').click();
    await expect(scene).toHaveAttribute('data-scene', 'day');
    await page.locator('[data-theme-toggle]').click();
    await expect(scene).toHaveAttribute('data-scene', 'night');
  });

  test('canvas boş değil ve sayfanın tamamını kaplamaz (metin ve butonlar tıklanabilir)', async ({ page }) => {
    await page.goto('en/');
    const scene = page.locator('[data-hero-scene]');
    await expect(scene).toHaveAttribute('data-ready', '');
    const painted = await scene.evaluate((c: HTMLCanvasElement) => {
      const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
      return n;
    });
    expect(painted).toBeGreaterThan(100);
    await expect(scene).toHaveCSS('pointer-events', 'none');

    await page.getByRole('link', { name: /see my projects/i }).click();
    await expect(page).toHaveURL(/#projects$/);
  });

  test('sahne tema renkleriyle çizilir (karakterin kapüşonlusu, zemin çizgisi)', async ({ page }) => {
    // Safari stil dosyası yüklenmeden script çalıştırınca renkler boş gelip gövde hiç çizilmiyordu.
    for (const path of ['en/', 'tr/']) {
      await page.goto(path);
      await page.waitForLoadState('load');
      const scene = page.locator('[data-hero-scene]');
      await expect(scene).toHaveAttribute('data-ready', '');
      for (const variable of ['--pink', '--teal']) {
        await expect
          .poll(() =>
            scene.evaluate((c: HTMLCanvasElement, name) => {
              const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
              const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
              const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
              let n = 0;
              for (let i = 0; i < data.length; i += 4) if (data[i] === r && data[i + 1] === g && data[i + 2] === b) n++;
              return n;
            }, variable),
            { message: `${path} sahnesinde ${variable} rengi yok` },
          )
          .toBeGreaterThan(5);
      }
    }
  });

  test('hareketi azalt tercihinde de sahne çizilir', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('tr/');
    await expect(page.locator('[data-hero-scene]')).toHaveAttribute('data-ready', '');
  });
});
