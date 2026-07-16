# Supabase Production Schema Checklist

Before any production deployment or major testing cycle, verify that the following Supabase schema objects and configurations are active and correctly deployed.

**IMPORTANT WARNING:** Manual runs in the Supabase SQL Editor do **not** automatically repair or record entries in the `supabase_migrations.schema_migrations` table. If your local migration state diverges from the remote state, first verify the actual schema objects, then repair CLI migration history with `supabase migration repair --status applied <version>` when appropriate. Do not run production migrations manually via the Supabase Studio SQL editor unless strictly necessary for hotfixes, and always document the manual drift.

## Checklist

### 1. Permissions & RLS
- [ ] **`media.activate` Permission**: Verify that the `media.activate` permission exists in the `permissions` table and is assigned to the appropriate roles (e.g., `admin`, `super_admin`).
- [ ] **Storage Buckets RLS**: `visit-photos`, `certificate-files`, and `export-files` should have their `public` column set to `false`. Their RLS policies should restrict access to the Service Role only.

### 2. Dashboard & Analytics
- [ ] **`dashboard_daily_summary` Table**: Ensure this standard table is created and tracking daily visits and unique tourists.
- [ ] **Refresh Function/Trigger**: Ensure the Postgres function `refresh_dashboard_summary()` is present and either invoked manually after data changes or scheduled through a controlled job.
- [ ] **Satisfaction Dimension Columns**: Ensure `dashboard_daily_summary` includes `avg_accessibility_score`, `avg_information_score`, and `avg_value_score` from migration `20260623000000_add_dashboard_satisfaction_dimensions.sql`.

### 3. Core Tables
- [ ] **`travel_stories` Table**: Ensure the `travel_stories` table exists and includes columns like `story_id`, `tourist_id`, `title`, `content`, `status`, and `published_at`.
- [ ] **`media_assets.thumbnail_storage_path`**: Verify that the `media_assets` table (or `content_media` if applicable) includes the `thumbnail_storage_path` column for optimized image delivery.

### 4. Indexes
- [ ] **Public Listing Indexes**: Confirm that the public listing and review indexes exist to optimize read performance. Essential indexes include:
  - `idx_attractions_published_active`
  - `idx_attractions_name_th_trgm`
  - `idx_attractions_name_en_trgm`
  - `idx_reviews_public_attraction`
  - `idx_reviews_public_restaurant`

### 5. Atomic Survey Submission
- [ ] **Migration `20260713000000_atomic_survey_submission.sql`**: Apply after the existing dashboard migrations.
- [ ] **Expense uniqueness**: Confirm `uq_visit_expenses_visit` exists and duplicate historical rows were reduced to the latest answer per visit.
- [ ] **Survey RPC**: Confirm `submit_post_certificate_survey(...)` exists and execute permission is limited to `service_role`.
- [ ] **Funnel idempotency**: Confirm `uq_funnel_events_survey_completed_visit` prevents repeated survey submissions from inflating completion counts.

### 6. Certificate Template Defaults
- [ ] **Migration `20260716000000_harden_certificate_template_defaults.sql`**: Apply after the survey and permission migrations.
- [ ] **Default uniqueness**: Confirm `uq_certificate_templates_global_default_language` and `uq_certificate_templates_attraction_default_language` exist.
- [ ] **Resolver index**: Confirm `idx_certificate_templates_active_scope_language` exists for active scope/language lookup.
- [ ] **Active default rule**: Confirm `certificate_templates_default_requires_active` prevents an inactive default template.
- [ ] **Atomic default RPC**: Confirm `set_certificate_template_default(bigint)` exists and execute permission is limited to `service_role`.
- [ ] **Orientation metadata**: Existing template rows should have `layout_config_json.orientation` set to `landscape` or `portrait`.

### 7. Story Editorial Platform (P2)
- [x] **Migration `20260717000000_add_story_editorial_platform.sql`**: Applied manually and verified by the project owner on 2026-07-17.
- [x] **Migration `20260717010000_add_story_editorial_change_rpc.sql`**: Applied manually and confirmed by the project owner on 2026-07-17.
- [x] **Atomic editorial RPC**: `apply_story_editorial_change(...)` is installed with execute permission limited to `service_role` by the migration.
- [ ] **Atomic save behavior**: Confirm one call updates the story and topics, creates one immutable revision, and records a workflow event in the same transaction.
- [ ] **Migration history**: If either file was run in SQL Editor, reconcile `supabase_migrations.schema_migrations` through the controlled repair process described below.

## Resolving Drift
Run the read-only history comparison before applying or repairing migrations:

```bash
npm run db:migrations:check
```

The command compares every local `supabase/migrations/*.sql` version with `supabase_migrations.schema_migrations`. It never applies SQL and exits non-zero for pending, remote-only, duplicate, invalid, or name-mismatched history.

If the direct host (`db.<project-ref>.supabase.co`) resolves only to IPv6 and the development network has no IPv6 route, copy the **Session Pooler** connection string from Supabase Dashboard > Connect into `SUPABASE_DATABASE_URL`. Do not guess the pooler region, hostname, username, or password. Keep TLS enabled and never commit the connection string.

If you find that a schema object exists but `supabase db push` or `supabase status` complains about migration drift:
1. Identify the missing migration version in `supabase_migrations.schema_migrations`.
2. Do not just delete the migration file. After manually applying SQL and verifying schema objects, use `supabase migration repair --status applied <version>` if CLI migration history needs repair.
