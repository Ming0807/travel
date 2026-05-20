---
name: certificate-rendering
description: Use when building, reviewing, or debugging certificate preview, generation, storage, download, and related stamp/passport reward behavior including idempotency, privacy, and mobile rendering.
---

# Certificate Rendering Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging certificate preview, certificate generation, certificate storage, certificate download, and related stamp/passport reward behavior for the **Southern Border Tourism Data & Intelligence Platform**.

The certificate is the main tourist incentive. It is the reason many tourists will agree to complete the minimal profile and upload a photo.

The certificate flow must be:

```text
rewarding
fast
mobile-friendly
privacy-safe
idempotent
downloadable
linked to visit data
connected to stamp/passport
not blocked by survey
not dependent on LINE
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
certificate template design
certificate preview component
html-to-image / canvas rendering
server-side certificate rendering
certificate generation API
certificate storage
certificate download
certificate idempotency
stamp award after certificate
certificate success page
certificate privacy review
certificate rendering tests
```

Use together with:

```text
frontend-nextjs-pwa
backend-api
supabase-postgresql
ux-ui-design
pdpa-security
testing-qa
```

as needed.

---

## Required Context

Before certificate work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_FRONTEND_PROMPT.md
prompts/CODEX_BACKEND_PROMPT.md
docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/business/TOURIST_INCENTIVE_STRATEGY.md
docs/business/DIGITAL_PASSPORT_STRATEGY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/backend/FILE_UPLOAD_FLOW.md
checklists/UI_UX_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PERFORMANCE_CHECKLIST.md
```

---

## Certificate Mission

The certificate must make tourists feel:

```text
I received something valuable.
This was worth my time.
I can save this memory.
I am comfortable with the data I gave.
I can continue without LINE or survey.
```

The certificate is both a reward and a data collection conversion tool.

---

# Certificate Flow

---

## Required Flow

Recommended flow:

```text
1. Tourist scans QR.
2. Tourist fills minimal profile and consent.
3. Visit is created.
4. Tourist uploads photo.
5. Certificate preview appears.
6. Tourist generates certificate.
7. Certificate file is stored.
8. Certificate record is created.
9. Visit status is updated.
10. Stamp is awarded.
11. Tourist downloads certificate.
12. Optional survey is shown after reward.
```

Survey must not block certificate download.

LINE must not be required.

---

## Required Certificate Data

Certificate may include:

```text
tourist display name
tourist uploaded photo
attraction name
province/location
visit date
certificate title
project/brand mark
optional QR/public verification code if designed
```

Certificate must not include:

```text
email
LINE ID
provider_user_id
guest token
internal tourist_id
internal visit_id unless encoded safely for verification
phone
national ID
passport number
full address
exact birthdate
```

---

# Certificate UX

---

## Preview Requirements

Preview must:

```text
look professional
work on mobile
show uploaded photo
show display name
show attraction name
show visit date
handle long names
load fonts correctly
show loading state
allow safe retry/re-upload if needed
```

---

## Success Page Requirements

Success page must:

```text
show positive success message
show certificate result/preview
show download button clearly
show stamp earned or already-earned
show optional survey CTA
allow finish without survey
allow finish without LINE
explain passport/save option if implemented
```

Do not hide the download button behind survey completion.

---

## Visual Design Guidelines

Certificate should feel:

```text
premium
local tourism-oriented
warm
memorable
shareable
institutional enough for university/government context
```

Use:

```text
clear title
clean photo frame
attraction identity
date
subtle decorative elements
readable typography
safe margins
```

Avoid:

```text
crowded layout
tiny text
too many colors
overly childish graphics
raw database-looking text
private identifiers
```

---

## Mobile Design Rules

Certificate page must:

```text
fit mobile viewport
allow preview scroll/zoom if needed
keep generate/download buttons visible
avoid horizontal overflow
not freeze during rendering
show progress/loading feedback
```

---

# Rendering Strategy

---

## MVP Rendering Options

Option A: Frontend rendering

```text
React certificate component
html-to-image or canvas export
upload generated file to backend/storage
```

Good for MVP speed and visual iteration.

Risks:

```text
font loading issues
mobile rendering performance
large image memory
browser differences
```

Option B: Server-side rendering

```text
server renders image/PDF
more consistent
requires more backend setup
```

Good for future production hardening.

MVP can use frontend rendering if privacy/storage and idempotency are handled correctly.

---

## Frontend Rendering Rules

If using frontend rendering:

```text
preload required fonts/assets
wait for image load
wait for font load if possible
use reasonable output dimensions
avoid huge canvas
show loading during render
prevent double click
send file/blob safely to backend
do not store base64 in database
```

Do not keep huge base64 strings in state longer than needed.

---

## Server-Side Rendering Rules

If using server-side rendering:

```text
verify ownership before render
fetch only required data
generate privacy-safe certificate
store file in private/controlled bucket
create certificate record atomically where possible
return safe access/download info
```

Server rendering should still be idempotent.

---

# Backend Rules

---

## Certificate Generation API

Must:

```text
verify tourist ownership of visit
verify visit exists
verify uploaded photo belongs to visit
verify certificate template active
check if generated certificate already exists
generate or accept rendered file safely
store certificate file
create certificate record
update visit completion status
award stamp
record funnel event if implemented
return safe response
```

---

## Idempotency

Certificate generation must be idempotent.

Rules:

```text
double click must not create duplicate certificate
retry after network error should return existing certificate if already generated
one active/generated certificate per visit is recommended
duplicate generation should be handled as existing/success, not crash
```

Database support:

```text
unique active/generated certificate per visit
or service-level transaction/check
```

---

## Stamp Award

After certificate generation:

```text
award stamp if active stamp definition exists
one tourist can earn one stamp per attraction
duplicate stamp should be handled gracefully
stamp award failure should be reported safely
already-earned stamp is not a fatal tourist error
```

Important:

```text
Repeat visits are allowed.
Duplicate stamps are not.
```

---

## Visit Status Update

Certificate generation should update visit flow status.

Possible statuses:

```text
started
profile_completed
photo_uploaded
certificate_generated
survey_completed
```

Status naming must match database docs.

Do not overwrite historical data incorrectly.

---

# Storage Rules

---

## Certificate File Storage

Store certificate files in:

```text
certificate-files
```

or the configured private/controlled certificate bucket.

Rules:

```text
bucket should not be public by default
path generated server-side
path contains no personal data
signed URL generated only when needed
signed URL short-lived
signed URL not stored permanently
```

Good path examples:

```text
certificates/2026/05/{visit_id}/{certificate_id}.png
certificates/2026/05/{certificate_id}.png
```

Avoid:

```text
certificates/Amin Kangfu.jpg
certificates/line-Uxxxx.png
certificates/email@example.com.png
```

---

## Certificate Metadata

Store metadata like:

```text
certificate_id
visit_id
certificate_template_id
storage_bucket
storage_path
status
generated_at
download_count
created_at
updated_at
```

Do not store:

```text
base64 image data
permanent signed URL
private token
```

---

# Privacy Rules

---

## Certificate Content Privacy

Certificate can be personal but must be privacy-safe.

Allowed:

```text
display name
photo
attraction
visit date
certificate title
project branding
```

Forbidden:

```text
email
LINE ID
provider_user_id
guest token
internal tourist id
phone
national ID
passport number
full address
exact birthdate
```

---

## Public Sharing

If public sharing is implemented later:

```text
sharing must be user-initiated
sharing token must be random
sharing can be revoked if designed
shared page must not expose private metadata
```

Do not make all certificates public by default.

---

# Performance Rules

---

## Rendering Performance

Must:

```text
show loading state immediately
avoid huge canvas dimensions
compress/size output reasonably
avoid unnecessary rerenders
avoid storing huge base64 strings
handle mobile browser limitations
allow retry
```

Target:

```text
preview within a few seconds
generation gives immediate feedback
```

---

## Asset Performance

Optimize:

```text
certificate background
stamp asset
logo/branding
fonts
uploaded photo preview
```

Avoid:

```text
giant uncompressed template images
too many font weights
remote assets that may not load during render
```

---

# Error Handling

---

## User-Facing Errors

Use friendly messages:

```text
We could not generate your certificate. Please try again.
Your photo is still uploading. Please wait a moment.
This certificate has already been generated. You can download it below.
```

Do not show:

```text
stack trace
Supabase error
SQL error
storage path
service key
```

---

## Known Error Codes

Recommended:

```text
CERTIFICATE_TEMPLATE_NOT_FOUND
CERTIFICATE_PHOTO_REQUIRED
CERTIFICATE_ALREADY_EXISTS
CERTIFICATE_RENDER_FAILED
CERTIFICATE_UPLOAD_FAILED
VISIT_NOT_FOUND
VISIT_ACCESS_DENIED
STAMP_ALREADY_EARNED
STORAGE_UPLOAD_FAILED
```

---

# Testing Rules

---

## Unit Tests

Test:

```text
certificate display data mapping
long display name handling helper
certificate file path generation
idempotency decision logic
stamp already-earned handling
privacy field exclusion
```

---

## Integration Tests

Test:

```text
valid certificate generation
certificate record creation
certificate file storage metadata
visit status update
stamp award
duplicate generation returns existing or safe success
missing photo rejected
wrong tourist ownership rejected
private identifiers excluded
```

---

## E2E Tests

Test:

```text
tourist uploads photo
preview appears
generate button works
download button visible
stamp earned shown
survey optional CTA shown
survey not required
mobile viewport
```

---

## Visual/Manual QA

Check:

```text
Thai text rendering
English text rendering
long names
different attraction names
mobile layout
download file opens
photo crop acceptable
certificate not blurry
```

---

# Certificate Review Checklist

Before accepting certificate work:

```text
[ ] Certificate preview works.
[ ] Certificate generation works.
[ ] Certificate download works.
[ ] Duplicate click does not duplicate records.
[ ] Uploaded photo belongs to visit.
[ ] Tourist ownership checked.
[ ] Certificate file stored private/controlled.
[ ] Certificate path contains no personal data.
[ ] Certificate excludes email/LINE/internal ID.
[ ] Stamp awarded or already-earned handled.
[ ] Survey is optional after certificate.
[ ] LINE not required.
[ ] Loading/error/retry states exist.
[ ] Mobile layout works.
[ ] Tests or manual QA evidence exists.
```

---

## Critical Certificate Blockers

Block if:

```text
certificate download requires survey
LINE required before certificate
email/phone/national ID required before certificate
certificate includes private identifiers
certificate bucket public unintentionally
duplicate generation creates duplicate certificates
tourist can generate certificate for another tourist's visit
photo ownership not checked
base64 stored in database
signed URL stored permanently
```

---

# Certificate Task Prompt

Use this prompt for certificate work:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Build/fix/refactor certificate feature.]

Context:
The certificate is the main incentive for tourist data collection. It must be rewarding, privacy-safe, idempotent, and mobile-friendly.

Read first:
- CODEX_MAIN_PROMPT.md
- .codex/skills/certificate-rendering/SKILL.md
- docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
- docs/backend/CERTIFICATE_RENDERING_FLOW.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/security/IMAGE_UPLOAD_SECURITY.md
- checklists/UI_UX_CHECKLIST.md
- checklists/BACKEND_CHECKLIST.md

Requirements:
- [specific certificate requirements]
- Verify visit ownership.
- Use uploaded photo tied to visit.
- Generate/store certificate safely.
- Prevent duplicate generation.
- Award stamp.
- Show/download certificate.
- Show optional survey CTA after reward.

Privacy:
- Do not include email, LINE ID, internal IDs, phone, national ID, full address.
- Do not make certificate public by default.
- Do not store signed URLs permanently.

Testing:
- Add relevant tests or manual QA notes.
- Run validation commands if available.

Do not:
- Do not require survey before download.
- Do not require LINE.
- Do not store base64 in DB.
- Do not expose private storage paths.

Completion response:
Summary
Files changed
Validation
Certificate behavior notes
Privacy/security notes
Risks / Notes
Next suggested task
```

---

# Output Format

When completing certificate work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

Certificate behavior notes
- preview
- generation
- storage
- idempotency
- stamp
- download

Privacy/security notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

The certificate is the reward that makes the data collection strategy work.

If certificate generation is slow, broken, unsafe, or blocked by survey/LINE, the entire tourist data collection flow fails.
