# DATABASE_REQUIREMENTS.md

## 1. Document Purpose

This document defines the database requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The database is the most important part of this project.

The project goal is not only to create a web application, but to build a high-quality tourism database that can support:

- Tourist data collection
- Travel behavior analysis
- Attraction visit tracking
- Expense analysis
- Satisfaction analysis
- Sustainable tourism planning
- Dashboard reporting
- Academic and administrative reporting

All developers and AI coding agents must read this file before creating or changing the database schema.

---

## 2. Database Mission

The database must support the original project mission:

> Build a local tourism database for Yala, Pattani, and Narathiwat that supports sustainable tourism planning and dashboard analytics.

The database must be designed to answer these planning questions:

- Who visits the southern border provinces?
- Where do tourists come from?
- Which attractions are visited?
- How do tourists travel?
- Do tourists stay overnight?
- How much do tourists spend?
- What are tourists satisfied or dissatisfied with?
- Which attractions are popular?
- Which attractions need improvement?
- Which tourism routes or campaigns should be promoted?
- How can tourism benefits be distributed more sustainably?

---

## 3. Core Data Dimensions

The schema must support five required data dimensions.

```text
Tourist
Travel Behavior
Attractions Visited
Expenses
Satisfaction
```

Every major table must support one or more of these dimensions.

---

## 4. Database Design Principles

## 4.1 Separate Person from Visit

A tourist and a visit are not the same thing.

Correct:

```text
tourists = profile/person-level information
visits = each attraction/travel participation event
```

Incorrect:

```text
one row = one tourist + one visit + one survey + one certificate
```

A tourist may visit many attractions.

A tourist may generate many certificates.

A tourist may answer many surveys.

A tourist may have many identities.

---

## 4.2 Separate Identity from Tourist Profile

A tourist may be recognized using several identity methods.

Examples:

- Anonymous device token
- LINE user ID
- Email
- Future Google identity

Therefore, identity data must be separated from the tourist profile.

Correct:

```text
tourists
tourist_identities
```

Incorrect:

```text
tourists.line_user_id
tourists.email
tourists.device_id
```

It is acceptable to store basic contact fields in a separate `tourist_contacts` table if needed.

---

## 4.3 Separate Visit from Stamp

A tourist can visit the same attraction multiple times.

However, the tourist should normally earn the attraction stamp only once.

Correct:

```text
visits = every visit event
tourist_stamps = earned stamp records
```

A repeat visit creates a new visit record but does not create a duplicate stamp for the same attraction unless the business rule changes.

---

## 4.4 Separate Certificate from Photo

A photo is an uploaded source file.

A certificate is a generated output file.

Correct:

```text
visit_photos
certificates
```

A visit may have one or more uploaded photos in the future, but MVP may use one main photo.

A certificate should link to:

- visit
- tourist
- attraction
- photo
- template

---

## 4.5 Use Master Data for Controlled Values

Avoid uncontrolled free text for values that must be analyzed.

Use master tables for:

- Countries
- Provinces
- Districts
- Attraction types
- Transport modes
- Travel companions
- Travel purposes
- Expense categories
- Age groups if implemented as table
- Satisfaction questions
- Certificate templates

This improves dashboard accuracy.

---

## 4.6 Use Structured Survey Data

Survey data should support dashboard calculations.

Avoid storing all survey answers as one free-text block.

Use structured fields or answer tables.

For MVP, direct structured columns are acceptable for common satisfaction values.

For future flexibility, use:

```text
survey_questions
survey_answers
```

---

## 4.7 Design for Dashboard Queries

The schema must support filters by:

- Date
- Province
- District
- Attraction
- Photo spot
- Tourist origin
- Country
- Age group
- Transport mode
- Travel purpose
- Spending range
- Satisfaction score
- Campaign
- Identity type

Common dashboard filters must be indexed.

---

## 4.8 Privacy by Design

The database must avoid unnecessary personal data.

Do not store:

- National ID number
- Full home address
- Sensitive personal data
- Required legal name
- Required phone number
- Required email
- Required GPS location

Store only what is needed for the project purpose.

Preferred profile fields:

- Display name
- Origin country
- Origin province
- Age group
- Preferred language
- Optional contact identity

---

## 4.9 Consent Must Be Stored

If tourist data is collected, consent must be recorded.

The database must store:

- Consent status
- Consent version
- Purpose
- Timestamp
- Tourist or visit reference
- Source or channel

---

## 4.10 Track Admin Changes

Admin changes should be auditable.

Important actions should be logged:

- Create attraction
- Update attraction
- Deactivate attraction
- Create photo spot
- Update QR/check-in code
- Export data
- Change role
- Review photo
- Change settings

---

## 5. Recommended Database System

For MVP:

```text
Supabase PostgreSQL
```

Reasons:

- PostgreSQL is strong for relational data.
- Supabase provides Auth, Storage, and SQL access.
- It supports Row Level Security.
- It works well with Next.js.
- It can support future production deployment.

---

## 6. Naming Conventions

## 6.1 Table Names

Use snake_case plural table names.

Examples:

```text
tourists
tourist_identities
attractions
photo_spots
checkin_codes
visits
visit_photos
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
funnel_events
```

## 6.2 Column Names

Use snake_case.

Examples:

```text
tourist_id
attraction_id
origin_country_id
created_at
updated_at
is_active
```

## 6.3 Primary Keys

Use one of these patterns consistently:

Option A:

```text
id
```

Option B:

```text
tourist_id
visit_id
attraction_id
```

Recommendation for this project:

Use descriptive primary keys for clarity in academic documentation.

Examples:

```text
tourist_id
visit_id
attraction_id
photo_spot_id
certificate_id
```

## 6.4 Timestamps

Use consistent timestamp columns:

```text
created_at
updated_at
deleted_at
```

For special events:

```text
visited_at
uploaded_at
generated_at
earned_at
completed_at
consented_at
exported_at
```

## 6.5 Boolean Fields

Use clear boolean names:

```text
is_active
is_published
is_primary
is_completed
is_required
has_consented
```

---

## 7. Required Table Groups

The database should be organized into these logical groups.

## 7.1 Geography Tables

Required:

```text
countries
provinces
districts
```

Purpose:

Support origin tracking, attraction location, and dashboard filters.

---

## 7.2 Attraction Tables

Required:

```text
attraction_types
attractions
attraction_images
attraction_360_media
photo_spots
checkin_codes
```

Purpose:

Store tourism place information and QR entry points.

---

## 7.3 Tourist Tables

Required:

```text
tourists
tourist_identities
tourist_contacts
consent_logs
```

Purpose:

Store tourist profile, identity methods, optional contacts, and consent.

---

## 7.4 Visit Tables

Required:

```text
visits
visit_photos
certificates
tourist_stamps
```

Purpose:

Record participation, uploaded photos, generated certificates, and earned stamps.

---

## 7.5 Travel Behavior Tables

Required:

```text
travel_companions
transport_modes
travel_purposes
```

Purpose:

Provide structured options for travel behavior analysis.

---

## 7.6 Expense Tables

Required:

```text
expense_categories
visit_expenses
```

Purpose:

Store approximate spending data for planning and economic analysis.

---

## 7.7 Satisfaction and Survey Tables

Required:

```text
satisfaction_surveys
survey_questions
survey_answers
```

Purpose:

Store tourist satisfaction and optional survey answers.

For MVP, `satisfaction_surveys` can hold common structured scores directly.

---

## 7.8 Certificate and Stamp Tables

Required:

```text
certificate_templates
certificates
stamp_definitions
tourist_stamps
```

Purpose:

Support certificate generation and digital passport features.

---

## 7.9 Analytics Tables

Required or recommended:

```text
funnel_events
daily_attraction_stats
monthly_province_stats
dashboard_cache
```

For MVP, `funnel_events` is recommended.

Summary tables can be added after basic dashboard works.

---

## 7.10 Security and System Tables

Required:

```text
users
roles
permissions
user_roles
audit_logs
data_import_logs
```

If Supabase Auth is used, local `users` may reference Supabase auth user IDs.

---

## 7.11 Official Data Tables

Recommended for Phase 2:

```text
official_tourism_stats
official_attraction_refs
```

Purpose:

Support integration with official tourism statistics and attraction reference data.

---

## 8. Minimum MVP Tables

The MVP must not use fewer than these core tables:

```text
countries
provinces
districts
attraction_types
attractions
photo_spots
checkin_codes
tourists
tourist_identities
consent_logs
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
visit_expenses
satisfaction_surveys
funnel_events
```

Admin and security tables should be added if not fully handled by Supabase Auth.

---

## 9. Key Table Requirements

## 9.1 countries

Purpose:

Store countries for tourist origin and foreign tourist support.

Important columns:

```text
country_id
country_name_en
country_name_th
iso2_code
iso3_code
is_active
```

---

## 9.2 provinces

Purpose:

Store Thai provinces and especially the three target provinces.

Important columns:

```text
province_id
province_name_th
province_name_en
region_name
is_target_area
```

Target provinces:

- Yala
- Pattani
- Narathiwat

---

## 9.3 districts

Purpose:

Store districts under provinces.

Important columns:

```text
district_id
province_id
district_name_th
district_name_en
```

---

## 9.4 attractions

Purpose:

Store tourism attraction master data.

Important columns:

```text
attraction_id
province_id
district_id
attraction_type_id
slug
name_th
name_en
description_th
description_en
history_th
history_en
latitude
longitude
is_published
is_active
sustainability_category
estimated_capacity_per_day
created_at
updated_at
```

---

## 9.5 photo_spots

Purpose:

Store photo spots prepared for tourist participation.

Important columns:

```text
photo_spot_id
attraction_id
spot_name_th
spot_name_en
description_th
description_en
is_active
display_order
```

One attraction can have many photo spots.

---

## 9.6 checkin_codes

Purpose:

Store QR/check-in codes.

Important columns:

```text
checkin_code_id
code
attraction_id
photo_spot_id
campaign_id
is_active
starts_at
ends_at
created_at
```

`code` must be unique.

---

## 9.7 tourists

Purpose:

Store tourist profile data.

Important columns:

```text
tourist_id
display_name
origin_country_id
origin_province_id
age_group
preferred_language
created_at
updated_at
```

Avoid legal name and full address.

---

## 9.8 tourist_identities

Purpose:

Store identity methods.

Important columns:

```text
identity_id
tourist_id
provider
provider_user_id
is_primary
created_at
last_seen_at
```

Allowed providers:

```text
anonymous_device
line
email
google
```

Unique constraint should prevent duplicate provider identity.

---

## 9.9 consent_logs

Purpose:

Store consent records.

Important columns:

```text
consent_id
tourist_id
visit_id
consent_version
purpose
has_consented
consented_at
source
```

---

## 9.10 visits

Purpose:

Store each tourist visit or participation event.

Important columns:

```text
visit_id
tourist_id
attraction_id
photo_spot_id
checkin_code_id
visit_date
visited_at
travel_companion_id
transport_mode_id
travel_purpose_id
group_size
overnight_status
nights
completion_status
created_at
updated_at
```

A tourist may have many visits.

---

## 9.11 visit_photos

Purpose:

Store uploaded photo metadata.

Important columns:

```text
photo_id
visit_id
storage_path
thumbnail_path
original_filename
mime_type
file_size_bytes
approval_status
uploaded_at
```

---

## 9.12 certificates

Purpose:

Store generated certificate records.

Important columns:

```text
certificate_id
visit_id
template_id
photo_id
certificate_path
share_url
generated_at
download_count
```

---

## 9.13 tourist_stamps

Purpose:

Store earned digital stamps.

Important columns:

```text
stamp_id
tourist_id
attraction_id
visit_id
stamp_definition_id
earned_at
status
```

Recommended unique constraint:

```text
unique(tourist_id, attraction_id)
```

---

## 9.14 visit_expenses

Purpose:

Store approximate spending data.

Important columns:

```text
expense_id
visit_id
expense_category_id
spending_range
amount_min
amount_max
currency_code
created_at
```

MVP can use spending ranges instead of exact amount.

---

## 9.15 satisfaction_surveys

Purpose:

Store satisfaction and planning feedback.

Important columns:

```text
satisfaction_id
visit_id
attraction_id
overall_score
safety_score
cleanliness_score
transport_score
information_score
service_score
value_for_money_score
revisit_intention
recommendation_intention
comment
completed_at
```

Scores should be validated from 1 to 5.

---

## 9.16 funnel_events

Purpose:

Track user flow completion.

Important columns:

```text
event_id
session_id
tourist_id
visit_id
attraction_id
photo_spot_id
event_name
event_time
metadata_json
```

Event names:

```text
qr_scanned
landing_viewed
certificate_started
photo_uploaded
minimal_form_completed
certificate_generated
survey_started
survey_completed
passport_saved
```

---

## 10. Relationship Requirements

## 10.1 Province and District

```text
provinces 1 → many districts
provinces 1 → many attractions
districts 1 → many attractions
```

## 10.2 Attraction and Photo Spot

```text
attractions 1 → many photo_spots
attractions 1 → many checkin_codes
photo_spots 1 → many checkin_codes
```

## 10.3 Tourist and Identity

```text
tourists 1 → many tourist_identities
tourists 1 → many visits
tourists 1 → many tourist_stamps
```

## 10.4 Visit and Related Records

```text
visits 1 → many visit_photos
visits 1 → many certificates
visits 1 → many visit_expenses
visits 1 → one satisfaction_surveys
visits 1 → many survey_answers
```

## 10.5 Attraction and Visit

```text
attractions 1 → many visits
attractions 1 → many tourist_stamps
attractions 1 → many satisfaction_surveys
```

---

## 11. Indexing Requirements

Add indexes for common filters and joins.

Recommended indexes:

```text
attractions(province_id)
attractions(district_id)
attractions(attraction_type_id)
attractions(slug)
checkin_codes(code)
tourist_identities(provider, provider_user_id)
visits(tourist_id)
visits(attraction_id)
visits(visit_date)
visits(created_at)
visits(attraction_id, visit_date)
visits(checkin_code_id)
visit_photos(visit_id)
certificates(visit_id)
tourist_stamps(tourist_id)
tourist_stamps(attraction_id)
visit_expenses(visit_id)
visit_expenses(expense_category_id)
satisfaction_surveys(visit_id)
satisfaction_surveys(attraction_id)
funnel_events(event_name)
funnel_events(event_time)
funnel_events(attraction_id)
```

---

## 12. Constraint Requirements

Use database constraints to protect data quality.

Examples:

```text
check overall_score between 1 and 5
check safety_score between 1 and 5
check cleanliness_score between 1 and 5
check group_size >= 1
check nights >= 0
unique checkin_codes.code
unique attractions.slug
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
```

---

## 13. Status Fields

Use status fields instead of hard delete for important records.

Examples:

```text
is_active
is_published
approval_status
completion_status
status
```

Suggested values:

```text
approval_status:
  pending
  approved
  rejected

completion_status:
  started
  certificate_generated
  survey_completed
  abandoned

stamp_status:
  earned
  revoked
```

---

## 14. Data Retention Requirements

The system should plan for data retention.

Recommended rules:

- Keep aggregated dashboard data long-term.
- Keep raw uploaded photos only as long as needed.
- Allow future anonymization of tourist identity.
- Keep consent logs and audit logs for accountability.
- Do not store unnecessary personal data.

Detailed retention policy should be defined in:

```text
DATA_RETENTION_POLICY.md
```

---

## 15. Supabase Row Level Security Requirements

If frontend directly accesses Supabase tables, Row Level Security must be used.

General rules:

- Public users can read only published attraction data.
- Public users can create limited tourist and visit records through safe policies or server actions.
- Public users must not read other tourists' private data.
- Admin users can access admin data based on role.
- Service role key must never be exposed to frontend.

Detailed policies should be defined in:

```text
docs/security/ROW_LEVEL_SECURITY.md
```

---

## 16. Dashboard Data Requirements

The database must support these metrics.

## 16.1 Executive Metrics

- Total tourists
- Total visits
- Total certificates
- Total stamps
- Survey completion rate
- Average satisfaction
- Estimated spending range
- Top attractions
- Visits by province

## 16.2 Tourist Metrics

- Origin country
- Origin province
- Age group
- Preferred language
- New vs returning tourist
- Identity provider distribution

## 16.3 Travel Metrics

- Transport mode
- Travel companion
- Group size
- Travel purpose
- Overnight status
- Nights

## 16.4 Expense Metrics

- Spending range distribution
- Expense category distribution
- Estimated spending by province
- Estimated spending by attraction

## 16.5 Satisfaction Metrics

- Overall score
- Safety score
- Cleanliness score
- Transport score
- Information score
- Service score
- Value for money score
- Revisit intention
- Recommendation intention

## 16.6 Funnel Metrics

- QR scanned
- Landing viewed
- Photo uploaded
- Form completed
- Certificate generated
- Survey completed
- Passport saved

---

## 17. Official Data Integration Requirements

The database should support future official data integration.

Potential tables:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

The system should be able to compare:

- Official province-level tourist numbers
- Local system collected visits
- Official attraction references
- Local attraction records

This is important for academic and planning credibility.

---

## 18. Migration Requirements

Every schema change should be done through migration files.

Migration rules:

- Migrations must be ordered.
- Migrations must be repeatable in a clean environment.
- Seed data should be separated from schema migrations.
- Destructive migrations must be reviewed carefully.
- Data dictionary must be updated after schema changes.

---

## 19. Seed Data Requirements

Seed data should include:

- Countries
- Target provinces
- Districts
- Attraction types
- Transport modes
- Travel companions
- Travel purposes
- Expense categories
- Satisfaction question definitions
- Default certificate template
- Sample attractions
- Sample photo spots
- Sample check-in codes

---

## 20. Prohibited Database Designs

Do not design the database like this:

```text
one table for everything
tourists table with repeated visit columns
visits table with all survey questions as unstructured JSON only
certificates table without visit relationship
stamps table without unique tourist-attraction rule
photos stored only as raw base64 in database
expenses stored only as free text
satisfaction stored only as comment text
```

These designs will make dashboard analysis weak and unprofessional.

---

## 21. Definition of Done for Database Work

A database task is done only when:

- Tables are created or updated correctly.
- Relationships are clear.
- Constraints are included.
- Indexes are added for expected queries.
- Data privacy is considered.
- Data dictionary is updated.
- Migration runs successfully.
- Seed data is documented if required.
- Dashboard needs are considered.
- No prohibited shortcut is introduced.

---

## 22. Final Database Rule

The database must always support the five core project dimensions:

```text
Tourist
Travel Behavior
Attractions Visited
Expenses
Satisfaction
```

If a schema change weakens these dimensions, it should not be accepted.
