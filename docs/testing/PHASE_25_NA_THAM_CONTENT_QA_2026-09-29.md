# Phase 25 Na Tham Content and Navigation QA

Date: 2026-09-29

## Scope

Three manually opted-in unpublished route seeds, eleven-place read-only map
preflight, clearer public coordinate/navigation semantics, desktop map/sidebar,
mobile jump links, and labeled admin route-list actions. No production DB write.

## Executed Verification

- Isolated PostgreSQL/WASM seed verification: 10 checks passed. Uses repository
  table DDL, slug migration, current removed-cover-column shape and unique English
  name index. Tests atomic insertion, reruns, preservation of CMS edits, missing/
  inactive/unpublished/non-Yala attractions, unique-name conflict rollback and
  preflight coordinate states. This is not full Supabase/RLS integration.
- Focused route Vitest run: 9 files, 50 tests passed.
- Typecheck and targeted ESLint: exit 0.
- Production build: exit 0, 66/66 static pages generated; local Node 26.1.0 differs
  from the declared deployment Node 22.x. Build includes final TypeScript pass.
- Chromium component-browser final run: 9/9 passed across 360, 768, 1440 widths.
  Covers side-by-side/stacked placement, marker jump and detail links, no horizontal
  overflow, real map tile success and aborted-tile fallback, repeated admin saves,
  unsaved publication protection and cover drawer interactions.
- Earlier browser checks caught an obsolete link assertion after popup behavior
  changed; updated to assert both destinations. Cold fixture compilation then
  exceeded the 30-second first-test budget. Explicit fixture warmup followed by
  the unchanged nine-test suite passed; no product timeout was loosened.

Screenshots: `output/playwright/routes-public-final-{360,768,1440}.png` and
`output/playwright/routes-admin-final-{360,768,1440}.png` (ignored local output).

## Remaining Real-Data Acceptance

Add owned cover images, validate coordinates/entrances and arrangements with
caretakers, then publish via authenticated CMS. Verify one real route on iPhone
and Android. Fixture mutations are stubbed and do not establish production
authorization or real travel accessibility. Source-site coordinates were NOT
written over existing attraction coordinates. No invented opening hours, trip
duration, prices, guide availability or visitor activity was seeded.
