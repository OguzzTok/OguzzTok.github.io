/**
 * Playwright: derlenmiş siteyi (dist/) `astro preview` ile açıp gerçek tarayıcıda test eder.
 * Önce build gerekir:  npm run build && npm test
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4322; // dev sunucusu (4321) açıkken de çalışsın
// CI'da actions/configure-pages'in verdiği base ('' veya '/repo-adi') ile aynı
const base = `/${(process.env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
const baseURL = `http://localhost:${PORT}${base}`;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
