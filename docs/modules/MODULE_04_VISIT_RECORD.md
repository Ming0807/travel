# MODULE_04_VISIT_RECORD.md

## 1. Module Name

**Visit Record Module**

---

## 2. Module Purpose

The Visit Record Module stores each tourist visit or participation event.

This module is one of the most important modules in the platform because it connects the tourist profile to the actual tourism activity.

The visit record is the main transactional data source for dashboard analysis.

---

## 3. Business Purpose

The project must support:

1. Tourist data collection
2. Travel behavior analysis
3. Attraction visit tracking
4. Expense analysis
5. Satisfaction analysis
6. Sustainable tourism planning

The Visit Record Module supports all of these by creating structured records of who visited which attraction, when, through which QR/photo spot, and with what travel context.

---

## 4. Core Design Decision

A tourist and a visit are different entities.

Correct:

```text
tourists = tourist profile
visits = each visit or participation event
```

Incorrect:

```text
every visit creates a new tourist
```

Reason:

One tourist may visit multiple attractions.

Example:

```text
Tourist 1001
  - Visit 501: Aiyerweng Skywalk
  - Visit 502: Pattani Central Mosque
  - Visit 503: Narathat Beach
```

This structure supports repeat visit analysis, digital passport, and dashboard reporting.

---

## 5. Primary Users

## 5.1 Tourist

Tourist creates a visit record indirectly by completing the certificate flow.

## 5.2 Returning Tourist

Returning tourist creates new visit records while reusing the same tourist profile.

## 5.3 Admin

Admin can view and filter visit records.

## 5.4 Researcher or Planner

Researchers use visit records for analytics and tourism planning.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Visit creation
- Visit linked to tourist
- Visit linked to attraction
- Visit linked to photo spot if available
- Visit linked to check-in code if available
- Visit date
- Completion status
- Travel companion
- Group size
- Transport mode
- Travel purpose
- Overnight status
- Number of nights
- Admin visit list
- Dashboard visit metrics
- Repeat visit support

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Multi-destination trip records
- Route analysis
- Campaign attribution
- Visit session recovery
- Visit edit history
- Visit verification status
- Advanced duplicate detection
- GPS optional verification with consent
- Trip-level grouping

## 6.3 Out of Scope

This module does not directly handle:

- Attraction content editing
- QR code lookup
- Photo file upload
- Certificate image rendering
- Survey question configuration
- Dashboard UI rendering

It provides the core visit data used by those modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_11_REPORT_EXPORT.md
```

---

## 8. Required Data Tables

This module uses:

```text
visits
tourists
attractions
photo_spots
checkin_codes
travel_companions
transport_modes
travel_purposes
```

It is linked to:

```text
visit_photos
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
survey_answers
funnel_events
```

---

## 9. Visit Record Definition

A visit record represents one tourist participation event at one attraction.

A visit can be created when:

- tourist completes minimal profile form
- tourist starts certificate creation
- tourist uploads photo
- tourist generates certificate

Recommended MVP rule:

```text
Create visit after the minimal tourist form is submitted and attraction context is known.
```

Reason:

QR scans alone may not represent real visits.

Use `funnel_events` for early steps before visit creation.

---

## 10. Required Visit Fields

Minimum required fields:

```text
tourist_id
attraction_id
visit_date
completion_status
created_at
```

Recommended when available:

```text
photo_spot_id
checkin_code_id
visited_at
```

Optional planning fields:

```text
travel_companion_id
transport_mode_id
travel_purpose_id
group_size
overnight_status
nights
```

---

## 11. Visit Lifecycle

## 11.1 Started

The visit record may begin with:

```text
completion_status = started
```

This means the tourist started the flow but may not have completed certificate generation.

## 11.2 Minimal Form Completed

After required profile and visit date are submitted:

```text
completion_status = minimal_form_completed
```

## 11.3 Photo Uploaded

After successful photo upload:

```text
completion_status = photo_uploaded
```

## 11.4 Certificate Generated

After certificate is created:

```text
completion_status = certificate_generated
```

## 11.5 Survey Completed

After optional survey is completed:

```text
completion_status = survey_completed
```

## 11.6 Abandoned

If the flow is started but not completed after a defined period, it may be marked:

```text
completion_status = abandoned
```

MVP may not implement automatic abandonment.

---

## 12. Completion Status Values

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

- completion_status must be controlled.
- dashboard should distinguish completed visits from started/abandoned flows.
- total visits for tourism analysis should usually count meaningful records, not only QR scans.

---

## 13. Visit Creation Flow

Recommended flow:

```text
QR check-in page resolves attraction
    |
Tourist identity/profile is created or retrieved
    |
Tourist submits minimal form and visit date
    |
System creates visit record
    |
Photo upload links to visit
    |
Certificate links to visit
    |
Stamp links to visit
    |
Survey/expense/satisfaction link to visit
```

---

## 14. Visit Context from QR

The QR Check-in Module provides:

```text
checkin_code_id
attraction_id
photo_spot_id
session_id
```

The Visit Record Module must store:

```text
attraction_id
photo_spot_id
checkin_code_id
```

where available.

---

## 15. Visit Date Rules

## 15.1 Why Visit Date Exists

The teacher stated tourists may complete the flow later, such as after returning to hotel.

Therefore, visit date should be collected separately from system creation time.

Fields:

```text
visit_date = date tourist says they visited
created_at = when the record was created
visited_at = optional exact timestamp if known
```

## 15.2 Validation Rules

Recommended:

```text
visit_date is required
visit_date should not be far in the future
visit_date can be in the past
```

Suggested MVP rule:

```text
visit_date <= today + 1 day
visit_date >= today - 365 days
```

This can be adjusted.

---

## 16. Travel Behavior Fields

Travel behavior data can be collected after certificate generation.

Fields:

```text
travel_companion_id
transport_mode_id
travel_purpose_id
group_size
overnight_status
nights
```

Rules:

- optional in MVP
- structured master data should be used
- no long free-text required
- skip option should be allowed

---

## 17. Group Size Rules

Field:

```text
group_size
```

Validation:

```text
integer
>= 1
reasonable upper limit
```

Recommended MVP range:

```text
1 to 100
```

If group size is greater than 100, admin review or tour group category may be needed.

---

## 18. Overnight Rules

Field:

```text
overnight_status
```

Allowed values:

```text
same_day
overnight
unknown
prefer_not_to_answer
```

Field:

```text
nights
```

Rules:

- if same_day, nights should be 0 or null.
- if overnight, nights should be >= 1 if provided.
- nights must not be negative.
- nights is optional in MVP.

---

## 19. Repeat Visit Rules

Repeat visits must be allowed.

Example:

```text
tourist_id = 1001
attraction_id = 2001
visit_date = 2026-05-18

tourist_id = 1001
attraction_id = 2001
visit_date = 2026-06-02
```

These are two visits.

However, stamp assignment may still be one stamp per attraction.

That rule belongs to Digital Stamp Module.

---

## 20. Duplicate Visit Prevention

Double-clicks, refreshes, or retry operations can create duplicate visits.

Recommended prevention strategies:

## 20.1 Idempotency Key

Use a flow/session ID or idempotency key when creating a visit.

Possible key:

```text
session_id + tourist_id + checkin_code_id
```

## 20.2 Soft Duplicate Detection

Detect suspicious duplicates:

```text
same tourist
same attraction
same checkin_code
same visit_date
created within short time window
```

MVP can implement simple duplicate prevention by disabling submit button and using server-side checks.

## 20.3 Do Not Block Legitimate Repeat Visits

Tourists may visit same attraction again on another date.

Do not enforce unique tourist-attraction on visits.

Unique tourist-attraction belongs only to stamps.

---

## 21. Visit Relationships

A visit must link to:

```text
tourist_id
attraction_id
```

A visit may link to:

```text
photo_spot_id
checkin_code_id
travel_companion_id
transport_mode_id
travel_purpose_id
```

A visit can have related:

```text
visit_photos
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
survey_answers
funnel_events
```

---

## 22. Admin Visit List

The admin system should allow viewing visit records.

## 22.1 Required Columns

Admin list should show:

```text
visit_id
visit_date
created_at
tourist display name
origin
attraction
province
photo spot
completion_status
certificate status
survey status
```

## 22.2 Filters

Required filters:

```text
date range
province
attraction
completion_status
origin country
origin province
```

Optional filters:

```text
transport mode
travel purpose
satisfaction score
spending range
identity provider
```

## 22.3 Pagination

Admin visit list must use pagination.

Do not load all visits at once.

---

## 23. Dashboard Impact

Visit records are the base for most metrics.

## 23.1 Metrics from Visits

```text
total visits
visits by province
visits by attraction
visits by date
visits by photo spot
new vs returning visits
travel companion distribution
transport mode distribution
overnight ratio
group size average
travel purpose distribution
```

## 23.2 Important Query Rule

For visit-based dashboards, count from:

```text
visits
```

For tourist-based dashboards, count:

```text
distinct tourist_id
```

Do not confuse visits and tourists.

---

## 24. Export Impact

Visit records are included in exports.

Export should include:

```text
visit_id
visit_date
province
attraction
photo_spot
origin country/province
age group
travel companion
transport mode
travel purpose
group size
overnight status
completion status
satisfaction summary
spending range
```

Export should not include unnecessary personal identity data such as:

```text
email
LINE user ID
device token
```

unless specifically authorized.

---

## 25. API or Service Responsibilities

Recommended service functions:

```text
createVisit(input)
updateVisitCompletionStatus(visitId, status)
getVisitById(visitId)
listVisits(filters, pagination)
getVisitsByTourist(touristId)
detectPossibleDuplicateVisit(input)
attachTravelBehaviorToVisit(visitId, input)
```

---

## 26. Suggested Validation Schema

Conceptual TypeScript/Zod schema:

```ts
const createVisitSchema = z.object({
  touristId: z.number(),
  attractionId: z.number(),
  photoSpotId: z.number().optional(),
  checkinCodeId: z.number().optional(),
  visitDate: z.string(),
  sessionId: z.string().optional()
});
```

Travel behavior schema:

```ts
const travelBehaviorSchema = z.object({
  travelCompanionId: z.number().optional(),
  transportModeId: z.number().optional(),
  travelPurposeId: z.number().optional(),
  groupSize: z.number().int().min(1).max(100).optional(),
  overnightStatus: z.enum([
    "same_day",
    "overnight",
    "unknown",
    "prefer_not_to_answer"
  ]).optional(),
  nights: z.number().int().min(0).optional()
});
```

---

## 27. Error Handling

## 27.1 Missing Tourist

Message:

```text
We could not find your travel profile. Please start again.
```

## 27.2 Missing Attraction

Message:

```text
This attraction is not available.
```

## 27.3 Invalid Visit Date

Message:

```text
Please select a valid visit date.
```

## 27.4 Duplicate Submission

Message:

```text
Your visit has already been recorded.
```

## 27.5 Database Error

Message:

```text
We could not save your visit record. Please try again.
```

Do not show raw database error to tourist.

---

## 28. Security and Privacy

## 28.1 Public User Access

Tourists should only create or view their own flow data.

They should not be able to read other tourists' visits.

## 28.2 Admin Access

Only authorized users can view visit lists and exports.

## 28.3 Privacy

Visit data can be personal when linked to tourist identity.

Dashboard should use aggregated data.

Exports should avoid unnecessary identity fields.

---

## 29. Data Quality Rules

```text
visit must link to tourist
visit must link to attraction
visit date must be valid
group size must be positive
nights must not be negative
completion status must be controlled
repeat visits must be allowed
duplicate accidental submissions should be prevented
```

---

## 30. Performance Requirements

Indexes required:

```text
visits(tourist_id)
visits(attraction_id)
visits(photo_spot_id)
visits(checkin_code_id)
visits(visit_date)
visits(created_at)
visits(attraction_id, visit_date)
visits(tourist_id, visit_date)
visits(completion_status)
```

Admin list must use pagination.

Dashboard queries should use date filters.

---

## 31. Edge Cases

## 31.1 Tourist Completes Later

Allowed.

Visit date may be yesterday or earlier.

## 31.2 Tourist Opens Same QR Twice

Do not create duplicate completed visit accidentally.

## 31.3 Tourist Visits Same Attraction Again

Allowed.

Create new visit record.

## 31.4 QR Has No Photo Spot

Create attraction-level visit.

## 31.5 Photo Upload Fails After Visit Created

Keep visit with status:

```text
minimal_form_completed
```

Allow retry.

## 31.6 Certificate Generation Fails

Keep visit with status before certificate.

Allow retry.

## 31.7 Survey Skipped

Visit remains valid.

Survey status can be incomplete.

---

## 32. Example User Stories

## 32.1 Create Visit After Minimal Form

As a tourist, I want my attraction visit to be recorded after I complete the required form.

Acceptance:

```text
Given I completed profile data and consent
When I submit the form
Then a visit is created and linked to my tourist profile and attraction
```

---

## 32.2 Returning Tourist Creates New Visit

As a returning tourist, I want to visit another attraction without creating a new profile.

Acceptance:

```text
Given I am recognized as returning tourist
When I complete the flow at a new attraction
Then the system creates a new visit under my existing tourist profile
```

---

## 32.3 Admin Views Visit Records

As an admin, I want to view visit records for planning.

Acceptance:

```text
Given visits exist
When I open admin visit list
Then I can filter by date, province, and attraction
```

---

## 32.4 Dashboard Counts Visits

As a planner, I want to see visit counts by attraction.

Acceptance:

```text
Given visits exist
When dashboard loads
Then it shows visit counts by attraction
```

---

## 33. MVP Acceptance Checklist

```text
[ ] Visit table exists.
[ ] Visit links to tourist.
[ ] Visit links to attraction.
[ ] Visit links to photo spot when available.
[ ] Visit links to check-in code when available.
[ ] Visit date is stored.
[ ] Completion status is controlled.
[ ] Travel behavior fields exist or are planned.
[ ] Repeat visits are supported.
[ ] Duplicate stamp rule is not incorrectly applied to visits.
[ ] Admin can view visit list.
[ ] Dashboard can count visits.
[ ] Exports can include visit data.
[ ] Visit creation handles errors.
[ ] Visit data avoids unnecessary personal data.
```

---

## 34. Do Not Do

Do not:

```text
Create new tourist for every visit.
Prevent repeat visits to same attraction.
Apply unique(tourist_id, attraction_id) to visits.
Count QR scans as completed visits.
Create visit without attraction_id.
Store certificate fields directly only in visits.
Store photo file base64 in visits.
Store survey answers only in visits if structured tables are needed.
Expose all visit records to public users.
Load all visits in admin without pagination.
```

---

## 35. Future Enhancements

Possible future features:

```text
trip/session grouping
multi-destination visits
route analysis
campaign attribution
visit verification status
optional GPS check with consent
duplicate review queue
admin visit correction workflow
visit audit history
visitor capacity analysis
```

---

## 36. Definition of Done

This module is done when:

```text
[ ] Visit creation works.
[ ] Visit links tourist and attraction correctly.
[ ] QR context is preserved.
[ ] Repeat visits work.
[ ] Accidental duplicates are reduced.
[ ] Completion status updates through flow.
[ ] Admin can view/filter visits.
[ ] Dashboard can use visits.
[ ] Export can use visits.
[ ] Documentation and tests are updated.
```
