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

  test('hareketi azalt tercihinde de sahne çizilir', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('tr/');
    await expect(page.locator('[data-hero-scene]')).toHaveAttribute('data-ready', '');
  });
});
