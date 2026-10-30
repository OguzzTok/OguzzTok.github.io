/**
 * Test yardımcıları. Testler içerikten bağımsızdır: beklenen sayıları sayfadaki verilerden okur,
 * uygun içerik yoksa (ör. hiç 3D modelli proje yoksa) ilgili test atlanır.
 * Adresler baştaki "/" olmadan yazılır ki base yolu (BASE_PATH) korunsun: page.goto('en/projects/').
 */
import { expect, type Page } from '@playwright/test';

/**
 * Lightbox'ın açılış animasyonunun bitmesini bekler. PhotoSwipe animasyon sürerken
 * ok/ESC tuşlarını yok sayar; script bitince kök elemana data-ready ekler.
 */
export async function waitForLightbox(page: Page) {
  await expect(page.locator('.pswp[data-ready]')).toBeVisible();
}

/** Lightbox'ı ESC ile kapatır ve kapandığını doğrular. */
export async function closeWithEscape(page: Page) {
  await waitForLightbox(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
}

export interface LightboxProjectData {
  slug: string;
  title: string;
  images: unknown[];
  links: { label: string; url: string }[];
  model?: { url: string };
}

/** Sayfaya gömülü lightbox verisi (lib/lightbox.ts). */
export async function lightboxData(page: Page): Promise<LightboxProjectData[]> {
  const raw = await page.locator('[data-lightbox-data]').first().textContent();
  return raw ? (JSON.parse(raw).projects as LightboxProjectData[]) : [];
}

/** Görünen kartların slug'ları (sıralı). */
export function visibleSlugs(page: Page): Promise<string[]> {
  return page.locator('[data-project]:visible').evaluateAll((cards) => cards.map((c) => (c as HTMLElement).dataset.slug!));
}

/** /en/projects/ sayfasındaki detail modundaki ilk projenin adresi (yoksa undefined). */
export async function firstDetailHref(page: Page): Promise<string | undefined> {
  await page.goto('en/projects/');
  const link = page.locator('[data-project][data-mode="detail"] h2 a').first();
  return (await link.count()) ? ((await link.getAttribute('href')) ?? undefined) : undefined;
}
