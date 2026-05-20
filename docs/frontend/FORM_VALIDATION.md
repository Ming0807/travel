# FORM_VALIDATION.md

## 1. Document Purpose

This document defines form validation rules for the **Southern Border Tourism Data & Intelligence Platform**.

Forms are critical because they directly affect:

- tourist completion rate
- data quality
- dashboard accuracy
- privacy compliance
- admin data correctness
- production reliability

This document should guide all frontend forms, backend validation, server actions, API endpoints, and database constraints.

---

## 2. Validation Mission

The validation mission is:

```text
Make forms easy for users while protecting data quality.
```

Tourists should not feel blocked by unnecessary validation.

Admins should be prevented from creating bad operational data.

The system should validate data at multiple layers:

```text
frontend
server/API
database
```

Frontend validation improves UX.

Server and database validation protect correctness and security.

---

## 3. Core Validation Principles

## 3.1 Validate at Multiple Layers

Do not rely only on frontend validation.

Required layers:

```text
frontend validation for user feedback
server validation for security
database constraints for critical rules
```

Example:

```text
age_group controlled in frontend
age_group checked on server
age_group constrained in database
```

---

## 3.2 Minimize Required Tourist Fields

Required tourist fields should be minimal.

Before certificate generation, only require:

```text
display name
origin country/province
age group
visit date
consent
photo
```

Everything else should be optional or asked after reward.

---

## 3.3 Use Controlled Values for Analytics

Fields used in dashboards must use controlled values.

Examples:

```text
age_group
transport_mode
travel_purpose
spending_range
satisfaction_score
overnight_status
```

Avoid free-text for analyzable categories.

---

## 3.4 Prefer Helpful Error Messages

Errors should explain the problem and how to fix it.

Bad:

```text
Invalid input
```

Good:

```text
Please select where you are from.
```

---

## 3.5 Do Not Over-Validate Tourist Flow

Validation should not feel hostile.

Avoid:

- requiring exact legal name
- rejecting short names unnecessarily
- requiring full address
- requiring phone/email/LINE
- forcing survey questions

---

## 4. Recommended Validation Stack

Recommended:

```text
Zod
React Hook Form
Server actions or API route validation
Database constraints
```

Possible pattern:

```text
shared schema for client/server where practical
server-only schema for privileged/admin fields
database constraint for critical business rules
```

---

## 5. Validation Result Pattern

Use a consistent result pattern.

```ts
type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
```

Frontend should display:

```text
fieldErrors near fields
error as form-level message
```

---

## 6. Tourist Profile Form Validation

## 6.1 Form Purpose

Collect minimal profile data for certificate generation and planning analytics.

## 6.2 Fields

```text
display_name
origin_country_id
origin_province_id
age_group
preferred_language
visit_date
has_consented
```

## 6.3 display_name

Rules:

```text
required
trim whitespace
minimum 1 character after trim
maximum 150 characters
not only whitespace
```

Recommended helper text:

```text
Use the name you want to show on your certificate.
```

Thai:

```text
ใช้ชื่อที่ต้องการให้แสดงบนใบประกาศ
```

Do not require legal full name.

## 6.4 origin_country_id

Rules:

```text
required for foreign tourists
must exist in countries table
must be active
```

If user selects Thailand, origin_province_id should be asked.

## 6.5 origin_province_id

Rules:

```text
required for domestic Thai tourists
must exist in provinces table
must be active
```

Do not ask full address.

## 6.6 Origin Business Rule

At least one origin indicator is required:

```text
origin_country_id or origin_province_id
```

Recommended:

```text
If origin_country_id = Thailand, require origin_province_id.
If origin_country_id != Thailand, origin_province_id can be null.
```

## 6.7 age_group

Allowed values:

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

```text
required
must be controlled value
```

Use age group, not date of birth.

## 6.8 preferred_language

Allowed values for MVP:

```text
th
en
```

Rules:

```text
optional
default from browser or UI selection
must be supported language
```

## 6.9 visit_date

Rules:

```text
required
valid date
not far in future
can be in past
```

Recommended MVP rule:

```text
visit_date <= today + 1 day
visit_date >= today - 365 days
```

Reason:

Tourists may complete the flow later at hotel.

## 6.10 has_consented

Rules:

```text
must be true
checkbox must not be pre-checked
consent version must be recorded
```

---

## 7. Tourist Profile Zod Example

Conceptual schema:

```ts
const touristProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(150),
    originCountryId: z.number().int().positive().optional(),
    originProvinceId: z.number().int().positive().optional(),
    ageGroup: z.enum([
      "under_18",
      "18_24",
      "25_34",
      "35_44",
      "45_54",
      "55_64",
      "65_plus",
      "prefer_not_to_answer"
    ]),
    preferredLanguage: z.enum(["th", "en"]).default("th"),
    visitDate: z.string(),
    hasConsented: z.literal(true)
  })
  .superRefine((data, ctx) => {
    if (!data.originCountryId && !data.originProvinceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["originCountryId"],
        message: "Please select where you are from."
      });
    }
  });
```

Server must also verify IDs exist.

---

## 8. Photo Upload Validation

## 8.1 File Required

Rules:

```text
file is required before certificate generation
```

## 8.2 Allowed MIME Types

Allowed:

```text
image/jpeg
image/png
image/webp
```

Do not allow SVG in MVP.

## 8.3 File Size

Recommended max:

```text
5 MB
```

Configurable:

```text
MAX_PHOTO_SIZE_BYTES
```

## 8.4 File Name

Rules:

```text
do not trust original filename
generate server-side storage filename
do not include tourist name in storage path
```

## 8.5 Server-Side Validation

Server must validate:

```text
file exists
MIME type
file size
visit ownership/context
storage path generation
```

## 8.6 Error Messages

Invalid type:

```text
Please upload a JPEG, PNG, or WebP image.
```

Too large:

```text
This photo is too large. Please upload a smaller image.
```

No file:

```text
Please choose a photo to continue.
```

---

## 9. Visit Record Validation

## 9.1 Required Fields

```text
tourist_id
attraction_id
visit_date
completion_status
```

Recommended when available:

```text
photo_spot_id
checkin_code_id
session_id
```

## 9.2 tourist_id

Rules:

```text
required
must exist
must match current tourist identity/session where applicable
```

Never trust tourist_id from browser only.

## 9.3 attraction_id

Rules:

```text
required
must exist
must be active
```

## 9.4 photo_spot_id

Rules:

```text
optional
must exist if provided
must belong to same attraction
must be active if used in active QR flow
```

## 9.5 checkin_code_id

Rules:

```text
optional
must exist if provided
must map to same attraction/photo spot context
```

## 9.6 completion_status

Allowed values:

```text
started
minimal_form_completed
photo_uploaded
certificate_generated
survey_completed
abandoned
```

Rules:

```text
must be controlled value
only system should update critical status transitions
```

---

## 10. Travel Behavior Validation

## 10.1 travel_companion_id

Rules:

```text
optional
must exist in travel_companions if provided
must be active in public form
```

## 10.2 group_size

Rules:

```text
optional
integer
minimum 1
maximum 100 for normal tourist form
```

If greater than 100 is needed, admin/research workflow should handle separately.

## 10.3 transport_mode_id

Rules:

```text
optional
must exist in transport_modes if provided
must be active in public form
```

## 10.4 travel_purpose_id

Rules:

```text
optional
must exist in travel_purposes if provided
must be active in public form
```

## 10.5 overnight_status

Allowed values:

```text
same_day
overnight
unknown
prefer_not_to_answer
```

## 10.6 nights

Rules:

```text
optional
integer
minimum 0
```

Business rule:

```text
if overnight_status = same_day, nights should be 0 or null.
if overnight_status = overnight, nights should be >= 1 when provided.
```

---

## 11. Expense Validation

## 11.1 spending_range

Allowed values:

```text
0_500
501_1000
1001_2000
2001_5000
5001_plus
prefer_not_to_answer
```

Rules:

```text
optional in survey
must be controlled value if submitted
```

## 11.2 amount_min and amount_max

Rules:

```text
amount_min >= 0 if provided
amount_max >= amount_min if provided
amount_max can be null for open-ended range
```

## 11.3 currency_code

Default:

```text
THB
```

Rules:

```text
3-letter currency code
```

For MVP, only THB is required.

## 11.4 expense_category_id

Rules:

```text
optional
must exist in expense_categories if provided
must be active in public form
```

---

## 12. Satisfaction Validation

## 12.1 Score Fields

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

```text
optional unless business says required
integer
between 1 and 5
```

MVP should at least collect overall_score if user answers survey.

## 12.2 revisit_intention

MVP rule:

```text
boolean or null
```

Optional future enum:

```text
yes
no
not_sure
```

## 12.3 recommendation_intention

Same rule as revisit_intention.

## 12.4 comment

Rules:

```text
optional
trim whitespace
maximum 1000 characters
not required
```

Do not show comments publicly without review.

## 12.5 One Survey per Visit

Recommended database rule:

```text
unique(visit_id)
```

If tourist resubmits, update existing survey rather than create duplicate.

---

## 13. Survey Form Zod Example

Conceptual schema:

```ts
const postCertificateSurveySchema = z.object({
  travelCompanionId: z.number().int().positive().optional(),
  groupSize: z.number().int().min(1).max(100).optional(),
  transportModeId: z.number().int().positive().optional(),
  travelPurposeId: z.number().int().positive().optional(),
  overnightStatus: z
    .enum(["same_day", "overnight", "unknown", "prefer_not_to_answer"])
    .optional(),
  nights: z.number().int().min(0).optional(),
  spendingRange: z
    .enum([
      "0_500",
      "501_1000",
      "1001_2000",
      "2001_5000",
      "5001_plus",
      "prefer_not_to_answer"
    ])
    .optional(),
  mainExpenseCategoryId: z.number().int().positive().optional(),
  overallScore: z.number().int().min(1).max(5).optional(),
  revisitIntention: z.boolean().optional(),
  recommendationIntention: z.boolean().optional(),
  comment: z.string().trim().max(1000).optional()
});
```

---

## 14. Attraction Admin Form Validation

## 14.1 Required Fields

```text
province_id
slug
name_th
is_active
is_published
```

Recommended:

```text
district_id
attraction_type_id
name_en
short_description_th
```

## 14.2 slug

Rules:

```text
required
unique
lowercase
URL-safe
letters numbers hyphens only
no spaces
maximum 120 characters
```

Example regex:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

## 14.3 name_th

Rules:

```text
required
maximum 255 characters
```

## 14.4 name_en

Rules:

```text
optional but recommended
maximum 255 characters
```

## 14.5 descriptions

Rules:

```text
optional
reasonable max length
```

Suggested:

```text
short_description: max 300 characters
description/history: max 5000 characters
```

## 14.6 latitude

Rules:

```text
optional
number
between -90 and 90
```

## 14.7 longitude

Rules:

```text
optional
number
between -180 and 180
```

## 14.8 publish validation

Before publishing, warn if missing:

```text
cover image
description
active check-in code
photo spot
```

Warning does not always need to block save in MVP.

---

## 15. Photo Spot Admin Validation

## 15.1 Required Fields

```text
attraction_id
spot_name_th
is_active
```

## 15.2 attraction_id

Rules:

```text
required
must exist
```

## 15.3 spot_name_th

Rules:

```text
required
maximum 255 characters
```

## 15.4 display_order

Rules:

```text
integer
minimum 0
```

## 15.5 coordinates

Same as attraction coordinates.

---

## 16. Check-in Code Admin Validation

## 16.1 Required Fields

```text
code
attraction_id
is_active
```

## 16.2 code

Rules:

```text
required
unique
URL-safe
uppercase or lowercase consistent
maximum 80 characters
```

Recommended format:

```text
YLA001
PTN001
NWT001
```

or:

```text
YLA-AIW-001
```

Allowed characters:

```text
letters
numbers
hyphen
underscore optional
```

## 16.3 attraction_id

Rules:

```text
required
must exist
```

## 16.4 photo_spot_id

Rules:

```text
optional
must exist if provided
must belong to selected attraction
```

## 16.5 starts_at and ends_at

Rules:

```text
optional
if both provided, starts_at < ends_at
```

---

## 17. Certificate Template Validation

MVP may seed templates only.

If admin template form exists:

Required:

```text
template_name
language
is_active
layout_config_json
```

Rules:

- template_name required.
- language must be supported.
- layout_config_json must be valid JSON.
- background image must be valid if provided.
- do not delete template used by certificates.

---

## 18. Stamp Definition Validation

Required:

```text
attraction_id
stamp_name_th
is_active
```

Recommended:

```text
stamp_name_en
stamp_image_path
```

Rules:

- attraction_id must exist.
- one active default stamp per attraction recommended.
- old stamp definitions should not be deleted if used by tourist_stamps.

---

## 19. Dashboard Filter Validation

Fields:

```text
start_date
end_date
province_id
attraction_id
origin_country_id
age_group
```

Rules:

```text
start_date valid date
end_date valid date
start_date <= end_date
date range should not be unreasonably large without summary tables
IDs must be integers if provided
age_group must be controlled value if provided
```

MVP default:

```text
last 30 days or current month
```

---

## 20. Export Validation

Fields:

```text
export_type
format
date range
filters
privacy_level
```

Rules:

- export_type must be allowed.
- format must be allowed.
- user must have permission.
- date range required for large exports.
- sensitive exports require stronger permission.
- export action must be logged.

Allowed MVP formats:

```text
csv
```

Allowed future:

```text
xlsx
pdf
```

---

## 21. Official Data Import Validation

If implemented:

Required:

```text
file
source_name
import_type
```

CSV row validation:

```text
province must map to existing province
year must be integer
month 1-12 or null
visitor_count non-negative
revenue_amount non-negative
source_name required
```

Do not import invalid rows silently.

---

## 22. Validation Error Message Guidelines

## 22.1 Tourist Error Tone

Use friendly and simple language.

Examples:

```text
Please enter the name you want on your certificate.
Please select where you are from.
Please choose a photo to continue.
This photo is too large.
```

Thai:

```text
กรุณากรอกชื่อที่ต้องการให้แสดงบนใบประกาศ
กรุณาเลือกว่าคุณมาจากที่ไหน
กรุณาเลือกรูปภาพเพื่อไปต่อ
รูปภาพนี้มีขนาดใหญ่เกินไป
```

## 22.2 Admin Error Tone

Use precise wording.

Examples:

```text
This slug is already used by another attraction.
This check-in code already exists.
The selected photo spot does not belong to this attraction.
```

## 22.3 Avoid Technical Jargon

Do not show:

```text
ZodError
SQLSTATE
duplicate key value violates unique constraint
foreign key violation
```

Map technical errors to user-friendly messages.

---

## 23. Field-Level vs Form-Level Errors

## 23.1 Field-Level Errors

Use for:

```text
required field
invalid format
too long
invalid range
```

## 23.2 Form-Level Errors

Use for:

```text
server unavailable
permission denied
duplicate record
business rule conflict
unexpected save failure
```

---

## 24. Double Submission Prevention

For critical actions:

```text
profile submit
photo upload
certificate generation
survey submit
admin save
export generate
```

Rules:

- disable submit during request.
- show loading state.
- use server-side idempotency where appropriate.
- handle duplicate database errors gracefully.

---

## 25. Database Constraint Mapping

Map database constraint errors to readable messages.

Examples:

```text
unique checkin_codes.code -> This check-in code already exists.
unique attractions.slug -> This slug is already used.
unique tourist_identities(provider, provider_user_id) -> This account is already linked.
unique tourist_stamps(tourist_id, attraction_id) -> You already collected this stamp.
unique satisfaction_surveys.visit_id -> Survey already submitted for this visit.
```

---

## 26. Validation Testing Checklist

Test:

```text
empty required fields
invalid origin
invalid age group
future visit date
large photo
unsupported file type
duplicate slug
duplicate check-in code
photo spot from wrong attraction
invalid satisfaction score
invalid spending range
double submit
server validation failure
database unique violation
```

---

## 27. MVP Acceptance Checklist

```text
[ ] Tourist profile form validates required fields.
[ ] Consent must be checked.
[ ] Origin validation works.
[ ] Age group uses controlled values.
[ ] Visit date validation works.
[ ] Photo upload validates type and size.
[ ] Survey validates controlled values.
[ ] Admin attraction form validates slug and required fields.
[ ] Check-in code form validates uniqueness and URL-safe code.
[ ] Dashboard filters validate date range.
[ ] Export validates permissions and filters.
[ ] Server validates all important inputs.
[ ] Database constraints protect critical rules.
[ ] Error messages are user-friendly.
```

---

## 28. Do Not Do

Do not:

```text
Trust frontend validation only.
Require unnecessary tourist fields.
Use free-text for dashboard categories.
Show raw database errors.
Allow duplicate QR/check-in codes.
Allow duplicate attraction slug.
Store invalid satisfaction scores.
Allow photo upload without server validation.
Allow survey data without visit_id.
Allow export without permission check.
```

---

## 29. Final Validation Rule

Validation should protect data quality without punishing the user.

The tourist flow should be easy.

The data saved to the database should be trustworthy.
