# CODEX_DATABASE_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to design, implement, review, or debug database work for the **Southern Border Tourism Data & Intelligence Platform**.

The database is the core of this project. It must support real tourist data collection, dashboard analytics, privacy protection, exports, certificate generation, digital passport/stamp, and sustainable tourism planning for:

```text
Yala
Pattani
Narathiwat
```

This is not a simple CRUD schema. It is a production-oriented tourism data platform.

---

## 2. Database Mission

The database mission is:

```text
Store high-quality, privacy-aware, analytics-ready tourist participation data that connects tourists, visits, attractions, travel behavior, expenses, satisfaction, certificates, stamps, and dashboard metrics.
```

The database must support:

```text
tourist recording
travel behavior analysis
tourism promotion planning
sustainable tourism dashboard
certificate generation
digital passport/stamp collection
optional survey
expense range analysis
satisfaction analysis
admin CMS
exports
audit logging
future official data comparison
```

---

## 3. Required Opening Instruction for Codex

Start database tasks with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
This database must be production-oriented, analytics-ready, and privacy-aware.
Read the database, security, dashboard, and acceptance documents before editing migrations or schema.
Do not over-collect personal data.
Do not weaken constraints, privacy, or dashboard correctness.
```

---

## 4. Documents to Read Before Database Work

Codex should read:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
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
docs/security/ROW_LEVEL_SECURITY.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/AUDIT_LOGGING.md
checklists/DATABASE_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## 5. Database Scope

Database work may include:

```text
schema design
migrations
seed data
constraints
indexes
RLS policies
storage metadata strategy
analytics tables
views/materialized views
data dictionary updates
ERD updates
migration tests
seed tests
```

---

## 6. Preferred Database Technology

Use:

```text
PostgreSQL via Supabase
```

Assume:

```text
Supabase Auth may be used for admin users.
Tourists may not be Supabase Auth users.
Tourists can use guest identity and optional LINE/email linking.
Supabase Storage is used for photos, certificates, media, stamps, exports.
```

---

# Core Database Design Rules

---

## 7. Core Entity Groups

The schema should be organized around these groups:

```text
reference/location
attractions/public content
QR/check-in/photo spots
tourist profile and identity
visits
photo upload metadata
certificate generation
digital stamp/passport
survey/expense/satisfaction
funnel events
admin users/roles/permissions
audit logs
exports
official data future
analytics summary future
```

---

## 8. Core Tables

Recommended core tables:

```text
provinces
districts
countries
attraction_types
attractions
attraction_images
attraction_360_media
photo_spots
checkin_codes
tourists
tourist_identities
visits
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
transport_modes
travel_purposes
travel_companions
expense_categories
spending_ranges
satisfaction_surveys
visit_expenses
funnel_events
consent_records
admin_users
roles
permissions
role_permissions
admin_user_roles
audit_logs
export_jobs
official_tourism_stats future
official_attraction_refs future
data_import_logs future
daily_attraction_stats future
monthly_province_stats future
daily_funnel_stats future
daily_satisfaction_stats future
daily_expense_stats future
```

Codex may adjust table names if the existing codebase already uses a consistent convention, but must keep the data model equivalent.

---

## 9. Naming Conventions

Recommended:

```text
snake_case table names
snake_case column names
singular or plural consistently
primary key: table_singular_id
foreign key: referenced_table_singular_id
timestamps: created_at, updated_at
soft delete/deactivate: is_active, deactivated_at, deactivated_by
```

Examples:

```text
tourist_id
visit_id
attraction_id
photo_spot_id
checkin_code_id
certificate_id
```

Avoid:

```text
mixedCase database columns
unclear abbreviations
columns named data1/data2
ambiguous id fields
```

---

## 10. ID Strategy

Choose one consistent strategy:

Option A:

```text
bigint generated identity
```

Option B:

```text
uuid
```

Supabase/PostgreSQL can support both. The decision should be documented.

Checklist:

```text
[ ] Primary key strategy is consistent.
[ ] Foreign key types match primary key types.
[ ] Public-facing codes use random/non-sequential tokens where needed.
[ ] Internal IDs are not used as security tokens.
```

---

## 11. Timestamp Strategy

Most mutable tables should include:

```text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Event tables may include:

```text
event_time
visit_date
generated_at
earned_at
completed_at
consented_at
```

Use `timestamptz` for event times.

---

## 12. Soft Delete / Deactivation Strategy

Avoid hard delete for historical records.

Use:

```text
is_active
deactivated_at
deactivated_by
```

or status fields for:

```text
attractions
photo_spots
checkin_codes
certificate_templates
stamp_definitions
admin_users
```

Do not casually hard delete:

```text
visits
certificates
surveys
consent_records
audit_logs
```

Hard delete may be acceptable for:

```text
temporary uploads
expired exports
identity unlinking during anonymization
orphan files
```

---

# Reference and Master Data

---

## 13. Location Tables

Required:

```text
provinces
districts
countries
```

Must include:

```text
Yala
Pattani
Narathiwat
Thailand
```

Relationships:

```text
districts.province_id -> provinces.province_id
```

Recommended fields:

```text
province_id
province_code
name_th
name_en
is_active
created_at
updated_at
```

```text
district_id
province_id
district_code
name_th
name_en
is_active
created_at
updated_at
```

```text
country_id
iso2
iso3
name_th
name_en
is_active
created_at
updated_at
```

---

## 14. Tourism Reference Tables

Recommended:

```text
attraction_types
transport_modes
travel_purposes
travel_companions
expense_categories
spending_ranges
```

Rules:

```text
reference values must be controlled
reference values should be seedable
inactive reference values should not break historical records
```

---

# Attraction and QR Model

---

## 15. Attractions Table

Required role:

```text
Store public and admin-managed tourism attraction data.
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
address_text_th
address_text_en
cover_image_path
is_published
is_active
published_at
created_by
updated_by
created_at
updated_at
```

Important constraints:

```text
unique slug
province_id FK
district_id FK
latitude between -90 and 90 if not null
longitude between -180 and 180 if not null
```

Privacy:

```text
public attraction table must not contain tourist personal data
```

---

## 16. Attraction Media Tables

Recommended:

```text
attraction_images
attraction_360_media
```

Rules:

```text
Only published/active media should appear publicly.
Private storage paths should not be exposed if bucket is private.
Admin media upload requires permission.
```

---

## 17. Photo Spots Table

Purpose:

```text
Represent prepared photo/check-in points at attractions.
```

Recommended fields:

```text
photo_spot_id
attraction_id
name_th
name_en
description_th
description_en
qr_instruction_th
qr_instruction_en
latitude
longitude
is_active
created_at
updated_at
```

Relationships:

```text
photo_spots.attraction_id -> attractions.attraction_id
```

---

## 18. Check-in Codes Table

Purpose:

```text
Represent QR/check-in entry points.
```

Recommended fields:

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

Constraints:

```text
unique code
attraction_id FK
photo_spot_id FK nullable
starts_at <= ends_at if both present
```

Important rules:

```text
QR scan is not a visit.
Invalid/inactive/expired QR must be handled safely.
Check-in code response must not expose admin-only fields.
```

---

# Tourist and Visit Model

---

## 19. Tourist Table

Purpose:

```text
Store minimal tourist profile data needed for certificate and analytics.
```

Recommended fields:

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

Privacy rules:

```text
No national ID.
No passport number.
No full address.
No exact birthdate.
No required phone.
No required email.
No required LINE.
Age group instead of exact age.
Origin broad enough for analytics.
```

---

## 20. Tourist Identities Table

Purpose:

```text
Support guest identity and optional LINE/email linking.
```

Recommended fields:

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

Constraints:

```text
unique(provider, provider_user_id)
tourist_id FK
```

Privacy:

```text
provider_user_id is sensitive
do not show in dashboard/export by default
```

---

## 21. Visits Table

Purpose:

```text
Represent an actual tourist visit/participation at an attraction.
```

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
Repeat visits are allowed.
QR scans are not visits.
Visit is created after minimal profile/consent flow, not merely from QR scan.
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

Do not:

```text
do not make unique(tourist_id, attraction_id) on visits
```

That would incorrectly block repeat visits.

---

# Photo, Certificate, Stamp

---

## 22. Visit Photos Table

Purpose:

```text
Store metadata for tourist-uploaded photos.
```

Recommended fields:

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

Constraints:

```text
visit_id FK
file_size_bytes > 0
mime_type controlled or validated in service
```

Privacy:

```text
storage_path must not contain personal data
signed URL must not be stored permanently
photo bucket should be private/controlled
```

---

## 23. Certificate Templates Table

Purpose:

```text
Store active certificate template definitions.
```

Recommended fields:

```text
certificate_template_id
template_key
name
language
province_id
attraction_id
template_config_json
is_active
created_at
updated_at
```

---

## 24. Certificates Table

Purpose:

```text
Store generated certificate metadata.
```

Recommended fields:

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

Constraints:

```text
visit_id FK
template_id FK
one active/generated certificate per visit
status controlled
```

Privacy:

```text
certificate path contains no personal data
certificate file private/controlled
certificate must not include email/LINE/internal ID
```

---

## 25. Stamp Definitions Table

Purpose:

```text
Define stamp graphics/meaning per attraction.
```

Recommended fields:

```text
stamp_definition_id
attraction_id
name_th
name_en
description_th
description_en
image_bucket
image_path
is_active
created_at
updated_at
```

---

## 26. Tourist Stamps Table

Purpose:

```text
Record earned digital stamps.
```

Recommended fields:

```text
tourist_stamp_id
tourist_id
attraction_id
stamp_definition_id
source_visit_id
earned_at
created_at
```

Constraints:

```text
unique(tourist_id, attraction_id)
tourist_id FK
attraction_id FK
stamp_definition_id FK
source_visit_id FK
```

Important rule:

```text
Repeat visits are allowed; duplicate stamps are not.
```

---

# Survey, Expense, Satisfaction

---

## 27. Satisfaction Surveys Table

Purpose:

```text
Store optional survey satisfaction answers.
```

Recommended fields:

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

Constraints:

```text
visit_id FK
unique(visit_id) or controlled duplicate policy
scores between 1 and 5 if not null
comment max length
```

Rules:

```text
Survey is optional.
Missing satisfaction is null, not zero.
Raw comments are restricted.
```

---

## 28. Visit Expenses Table

Purpose:

```text
Store optional expense range data.
```

Recommended fields:

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
Use ranges, not exact income.
Estimated spending is not revenue.
prefer_not_to_answer is allowed where appropriate.
```

---

# Funnel Events

---

## 29. Funnel Events Table

Purpose:

```text
Track conversion/drop-off in tourist flow.
```

Recommended fields:

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
Event count is not unique tourist count unless explicitly calculated.
metadata_json must not contain secrets or personal identifiers.
```

---

# Consent and Audit

---

## 30. Consent Records Table

Purpose:

```text
Store consent evidence for tourist data collection.
```

Recommended fields:

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
Consent checkbox not pre-checked.
Consent required before profile/visit save.
Consent purpose/version/source/timestamp stored.
```

---

## 31. Audit Logs Table

Purpose:

```text
Record sensitive admin/system actions.
```

Recommended fields:

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

Audit:

```text
exports
role changes
user changes
attraction publish/deactivate
check-in code create/deactivate
official data import
anonymization/deletion
sensitive denied attempts
```

Rules:

```text
do not log secrets
do not log raw exported rows
sanitize metadata
restrict audit log access
```

---

# Admin and Authorization Tables

---

## 32. Admin User / Role / Permission Tables

Recommended:

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

---

# Export and Official Data

---

## 33. Export Jobs Table

Purpose:

```text
Track generated exports and file retention if exports are stored.
```

Recommended fields:

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
exports require permission
exports are audited
export files private
export files expire
```

---

## 34. Official Data Tables Future

Recommended future tables:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Important rule:

```text
Local platform visits are not official tourist arrivals.
```

Dashboard may compare local platform data with official data, but labels must be clear.

---

# Constraints and Indexes

---

## 35. Required Unique Constraints

Must include:

```text
unique attractions.slug
unique checkin_codes.code
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
unique roles.role_key
unique permissions.permission_key
```

Recommended:

```text
unique active/generated certificate per visit
unique satisfaction survey per visit
```

---

## 36. Required Check Constraints

Recommended:

```text
latitude between -90 and 90
longitude between -180 and 180
group_size >= 1
nights >= 0
file_size_bytes > 0
satisfaction scores between 1 and 5
amount_min >= 0
amount_max >= amount_min if not null
starts_at <= ends_at for check-in codes
```

---

## 37. Required Indexes

Recommended indexes:

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

Dashboard-specific indexes should be reviewed after metric queries are implemented.

---

# RLS and Storage

---

## 38. RLS Requirements

Sensitive tables should not be publicly readable:

```text
tourists
tourist_identities
visits
visit_photos
certificates
satisfaction_surveys
visit_expenses
consent_records
audit_logs
export_jobs
admin_users
roles
permissions
```

Public read may apply to:

```text
published active attractions
safe reference tables
public attraction images
stamp assets
```

If service role is used server-side, backend must enforce authorization manually.

Never expose service role key to browser.

---

## 39. Storage Buckets

Recommended buckets:

```text
attraction-media
stamp-assets
visit-photos
certificate-files
export-files
official-imports
temp-uploads
```

Rules:

```text
attraction-media: public read / admin write
stamp-assets: public read / admin write
visit-photos: private/controlled
certificate-files: private/controlled
export-files: private
official-imports: private
temp-uploads: private
```

Database should store:

```text
bucket
storage_path
mime_type
file_size_bytes
```

Database should not store:

```text
signed URL permanently
image base64
personal data inside path
```

---

# Dashboard Analytics Rules

---

## 40. Dashboard Metric Data Rules

Schema must support these correct metrics:

```text
Tourist Profiles = distinct tourist_id through visits in filter
Total Visits = visits count, not QR scans
Certificates Generated = certificates count
Stamps Earned = tourist_stamps count
Survey Completion Rate = survey count / certificate or visit denominator as documented
Average Satisfaction = average non-null score
Estimated Spending = range-based estimate, not revenue
Funnel Conversion = event/stage counts, not visits unless specified
```

Database/schema must not force incorrect assumptions.

---

## 41. Null and Missing Data Rules

Important:

```text
missing satisfaction = null
missing expense = null
unknown origin = unknown/not_answered
prefer_not_to_answer is explicit
zero count is different from no data
```

Do not store missing optional survey answers as `0`.

---

# Migration Requirements

---

## 42. Migration Quality

Codex should:

```text
use ordered migration file names
keep migrations readable
avoid destructive changes without clear reason
include constraints/indexes
include comments if useful
ensure migrations can run on empty database
document assumptions
```

Migration naming:

```text
YYYYMMDDHHMM_description.sql
```

Example:

```text
202605190900_create_reference_tables.sql
202605190930_create_tourism_core_tables.sql
202605191000_create_security_tables.sql
```

---

## 43. Seed Data Requirements

Seed:

```text
Yala, Pattani, Narathiwat
districts
countries including Thailand
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
stamp definitions sample
demo attraction/photo spot/check-in code for staging
```

Seed scripts must be:

```text
safe to rerun
not duplicate data
not contain real personal tourist data
```

---

# Database Task Prompt Template

---

## 44. Standard Database Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Describe database task.]

Context:
[Explain product/database reason.]

Read first:
- CODEX_MAIN_PROMPT.md
- prompts/CODEX_DATABASE_PROMPT.md
- docs/database/DATABASE_REQUIREMENTS.md
- docs/database/ERD_OVERVIEW.md
- docs/database/DATA_DICTIONARY.md
- docs/database/RELATIONSHIPS.md
- docs/database/INDEXING_STRATEGY.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/security/ROW_LEVEL_SECURITY.md
- docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
- checklists/DATABASE_CHECKLIST.md

Requirements:
- [List schema/migration/seed requirements.]

Constraints:
- [List required constraints.]

Indexes:
- [List required indexes.]

Privacy:
- Do not over-collect personal data.
- Do not store signed URLs permanently.
- Do not store image base64.
- Do not store personal data in storage paths.

Validation:
- Run migration/test command if available.
- Update docs/data dictionary if schema changes.

Do not:
- Do not block repeat visits.
- Do not count QR scans as visits.
- Do not require LINE/email/phone/national ID for certificate.
- Do not weaken privacy/security.

Completion response:
Summary
Files changed
Validation
Schema notes
Risks / Notes
Next suggested task
```

---

# Review Checklist for Database Work

---

## 45. Before Accepting Database Work

Check:

```text
[ ] Schema supports original project goals.
[ ] Tables are normalized enough for analytics.
[ ] Required FKs exist.
[ ] Required unique constraints exist.
[ ] Required check constraints exist.
[ ] Indexes support dashboard/export queries.
[ ] Consent/audit/admin tables exist or are planned.
[ ] Privacy minimization is respected.
[ ] Repeat visits are allowed.
[ ] Duplicate stamps are prevented.
[ ] Dashboard metrics can be calculated.
[ ] Export privacy can be enforced.
[ ] Data dictionary updated.
```

---

## 46. Critical Database Blockers

Block if:

```text
national ID/full address required
LINE/email required for certificate
repeat visits impossible
duplicate stamps possible without control
QR scans stored as visits
no consent model
no admin permission model
no audit model for exports
photos stored as base64 in database
signed URLs stored permanently
no foreign keys
no key dashboard indexes
```

---

## 47. Database Completion Response Format

Codex should respond:

```text
Summary
- ...

Files changed
- ...

Validation
- migration command: passed/failed/not run
- tests: passed/failed/not run

Schema notes
- tables added
- constraints added
- indexes added
- assumptions

Privacy/security notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## 48. Final Database Rule

The database must be designed for analytics and privacy from day one.

If the database is weak, the dashboard, exports, security, academic report, and production readiness will also be weak.
