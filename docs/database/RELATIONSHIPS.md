# RELATIONSHIPS.md

## 1. Document Purpose

This document defines the database relationships for the **Southern Border Tourism Data & Intelligence Platform**.

It explains:

- Primary relationships
- Foreign key rules
- Cardinality
- Required and optional relationships
- Delete and deactivate behavior
- Relationship design decisions
- Anti-patterns to avoid

This file should be read before writing database migrations, ORM models, API services, or dashboard queries.

---

## 1.1 Story Editorial Platform Relationships (P2)

```text
travel_stories 1 --- * story_revisions
travel_stories 1 --- * story_review_events
travel_stories * --- * story_topics through story_topic_links
travel_stories * --- * story_tags through story_tag_links
travel_stories * --- * travel_stories through story_recommendations
admin_users 1 --- * story_revisions / review events / curated relationships
```

Rules:

- Story slugs and IDs remain stable public identities.
- Revisions and review events cascade with their story and are never public content.
- Topics and tags use restricted deletion so active relationships are not silently broken.
- Curated recommendation links reject self-links and duplicate source-target pairs.
- Public recommendation reads require both source and target stories to be published.

---

## 2. Relationship Design Principles

## 2.1 Use Explicit Foreign Keys

Important relationships should be enforced with foreign keys whenever possible.

Foreign keys help protect data quality and avoid orphan records.

Examples:

```text
visits.tourist_id -> tourists.tourist_id
visits.attraction_id -> attractions.attraction_id
visit_photos.visit_id -> visits.visit_id
certificates.visit_id -> visits.visit_id
```

---

## 2.2 Separate Master Data from Transaction Data

Master data changes slowly.

Examples:

```text
provinces
districts
attraction_types
transport_modes
travel_purposes
expense_categories
```

Transaction data changes frequently.

Examples:

```text
visits
visit_photos
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
funnel_events
```

Do not mix these responsibilities.

---

## 2.3 Avoid Hard Deletes for Important Records

Important records should normally be deactivated, archived, or soft-deleted rather than physically deleted.

Examples:

- attractions
- photo_spots
- checkin_codes
- tourists
- visits
- certificates
- tourist_stamps

Use fields such as:

```text
is_active
is_published
status
deleted_at
```

This protects historical dashboard accuracy.

---

## 2.4 Keep Historical Records Stable

A visit record should remain understandable even if the attraction is later updated.

For MVP, foreign keys are enough.

In future production, consider storing snapshots for:

- attraction name at visit time
- province at visit time
- certificate template version
- consent version

---

## 2.5 Do Not Overuse Cascade Delete

Cascade delete can accidentally destroy important historical data.

Use cascade delete only for small dependent configuration rows where safe.

For most project data, prefer:

```text
ON DELETE RESTRICT
ON DELETE SET NULL
```

depending on the relationship.

---

## 3. Relationship Overview

High-level relationship map:

```text
Geography
    countries -> tourists
    provinces -> districts
    provinces -> attractions
    provinces -> tourists
    districts -> attractions

Attractions
    attraction_types -> attractions
    attractions -> content_media
    attractions -> photo_spots
    attractions -> checkin_codes
    attractions -> visits
    attractions -> tourist_stamps
    attractions -> satisfaction_surveys

Tourists
    tourists -> tourist_identities
    tourists -> consent_records
    tourists -> visits
    tourists -> tourist_stamps

Visits
    visits -> visit_photos
    visits -> certificates
    visits -> tourist_stamps
    visits -> visit_expenses
    visits -> satisfaction_surveys
    visits -> funnel_events

Engagement
    photo_spots -> checkin_codes
    checkin_codes -> visits
    checkin_codes -> funnel_events
    certificate_templates -> certificates
    stamp_definitions -> tourist_stamps

Admin
    admin_users -> audit_logs
    admin_users -> admin_user_roles
    roles -> admin_user_roles
    roles -> role_permissions
    permissions -> role_permissions
```

---

## 4. Geography Relationships

## 4.1 countries to tourists

### Relationship

```text
countries.country_id 1 -> many tourists.origin_country_id
```

### Purpose

Tracks the country of origin for tourists, especially foreign tourists.

### Foreign Key

```text
tourists.origin_country_id references countries(country_id)
```

### Required?

Optional.

A tourist may have only origin province if domestic, or only country if foreign.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

or restrict deletion and use `is_active = false`.

### Notes

Countries should usually be deactivated instead of deleted.

---

## 4.2 provinces to districts

### Relationship

```text
provinces.province_id 1 -> many districts.province_id
```

### Purpose

Supports attraction location and geographic filtering.

### Foreign Key

```text
districts.province_id references provinces(province_id)
```

### Required?

Required.

Every district must belong to a province.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

### Notes

Do not delete provinces used by attractions or tourists.

---

## 4.3 provinces to attractions

### Relationship

```text
provinces.province_id 1 -> many attractions.province_id
```

### Purpose

Supports province-level tourism analysis.

### Foreign Key

```text
attractions.province_id references provinces(province_id)
```

### Required?

Required.

Every attraction must belong to a province.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 4.4 districts to attractions

### Relationship

```text
districts.district_id 1 -> many attractions.district_id
```

### Purpose

Supports district-level attraction organization.

### Foreign Key

```text
attractions.district_id references districts(district_id)
```

### Required?

Optional.

Some attractions may not have district data in early imports.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

---

## 4.5 provinces to tourists

### Relationship

```text
provinces.province_id 1 -> many tourists.origin_province_id
```

### Purpose

Tracks domestic tourist origin.

### Foreign Key

```text
tourists.origin_province_id references provinces(province_id)
```

### Required?

Optional.

Foreign tourists may not have origin province.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

---

## 5. Attraction Relationships

## 5.1 attraction_types to attractions

### Relationship

```text
attraction_types.attraction_type_id 1 -> many attractions.attraction_type_id
```

### Purpose

The direct foreign key represents the primary category used by dashboard grouping and compatibility consumers.

### Foreign Key

```text
attractions.attraction_type_id references attraction_types(attraction_type_id)
```

### Required?

Optional in early MVP, but recommended.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

or restrict and deactivate attraction type.

### Multi-category relationship

```text
attractions many <-> many attraction_types
through attraction_type_assignments
```

`attraction_type_assignments` is authoritative for public/admin discovery across every selected category. `attractions.attraction_type_id` mirrors the assignment with `is_primary = true`, preventing dashboard double counting while existing consumers migrate incrementally.

---

## 5.2 attractions to content_media

### Relationship

```text
attractions.attraction_id 1 -> many content_media.attraction_id
```

### Purpose

Supports image gallery, public media, panoramas, embeds, and external URLs for attraction pages.

### Foreign Key

```text
content_media.attraction_id references attractions(attraction_id)
```

### Required?

Required for image records.

### Delete Behavior

Recommended:

```text
ON DELETE CASCADE
```

is acceptable only if attraction deletion is not allowed or attractions are soft-deleted.

Safer production option:

```text
ON DELETE RESTRICT
```

and use `is_active`.

---

## 5.3 Future attractions to attraction_360_media

### Relationship

```text
attractions.attraction_id 1 -> many attraction_360_media.attraction_id
```

### Purpose

Future normalized support for immersive attraction content.

Current MVP stores image, panorama, video360, embed, and external URL references in `content_media`.

### Foreign Key

```text
attraction_360_media.attraction_id references attractions(attraction_id)
```

### Required?

Out of MVP as a separate table.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

or soft delete.

---

## 5.4 attractions to photo_spots

### Relationship

```text
attractions.attraction_id 1 -> many photo_spots.attraction_id
```

### Purpose

Stores prepared photo points under attractions.

### Foreign Key

```text
photo_spots.attraction_id references attractions(attraction_id)
```

### Required?

Required.

Every photo spot must belong to an attraction.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

Use `is_active = false` to retire photo spots.

---

## 5.5 attractions to checkin_codes

### Relationship

```text
attractions.attraction_id 1 -> many checkin_codes.attraction_id
```

### Purpose

Allows each QR/check-in code to resolve to an attraction.

### Foreign Key

```text
checkin_codes.attraction_id references attractions(attraction_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

Deactivate QR codes instead of deleting them.

---

## 5.6 photo_spots to checkin_codes

### Relationship

```text
photo_spots.photo_spot_id 1 -> many checkin_codes.photo_spot_id
```

### Purpose

Links QR codes to specific physical photo points.

### Foreign Key

```text
checkin_codes.photo_spot_id references photo_spots(photo_spot_id)
```

### Required?

Optional.

A QR may point to the whole attraction rather than a specific photo spot.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

or restrict if the photo spot has active codes.

---

## 6. Tourist and Identity Relationships

## 6.1 tourists to tourist_identities

### Relationship

```text
tourists.tourist_id 1 -> many tourist_identities.tourist_id
```

### Purpose

Supports multiple identity methods for the same tourist.

Examples:

```text
anonymous_device
line
email
google
```

### Foreign Key

```text
tourist_identities.tourist_id references tourists(tourist_id)
```

### Required?

Required for identity records.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

For privacy deletion requests, prefer anonymization rather than hard delete.

### Important Constraint

```text
unique(provider, provider_user_id)
```

This prevents duplicate identities.

---

## 6.2 Future tourists to tourist_contacts

### Relationship

```text
tourists.tourist_id 1 -> many tourist_contacts.tourist_id
```

### Purpose

Future normalized support for optional contact methods.

Current MVP stores optional account links in `tourist_identities`; contact details are not required before certificate generation.

### Foreign Key

```text
tourist_contacts.tourist_id references tourists(tourist_id)
```

### Required?

Out of MVP as a separate table.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

or anonymize contact values.

---

## 6.3 tourists to consent_records

### Relationship

```text
tourists.tourist_id 1 -> many consent_records.tourist_id
```

### Purpose

Tracks consent history.

### Foreign Key

```text
consent_records.tourist_id references tourists(tourist_id)
```

### Required?

Optional at database level but required in business flow.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

if anonymizing tourist records, or restrict if compliance requires traceability.

---

## 7. Visit Relationships

## 7.1 tourists to visits

### Relationship

```text
tourists.tourist_id 1 -> many visits.tourist_id
```

### Purpose

A tourist may visit many attractions.

### Foreign Key

```text
visits.tourist_id references tourists(tourist_id)
```

### Required?

Required.

Every visit must belong to a tourist profile.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

Use anonymization if needed.

---

## 7.2 attractions to visits

### Relationship

```text
attractions.attraction_id 1 -> many visits.attraction_id
```

### Purpose

Every visit must be associated with an attraction.

### Foreign Key

```text
visits.attraction_id references attractions(attraction_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

Do not delete attractions that have historical visits.

---

## 7.3 photo_spots to visits

### Relationship

```text
photo_spots.photo_spot_id 1 -> many visits.photo_spot_id
```

### Purpose

Tracks participation at specific photo spots.

### Foreign Key

```text
visits.photo_spot_id references photo_spots(photo_spot_id)
```

### Required?

Optional.

A visit may be attraction-level only.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

Historical visit should remain even if the photo spot is retired.

---

## 7.4 checkin_codes to visits

### Relationship

```text
checkin_codes.checkin_code_id 1 -> many visits.checkin_code_id
```

### Purpose

Tracks which QR/check-in code created the visit.

### Foreign Key

```text
visits.checkin_code_id references checkin_codes(checkin_code_id)
```

### Required?

Optional but strongly recommended when visit starts from QR.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

Do not lose visits if code is retired.

---

## 7.5 travel_companions to visits

### Relationship

```text
travel_companions.travel_companion_id 1 -> many visits.travel_companion_id
```

### Required?

Optional.

Collected after certificate generation.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

---

## 7.6 transport_modes to visits

### Relationship

```text
transport_modes.transport_mode_id 1 -> many visits.transport_mode_id
```

### Required?

Optional.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

---

## 7.7 travel_purposes to visits

### Relationship

```text
travel_purposes.travel_purpose_id 1 -> many visits.travel_purpose_id
```

### Required?

Optional.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

---

## 8. Photo and Certificate Relationships

## 8.1 visits to visit_photos

### Relationship

```text
visits.visit_id 1 -> many visit_photos.visit_id
```

### Purpose

Stores uploaded photos for a visit.

### Foreign Key

```text
visit_photos.visit_id references visits(visit_id)
```

### Required?

Required for photo record.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

or cascade only if visits are never hard-deleted.

---

## 8.2 certificate_templates to certificates

### Relationship

```text
certificate_templates.template_id 1 -> many certificates.template_id
```

### Purpose

Tracks which template generated a certificate.

### Foreign Key

```text
certificates.template_id references certificate_templates(template_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

Templates used by certificates should not be deleted.

---

## 8.3 visits to certificates

### Relationship

```text
visits.visit_id 1 -> many certificates.visit_id
```

### Purpose

Links generated certificates to participation events.

### Foreign Key

```text
certificates.visit_id references visits(visit_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 8.4 visit_photos to certificates

### Relationship

```text
visit_photos.photo_id 1 -> many certificates.photo_id
```

### Purpose

Links the source uploaded photo to the certificate.

### Foreign Key

```text
certificates.photo_id references visit_photos(photo_id)
```

### Required?

Optional but recommended.

A certificate may be generated without a photo in future template modes.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

or restrict if certificate must always keep photo reference.

---

## 9. Stamp Relationships

## 9.1 attractions to stamp_definitions

### Relationship

```text
attractions.attraction_id 1 -> many stamp_definitions.attraction_id
```

### Purpose

Defines stamps available for attractions.

### Foreign Key

```text
stamp_definitions.attraction_id references attractions(attraction_id)
```

### Required?

Required for stamp definitions.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 9.2 tourists to tourist_stamps

### Relationship

```text
tourists.tourist_id 1 -> many tourist_stamps.tourist_id
```

### Purpose

Tracks stamps earned by tourist.

### Foreign Key

```text
tourist_stamps.tourist_id references tourists(tourist_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 9.3 attractions to tourist_stamps

### Relationship

```text
attractions.attraction_id 1 -> many tourist_stamps.attraction_id
```

### Purpose

Tracks earned stamps per attraction.

### Foreign Key

```text
tourist_stamps.attraction_id references attractions(attraction_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 9.4 visits to tourist_stamps

### Relationship

```text
visits.visit_id 1 -> many tourist_stamps.visit_id
```

### Purpose

Shows which visit earned the stamp.

### Foreign Key

```text
tourist_stamps.visit_id references visits(visit_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 9.5 stamp_definitions to tourist_stamps

### Relationship

```text
stamp_definitions.stamp_definition_id 1 -> many tourist_stamps.stamp_definition_id
```

### Purpose

Links earned record to stamp design and metadata.

### Foreign Key

```text
tourist_stamps.stamp_definition_id references stamp_definitions(stamp_definition_id)
```

### Required?

Required.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 9.6 Stamp Uniqueness Rule

Recommended:

```text
unique(tourist_id, attraction_id)
```

Meaning:

A tourist normally earns only one stamp per attraction.

Repeat visits are stored in `visits`.

---

## 10. Expense Relationships

## 10.1 expense_categories to visit_expenses

### Relationship

```text
expense_categories.expense_category_id 1 -> many visit_expenses.expense_category_id
```

### Purpose

Classifies spending.

### Required?

Optional for overall spending range, required for category-specific spending.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

or restrict and deactivate categories.

---

## 10.2 visits to visit_expenses

### Relationship

```text
visits.visit_id 1 -> 0..1 visit_expenses.visit_id
```

### Purpose

Links spending information to a visit.

The current optional post-certificate survey records one spending category/range
answer per visit. `unique(visit_id)` makes retries and edits idempotent.

### Foreign Key

```text
visit_expenses.visit_id references visits(visit_id)
```

### Required?

Required for expense record.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 11. Satisfaction and Survey Relationships

## 11.1 visits to satisfaction_surveys

### Relationship

```text
visits.visit_id 1 -> zero or one satisfaction_surveys.visit_id
```

### Purpose

Stores structured satisfaction data for a visit.

### Foreign Key

```text
satisfaction_surveys.visit_id references visits(visit_id)
```

### Required?

Required for satisfaction record, but satisfaction itself is optional.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

### Constraint

```text
unique(visit_id)
```

This prevents multiple satisfaction summary rows for one visit.

---

## 11.2 attractions to satisfaction_surveys

### Relationship

```text
attractions.attraction_id 1 -> many satisfaction_surveys.attraction_id
```

### Purpose

Supports attraction-level satisfaction analysis.

### Required?

Required.

Even though attraction can be derived from visit, storing `attraction_id` directly can simplify dashboard queries.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 11.3 Future survey_questions to survey_answers

### Relationship

```text
survey_questions.question_id 1 -> many survey_answers.question_id
```

### Required?

Out of MVP. The current migrations use fixed optional micro-survey columns instead.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

Do not delete questions that have historical answers.

---

## 11.4 Future visits to survey_answers

### Relationship

```text
visits.visit_id 1 -> many survey_answers.visit_id
```

### Required?

Out of MVP. Use `satisfaction_surveys` and `visit_expenses` for the current optional post-certificate survey.

### Delete Behavior

Recommended:

```text
ON DELETE RESTRICT
```

---

## 12. Funnel Event Relationships

## 12.1 visitors to funnel_events

Funnel events can be linked to multiple optional entities.

### Relationships

```text
tourists.tourist_id 1 -> many funnel_events.tourist_id
visits.visit_id 1 -> many funnel_events.visit_id
attractions.attraction_id 1 -> many funnel_events.attraction_id
photo_spots.photo_spot_id 1 -> many funnel_events.photo_spot_id
checkin_codes.checkin_code_id 1 -> many funnel_events.checkin_code_id
```

### Required?

All entity references may be optional because early events may happen before tourist or visit creation.

Required:

```text
event_type
event_time
```

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

for optional entity references.

### Notes

This table is important for measuring conversion and drop-off.

---

## 13. Admin and Security Relationships

## 13.1 admin_users to admin_user_roles

### Relationship

```text
admin_users.admin_id many -> many roles.role_id through admin_user_roles
```

### Join Table

```text
admin_user_roles
```

### Required?

Required if custom roles are implemented.

---

## 13.2 roles to role_permissions

### Relationship

```text
roles.role_id many -> many permissions.permission_id through role_permissions
```

### Join Table

```text
role_permissions
```

### Required?

Recommended for production.

MVP can simplify with one role field if necessary.

---

## 13.3 admin_users to audit_logs

### Relationship

```text
admin_users.admin_id 1 -> many audit_logs.admin_id
```

### Required?

Optional actor.

System actions may not have user.

### Delete Behavior

Recommended:

```text
ON DELETE SET NULL
```

Audit history should remain even if a user is deactivated.

---

## 14. Official Data Relationships

## 14.1 provinces to official_tourism_stats

### Relationship

```text
provinces.province_id 1 -> many official_tourism_stats.province_id
```

### Purpose

Supports comparison with official statistics.

### MVP Status

Phase 2.

---

## 14.2 data_import_logs to official_tourism_stats

### Relationship

```text
data_import_logs.import_log_id 1 -> many official_tourism_stats.import_log_id
```

### Purpose

Connects official statistics to the import batch that created them.

### MVP Status

Phase 2A.

---

## 14.3 attractions to official_attraction_refs

### Relationship

```text
attractions.attraction_id 1 -> many official_attraction_refs.attraction_id
```

### Purpose

Links local attractions to official references.

### MVP Status

Phase 2.

---

## 14.4 provinces to travel_stories

### Relationship

```text
provinces.province_id 1 -> many travel_stories.province_id
```

### Purpose

Supports province-filtered public story pages and SEO content.

### MVP Status

Phase 2A public content foundation.

---

## 15. Required Relationship Constraints Summary

Recommended constraints:

```text
districts.province_id -> provinces.province_id
attractions.province_id -> provinces.province_id
attractions.district_id -> districts.district_id
attractions.attraction_type_id -> attraction_types.attraction_type_id
content_media.attraction_id -> attractions.attraction_id
photo_spots.attraction_id -> attractions.attraction_id
checkin_codes.attraction_id -> attractions.attraction_id
checkin_codes.photo_spot_id -> photo_spots.photo_spot_id
travel_stories.province_id -> provinces.province_id

tourists.origin_country_id -> countries.country_id
tourists.origin_province_id -> provinces.province_id
tourist_identities.tourist_id -> tourists.tourist_id
consent_records.tourist_id -> tourists.tourist_id
consent_records.visit_id -> visits.visit_id

visits.tourist_id -> tourists.tourist_id
visits.attraction_id -> attractions.attraction_id
visits.photo_spot_id -> photo_spots.photo_spot_id
visits.checkin_code_id -> checkin_codes.checkin_code_id
visits.travel_companion_id -> travel_companions.travel_companion_id
visits.transport_mode_id -> transport_modes.transport_mode_id
visits.travel_purpose_id -> travel_purposes.travel_purpose_id

visit_photos.visit_id -> visits.visit_id
certificates.visit_id -> visits.visit_id
certificates.template_id -> certificate_templates.template_id
certificates.photo_id -> visit_photos.photo_id

stamp_definitions.attraction_id -> attractions.attraction_id
tourist_stamps.tourist_id -> tourists.tourist_id
tourist_stamps.attraction_id -> attractions.attraction_id
tourist_stamps.visit_id -> visits.visit_id
tourist_stamps.stamp_definition_id -> stamp_definitions.stamp_definition_id

visit_expenses.visit_id -> visits.visit_id
visit_expenses.expense_category_id -> expense_categories.expense_category_id

satisfaction_surveys.visit_id -> visits.visit_id
satisfaction_surveys.attraction_id -> attractions.attraction_id

official_tourism_stats.province_id -> provinces.province_id
official_tourism_stats.import_log_id -> data_import_logs.import_log_id
official_attraction_refs.attraction_id -> attractions.attraction_id
```

---

## 16. Required Unique Constraints

Recommended unique constraints:

```text
countries.iso2_code
countries.iso3_code
provinces.province_name_th
provinces.province_name_en
districts(province_id, district_name_th)
attractions.slug
checkin_codes.code
content_media(attraction_id, storage_path)
tourist_identities(provider, provider_user_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys.visit_id
roles.role_name
permissions.permission_name
admin_user_roles(admin_id, role_id)
role_permissions(role_id, permission_id)
```

---

## 17. Optional Direct Relationship Duplication

Some relationships can be derived but may be stored directly for dashboard performance.

Example:

```text
satisfaction_surveys.attraction_id
```

This can be derived from:

```text
satisfaction_surveys.visit_id -> visits.attraction_id
```

But storing it directly can simplify dashboard queries.

If direct duplication is used, application logic or database triggers must keep data consistent.

For MVP, direct duplication is acceptable when it reduces query complexity.

---

## 18. Relationship Anti-Patterns

Do not create these relationship designs.

## 18.1 Tourist Contains Visit Columns

Bad:

```text
tourists.last_attraction_id
tourists.expense_amount
tourists.satisfaction_score
```

Problem:

Breaks repeat visit analysis.

---

## 18.2 Certificate Without Visit

Bad:

```text
certificates.tourist_name
certificates.attraction_name
certificates.image_path
```

Problem:

Cannot link certificate to structured tourism data.

---

## 18.3 Stamp Without Attraction

Bad:

```text
tourist_stamps.stamp_name
```

Problem:

Cannot analyze stamp progress by attraction or province.

---

## 18.4 QR Code Without Database Record

Bad:

```text
Hardcoded QR URL only.
```

Problem:

Cannot track scans, deactivate codes, or analyze source.

---

## 18.5 Survey Without Visit

Bad:

```text
survey_answers.tourist_id only
```

Problem:

Cannot connect satisfaction to specific attraction visit.

---

## 19. Relationship Review Checklist

Before accepting a schema or API change, verify:

```text
[ ] Every visit links to one tourist.
[ ] Every visit links to one attraction.
[ ] Optional photo spot is supported.
[ ] QR/check-in code is tracked.
[ ] Tourist identity is separate from tourist profile.
[ ] Certificate links to visit.
[ ] Certificate links to template.
[ ] Photo links to visit.
[ ] Stamp links to tourist, attraction, and visit.
[ ] Expense links to visit.
[ ] Satisfaction links to visit and attraction.
[ ] Consent links to tourist or visit.
[ ] Funnel events can be recorded before visit creation.
[ ] Repeat visit is supported.
[ ] Duplicate stamp is prevented.
[ ] Foreign tourist without LINE is supported.
[ ] Historical records are not destroyed by deletes.
```

---

## 20. Final Relationship Rule

The relationship model must make the system capable of answering:

```text
Who visited?
Where did they visit?
How did they travel?
How much did they spend?
How satisfied were they?
What should planners improve?
```

If a relationship does not help answer these questions or support secure operation, reconsider whether it belongs in the MVP.
