# Home experience review fixture

Run `npx vite --config tests/visual/home-experience/vite.config.ts`, open
`http://127.0.0.1:4192`, then run
`node tests/visual/home-experience/browser-qa.mjs`.

Uses the actual `HomepageEditorial`, motion enhancement, loading skeleton,
lazy route explorer and Leaflet map. All tourism records, coordinates and map
responses are synthetic. The Vite middleware serves only three fixture route APIs;
browser checks intercept map tiles with synthetic SVG tiles. No Supabase, production
API or external tile request is made. No mutations are performed.

The image wrapper reuses the routes fixture and maps Next.js `preload` to eager,
high-priority image loading. This verifies markup and lazy-map behavior rather than
Next.js image optimization or production network timings.

Variants: `/`, `/?loading`, `/ssr.html` (server-rendered original Home, no script).
Automated checks cover 320, 390, 768, 1024, 1440 and 1920px: overflow, one hero image,
three route cards, hover/focus, reduced motion, skeleton, deferred map requests/module,
route switching/cache, error/retry, and visible HTML with JavaScript disabled.
Screenshots are saved to `output/playwright/home-experience`.
