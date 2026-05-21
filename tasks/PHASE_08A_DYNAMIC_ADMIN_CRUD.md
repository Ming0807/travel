# PHASE_08A_DYNAMIC_ADMIN_CRUD.md

## Status

Planned.

## Goal

Expand the admin backoffice so administrators can manage the dynamic frontend content that now appears on the public tourism portal.

This phase is admin CRUD, not dashboard analytics.

---

## Scope

Admin CRUD should manage:

- Attractions
- Attraction media
- Photo spots
- Check-in codes
- Travel stories
- Suggested routes
- Suggested route stops
- Certificate templates placeholder/listing
- Official data import review

---

## Architecture Rules

- Use Next.js Server Actions / Route Handlers.
- Validate all mutations with Zod.
- Check admin authentication server-side.
- Check permissions server-side.
- Use service/repository boundaries.
- Audit admin mutations where schema supports it.
- Do not trust client roles or localStorage.
- Do not expose service role to browser code.

---

## Permission Examples

- `attraction.read`
- `attraction.manage`
- `photo_spot.manage`
- `checkin_code.manage`
- `story.manage`
- `route.manage`
- `certificate_template.read`
- `official_data.read`
- `official_data.import`

---

## Implementation Tasks

- [ ] Add travel story admin list/create/edit/status actions.
- [ ] Add suggested route admin list/create/edit/status actions.
- [ ] Add suggested route stop management.
- [ ] Add attraction media CRUD or safe scaffold.
- [ ] Improve attraction CMS to manage fields used by public detail pages.
- [ ] Ensure check-in code admin supports URL-safe QR codes and active/expired states.
- [ ] Add pagination/search/filter to every admin list.
- [ ] Add audit logs for story, route, media, attraction, photo spot, and check-in code mutations.
- [ ] Add tests for permission denial and privacy-safe admin list data.

---

## Acceptance Criteria

- Admin can manage content that appears on homepage, attraction pages, and story pages.
- Public pages reflect published admin-managed records.
- Draft/inactive records are hidden from public pages.
- Admin lists are paginated.
- Mutations validate server-side.
- Mutations check permissions server-side.
- Audit logs are written for important changes.
- No private tourist identifiers are exposed in admin public-content management screens.

---

## Validation

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

---

## Next

Phase 09A: Dashboard metric verification against seeded DDL/DML.
