/** robots.txt: her şey taranabilir; sitemap adresi base'e uygun üretilir. */
import type { APIRoute } from 'astro';
import { absoluteUrl, withBase } from '../lib/urls';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(withBase('sitemap-index.xml'))}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
