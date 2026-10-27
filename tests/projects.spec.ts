import { expect, test } from '@playwright/test';
import { visibleSlugs } from './helpers';

test.describe('Proje sekmeleri', () => {
  test('her sekme kendi sayısı kadar kart gösterir ve adresi günceller', async ({ page }) => {
    await page.goto('en/projects/');
    const tabs = page.getByRole('tab');
    const total = await tabs.count();
    test.skip(total < 2, 'Projesi olan kategori yok');

    for (let i = 0; i < total; i++) {
      const tab = tabs.nth(i);
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      const expected = Number(await tab.locator('[data-tab-count]').textContent());
      await expect(page.locator('[data-project]:visible')).toHaveCount(expected);
      const href = (await tab.getAttribute('href'))!;
      expect(new URL(page.url()).pathname).toBe(href);

      // Kartlar gerçekten bu sekmeye ait mi?
      const category = await tab.getAttribute('data-tab');
      if (category !== 'all') {
        const categories = await page.locator('[data-project]:visible').evaluateAll((cards) => cards.map((c) => (c as HTMLElement).dataset.category));
        expect(new Set(categories)).toEqual(new Set([category]));
      }
    }
  });

  test('klavyeyle gezilebilir (ok tuşları, Home/End) ve geri tuşu sekmeyi geri alır', async ({ page }) => {
    await page.goto('en/projects/');
    const tabs = page.getByRole('tab');
    test.skip((await tabs.count()) < 3, 'Klavye testi için en az iki kategori gerekli');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    const secondUrl = page.url();

    await page.keyboard.press('End');
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');

    await page.goBack();
    await expect(page).toHaveURL(secondUrl);
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('ana sayfada sekme değişince adres değişmez', async ({ page }) => {
    await page.goto('en/');
    const url = page.url();
    test.skip((await page.getByRole('tab').count()) < 2, 'Projesi olan kategori yok');
    await page.getByRole('tab').nth(1).click();
    await expect(page.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
    expect(page.url()).toBe(url);
  });
});

test.describe('Filtreler', () => {
  test('etiket/araç filtresi kartları süzer, sayaç ve temizle çalışır', async ({ page }) => {
    await page.goto('en/projects/');
    const allCount = (await visibleSlugs(page)).length;
    const chip = page.locator('button[data-filter]:visible').first();
    test.skip((await chip.count()) === 0, 'Filtrelenecek etiket/araç yok');

    const kind = (await chip.getAttribute('data-filter'))!;
    const value = (await chip.getAttribute('data-value'))!;
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    const attribute = kind === 'tag' ? 'tags' : 'tools';
    await expect
      .poll(async () =>
        page.locator('[data-project]:visible').evaluateAll(
          (cards, [attr, val]) => cards.every((c) => ((c as HTMLElement).dataset[attr!] ?? '').split(' ').includes(val!)),
          [attribute, value],
        ),
      )
      .toBe(true);
    const filtered = (await visibleSlugs(page)).length;
    await expect(page.locator('[data-results]')).toContainText(String(filtered));

    await page.locator('[data-filter-clear]').click();
    await expect(page.locator('[data-project]:visible')).toHaveCount(allCount);
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  test('hiçbir projeye uymayan filtre kombinasyonunda boş mesajı görünür', async ({ page }) => {
    await page.goto('en/projects/');
    // Ortak projesi olmayan bir etiket + araç çifti bul
    const pair = await page.evaluate(() => {
      const cards = [...document.querySelectorAll<HTMLElement>('[data-project]')];
      const tags = [...document.querySelectorAll<HTMLElement>('button[data-filter="tag"]')].map((b) => b.dataset.value!);
      const tools = [...document.querySelectorAll<HTMLElement>('button[data-filter="tool"]')].map((b) => b.dataset.value!);
      for (const tag of tags)
        for (const tool of tools)
          if (!cards.some((c) => c.dataset.tags!.split(' ').includes(tag) && c.dataset.tools!.split(' ').includes(tool))) return { tag, tool };
      return null;
    });
    test.skip(!pair, 'Her etiket/araç çifti en az bir projede geçiyor');

    await page.locator(`button[data-filter="tag"][data-value="${pair!.tag}"]`).click();
    await page.locator(`button[data-filter="tool"][data-value="${pair!.tool}"]`).click();
    await expect(page.locator('[data-project]:visible')).toHaveCount(0);
    await expect(page.locator('[data-empty]')).toBeVisible();
  });
});

test.describe('JS kapalıyken', () => {
  test.use({ javaScriptEnabled: false });

  test('kategori sayfası sadece o kategorinin kartlarını gösterir; lightbox kartı büyük görsele linktir', async ({ page }) => {
    await page.goto('en/projects/');
    const categories = await page.locator('[data-tab]').evaluateAll((tabs) =>
      tabs.map((t) => ({ id: (t as HTMLElement).dataset.tab!, href: t.getAttribute('href')! })).filter((t) => t.id !== 'all'),
    );
    for (const { id, href } of categories) {
      await page.goto(href); // sayfadaki href'ler base yolunu zaten içerir
      const cats = await page.locator('[data-project]:visible').evaluateAll((cards) => cards.map((c) => (c as HTMLElement).dataset.category));
      expect(cats.length).toBeGreaterThan(0);
      expect(new Set(cats)).toEqual(new Set([id]));
    }

    const lightboxLink = page.locator('[data-lightbox-open]').first();
    if (await lightboxLink.count()) expect(await lightboxLink.getAttribute('href')).toMatch(/\.(webp|jpe?g|png)$/);
  });
});
