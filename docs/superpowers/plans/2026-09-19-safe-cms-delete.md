# Safe CMS Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reversible delete controls to all five content CMS modules and keep restaurant-attraction relationships limited to active pilot attractions.

**Architecture:** Server actions authorize and archive records through existing repositories, then write audit logs and revalidate affected admin/public routes. A shared client control owns confirmation and pending/error UX. Restaurant relationships use one transactional RPC; public repositories remain strict readers of active and published content.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL, Vitest, Testing Library

## Global Constraints

- Never physically delete historical tourism content.
- Never mutate visits, QR/NFC events, reviews, surveys, certificates, or analytics.
- Use existing permission keys and audit infrastructure.
- Only active content may appear in new admin relationship pickers.
- Only active and published content may appear publicly.
- Tests use synthetic data only.

---

### Task 1: Archive Contract And Server Actions

**Files:**
- Modify: `app/actions/admin-attraction-actions.ts`
- Modify: `app/actions/admin-restaurant-actions.ts`
- Modify: `app/actions/admin-accommodation-actions.ts`
- Modify: `app/actions/admin-route-actions.ts`
- Modify: `app/actions/admin-story-actions.ts`
- Test: `tests/unit/admin-cms-archive-actions.test.ts`

**Interfaces:**
- Produces: `archiveAttractionAction`, `archiveRestaurantAction`, `archiveAccommodationAction`, `archiveRouteAction`, and `archiveStoryAction`, each returning `Promise<ActionResult>`.

- [ ] Write failing tests that require the matching permission, patch lifecycle fields, write an archive audit event, and reject a missing record.
- [ ] Run the targeted test and confirm failures are caused by missing archive actions.
- [ ] Implement the five minimal actions using existing `getAdmin*ById`, `updateAdmin*Status`, `recordAdminAuditEvent`, and cache revalidation patterns.
- [ ] Run the targeted test until it passes.

### Task 2: Shared Delete Confirmation UX

**Files:**
- Create: `components/admin/content/CmsArchiveButton.tsx`
- Modify: `components/admin/attractions/AttractionTable.tsx`
- Modify: `components/admin/restaurants/RestaurantStatusActions.tsx`
- Modify: accommodation and route status action components used by their list pages
- Modify: `components/admin/stories/StoryStatusActions.tsx`
- Test: `tests/unit/admin-cms-archive-button.test.tsx`

**Interfaces:**
- Consumes: archive server actions from Task 1.
- Produces: `CmsArchiveButton({ entityType, entityId, entityName, redirectHref? })`.

- [ ] Write a failing component test for dialog copy, cancel, pending state, success refresh, and safe failure message.
- [ ] Run the targeted test and verify RED.
- [ ] Implement the reusable icon button and confirmation dialog with a minimum 44 px touch target.
- [ ] Add the control to desktop and mobile action areas in all five CMS lists.
- [ ] Run the targeted component tests until GREEN.

### Task 3: Active-Only Admin Lists And Pickers

**Files:**
- Modify: CMS filter schemas under `lib/validation/admin-*.ts`
- Modify: CMS list repositories under `lib/repositories/admin-*.repository.ts`
- Modify: CMS list pages under `app/(admin)/admin/*/page.tsx`
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Test: `tests/unit/admin-cms-active-filter.test.ts`

**Interfaces:**
- Produces: default active-only list filters and `getAdminAttractionsList({ activeOnly: true })` behavior.

- [ ] Write failing repository/schema tests proving archived rows are hidden by default and visible through an explicit archived filter.
- [ ] Run the targeted tests and verify RED.
- [ ] Add lifecycle filter parsing and repository predicates without changing historical analytics repositories.
- [ ] Update picker callers so new relations use active attractions only.
- [ ] Run targeted tests until GREEN.

### Task 4: Restaurant Nearby Attractions

**Files:**
- Create: `supabase/migrations/20260919000000_sync_restaurant_attractions.sql`
- Modify: `lib/repositories/admin-restaurant.repository.ts`
- Modify: `app/actions/admin-restaurant-actions.ts`
- Create: `components/admin/restaurants/NearbyAttractionPicker.tsx`
- Modify: `components/admin/restaurants/RestaurantForm.tsx`
- Modify: `components/admin/restaurants/visual-editor/SectionForms.tsx`
- Modify: `app/(admin)/admin/restaurants/new/page.tsx`
- Modify: `app/(admin)/admin/restaurants/[id]/edit/page.tsx`
- Test: `tests/unit/admin-restaurant-nearby-attractions.test.tsx`
- Test: `tests/unit/restaurant-attraction-rpc.test.ts`

**Interfaces:**
- Produces: `listAdminRestaurantAttractions(restaurantId)` and `syncAdminRestaurantAttractions(restaurantId, attractionIds)`.

- [ ] Write failing migration tests for deduplication, active-attraction validation, transaction rollback, and ordered insertion.
- [ ] Write failing UI/action tests for Add and Edit selections.
- [ ] Implement the RPC and repository wrapper with safe error mapping.
- [ ] Implement the checkbox/search picker and hidden ordered IDs.
- [ ] Persist selections from both create and update actions.
- [ ] Run all Task 4 tests until GREEN.

### Task 5: Public Relationship Regression And Documentation

**Files:**
- Modify: `tests/unit/public-hospitality-detail-repository.test.ts`
- Modify: `docs/frontend/ADMIN_SIDE_PAGES.md`
- Modify: `docs/frontend/ROUTES_STRUCTURE.md`
- Modify: `docs/database/DATA_DICTIONARY.md`

**Interfaces:**
- Consumes: lifecycle and restaurant relationship behavior from Tasks 1-4.

- [ ] Add regression cases proving inactive or unpublished attractions are absent from restaurant detail cards.
- [ ] Run the public repository tests.
- [ ] Document archive semantics, restoration, active-only pickers, and the relationship RPC.
- [ ] Run `git diff --check`, targeted tests, ESLint on changed files, TypeScript, and `next build`.
- [ ] Review the final diff for accidental production record deletion or secret exposure.
