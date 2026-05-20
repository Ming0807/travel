---
name: digital-passport-stamp
description: Use when building, reviewing, or debugging digital stamp and tourist passport features including stamp definitions, stamp award logic, duplicate prevention, passport page, guest passport, and returning tourist flow.
---

# Digital Passport Stamp Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging the **digital stamp and tourist passport** features for the Southern Border Tourism Data & Intelligence Platform.

The digital passport/stamp feature is a tourist incentive. It encourages tourists to visit multiple attractions, return to the platform, and optionally save their participation history.

It must be:

```text
low-friction
privacy-safe
guest-friendly
LINE-optional
duplicate-safe
mobile-first
connected to certificate generation
useful for repeat-visit analytics
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
stamp definitions
stamp award logic
tourist_stamps table
passport page
guest passport
returning tourist flow
LINE/email optional passport save
stamp duplicate prevention
stamp UI
passport analytics
repeat visit handling
stamp-related tests
```

Use together with these skills when relevant:

```text
certificate-rendering
backend-api
frontend-nextjs-pwa
ux-ui-design
database-design
pdpa-security
testing-qa
```

---

## Required Context

Before passport/stamp work, read:

```text
CODEX_MAIN_PROMPT.md
docs/modules/MODULE_07_DIGITAL_STAMP_PASSPORT.md
docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
docs/business/DIGITAL_PASSPORT_STRATEGY.md
docs/business/TOURIST_INCENTIVE_STRATEGY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/database/DATABASE_REQUIREMENTS.md
docs/database/DATA_DICTIONARY.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/backend/API_ENDPOINTS.md
checklists/UI_UX_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

---

## Passport/Stamp Mission

The mission is:

```text
Encourage tourists to complete the certificate flow and visit more attractions without forcing login or collecting unnecessary personal data.
```

The passport should make tourists feel:

```text
I collected something.
I can continue my journey.
I do not need LINE to start.
I can save/link later if I want.
I do not need to fill the same information again.
```

---

# Core Product Rules

---

## Reward Timing

Award stamp after:

```text
certificate generation
```

Do not require survey before awarding stamp.

Do not require LINE before awarding stamp.

The certificate and stamp are the reward; the survey is optional afterward.

---

## Guest First, Link Later

The core flow must work for:

```text
Thai tourists with LINE
Thai tourists without LINE
foreign tourists without LINE
guest browser/device users
```

Optional linking may be added after reward:

```text
Save passport with LINE
Save passport with email future
```

But it must never block the core certificate/stamp flow.

---

## Repeat Visit and Duplicate Stamp Rule

Important distinction:

```text
Repeat visits are allowed.
Duplicate stamps for the same tourist-attraction are not allowed.
```

A tourist may visit the same attraction multiple times, but should normally receive only one stamp for that attraction.

---

# Database Model

---

## Required Tables

Recommended tables:

```text
stamp_definitions
tourist_stamps
tourists
tourist_identities
visits
certificates
```

---

## Stamp Definitions

Purpose:

```text
Define available stamps for attractions.
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
badge_color
display_order
is_active
created_at
updated_at
```

Rules:

```text
stamp definition belongs to attraction
only active stamp definitions should be awarded
stamp asset should be public-safe
stamp design should not contain personal data
```

---

## Tourist Stamps

Purpose:

```text
Record stamps earned by tourists.
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

Required constraint:

```text
unique(tourist_id, attraction_id)
```

Relationships:

```text
tourist_id -> tourists.tourist_id
attraction_id -> attractions.attraction_id
stamp_definition_id -> stamp_definitions.stamp_definition_id
source_visit_id -> visits.visit_id
```

---

## Stamp Duplicate Handling

If stamp already exists:

```text
return already_earned state
do not throw a user-facing fatal error
do not create duplicate stamp
do not block certificate download
```

Backend may return:

```text
earned_new_stamp: false
stamp_status: already_earned
```

---

## Visit Relationship

Stamp should store:

```text
source_visit_id
```

This lets the system know which visit earned the stamp, while still allowing repeat visits.

Do not make visits unique by tourist-attraction.

---

# Backend Logic

---

## Stamp Award Service

Recommended service:

```text
StampService.awardStampForVisit(visitId, touristId)
```

Responsibilities:

```text
verify visit belongs to tourist
find active stamp definition for attraction
check existing tourist_stamp
insert stamp if not exists
handle unique conflict safely
return earned/already-earned/no-stamp-definition result
```

---

## Stamp Award Result

Recommended result:

```ts
type StampAwardResult =
  | { status: "earned"; stamp: TouristStamp }
  | { status: "already_earned"; stamp: TouristStamp }
  | { status: "no_active_stamp_definition" };
```

Do not treat `already_earned` as a fatal error for the tourist.

---

## Certificate Integration

After certificate generation:

```text
certificate generated successfully
visit status updated
stamp award attempted
certificate success returned with stamp status
```

Important:

```text
Certificate must remain downloadable even if stamp already existed.
```

If stamp definition is missing:

```text
certificate still succeeds
return no_active_stamp_definition status
log/admin warn if needed
```

---

## Passport Service

Recommended service:

```text
PassportService.getPassportForTourist(touristId)
```

Responsibilities:

```text
verify tourist identity
fetch earned stamps
join safe attraction/stamp definition data
sort by earned_at or display order
return privacy-safe response
handle empty passport
```

Do not return:

```text
provider_user_id
guest token
email
LINE ID
private certificate paths
private photo paths
```

---

## Returning Tourist Logic

If guest identity exists:

```text
reuse tourist profile
show existing passport/stamps
avoid asking all fields again
allow new attraction flow
```

If optional LINE/email linking is used:

```text
link after consent
merge carefully if needed
avoid duplicate profiles if possible
do not expose provider_user_id
```

---

# Frontend UX

---

## Passport Page

Passport page should show:

```text
earned stamps
attraction names
province/district if useful
earned date
empty state
collect more CTA
optional save/link CTA
```

It should work on mobile.

---

## Stamp Earned State

After certificate:

```text
show visual stamp earned animation or card
show attraction stamp
show passport progress
show collect more CTA
show optional survey CTA
```

Example text:

```text
You earned a new stamp!
```

Thai:

```text
คุณได้รับตราประทับใหม่แล้ว!
```

---

## Already Earned State

If duplicate stamp:

```text
show friendly message
do not show scary error
still allow certificate download
```

Example:

```text
You already collected this stamp. This visit has still been recorded.
```

Thai:

```text
คุณเคยได้รับตราประทับของสถานที่นี้แล้ว ระบบยังบันทึกการเยี่ยมชมครั้งนี้ไว้
```

---

## Empty Passport State

Example:

```text
You have not collected any stamps yet. Scan a QR code at a participating attraction to start your journey.
```

Thai:

```text
คุณยังไม่มีตราประทับ ลองสแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อเริ่มสะสมได้เลย
```

---

## Guest Passport Limitation

Explain:

```text
Your passport is saved on this browser/device. To keep it across devices, you may optionally link it later.
```

Thai:

```text
พาสปอร์ตนี้จะจดจำบนเบราว์เซอร์/อุปกรณ์นี้ หากต้องการใช้งานข้ามอุปกรณ์ สามารถเลือกเชื่อมบัญชีภายหลังได้
```

Do not force linking.

---

# Optional LINE / Email Linking

---

## Optional Linking Rules

LINE/email linking can be offered:

```text
after certificate
from passport page
as optional save feature
```

Do not offer it as a required step before certificate.

---

## Consent for Linking

If linking is implemented:

```text
show separate consent/explanation
verify LINE token server-side
do not trust frontend-provided LINE user ID alone
store provider_user_id securely
do not expose it in dashboard/export
```

---

## Merge Rules

If a guest passport is linked to LINE/email:

```text
preserve earned stamps
prevent duplicate stamps
avoid duplicate tourist profile where possible
audit or log merge if sensitive
```

If merging is complex, document it as a future improvement.

---

# Privacy Rules

---

## Passport Response Must Not Expose

```text
email
LINE user ID
provider_user_id
guest token
device token
private photo path
private certificate path
raw survey comments
```

Passport response may include:

```text
stamp image
stamp name
attraction name
province
earned date
certificate count summary if safe
```

---

## Dashboard Privacy

Stamp dashboard metrics must be aggregated.

Allowed:

```text
total stamps earned
stamps by attraction
stamps by province
returning profile counts
passport save rate
```

Not allowed:

```text
list of identifiable tourists
provider_user_id
guest tokens
private certificate/photo URLs
```

---

# Dashboard and Analytics

---

## Stamp Metrics

Possible metrics:

```text
total stamps earned
stamps earned by attraction
stamps earned by province
stamp earning rate after certificate
repeat visit rate
passport save rate
multi-attraction tourist profile count
```

Important labels:

```text
Tourist profiles, not verified unique people
Passport saved, not confirmed identity unless identity linking exists
```

---

## Repeat Visit Analytics

Repeat visit should be calculated from:

```text
visits
```

not from duplicate stamps.

A tourist can have:

```text
many visits
one stamp per attraction
```

---

# Security Rules

---

## Backend Ownership

Passport access requires:

```text
valid guest/session identity or linked identity
resolved tourist_id
server-side ownership check
```

Do not trust:

```text
tourist_id from browser
stamp_id from URL
provider_user_id from frontend
```

---

## Storage Rules for Stamp Assets

Stamp assets should be safe public media.

Bucket:

```text
stamp-assets
```

Access:

```text
public read / admin write
```

Stamp assets must not contain personal data.

---

# Error Handling

---

## Safe User Messages

Use friendly messages:

```text
We could not load your passport. Please try again.
This stamp has already been collected.
Your certificate is ready, but we could not update the stamp right now.
```

Do not show:

```text
SQL errors
stack traces
provider_user_id
guest token
storage path
```

---

## Error Codes

Recommended:

```text
PASSPORT_NOT_FOUND
PASSPORT_ACCESS_DENIED
STAMP_ALREADY_EARNED
STAMP_DEFINITION_NOT_FOUND
STAMP_AWARD_FAILED
TOURIST_IDENTITY_NOT_FOUND
```

---

# Testing

---

## Unit Tests

Test:

```text
stamp duplicate decision
stamp award result mapping
passport response mapping
privacy field exclusion
guest limitation messaging helper if implemented
```

---

## Integration Tests

Test:

```text
stamp awarded after certificate
duplicate stamp prevented
repeat visit allowed
passport returns own stamps
passport excludes provider_user_id
no active stamp definition handled
guest passport works
wrong tourist access rejected
```

---

## E2E Tests

Test:

```text
certificate success shows stamp earned
passport page shows earned stamp
same attraction repeat shows already-earned
second attraction earns new stamp
non-LINE guest flow works
optional save/link does not block flow
```

---

# Review Checklist

Before accepting passport/stamp work:

```text
[ ] Stamp awarded after certificate.
[ ] Survey not required.
[ ] LINE not required.
[ ] Repeat visits allowed.
[ ] Duplicate stamp prevented.
[ ] Already-earned state friendly.
[ ] Passport shows only current tourist's stamps.
[ ] Passport excludes provider_user_id/guest token.
[ ] Guest passport works.
[ ] Optional linking is optional.
[ ] Stamp assets are public-safe.
[ ] Tests or manual QA exist.
```

---

## Critical Blockers

Block if:

```text
LINE required to earn stamp
survey required to earn stamp
duplicate stamps possible without control
repeat visits blocked
passport exposes provider_user_id
tourist can view another tourist's passport
certificate download blocked by stamp issue
stamp award failure breaks certificate unnecessarily
```

---

# Task Prompt Template

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Build/fix/refactor digital passport or stamp feature.]

Context:
Digital stamps encourage repeat visits and make the certificate flow more valuable. They must work for guest and non-LINE tourists.

Read first:
- .codex/skills/digital-passport-stamp/SKILL.md
- docs/modules/MODULE_07_DIGITAL_STAMP_PASSPORT.md
- docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/UI_UX_CHECKLIST.md
- checklists/BACKEND_CHECKLIST.md

Requirements:
- [specific requirements]
- Ensure repeat visits are allowed.
- Prevent duplicate stamps.
- Do not require LINE.
- Do not require survey.
- Keep passport response privacy-safe.
- Add tests where practical.

Do not:
- Do not expose provider_user_id or guest token.
- Do not block certificate download.
- Do not treat already-earned as fatal.
- Do not trust tourist_id from client.

Completion response:
Summary
Files changed
Validation
Passport/stamp behavior notes
Privacy/security notes
Risks / Notes
Next suggested task
```

---

# Output Format

When completing passport/stamp work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

Passport/stamp behavior notes
- award
- duplicate handling
- repeat visit
- passport access

Privacy/security notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

The digital passport must motivate repeat tourism without forcing identity linking.

Guest-first, link-later is the correct strategy.
