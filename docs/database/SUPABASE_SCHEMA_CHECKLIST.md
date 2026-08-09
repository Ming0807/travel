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
- [ ] **Migration `20260730000000_harden_public_story_search.sql`**: Apply after the Story editorial migrations.
- [ ] **Story search indexes**: Confirm `idx_travel_stories_public_feed_stable`, `idx_travel_stories_public_title_trgm`, and `idx_travel_stories_public_excerpt_trgm` exist.
- [ ] **Canonical public policy**: Confirm public Story SELECT requires both `status = 'published'` and `is_published = true`.
- [ ] **Migration `20260730010000_replace_story_recommendations_rpc.sql`**: Apply after the Story editorial platform migration.
- [ ] **Atomic recommendation RPC**: Confirm `replace_story_recommendations(bigint, jsonb, uuid)` exists and execute permission is limited to `service_role`.
- [ ] **Recommendation constraints**: Confirm the RPC rejects self-links, duplicates, non-public targets, reasons over 255 characters, and more than 12 targets before replacing the list in one transaction.

### 8. Privacy-Safe Story Engagement (P2)
- [ ] **Migration `20260730100000_add_story_engagement_signals.sql`**: Apply after the Story editorial and recommendation migrations.
- [ ] **Minimized event tables**: Confirm `story_engagement_events`, `story_engagement_daily`, `story_engagement_dedup`, and `story_engagement_rate_buckets` exist with RLS enabled and no anonymous policies.
- [ ] **No identity fields**: Confirm the tables contain no tourist ID, visit ID, guest token, provider identity, raw IP, URL, referrer, or arbitrary metadata.
- [ ] **Atomic event RPC**: Confirm `record_story_engagement_event(...)` validates public Story state and atomically deduplicates before inserting.
- [ ] **Distributed rate limit RPC**: Confirm `consume_story_engagement_rate_limit(...)` is executable only by `service_role`.
- [ ] **Retention RPCs**: Confirm `aggregate_story_engagement_events(...)` and `purge_story_engagement_data()` exist and are scheduled through an approved job before production traffic.
- [ ] **Daily maintenance**: Confirm Vercel registered `/api/cron/story-engagement-maintenance` at `18:17 UTC` (`01:17 Asia/Bangkok`) and `CRON_SECRET` is set in production.
- [ ] **Server secret**: Confirm `CONTENT_ENGAGEMENT_HASH_SECRET` is set separately in preview and production and is not exposed as a public environment variable.
- [ ] **Post-apply verification**: Run `npm run db:story-engagement:verify` after applying the migration. It checks required tables, forbidden identity columns, and execute privileges without mutating data.

### 9. Yala Destination Launch Scope (P2)
- [ ] **Migration `20260730110000_add_destination_launch_scope.sql`**: Apply after the Story engagement migration.
- [ ] **Migration `20260730111000_enforce_destination_launch_scope.sql`**: Apply immediately after the destination column migration.
- [ ] **Non-destructive scope**: Confirm Yala is the only `live` destination and Pattani/Narathiwat rows and historical content remain present.
- [ ] **Origin geography preserved**: Confirm active origin provinces still contain more than Yala and the public active-province policy does not reference `destination_status`.
- [ ] **Public policy scope**: Confirm destination content policies use the launch-scope helper functions.
- [ ] **Service-role scope**: Confirm public repositories, check-in validation, passport targets, and new CMS forms repeat the destination boundary.
- [ ] **Post-apply verification**: Run `npm run db:destination-scope:verify`. This command is read-only and requires `SUPABASE_DATABASE_URL`.
- [ ] **Official Yala import**: Do not run `supabase/seed.sql` in production. Prepare a separate provenance-checked import only after official geography/content validation.

### 10. Research Evaluation Layer (Phase 18)
- [ ] **Migration `20260808000000_add_research_core.sql`**: Apply only after advisor/ethics requirements are confirmed for the target environment.
- [ ] **Migration `20260808001000_harden_research_data_quality.sql`**: Apply after core research; verify nullable preferred language/source and facility score round-trip.
- [ ] **Migration `20260808002000_add_attraction_improvement_workflow.sql`**: Apply after data-quality hardening.
- [ ] **Approval gate**: Confirm a study cannot activate without advisor approval, ethics status, approval reference, and recorder.
- [ ] **Immutable versions**: Confirm active protocol, notice, consent, instrument items, tasks, and deployments cannot be edited.
- [ ] **Server-only RPCs**: Confirm accept/link/save/withdraw operator and tourist research functions are executable only by `service_role`.
- [ ] **Collection modes**: Confirm `field_observation`, `simulated_usability`, and `pilot_internal` remain separable in analytics and exports.
- [ ] **Privacy**: Confirm RLS is enabled, public policies are absent, withdrawn/excluded sessions are omitted, and microdata export rejects `n < 10`.
- [ ] **Field gate**: Do not create/activate the final production study or begin recruitment until Workstream 18A and pilot/freeze approvals are signed off.

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
