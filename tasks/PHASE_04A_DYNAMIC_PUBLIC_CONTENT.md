# PHASE_04A_DYNAMIC_PUBLIC_CONTENT.md

## Status

Started. Homepage, attractions, and stories now have database-backed repository entry points with safe mock fallback.

## Goal

Connect the new premium public frontend to database-backed public content while preserving the reward-first tourism strategy.

This phase focuses on:

1. Homepage discovery content
2. Attraction list and detail data
3. Travel story list and detail data
4. Suggested route public content
5. Public-safe DTOs
6. SEO-ready public pages
7. No private tourist data exposure

---

## Product Rules

- Public website supports discovery, SEO, credibility, stories, suggested routes, and project explanation.
- QR check-in remains the main data collection entry point.
- Public pages must not expose tourist identities, guest tokens, provider IDs, private storage paths, or raw internal records.
- Published public content can be viewed without login.
- Tourist flow must remain guest-first.

---

## Implementation Tasks

- [x] Add database-backed public content repository with safe fallback.
- [x] Connect `/attractions` to public attraction cards.
- [x] Connect `/attractions/[slug]` to public attraction detail repository.
- [x] Connect `/stories` and `/stories/[id]` to public story repository.
- [x] Connect homepage attraction/story sections to public repository data.
- [ ] Connect suggested routes section to `suggested_routes` and `suggested_route_stops`.
- [ ] Add public-safe DTO tests for attraction cards, stories, and routes.
- [ ] Add filters/search using server-side query params where practical.
- [ ] Replace remaining homepage static metrics with dashboard-safe public summary or clearly label as preview.
- [ ] Add not-found states for unpublished or missing content instead of silent mock fallback where appropriate.

---

## Acceptance Criteria

- Homepage renders from database-backed public content when available.
- Attraction and story pages use public-safe fields only.
- Fallback data is used only for development resilience, not as a hidden production data source.
- Unpublished/inactive content is not public.
- Public pages do not expose private identifiers or storage paths for tourist photos/certificates.
- Search/filter behavior does not require login.

---

## Validation

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Optional browser check:

```bash
/, /attractions, /stories
```

---

## Next

Phase 08A: Dynamic Admin CRUD for public content management.
