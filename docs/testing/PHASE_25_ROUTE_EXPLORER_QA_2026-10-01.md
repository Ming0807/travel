# Route explorer QA - 2026-10-01

## Scope and findings

Read-only production inspection confirmed release `20fd6403779e` and the
published route `na-tham-kampan-cave-learning`. It exposed a reset button
partially obscuring marker 1 on mobile. A new failing unit regression proved
that selecting the current stop again did not return to it after panning.

The patch reserves space for map controls and treats every stop selection as
a new focus request. Marker labels are assigned after Leaflet establishes its
initial view and creates the DOM nodes. Enter and Space now select the stop
and open its popup, with visible focus and an announced selected state.

## Local evidence

- Focused unit tests: 3 files, 26 cases passed, including route readiness,
  repeated map selection and the admin composer.
- Component-browser QA: all 12 checks passed at 360/768/1440 px. Covers marker
  selection by pointer/keyboard, panning and repeated selection, controls not
  obscuring pins, repeated CMS saves, cover cancellation and tile failure.
- TypeScript, scoped ESLint, syntax and whitespace checks passed.
- `pnpm run build` passed with Next.js 16.3.0. Local runtime was Node 26.1.0;
  this run does not prove the production Node 22 runtime.
- `node tests/visual/routes/production-qa.mjs` passed on the local production
  server with real CMS data at 360/390/768/1024/1440 px. Actual OpenStreetMap
  tiles and selected-stop images loaded; each directions URL matched its
  itinerary stop and the complete route retained all three stops with no
  forced origin. No page exceptions or horizontal overflow were observed.
- Desktop and mobile map screenshots were visually reviewed under
  `output/playwright/routes-production/`; generated reports are not committed.

The current published coordinates read from CMS were:

| Stop | CMS Place | Latitude | Longitude |
| --- | --- | --- | --- |
| 1 | วัดคูหาภิมุข (วัดหน้าถ้ำ) | 6.5272 | 101.224 |
| 2 | วิวเชิงเขา (`kampan`) | 6.52287 | 101.22368 |
| 3 | ถ้ำสำเภาทอง | 6.5222 | 101.2198 |

These are observed values, not approval of entrances or access arrangements.
No content, coordinates, schema, account, visit or research records were changed.

## Deployment and remaining acceptance

Patched release verification is pending. The repeatable check supports
`ROUTE_QA_BASE_URL` and `ROUTE_QA_SLUG` for later published routes.

Actual iPhone/Android Google Maps handoff, GPS behavior, caretaker-approved
entrances, image editorial approval and authenticated CMS create/publish/
unpublish/restore remain separate acceptance items. Browser viewport emulation
and stubbed CMS actions do not establish those results.

Production also returned a favicon 404 and two CSS preload warnings during the
initial read-only inspection; neither was an uncaught page exception. They are
not treated as resolved by the map patch.
