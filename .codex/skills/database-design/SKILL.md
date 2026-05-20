---
name: database-design
description: Use when designing, reviewing, or debugging the database schema including ERD, table relationships, constraints, indexes, data quality rules, analytics tables, privacy-safe modeling, and migrations.
---

# Database Design Skill

## Purpose

Use this skill when designing, reviewing, refactoring, or debugging the database model for the **Southern Border Tourism Data & Intelligence Platform**.

The database must support a real production-oriented tourism data project for the southern border provinces of Thailand:

```text
Yala
Pattani
Narathiwat
```

The schema must support:

```text
tourist recording
travel behavior analysis
tourism promotion planning
dashboard analytics
sustainable tourism indicators
certificate generation
digital stamp/passport
optional survey
privacy-safe exports
admin CMS
audit logging
future official data integration
```

This is not a simple CRUD database.

---

## When to Use This Skill

Use this skill when the task involves:

```text
database schema design
ERD design
data dictionary
table relationships
normalization
constraints
indexes
data quality rules
dashboard analytics schema
export schema
privacy-safe data modeling
migration review
seed data planning
```

Also use it when reviewing whether a feature has enough database support before implementation.

---

## Required Context

Before doing database design work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_DATABASE_PROMPT.md
docs/database/DATABASE_REQUIREMENTS.md
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
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/AUDIT_LOGGING.md
checklists/DATABASE_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## Database Design Mission

Design a database that is:

```text
analytics-ready
privacy-aware
constraint-protected
dashboard-friendly
export-safe
auditable
maintainable
extensible
```

The database must make wrong data difficult to store and useful data easy to analyze.

---

## Core Business Model

The platform collects data through a value-first tourist experience:

```text
Tourist scans QR code.
Tourist sees attraction/photo spot landing.
Tourist enters minimal profile and consent.
Tourist uploads photo.
Tourist receives certificate.
Tourist earns stamp.
Tourist may answer optional survey.
Dashboard aggregates the data for tourism planning.
```

The database must represent this flow without confusing different concepts.

---

## Critical Concept Separation

Never mix these concepts:

```text
QR scan
landing view
tourist profile
visit
photo upload
certificate
stamp
survey response
official tourist arrival
```

Important definitions:

```text
QR scan = funnel event.
Landing view = funnel event.
Visit = tourist participation record created after minimal profile/consent.
Certificate = generated reward tied to a visit.
Stamp = one earned collectible per tourist-attraction.
Survey = optional post-certificate data.
Official arrival = external/government statistic, not the same as platform visit.
```

---

## Required Table Groups

Design table groups around these domains:

```text
1. Location/reference
2. Attractions and public content
3. QR/check-in and photo spots
4. Tourist profile and identity
5. Visits
6. Uploaded photos
7. Certificates
8. Digital stamps/passport
9. Travel behavior, expense, satisfaction
10. Funnel analytics
11. Consent and privacy
12. Admin users, roles, permissions
13. Audit logging
14. Export/reporting
15. Official data integration future
16. Dashboard summary tables future
```

---

# Core Tables

---

## 1. Location and Reference Tables

Recommended tables:

```text
provinces
districts
countries
attraction_types
transport_modes
travel_purposes
travel_companions
expense_categories
spending_ranges
```

Rules:

```text
Yala, Pattani, Narathiwat must exist.
Thailand must exist in countries.
Reference values must be seedable.
Inactive reference values must not break historical records.
Reference tables should use stable codes where possible.
```

Design checklist:

```text
[ ] name_th exists where needed.
[ ] name_en exists where needed.
[ ] is_active exists where useful.
[ ] unique code exists where useful.
[ ] foreign keys enforce location hierarchy.
```

---

## 2. Attractions and Public Content

Recommended tables:

```text
attractions
attraction_images
attraction_360_media
```

Attractions should support:

```text
public attraction page
admin CMS
province/district analytics
published/draft/inactive states
360 media attachment
tourism history/content
dashboard filtering
```

Recommended fields:

```text
attraction_id
slug
province_id
district_id
attraction_type_id
name_th
name_en
short_description_th
short_description_en
description_th
description_en
history_th
history_en
latitude
longitude
cover_image_path
is_published
is_active
published_at
created_by
updated_by
created_at
updated_at
```

Constraints:

```text
unique slug
province_id FK
district_id FK
latitude between -90 and 90
longitude between -180 and 180
```

Do not store tourist personal data in attraction tables.

---

## 3. Photo Spots and Check-in Codes

Recommended tables:

```text
photo_spots
checkin_codes
```

Photo spots represent prepared places where tourists can take photos.

Check-in codes represent QR entry points.

Important rules:

```text
A check-in code belongs to an attraction.
A check-in code may optionally belong to a photo spot.
A QR scan is not a visit.
Invalid/inactive/expired code states must be representable.
```

Recommended check-in fields:

```text
checkin_code_id
code
attraction_id
photo_spot_id
label
is_active
starts_at
ends_at
created_by
created_at
updated_at
```

Required constraints:

```text
unique checkin_codes.code
checkin_codes.attraction_id FK
checkin_codes.photo_spot_id FK nullable
starts_at <= ends_at if both exist
```

---

## 4. Tourist and Identity Model

Recommended tables:

```text
tourists
tourist_identities
```

Tourist data must be minimal.

Recommended tourist fields:

```text
tourist_id
display_name
origin_country_id
origin_province_id
age_group
preferred_language
is_anonymized
anonymized_at
created_at
updated_at
```

Identity fields:

```text
tourist_identity_id
tourist_id
provider
provider_user_id
linked_at
last_seen_at
metadata_json
created_at
updated_at
```

Providers:

```text
anonymous_device
line
email future
```

Required constraints:

```text
unique(provider, provider_user_id)
tourist_id FK
```

Do not collect:

```text
national ID
passport number
full address
exact birthdate
required phone
required email
required LINE
```

Use:

```text
age group instead of exact age
broad origin instead of full address
optional identity linking instead of required login
```

---

## 5. Visits

Recommended table:

```text
visits
```

A visit is the central participation record.

Recommended fields:

```text
visit_id
tourist_id
attraction_id
photo_spot_id
checkin_code_id
visit_date
completion_status
travel_companion_id
group_size
transport_mode_id
travel_purpose_id
overnight_status
nights
created_at
updated_at
```

Rules:

```text
Visit is created after minimal profile and consent.
Repeat visits are allowed.
QR scans are not visits.
Visit can exist before certificate completion.
Visit completion_status tracks flow progress.
```

Constraints:

```text
tourist_id FK
attraction_id FK
photo_spot_id FK nullable
checkin_code_id FK nullable
group_size >= 1 if not null
nights >= 0 if not null
completion_status controlled
```

Never add:

```text
unique(tourist_id, attraction_id)
```

on visits, because this blocks repeat visits. Duplicate stamp control belongs in `tourist_stamps`.

---

## 6. Visit Photos

Recommended table:

```text
visit_photos
```

Store metadata only.

Fields:

```text
visit_photo_id
visit_id
storage_bucket
storage_path
mime_type
file_size_bytes
width
height
is_active
deleted_at
created_at
updated_at
```

Rules:

```text
Do not store base64 image in database.
Do not store signed URL permanently.
Do not include personal data in storage_path.
Tourist photos should be private or controlled.
```

Constraints:

```text
visit_id FK
file_size_bytes > 0
mime_type validated by service
```

---

## 7. Certificates

Recommended tables:

```text
certificate_templates
certificates
```

Certificate fields:

```text
certificate_id
visit_id
certificate_template_id
storage_bucket
storage_path
status
generated_at
revoked_at
deleted_at
download_count
created_at
updated_at
```

Rules:

```text
Certificate belongs to visit.
Certificate generation should be idempotent.
One active/generated certificate per visit is recommended.
Certificate file should be private/controlled.
Certificate path contains no personal data.
```

Certificate content must not include:

```text
email
LINE ID
internal tourist ID
phone
national ID
full address
```

---

## 8. Digital Stamps / Passport

Recommended tables:

```text
stamp_definitions
tourist_stamps
```

Stamp definitions belong to attractions.

Tourist stamps represent earned collectibles.

Fields:

```text
tourist_stamp_id
tourist_id
attraction_id
stamp_definition_id
source_visit_id
earned_at
created_at
```

Required constraint:

```text
unique(tourist_id, attraction_id)
```

Important rule:

```text
Repeat visits are allowed; duplicate stamps are not.
```

---

## 9. Survey, Expense, Satisfaction

Recommended tables:

```text
satisfaction_surveys
visit_expenses
```

or a more generic survey model if the project needs dynamic surveys.

MVP should stay simple unless dynamic surveys are required.

Survey fields:

```text
satisfaction_survey_id
visit_id
overall_score
safety_score
cleanliness_score
transport_score
information_score
service_score
value_score
revisit_intention
recommendation_intention
comment
completed_at
created_at
updated_at
```

Expense fields:

```text
visit_expense_id
visit_id
spending_range_id
expense_category_id
currency
amount_min
amount_max
is_open_ended
created_at
updated_at
```

Rules:

```text
Survey is optional.
Missing satisfaction = null, not zero.
Scores are 1-5.
Spending is range-based estimate, not revenue.
Comments are optional and restricted.
```

Constraints:

```text
scores between 1 and 5 if not null
unique survey per visit or controlled duplicate policy
comment max length
amount_min >= 0
amount_max >= amount_min if not null
```

---

## 10. Funnel Events

Recommended table:

```text
funnel_events
```

Fields:

```text
funnel_event_id
event_name
event_time
session_id
tourist_id
visit_id
attraction_id
photo_spot_id
checkin_code_id
metadata_json
created_at
```

Event names:

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
survey_started
survey_completed
passport_saved
```

Rules:

```text
Funnel events are not visits.
Event counts are not unique people unless deduplicated explicitly.
metadata_json must not contain secrets or personal identifiers.
```

---

## 11. Consent Records

Recommended table:

```text
consent_records
```

Fields:

```text
consent_record_id
tourist_id
visit_id
consent_version
consent_type
purpose_key
has_consented
consented_at
withdrawn_at
source
language
created_at
```

Rules:

```text
Consent required before profile/visit save.
Consent checkbox must not be pre-checked.
Consent must store version, source, purpose, timestamp.
Separate marketing/communication consent from certificate/data collection consent.
```

---

## 12. Admin / RBAC

Recommended tables:

```text
admin_users
roles
permissions
role_permissions
admin_user_roles
```

Required roles:

```text
super_admin
admin
viewer
```

Important constraints:

```text
roles.role_key unique
permissions.permission_key unique
admin_users.auth_user_id unique
role_permissions(role_id, permission_id) unique
admin_user_roles(admin_user_id, role_id) unique
```

Rules:

```text
viewer is read-only
viewer cannot export detailed data
admin manages content
super_admin manages users/roles
```

---

## 13. Audit Logs

Recommended table:

```text
audit_logs
```

Fields:

```text
audit_log_id
actor_user_id
actor_type
action
entity_type
entity_id
result
old_values_json
new_values_json
metadata_json
request_id
created_at
```

Audit required for:

```text
exports
role/user changes
attraction publish/deactivate
check-in code create/deactivate
admin media changes
official data import
anonymization/deletion
sensitive denied attempts where designed
```

Do not store:

```text
secrets
tokens
signed URLs
full exported rows
raw uploaded file content
```

---

## 14. Export Jobs

Recommended table:

```text
export_jobs
```

Fields:

```text
export_job_id
requested_by
export_type
filters_json
status
row_count
storage_bucket
storage_path
expires_at
created_at
updated_at
```

Rules:

```text
Exports require permission.
Exports are audited.
Export files are private.
Export files expire.
Default exports exclude private identifiers.
```

---

## 15. Official Data Future

Future tables:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Rule:

```text
Local platform visits are not official arrivals.
```

Dashboard labels must separate official statistics from local platform participation data.

---

# Constraints and Data Quality

---

## Required Unique Constraints

Always verify:

```text
attractions.slug unique
checkin_codes.code unique
tourist_identities(provider, provider_user_id) unique
tourist_stamps(tourist_id, attraction_id) unique
roles.role_key unique
permissions.permission_key unique
```

Recommended:

```text
one active/generated certificate per visit
one satisfaction survey per visit or explicit duplicate policy
```

---

## Required Check Constraints

Recommended:

```text
latitude between -90 and 90
longitude between -180 and 180
group_size >= 1
nights >= 0
file_size_bytes > 0
scores between 1 and 5
amount_min >= 0
amount_max >= amount_min when not null
starts_at <= ends_at
```

---

## Foreign Key Rules

Use foreign keys for important relationships:

```text
district -> province
attraction -> province/district/type
photo_spot -> attraction
checkin_code -> attraction/photo_spot
tourist_identity -> tourist
visit -> tourist/attraction/photo_spot/checkin_code
visit_photo -> visit
certificate -> visit/template
tourist_stamp -> tourist/attraction/stamp_definition/source_visit
survey -> visit
expense -> visit/spending_range/category
consent -> tourist/visit
audit -> actor where appropriate
```

Avoid cascade delete for historical records unless explicitly designed.

---

## Status and Enum Rules

Use controlled values for:

```text
visit completion_status
certificate status
checkin code status
age_group
preferred_language
overnight_status
identity provider
consent type
audit result
export status
```

Prefer reference tables when values need labels, localization, or admin control.

---

# Indexing Strategy

---

## Required Indexes

Recommended:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
visits(completion_status)
attractions(province_id)
attractions(slug)
checkin_codes(code)
certificates(visit_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys(visit_id)
visit_expenses(visit_id)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
audit_logs(created_at)
export_jobs(requested_by, created_at)
```

Use `EXPLAIN` for dashboard-heavy queries when practical.

---

## Dashboard Query Support

The schema must support:

```text
visit trend by date
visits by province
visits by attraction
tourist origin distributions
age group distributions
transport/travel purpose distributions
spending range distributions
satisfaction averages
funnel conversion rates
attraction concentration
promotion/improvement quadrants
```

---

# Privacy Design

---

## Do Not Model These as Required Tourist Data

Do not require or add default columns for:

```text
national ID
passport number
full address
exact birthdate
phone
email
LINE ID
religion
ethnicity
health data
political data
income
```

LINE/email may exist only in optional identity tables.

---

## Privacy-Safe Analytics

Dashboard and analytics tables must not include:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments
```

Analytics should use:

```text
counts
percentages
averages
ranges
grouped categories
aggregated metrics
```

---

## Anonymization Design

Plan for:

```text
tourists.is_anonymized
tourists.anonymized_at
identity unlinking
photo deletion
certificate revocation/deletion
raw comment redaction
export expiration
audit retention
```

Analytics may preserve safe aggregated counts after anonymization.

---

# Dashboard Metric Rules

---

## Core Rules

The schema must support these definitions:

```text
Tourist Profiles = distinct tourist_id among visits in filter.
Total Visits = count of visits, not QR scans.
Certificates Generated = count of certificates.
Stamps Earned = count of tourist_stamps.
Average Satisfaction = average non-null score.
Estimated Spending = range-based estimate, not revenue.
Funnel = event counts/conversions, not visit counts.
```

Do not design the schema in a way that forces wrong dashboard calculations.

---

## Null and Missing Data

Use:

```text
null for missing optional answers
prefer_not_to_answer as explicit category where useful
unknown/not_answered for controlled missing category where needed
```

Do not store:

```text
0 satisfaction for missing answer
0 spending for missing expense
0 nights for missing if the user did not answer and overnight status unknown
```

---

# Migration and Seed Rules

---

## Migration Rules

Migrations should be:

```text
ordered
readable
safe
constraint-aware
index-aware
reviewable
```

Migration filename format:

```text
YYYYMMDDHHMM_description.sql
```

Avoid destructive changes without backup/migration plan.

---

## Seed Rules

Seed scripts should be:

```text
rerunnable
idempotent
stable
environment-aware
free of real personal data
```

Seed required:

```text
Yala/Pattani/Narathiwat
districts
countries
age groups
transport modes
travel purposes
travel companions
spending ranges
expense categories
attraction types
roles
permissions
certificate template
sample staging/demo attraction/photo spot/check-in code
```

---

# Database Review Procedure

When reviewing database work, check:

```text
1. Does the schema support the original product goal?
2. Are tourist, visit, QR, certificate, stamp, survey concepts separated?
3. Are privacy rules respected?
4. Are constraints strong enough?
5. Are repeat visits allowed?
6. Are duplicate stamps prevented?
7. Can dashboard metrics be calculated correctly?
8. Are indexes included for expected queries?
9. Are exports and audit logs supported?
10. Are docs/data dictionary updated?
```

---

## Database Blockers

Block work if it:

```text
requires LINE/email/phone/national ID before certificate
stores full address or exact birthdate without need
counts QR scans as visits
prevents repeat visits
allows duplicate stamps without control
stores images as base64
stores signed URLs permanently
lacks consent model
lacks admin permission model
lacks export audit model
returns personal identifiers in analytics tables
has no key foreign keys
has no key unique constraints
has no dashboard indexes
```

---

# Output Format

When completing database design work, respond with:

```text
Summary
- ...

Files changed
- ...

Schema changes
- tables
- constraints
- indexes
- seeds

Privacy/security notes
- ...

Dashboard/analytics notes
- ...

Validation
- migration/test command results

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

A strong database makes the rest of the platform possible.

If the database is weak, the dashboard will be misleading, exports will be unsafe, and the academic/production quality of the project will fail.
