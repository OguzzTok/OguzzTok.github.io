// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Repo `OguzzTok.github.io` olduğu için site kök dizinde yayınlanır.
// Başka bir repo adına taşınırsa: BASE_PATH=/repo-adi npm run build
const SITE = 'https://oguzztok.github.io';
const BASE = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory' },

  i18n: {
    locales: ['en', 'tr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      // Kök `/` sayfasını kendimiz yazıyoruz (src/pages/index.astro): kayıtlı dil tercihine bakar.
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', tr: 'tr' } },
      // Kök yönlendirme sayfası sitemap'e girmez.
      filter: (page) => new URL(page).pathname !== new URL(BASE, SITE).pathname,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
