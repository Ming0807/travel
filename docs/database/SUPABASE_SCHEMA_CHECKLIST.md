# Supabase Production Schema Checklist

Before any production deployment or major testing cycle, verify that the following Supabase schema objects and configurations are active and correctly deployed. 

**IMPORTANT WARNING:** Manual runs in the Supabase SQL Editor do **not** automatically repair or record entries in the `supabase_migrations.schema_migrations` table. If your local migration state diverges from the remote state, you must resolve the drift using `supabase db remote commit` or by manually aligning the `schema_migrations` table. Do not run production migrations manually via the Supabase Studio SQL editor unless strictly necessary for hotfixes (and even then, document the manual drift).

## Checklist

### 1. Permissions & RLS
- [ ] **`media.activate` Permission**: Verify that the `media.activate` permission exists in the `permissions` table and is assigned to the appropriate roles (e.g., `admin`, `super_admin`).
- [ ] **Storage Buckets RLS**: `visit-photos`, `certificate-files`, and `export-files` should have their `public` column set to `false`. Their RLS policies should restrict access to the Service Role only.

### 2. Dashboard & Analytics
- [ ] **`dashboard_daily_summary` Table**: Ensure this materialized view or summary table is created and tracking daily visits, XP, and unique tourists.
- [ ] **Refresh Function/Trigger**: Ensure the Postgres function (e.g., `refresh_dashboard_daily_summary()`) is present and either invoked via a pg_cron job or a webhook/trigger.

### 3. Core Tables
- [ ] **`travel_stories` Table**: Ensure the `travel_stories` table exists and includes columns like `story_id`, `tourist_id`, `title`, `content`, `status`, and `published_at`.
- [ ] **`media_assets.thumbnail_storage_path`**: Verify that the `media_assets` table (or `content_media` if applicable) includes the `thumbnail_storage_path` column for optimized image delivery.

### 4. Indexes
- [ ] **Public Listing Indexes**: Confirm that B-tree or GiST indexes exist for public listings to optimize read performance. Essential indexes include:
  - `idx_attractions_is_published_is_active`
  - `idx_checkin_codes_attraction_id`
  - `idx_visits_tourist_id`
  - `idx_tourist_stamps_tourist_id_attraction_id` (Unique)

## Resolving Drift
If you find that a schema object exists but `supabase db push` or `supabase status` complains about migration drift:
1. Identify the missing migration version in `supabase_migrations.schema_migrations`.
2. Do not just delete the migration file. Instead, you may need to insert a dummy record in the `schema_migrations` table to mark it as applied, OR use `supabase migration repair --status applied <version>`.
