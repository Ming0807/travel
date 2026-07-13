# TABLE_GROUPS.md

## 1. Document Purpose

This document organizes all database tables for the **Southern Border Tourism Data & Intelligence Platform** into logical groups.

The purpose is to make the schema easier to understand, implement, maintain, and explain in academic documentation.

This file should be used together with:

```text
DATABASE_REQUIREMENTS.md
ERD_OVERVIEW.md
DATA_DICTIONARY.md
RELATIONSHIPS.md
INDEXING_STRATEGY.md
```

---

## 2. Core Database Philosophy

The system is a tourism data platform, not a simple check-in app.

The database must support:

- Tourist profile data
- Tourist identity handling
- Visit records
- Attraction management
- Photo spot and QR management
- Photo uploads
- Digital certificate generation
- Digital stamp collection
- Travel behavior
- Expense analysis
- Satisfaction analysis
- Dashboard analytics
- Consent and privacy
- Admin operations
- Future official data integration

The database should be grouped by responsibility.

---

## 3. Table Group Overview

Recommended table groups:

```text
01_geography
02_attraction_master
03_tourist_identity_profile
04_visit_participation
05_photo_certificate_stamp
06_travel_behavior
07_expense
08_satisfaction_survey
09_engagement_analytics
10_admin_security
11_official_data_integration
12_dashboard_summary
```

The actual database does not need physical schemas for each group in MVP, but documentation should keep this grouping clear.

---

## 4. Group 01: Geography

## 4.1 Purpose

The geography group supports:

- Attraction location
- Tourist origin
- Province-level dashboard
- District-level analysis
- Domestic and foreign tourist tracking

## 4.2 Tables

```text
countries
provinces
districts
```

## 4.3 Table Responsibilities

### countries

Stores countries for foreign tourist origin.

Used by:

- tourist profile
- dashboard origin analysis
- multilingual support
- foreign visitor reports

### provinces

Stores Thai provinces.

Used by:

- attraction location
- domestic tourist origin
- target area identification
- dashboard province comparison

Important:

The three target provinces must be clearly identified:

- Yala
- Pattani
- Narathiwat

### districts

Stores districts within provinces.

Used by:

- attraction location
- district-level planning
- future map and dashboard filters

## 4.4 Main Relationships

```text
countries 1 -> many tourists
provinces 1 -> many districts
provinces 1 -> many attractions
provinces 1 -> many tourists as origin province
districts 1 -> many attractions
```

## 4.5 MVP Requirement

Required in MVP.

---

## 5. Group 02: Attraction Master

## 5.1 Purpose

The attraction master group stores tourism places and related content.

This group supports the public tourism website, QR flow, admin CMS, and dashboard analysis.

## 5.2 Tables

```text
attraction_types
attractions
attraction_images
attraction_360_media
photo_spots
checkin_codes
```

## 5.3 Table Responsibilities

### attraction_types

Classifies attractions.

Examples:

- Nature
- Cultural
- Religious
- Historical
- Community-based
- Beach/coastal
- Food tourism
- Adventure
- Viewpoint

### attractions

Stores the main tourism attraction record.

Each attraction belongs to:

- province
- district
- attraction type

Each attraction may have:

- images
- 360 media
- photo spots
- check-in codes
- visits
- satisfaction records
- stamps

### attraction_images

Stores image gallery data for attractions.

This is for public pages and admin management.

### attraction_360_media

Stores 360-degree content references.

This may be optional in MVP but should be planned for.

### photo_spots

Stores prepared photo points inside or around an attraction.

This is important because the project includes prepared photo spots.

One attraction can have multiple photo spots.

### checkin_codes

Stores QR/check-in codes.

Each QR code should resolve to a URL such as:

```text
/c/[checkinCode]
```

Each check-in code links to:

- attraction
- optional photo spot
- optional campaign in future

## 5.4 Main Relationships

```text
attraction_types 1 -> many attractions
provinces 1 -> many attractions
districts 1 -> many attractions
attractions 1 -> many attraction_images
attractions 1 -> many attraction_360_media
attractions 1 -> many photo_spots
attractions 1 -> many checkin_codes
photo_spots 1 -> many checkin_codes
```

## 5.5 MVP Requirement

Required in MVP except `attraction_360_media`, which can be Phase 2 if needed.

---

## 6. Group 03: Tourist Identity and Profile

## 6.1 Purpose

The tourist identity and profile group stores tourist-level data and recognition methods.

It must support:

- Guest users
- Returning users
- Foreign tourists without LINE
- Optional LINE users
- Optional email users
- Identity linking
- Privacy-aware design

## 6.2 Tables

```text
tourists
tourist_identities
tourist_contacts
consent_logs
```

## 6.3 Table Responsibilities

### tourists

Stores tourist profile-level information.

Examples:

- display name
- origin country
- origin province
- age group
- preferred language

This table should not store visit-specific data.

### tourist_identities

Stores recognition methods.

Examples:

```text
anonymous_device
line
email
google
```

This table prevents duplicate tourist creation when the same person returns.

### tourist_contacts

Stores optional contact methods.

Examples:

- email
- phone
- LINE metadata

This table is optional for MVP if no contact method is stored.

### consent_logs

Stores consent records.

This is required because the system collects tourist data and photos.

## 6.4 Main Relationships

```text
tourists 1 -> many tourist_identities
tourists 1 -> many tourist_contacts
tourists 1 -> many consent_logs
tourists 1 -> many visits
```

## 6.5 MVP Requirement

Required:

```text
tourists
tourist_identities
consent_logs
```

Optional in MVP:

```text
tourist_contacts
```

---

## 7. Group 04: Visit Participation

## 7.1 Purpose

The visit participation group records each tourist interaction with an attraction.

This is one of the most important groups because it connects:

- tourist
- attraction
- photo spot
- QR code
- travel behavior
- certificate
- survey
- expenses
- satisfaction

## 7.2 Tables

```text
visits
visit_destinations
```

For MVP, `visit_destinations` may be delayed if each check-in represents one attraction.

## 7.3 Table Responsibilities

### visits

Stores each tourist visit or participation event.

Important:

A tourist may have many visits.

A repeat visit must create a new visit record.

### visit_destinations

Stores multiple destinations in one trip or visit session.

This is useful for future route analysis.

In MVP, it is acceptable to use `visits.attraction_id` directly.

## 7.4 Main Relationships

```text
tourists 1 -> many visits
attractions 1 -> many visits
photo_spots 1 -> many visits
checkin_codes 1 -> many visits
visits 1 -> many visit_destinations
```

## 7.5 MVP Requirement

Required:

```text
visits
```

Optional Phase 2:

```text
visit_destinations
```

---

## 8. Group 05: Photo, Certificate, Stamp

## 8.1 Purpose

This group stores tourist engagement outputs.

It supports:

- photo upload
- certificate generation
- digital stamp
- digital passport

These features are engagement mechanisms, but they must be connected to the tourism database.

## 8.2 Tables

```text
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
```

## 8.3 Table Responsibilities

### visit_photos

Stores uploaded tourist photo metadata.

Photos should be stored in object storage, not directly as base64 in the database.

### certificate_templates

Stores certificate template configuration.

MVP can use one default template.

### certificates

Stores generated certificate records.

A certificate must link to a visit.

### stamp_definitions

Stores stamp design and meaning.

MVP may have one stamp per attraction.

### tourist_stamps

Stores earned stamps.

A tourist normally earns one stamp per attraction.

## 8.4 Main Relationships

```text
visits 1 -> many visit_photos
visit_photos 1 -> many certificates
certificate_templates 1 -> many certificates
visits 1 -> many certificates
attractions 1 -> many stamp_definitions
tourists 1 -> many tourist_stamps
attractions 1 -> many tourist_stamps
visits 1 -> many tourist_stamps
```

## 8.5 MVP Requirement

Required in MVP.

---

## 9. Group 06: Travel Behavior

## 9.1 Purpose

This group stores controlled reference data for travel behavior.

It supports the original project requirement to analyze travel patterns.

## 9.2 Tables

```text
travel_companions
transport_modes
travel_purposes
```

## 9.3 Table Responsibilities

### travel_companions

Stores who the tourist travels with.

Examples:

- Alone
- Family
- Friends
- Partner
- Tour group
- School group
- Work group

### transport_modes

Stores transportation methods.

Examples:

- Private car
- Motorcycle
- Van
- Bus
- Train
- Airplane
- Walking
- Tour vehicle

### travel_purposes

Stores purpose of travel.

Examples:

- Leisure
- Nature tourism
- Cultural tourism
- Religious tourism
- Food tourism
- Family visit
- Work
- Education

## 9.4 Main Relationships

```text
travel_companions 1 -> many visits
transport_modes 1 -> many visits
travel_purposes 1 -> many visits
```

## 9.5 MVP Requirement

Required in MVP.

---

## 10. Group 07: Expense

## 10.1 Purpose

The expense group stores approximate tourist spending.

It supports economic planning and local benefit analysis.

## 10.2 Tables

```text
expense_categories
visit_expenses
```

## 10.3 Table Responsibilities

### expense_categories

Stores spending categories.

Examples:

- Food
- Accommodation
- Transport
- Shopping
- Souvenir
- Activity
- Guide
- Other

### visit_expenses

Stores spending ranges or approximate values linked to a visit.

For MVP, spending range is better than exact amount.

## 10.4 Main Relationships

```text
visits 1 -> 0..1 visit_expenses
expense_categories 1 -> many visit_expenses
```

## 10.5 MVP Requirement

Required in MVP.

---

## 11. Group 08: Satisfaction and Survey

## 11.1 Purpose

This group stores tourist satisfaction and optional survey answers.

It supports planning and quality improvement.

## 11.2 Tables

```text
satisfaction_surveys
survey_questions
survey_answers
```

## 11.3 Table Responsibilities

### satisfaction_surveys

Stores structured satisfaction scores.

Examples:

- overall score
- safety score
- cleanliness score
- transport score
- information score
- service score
- value for money score
- revisit intention
- recommendation intention

### survey_questions

Stores configurable survey questions.

This is useful when the survey changes in future phases.

### survey_answers

Stores answers to configurable survey questions.

## 11.4 Main Relationships

```text
visits 1 -> zero or one satisfaction_surveys
attractions 1 -> many satisfaction_surveys
survey_questions 1 -> many survey_answers
visits 1 -> many survey_answers
```

## 11.5 MVP Requirement

Required:

```text
satisfaction_surveys
```

Optional Phase 2:

```text
survey_questions
survey_answers
```

However, adding survey question tables in MVP is acceptable if time allows.

---

## 12. Group 09: Engagement Analytics

## 12.1 Purpose

This group tracks how tourists move through the system.

It helps answer:

> Where do tourists drop out?

This directly supports the teacher's concern that tourists may not want to fill forms.

## 12.2 Tables

```text
funnel_events
share_events
download_logs
```

## 12.3 Table Responsibilities

### funnel_events

Stores events in the tourist flow.

Examples:

- qr_scanned
- landing_viewed
- certificate_started
- photo_uploaded
- minimal_form_completed
- certificate_generated
- survey_started
- survey_completed
- passport_saved

### share_events

Stores share behavior.

Optional Phase 2.

### download_logs

Stores certificate download events.

Optional Phase 2.

## 12.4 Main Relationships

```text
funnel_events many -> zero or one tourist
funnel_events many -> zero or one visit
funnel_events many -> zero or one attraction
funnel_events many -> zero or one photo_spot
```

## 12.5 MVP Requirement

Required:

```text
funnel_events
```

Optional:

```text
share_events
download_logs
```

---

## 13. Group 10: Admin and Security

## 13.1 Purpose

This group supports staff access, permissions, and accountability.

## 13.2 Tables

```text
users
roles
permissions
user_roles
role_permissions
audit_logs
```

If Supabase Auth is used, local user records may reference Supabase auth IDs.

## 13.3 Table Responsibilities

### users

Stores admin/staff profile data.

### roles

Stores user roles.

Examples:

- super_admin
- admin
- staff
- viewer
- researcher

### permissions

Stores permission keys.

Examples:

- attraction.create
- attraction.update
- visit.read
- dashboard.read
- export.create

### user_roles

Maps users to roles.

### role_permissions

Maps roles to permissions.

### audit_logs

Stores important admin actions.

## 13.4 Main Relationships

```text
users many -> many roles
roles many -> many permissions
users 1 -> many audit_logs
```

## 13.5 MVP Requirement

Required if custom auth/roles are implemented.

If Supabase Auth is used for MVP, a simplified profile and role table is acceptable.

---

## 14. Group 11: Official Data Integration

## 14.1 Purpose

This group supports future integration with official tourism statistics and attraction reference data.

This is important because the project should connect local data with broader tourism datasets.

## 14.2 Tables

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

## 14.3 Table Responsibilities

### official_tourism_stats

Stores official tourism statistics by province, month, and year.

### official_attraction_refs

Stores official attraction registry references.

### data_import_logs

Stores data import history and status.

## 14.4 Main Relationships

```text
official_tourism_stats many -> one province
official_attraction_refs zero or one -> one attraction
data_import_logs independent or linked to source tables
```

## 14.5 MVP Requirement

Not required for MVP implementation, but design should allow future addition.

---

## 15. Group 12: Dashboard Summary

## 15.1 Purpose

This group supports faster dashboard queries when data grows.

## 15.2 Tables

```text
daily_attraction_stats
monthly_province_stats
satisfaction_summary
expense_summary
dashboard_cache
```

## 15.3 Table Responsibilities

### daily_attraction_stats

Stores daily visit and participation summaries per attraction.

### monthly_province_stats

Stores monthly province-level summaries.

### satisfaction_summary

Stores precomputed satisfaction metrics.

### expense_summary

Stores precomputed expense summaries.

### dashboard_cache

Stores cached dashboard payloads or metric snapshots.

## 15.4 MVP Requirement

Not required at the beginning.

Add when raw queries become slow or dashboard logic becomes complex.

---

## 16. MVP Table Set

The recommended MVP table set is:

```text
countries
provinces
districts
attraction_types
attractions
attraction_images
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

travel_companions
transport_modes
travel_purposes

expense_categories
visit_expenses
satisfaction_surveys

funnel_events
```

Optional MVP additions:

```text
attraction_360_media
tourist_contacts
survey_questions
survey_answers
users
roles
permissions
user_roles
audit_logs
```

---

## 17. Table Group Dependency Order

Recommended implementation order:

```text
1. Geography
2. Attraction Master
3. Tourist Identity and Profile
4. Visit Participation
5. Photo, Certificate, Stamp
6. Travel Behavior
7. Expense
8. Satisfaction and Survey
9. Engagement Analytics
10. Admin and Security
11. Dashboard Summary
12. Official Data Integration
```

This order helps avoid missing foreign keys and circular dependencies.

---

## 18. Feature-to-Table Mapping

## 18.1 Public Attraction Page

Uses:

```text
attractions
attraction_types
provinces
districts
attraction_images
attraction_360_media
photo_spots
```

## 18.2 QR Check-in

Uses:

```text
checkin_codes
attractions
photo_spots
funnel_events
```

## 18.3 Tourist Profile

Uses:

```text
tourists
tourist_identities
consent_logs
countries
provinces
```

## 18.4 Photo Upload

Uses:

```text
visits
visit_photos
```

## 18.5 Certificate Generation

Uses:

```text
visits
visit_photos
certificate_templates
certificates
```

## 18.6 Digital Stamp

Uses:

```text
tourists
attractions
visits
stamp_definitions
tourist_stamps
```

## 18.7 Optional Survey

Uses:

```text
visits
travel_companions
transport_modes
travel_purposes
visit_expenses
expense_categories
satisfaction_surveys
survey_questions
survey_answers
```

## 18.8 Dashboard

Uses:

```text
tourists
tourist_identities
visits
attractions
provinces
visit_expenses
satisfaction_surveys
certificates
tourist_stamps
funnel_events
```

## 18.9 Data Export

Uses:

```text
visits
tourists
attractions
visit_expenses
satisfaction_surveys
certificates
tourist_stamps
audit_logs
```

---

## 19. Data Privacy Mapping

## 19.1 Low-Risk Data

Examples:

```text
attraction data
province data
district data
anonymous dashboard metrics
```

## 19.2 Personal or Potentially Identifiable Data

Examples:

```text
display_name
email
LINE user ID
uploaded photo
device token
```

These require careful handling.

## 19.3 Sensitive Data to Avoid

Do not collect unless explicitly approved:

```text
national ID
full address
religion
ethnicity
health data
precise GPS trail
biometric analysis
```

---

## 20. Table Group Review Checklist

Before accepting a schema change, check:

```text
[ ] The table belongs to a clear group.
[ ] The table has a clear responsibility.
[ ] The table supports the project objective.
[ ] The table does not duplicate another table's responsibility.
[ ] The table has correct relationships.
[ ] The table supports dashboard needs.
[ ] The table avoids unnecessary personal data.
[ ] The table can be explained in an academic report.
```

---

## 21. Final Rule

A good schema is not measured by the number of tables.

A good schema is measured by whether it can reliably answer planning questions.

Every table must support one of these goals:

```text
Tourist data collection
Travel behavior analysis
Attraction visit tracking
Expense analysis
Satisfaction analysis
Dashboard reporting
Privacy and governance
System operation
```
