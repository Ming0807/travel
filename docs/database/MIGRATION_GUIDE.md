# MIGRATION_GUIDE.md

## 1. Document Purpose

This document defines the database migration guide for the **Southern Border Tourism Data & Intelligence Platform**.

It explains how database schema changes should be created, reviewed, executed, and documented.

This guide is intended for developers and AI coding agents such as Codex.

---

## 2. Migration Goal

Database migrations must keep the schema:

- Reliable
- Reproducible
- Versioned
- Reviewable
- Safe for production
- Aligned with documentation
- Compatible with dashboard and reporting requirements

A migration is not complete until the related documentation is updated.

---

## 3. Recommended Database Platform

The recommended database platform is:

```text
Supabase PostgreSQL
```

The migration style may use one of these approaches:

```text
Supabase CLI migrations
SQL migration files
Prisma migrations if Prisma is used
Drizzle migrations if Drizzle is used
```

For this project, SQL migrations are preferred because the database is central to the academic and production design.

---

## 4. Migration Principles

## 4.1 Migrations Must Be Ordered

Every migration must be ordered by timestamp or sequence number.

Recommended naming:

```text
YYYYMMDDHHMMSS_description.sql
```

Example:

```text
20260518000100_create_geography_tables.sql
20260518000200_create_attraction_tables.sql
20260518000300_create_tourist_identity_tables.sql
```

---

## 4.2 Migrations Must Be Repeatable in a Clean Environment

A new developer or deployment environment must be able to run all migrations from zero and get the same schema.

Do not rely on manual database changes.

---

## 4.3 Migrations Must Be Small Enough to Review

Avoid huge migrations that create every table and policy in one file.

Preferred grouping:

```text
geography tables
attraction tables
tourist tables
visit tables
certificate and stamp tables
survey and expense tables
analytics tables
security tables
RLS policies
indexes
seed data
```

---

## 4.4 Separate Schema and Seed Data

Schema migrations should create structure.

Seed scripts should insert master data.

Good:

```text
migrations/20260518000100_create_geography_tables.sql
seed/001_geography_seed.sql
```

Avoid mixing too much seed data inside schema migrations unless required for constraints.

---

## 4.5 Never Edit Applied Production Migrations

If a migration has already been applied to a shared or production database, do not edit it.

Create a new migration.

---

## 4.6 Document Every Schema Change

After changing schema, update:

```text
docs/database/DATA_DICTIONARY.md
docs/database/RELATIONSHIPS.md
docs/database/INDEXING_STRATEGY.md
docs/database/DATA_QUALITY_RULES.md
```

Update only the relevant sections, but do not leave documentation outdated.

---

## 5. Migration Folder Structure

Recommended structure:

```text
supabase/
  migrations/
    20260518000100_create_geography_tables.sql
    20260518000200_create_attraction_tables.sql
    20260518000300_create_tourist_identity_tables.sql
    20260518000400_create_visit_tables.sql
    20260518000500_create_certificate_stamp_tables.sql
    20260518000600_create_survey_expense_tables.sql
    20260518000700_create_analytics_tables.sql
    20260518000800_create_admin_security_tables.sql
    20260518000900_create_indexes.sql
    20260518001000_create_rls_policies.sql
  seed/
    001_countries.sql
    002_provinces_districts.sql
    003_attraction_master.sql
    004_travel_behavior_master.sql
    005_expense_master.sql
    006_satisfaction_questions.sql
    007_sample_attractions.sql
    008_default_templates.sql
```

If the project uses another migration tool, keep the same conceptual separation.

---

## 6. Recommended Migration Order

## 6.1 Phase 1: Extensions and Utility Functions

Create useful PostgreSQL extensions if needed.

Example:

```sql
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
```

Optional later:

```sql
create extension if not exists pg_trgm;
```

Use trigram only when text search needs it.

---

## 6.2 Phase 2: Geography Tables

Create:

```text
countries
provinces
districts
```

Reason:

Many tables depend on geography.

---

## 6.3 Phase 3: Attraction Tables

Create:

```text
attraction_types
attractions
attraction_images
attraction_360_media
photo_spots
checkin_codes
```

Reason:

QR and visit flows depend on attraction records.

---

## 6.4 Phase 4: Tourist and Identity Tables

Create:

```text
tourists
tourist_identities
tourist_contacts
consent_logs
```

Important:

`consent_logs` references `visits` optionally. If `visits` does not exist yet, create `consent_logs` after visits or add the visit foreign key later.

Recommended:

Create `tourists` and `tourist_identities` first.

Create `consent_logs` after `visits`.

---

## 6.5 Phase 5: Travel Behavior Master Tables

Create:

```text
travel_companions
transport_modes
travel_purposes
```

Reason:

Visits reference these optional master tables.

---

## 6.6 Phase 6: Visit Tables

Create:

```text
visits
visit_destinations
```

For MVP, `visit_destinations` can be delayed.

---

## 6.7 Phase 7: Photo, Certificate, and Stamp Tables

Create:

```text
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
```

---

## 6.8 Phase 8: Expense and Satisfaction Tables

Create:

```text
expense_categories
visit_expenses
satisfaction_surveys
survey_questions
survey_answers
```

MVP can delay `survey_questions` and `survey_answers`, but including them early is acceptable.

---

## 6.9 Phase 9: Analytics Tables

Create:

```text
funnel_events
daily_attraction_stats
monthly_province_stats
dashboard_cache
```

For MVP, `funnel_events` is the most important analytics table.

Summary tables can come later.

---

## 6.10 Phase 10: Admin and Security Tables

Create:

```text
users
roles
permissions
user_roles
role_permissions
audit_logs
```

If Supabase Auth is used, `users.user_id` should reference or match `auth.users.id` where appropriate.

---

## 6.11 Phase 11: Official Data Tables

Create later:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

This is usually Phase 2 after MVP.

---

## 6.12 Phase 12: Indexes

Indexes can be created in table migrations or a dedicated index migration.

For clarity, use a dedicated index migration after core tables exist.

---

## 6.13 Phase 13: RLS Policies

If using Supabase client-side access, create Row Level Security policies after tables are created.

Policies should be documented separately in:

```text
docs/security/ROW_LEVEL_SECURITY.md
```

---

## 7. Required Migration Standards

## 7.1 Primary Keys

Use descriptive primary keys.

Example:

```sql
create table provinces (
  province_id bigint generated always as identity primary key,
  province_name_th varchar(150) not null,
  province_name_en varchar(150) not null,
  region_name varchar(150),
  is_target_area boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

---

## 7.2 Foreign Keys

Use explicit foreign keys.

Example:

```sql
province_id bigint not null references provinces(province_id)
```

For optional relationships:

```sql
district_id bigint references districts(district_id)
```

---

## 7.3 Timestamps

Most tables should include:

```sql
created_at timestamptz not null default now(),
updated_at timestamptz
```

Event tables should use event-specific timestamps.

Examples:

```sql
uploaded_at timestamptz not null default now()
generated_at timestamptz not null default now()
earned_at timestamptz not null default now()
event_time timestamptz not null default now()
```

---

## 7.4 Boolean Defaults

Boolean status fields should have defaults.

Examples:

```sql
is_active boolean not null default true
is_published boolean not null default false
is_primary boolean not null default false
is_default boolean not null default false
```

---

## 7.5 Check Constraints

Use check constraints for important value ranges.

Examples:

```sql
constraint chk_visits_group_size check (group_size is null or group_size >= 1),
constraint chk_visits_nights check (nights is null or nights >= 0),
constraint chk_satisfaction_overall check (overall_score is null or overall_score between 1 and 5)
```

---

## 7.6 Unique Constraints

Use unique constraints for business rules.

Examples:

```sql
unique(slug)
unique(code)
unique(provider, provider_user_id)
unique(tourist_id, attraction_id)
unique(visit_id)
```

---

## 7.7 Status Values

For MVP, text status fields with check constraints are acceptable.

Example:

```sql
approval_status varchar(50) not null default 'pending',
constraint chk_visit_photos_approval_status
check (approval_status in ('pending', 'approved', 'rejected'))
```

In later production, PostgreSQL enums can be considered, but text with check constraints is easier to migrate.

---

## 8. Example Core Migration Skeleton

This is an example style only.

```sql
create table tourists (
  tourist_id bigint generated always as identity primary key,
  display_name varchar(150) not null,
  origin_country_id bigint references countries(country_id),
  origin_province_id bigint references provinces(province_id),
  age_group varchar(50),
  preferred_language varchar(10),
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  constraint chk_tourists_age_group
  check (
    age_group is null or age_group in (
      'under_18',
      '18_24',
      '25_34',
      '35_44',
      '45_54',
      '55_64',
      '65_plus',
      'prefer_not_to_answer'
    )
  )
);
```

---

## 9. Example Identity Migration

```sql
create table tourist_identities (
  identity_id bigint generated always as identity primary key,
  tourist_id bigint not null references tourists(tourist_id),
  provider varchar(50) not null,
  provider_user_id text not null,
  is_primary boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),

  constraint chk_tourist_identity_provider
  check (provider in ('anonymous_device', 'line', 'email', 'google')),

  constraint uidx_tourist_identities_provider_user
  unique(provider, provider_user_id)
);
```

---

## 10. Example Visit Migration

```sql
create table visits (
  visit_id bigint generated always as identity primary key,
  tourist_id bigint not null references tourists(tourist_id),
  attraction_id bigint not null references attractions(attraction_id),
  photo_spot_id bigint references photo_spots(photo_spot_id),
  checkin_code_id bigint references checkin_codes(checkin_code_id),
  visit_date date not null,
  visited_at timestamptz,
  travel_companion_id bigint references travel_companions(travel_companion_id),
  transport_mode_id bigint references transport_modes(transport_mode_id),
  travel_purpose_id bigint references travel_purposes(travel_purpose_id),
  group_size integer,
  overnight_status varchar(50),
  nights integer,
  completion_status varchar(50) not null default 'started',
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  constraint chk_visits_group_size
  check (group_size is null or group_size >= 1),

  constraint chk_visits_nights
  check (nights is null or nights >= 0),

  constraint chk_visits_overnight_status
  check (
    overnight_status is null or overnight_status in (
      'same_day',
      'overnight',
      'unknown',
      'prefer_not_to_answer'
    )
  ),

  constraint chk_visits_completion_status
  check (
    completion_status in (
      'started',
      'minimal_form_completed',
      'photo_uploaded',
      'certificate_generated',
      'survey_completed',
      'abandoned'
    )
  )
);
```

---

## 11. Example Stamp Migration

```sql
create table tourist_stamps (
  stamp_id bigint generated always as identity primary key,
  tourist_id bigint not null references tourists(tourist_id),
  attraction_id bigint not null references attractions(attraction_id),
  visit_id bigint not null references visits(visit_id),
  stamp_definition_id bigint not null references stamp_definitions(stamp_definition_id),
  earned_at timestamptz not null default now(),
  status varchar(50) not null default 'earned',

  constraint chk_tourist_stamps_status
  check (status in ('earned', 'revoked')),

  constraint uidx_tourist_stamps_tourist_attraction
  unique(tourist_id, attraction_id)
);
```

---

## 12. Row Level Security Migration Notes

If RLS is used, enable it explicitly.

Example:

```sql
alter table attractions enable row level security;
alter table tourists enable row level security;
alter table visits enable row level security;
```

Policy design must be careful.

Basic idea:

- Public users can read published attractions.
- Tourists can create limited records through safe API or controlled policies.
- Tourists must not read other tourists' private data.
- Admin users can manage records based on role.

For MVP, safer approach:

```text
Use server-side actions/API routes for writes.
Keep direct public Supabase writes minimal.
```

Do not expose service role key to frontend.

---

## 13. Migration Review Checklist

Before applying a migration, verify:

```text
[ ] Migration name is clear and ordered.
[ ] Migration can run on a clean database.
[ ] Tables have primary keys.
[ ] Foreign keys are explicit.
[ ] Important fields are not nullable unless intentionally optional.
[ ] Check constraints protect critical values.
[ ] Unique constraints protect business rules.
[ ] Indexes are planned or included.
[ ] Privacy impact is considered.
[ ] No unnecessary personal data is added.
[ ] Documentation is updated.
[ ] Seed data impact is considered.
[ ] Rollback or recovery plan is clear.
```

---

## 14. Destructive Migration Rules

Destructive changes include:

- Dropping tables
- Dropping columns
- Changing data types
- Removing constraints
- Deleting data
- Renaming columns used in code

Before destructive migration:

1. Confirm the feature requires it.
2. Check whether data exists.
3. Create backup if needed.
4. Provide data migration path.
5. Update code and documentation.
6. Test in development first.
7. Never run destructive migration blindly.

---

## 15. Safe Column Addition Rules

When adding a new required column to a table that may already contain data:

Bad:

```sql
alter table visits add column new_required_field text not null;
```

Good:

```sql
alter table visits add column new_required_field text;
update visits set new_required_field = 'default_value' where new_required_field is null;
alter table visits alter column new_required_field set not null;
```

---

## 16. Safe Rename Rules

Renaming columns can break code.

Preferred process:

1. Add new column.
2. Backfill data.
3. Update application code.
4. Keep old column temporarily.
5. Remove old column in later migration.

This is safer for production.

---

## 17. Data Backfill Rules

When adding derived or summary fields:

- Write a backfill script.
- Make it idempotent where possible.
- Log affected rows.
- Test against sample data.
- Avoid overwriting manually corrected values.

---

## 18. Migration Testing

Migration should be tested by:

1. Creating a clean local database.
2. Running all migrations.
3. Running seed data.
4. Checking table existence.
5. Checking foreign keys.
6. Checking constraints.
7. Checking indexes.
8. Running sample queries.
9. Testing application flow.

---

## 19. Sample Migration Test Queries

After migrations, test:

```sql
select count(*) from provinces;
select count(*) from attractions;
select count(*) from tourist_identities;
select count(*) from visits;
```

Test check-in code lookup:

```sql
select *
from checkin_codes
where code = 'DEMO001'
  and is_active = true;
```

Test dashboard join:

```sql
select a.name_en, count(v.visit_id) as visit_count
from attractions a
left join visits v on v.attraction_id = a.attraction_id
group by a.attraction_id, a.name_en
order by visit_count desc;
```

---

## 20. Migration Documentation Template

Each migration should have a comment header.

Example:

```sql
-- Migration: create_tourist_identity_tables
-- Purpose: Create tourist profile and identity tables for guest, LINE, email, and future identity linking.
-- Related docs:
--   docs/database/DATABASE_REQUIREMENTS.md
--   docs/database/DATA_DICTIONARY.md
--   docs/database/RELATIONSHIPS.md
```

---

## 21. Common Migration Mistakes

Avoid:

```text
Creating one table for all tourist and visit data.
Creating QR flow without checkin_codes table.
Creating certificates without visit_id.
Creating tourist_stamps without unique tourist-attraction rule.
Using free text for province or transport mode.
Adding personal data fields without privacy review.
Creating dashboard indexes before understanding queries.
Forgetting to update DATA_DICTIONARY.md.
Exposing service role key in migration comments or docs.
```

---

## 22. MVP Migration Plan

Recommended MVP migration files:

```text
001_create_geography_tables.sql
002_create_attraction_tables.sql
003_create_travel_behavior_master_tables.sql
004_create_tourist_identity_tables.sql
005_create_visit_tables.sql
006_create_photo_certificate_stamp_tables.sql
007_create_expense_satisfaction_tables.sql
008_create_funnel_events.sql
009_create_admin_security_tables.sql
010_create_indexes.sql
011_create_rls_policies.sql
```

If using Supabase CLI, prefix with timestamps.

---

## 23. Definition of Done for Migration

A migration is done when:

```text
[ ] It runs successfully on a clean database.
[ ] It does not rely on manual SQL outside migration files.
[ ] It includes constraints for important business rules.
[ ] It includes or is followed by required indexes.
[ ] It does not introduce unnecessary personal data.
[ ] It supports the five core data dimensions.
[ ] It is documented in DATA_DICTIONARY.md.
[ ] It is tested with seed data.
[ ] It does not break existing application flows.
```

---

## 24. Final Migration Rule

The database is the core product.

Treat every schema change as a product decision, not only a technical change.
