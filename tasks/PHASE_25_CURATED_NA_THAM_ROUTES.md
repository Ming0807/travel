# Phase 25: Curated Na Tham Routes

Status: Implementation and local verification complete; production-data sign-off pending

## Goal

Help visitors choose a small number of useful, truthful itineraries through the approved Na Tham attraction set. Let administrators compose and publish them without duplicate data entry. Routes are editorial recommendations, not automated optimization or proof of travel time.

## Scope decisions

- Start with the existing 11-12 approved attractions and a few curated routes. Do not invent filler places, prices, opening hours, travel times, or route popularity.
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
- [ ] Check one real published Na Tham route in staging/production, including map coordinates and mobile directions. This requires an approved route with real stops and is not satisfied by mock data.
- [ ] Confirm an administrator can create, edit, preview, publish, unpublish, and restore a route with the deployed database.

Evidence: [Local route QA](../docs/testing/PHASE_25_ROUTE_QA_2026-09-27.md).

## Out of scope

No automatic route generation, road-distance ranking, fake review metrics, payment or booking, new attraction records, AI-authored itinerary claims, or study-participant tracking is introduced in this phase.
