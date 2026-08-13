# Multi-category Attractions Design

Date: 2026-08-13
Status: Approved design, pending implementation plan

## 1. Problem

An attraction currently has one optional `attractions.attraction_type_id`. Real destinations often belong to more than one useful category. For example, Wat Khuha Phimuk (Wat Na Tham) can be classified as:

- Primary: Religious Sites
- Secondary: Historical Sites
- Secondary: Nature & Ecotourism
- Secondary: Culture & Tradition

A single category makes public discovery incomplete. Replacing the existing column immediately would, however, affect public queries, admin filters, exports, and dashboard metrics.

## 2. Decisions

1. An attraction may have one to four active categories.
2. Exactly one selected category is the primary category.
3. Draft attractions may temporarily have no category. Publishing requires a primary category.
4. Public category filters match every assigned category.
5. Public cards use only the primary category to remain easy to scan.
6. Public detail pages may show the primary category and up to three secondary categories.
7. Dashboard grouping and dashboard category filters use only the primary category, preventing double counting.
8. Admin list filters match every assigned category and show the primary category plus a `+N` indicator.
9. Exports contain separate `primary_category` and `all_categories` columns.
10. The existing `attractions.attraction_type_id` remains the compatibility source for the primary category during this phase.

## 3. Alternatives Considered

### A. Keep one category and add free-form tags

Low implementation cost, but tags would duplicate the controlled taxonomy and would not provide reliable category filtering or analytics.

### B. Add a join table while retaining the primary category column (selected)

Supports public discovery across every assigned category while preserving current dashboard and export behavior. Existing data can be backfilled without loss, and migration can be incremental.

### C. Remove `attractions.attraction_type_id` immediately

Conceptually clean, but it creates unnecessary risk across dashboard calculations, PostgREST joins, exports, forms, and existing tests. This may be reconsidered only after all consumers have migrated.

## 4. Database Design

Add `public.attraction_type_assignments`:

| Column | Type | Rule |
| --- | --- | --- |
| `attraction_id` | bigint | FK to `attractions`, cascade on delete |
| `attraction_type_id` | bigint | FK to `attraction_types`, restrict on delete |
| `is_primary` | boolean | Not null, default false |
| `display_order` | integer | Not null, default 0, non-negative |
| `created_at` | timestamptz | Not null, default now() |
| `updated_at` | timestamptz | Nullable |

Constraints and indexes:

- Primary key or unique constraint on `(attraction_id, attraction_type_id)`.
- Partial unique index on `attraction_id WHERE is_primary = true`.
- Index on `(attraction_type_id, attraction_id)` for public and admin filtering.
- Check `display_order >= 0`.

Migration behavior:

1. Create the assignment table and policies.
2. Backfill every non-null `attractions.attraction_type_id` as a primary assignment.
3. Add a trigger that mirrors future changes to `attractions.attraction_type_id` into the primary assignment.
4. Add an RPC function that atomically validates and replaces an attraction's assignment set, then updates `attractions.attraction_type_id` to the selected primary category.
5. Keep the migration idempotent where practical.

The RPC must reject:

- Duplicate IDs.
- More than four categories.
- A primary ID not present in the selected IDs.
- Missing or inactive category IDs.
- More than one primary category.

RLS:

- Public users may read assignments only for published, active attractions and active attraction types.
- Mutations remain server-side and require the existing attraction update permission.

## 5. Admin UX

### Quick create

Keep one optional primary-category select. This preserves a short creation flow. Secondary categories are configured in the visual editor after creation.

### Visual editor and full edit form

Replace the single category select with a category selector containing:

- Search only if the taxonomy grows beyond the current small list.
- Touch-sized checkbox rows for selecting up to four categories.
- A radio/star control inside selected rows for choosing the primary category.
- Selected chips ordered with the primary category first.
- Clear helper text: `หมวดหลักใช้บนการ์ดและ Dashboard ส่วนหมวดรองช่วยให้ค้นหาสถานที่พบจากหลายบริบท`.
- Inline validation when no primary is selected or more than four categories are selected.
- An explicit `หมวดหลัก` label rather than relying only on color or an icon.

When the admin selects the first category, it becomes primary automatically. If the primary category is removed, the first remaining category becomes primary and the UI announces the change.

## 6. Public Behavior

- A visitor selecting one category sees attractions where that category is either primary or secondary.
- Category URLs and query parameters remain backward compatible.
- Cards keep the current single category field, populated from the primary assignment.
- Detail headers display the primary category first and secondary categories after it.
- Empty or legacy records continue to render without fake category data.

## 7. Analytics and Reporting

- Dashboard metrics continue reading `attractions.attraction_type_id` and are relabeled where needed as `หมวดหลัก`.
- A visit or attraction must never be counted multiple times in a dashboard total because of secondary categories.
- Admin content filters may use all assignments because their purpose is content discovery, not additive analytics.
- CSV/XLSX attraction exports include both the primary label and a stable delimiter-separated list of all assigned category labels.
- A future co-category report may use the assignment table, but it is outside this phase.

## 8. Application Changes

Expected areas:

- Supabase migration, RLS, indexes, trigger, and RPC.
- Generated/manual database types if used by the repository layer.
- Admin attraction validation and FormData parsing with `getAll`.
- Admin attraction repository reads and category mutation helper.
- Quick create, full form, and visual editor settings UX.
- Public attraction list/detail mapping and category filtering.
- Admin list filtering and attraction export.
- Dashboard wording only; dashboard formulas remain primary-category based.
- Unit, repository, action, UI, migration, and E2E regression tests.
- Database, relationship, module, API, and CMS workflow documentation.

## 9. Error Handling

- A failed assignment RPC leaves the previous category set unchanged.
- The UI preserves the user's selection and shows a Thai field-level error.
- Inactive categories already assigned to historical content remain readable to admins but cannot be newly selected.
- Public queries fail closed to an empty result for an unknown category rather than returning unrelated attractions.

## 10. Acceptance Criteria

1. Existing attractions retain their current category after migration.
2. An admin can select up to four categories and exactly one primary category.
3. Wat Khuha Phimuk can be saved with Religious Sites as primary and the agreed secondary categories.
4. Public filtering by any assigned category returns the attraction once.
5. Public cards display only the primary category.
6. Public detail displays all selected active categories in primary-first order.
7. Dashboard totals and category breakdowns do not double count.
8. Admin filters and exports understand secondary categories.
9. Invalid assignments are rejected atomically.
10. Mobile CMS controls remain usable at 320px and larger.
11. Existing single-category URLs and records continue to work during rollout.

## 11. Rollout

1. Apply and verify the migration in Supabase.
2. Deploy backward-compatible reads and admin writes.
3. Verify backfill counts against attractions with non-null primary categories.
4. Smoke-test one legacy attraction and Wat Khuha Phimuk.
5. Monitor category-filter queries and dashboard totals.

No destructive column removal is included in this rollout.
