# DATABASE_CHECKLIST.md

## 1. Document Purpose

This checklist defines database readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist before:

```text
creating migrations
reviewing schema
running seed data
connecting backend services
building dashboard queries
preparing academic ERD/data dictionary
```

The database is the core of this project. It must support real tourist data collection, dashboard analytics, sustainable tourism planning, privacy, and future expansion.

---

## 2. Database Mission

The database mission is:

```text
Store high-quality tourism participation data that connects tourists, visits, attractions, travel behavior, expenses, satisfaction, certificates, stamps, and dashboard analytics.
```

It must support:

```text
tourist recording
travel behavior analysis
tourism promotion planning
dashboard analytics
sustainable tourism indicators
privacy-safe exports
official data comparison future
```

---

## 3. Database Technology

Recommended:

```text
PostgreSQL via Supabase
```

Checklist:

```text
[ ] Supabase project exists.
[ ] PostgreSQL database accessible.
[ ] Migration workflow selected.
[ ] Local/test database available or planned.
[ ] Production database access is protected.
[ ] Backups/restore plan documented for production.
```

---

## 4. Schema Design Status

Checklist:

```text
[ ] ERD overview exists.
[ ] Table groups are defined.
[ ] Data dictionary exists.
[ ] Relationships are documented.
[ ] Indexing strategy exists.
[ ] Data quality rules exist.
[ ] Retention policy exists.
[ ] Analytics tables are planned.
[ ] Migration guide exists.
[ ] Seed data guide exists.
```

Related files:

```text
docs/database/ERD_OVERVIEW.md
docs/database/TABLE_GROUPS.md
docs/database/DATA_DICTIONARY.md
docs/database/RELATIONSHIPS.md
docs/database/INDEXING_STRATEGY.md
docs/database/DATA_QUALITY_RULES.md
docs/database/DATA_RETENTION_POLICY.md
docs/database/MIGRATION_GUIDE.md
docs/database/SEED_DATA_GUIDE.md
docs/database/ANALYTICS_TABLES.md
```

---

# Core Table Checklist

---

## 5. Reference Location Tables

Required tables:

```text
provinces
districts
countries
```

Checklist:

```text
[ ] provinces table exists.
[ ] districts table exists.
[ ] countries table exists.
[ ] Yala exists.
[ ] Pattani exists.
[ ] Narathiwat exists.
[ ] Districts link to provinces.
[ ] Countries include Thailand.
[ ] Reference data has stable IDs/codes.
```

Required relationships:

```text
districts.province_id -> provinces.province_id
```

---

## 6. Attraction Reference Tables

Recommended tables:

```text
attraction_types
attractions
attraction_images
attraction_360_media
```

Checklist:

```text
[ ] attraction_types table exists.
[ ] attractions table exists.
[ ] attraction_images table exists or planned.
[ ] attraction_360_media table exists or planned.
[ ] attractions link to province.
[ ] attractions link to district.
[ ] attractions have slug.
[ ] attractions have publish status.
[ ] attractions have active status.
[ ] public/private fields are separated.
```

Critical constraints:

```text
[ ] attractions.slug unique.
[ ] attractions.province_id FK valid.
[ ] attractions.district_id FK valid.
[ ] latitude/longitude valid if used.
```

---

## 7. Photo Spot and Check-in Tables

Recommended tables:

```text
photo_spots
checkin_codes
```

Checklist:

```text
[ ] photo_spots table exists.
[ ] checkin_codes table exists.
[ ] photo spot belongs to attraction.
[ ] check-in code belongs to attraction.
[ ] check-in code can optionally belong to photo spot.
[ ] check-in code is unique.
[ ] active/inactive status exists.
[ ] start/end validity exists or planned.
```

Critical constraints:

```text
[ ] checkin_codes.code unique.
[ ] photo_spots.attraction_id FK valid.
[ ] checkin_codes.attraction_id FK valid.
[ ] checkin_codes.photo_spot_id FK valid if present.
```

---

## 8. Tourist Tables

Recommended tables:

```text
tourists
tourist_identities
```

Checklist:

```text
[ ] tourists table exists.
[ ] tourist_identities table exists.
[ ] display_name field exists.
[ ] origin_country_id field exists.
[ ] origin_province_id field exists.
[ ] age_group field exists.
[ ] preferred_language field exists.
[ ] identity provider supports anonymous_device.
[ ] identity provider supports LINE optional.
[ ] identity provider supports email future if planned.
[ ] tourist identity does not appear in dashboard by default.
```

Critical constraints:

```text
[ ] tourist_identities(tourist_id) FK valid.
[ ] tourist_identities(provider, provider_user_id) unique.
[ ] age_group controlled values.
[ ] preferred_language controlled values.
```

Privacy rules:

```text
[ ] No national ID field.
[ ] No full address field.
[ ] No exact birthdate field.
[ ] Email/LINE are optional identity fields, not required for certificate.
```

---

## 9. Visit Table

Recommended table:

```text
visits
```

Checklist:

```text
[ ] visits table exists.
[ ] visit links to tourist.
[ ] visit links to attraction.
[ ] visit can link to photo spot.
[ ] visit can link to check-in code.
[ ] visit_date exists.
[ ] completion_status exists.
[ ] travel behavior fields exist or related tables exist.
[ ] group_size field exists or planned.
[ ] overnight_status/nights fields exist or planned.
```

Critical constraints:

```text
[ ] visits.tourist_id FK valid.
[ ] visits.attraction_id FK valid.
[ ] visits.photo_spot_id FK valid if present.
[ ] visits.checkin_code_id FK valid if present.
[ ] group_size >= 1 if not null.
[ ] nights >= 0 if not null.
[ ] completion_status controlled values.
```

Important rule:

```text
Repeat visits are allowed.
```

Do not create a unique constraint that prevents a tourist from visiting the same attraction again, unless intentionally scoped by stamp only.

---

## 10. Visit Photo Table

Recommended table:

```text
visit_photos
```

Checklist:

```text
[ ] visit_photos table exists.
[ ] photo links to visit.
[ ] storage_path exists.
[ ] mime_type exists.
[ ] file_size_bytes exists.
[ ] upload status exists or planned.
[ ] active/latest flag exists if replacement is allowed.
[ ] deleted_at field exists or planned.
```

Critical constraints:

```text
[ ] visit_photos.visit_id FK valid.
[ ] mime_type controlled values or validated by service.
[ ] file_size_bytes > 0.
```

Privacy rule:

```text
[ ] storage_path contains no personal data.
[ ] signed URL is not stored permanently.
```

---

## 11. Certificate Tables

Recommended tables:

```text
certificate_templates
certificates
```

Checklist:

```text
[ ] certificate_templates table exists.
[ ] certificates table exists.
[ ] certificate links to visit.
[ ] certificate links to template.
[ ] certificate links to photo if needed.
[ ] certificate_path exists.
[ ] generated_at exists.
[ ] status exists.
[ ] download_count exists or planned.
```

Critical constraints:

```text
[ ] certificates.visit_id FK valid.
[ ] certificates.template_id FK valid.
[ ] one active/generated certificate per visit enforced or handled in service.
[ ] certificate status controlled values.
```

Privacy rule:

```text
[ ] certificate does not include private identifiers beyond display name/photo.
[ ] certificate path contains no personal data.
```

---

## 12. Stamp and Passport Tables

Recommended tables:

```text
stamp_definitions
tourist_stamps
```

Checklist:

```text
[ ] stamp_definitions table exists.
[ ] tourist_stamps table exists.
[ ] stamp definition links to attraction.
[ ] tourist stamp links to tourist.
[ ] tourist stamp links to attraction.
[ ] earned_at exists.
[ ] source_visit_id exists or planned.
```

Critical constraints:

```text
[ ] stamp_definitions.attraction_id FK valid.
[ ] tourist_stamps.tourist_id FK valid.
[ ] tourist_stamps.attraction_id FK valid.
[ ] tourist_stamps(tourist_id, attraction_id) unique.
```

Important rule:

```text
Repeat visits are allowed, duplicate stamps are not.
```

---

## 13. Survey and Satisfaction Tables

Recommended tables:

```text
satisfaction_surveys
visit_expenses
```

or broader:

```text
survey_responses
survey_answers
```

MVP recommended:

```text
satisfaction_surveys
visit_expenses
```

Checklist:

```text
[ ] satisfaction_surveys table exists.
[ ] visit_expenses table exists.
[ ] survey links to visit.
[ ] overall_score exists.
[ ] revisit_intention exists.
[ ] recommendation_intention exists.
[ ] comment field optional.
[ ] expense links to visit.
[ ] spending_range exists.
[ ] expense_category exists or planned.
```

Critical constraints:

```text
[ ] satisfaction_surveys.visit_id FK valid.
[ ] unique satisfaction survey per visit or controlled duplicate policy.
[ ] overall_score between 1 and 5 if not null.
[ ] service dimension scores between 1 and 5 if used.
[ ] visit_expenses.visit_id FK valid.
[ ] spending_range controlled values.
```

Important rule:

```text
Missing satisfaction is null, not zero.
```

---

## 14. Travel Behavior Reference Tables

Recommended tables:

```text
transport_modes
travel_purposes
travel_companions
expense_categories
```

Checklist:

```text
[ ] transport_modes table exists.
[ ] travel_purposes table exists.
[ ] travel_companions table exists.
[ ] expense_categories table exists.
[ ] Reference values are seeded.
[ ] Active/inactive status exists where useful.
```

---

## 15. Funnel Event Table

Recommended table:

```text
funnel_events
```

Checklist:

```text
[ ] funnel_events table exists.
[ ] event_name exists.
[ ] event_time exists.
[ ] session_id exists or planned.
[ ] attraction_id exists or nullable.
[ ] photo_spot_id exists or nullable.
[ ] checkin_code_id exists or nullable.
[ ] tourist_id exists or nullable.
[ ] visit_id exists or nullable.
[ ] metadata_json exists or avoided.
```

Critical constraints:

```text
[ ] event_name controlled values or validated.
[ ] event_time indexed.
[ ] attraction_id FK valid if present.
[ ] visit_id FK valid if present.
```

Privacy rule:

```text
[ ] metadata_json must not store secrets/personal identifiers.
```

---

## 16. Consent Table

Recommended table:

```text
consent_records
```

Checklist:

```text
[ ] consent_records table exists.
[ ] tourist_id exists.
[ ] visit_id exists if relevant.
[ ] consent_version exists.
[ ] consent_type exists.
[ ] purpose_key exists.
[ ] has_consented exists.
[ ] consented_at exists.
[ ] withdrawn_at exists or planned.
[ ] source exists.
[ ] language exists.
```

Critical constraints:

```text
[ ] consent_records.tourist_id FK valid.
[ ] consent type controlled values.
[ ] purpose key controlled values.
```

---

## 17. Admin, Role, Permission Tables

Recommended tables:

```text
admin_users
roles
permissions
role_permissions
admin_user_roles
```

Checklist:

```text
[ ] admin_users table exists.
[ ] roles table exists.
[ ] permissions table exists.
[ ] role_permissions table exists.
[ ] admin_user_roles table exists.
[ ] super_admin role seeded.
[ ] admin role seeded.
[ ] viewer role seeded.
[ ] permissions seeded.
```

Critical constraints:

```text
[ ] roles.role_key unique.
[ ] permissions.permission_key unique.
[ ] admin_users.auth_user_id unique.
[ ] role_permissions(role_id, permission_id) unique.
[ ] admin_user_roles(admin_user_id, role_id) unique.
```

---

## 18. Audit Log Table

Recommended table:

```text
audit_logs
```

Checklist:

```text
[ ] audit_logs table exists.
[ ] actor_user_id exists.
[ ] actor_type exists.
[ ] action exists.
[ ] entity_type exists.
[ ] entity_id exists.
[ ] result exists.
[ ] old_values_json exists.
[ ] new_values_json exists.
[ ] metadata_json exists.
[ ] created_at exists.
```

Privacy/security:

```text
[ ] Audit logs do not store secrets.
[ ] Audit logs are restricted.
[ ] Export actions are audited.
```

---

## 19. Export Tables

Recommended tables:

```text
export_jobs
```

MVP can skip if direct CSV only, but production should include.

Checklist:

```text
[ ] export_jobs table exists or is planned.
[ ] requested_by exists.
[ ] export_type exists.
[ ] filters_json exists.
[ ] status exists.
[ ] file_path exists if stored.
[ ] row_count exists.
[ ] expires_at exists.
```

Security:

```text
[ ] Export files are private.
[ ] Export actions are audit logged.
```

---

## 20. Official Data Tables

Recommended future tables:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Checklist:

```text
[ ] official data tables are defined or planned.
[ ] province/month/year fields exist.
[ ] official visitor count fields exist.
[ ] source name fields exist.
[ ] import log fields exist.
[ ] official/local distinction is clear.
```

Important rule:

```text
Local platform visits are not official tourist arrivals.
```

---

## 21. Dashboard Analytics Tables

Recommended future tables:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
```

Checklist:

```text
[ ] Analytics tables are planned.
[ ] Summary table grain is defined.
[ ] Refresh strategy is documented.
[ ] Upsert keys are defined.
[ ] No personal identifiers included.
```

MVP can use live queries if data is small.

---

# Constraint Checklist

---

## 22. Primary Keys

Checklist:

```text
[ ] Every table has primary key.
[ ] Primary key naming is consistent.
[ ] bigint/uuid strategy is selected.
[ ] Foreign keys use matching types.
```

---

## 23. Foreign Keys

Checklist:

```text
[ ] All relationships have FK constraints where appropriate.
[ ] FK delete behavior is intentional.
[ ] Historical data is not accidentally deleted by cascade.
[ ] Restricted delete used for important historical records.
[ ] Soft delete/deactivate used where appropriate.
```

Recommended:

```text
avoid cascade delete on visits/certificates/surveys unless intentionally designed
```

---

## 24. Unique Constraints

Required:

```text
[ ] attractions.slug unique.
[ ] checkin_codes.code unique.
[ ] tourist_identities(provider, provider_user_id) unique.
[ ] tourist_stamps(tourist_id, attraction_id) unique.
[ ] roles.role_key unique.
[ ] permissions.permission_key unique.
```

Recommended:

```text
[ ] one generated certificate per visit.
[ ] one satisfaction survey per visit.
```

---

## 25. Check Constraints

Checklist:

```text
[ ] satisfaction scores between 1 and 5.
[ ] group_size >= 1.
[ ] nights >= 0.
[ ] file_size_bytes > 0.
[ ] latitude between -90 and 90.
[ ] longitude between -180 and 180.
[ ] amount_min >= 0.
[ ] amount_max >= amount_min when not null.
```

---

## 26. Status/Enum Values

Controlled values required for:

```text
visit completion_status
certificate status
check-in code status
age_group
preferred_language
overnight_status
consent_type
audit result
export status
identity provider
```

Checklist:

```text
[ ] enum/check constraints or reference tables used.
[ ] Unknown/prefer_not_to_answer handled intentionally.
```

---

# Index Checklist

---

## 27. Core Indexes

Checklist:

```text
[ ] visits(visit_date)
[ ] visits(attraction_id, visit_date)
[ ] visits(tourist_id)
[ ] visits(completion_status)
[ ] attractions(province_id)
[ ] attractions(slug)
[ ] checkin_codes(code)
[ ] certificates(visit_id)
[ ] tourist_stamps(tourist_id, attraction_id)
[ ] satisfaction_surveys(visit_id)
[ ] visit_expenses(visit_id)
[ ] funnel_events(event_name, event_time)
[ ] funnel_events(attraction_id, event_time)
[ ] audit_logs(created_at)
[ ] export_jobs(requested_by, created_at)
```

---

## 28. Dashboard Query Indexes

Checklist:

```text
[ ] visit trend queries indexed.
[ ] province/attraction dashboard queries indexed.
[ ] satisfaction by attraction queries indexed.
[ ] expense dashboard queries indexed.
[ ] funnel dashboard queries indexed.
[ ] tourist origin distribution queries considered.
```

---

# Security and RLS Checklist

---

## 29. RLS / Access Control

Checklist:

```text
[ ] Sensitive tables identified.
[ ] RLS enabled where direct Supabase client access exists.
[ ] tourists not publicly readable.
[ ] tourist_identities not publicly readable.
[ ] visits not publicly readable.
[ ] visit_photos not publicly readable.
[ ] certificates not publicly readable.
[ ] survey tables not publicly readable.
[ ] audit_logs restricted.
[ ] export_jobs restricted.
[ ] Published public attractions readable.
```

---

## 30. Service Role Safety

Checklist:

```text
[ ] Service role key used only server-side.
[ ] Browser uses anon key only.
[ ] Backend services enforce authorization when using service role.
[ ] No service key stored in database.
[ ] No service key logged.
```

---

# Privacy Checklist

---

## 31. Privacy-Safe Design

Checklist:

```text
[ ] No national ID column.
[ ] No full address column.
[ ] No exact birth date column.
[ ] No required phone column.
[ ] Age group used.
[ ] Origin is broad.
[ ] Spending is range-based.
[ ] Photo storage protected.
[ ] Certificate storage protected.
[ ] Raw comments optional/restricted.
```

---

## 32. Retention and Anonymization Fields

Checklist:

```text
[ ] tourists.is_anonymized planned or exists.
[ ] tourists.anonymized_at planned or exists.
[ ] file tables support deleted_at.
[ ] certificates support revoked/deleted status.
[ ] export_jobs support expires_at.
[ ] audit logs have retention policy.
```

---

# Migration Checklist

---

## 33. Migration Quality

Checklist:

```text
[ ] Migration file names are ordered.
[ ] Migrations are idempotent where possible.
[ ] Migrations run on empty database.
[ ] Migrations run on staging before production.
[ ] Rollback/restore plan exists.
[ ] No destructive migration without backup.
[ ] Data migrations are separated from schema migrations when useful.
```

---

## 34. Seed Data Quality

Checklist:

```text
[ ] Seed data can be rerun safely.
[ ] Seed data uses unique keys.
[ ] Seed data does not create duplicates.
[ ] Production seed excludes fake tourist data.
[ ] Test seed is separated.
[ ] Roles/permissions seeded.
[ ] Reference values seeded.
```

---

# Data Dictionary Checklist

---

## 35. Data Dictionary Completeness

For every table:

```text
[ ] table name documented.
[ ] table purpose documented.
[ ] column names documented.
[ ] data types documented.
[ ] nullable/required documented.
[ ] primary key documented.
[ ] foreign keys documented.
[ ] indexes documented.
[ ] constraints documented.
[ ] privacy classification documented.
```

---

## 36. ERD Checklist

```text
[ ] ERD shows core tables.
[ ] ERD shows relationships.
[ ] Tourist-to-visit relationship clear.
[ ] Visit-to-attraction relationship clear.
[ ] Visit-to-photo/certificate/survey clear.
[ ] Tourist-to-stamp relationship clear.
[ ] Admin/role tables included or separated.
[ ] Official data future tables shown separately if planned.
```

---

# Database Testing Checklist

---

## 37. Database Test Cases

```text
[ ] Insert valid tourist.
[ ] Insert duplicate tourist identity fails.
[ ] Insert valid visit.
[ ] Insert visit with invalid attraction fails.
[ ] Insert valid photo metadata.
[ ] Insert invalid score fails.
[ ] Insert duplicate stamp fails.
[ ] Insert duplicate check-in code fails.
[ ] Insert duplicate attraction slug fails.
[ ] Delete/deactivate behavior works as intended.
[ ] Dashboard queries return expected metrics.
```

---

## 38. Performance Test Cases

```text
[ ] EXPLAIN visit count by province.
[ ] EXPLAIN visit count by attraction.
[ ] EXPLAIN satisfaction average by attraction.
[ ] EXPLAIN expense summary.
[ ] EXPLAIN funnel counts.
[ ] Indexes used for date filters.
[ ] Large export query bounded.
```

---

# Critical Database Blockers

---

## 39. Do Not Proceed If

Do not proceed to full feature coding if:

```text
[ ] Tourist/visit relationship is unclear.
[ ] Attraction/photo spot/check-in relationship is unclear.
[ ] Certificate does not link to visit.
[ ] Stamp duplicate rule is missing.
[ ] Survey duplicate rule is missing.
[ ] No consent table/strategy exists.
[ ] No role/permission model exists.
[ ] No storage path strategy exists.
[ ] No dashboard metric definitions exist.
[ ] No indexing strategy exists.
```

---

## 40. Database MVP Acceptance Checklist

```text
[ ] Core schema supports tourists, visits, attractions, certificates, stamps, surveys, expenses, satisfaction.
[ ] Yala/Pattani/Narathiwat reference data exists.
[ ] QR/check-in data model exists.
[ ] Photo spot model exists.
[ ] Tourist identity model supports guest and optional LINE.
[ ] Consent model exists.
[ ] Admin role/permission model exists.
[ ] Audit log model exists.
[ ] Required constraints exist.
[ ] Required indexes exist.
[ ] Storage metadata tables exist.
[ ] Data dictionary is documented.
[ ] ERD is documented.
[ ] Seed data exists.
```

---

## 41. Common Database Mistakes to Avoid

Do not:

```text
store image base64 in database.
store signed URLs permanently.
store LINE user ID in dashboard tables.
require LINE identity for all tourists.
prevent repeat visits by overusing unique constraints.
treat QR scans as visits.
store exact birthdate when age group is enough.
store full address.
skip foreign keys.
skip indexes for dashboard queries.
skip unique constraint for duplicate stamps.
call estimated spending revenue.
```

---

## 42. Final Database Rule

The database must be designed for analytics and privacy from day one.

If the schema is weak, dashboard metrics, exports, security, and academic reporting will also be weak.
