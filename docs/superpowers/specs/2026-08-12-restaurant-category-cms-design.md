# Restaurant Category CMS Design

**Date:** 2026-08-12  
**Status:** Approved for implementation

## Purpose

Replace the restaurant `food_type` free-text dependency with a production category system that an administrator can manage without code changes. One restaurant may belong to multiple categories, while public navigation shows only active categories that contain active, published restaurants in the current destination scope.

## Decisions

1. Categories are first-class database records, not settings or hardcoded UI options.
2. Restaurants and categories have a many-to-many relationship.
3. A draft restaurant may have no category. A published restaurant must have at least one active category.
4. Categories referenced by restaurants are archived instead of hard-deleted.
5. Category assignment replacement is executed by one PostgreSQL function so delete-and-insert cannot leave partial state.
6. The existing `restaurants.food_type` column remains temporarily for migration compatibility but is no longer authoritative.
7. Public filtering uses stable category slugs. Legacy `foodType` URLs redirect to the matching category URL when possible.
8. Category management belongs in the Restaurant CMS, not in global Settings.

## Data Model

### `restaurant_categories`

| Column | Rule |
| --- | --- |
| `category_id` | bigint identity primary key |
| `slug` | lowercase URL-safe value, case-insensitive unique |
| `name_th` | required Thai display name |
| `name_en` | optional English display name |
| `section_key` | `local`, `meals`, `cafes`, or `other` |
| `display_order` | non-negative integer |
| `is_featured` | controls compact top navigation eligibility |
| `is_active` | archive state |
| timestamps | `created_at`, `updated_at` |

### `restaurant_category_assignments`

Composite primary key: `(restaurant_id, category_id)`. Both foreign keys cascade when their owner is actually removed. The normal category lifecycle remains archive-first.

### Backfill

Seed the ten controlled categories currently represented in code. Backfill assignments by matching normalized legacy `food_type` values, including composite text such as `Western / Thai`. A restaurant that cannot be mapped remains uncategorized and is surfaced to admins rather than assigned a misleading category.

## Admin UX

`/admin/restaurants` gains:

- a real category filter sourced from the database;
- a `จัดการหมวดหมู่` action;
- category chips in table/card rows;
- an uncategorized warning state.

`/admin/restaurants/categories` provides:

- search and status filtering;
- category name, slug, section, restaurant usage count, featured state, active state, and order;
- create and edit forms with Thai-first labels;
- up/down ordering controls;
- archive/reactivate controls;
- blocked permanent deletion when assignments exist.

Restaurant create/edit surfaces use a searchable checkbox picker with selected chips. Category selection is shared by the standard create form and visual editor. Published restaurants cannot be saved without at least one active category.

## Public UX

- Top category navigation contains only featured categories with published restaurants.
- Desktop sidebar and mobile filter contain all active categories with published restaurants.
- Each category may show a truthful published restaurant count.
- If more than eight categories exist, the sidebar starts with eight and offers `ดูหมวดเพิ่มเติม`; mobile remains a searchable/selectable list.
- Empty categories disappear automatically.
- If category availability cannot be loaded, the listing remains usable and does not claim the catalog is empty.

## Data Flow

```text
Admin category CRUD
  -> restaurant_categories
Admin restaurant save
  -> restaurants
  -> sync_restaurant_categories() transaction
Public category query
  -> active category + assignment + published restaurant scope
Public listing filter
  -> category slug -> eligible restaurant IDs -> paginated restaurants
```

## Permissions And Safety

- `restaurant.read`: view categories and assignments.
- `restaurant.create`: create categories and restaurants.
- `restaurant.update`: edit, reorder, archive, reactivate, and assign categories.
- `restaurant.delete`: permanently delete only unused categories.
- Slugs are validated and case-insensitively unique.
- Public RLS exposes active categories and assignments only when attached to an active, published restaurant in the active destination scope.
- Admin mutations continue through server actions and service-role repositories.

## Compatibility

The first release keeps `food_type` and derives its compatibility value from the first selected category. Public DTOs retain a single `foodType` label for old cards while also exposing `categories`. Export includes both the primary compatibility type and the complete category list.

## Acceptance Criteria

1. Admin creates a new category without editing code.
2. Admin assigns multiple categories to a restaurant.
3. Save failure cannot leave half-replaced category assignments.
4. Drafts may be uncategorized; publishing without an active category is rejected in Thai.
5. Category filters in admin and public pages come from the database.
6. Empty or archived categories do not appear publicly.
7. Category order and featured state control public navigation.
8. Linked categories archive safely; unused categories may be permanently deleted with permission.
9. Existing restaurant data is backfilled without deleting `food_type`.
10. Unit, repository, permission, UI, build, and browser smoke checks pass.

