# Restaurant Category CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a database-backed, multi-category Restaurant CMS whose Admin and public navigation stay synchronized without code changes.

**Architecture:** PostgreSQL owns category records and transactional assignments. Focused repositories expose category contracts to admin and public server components; shared picker/navigation components consume those contracts. The legacy `food_type` column remains a one-release compatibility field only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase PostgreSQL/PostgREST, Zod, Tailwind CSS, Vitest, Playwright.

## Global Constraints

- Thai-first user-facing copy.
- One restaurant may have multiple categories.
- Draft restaurants may be uncategorized; published restaurants require an active category.
- Archive linked categories; hard-delete only unused categories.
- Public lists expose only active/published records in the live destination scope.
- No new client-side database access or production dependency.
- Tests are written and observed failing before production behavior is added.

---

### Task 1: Database Category Model And Backfill

**Files:**
- Create: `supabase/migrations/20260812000000_create_restaurant_categories.sql`
- Test: `tests/unit/restaurant-category-migration.test.ts`
- Modify: `docs/database/DATA_DICTIONARY.md`

**Interfaces:**
- Produces: `restaurant_categories`, `restaurant_category_assignments`, `sync_restaurant_categories(bigint,bigint[])`.

- [ ] Write a migration contract test asserting table constraints, indexes, RLS, grants, seed values, backfill, and transactional sync function.
- [ ] Run `npm test -- --run tests/unit/restaurant-category-migration.test.ts` and confirm failure because the migration is absent.
- [ ] Implement the idempotent migration with ten seed categories and compatibility backfill.
- [ ] Re-run the migration test and confirm pass.
- [ ] Document both tables and the deprecated status of `restaurants.food_type`.
- [ ] Commit as `feat: add restaurant category data model`.

### Task 2: Category Validation And Repository Contracts

**Files:**
- Create: `lib/validation/restaurant-category.ts`
- Create: `lib/repositories/admin-restaurant-category.repository.ts`
- Test: `tests/unit/admin-restaurant-category.test.ts`
- Modify: `lib/validation/admin-restaurant.ts`
- Modify: `lib/repositories/admin-restaurant.repository.ts`

**Interfaces:**
- Produces: `RestaurantCategoryInput`, `AdminRestaurantCategory`, `listAdminRestaurantCategories()`, `createAdminRestaurantCategory()`, `updateAdminRestaurantCategory()`, `setAdminRestaurantCategoryActive()`, `deleteUnusedAdminRestaurantCategory()`, `syncAdminRestaurantCategories()`.
- Changes restaurant mutation input from `foodType` authority to `categoryIds: number[]` with a compatibility `foodType` derived server-side.

- [ ] Write failing validation tests for slug normalization, section enum, order bounds, duplicate category IDs, and the published-without-category rejection.
- [ ] Write failing repository tests for list counts, duplicate slug errors, archive, blocked linked delete, and RPC assignment sync.
- [ ] Implement schemas and repository mapping with typed errors.
- [ ] Integrate create/update restaurant operations with assignment sync and best-effort create cleanup.
- [ ] Run focused validation and repository tests until green.
- [ ] Commit as `feat: add restaurant category repository contracts`.

### Task 3: Admin Category Management

**Files:**
- Create: `app/(admin)/admin/restaurants/categories/page.tsx`
- Create: `components/admin/restaurants/categories/RestaurantCategoryManager.tsx`
- Create: `app/actions/admin-restaurant-category-actions.ts`
- Test: `tests/unit/admin-restaurant-category-ui.test.tsx`
- Modify: `app/(admin)/admin/restaurants/page.tsx`

**Interfaces:**
- Consumes category repository functions from Task 2.
- Produces a Thai-first category CRUD and ordering surface under Restaurant CMS.

- [ ] Write failing component/action tests for create, edit, order, feature, archive/reactivate, permission checks, and linked-delete refusal.
- [ ] Implement server page permission guard and category loading.
- [ ] Implement accessible manager controls with 44px targets, status/count labels, confirmation for destructive actions, and no nested forms.
- [ ] Add `จัดการหมวดหมู่` to the restaurant list header.
- [ ] Run tests, ESLint, typecheck, and Impeccable detect.
- [ ] Commit as `feat: add restaurant category admin cms`.

### Task 4: Multi-Category Restaurant Editing

**Files:**
- Create: `components/admin/restaurants/RestaurantCategoryPicker.tsx`
- Test: `tests/unit/restaurant-category-picker.test.tsx`
- Modify: `components/admin/restaurants/RestaurantForm.tsx`
- Modify: `components/admin/restaurants/visual-editor/SectionForms.tsx`
- Modify: `components/admin/restaurants/visual-editor/RestaurantVisualEditor.tsx`
- Modify: `app/(admin)/admin/restaurants/new/page.tsx`
- Modify: `app/(admin)/admin/restaurants/[id]/edit/page.tsx`
- Modify: `app/actions/admin-restaurant-actions.ts`

**Interfaces:**
- Consumes `AdminRestaurantCategory[]` and selected category IDs.
- Produces repeated `categoryIds` form values parsed with `formData.getAll("categoryIds")`.

- [ ] Write failing picker tests for search, select, remove, archived state, and keyboard labels.
- [ ] Write failing action tests proving repeated IDs survive FormData parsing and publishing without a category returns a Thai field error.
- [ ] Implement the shared searchable multi-select picker.
- [ ] Load categories and assignments into create and visual edit pages.
- [ ] Replace all hardcoded category selects and preserve complete form submissions in visual editor drawers.
- [ ] Run focused tests and typecheck.
- [ ] Commit as `feat: support multiple restaurant categories`.

### Task 5: Admin Listing And Export Parity

**Files:**
- Modify: `app/(admin)/admin/restaurants/page.tsx`
- Modify: `lib/repositories/admin-restaurant.repository.ts`
- Modify: `lib/validation/admin-restaurant.ts`
- Modify: `app/api/admin/export/restaurants/route.ts`
- Test: `tests/unit/admin-restaurant-listing.test.ts`
- Test: `tests/unit/admin-content-export-filter-parity.test.ts`

**Interfaces:**
- Produces category-slug filtering, category chips, uncategorized status, and matching export behavior.

- [ ] Write failing tests for category filtering and full category export.
- [ ] Add database-backed category filter options to the list page.
- [ ] Render category chips and a clear uncategorized warning.
- [ ] Apply the same category filter to CSV export and include a `หมวดหมู่ทั้งหมด` column.
- [ ] Run listing/export tests and lint.
- [ ] Commit as `feat: align restaurant list and category exports`.

### Task 6: Public Category Navigation And Filtering

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `app/(public)/restaurants/page.tsx`
- Modify: `components/restaurants/RestaurantFilterBar.tsx`
- Modify: `components/restaurants/RestaurantCategoryNav.tsx`
- Modify: `components/restaurants/RestaurantDirectoryItem.tsx`
- Modify: `lib/hospitality/restaurant-directory.ts`
- Test: `tests/unit/public-hospitality-listing.test.ts`
- Test: `tests/unit/restaurant-directory.test.ts`
- Test: `tests/unit/restaurant-directory-ui.test.tsx`
- Modify: `tests/e2e/public-hospitality.spec.ts`

**Interfaces:**
- Produces `PublicRestaurantCategory`, `listPublicRestaurantCategories()`, category-slug listing filter, legacy URL redirect, counts, featured top navigation, and expandable desktop sidebar.

- [ ] Write failing repository tests for active category counts and slug filtering over published/live-scope restaurants.
- [ ] Write failing UI tests for hidden empty categories, featured ordering, eight-item expansion, and legacy redirects.
- [ ] Extend public DTO mapping with all categories while retaining primary `foodType` compatibility.
- [ ] Replace hardcoded public options with category records and stable `category=<slug>` URLs.
- [ ] Implement `ดูหมวดเพิ่มเติม` for more than eight sidebar categories and preserve the mobile filter contract.
- [ ] Run unit and Playwright hospitality tests.
- [ ] Commit as `feat: drive restaurant navigation from category cms`.

### Task 7: Documentation And Release Verification

**Files:**
- Modify: `docs/frontend/ROUTES_STRUCTURE.md`
- Modify: `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`
- Modify: `docs/backend/API_ENDPOINTS.md`
- Modify: `docs/database/SUPABASE_SCHEMA_CHECKLIST.md`

**Interfaces:**
- Produces the operator workflow, migration run instructions, rollback notes, and public category behavior contract.

- [ ] Update docs with category lifecycle, permissions, public visibility, migration order, and compatibility behavior.
- [ ] Run `git diff --check` and targeted ESLint.
- [ ] Run `npm run typecheck` and all focused Vitest suites.
- [ ] Run `npm run build`; restore `next-env.d.ts` exactly afterward.
- [ ] Start the local app and smoke create category -> assign restaurant -> public category navigation on desktop/mobile.
- [ ] Run Impeccable detect on changed UI files and confirm zero warnings.
- [ ] Commit as `docs: document restaurant category cms`.
- [ ] Push `main` only after the complete diff and checks pass.

