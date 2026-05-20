# DATA_QUALITY_RULES.md

## 1. Document Purpose

This document defines data quality rules for the **Southern Border Tourism Data & Intelligence Platform**.

The platform is only useful if the collected data is reliable, consistent, analyzable, and safe to use.

This document defines rules for:

- Data validation
- Required and optional data
- Master data usage
- Duplicate prevention
- Tourist identity quality
- Visit record quality
- Expense data quality
- Satisfaction data quality
- Dashboard data quality
- Import data quality
- Admin data quality
- Privacy-aware data quality

All developers and AI coding agents must follow this document when building forms, APIs, migrations, seed data, dashboard queries, and exports.

---

## 2. Data Quality Mission

The system must support real tourism planning.

Therefore, the database must avoid:

- Duplicate tourist profiles
- Invalid visit records
- Free-text values that should be controlled
- Missing attraction relationships
- Inconsistent province or district names
- Invalid satisfaction scores
- Unclear expense values
- Untraceable consent
- Unusable dashboard metrics

Good data quality means the system can answer planning questions accurately.

---

## 3. Core Data Quality Principles

## 3.1 Collect Only Useful Data

Do not collect data only because it is possible.

Every field must support at least one purpose:

- Certificate generation
- Visit recording
- Dashboard analysis
- Tourism planning
- Privacy compliance
- System operation
- Academic reporting

If a field does not support a clear purpose, do not collect it.

---

## 3.2 Prefer Structured Data

Use controlled values instead of free text when the data will be analyzed.

Good:

```text
transport_mode_id = 1
```

Bad:

```text
transport_mode_text = "carrr", "Car", "private vehicle", "รถ"
```

Structured data improves dashboard quality.

---

## 3.3 Separate Required and Optional Data

The tourist-facing experience must not ask too many required questions.

Required fields should be minimal.

Optional fields can be collected after the tourist receives a certificate.

---

## 3.4 Validate at Multiple Layers

Validation should happen in:

1. Frontend form
2. Server/API layer
3. Database constraints

Do not rely on frontend validation only.

---

## 3.5 Preserve Historical Meaning

Historical data should remain meaningful even if master data changes.

Example:

If an attraction is renamed, old visit records should still be understandable.

For MVP, relationships are enough.

For production, consider snapshots for critical report fields.

---

## 4. Data Quality Levels

## 4.1 Level 1: Required for Record Validity

Data required to create a valid record.

Examples:

- A visit must have tourist_id.
- A visit must have attraction_id.
- A check-in code must have code.
- A certificate must have visit_id.
- A stamp must have tourist_id and attraction_id.

## 4.2 Level 2: Required for Dashboard Usefulness

Data that makes analytics useful.

Examples:

- tourist origin
- age group
- visit date
- transport mode
- spending range
- satisfaction score

## 4.3 Level 3: Optional Planning Enrichment

Useful but not required.

Examples:

- comment
- detailed category scores
- number of nights
- travel purpose
- recommendation reason
- improvement suggestions

---

## 5. Required Data by Flow Step

## 5.1 QR Landing Step

Required system data:

```text
checkin_code
attraction_id
event_name = qr_scanned
event_time
```

Data quality rules:

- check-in code must exist.
- check-in code must be active.
- attraction must exist.
- inactive attraction should not allow certificate flow.
- invalid code must show a friendly error and must not create a visit.

---

## 5.2 Minimal Tourist Form Step

Required tourist data:

```text
display_name
origin_country_id or origin_province_id
age_group
visit_date
consent
```

Data quality rules:

- display_name must not be empty.
- display_name must have reasonable length.
- at least one origin field must be provided.
- age_group must come from allowed values.
- visit_date must be a valid date.
- consent must be explicitly accepted.
- no full address should be collected.
- legal name should not be required.

---

## 5.3 Photo Upload Step

Required photo data:

```text
visit_id
storage_path
mime_type
file_size_bytes
uploaded_at
```

Data quality rules:

- file must be an image.
- allowed MIME types:
  - image/jpeg
  - image/png
  - image/webp
- file size must be within configured limit.
- storage path must not be empty.
- photo must link to a visit.
- invalid file must be rejected before certificate generation.

---

## 5.4 Certificate Generation Step

Required certificate data:

```text
visit_id
template_id
certificate_path
generated_at
```

Data quality rules:

- certificate must link to visit.
- certificate must use a valid template.
- generated file path must be stored.
- certificate should not be generated for invalid visit.
- certificate generation should be idempotent or handle duplicate submissions safely.

---

## 5.5 Stamp Assignment Step

Required stamp data:

```text
tourist_id
attraction_id
visit_id
stamp_definition_id
earned_at
```

Data quality rules:

- stamp must link to tourist.
- stamp must link to attraction.
- stamp must link to visit.
- stamp must link to stamp definition.
- duplicate stamp for same tourist and attraction should be prevented.
- repeat visit should create visit record but not duplicate stamp.

---

## 5.6 Optional Survey Step

Optional survey data:

```text
travel_companion_id
group_size
transport_mode_id
travel_purpose_id
overnight_status
nights
spending_range
overall_score
revisit_intention
recommendation_intention
comment
```

Data quality rules:

- skip must be allowed.
- if submitted, values must be valid.
- group_size must be greater than or equal to 1.
- nights must be greater than or equal to 0.
- satisfaction scores must be from 1 to 5.
- spending range must be from allowed list.
- comments should have length limits.

---

## 6. Master Data Rules

## 6.1 Countries

Rules:

- Use ISO country codes where possible.
- Country names should not be entered manually in tourist form.
- Inactive countries should not appear in public forms.
- Existing records should not be deleted if referenced.

---

## 6.2 Provinces

Rules:

- Use official province names.
- The three target provinces must be flagged with `is_target_area = true`.
- Province values in forms must come from master data.
- Do not store province names as free text in tourist profile.

Target provinces:

```text
Yala
Pattani
Narathiwat
```

---

## 6.3 Districts

Rules:

- District must belong to province.
- District names should be unique within province.
- Attraction district should be selected from master data.
- District may be optional if unknown during initial data entry.

---

## 6.4 Attraction Types

Rules:

- Use controlled attraction categories.
- Avoid duplicate categories with similar meaning.
- Inactive categories should not appear in forms.
- Existing attraction records should remain valid if type is deactivated.

---

## 6.5 Transport Modes

Rules:

- Use controlled options.
- Avoid free-text transport mode.
- Include an "Other" option if needed.
- If "Other" is used, optional text can be captured separately.

---

## 6.6 Expense Categories

Rules:

- Use controlled categories.
- Categories should map to dashboard groups.
- Do not allow unlimited free-text categories in MVP.

---

## 7. Tourist Data Quality Rules

## 7.1 Tourist Profile

The tourist profile should represent a person or participant profile, not a visit.

Required or recommended fields:

```text
display_name
origin_country_id
origin_province_id
age_group
preferred_language
```

Rules:

- display_name is for certificate display.
- display_name is not necessarily legal name.
- full legal name should not be required.
- origin_country_id and origin_province_id must use master data.
- age_group should use allowed values.
- tourist profile should be reused when identity matches.

---

## 7.2 Age Group Values

Recommended MVP values:

```text
under_18
18_24
25_34
35_44
45_54
55_64
65_plus
prefer_not_to_answer
```

Rules:

- Do not collect exact birth date in MVP.
- Do not calculate exact age unless necessary.
- Use age group for privacy and analytics.

---

## 7.3 Origin Rules

For Thai tourists:

```text
origin_country_id = Thailand
origin_province_id = selected province
```

For foreign tourists:

```text
origin_country_id = selected country
origin_province_id = null
```

Rules:

- At least one origin indicator should exist.
- Foreign tourists should not be forced to select Thai province.
- Domestic tourists should not need to enter full address.

---

## 8. Identity Data Quality Rules

## 8.1 Identity Providers

Allowed providers:

```text
anonymous_device
line
email
google
```

Rules:

- provider must be from allowed list.
- provider_user_id must not be empty.
- provider_user_id should be normalized before storage where appropriate.
- email identity should be lowercased.
- duplicate provider/provider_user_id must be prevented.

Required unique rule:

```text
unique(provider, provider_user_id)
```

---

## 8.2 Anonymous Device Identity

Rules:

- Generate secure random token.
- Store token in browser storage or secure cookie.
- Do not treat anonymous device as permanent identity.
- Explain to user that guest passport may not work across devices.
- Allow linking to LINE or email later.

---

## 8.3 LINE Identity

Rules:

- LINE must be optional.
- LINE should not be required before certificate generation.
- LINE user ID should link to existing tourist when possible.
- Store only required LINE identity metadata.
- Do not send messages unless user consent allows it.

---

## 8.4 Email Identity

Rules:

- Email must be optional.
- Email should be normalized to lowercase.
- Validate email format.
- Do not expose email in dashboards.
- Email should be used for recovery or certificate link only when consented.

---

## 8.5 Identity Merge

Rules:

- If guest later connects LINE or email, link new identity to existing tourist.
- Do not create new tourist if an existing guest profile is active.
- Avoid merging two tourist profiles without user confirmation or strong evidence.

---

## 9. Visit Data Quality Rules

## 9.1 Visit Record

A valid visit must have:

```text
tourist_id
attraction_id
visit_date
completion_status
```

Recommended:

```text
photo_spot_id
checkin_code_id
visited_at
```

Rules:

- visit must link to tourist.
- visit must link to attraction.
- repeat visits are allowed.
- visit date must be valid.
- visit date should not be far in the future.
- if visit date is historical, it should still be accepted because tourists may complete the flow later.

---

## 9.2 Visit Date Validation

Recommended rules:

- visit_date cannot be null.
- visit_date should not be later than current date by more than allowed tolerance.
- visit_date may be earlier than current date because users can complete later.
- extremely old dates may require confirmation.

Example validation:

```text
visit_date <= today + 1 day
visit_date >= today - 365 days
```

The lower bound can be adjusted.

---

## 9.3 Group Size Validation

Rules:

- group_size must be integer.
- group_size must be >= 1.
- group_size should have a reasonable upper limit in normal tourist form.
- very large values should require admin review or be treated as tour group.

Recommended MVP range:

```text
1 to 100
```

---

## 9.4 Overnight Status

Allowed values:

```text
same_day
overnight
unknown
prefer_not_to_answer
```

Rules:

- if overnight_status = same_day, nights should be 0 or null.
- if overnight_status = overnight, nights should be >= 1 when provided.
- nights must not be negative.

---

## 10. Attraction Data Quality Rules

## 10.1 Attraction Required Fields

Required:

```text
province_id
slug
name_th
is_published
is_active
```

Recommended:

```text
district_id
attraction_type_id
name_en
description_th
latitude
longitude
```

Rules:

- slug must be unique.
- attraction must belong to province.
- published attraction must have enough content for public page.
- inactive attraction should not appear in public pages.
- deactivated attraction should remain available for historical visit records.

---

## 10.2 Attraction Slug Rules

Rules:

- slug must be unique.
- slug should use lowercase letters, numbers, and hyphens.
- slug should not contain spaces.
- slug should be stable after publication.
- if slug changes, redirects may be needed in production.

---

## 10.3 Coordinate Rules

Rules:

- latitude must be between -90 and 90.
- longitude must be between -180 and 180.
- coordinates are optional but recommended.
- invalid coordinates must be rejected.

---

## 10.4 Photo Spot Rules

Rules:

- photo spot must belong to attraction.
- active photo spot should have name.
- photo spot should have display order.
- photo spot can be deactivated but should not be hard deleted if used by visits.

---

## 10.5 Check-in Code Rules

Rules:

- code must be unique.
- code should be short and URL-safe.
- code must link to attraction.
- photo_spot_id is optional.
- inactive code must not allow new visit.
- invalid code must not create records.
- QR code should not be separated by identity type.

Good:

```text
/c/BTG001
```

Bad:

```text
/line/BTG001
/foreign/BTG001
/guest/BTG001
```

---

## 11. Photo Data Quality Rules

## 11.1 File Type

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Rules:

- reject unsupported file types.
- validate MIME type server-side.
- do not trust file extension only.

---

## 11.2 File Size

Rules:

- set a maximum upload size.
- compress or resize large images if possible.
- generate thumbnail when useful.

Recommended MVP limit:

```text
5 MB to 10 MB
```

Exact value should be configured in environment or constants.

---

## 11.3 Storage Path

Rules:

- storage_path must not be empty.
- path should include visit or tourist context without exposing sensitive data.
- avoid storing raw base64 image in database.
- use object storage.

---

## 11.4 Moderation Status

Allowed values:

```text
pending
approved
rejected
```

MVP can default to:

```text
pending
```

or

```text
approved
```

depending on moderation policy.

Production should support review.

---

## 12. Certificate Data Quality Rules

## 12.1 Certificate Record

Required:

```text
visit_id
template_id
certificate_path
generated_at
```

Rules:

- certificate must link to visit.
- template must exist and be active.
- generated file path must be valid.
- download_count must not be negative.
- duplicate generation should be handled safely.

---

## 12.2 Certificate Content

Certificate should include:

```text
display_name
attraction_name
visit_date
uploaded_photo
project or campaign branding
```

Rules:

- do not display private identity values.
- do not display email.
- do not display LINE ID.
- use display name only.

---

## 13. Stamp Data Quality Rules

## 13.1 Stamp Assignment

Required:

```text
tourist_id
attraction_id
visit_id
stamp_definition_id
earned_at
```

Rules:

- tourist must exist.
- attraction must exist.
- visit must exist.
- stamp definition must exist.
- duplicate tourist-attraction stamp should be prevented.
- repeat visits should still be recorded in visits.

Unique rule:

```text
unique(tourist_id, attraction_id)
```

---

## 13.2 Stamp Status

Allowed values:

```text
earned
revoked
```

Production may add:

```text
expired
```

---

## 14. Expense Data Quality Rules

## 14.1 Spending Range

Use spending ranges in MVP.

Recommended values:

```text
0_500
501_1000
1001_2000
2001_5000
5001_plus
prefer_not_to_answer
```

Rules:

- do not force exact amount.
- spending range must be from allowed values.
- amount_min and amount_max should match range if used.
- currency_code should default to THB.
- expense must link to visit.

---

## 14.2 Expense Category

Rules:

- category should come from master data.
- category may be null for overall spending range.
- category-specific expense rows should use expense_category_id.

---

## 15. Satisfaction Data Quality Rules

## 15.1 Score Range

Allowed score range:

```text
1 to 5
```

Fields:

```text
overall_score
safety_score
cleanliness_score
transport_score
information_score
service_score
value_for_money_score
```

Rules:

- scores must be integer.
- scores must be between 1 and 5.
- null is allowed for optional category scores.
- overall score should be encouraged but not necessarily required if survey is optional.

---

## 15.2 Revisit and Recommendation

Fields:

```text
revisit_intention
recommendation_intention
```

Rules:

- boolean or controlled values.
- avoid ambiguous text-only answers.
- allow prefer not to answer if UI needs it.

---

## 15.3 Comments

Rules:

- comments are optional.
- comments should have length limit.
- comments should not be required.
- comments should not be used as the only satisfaction data.

Recommended max length:

```text
1000 characters
```

---

## 16. Funnel Event Data Quality Rules

## 16.1 Event Names

Allowed event names:

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

Rules:

- event_name must come from allowed list.
- event_time must be set.
- early events may not have tourist_id or visit_id.
- session_id should be used before tourist exists.
- metadata_json should not contain unnecessary personal data.

---

## 16.2 Funnel Consistency

Recommended event order:

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

Rules:

- events may be missing due to user behavior or technical issues.
- do not assume every session completes all events.
- dashboard should handle missing events.

---

## 17. Admin Data Quality Rules

## 17.1 Admin CRUD

Rules:

- admin changes must validate required fields.
- admin should not hard delete records used by historical visits.
- admin should use deactivate/archive.
- important changes should create audit log.

---

## 17.2 Data Export

Rules:

- exports must respect permissions.
- exports should exclude unnecessary personal data.
- exports should be logged.
- aggregated exports are preferred for planning users.

---

## 18. Dashboard Data Quality Rules

## 18.1 Metric Definitions

Every dashboard metric must have:

```text
metric_name
definition
source_tables
calculation
filters
interpretation
```

Do not create charts without metric definitions.

---

## 18.2 Missing Data Handling

Dashboard must handle:

- no visits
- no survey responses
- no expense data
- no satisfaction data
- null origin
- null transport mode
- null travel purpose

Do not show misleading zero values when data is actually missing.

Use labels like:

```text
Unknown
Not answered
No data
```

---

## 18.3 Aggregation Rules

Rules:

- count visits from visits table.
- count tourists from tourists table.
- count certificates from certificates table.
- count stamps from tourist_stamps table.
- average satisfaction from satisfaction_surveys.
- expense distribution from visit_expenses.
- origin distribution from tourists joined to visits when analyzing actual visits.

---

## 19. Official Data Import Quality Rules

When official data import is implemented:

Rules:

- store source name.
- store source URL if available.
- store import timestamp.
- store import status.
- store records processed.
- validate province mapping.
- do not overwrite local data without review.
- keep import logs.

---

## 20. Duplicate Prevention Rules

## 20.1 Tourist Duplicate Prevention

Use identity lookup.

Rules:

- check tourist_identities before creating tourist.
- if provider/provider_user_id exists, reuse tourist.
- if guest later connects email/LINE, link to same tourist.
- do not create tourist on every visit.

---

## 20.2 Visit Duplicate Prevention

Duplicate visits can happen from double submission.

Recommended rules:

- use idempotency key for critical operations if possible.
- prevent duplicate certificate generation from rapid repeated clicks.
- if same tourist, same attraction, same check-in code, and same timestamp window occurs, review or merge.

---

## 20.3 Stamp Duplicate Prevention

Use unique constraint:

```text
unique(tourist_id, attraction_id)
```

---

## 21. Data Quality Validation Checklist

Before accepting a feature, verify:

```text
[ ] Required fields are validated.
[ ] Optional fields can be skipped.
[ ] Master data is used instead of free text.
[ ] Foreign keys are valid.
[ ] Duplicate identities are prevented.
[ ] Repeat visits are supported.
[ ] Duplicate stamps are prevented.
[ ] Scores are within valid range.
[ ] Spending range uses allowed values.
[ ] Consent is stored.
[ ] Dashboard can use the data.
[ ] No unnecessary personal data is collected.
[ ] Error messages are clear.
```

---

## 22. Data Quality Anti-Patterns

Do not do this:

```text
Store all tourist answers in one text field.
Use province name as free text.
Create new tourist every time QR is scanned.
Store uploaded photo as base64 in database.
Allow satisfaction score outside 1-5.
Allow stamp duplicates for same tourist and attraction.
Use exact address when province is enough.
Require LINE login before certificate.
Build dashboard from inconsistent free-text values.
```

---

## 23. Definition of Done for Data Quality

A feature is data-quality complete when:

- Data is validated in frontend and backend.
- Database constraints protect critical rules.
- Master data is used where appropriate.
- Dashboard can query the data reliably.
- Missing data is handled intentionally.
- Duplicate records are considered.
- Consent and privacy are respected.
- Documentation is updated.

---

## 24. Final Data Quality Rule

The database must produce data that is good enough for real planning.

If a field cannot be trusted, it should not be used for dashboard decisions.

Quality is more important than collecting many fields.
