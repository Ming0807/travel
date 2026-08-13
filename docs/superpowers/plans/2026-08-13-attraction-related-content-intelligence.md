# Attraction Related Content Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for disjoint tasks and `superpowers:test-driven-development` for each behavior change.

**Goal:** Deliver explainable automatic, manual, hybrid, and hidden related-content sections for attraction detail pages without breaking production before the new SQL migration is applied.

**Architecture:** Keep ordered editorial choices in the existing four relation tables, add a small settings table for section behavior, rank bounded candidate read models in pure TypeScript, expose server-side admin search, and render one normalized public card contract.

**Tech Stack:** Next.js 16, TypeScript, React, Supabase PostgreSQL, Zod, Tailwind CSS, Vitest, Testing Library, Playwright.

## Release Constraints

- Create local commits only. Do not push.
- Do not execute the migration from application code or local scripts.
- Public reads must remain safe when the migration has not been applied.
- No demo/mock content and no province-only story recommendations.
- Verify changed slices after each task; run the full suite and build only at the final gate.

---

### Task 1: Lock specification and regression baseline

**Files:**
- Create: `docs/superpowers/specs/2026-08-13-attraction-related-content-intelligence-design.md`
- Create: `docs/superpowers/plans/2026-08-13-attraction-related-content-intelligence.md`

- [x] Document modes, legacy behavior, ranking evidence, admin UX, release sequencing, and acceptance criteria.
- [ ] Commit the approved specification before implementation.

### Task 2: Exact curated reads and RPC failure handling

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Test: `tests/unit/public-dto.test.ts`
- Test: `tests/unit/admin-attraction-related-content.test.ts`

- [ ] Add a failing regression test proving exact curated attraction lookup never fills with unrelated latest records.
- [ ] Add a failing regression test proving `{ success: false }` from the legacy RPC is treated as failure.
- [ ] Add an exact-only curated retrieval path without changing homepage featured behavior.
- [ ] Parse and validate the legacy RPC response.
- [ ] Run focused tests, ESLint, and typecheck for the changed slice.
- [ ] Commit the regression fixes independently.

### Task 3: Settings migration and transactional sync contract

**Files:**
- Create: `supabase/migrations/20260813002000_add_attraction_related_content_settings.sql`
- Modify: `docs/database/DATA_DICTIONARY.md`
- Modify: `docs/database/SUPABASE_SCHEMA_CHECKLIST.md`
- Test: `tests/unit/attraction-related-migration.test.ts`

- [ ] Add migration source-contract tests before SQL implementation.
- [ ] Create `attraction_related_content_settings` with checks, timestamps, RLS, and lookup indexes.
- [ ] Backfill `manual` for existing curated relations and `automatic` otherwise.
- [ ] Add reverse indexes and self-link protection to relation tables.
- [ ] Create a versioned transactional sync RPC that validates, de-duplicates, preserves order, and raises failures.
- [ ] Document the exact manual Supabase deployment order and rollback boundary.
- [ ] Do not run the migration.
- [ ] Commit migration and documentation independently.

### Task 4: Pure recommendation engine

**Files:**
- Create: `lib/content/attraction-related-content.ts`
- Test: `tests/unit/attraction-related-content.test.ts`

- [ ] Write failing tests for eligibility, stable ordering, distance, area fallback, shared categories, de-duplication, and explanations.
- [ ] Implement typed candidate, setting, ranked-item, and section contracts.
- [ ] Implement deterministic ranking for attractions, restaurants, accommodations, and verified stories.
- [ ] Implement `automatic`, `manual`, `hybrid`, and `hidden` composition.
- [ ] Verify manual mode never fills and hybrid mode fills only remaining capacity.
- [ ] Run focused tests and commit the pure engine.

### Task 5: Public related-content read model

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `lib/content/attraction-sections.ts`
- Test: `tests/unit/public-dto.test.ts`
- Test: `tests/unit/attraction-sections.test.ts`

- [ ] Add source geography and category evidence to the attraction detail query.
- [ ] Query settings with a missing-table fallback that derives legacy behavior.
- [ ] Fetch bounded eligible candidates per content type.
- [ ] Isolate section failures so one relation query cannot fail the full detail page.
- [ ] Normalize all results to one public related-card read model.
- [ ] Apply the approved public section order and hide empty sections.
- [ ] Run focused tests, repository ESLint, and typecheck.
- [ ] Commit public data behavior separately.

### Task 6: Server-side admin search and validation

**Files:**
- Modify: `app/actions/admin-attraction-actions.ts`
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Modify: `app/(admin)/admin/attractions/[id]/edit/page.tsx`
- Test: `tests/unit/admin-attraction-related-content.test.ts`

- [ ] Replace `getAdminAllContentList()` picker usage with typed server-side search actions.
- [ ] Support query, page, content type, selected IDs, and stable pagination metadata.
- [ ] Return selected records even when they become inactive so admins can repair the section.
- [ ] Validate mode, maximum item count, target IDs, self-links, and permissions server-side.
- [ ] Call the transactional RPC and fail visibly on any unsuccessful result.
- [ ] Revalidate only affected admin and public attraction paths.
- [ ] Commit backend/admin contracts before the UI refactor.

### Task 7: Related-content workspace UX

**Files:**
- Refactor: `components/admin/attractions/visual-editor/RelatedContentForm.tsx`
- Modify: `components/admin/attractions/visual-editor/AttractionVisualEditor.tsx`
- Test: `tests/unit/admin-attraction-related-content-ui.test.tsx`

- [ ] Build one Thai-first workspace with four content tabs.
- [ ] Add accessible mode controls with concise consequences.
- [ ] Add paginated debounced search, loading, error, empty, and retry states.
- [ ] Replace the fake drag affordance with working move-up/move-down icon controls.
- [ ] Add selected-item status, edit links, limits, suggestion preview, dirty state, Save, and Cancel.
- [ ] Preserve a stable mobile drawer footer and 44px touch targets.
- [ ] Run Testing Library tests and `impeccable` detection.
- [ ] Commit the admin UX independently.

### Task 8: Public section presentation

**Files:**
- Modify: `components/attractions/attraction-cards-row.tsx`
- Modify: `components/attractions/attraction-tabs.tsx`
- Modify: `app/(public)/attractions/[slug]/page.tsx`
- Test: `tests/unit/attraction-related-sections-ui.test.tsx`

- [ ] Render a mobile horizontal rail and desktop four-column grid without layout shifts.
- [ ] Show truthful recommendation reasons only when evidence exists.
- [ ] Keep editorial/manual cards visually clean without false algorithm claims.
- [ ] Use a horizontally scrollable section navigation on desktop and a clear mobile selector.
- [ ] Confirm public empty states do not expose unfinished CMS sections.
- [ ] Run responsive component tests and browser screenshots at mobile and desktop widths.
- [ ] Commit public presentation separately.

### Task 9: Final verification and release handoff

**Files:**
- Modify: `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`
- Modify: `docs/modules/MODULE_01_PUBLIC_ATTRACTIONS.md`

- [ ] Run `git diff --check` for the complete Phase 19 range.
- [ ] Run ESLint on all changed TypeScript/TSX files with zero errors and zero new warnings.
- [ ] Run focused tests, then `npm test -- --run`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build` and restore generated `next-env.d.ts` if necessary.
- [ ] Run attraction detail and admin editor Playwright/browser smoke tests.
- [ ] Confirm no `.playwright-cli`, `.tmp`, secrets, SQL execution artifacts, or generated files are committed.
- [ ] Review every local commit and report the exact migration file to run later.
- [ ] Do not push until the user explicitly approves after the final report.
