import { expect, test } from '@playwright/test';
import { closeWithEscape, firstDetailHref } from './helpers';

test.describe('Detay sayfası', () => {
  test('karttan açılır; başlık, numaralı bölümler ve künye görünür', async ({ page }) => {
    const href = await firstDetailHref(page);
    test.skip(!href, 'Detay modunda proje yok');

    await page.locator(`[data-project] h2 a[href="${href}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.project-body h2').first()).toBeVisible();
    await expect(page.locator('#spec-title')).toBeVisible();
  });

  test('önceki/sonraki proje navigasyonu çalışır', async ({ page }) => {
    const href = await firstDetailHref(page);
    test.skip(!href, 'Detay modunda proje yok');
    await page.goto(href!);

    const next = page.locator('[data-project-nav="next"]');
    test.skip((await next.count()) === 0, 'Aynı kategoride ikinci detay projesi yok');
    const nextHref = (await next.getAttribute('href'))!;
    await next.click();
    await expect(page).toHaveURL(new RegExp(`${nextHref}$`));
    await expect(page.locator('[data-project-nav="prev"]')).toHaveAttribute('href', href!);
  });

  test('galeri görseli tıklayınca sayfanın dilinde lightbox açılır', async ({ page }) => {
    const href = await firstDetailHref(page);
    test.skip(!href, 'Detay modunda proje yok');
    await page.goto(href!.replace('/en/', '/tr/'));
    const item = page.locator('a[data-gallery-item]').first();
    test.skip((await item.count()) === 0, 'Bu projede galeri yok');

    await item.click();
    await expect(page.getByRole('dialog', { name: 'Proje galerisi' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kapat/ })).toBeVisible();
    await closeWithEscape(page);
  });
});
