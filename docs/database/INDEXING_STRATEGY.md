# INDEXING_STRATEGY.md

## 1. Document Purpose

This document defines the database indexing strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The goal is to make common queries fast while avoiding unnecessary indexes.

This file should be read before creating migrations, dashboard queries, admin filters, or reporting endpoints.

---

## 2. Indexing Goals

Indexes must support:

- QR check-in resolution
- Tourist identity lookup
- Attraction filtering
- Visit filtering
- Admin search and filters
- Dashboard metrics
- Export queries
- Funnel analytics
- Satisfaction analysis
- Expense analysis
- Digital passport lookup

The indexing strategy must be designed for the system's real workflows.

---

## 3. Indexing Principles

## 3.1 Index for Real Queries

Do not add indexes randomly.

Add indexes for columns used in:

- Foreign key joins
- WHERE filters
- ORDER BY clauses
- GROUP BY queries
- Unique lookups
- Dashboard aggregations

---

## 3.2 Index Foreign Keys

Most foreign key columns should have indexes.

PostgreSQL does not automatically create indexes for all foreign keys.

Indexed foreign keys help joins and delete/update checks.

---

## 3.3 Index Unique Lookup Fields

Fields used for direct lookup must be indexed and often unique.

Examples:

```text
attractions.slug
checkin_codes.code
tourist_identities(provider, provider_user_id)
```

---

## 3.4 Use Composite Indexes for Common Combined Filters

Dashboard and admin filters often combine fields.

Examples:

```text
visits(attraction_id, visit_date)
visits(created_at, attraction_id)
funnel_events(event_name, event_time)
```

Composite indexes should match common query patterns.

---

## 3.5 Avoid Over-Indexing

Every index adds write overhead.

Tables with many inserts, such as `funnel_events`, should have only useful indexes.

Avoid indexing every column.

---

## 3.6 Prefer Summary Tables for Heavy Dashboards

If dashboard queries become slow, do not solve everything with indexes.

Use:

```text
daily_attraction_stats
monthly_province_stats
dashboard_cache
materialized views
```

when needed.

---

## 4. Core Query Patterns

## 4.1 QR Check-in Query

Common operation:

```text
Find active check-in code by code string.
```

Example:

```sql
select *
from checkin_codes
where code = :code
  and is_active = true;
```

Required index:

```text
unique index on checkin_codes(code)
```

Optional partial index:

```text
index on checkin_codes(code) where is_active = true
```

---

## 4.2 Public Attraction Listing

Common filters:

- province
- district
- attraction type
- published status
- active status
- search by name
- slug lookup

Required indexes:

```text
attractions(province_id)
attractions(district_id)
attractions(attraction_type_id)
attractions(slug)
attractions(is_published, is_active)
```

For search:

```text
GIN/trigram index on name_th/name_en
```

can be added later.

MVP can use simple `ilike` search if data size is small.

---

## 4.3 Tourist Identity Lookup

Common operation:

```text
Find tourist by identity provider and provider user ID.
```

Example:

```sql
select *
from tourist_identities
where provider = :provider
  and provider_user_id = :provider_user_id;
```

Required index:

```text
unique index on tourist_identities(provider, provider_user_id)
```

This is critical for returning guest, LINE, and email identity flows.

---

## 4.4 Visit Creation and Visit History

Common operations:

- Find visits by tourist
- Find visits by attraction
- Find visits by date range
- Find visits by province through attraction
- Find visits from check-in code
- Sort recent visits

Required indexes:

```text
visits(tourist_id)
visits(attraction_id)
visits(photo_spot_id)
visits(checkin_code_id)
visits(visit_date)
visits(created_at)
visits(attraction_id, visit_date)
visits(tourist_id, visit_date)
```

---

## 4.5 Digital Passport Lookup

Common operation:

```text
Find all stamps earned by tourist.
```

Required indexes:

```text
tourist_stamps(tourist_id)
tourist_stamps(attraction_id)
tourist_stamps(tourist_id, attraction_id)
```

Recommended unique constraint:

```text
unique(tourist_id, attraction_id)
```

---

## 4.6 Dashboard by Province

Common operation:

```text
Count visits by province.
```

Usually joins:

```text
visits -> attractions -> provinces
```

Important indexes:

```text
visits(attraction_id)
visits(visit_date)
attractions(province_id)
```

Composite index for common dashboard query:

```text
visits(attraction_id, visit_date)
```

---

## 4.7 Dashboard by Attraction

Common operation:

```text
Count visits by attraction over date range.
```

Required indexes:

```text
visits(attraction_id)
visits(attraction_id, visit_date)
```

---

## 4.8 Satisfaction Dashboard

Common operations:

- Average satisfaction by attraction
- Average satisfaction by date
- Filter by score
- Join satisfaction to visits and attractions

Required indexes:

```text
satisfaction_surveys(visit_id)
satisfaction_surveys(attraction_id)
satisfaction_surveys(completed_at)
satisfaction_surveys(overall_score)
```

Composite index:

```text
satisfaction_surveys(attraction_id, completed_at)
```

---

## 4.9 Expense Dashboard

Common operations:

- Spending range distribution
- Expense category distribution
- Expense by attraction through visit
- Expense by date through visit

Required indexes:

```text
visit_expenses(visit_id)
visit_expenses(expense_category_id)
visit_expenses(spending_range)
```

Dashboard queries will often join:

```text
visit_expenses -> visits -> attractions
```

Therefore, also use:

```text
visits(attraction_id, visit_date)
```

---

## 4.10 Funnel Analytics

Common operations:

- Count events by event name
- Count events over time
- Count events by attraction
- Count events by session
- Build conversion funnel

Required indexes:

```text
funnel_events(event_name)
funnel_events(event_time)
funnel_events(attraction_id)
funnel_events(session_id)
funnel_events(visit_id)
funnel_events(tourist_id)
```

Composite index:

```text
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
```

Be careful not to over-index `funnel_events` because it may become a high-write table.

---

## 5. Recommended MVP Indexes

## 5.1 Geography

```sql
create index idx_districts_province_id
on districts(province_id);
```

---

## 5.2 Attractions

```sql
create unique index idx_attractions_slug
on attractions(slug);

create index idx_attractions_province_id
on attractions(province_id);

create index idx_attractions_district_id
on attractions(district_id);

create index idx_attractions_attraction_type_id
on attractions(attraction_type_id);

create index idx_attractions_published_active
on attractions(is_published, is_active);
```

---

## 5.3 Attraction Images

```sql
create index idx_attraction_images_attraction_id
on attraction_images(attraction_id);

create index idx_attraction_images_cover
on attraction_images(attraction_id, is_cover);
```

---

## 5.4 Photo Spots

```sql
create index idx_photo_spots_attraction_id
on photo_spots(attraction_id);

create index idx_photo_spots_active
on photo_spots(attraction_id, is_active);
```

---

## 5.5 Check-in Codes

```sql
create unique index idx_checkin_codes_code
on checkin_codes(code);

create index idx_checkin_codes_attraction_id
on checkin_codes(attraction_id);

create index idx_checkin_codes_photo_spot_id
on checkin_codes(photo_spot_id);

create index idx_checkin_codes_active
on checkin_codes(is_active);
```

Optional partial index:

```sql
create index idx_checkin_codes_active_code
on checkin_codes(code)
where is_active = true;
```

---

## 5.6 Tourists

```sql
create index idx_tourists_origin_country_id
on tourists(origin_country_id);

create index idx_tourists_origin_province_id
on tourists(origin_province_id);

create index idx_tourists_age_group
on tourists(age_group);

create index idx_tourists_created_at
on tourists(created_at);
```

---

## 5.7 Tourist Identities

```sql
create unique index idx_tourist_identities_provider_user
on tourist_identities(provider, provider_user_id);

create index idx_tourist_identities_tourist_id
on tourist_identities(tourist_id);

create index idx_tourist_identities_provider
on tourist_identities(provider);
```

---

## 5.8 Consent Logs

```sql
create index idx_consent_logs_tourist_id
on consent_logs(tourist_id);

create index idx_consent_logs_visit_id
on consent_logs(visit_id);

create index idx_consent_logs_consented_at
on consent_logs(consented_at);
```

---

## 5.9 Visits

```sql
create index idx_visits_tourist_id
on visits(tourist_id);

create index idx_visits_attraction_id
on visits(attraction_id);

create index idx_visits_photo_spot_id
on visits(photo_spot_id);

create index idx_visits_checkin_code_id
on visits(checkin_code_id);

create index idx_visits_visit_date
on visits(visit_date);

create index idx_visits_created_at
on visits(created_at);

create index idx_visits_attraction_date
on visits(attraction_id, visit_date);

create index idx_visits_tourist_date
on visits(tourist_id, visit_date);

create index idx_visits_completion_status
on visits(completion_status);
```

---

## 5.10 Visit Photos

```sql
create index idx_visit_photos_visit_id
on visit_photos(visit_id);

create index idx_visit_photos_approval_status
on visit_photos(approval_status);

create index idx_visit_photos_uploaded_at
on visit_photos(uploaded_at);
```

---

## 5.11 Certificate Templates

```sql
create index idx_certificate_templates_attraction_id
on certificate_templates(attraction_id);

create index idx_certificate_templates_default_active
on certificate_templates(is_default, is_active);
```

---

## 5.12 Certificates

```sql
create index idx_certificates_visit_id
on certificates(visit_id);

create index idx_certificates_template_id
on certificates(template_id);

create index idx_certificates_photo_id
on certificates(photo_id);

create index idx_certificates_generated_at
on certificates(generated_at);
```

---

## 5.13 Stamp Definitions

```sql
create index idx_stamp_definitions_attraction_id
on stamp_definitions(attraction_id);

create index idx_stamp_definitions_active
on stamp_definitions(is_active);
```

---

## 5.14 Tourist Stamps

```sql
create unique index idx_tourist_stamps_unique_tourist_attraction
on tourist_stamps(tourist_id, attraction_id);

create index idx_tourist_stamps_tourist_id
on tourist_stamps(tourist_id);

create index idx_tourist_stamps_attraction_id
on tourist_stamps(attraction_id);

create index idx_tourist_stamps_visit_id
on tourist_stamps(visit_id);

create index idx_tourist_stamps_earned_at
on tourist_stamps(earned_at);
```

---

## 5.15 Travel Behavior Master Tables

```sql
create index idx_travel_companions_active
on travel_companions(is_active);

create index idx_transport_modes_active
on transport_modes(is_active);

create index idx_travel_purposes_active
on travel_purposes(is_active);
```

These are small tables, so indexes are not critical, but active filters may be common.

---

## 5.16 Expense

```sql
create index idx_expense_categories_active
on expense_categories(is_active);

create index idx_visit_expenses_visit_id
on visit_expenses(visit_id);

create index idx_visit_expenses_expense_category_id
on visit_expenses(expense_category_id);

create index idx_visit_expenses_spending_range
on visit_expenses(spending_range);
```

---

## 5.17 Satisfaction

```sql
create unique index idx_satisfaction_surveys_visit_id
on satisfaction_surveys(visit_id);

create index idx_satisfaction_surveys_attraction_id
on satisfaction_surveys(attraction_id);

create index idx_satisfaction_surveys_completed_at
on satisfaction_surveys(completed_at);

create index idx_satisfaction_surveys_overall_score
on satisfaction_surveys(overall_score);

create index idx_satisfaction_surveys_attraction_completed
on satisfaction_surveys(attraction_id, completed_at);
```

---

## 5.18 Survey Questions and Answers

If implemented:

```sql
create unique index idx_survey_questions_question_key
on survey_questions(question_key);

create index idx_survey_questions_active
on survey_questions(is_active);

create index idx_survey_answers_visit_id
on survey_answers(visit_id);

create index idx_survey_answers_question_id
on survey_answers(question_id);
```

---

## 5.19 Funnel Events

```sql
create index idx_funnel_events_event_name
on funnel_events(event_name);

create index idx_funnel_events_event_time
on funnel_events(event_time);

create index idx_funnel_events_attraction_id
on funnel_events(attraction_id);

create index idx_funnel_events_photo_spot_id
on funnel_events(photo_spot_id);

create index idx_funnel_events_checkin_code_id
on funnel_events(checkin_code_id);

create index idx_funnel_events_session_id
on funnel_events(session_id);

create index idx_funnel_events_visit_id
on funnel_events(visit_id);

create index idx_funnel_events_tourist_id
on funnel_events(tourist_id);

create index idx_funnel_events_name_time
on funnel_events(event_name, event_time);

create index idx_funnel_events_attraction_time
on funnel_events(attraction_id, event_time);
```

If write volume becomes high, review these indexes and keep only those used by dashboard queries.

---

## 5.20 Admin and Security

```sql
create unique index idx_users_email
on users(email);

create unique index idx_roles_role_key
on roles(role_key);

create unique index idx_permissions_permission_key
on permissions(permission_key);

create index idx_audit_logs_actor_user_id
on audit_logs(actor_user_id);

create index idx_audit_logs_action
on audit_logs(action);

create index idx_audit_logs_created_at
on audit_logs(created_at);

create index idx_audit_logs_entity
on audit_logs(entity_type, entity_id);
```

---

## 6. Dashboard-Specific Indexing

## 6.1 Date Range Filters

Many dashboard queries use date range.

Important date columns:

```text
visits.visit_date
visits.created_at
certificates.generated_at
tourist_stamps.earned_at
satisfaction_surveys.completed_at
funnel_events.event_time
```

Indexes:

```text
visits(visit_date)
certificates(generated_at)
tourist_stamps(earned_at)
satisfaction_surveys(completed_at)
funnel_events(event_time)
```

---

## 6.2 Province Filters

Province filters usually work through attractions.

Query path:

```text
visits -> attractions -> provinces
```

Important indexes:

```text
visits(attraction_id)
attractions(province_id)
```

For frequent province/date dashboard queries, consider a summary table.

---

## 6.3 Attraction Filters

Important indexes:

```text
visits(attraction_id, visit_date)
satisfaction_surveys(attraction_id, completed_at)
funnel_events(attraction_id, event_time)
tourist_stamps(attraction_id)
```

---

## 6.4 Tourist Origin Filters

Important indexes:

```text
tourists(origin_country_id)
tourists(origin_province_id)
tourists(age_group)
visits(tourist_id)
```

---

## 6.5 Returning Tourist Analysis

Common query:

```text
Find tourists with more than one visit.
```

Important index:

```text
visits(tourist_id, visit_date)
```

---

## 7. Search Indexing

## 7.1 Attraction Search

For MVP:

```sql
where name_th ilike '%keyword%'
   or name_en ilike '%keyword%'
```

This is acceptable for small data.

For production, use trigram index:

```sql
create extension if not exists pg_trgm;

create index idx_attractions_name_th_trgm
on attractions using gin (name_th gin_trgm_ops);

create index idx_attractions_name_en_trgm
on attractions using gin (name_en gin_trgm_ops);
```

---

## 7.2 Admin Search

Admin may search:

- attraction name
- tourist display name
- check-in code
- certificate ID
- visit ID

MVP can use simple search.

Add advanced search indexes only after query patterns are known.

---

## 8. Partial Indexes

Partial indexes can reduce index size.

Examples:

```sql
create index idx_attractions_public_active
on attractions(province_id, attraction_type_id)
where is_published = true and is_active = true;
```

```sql
create index idx_checkin_codes_active_code
on checkin_codes(code)
where is_active = true;
```

```sql
create index idx_photo_spots_active_attraction
on photo_spots(attraction_id)
where is_active = true;
```

Use partial indexes when:

- A query repeatedly filters by a fixed condition
- The table has many inactive rows
- The index improves a common public query

---

## 9. Unique Indexes and Data Quality

Unique indexes protect important business rules.

Required unique indexes:

```text
attractions.slug
checkin_codes.code
tourist_identities(provider, provider_user_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys.visit_id
roles.role_key
permissions.permission_key
```

These are not only performance tools.

They are data quality controls.

---

## 10. Indexes for Foreign Keys

Recommended foreign key indexes:

```text
districts.province_id
attractions.province_id
attractions.district_id
attractions.attraction_type_id
attraction_images.attraction_id
photo_spots.attraction_id
checkin_codes.attraction_id
checkin_codes.photo_spot_id
tourist_identities.tourist_id
consent_logs.tourist_id
consent_logs.visit_id
visits.tourist_id
visits.attraction_id
visits.photo_spot_id
visits.checkin_code_id
visit_photos.visit_id
certificates.visit_id
certificates.template_id
certificates.photo_id
stamp_definitions.attraction_id
tourist_stamps.tourist_id
tourist_stamps.attraction_id
tourist_stamps.visit_id
visit_expenses.visit_id
visit_expenses.expense_category_id
satisfaction_surveys.visit_id
satisfaction_surveys.attraction_id
funnel_events.tourist_id
funnel_events.visit_id
funnel_events.attraction_id
```

---

## 11. Write-Heavy Tables

Tables likely to receive many inserts:

```text
funnel_events
visits
visit_photos
certificates
tourist_stamps
survey_answers
```

Be careful with too many indexes on these tables.

Index only what is used.

---

## 12. Read-Heavy Tables

Tables likely to be read often:

```text
attractions
photo_spots
checkin_codes
tourists
visits
satisfaction_surveys
dashboard summary tables
```

Use indexes to support common filters.

---

## 13. Indexing by Development Phase

## 13.1 MVP Phase

Create indexes for:

- QR lookup
- identity lookup
- public attraction filters
- visit filters
- dashboard basics
- stamp uniqueness
- satisfaction by attraction
- funnel basics

## 13.2 Phase 2

Add indexes for:

- LINE identity
- email identity
- digital passport
- more dashboard filters
- official data comparison
- advanced admin search

## 13.3 Production Phase

Add:

- trigram search
- summary tables
- materialized views
- partial indexes
- query-specific composite indexes
- monitoring-based index tuning

---

## 14. Query Monitoring

When the database grows, use query analysis.

Recommended PostgreSQL tools:

```text
explain analyze
pg_stat_statements
Supabase query performance tools
```

Common questions:

- Which dashboard query is slow?
- Which index is unused?
- Which table is scanned too often?
- Which composite index would reduce cost?
- Are indexes slowing writes too much?

---

## 15. Index Maintenance

Indexes should be reviewed when:

- A new dashboard filter is added.
- A new admin list is added.
- A query becomes slow.
- A table grows significantly.
- A feature changes query patterns.
- A migration adds new foreign keys.

Do not keep unused indexes forever.

---

## 16. Dashboard Summary Tables vs Indexes

Indexes are not always enough.

If dashboard queries require repeated aggregation over large raw tables, use summary tables.

Examples:

```text
daily_attraction_stats
monthly_province_stats
expense_summary
satisfaction_summary
funnel_summary
```

Recommended approach:

1. Start with indexed raw queries.
2. Measure performance.
3. Add summary tables when needed.
4. Refresh summary tables on schedule or after events.

---

## 17. Example Dashboard Query Support

## 17.1 Visits by Attraction and Date

Query needs:

```text
visits.attraction_id
visits.visit_date
```

Index:

```sql
create index idx_visits_attraction_date
on visits(attraction_id, visit_date);
```

---

## 17.2 Satisfaction by Attraction

Query needs:

```text
satisfaction_surveys.attraction_id
satisfaction_surveys.completed_at
```

Index:

```sql
create index idx_satisfaction_surveys_attraction_completed
on satisfaction_surveys(attraction_id, completed_at);
```

---

## 17.3 Funnel Completion by Event

Query needs:

```text
funnel_events.event_name
funnel_events.event_time
```

Index:

```sql
create index idx_funnel_events_name_time
on funnel_events(event_name, event_time);
```

---

## 17.4 Returning Tourist Passport

Query needs:

```text
tourist_stamps.tourist_id
```

Index:

```sql
create index idx_tourist_stamps_tourist_id
on tourist_stamps(tourist_id);
```

---

## 18. Index Review Checklist

Before accepting an indexing change, verify:

```text
[ ] The index supports a real query.
[ ] The index does not duplicate another index unnecessarily.
[ ] Foreign key columns are indexed where useful.
[ ] Unique business rules use unique indexes.
[ ] Composite indexes match query filter order.
[ ] Write-heavy tables are not over-indexed.
[ ] Dashboard queries are considered.
[ ] Admin list filters are considered.
[ ] Search requirements are considered.
[ ] Index names are clear and consistent.
```

---

## 19. Naming Convention for Indexes

Use clear names.

Recommended format:

```text
idx_[table]_[column]
idx_[table]_[column1]_[column2]
idx_[table]_[purpose]
```

Examples:

```text
idx_visits_attraction_date
idx_tourist_identities_provider_user
idx_checkin_codes_active_code
idx_satisfaction_surveys_attraction_completed
```

Unique indexes can use:

```text
uidx_[table]_[column]
uidx_[table]_[business_rule]
```

Examples:

```text
uidx_checkin_codes_code
uidx_tourist_stamps_tourist_attraction
```

---

## 20. Final Indexing Rule

Indexes must make the platform fast for real workflows:

```text
QR resolution
Returning tourist detection
Visit recording
Admin filtering
Dashboard reporting
Export
```

Do not index everything.

Index what the system actually needs to query.
