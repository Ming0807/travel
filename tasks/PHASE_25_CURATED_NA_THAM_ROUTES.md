# Phase 25: Curated Na Tham Routes

Status: Implementation and local verification complete; production-data sign-off pending

## Goal

Help visitors choose a small number of useful, truthful itineraries through the approved Na Tham attraction set. Let administrators compose and publish them without duplicate data entry. Routes are editorial recommendations, not automated optimization or proof of travel time.

## Scope decisions

- Start with the eleven slugs confirmed by the Na Tham catalog migration and a few curated routes. A twelfth requires explicit confirmation. Do not invent filler places, prices, opening hours, travel times, or route popularity.
- One canonical attraction record supplies each stop's title, image, coordinates, and detail link. Route-specific copy is a short optional stop note.
- The route directory remains readable with few entries; search and duration filters appear only when more than three routes are published.
- The map displays stored attraction coordinates, not a drawn road or a claim about the best path. Google Maps directions are an external handoff. Split itineraries above five stops into overlapping segments so mobile waypoint limits do not silently omit stops.
- Draft creation is separate from publication. Server-side readiness checks determine what can be published or reactivated. No new SQL migration is required.

## Tasks

### 25.1 Public discovery

- [x] Keep the current homepage visual language while presenting a small curated directory.
- [x] Show real cover, day count, and stop count; handle zero routes and load failure honestly.
- [x] Preserve selection handoff from attraction and restaurant lists.
- [x] Split selected attraction/restaurant navigation into overlapping mobile-safe segments; never silently truncate the full selection.
- [x] Ignore hidden filters when the directory shrinks; distinguish selection load failure from unpublished content and preserve both selections on retry.

### 25.2 Route detail and navigation

- [x] Show the stored daily stop order, attraction links, and route-specific notes.
- [x] Add an on-demand map with real numbered coordinates, missing-coordinate notice, and tile-load fallback.
- [x] Generate external directions only for valid coordinates; segment longer trips without pretending the map is a road route.

### 25.3 Admin composer

- [x] Make a new route an active draft and continue directly to the stop editor.
- [x] Provide searchable eligible attractions, day/order controls, notes, cover picker, and a review section.
- [x] Exclude attractions outside the current public launch scope from add choices.
- [x] Prevent publishing while local stop edits are unsaved and show server rejection reasons in both review and list views.
- [x] Keep embedded save bars inline without mobile overflow; cover cancellation closes the drawer and repeated saves clear the publication guard.
- [x] Save library UUID covers independently from metadata/status; acknowledge only the server-confirmed preview or explicit clear.

### 25.4 Publication and data integrity

- [x] Require two distinct eligible stops and contiguous day/order numbering at publication.
- [x] Keep publication and activation behind their dedicated permissions and audit trail.
- [x] Validate changed stops on published routes and reactivation of published routes.
- [x] Revalidate public route pages after metadata, stop, or status changes.
- [x] Keep reused cover associations entity-owned, compensate rejected cover cleanup, and exclude status columns from metadata persistence.

### 25.5 Verification and release

- [x] Run relevant unit tests, typecheck, lint, production build, and responsive browser checks after integration.
- [x] Confirm the deployed cover/selection code release by production health and public/security HTTP smoke; dependency readiness remains unverified.
- [x] Check one real published Na Tham route in production, including map coordinates and mobile directions URLs. Route 01 passed read-only Chromium checks with real CMS data and map tiles at five widths on 2026-10-01; actual device/app handoff remains in 25.7.
- [ ] Confirm an administrator can create, edit, preview, publish, unpublish, and restore a route with the deployed database.

Evidence: [Local route QA](../docs/testing/PHASE_25_ROUTE_QA_2026-09-27.md).

### 25.6 Researched pilot content and access review (2026-09-29)

- [x] Review the supplied GPT critique against existing code; retain canonical attraction reuse and the existing composer rather than duplicating their workflows.
- [x] Research primary institutional sources for Na Tham heritage, cave sites and Simaya community activities.
- [x] Prepare three unpublished route drafts referencing eight of the eleven approved places; retain the other three places without inventing access arrangements.
- [x] Supply a read-only eleven-place coordinate/status report with source-site map comparisons; do not overwrite entrance coordinates with archaeological-site coordinates.
- [x] Verify the transactional, idempotent seed in isolated PostgreSQL/WASM, including preservation of CMS edits and failure rollback (10 checks).
- [x] User ran the optional content seed in production; three route records and their stops are present.
- [ ] User adds approved covers in CMS and verifies each image after refresh.
- [x] Surface missing attraction coordinates in route review, link to each attraction editor, and show an honest public map empty state.
- [x] Use the visitor's current location in Google Maps handoff when the full route has at most four stops; provide a first-stop navigation link before mobile-safe route segments for longer itineraries.
- [ ] Local caretakers verify entrances, cave access, meeting points, trip order and activity arrangements before publication.
- [ ] Complete the real-data deployment checks in 25.5; technical readiness alone is not field-access approval.

Content, citations and execution guide: [Na Tham curated routes](../docs/content/NA_THAM_CURATED_ROUTES.md).
Read-only production data audit: [Phase 25 production route audit](../docs/testing/PHASE_25_PRODUCTION_ROUTE_AUDIT_2026-09-29.md).
No schema migration or production database mutation is performed by this task.

### 25.7 Embedded route explorer

- [x] Put a full-width, in-page map before the detailed itinerary, preserving the existing compact admin preview.
- [x] Draw numbered markers and dotted editorial-order connectors from stored attraction coordinates, without implying a road or walking route.
- [x] Let visitors select stops from the map or ordered list, focus the map with reduced-motion support, and open the selected attraction or Google Maps directions.
- [x] Keep the whole-route Google Maps handoff for routes with complete coordinates and break the visual connector at missing locations.
- [x] Load map assets near the viewport; preserve usable content when tiles fail and allow a reset to the full extent.
- [ ] Confirm route 01 on real iPhone and Android devices, including map panning, marker selection, current-location navigation, and the caretaker-approved access points.

### 25.8 Post-release explorer reliability (2026-10-01)

- [x] Reproduce and fix repeated selection failing to return to the current stop after map panning.
- [x] Label markers with stop number/name, synchronize their selected state, and support Enter/Space with a visible focus outline.
- [x] Reserve enough initial/reset map padding for controls to avoid obscuring markers on mobile and desktop.
- [x] Add a read-only, reusable published-route check for real tiles, images, marker visibility and itinerary/directions parity at five widths.
- [x] Pass 26 focused unit cases, 12 component-browser checks, typecheck, scoped lint and the production build; check route 01 against the local production build and real CMS data.
- [x] Confirm the patched deployed release `05426a625ce6` and run the published-route check against production; all five widths passed with actual tiles and CMS data.

Evidence: [Route explorer QA](../docs/testing/PHASE_25_ROUTE_EXPLORER_QA_2026-10-01.md).

## Out of scope

No automatic route generation, road-distance ranking, fake review metrics, payment or booking, new attraction records, AI-authored itinerary claims, or study-participant tracking is introduced in this phase.
