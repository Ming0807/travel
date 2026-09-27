# Phase 25 Local Route QA

Date: 2026-09-27

Status: Code and local verification complete. Real-route and authenticated
deployment acceptance remain pending; this is not a production sign-off.

## Scope

- Small curated route discovery in the current homepage visual language.
- Daily stop order, canonical attraction data, optional stop notes, and deferred Leaflet map.
- Active drafts, continuous admin composer, duplicate/eligibility/readiness checks, and dedicated publication permissions.
- Inline embedded save bars, working cover cancellation, repeated saves, and cache invalidation after status changes including archival.
- Segmented Google Maps navigation for both curated routes and visitor-selected attractions/restaurants, preserving every stop.

No SQL migration, production seed, simulated study participant, route publication,
or other database write was performed as part of this verification. Opening the
map requests OpenStreetMap tiles; the component does not request tourist GPS.

## Executed Gates

| Gate | Result | Qualification |
| --- | --- | --- |
| Full Vitest sweep: `pnpm exec vitest run --maxWorkers=4` | 435 files and 3,366 tests passed; 2 files and 41 tests skipped | Run after the integrated composer/map changes and before the final shortlist-only refinement |
| Final focused Vitest run | 10 files, 109 tests passed | Includes the final shortlist segmentation and duplicate-link-key regression tests, plus route/publication/composer/navigation checks |
| `pnpm run typecheck` | Exit 0 | Final production build also passed its TypeScript phase |
| `pnpm run lint` | Exit 0; no errors | One existing warning in `tests/visual/dashboard/research-browser-qa.js` |
| Targeted ESLint with `--max-warnings=0` | Exit 0 | Changed route/admin/navigation modules and route browser fixture |
| `pnpm run build` | Exit 0; 66/66 generated pages | Local Node 26.1.0 emitted an engine warning; project and Vercel configuration remain Node 22.x |
| Route component browser suite | 9 checks passed in Chromium | Public and admin at widths 360, 768, and 1440, including aborted map-tile requests |
| Real-app routes/360 smoke | 2 checks passed | Local app had no published routes; this checks honest empty state and external 360 behavior, not a populated route detail |

## Browser Observations

The production components were rendered in an isolated Vite fixture. Admin
mutations were stubbed; no service-role client or real server mutation was used.
The map's successful-load checks fetched real tiles. Separate network-abort
checks verified the warning and continued availability of stop details/markers.

- No horizontal overflow at the three tested widths.
- Canonical order and marker numbering agree, including a missing-coordinate stop.
- Images, deliberate missing-image state, long Thai names, and stop notes render.
- Map initialization is deferred; popup links, hide/reopen, and attribution work.
- Editing stop notes disables publication; both consecutive saves release the guard.
- Publication rejection is visible, and the cover drawer closes through Cancel.
- Embedded save bars no longer overlap the editor; the shared sticky default for other CMS forms is unchanged.
- No browser page errors occurred in successful public/admin checks.

Regenerable screenshots are local, ignored artifacts under `output/playwright/`:
`routes-public-final-{360,768,1440}.png` and
`routes-admin-final-{360,768,1440}.png`.

Reproduction: `pnpm exec playwright test --config tests/visual/routes/playwright.config.ts`.
Fixture notes: `tests/visual/routes/README.md`.

## Remaining Acceptance

1. Publish one approved route with real Na Tham stops; verify cover, daily order,
   stop notes, stored coordinates, and every external navigation segment.
2. With an authorized admin account on the deployed database, perform
   create/edit/preview/publish/unpublish/archive/reactivate, then refresh the
   public directory and homepage to verify persistence and cache invalidation.
3. Verify the external Maps handoff on physical iPhone/Android devices. The
   responsive Chromium checks do not certify Safari or installed map apps.
4. Confirm the Vercel deployment succeeds. A local build or successful Git push
   is not evidence that the remote deployment passed.

These acceptance gates intentionally remain unchecked in the phase task file.
