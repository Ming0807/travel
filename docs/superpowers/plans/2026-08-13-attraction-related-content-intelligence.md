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
- [x] Commit the approved specification before implementation.

### Task 2: Exact curated reads and RPC failure handling

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Test: `tests/unit/public-dto.test.ts`
- Test: `tests/unit/admin-attraction-related-content.test.ts`

- [x] Add a failing regression test proving exact curated attraction lookup never fills with unrelated latest records.
- [x] Add a failing regression test proving `{ success: false }` from the legacy RPC is treated as failure.
- [x] Add an exact-only curated retrieval path without changing homepage featured behavior.
- [x] Parse and validate the legacy RPC response.
- [x] Run focused tests, ESLint, and typecheck for the changed slice.
- [x] Commit the regression fixes independently.

### Task 3: Settings migration and transactional sync contract

**Files:**
- Create: `supabase/migrations/20260813002000_add_attraction_related_content_settings.sql`
- Modify: `docs/database/DATA_DICTIONARY.md`
- Modify: `docs/database/SUPABASE_SCHEMA_CHECKLIST.md`
- Test: `tests/unit/attraction-related-migration.test.ts`

- [x] Add migration source-contract tests before SQL implementation.
- [x] Create `attraction_related_content_settings` with checks, timestamps, RLS, and lookup indexes.
- [x] Backfill `manual` for existing curated relations and `automatic` otherwise.
- [x] Add reverse indexes and self-link protection to relation tables.
- [x] Create a versioned transactional sync RPC that validates, de-duplicates, preserves order, and raises failures.
- [x] Document the exact manual Supabase deployment order and rollback boundary.
- [x] Do not run the migration.
- [x] Commit migration and documentation independently.

### Task 4: Pure recommendation engine

**Files:**
- Create: `lib/content/attraction-related-content.ts`
- Test: `tests/unit/attraction-related-content.test.ts`

- [x] Write failing tests for eligibility, stable ordering, distance, area fallback, shared categories, de-duplication, and explanations.
- [x] Implement typed candidate, setting, ranked-item, and section contracts.
- [x] Implement deterministic ranking for attractions, restaurants, accommodations, and verified stories.
- [x] Implement `automatic`, `manual`, `hybrid`, and `hidden` composition.
- [x] Verify manual mode never fills and hybrid mode fills only remaining capacity.
- [x] Run focused tests and commit the pure engine.

### Task 5: Public related-content read model

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `lib/content/attraction-sections.ts`
- Test: `tests/unit/public-dto.test.ts`
- Test: `tests/unit/attraction-sections.test.ts`

- [x] Add source geography and category evidence to the attraction detail query.
- [x] Query settings with a missing-table fallback that derives legacy behavior.
- [x] Fetch bounded eligible candidates per content type.
- [x] Isolate section failures so one relation query cannot fail the full detail page.
- [x] Normalize all results to one public related-card read model.
- [x] Apply the approved public section order and hide empty sections.
- [x] Run focused tests, repository ESLint, and typecheck.
- [x] Commit public data behavior separately.

### Task 6: Server-side admin search and validation

**Files:**
- Modify: `app/actions/admin-attraction-actions.ts`
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Modify: `app/(admin)/admin/attractions/[id]/edit/page.tsx`
- Test: `tests/unit/admin-attraction-related-content.test.ts`

- [x] Replace `getAdminAllContentList()` picker usage with typed server-side search actions.
- [x] Support query, page, content type, selected IDs, and stable pagination metadata.
- [x] Return selected records even when they become inactive so admins can repair the section.
- [x] Validate mode, maximum item count, target IDs, self-links, and permissions server-side.
- [x] Call the transactional RPC and fail visibly on any unsuccessful result.
- [x] Revalidate only affected admin and public attraction paths.
- [x] Commit backend/admin contracts before the UI refactor.

### Task 7: Related-content workspace UX

**Files:**
- Refactor: `components/admin/attractions/visual-editor/RelatedContentForm.tsx`
- Modify: `components/admin/attractions/visual-editor/AttractionVisualEditor.tsx`
- Test: `tests/unit/admin-attraction-related-content-ui.test.tsx`

- [x] Build one Thai-first workspace with four content tabs.
- [x] Add accessible mode controls with concise consequences.
- [x] Add paginated debounced search, loading, error, empty, and retry states.
- [x] Replace the fake drag affordance with working move-up/move-down icon controls.
- [x] Add selected-item status, edit links, limits, suggestion preview, dirty state, Save, and Cancel.
- [x] Preserve a stable mobile drawer footer and 44px touch targets.
- [x] Run Testing Library tests and `impeccable` detection.
- [x] Commit the admin UX independently.

### Task 7A: Attraction form ownership and duplicate-entry cleanup

**Files:**
- Modify: `components/admin/attractions/visual-editor/AttractionVisualEditor.tsx`
- Modify: `components/admin/attractions/visual-editor/SectionForms.tsx`
- Modify: `components/admin/attractions/AttractionForm.tsx` only if the draft-create boundary is unclear
- Test: `tests/unit/attraction-editor-field-ownership.test.ts`

- [x] Inventory every attraction mutation field and assign exactly one edit workspace owner.
- [x] Ensure draft creation asks only for minimum identity, geography, primary category, and initial status.
- [x] Remove duplicate visible controls and misleading helper copy; use links or summaries when another workspace owns the value.
- [x] Ensure content, category, status, media, and related-content saves cannot overwrite fields owned by another workspace with stale hidden values.
- [x] Keep the ownership labels and public-page map understandable on mobile.
- [x] Add a source-contract regression test for duplicate field names across edit workspaces.
- [x] Commit the ownership cleanup separately.

### Task 8: Public section presentation

**Files:**
- Modify: `components/attractions/attraction-cards-row.tsx`
- Modify: `components/attractions/attraction-tabs.tsx`
- Modify: `app/(public)/attractions/[slug]/page.tsx`
- Test: `tests/unit/attraction-related-sections-ui.test.tsx`

- [x] Render a mobile horizontal rail and desktop four-column grid without layout shifts.
- [x] Show truthful recommendation reasons only when evidence exists.
- [x] Keep editorial/manual cards visually clean without false algorithm claims.
- [x] Use a horizontally scrollable section navigation on desktop and a clear mobile selector.
- [x] Confirm public empty states do not expose unfinished CMS sections.
- [x] Run responsive component tests and browser screenshots at mobile and desktop widths.
- [x] Commit public presentation separately.

### Task 9: Final verification and release handoff

**Files:**
- Modify: `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`
- Modify: `docs/modules/MODULE_01_PUBLIC_ATTRACTIONS.md`

- [x] Run `git diff --check` for the complete Phase 19 range.
- [x] Run ESLint on all changed TypeScript/TSX files with zero errors and zero new warnings.
- [x] Run focused tests, then `npm test -- --run`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run build` and restore generated `next-env.d.ts` if necessary.
- [x] Run attraction detail and admin editor Playwright/browser smoke tests.
- [x] Confirm no `.playwright-cli`, `.tmp`, secrets, SQL execution artifacts, or generated files are committed.
- [x] Review every local commit and report the exact migration file to run later.
- [x] Do not push until the user explicitly approves after the final report.
