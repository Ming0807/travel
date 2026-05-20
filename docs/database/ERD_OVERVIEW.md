# ERD_OVERVIEW.md

## 1. Document Purpose

This document provides the Entity Relationship Diagram overview for the **Southern Border Tourism Data & Intelligence Platform**.

It explains the main entities, their responsibilities, and how they relate to each other.

This document is not a full data dictionary. Detailed columns should be maintained in:

```text
DATA_DICTIONARY.md
```

This document focuses on:

- Entity groups
- Relationship structure
- Cardinality
- Design reasoning
- MVP ERD boundaries
- Future expansion points

---

## 2. ERD Design Goal

The ERD must support the main project objective:

> Build a high-quality tourism database for Yala, Pattani, and Narathiwat that supports dashboard analytics and sustainable tourism planning.

The ERD must support five core dimensions:

```text
Tourist
Travel Behavior
Attractions Visited
Expenses
Satisfaction
```

---

## 3. High-Level ERD Grouping

The database is divided into these entity groups:

```text
Geography
Attractions
Tourists and Identity
Visits
Photo and Certificate
Digital Stamp and Passport
Survey and Planning Data
Analytics
Admin and Security
Official Data Integration
```

These groups reduce complexity and make the system easier to understand.

---

## 4. High-Level ERD Diagram

Conceptual view:

```text
countries
    |
    | 1
    |------< tourists

provinces
    |
    | 1
    |------< districts
    |
    | 1
    |------< attractions
    |
    | 1
    |------< tourists

districts
    |
    | 1
    |------< attractions

attraction_types
    |
    | 1
    |------< attractions

attractions
    |
    | 1
    |------< photo_spots
    |
    | 1
    |------< checkin_codes
    |
    | 1
    |------< visits
    |
    | 1
    |------< tourist_stamps
    |
    | 1
    |------< satisfaction_surveys

tourists
    |
    | 1
    |------< tourist_identities
    |
    | 1
    |------< consent_logs
    |
    | 1
    |------< visits
    |
    | 1
    |------< tourist_stamps

photo_spots
    |
    | 1
    |------< checkin_codes
    |
    | 1
    |------< visits

checkin_codes
    |
    | 1
    |------< visits
    |
    | 1
    |------< funnel_events

visits
    |
    | 1
    |------< visit_photos
    |
    | 1
    |------< certificates
    |
    | 1
    |------< visit_expenses
    |
    | 1
    |------< survey_answers
    |
    | 1
    |------< funnel_events
    |
    | 1
    |------< tourist_stamps
    |
    | 1
    |------  satisfaction_surveys
```

---

## 5. Entity Group 1: Geography

## 5.1 countries

Represents countries for tourist origin.

Used for:

- Foreign tourist origin
- Dashboard filtering
- Country-level analytics
- Multilingual support

Relationship:

```text
countries 1 → many tourists
```

A tourist may have an origin country.

---

## 5.2 provinces

Represents Thai provinces.

Used for:

- Attraction location
- Domestic tourist origin
- Dashboard comparison
- Target area identification

Target provinces:

- Yala
- Pattani
- Narathiwat

Relationships:

```text
provinces 1 → many districts
provinces 1 → many attractions
provinces 1 → many tourists as origin province
```

---

## 5.3 districts

Represents districts under each province.

Used for:

- Attraction location
- More detailed geographic analysis

Relationship:

```text
districts many → 1 provinces
districts 1 → many attractions
```

---

## 6. Entity Group 2: Attractions

## 6.1 attraction_types

Represents attraction categories.

Examples:

- Nature
- Cultural
- Religious
- Historical
- Community-based
- Food tourism
- Adventure
- Beach/coastal

Relationship:

```text
attraction_types 1 → many attractions
```

---

## 6.2 attractions

Represents tourism attractions.

This is a core master entity.

Examples:

- Aiyerweng Skywalk
- Pattani Central Mosque
- Narathat Beach
- Hala-Bala Wildlife Sanctuary
- Betong city attractions

Relationships:

```text
attractions many → 1 provinces
attractions many → 1 districts
attractions many → 1 attraction_types
attractions 1 → many photo_spots
attractions 1 → many attraction_images
attractions 1 → many attraction_360_media
attractions 1 → many checkin_codes
attractions 1 → many visits
attractions 1 → many tourist_stamps
attractions 1 → many satisfaction_surveys
```

Design note:

An attraction is not the same as a photo spot.

One attraction can have many photo spots.

---

## 6.3 attraction_images

Represents image gallery files for attractions.

Relationship:

```text
attractions 1 → many attraction_images
```

---

## 6.4 attraction_360_media

Represents 360-degree media attached to attractions.

Relationship:

```text
attractions 1 → many attraction_360_media
```

This is optional for MVP but should be supported by design.

---

## 6.5 photo_spots

Represents prepared photo spots at attractions.

A photo spot is the physical point where a QR code may be placed.

Relationship:

```text
attractions 1 → many photo_spots
photo_spots 1 → many checkin_codes
photo_spots 1 → many visits
```

Design note:

Photo spots are important because the teacher mentioned prepared photo points.

This entity allows the system to track which point inside an attraction produces participation.

---

## 6.6 checkin_codes

Represents QR entry codes.

Each QR code should point to:

```text
/c/[checkinCode]
```

Relationships:

```text
checkin_codes many → 1 attractions
checkin_codes many → 0 or 1 photo_spots
checkin_codes 1 → many visits
checkin_codes 1 → many funnel_events
```

Design note:

The system should use one QR code per photo spot or attraction.

Do not create separate QR codes for LINE users, foreign tourists, and guest users.

---

## 7. Entity Group 3: Tourists and Identity

## 7.1 tourists

Represents a tourist profile.

The tourist record is person/profile-level data, not visit-level data.

Relationships:

```text
tourists 1 → many tourist_identities
tourists 1 → many tourist_contacts
tourists 1 → many consent_logs
tourists 1 → many visits
tourists 1 → many tourist_stamps
```

Design note:

A tourist can have many visits.

A tourist can have multiple identities.

A tourist should not be duplicated every time they visit a new attraction.

---

## 7.2 tourist_identities

Represents login or recognition methods.

Examples:

```text
anonymous_device
line
email
google
```

Relationship:

```text
tourists 1 → many tourist_identities
```

Design note:

This is required to support:

- Guest mode
- LINE users
- Foreign tourists without LINE
- Future email magic link
- Identity merging

Recommended unique rule:

```text
unique(provider, provider_user_id)
```

---

## 7.3 tourist_contacts

Represents optional contact methods.

Examples:

- Email
- Phone
- LINE display contact metadata

This table is optional for MVP if contact data is very limited.

Relationship:

```text
tourists 1 → many tourist_contacts
```

Privacy note:

Contact information must be optional.

---

## 7.4 consent_logs

Represents tourist consent records.

Relationships:

```text
tourists 1 → many consent_logs
visits 0 or 1 → many consent_logs
```

Design note:

Consent must record version and purpose.

The system should know which consent notice was accepted.

---

## 8. Entity Group 4: Visits

## 8.1 visits

Represents each tourist visit or participation event.

This is one of the most important transactional entities.

Relationships:

```text
visits many → 1 tourists
visits many → 1 attractions
visits many → 0 or 1 photo_spots
visits many → 0 or 1 checkin_codes
visits many → 0 or 1 transport_modes
visits many → 0 or 1 travel_purposes
visits many → 0 or 1 travel_companions
visits 1 → many visit_photos
visits 1 → many certificates
visits 1 → many visit_expenses
visits 1 → many survey_answers
visits 1 → many funnel_events
visits 1 → 0 or 1 satisfaction_surveys
```

Design note:

A visit is created for every participation event.

A repeat visit should create a new visit record.

---

## 8.2 travel_companions

Represents who the tourist travels with.

Examples:

- Alone
- Family
- Friends
- Partner
- Tour group
- School group
- Work group

Relationship:

```text
travel_companions 1 → many visits
```

---

## 8.3 transport_modes

Represents transport mode.

Examples:

- Private car
- Motorcycle
- Van
- Bus
- Train
- Airplane
- Walking
- Tour vehicle

Relationship:

```text
transport_modes 1 → many visits
```

---

## 8.4 travel_purposes

Represents purpose of travel.

Examples:

- Leisure
- Family visit
- Religious tourism
- Cultural tourism
- Nature tourism
- Food tourism
- Work or official trip
- Education

Relationship:

```text
travel_purposes 1 → many visits
```

---

## 9. Entity Group 5: Photo and Certificate

## 9.1 visit_photos

Represents photos uploaded by tourists.

Relationship:

```text
visits 1 → many visit_photos
visit_photos 1 → many certificates
```

MVP may use one main photo per visit.

Future versions may allow multiple photos.

---

## 9.2 certificate_templates

Represents certificate design templates.

Relationship:

```text
certificate_templates 1 → many certificates
```

A template may be global, attraction-specific, or campaign-specific.

---

## 9.3 certificates

Represents generated certificate files.

Relationships:

```text
certificates many → 1 visits
certificates many → 1 certificate_templates
certificates many → 0 or 1 visit_photos
```

Design note:

Certificates are generated outputs.

Do not store certificate as only frontend state.

Store a database record for audit, download, and dashboard metrics.

---

## 10. Entity Group 6: Digital Stamp and Passport

## 10.1 stamp_definitions

Represents stamp design and metadata.

Examples:

- Aiyerweng stamp
- Pattani heritage stamp
- Narathiwat coastal stamp

Relationship:

```text
stamp_definitions 1 → many tourist_stamps
attractions 1 → many stamp_definitions
```

MVP may use one stamp definition per attraction.

---

## 10.2 tourist_stamps

Represents earned stamps.

Relationships:

```text
tourist_stamps many → 1 tourists
tourist_stamps many → 1 attractions
tourist_stamps many → 1 visits
tourist_stamps many → 1 stamp_definitions
```

Recommended unique rule:

```text
unique(tourist_id, attraction_id)
```

Design note:

A tourist can have many visits to the same attraction, but normally one stamp for that attraction.

---

## 11. Entity Group 7: Survey and Planning Data

## 11.1 expense_categories

Represents spending categories.

Examples:

- Food
- Accommodation
- Transport
- Shopping
- Souvenir
- Activity
- Guide
- Other

Relationship:

```text
expense_categories 1 → many visit_expenses
```

---

## 11.2 visit_expenses

Represents approximate tourist spending.

Relationship:

```text
visits 1 → many visit_expenses
expense_categories 1 → many visit_expenses
```

Design note:

MVP should use spending ranges rather than requiring exact numbers.

---

## 11.3 satisfaction_surveys

Represents structured satisfaction scores.

Relationship:

```text
visits 1 → 0 or 1 satisfaction_surveys
attractions 1 → many satisfaction_surveys
```

Design note:

This table supports dashboard metrics such as average satisfaction by attraction.

---

## 11.4 survey_questions

Represents configurable survey questions.

Relationship:

```text
survey_questions 1 → many survey_answers
```

---

## 11.5 survey_answers

Represents answers to survey questions.

Relationship:

```text
visits 1 → many survey_answers
survey_questions 1 → many survey_answers
```

Design note:

This allows future survey flexibility.

For MVP, common values may also exist in `visits`, `visit_expenses`, and `satisfaction_surveys`.

---

## 12. Entity Group 8: Analytics

## 12.1 funnel_events

Represents user journey events.

Relationships:

```text
funnel_events many → 0 or 1 tourists
funnel_events many → 0 or 1 visits
funnel_events many → 0 or 1 attractions
funnel_events many → 0 or 1 photo_spots
funnel_events many → 0 or 1 checkin_codes
```

Purpose:

Track completion rates and drop-off points.

Example events:

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

## 12.2 daily_attraction_stats

Optional future summary table.

Purpose:

Speed up dashboard queries.

Relationship:

```text
daily_attraction_stats many → 1 attractions
```

---

## 12.3 monthly_province_stats

Optional future summary table.

Purpose:

Province-level dashboard summaries.

Relationship:

```text
monthly_province_stats many → 1 provinces
```

---

## 13. Entity Group 9: Admin and Security

## 13.1 users

Represents admin or staff users.

If Supabase Auth is used, this may store profile data linked to auth user ID.

Relationship:

```text
users 1 → many audit_logs
users many ↔ many roles
```

---

## 13.2 roles

Represents user roles.

Examples:

- super_admin
- admin
- staff
- viewer
- researcher

Relationship:

```text
roles many ↔ many users
roles many ↔ many permissions
```

---

## 13.3 permissions

Represents permission keys.

Examples:

- attraction.create
- attraction.update
- visit.read
- dashboard.read
- export.create
- user.manage

Relationship:

```text
permissions many ↔ many roles
```

---

## 13.4 audit_logs

Represents important admin actions.

Relationship:

```text
users 1 → many audit_logs
```

Audit logs may also reference affected entity type and entity ID.

---

## 14. Entity Group 10: Official Data Integration

## 14.1 official_tourism_stats

Represents official tourism statistics by time and geography.

Possible relationship:

```text
official_tourism_stats many → 1 provinces
```

Purpose:

Allow comparison between collected local data and official statistics.

---

## 14.2 official_attraction_refs

Represents official attraction registry references.

Possible relationship:

```text
official_attraction_refs 0 or 1 → 1 attractions
```

Purpose:

Link local attractions to official attraction datasets.

---

## 14.3 data_import_logs

Represents import history.

Purpose:

Track source, import date, status, and errors.

---

## 15. MVP ERD Scope

The MVP ERD should include these entities:

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

The MVP can delay:

```text
attraction_360_media
survey_questions
survey_answers
daily_attraction_stats
monthly_province_stats
official_tourism_stats
official_attraction_refs
advanced roles and permissions
```

However, the schema should be designed so these can be added later.

---

## 16. Key Cardinality Summary

```text
Country 1 -> many Tourists
Province 1 -> many Districts
Province 1 -> many Attractions
District 1 -> many Attractions
AttractionType 1 -> many Attractions
Attraction 1 -> many PhotoSpots
Attraction 1 -> many CheckinCodes
PhotoSpot 1 -> many CheckinCodes
Tourist 1 -> many TouristIdentities
Tourist 1 -> many Visits
Tourist 1 -> many TouristStamps
Visit 1 -> many VisitPhotos
Visit 1 -> many Certificates
Visit 1 -> many VisitExpenses
Visit 1 -> zero or one SatisfactionSurvey
Visit 1 -> many FunnelEvents
Attraction 1 -> many Visits
Attraction 1 -> many TouristStamps
Attraction 1 -> many SatisfactionSurveys
CertificateTemplate 1 -> many Certificates
ExpenseCategory 1 -> many VisitExpenses
TransportMode 1 -> many Visits
TravelPurpose 1 -> many Visits
TravelCompanion 1 -> many Visits
```

---

## 17. Main ERD Design Decisions

## 17.1 Tourist and Visit Are Separate

Reason:

A tourist may visit many attractions.

This supports repeat visits and digital passport logic.

---

## 17.2 Identity Is Separate

Reason:

A tourist may start as guest and later connect LINE or email.

This prevents duplicate tourist profiles.

---

## 17.3 QR Code Is a Data Entity

Reason:

The system must know which physical point produced the visit.

This supports funnel analytics and campaign analysis.

---

## 17.4 Photo Spot Is Separate from Attraction

Reason:

One attraction may have many prepared photo points.

This supports detailed participation tracking.

---

## 17.5 Certificate Is Separate from Visit

Reason:

A visit is the participation event.

A certificate is the generated output.

This separation supports regeneration, download tracking, and template changes.

---

## 17.6 Stamp Is Separate from Visit

Reason:

A tourist may revisit an attraction, but should normally earn the stamp once.

---

## 17.7 Expense Uses Ranges in MVP

Reason:

Tourists are more likely to answer approximate ranges than exact amounts.

This improves UX and completion rate.

---

## 17.8 Satisfaction Is Structured

Reason:

Dashboard metrics require numeric satisfaction fields.

Free-text comments alone are not enough.

---

## 18. Dashboard Mapping to ERD

## 18.1 Total Tourists

Primary table:

```text
tourists
```

## 18.2 Total Visits

Primary table:

```text
visits
```

## 18.3 Visits by Province

Primary tables:

```text
visits
attractions
provinces
```

## 18.4 Visits by Attraction

Primary tables:

```text
visits
attractions
```

## 18.5 Origin Distribution

Primary tables:

```text
tourists
countries
provinces
```

## 18.6 Travel Behavior

Primary tables:

```text
visits
travel_companions
transport_modes
travel_purposes
```

## 18.7 Expense Analysis

Primary tables:

```text
visit_expenses
expense_categories
visits
attractions
```

## 18.8 Satisfaction Analysis

Primary tables:

```text
satisfaction_surveys
visits
attractions
```

## 18.9 Funnel Analytics

Primary table:

```text
funnel_events
```

## 18.10 Digital Passport Progress

Primary tables:

```text
tourist_stamps
stamp_definitions
attractions
provinces
```

---

## 19. ERD Anti-Patterns to Avoid

Do not create these designs:

## 19.1 One Giant Tourist Table

Bad design:

```text
tourists:
  name
  province
  attraction_1
  attraction_2
  expense
  satisfaction
  certificate_url
```

Problem:

Cannot support repeat visits, multiple attractions, or dashboard filters properly.

---

## 19.2 One Visit Equals One Tourist

Bad design:

```text
Every QR scan creates a new tourist.
```

Problem:

Returning tourists cannot be analyzed correctly.

---

## 19.3 Survey as Only JSON

Bad design:

```text
survey_data jsonb only
```

Problem:

Dashboard metrics become harder to query.

Use structured columns for common metrics.

JSON can be used for extra metadata, not primary analytics fields.

---

## 19.4 Certificate Without Visit Link

Bad design:

```text
certificates only store image path and name
```

Problem:

Cannot trace certificate back to tourist, attraction, or visit.

---

## 19.5 QR Code Hardcoded in Frontend

Bad design:

```text
QR code URL directly maps to static page with no checkin_codes table
```

Problem:

Cannot deactivate, track, or analyze QR usage.

---

## 20. Future ERD Extensions

Possible future entities:

```text
campaigns
campaign_attractions
campaign_rewards
badges
tourist_badges
route_recommendations
tourism_routes
route_attractions
partner_businesses
coupons
coupon_redemptions
official_data_sources
notification_logs
line_message_logs
email_delivery_logs
```

These should not be added before MVP unless specifically required.

---

## 21. ERD Review Checklist

Before accepting an ERD change, verify:

```text
[ ] Tourist and visit are separate
[ ] Tourist identity is separate
[ ] Attraction and photo spot are separate
[ ] QR/check-in code is a table
[ ] Visit links tourist and attraction
[ ] Photo links to visit
[ ] Certificate links to visit and photo
[ ] Stamp links to tourist, attraction, and visit
[ ] Expense links to visit
[ ] Satisfaction links to visit and attraction
[ ] Consent is recorded
[ ] Funnel events can be tracked
[ ] Dashboard filters are possible
[ ] No unnecessary personal data is required
[ ] Foreign tourists without LINE are supported
[ ] Returning tourists can be recognized
[ ] Duplicate stamps can be prevented
```

---

## 22. Final ERD Rule

The ERD must make the platform a real tourism data system, not only a QR certificate app.

Every entity must support at least one of these goals:

```text
Data collection
Tourist experience
Visit tracking
Planning analytics
Privacy and governance
Production operation
```
