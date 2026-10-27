import { expect, test, type Page } from '@playwright/test';
import { closeWithEscape, lightboxData, waitForLightbox } from './helpers';

/** Görünen ilk lightbox kartı; yoksa test atlanır. */
async function firstLightboxCard(page: Page) {
  await page.goto('en/projects/');
  const trigger = page.locator('[data-project]:visible [data-lightbox-open]').first();
  test.skip((await trigger.count()) === 0, 'Lightbox modunda proje yok');
  return { trigger, slug: (await trigger.getAttribute('data-lightbox-open'))! };
}

/** Lightbox'taki konum: hangi proje, kaçıncı görsel. */
async function position(page: Page) {
  const item = new URL(page.url()).searchParams.get('item');
  const thumbs = page.locator('.lb-thumb');
  const index = (await thumbs.count()) ? await thumbs.evaluateAll((all) => all.findIndex((t) => t.getAttribute('aria-current') === 'true')) : 0;
  return `${item}#${index}`;
}

test.describe('Lightbox', () => {
  test('karta tıklayınca açılır, ?item= eklenir, ESC ile kapanır ve odak karta döner', async ({ page }) => {
    const { trigger, slug } = await firstLightboxCard(page);
    const projects = await lightboxData(page);
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`\\?item=${slug}$`));
    await expect(page.locator('.lb-title')).toHaveText(projects.find((p) => p.slug === slug)!.title);
    await expect(page.locator('html')).toHaveClass(/lb-open/); // arka plan kaydırması kilitli

    await closeWithEscape(page);
    expect(new URL(page.url()).searchParams.has('item')).toBe(false);
    await expect(trigger).toBeFocused();
    await expect(page.locator('html')).not.toHaveClass(/lb-open/);
  });

  test('ok tuşlarıyla görseller ve projeler arasında geçilir', async ({ page }) => {
    const { trigger } = await firstLightboxCard(page);
    const projects = await lightboxData(page);
    const visible = await page.locator('[data-project]:visible[data-mode="lightbox"]').count();
    const totalSlides = projects.slice(0, visible).reduce((n, p) => n + p.images.length, 0);
    test.skip(totalSlides < 2, 'Geçilecek ikinci görsel yok');

    await trigger.click();
    await waitForLightbox(page);
    const start = await position(page);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => position(page)).not.toBe(start);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => position(page)).toBe(start);
  });

  test('?item= linki sayfa açılınca doğrudan o projeyi açar', async ({ page }) => {
    await page.goto('en/projects/');
    const [project] = await lightboxData(page);
    test.skip(!project, 'Lightbox modunda proje yok');

    await page.goto(`en/projects/?item=${project!.slug}`);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.lb-title')).toHaveText(project!.title);
  });

  test('"3D Görüntüle" modeli sadece butona basınca yükler; ESC önce 3D\'yi kapatır', async ({ page }) => {
    await page.goto('en/projects/');
    const project = (await lightboxData(page)).find((p) => p.model);
    test.skip(!project, '3D modeli olan proje yok');

    await page.goto(`en/projects/?item=${project!.slug}`);
    await waitForLightbox(page);
    await expect(page.locator('model-viewer')).toHaveCount(0);

    await page.locator('[data-view3d]').click();
    const viewer = page.locator('model-viewer');
    await expect(viewer).toHaveAttribute('src', project!.model!.url, { timeout: 20_000 });
    await expect(page.locator('[data-view3d]')).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Escape');
    await expect(viewer).toHaveCount(0);
    await expect(page.getByRole('dialog')).toBeVisible();

    await closeWithEscape(page);
  });
});
