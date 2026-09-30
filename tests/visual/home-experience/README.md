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

Leaderboard variants use `?leaderboard` with optional `&empty&private`, `&error`,
or `&loading`. Run `node tests/visual/home-experience/leaderboard-qa.mjs` for
28 responsive state layouts, rolling-period controls, keyboard and reduced motion.
These use synthetic public names/XP; ranking queries and consent actions are not
called. Screenshots are stored in `output/playwright/leaderboard`.

Passport/route variants have a separate entry at `/journey.html?passport` or
`/journey.html?routes`, so they do not load the detail map into Home's entry bundle.
Passport options: `&linked`, `&no-targets`, `&no-identity`, `&error`, `&loading`.
Routes options: `&empty`, `&loading`, `&detail`. Run
`node tests/visual/home-experience/journey-qa.mjs` for 70 layouts (320–1920px),
historical stamps, active progress, search recovery, route anchors, lazy images,
keyboard and reduced motion. The fixture omits account-link/recovery forms;
server page tests separately verify those conditional components are retained.

For an existing local production server on port 3100, run
`node tests/visual/home-experience/journey-production-qa.mjs`. It checks six
unauthenticated passport/routes/detail layouts at 390/1440px with read-only
requests and intercepted external map tiles. Screenshots are stored in
`output/playwright/journey`. No production timing improvements are inferred from
the Vite fixture or these layout checks.
