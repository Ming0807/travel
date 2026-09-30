# Public attraction UI fixture

Uses the real attraction hero, filters, listing cards, gallery, facts panel and loading UI with synthetic attraction data. No database queries or certificate writes run in this fixture. The image adapter bypasses Next image optimization, so this validates layout and deferred DOM mounting, not real CDN transfer size or production Web Vitals.

Run `npx vite --config tests/visual/attractions/vite.config.ts`, then `node tests/visual/attractions/browser-qa.mjs`.

Checks 40 combinations of directory/detail/single-photo/loading UI at 320–1920px, search visibility, tablet input width, lazy listing images, deferred gallery images, native Escape close, reduced motion and horizontal overflow. Screenshots are saved to `output/playwright/attractions`.
