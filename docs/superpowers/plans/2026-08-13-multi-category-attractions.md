# Multi-category Attractions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each attraction use one primary and up to three secondary controlled categories, with all-category public/admin discovery and primary-only analytics.

**Architecture:** Retain `attractions.attraction_type_id` as the compatibility primary category and add normalized `attraction_type_assignments`. All category writes go through a service-role-only PostgreSQL RPC so the legacy column and assignment set change atomically. Public and admin discovery filter through assignment IDs; cards and dashboards remain primary-category based.

**Tech Stack:** PostgreSQL/Supabase migrations and RLS, Next.js 16 server actions, TypeScript, Zod, React/Tailwind, Vitest, Playwright.

## Global Constraints

- Maximum four active categories per attraction.
- Exactly one selected category is primary; a draft may have none.
- Publishing requires a primary category.
- Public/admin discovery matches all assignments; dashboards use only the primary.
- Preserve existing `attractions.attraction_type_id` and existing URLs.
- Thai-first, touch-friendly CMS at 320px and larger.
- No destructive migration or unrelated refactor.

---

### Task 1: Normalized schema and atomic category sync

**Files:**
- Create: `supabase/migrations/20260813000000_add_attraction_type_assignments.sql`
- Create: `tests/unit/attraction-category-migration.test.ts`
- Modify: `docs/database/DATA_DICTIONARY.md`
- Modify: `docs/database/RELATIONSHIPS.md`

**Interfaces:**
- Produces table `attraction_type_assignments(attraction_id, attraction_type_id, is_primary, display_order)`.
- Produces RPC `sync_attraction_types(p_attraction_id bigint, p_attraction_type_ids bigint[], p_primary_attraction_type_id bigint, p_is_published boolean default null) returns void`.

- [ ] Write a failing migration contract test for table/FKs, unique primary index, backfill, constraints, RLS, private RPC grants, and compatibility-column synchronization.
- [ ] Run `npx vitest run tests/unit/attraction-category-migration.test.ts --maxWorkers=1`; expect missing migration failure.
- [ ] Implement the transaction-safe migration and update database docs.
- [ ] Run the migration test; expect pass.
- [ ] Commit `feat: add attraction category assignments`.

### Task 2: Validation and repository contracts

**Files:**
- Modify: `lib/validation/admin-attraction.ts`
- Create: `lib/repositories/attraction-category.repository.ts`
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Modify: `app/actions/admin-attraction-actions.ts`
- Create: `tests/unit/attraction-category-validation.test.ts`
- Create: `tests/unit/admin-attraction-categories.test.ts`

**Interfaces:**
- Consumes RPC from Task 1.
- Produces `parseAttractionCategoryFormData(formData)` returning `{ attractionTypeIds: number[]; primaryAttractionTypeId: number | null }`.
- Produces `listAttractionTypeAssignments(attractionId)` and `syncAttractionTypeAssignments(...)`.
- Extends `AdminAttractionRow` with ordered `attraction_categories` summaries while retaining `attraction_type_id`.

- [ ] Write failing tests for duplicate normalization, max four, primary membership, published requirement, repository ordering, and RPC payload.
- [ ] Run targeted tests; expect failures.
- [ ] Implement FormData `getAll("attractionTypeIds")` parsing and repository helpers.
- [ ] Update create/update actions to save base attraction then synchronize assignments, returning Thai field errors for category failures.
- [ ] Run targeted tests and typecheck; expect pass.
- [ ] Commit `feat: add attraction category backend contracts`.

### Task 3: Admin category picker UX

**Files:**
- Create: `components/admin/attractions/AttractionCategoryPicker.tsx`
- Modify: `components/admin/attractions/AttractionForm.tsx`
- Modify: `components/admin/attractions/visual-editor/SectionForms.tsx`
- Modify: `components/admin/attractions/visual-editor/AttractionVisualEditor.tsx`
- Modify: `app/(admin)/admin/attractions/[id]/edit/page.tsx`
- Create: `tests/unit/attraction-category-picker.test.tsx`

**Interfaces:**
- Consumes active category options and ordered assignments from Task 2.
- Emits repeated `attractionTypeIds` fields and one `primaryAttractionTypeId` field.

- [ ] Write failing component tests for first-selection primary, primary switching, primary removal fallback, max-four enforcement, inactive assigned visibility, and 44px controls.
- [ ] Run picker test; expect failure.
- [ ] Implement accessible checkbox rows plus explicit primary radio controls and Thai helper/error copy.
- [ ] Replace the single select in full edit and visual settings; keep quick create as one primary select.
- [ ] Run picker/admin visual tests and typecheck; expect pass.
- [ ] Commit `feat: add multi-category attraction CMS`.

### Task 4: Public filtering and detail presentation

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `components/attractions/attraction-header.tsx`
- Modify: `app/(public)/attractions/[slug]/page.tsx`
- Modify: `tests/unit/public-attractions-listing.test.ts`
- Modify: `tests/unit/public-attraction-detail-repository.test.ts`
- Modify: `tests/unit/attraction-detail-ui.test.tsx`

**Interfaces:**
- Public list filter resolves the selected active type to an ID, queries matching assignment attraction IDs, and returns each attraction once.
- Public detail returns ordered categories with primary first.
- Existing card DTO keeps one primary category label.

- [ ] Add failing repository tests proving secondary-category matches, deduplication, unknown-category empty results, and primary card mapping.
- [ ] Add failing UI test for primary plus secondary category labels.
- [ ] Implement assignment-aware filtering without changing existing query parameters.
- [ ] Render primary and secondary labels accessibly on details.
- [ ] Run public listing/detail tests; expect pass.
- [ ] Commit `feat: support multi-category attraction discovery`.

### Task 5: Admin list, export, and analytics parity

**Files:**
- Modify: `lib/repositories/admin-attraction.repository.ts`
- Modify: `app/(admin)/admin/attractions/page.tsx`
- Modify: `app/api/admin/export/attractions/route.ts`
- Modify: `tests/unit/admin-content-export-filter-parity.test.ts`
- Modify: `tests/unit/export-routes.test.ts`
- Modify: `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`

**Interfaces:**
- Admin category filter matches all assignments.
- Admin list exposes primary label and secondary count.
- Export fields are `primary_category_th`, `primary_category_en`, `all_categories_th`, and `all_categories_en`.
- Dashboard queries remain on `attractions.attraction_type_id` and documentation names it primary category.

- [ ] Write failing tests for all-assignment admin filtering and export columns/order.
- [ ] Implement two-step assignment ID filtering without unbounded result loading.
- [ ] Render `หมวดหลัก +N` in desktop/mobile admin rows.
- [ ] Add stable delimiter-separated export fields and update metric documentation.
- [ ] Run export, admin filter, and dashboard tests; expect pass.
- [ ] Commit `feat: align attraction category admin and exports`.

### Task 6: End-to-end verification and rollout documentation

**Files:**
- Modify: `tests/e2e/attractions-filters.spec.ts`
- Create: `tests/e2e/admin-attraction-categories.spec.ts`
- Modify: `docs/modules/MODULE_01_PUBLIC_ATTRACTIONS.md`
- Modify: `docs/modules/MODULE_09_ADMIN_ATTRACTION_CMS.md`
- Modify: `docs/database/SUPABASE_SCHEMA_CHECKLIST.md`

**Interfaces:**
- Verifies the complete category flow while leaving the SQL migration for explicit Supabase deployment.

- [ ] Add E2E coverage for selecting primary/secondary categories and filtering a result by a secondary category.
- [ ] Run targeted unit suites, `npm run typecheck`, and changed-file ESLint.
- [ ] Run `npm test -- --run`, `npm run build`, and Playwright smoke when the local authenticated fixture is available.
- [ ] Confirm `next-env.d.ts` and generated artifacts are clean.
- [ ] Document migration filename, verification SQL, rollback behavior, and production smoke steps.
- [ ] Commit `test: verify multi-category attraction flow`.
