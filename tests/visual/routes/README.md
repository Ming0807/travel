# Curated route component QA

Start with `pnpm exec vite --config tests/visual/routes/vite.config.ts`, then open
`http://127.0.0.1:4188/`. This isolated fixture uses production route components,
local visual assets, and test coordinates. It never writes to Supabase or acts
as research evidence. Stop the fixture server after QA.

Check 360, 768, and 1440 pixel widths: no horizontal overflow; route cards and
stop notes remain readable; media and missing-media states render; map markers
match timeline numbers; the missing-coordinate notice is visible; map loading
is deferred until the button is clicked; attribution stays visible; zoom and
hide/reopen work without browser errors. An external tile failure should leave
the itinerary readable.

Open `http://127.0.0.1:4188/?admin` for the production admin composer with
stubbed actions. Check long names, day/order changes, stop notes, repeated save,
unsaved-publication guard, rejection messages, and the cover drawer at the same
viewport widths. Cover checks include cancellation, explicit clearing, and
reopening after server acknowledgement. Do not open the media library in this isolated fixture; media
selection/upload and persisted publication require the authenticated app.

Run the automated component-browser checks with
`pnpm exec playwright test --config tests/visual/routes/playwright.config.ts`.
They cover the three widths and save screenshots under `output/playwright/`.
Open `http://127.0.0.1:4188/?explore` to inspect the in-page public route
explorer with three mapped fixture stops. Its dotted connector is editorial
order, not road geometry; choosing a stop or marker changes the selected
detail and moves the map. The default fixture still checks the compact,
on-demand version used in admin review.

This component fixture does not replace production-data and authenticated
admin acceptance gates in `tasks/PHASE_25_CURATED_NA_THAM_ROUTES.md`.

The explorer checks also cover Enter/Space marker selection, a visible focus
outline, repeated selection after panning, and reset controls not covering pins.

## Published-route read-only check

Run `node tests/visual/routes/production-qa.mjs` against a local production server
on port 3100. To inspect a deployment, set `ROUTE_QA_BASE_URL` to that origin;
`ROUTE_QA_SLUG` optionally selects another published route with complete coordinates.
The default route is `na-tham-kampan-cave-learning`. This check reads pages only,
loads real OpenStreetMap tiles, and never accepts research, creates visits or
changes CMS data. It checks five widths (360/390/768/1024/1440), marker visibility,
stop selection, image loading and Google Maps URL parity with the itinerary.
Reports and screenshots are written to `output/playwright/routes-production/`.
It verifies external handoff URLs, not a physical phone's Google Maps app or GPS.
