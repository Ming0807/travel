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
viewport widths. Do not open the media library in this isolated fixture; media
selection/upload and persisted publication require the authenticated app.

Run the automated component-browser checks with
`pnpm exec playwright test --config tests/visual/routes/playwright.config.ts`.
They cover the three widths and save screenshots under `output/playwright/`.

This component fixture does not replace production-data and authenticated
admin acceptance gates in `tasks/PHASE_25_CURATED_NA_THAM_ROUTES.md`.
