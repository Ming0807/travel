---
name: ux-ui-design
description: Use when designing, reviewing, or debugging UX/UI including tourist journey, QR landing, forms, consent, photo upload, certificate visual design, passport/stamp UX, survey timing, admin CMS UX, dashboard UX, responsive design, and accessibility.
---

# UX UI Design Skill

## Purpose

Use this skill when designing, reviewing, refactoring, or debugging the UX/UI of the **Southern Border Tourism Data & Intelligence Platform**.

The system depends on voluntary tourist participation. UX is not decoration. UX determines whether tourists complete the QR-to-certificate flow and whether the database collects enough useful planning data.

---

## When to Use This Skill

Use this skill for tasks involving:

```text
tourist journey
QR landing copy/layout
minimal form design
consent UX
photo upload UX
certificate visual design
digital passport/stamp UX
survey timing and wording
admin CMS UX
dashboard UX
responsive design
accessibility
loading/empty/error states
conversion improvement
trust/privacy communication
```

Use together with the frontend skill for implementation tasks.

---

## Required Context

Before UX/UI work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_FRONTEND_PROMPT.md
docs/frontend/UI_UX_PRINCIPLES.md
docs/frontend/DESIGN_SYSTEM.md
docs/frontend/FORM_UX_RULES.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/frontend/ADMIN_SIDE_PAGES.md
docs/frontend/RESPONSIVE_GUIDELINES.md
docs/frontend/ACCESSIBILITY_GUIDELINES.md
docs/business/TOURIST_INCENTIVE_STRATEGY.md
docs/business/DIGITAL_PASSPORT_STRATEGY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/testing/UX_TEST_PLAN.md
checklists/UI_UX_CHECKLIST.md
checklists/FRONTEND_CHECKLIST.md
```

For dashboard UX, also read:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## UX Mission

Design an experience that makes tourists think:

```text
This is quick.
This is safe.
This gives me something valuable.
I can finish without LINE.
I do not need to share too much personal information.
```

Design an admin experience that makes staff think:

```text
I can manage attractions and QR points without a developer.
I understand the dashboard numbers.
I can export safely.
```

---

# Core UX Strategy

---

## Reward First, Ask Respectfully

The main UX strategy:

```text
reward first
ask minimal data first
ask deeper questions after reward
make optional steps clear
make the value visible
reduce repeated data entry
```

Tourists are more likely to answer optional questions after receiving the certificate/stamp.

---

## Minimal Data Before Certificate

Before certificate, only ask for:

```text
display name
origin country/province
age group
consent
photo
```

Do not ask before certificate:

```text
LINE
email
phone
national ID
passport number
full address
exact birthdate
long survey
income
```

---

## Optional Data After Certificate

After certificate, ask optional survey data:

```text
travel companion
group size
transport mode
travel purpose
overnight status
spending range
satisfaction
revisit/recommendation
optional comment
```

Make it clear that survey is optional.

---

# Tourist UX

---

## QR Landing UX

Goal:

```text
Tourist understands the benefit within 5 seconds.
```

Must show:

```text
attraction name
location/province context
certificate/travel memory benefit
simple CTA
trust/privacy cue
language option if applicable
```

Avoid:

```text
long academic explanation
database/research-first wording
too many fields immediately
LINE-required messaging
```

Good CTA:

```text
Create My Certificate
Get My Travel Memory
สร้างใบประกาศของฉัน
รับบัตรที่ระลึก
```

Bad CTA:

```text
Submit Data
Register Information
Fill Database Form
```

---

## QR Landing Layout

Recommended hierarchy:

```text
1. Hero/attraction identity
2. Reward message
3. Main CTA
4. Short trust/privacy note
5. Attraction details
6. Optional how it works
```

Do not put long content above the CTA.

---

## Minimal Form UX

Principles:

```text
short
clear
low-pressure
mobile-friendly
privacy-aware
```

Recommended labels:

```text
Display name / ชื่อที่ต้องการแสดงบนใบประกาศ
Where are you from? / คุณมาจากที่ไหน
Age group / ช่วงอายุ
Consent / ยินยอมให้ใช้ข้อมูลเพื่อออกใบประกาศและวิเคราะห์ภาพรวม
```

Helper text:

```text
Used only for certificate and aggregated tourism planning.
```

Thai:

```text
ใช้เพื่อออกใบประกาศและวิเคราะห์ภาพรวมการท่องเที่ยวเท่านั้น
```

---

## Consent UX

Consent must be:

```text
visible
short
clear
not pre-checked
linked to privacy notice
purpose-specific
```

Consent should explain:

```text
certificate generation
aggregated tourism planning
photo use
optional survey
optional LINE/email linking if used
```

Do not mix marketing consent with required certificate/data collection consent.

---

## Photo Upload UX

The upload step should feel simple.

Must include:

```text
clear upload button
accepted formats
max size
preview
loading/progress
retry/re-upload
friendly errors
photo purpose explanation
```

Friendly error examples:

```text
This photo is too large. Please upload a smaller image.
This file type is not supported. Please use JPG, PNG, or WebP.
```

Avoid raw errors:

```text
413 Payload Too Large
Unsupported MIME
StorageError
```

---

## Certificate UX

Certificate should feel like a reward.

It should be:

```text
visually polished
mobile previewable
downloadable
shareable by user choice
clearly tied to attraction
personal but privacy-safe
```

Certificate can show:

```text
display name
photo
attraction name
visit date
province/place identity
```

Certificate must not show:

```text
email
LINE ID
internal tourist ID
phone
national ID
full address
```

---

## Certificate Success UX

After generation:

```text
celebrate success
show download button clearly
show stamp earned
show passport progress
invite optional survey
let user finish immediately
```

Good flow:

```text
Certificate generated -> Download -> Stamp earned -> Optional survey
```

Bad flow:

```text
Certificate generated -> Mandatory survey -> Hidden download
```

---

## Digital Stamp / Passport UX

Passport should motivate repeat visits.

UX goals:

```text
show progress
make stamps visually attractive
encourage visiting more attractions
explain guest limitation
offer optional save/linking
support non-LINE users
```

Empty state should be encouraging, not blank.

Example:

```text
You have not collected any stamps yet. Scan a QR code at a participating attraction to start your journey.
```

---

## Survey UX

Survey should:

```text
appear after reward
be optional
take 1-2 minutes
use simple questions
use ranges instead of exact amounts
avoid sensitive questions
show progress if multi-step
allow skip
```

Good survey prompt:

```text
Help improve tourism in this area. This takes about 1 minute and is optional.
```

Thai:

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ ใช้เวลาประมาณ 1 นาที และสามารถข้ามได้
```

---

## Returning Tourist UX

Returning tourist flow should:

```text
reuse existing profile
reduce repeated fields
show known name if appropriate
allow quick check-in at new attraction
show new stamp opportunity
handle already-earned stamp gracefully
```

Avoid showing duplicate errors to user.

Use friendly message:

```text
You already earned this stamp. This visit has still been recorded.
```

---

## Foreign / Non-LINE Tourist UX

Must support:

```text
English language
guest flow
origin country selection
certificate without LINE
survey without LINE
passport limitation explanation
```

Do not assume all tourists have LINE.

---

# Admin UX

---

## Admin Navigation UX

Admin should understand where to go:

```text
Dashboard
Attractions
Photo Spots
Check-in Codes
Visits
Surveys
Reports/Exports
Users/Roles
Settings
```

Navigation should be permission-aware.

---

## Admin CMS UX

Admin CMS must be:

```text
structured
searchable
filterable
clear about publish/active state
safe for destructive actions
validated
not developer-dependent
```

Admin should be able to:

```text
create attraction
add photo spot
create QR/check-in code
copy/test QR link
deactivate QR code
view dashboard
export report
```

---

## Admin Form UX

Forms should include:

```text
clear labels
field grouping
required markers
helper text
validation errors near fields
save loading state
success confirmation
cancel/back actions
destructive action confirmation
```

Do not show raw database errors.

---

## QR Admin UX

QR/check-in admin UI should make it obvious:

```text
which attraction the QR belongs to
which photo spot it belongs to
whether it is active
whether it is expired
what public URL it opens
how to copy/download/test it
```

---

# Dashboard UX

---

## Dashboard Clarity

Dashboard must be understandable to planners and instructors.

Must include:

```text
clear title
global filters
data freshness
metric definitions
tooltips
limitations
response counts
No data states
export access
```

---

## Dashboard Label Rules

Use accurate labels:

```text
Tourist Profiles
Total Visits
QR Scans
Certificates Generated
Estimated Spending
Average Satisfaction
Survey Completion Rate
```

Avoid misleading labels:

```text
Verified Tourists
Official Arrivals
Revenue
Total Population
```

---

## Dashboard No Data Rules

UX must distinguish:

```text
0 = real zero
No data = missing/no response
Not enough data = sample too small
```

Do not show fake 0 for missing satisfaction.

---

## Dashboard Planning UX

Insight cards should include:

```text
finding
evidence
suggested action
confidence/limitation
```

Example:

```text
Promotion opportunity
This attraction has low visits but high satisfaction from 24 responses.
Consider featuring it in campaign content.
```

---

# Visual Design

---

## Visual Tone

The design should feel:

```text
premium
warm
local tourism-oriented
trustworthy
clean
modern
not overly government-bureaucratic
not childish
```

Use visual identity from:

```text
southern border tourism
nature/culture/heritage
certificate/passport concept
professional dashboard systems
```

---

## Layout Principles

Use:

```text
clear hierarchy
large CTA
short text blocks
cards
consistent spacing
responsive grids
sticky mobile CTA where useful
readable typography
```

Avoid:

```text
crowded forms
tiny text
too many colors
too many modals
unstructured tables
hidden primary actions
```

---

## Color and Typography

Recommended:

```text
calm trustworthy base colors
accent color for CTA/reward
consistent semantic colors
Thai-readable font
limited font weights
```

Fonts may include:

```text
Prompt
Sarabun
Inter
```

Do not load too many fonts/weights.

---

# Accessibility

---

## Basic Accessibility

Must include:

```text
input labels
clear button text
visible focus states
keyboard navigation where possible
adequate contrast
error messages
alt text for meaningful images
not color-only meaning
```

---

## Mobile Accessibility

Ensure:

```text
touch targets large enough
text readable
forms not cramped
sticky buttons not covering content
dialogs fit small screens
certificate preview scrollable if needed
```

Recommended touch target:

```text
44px height
```

---

## Dashboard Accessibility

Dashboard should include:

```text
chart titles
readable labels
table/text alternative for important chart data
not color-only classification
accessible filter controls
```

---

# Loading, Empty, Error States

---

## Loading States

Required for:

```text
QR landing
profile submit
photo upload
certificate generation
survey submit
passport loading
admin lists
dashboard sections
export generation
```

Loading state should tell the user what is happening.

---

## Empty States

Required for:

```text
no attractions
no passport stamps
no survey responses
no dashboard data
no export rows
no admin records
```

Empty state should suggest next action.

---

## Error States

Errors should be:

```text
friendly
actionable
safe
non-technical
localized where needed
```

Do not show:

```text
stack trace
SQL query
Supabase raw error
storage path
service key
```

---

# UX Testing

---

## Tourist UX Test

Ask tester to complete:

```text
scan QR
understand landing
fill minimal profile
understand consent
upload photo
generate certificate
download certificate
see stamp
decide whether to answer survey
```

Observe:

```text
time to understand benefit
confusion points
field hesitation
privacy concern
photo upload difficulty
certificate satisfaction
survey willingness
```

---

## Admin UX Test

Ask tester to:

```text
log in
create attraction
add photo spot
create QR code
test QR link
view dashboard
export report
```

Observe:

```text
navigation confusion
status confusion
form errors
QR workflow clarity
dashboard interpretation
export confidence
```

---

## Dashboard Interpretation Test

Ask:

```text
What is the difference between QR scans and visits?
What does Tourist Profiles mean?
What does Estimated Spending mean?
Why is satisfaction No data?
Which attraction should be promoted?
Which attraction needs improvement?
```

Dashboard UX passes if tester does not misinterpret key metrics.

---

# UX Review Checklist

Before accepting UX/UI work:

```text
[ ] QR landing benefit clear within 5 seconds.
[ ] Tourist flow works on mobile.
[ ] Minimal form is short.
[ ] Consent is clear and not pre-checked.
[ ] LINE/email/phone not required.
[ ] Photo upload is understandable.
[ ] Certificate looks rewarding.
[ ] Download is visible.
[ ] Survey is optional after reward.
[ ] Guest/non-LINE flow works.
[ ] Returning tourist flow reduces repetition.
[ ] Admin can create QR without developer.
[ ] Dashboard labels are not misleading.
[ ] Loading/empty/error states exist.
[ ] Accessibility basics included.
```

---

## Critical UX Blockers

Block if:

```text
QR page does not explain value
tourist cannot complete on mobile
LINE required for all users
email/phone/national ID required before certificate
survey blocks certificate
consent missing or pre-checked
photo upload has no retry/error
certificate download hidden
dashboard labels are misleading
admin cannot create/test QR
```

---

# UX Output Format

When completing UX/UI work, respond:

```text
Summary
- ...

UX decisions
- ...

Files changed
- ...

Mobile/accessibility notes
- ...

Privacy/trust notes
- ...

Validation
- tests/manual checks

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

UX should make tourists feel rewarded, respected, and safe.

The best data collection strategy is a low-friction experience that gives value before asking for more information.
