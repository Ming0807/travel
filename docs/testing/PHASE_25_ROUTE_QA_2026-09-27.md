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

## Cover And Selection Hardening Checkpoint

The follow-up fixes replace unchecked numeric/storage-path cover writes with a
strict library UUID action, keep metadata/status persistence separate, ignore
filters when their controls disappear, and distinguish selected-content load
failure from successful empty results. Selection retry keeps both sanitized
attraction and restaurant query values. No production records were changed.

| Gate | Result | Qualification |
| --- | --- | --- |
| Full Vitest sweep | 443 files and 3,396 tests passed; 2 files and 41 tests skipped | Before the final cover-compensation refinement |
| Final focused sweep | 17 files and 117 tests passed | After compensation; includes route actions/forms, selection failure, and shared story-cover regressions |
| Targeted cover-compensation tests | 9 tests passed | New association removal, existing-field restoration, and rollback failure |
| Route component browser suite | 9 checks passed at 360/768/1440 | Includes clear-save-reopen of the cover drawer, repeated stop saves, and map-tile failure; mutations remain stubbed |
| Production build | Exit 0; 66/66 generated pages | TypeScript phase passed after the final code changes; local Node 26 differs from deployment Node 22 |
| Targeted ESLint | Exit 0 with `--max-warnings=0` | All changed production modules, new tests, and browser fixture |
| Whole-repository lint | Exit 0; no errors | Existing warning in `tests/visual/dashboard/research-browser-qa.js` remains unrelated |
| Real-app routes/360 smoke | 2 tests passed | Against the local app at port 3001; still an empty-route/public-360 check, not authenticated CMS acceptance |
| Node test suite | 6 tests passed | Bangkok date bounds and entry-cohort filter support |
| Post-push production HTTP smoke | Exit 0; code release `acbc81177c3b` confirmed | Six executed checks passed; dependency readiness skipped without `HEALTH_CHECK_SECRET` |

The fixture's working directory is explicitly repository-root relative so the
same browser command works from the root. A real-app smoke initially timed out
because its configured port 3001 had no running server while the generic test
command started port 3000. After explicitly starting the local app on 3001,
the same smoke passed; no product code or assertions were weakened.

The shared cover helper restores the selected association or deletes its new
entity-owned link if clearing competing flags returns an error. This is
best-effort compensation, not an atomic database transaction. Ambiguous network
outcomes, failure of the compensation itself, and concurrent editors remain
limitations; a transactional cover-swap RPC would require a separate reviewed
migration. Tests do not certify those concurrency guarantees.

A read-only route metadata check found four stored routes, fourteen stop rows,
and no active published routes. It inspected counts only, not private tourist
data. After push, the production health endpoint returned code release
`acbc81177c3b`. The release smoke also confirmed public homepage/attractions,
admin login, five required security headers, and the anonymous admin redirect.
The script labels seven checks passed, but one was skipped: dependency readiness
was not executed because the readiness secret was not provided. This confirms
deployment of the code batch, not authenticated CMS persistence or dependency
readiness. Later documentation-only commits do not change the verified code.

## Remaining Acceptance

1. Publish one approved route with real Na Tham stops; verify cover, daily order,
   stop notes, stored coordinates, and every external navigation segment.
2. With an authorized admin account on the deployed database, perform
   create/edit/preview/publish/unpublish/archive/reactivate, then refresh the
   public directory and homepage to verify persistence and cache invalidation.
3. Verify the external Maps handoff on physical iPhone/Android devices. The
   responsive Chromium checks do not certify Safari or installed map apps.
4. Run protected dependency-readiness checks with the authorized smoke secret.
   The new code release is live, but liveness/public HTTP checks alone do not
   certify this separate readiness gate.

These acceptance gates intentionally remain unchecked in the phase task file.
