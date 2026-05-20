---
name: line-liff-integration
description: Use when building, reviewing, or debugging optional LINE LIFF integration including LINE login/linking, ID token verification, optional passport save, LINE consent, LINE browser behavior, and non-LINE fallback flows.
---

# LINE LIFF Integration Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging optional LINE LIFF integration for the **Southern Border Tourism Data & Intelligence Platform**.

LINE can improve returning-user experience and digital passport persistence for Thai tourists, but LINE must never be required for the core tourist flow.

The system must support:

```text
tourists with LINE
tourists without LINE
foreign tourists without LINE
guest browser/device users
```

The correct strategy is:

```text
guest-first, link-later
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
LINE LIFF setup
LINE login/linking
LINE ID token verification
LINE user identity storage
optional passport save with LINE
LINE consent
LINE browser behavior
LINE webhook future
LINE-related security/privacy review
non-LINE fallback
foreign tourist flow
```

Use together with:

```text
digital-passport-stamp
backend-api
frontend-nextjs-pwa
pdpa-security
supabase-postgresql
testing-qa
```

when the task touches passport, backend, security, storage, or testing.

---

## Required Context

Before LINE LIFF work, read:

```text
CODEX_MAIN_PROMPT.md
docs/modules/MODULE_12_LINE_LIFF_OPTIONAL.md
docs/business/DIGITAL_PASSPORT_STRATEGY.md
docs/business/TOURIST_INCENTIVE_STRATEGY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/SECURITY_REQUIREMENTS.md
docs/modules/MODULE_07_DIGITAL_STAMP_PASSPORT.md
docs/frontend/PWA_REQUIREMENTS.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/backend/API_ENDPOINTS.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

---

## LINE Integration Mission

The mission is:

```text
Use LINE only as an optional convenience for saving passport identity and improving repeat visits, without blocking tourists who do not use LINE.
```

LINE should help with:

```text
passport persistence
returning tourist profile reuse
optional identity linking
future notification capability if consented
```

LINE must not become:

```text
mandatory login
forced data collection
replacement for guest flow
implicit marketing consent
dashboard identity exposure
```

---

# Core Rules

---

## Rule 1: LINE Is Optional

The tourist must be able to complete these without LINE:

```text
scan QR
view attraction landing
fill minimal profile
give consent
upload photo
generate certificate
download certificate
earn stamp
answer optional survey
view guest passport on same device/browser
```

Do not build a flow that requires LINE before certificate.

---

## Rule 2: Guest Flow Must Work First

Before implementing LINE, ensure:

```text
guest tourist identity works
guest profile can be created/reused
guest passport can show stamps
certificate generation works without LINE
survey works without LINE
```

LINE is an enhancement, not the foundation.

---

## Rule 3: Link After Reward

Offer LINE linking:

```text
after certificate generation
on passport page
as optional save passport action
```

Do not offer LINE as the first required step unless task explicitly changes strategy.

---

## Rule 4: Separate Consent

LINE linking requires a separate explanation/consent.

LINE linking consent is not the same as:

```text
certificate generation consent
tourism planning data consent
marketing consent
notification consent
```

Do not silently link LINE identity.

---

# UX Requirements

---

## Optional LINE CTA

Good CTA:

```text
Save my passport with LINE
Keep my stamps across devices
เชื่อม LINE เพื่อบันทึกพาสปอร์ต
บันทึกตราประทับไว้ใช้งานข้ามอุปกรณ์
```

Avoid:

```text
Login required
Continue with LINE to receive certificate
LINE only
```

---

## Non-LINE Fallback Copy

Explain clearly:

```text
You can continue without LINE. Your passport will be saved on this browser/device.
```

Thai:

```text
คุณสามารถใช้งานต่อได้โดยไม่ต้องใช้ LINE พาสปอร์ตจะถูกจดจำบนเบราว์เซอร์/อุปกรณ์นี้
```

---

## Guest Limitation Copy

Use:

```text
Guest passport is stored on this browser/device. If you clear browser data or change device, it may not be available.
```

Thai:

```text
พาสปอร์ตแบบผู้เยี่ยมชมจะจดจำบนเบราว์เซอร์/อุปกรณ์นี้ หากล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนอุปกรณ์ ข้อมูลอาจไม่แสดง
```

---

## Foreign Tourist UX

Foreign tourist flow must:

```text
show English path
not require LINE
allow origin country
allow certificate generation
allow optional survey
explain guest passport limitation
```

---

# Data Model

---

## Tourist Identity Providers

Use `tourist_identities` or equivalent table.

Recommended fields:

```text
tourist_identity_id
tourist_id
provider
provider_user_id
linked_at
last_seen_at
metadata_json
created_at
updated_at
```

Providers:

```text
anonymous_device
line
email future
```

Required constraint:

```text
unique(provider, provider_user_id)
```

Privacy:

```text
provider_user_id is sensitive
do not show in dashboard
do not export by default
do not log unnecessarily
```

---

## LINE Identity Storage

For LINE:

```text
provider = line
provider_user_id = verified LINE user id
```

Optional metadata:

```text
display_name from LINE
picture_url from LINE
language
```

Only store metadata if needed and consented.

Do not store:

```text
LINE access token long-term unless explicitly required and secured
ID token
raw JWT
unnecessary profile data
```

---

## Guest Identity Merge

If a guest links LINE:

```text
connect existing guest tourist to LINE identity
preserve existing visits/stamps/certificates
avoid duplicate tourist profile where possible
handle conflict carefully if LINE identity already exists
```

Conflict strategy must be documented.

Possible conflict cases:

```text
LINE identity already linked to a different tourist
guest has stamps and LINE identity has stamps
same attraction stamp exists in both
```

Safe merge rules:

```text
do not duplicate stamps
do not delete visits casually
prefer explicit merge service
log/audit merge if sensitive
```

If full merge is too complex, implement simple link-only and document future merge.

---

# Backend Requirements

---

## LINE ID Token Verification

If using LINE login/LIFF identity:

```text
verify LINE ID token server-side
check audience/client ID
check expiry
check issuer
extract verified subject/user id
reject invalid/expired token
```

Do not trust:

```text
frontend-provided LINE user ID alone
displayName from client
pictureUrl from client
localStorage identity
```

---

## LINE Link API

Recommended API/service:

```text
POST /api/tourist/identity/link-line
```

Responsibilities:

```text
verify current guest/tourist session
verify LINE ID token
check consent
create or reuse line tourist_identity
merge/link safely
return safe response
```

Response should not include:

```text
LINE ID
provider_user_id
raw token
guest token
```

---

## LINE Unlink API Future

Future API:

```text
POST /api/tourist/identity/unlink-line
```

Rules:

```text
verify ownership
unlink identity safely
do not delete visits/stamps by default
document effect on cross-device passport
```

---

## LINE Notification Future

If notifications are ever added:

```text
separate notification consent required
do not assume linking = notification consent
store only required token/channel data
allow opt-out
audit/send logs where appropriate
```

MVP does not need LINE notifications unless explicitly requested.

---

# Frontend Requirements

---

## LIFF Initialization

If LIFF is used:

```text
load LIFF only where needed
do not block QR landing on LIFF loading
handle LIFF unavailable
handle browser outside LINE
handle login cancel
show guest fallback
```

LIFF should not slow the core QR-to-certificate flow.

---

## LINE Browser Behavior

Test:

```text
inside LINE browser
outside LINE browser
mobile Chrome/Safari
desktop browser
non-LINE user
foreign tourist English flow
```

The system should not break outside LINE.

---

## Optional Link UI

Show optional link on:

```text
certificate success page
passport page
account/passport settings future
```

Do not show it as a hard gate before:

```text
minimal profile
photo upload
certificate generation
certificate download
stamp award
```

---

# Security Rules

---

## Secret Safety

Server-only:

```text
LINE_CHANNEL_SECRET
LINE_CHANNEL_ID
LINE_LOGIN_CHANNEL_SECRET
```

Public-safe if needed:

```text
NEXT_PUBLIC_LIFF_ID
```

Never expose:

```text
channel secret
access token
ID token
verified provider_user_id in dashboard/export
```

---

## Token Handling

Rules:

```text
ID token verified server-side
do not store raw ID token
do not log raw token
do not accept expired token
do not accept token with wrong audience
do not accept token from frontend without verification
```

---

## Provider User ID Privacy

LINE user ID is sensitive.

Do not show in:

```text
dashboard
exports by default
admin lists by default
logs
audit metadata unless hashed/masked and justified
```

---

# Consent and PDPA

---

## Required LINE Consent Text

Explain:

```text
LINE will be used to remember your passport across devices.
This is optional.
You can continue without LINE.
This is separate from tourism planning data consent.
```

Thai example:

```text
การเชื่อม LINE ใช้เพื่อจดจำพาสปอร์ตและตราประทับของคุณข้ามอุปกรณ์เท่านั้น เป็นทางเลือก ไม่จำเป็นต่อการรับใบประกาศ
```

---

## Consent Record

If linking consent is recorded, store:

```text
tourist_id
consent_version
consent_type = identity_linking or line_linking
purpose_key = passport_persistence
has_consented
consented_at
source = line_liff or web
language
```

---

# Dashboard and Export Rules

---

## Dashboard

LINE-linked data may support aggregate metrics:

```text
passport save rate
linked profile count
returning profile count
```

But dashboard must not show:

```text
LINE user ID
provider_user_id
LINE display name by default
LINE picture URL
```

---

## Export

Default exports must exclude:

```text
provider_user_id
LINE user ID
LINE display name
LINE picture URL
LINE token
guest token
```

If a special admin export ever includes identity data, it requires:

```text
explicit permission
privacy warning
audit log
documented purpose
```

---

# Testing

---

## Unit Tests

Test:

```text
LINE token validation helper
provider identity mapping
link consent validation
safe response mapper
identity conflict decision helper
```

---

## Integration Tests

Test:

```text
guest links valid LINE identity
invalid token rejected
expired token rejected
wrong audience rejected
missing consent rejected
existing LINE identity handled
passport preserved after link
response excludes provider_user_id
```

---

## E2E / Manual Tests

Test:

```text
guest completes certificate without LINE
certificate success offers optional LINE link
user skips LINE and still downloads certificate
user links LINE and passport still shows stamps
outside LINE browser fallback works
English/non-LINE flow works
```

---

# Review Checklist

Before accepting LINE work:

```text
[ ] LINE is optional.
[ ] Guest flow still works.
[ ] Foreign/non-LINE flow still works.
[ ] Certificate does not require LINE.
[ ] Stamp does not require LINE.
[ ] Survey does not require LINE.
[ ] LINE linking has separate consent.
[ ] LINE token verified server-side.
[ ] provider_user_id not exposed.
[ ] Dashboard/export exclude LINE ID by default.
[ ] Tests cover invalid token and no-LINE path.
```

---

## Critical Blockers

Block if:

```text
LINE required before certificate
LINE required to earn stamp
foreign/non-LINE tourists blocked
frontend LINE user ID trusted without server verification
provider_user_id shown in dashboard/export
LINE token stored/logged unsafely
linking consent missing
guest passport broken after LINE integration
```

---

# Task Prompt Template

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Build/fix/refactor optional LINE LIFF feature.]

Context:
LINE is optional and should only improve passport persistence. Guest and non-LINE tourists must still complete the core flow.

Read first:
- .codex/skills/line-liff-integration/SKILL.md
- docs/modules/MODULE_12_LINE_LIFF_OPTIONAL.md
- docs/business/DIGITAL_PASSPORT_STRATEGY.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/security/CONSENT_MANAGEMENT.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- checklists/UI_UX_CHECKLIST.md

Requirements:
- [specific requirements]
- Keep guest flow working.
- Keep LINE optional.
- Verify LINE token server-side.
- Record separate consent if linking identity.
- Do not expose provider_user_id.
- Add tests where practical.

Do not:
- Do not require LINE for certificate.
- Do not require LINE for stamp.
- Do not trust client-provided LINE user ID.
- Do not store/log raw tokens.
- Do not export LINE ID by default.

Completion response:
Summary
Files changed
Validation
LINE behavior notes
Privacy/security notes
Risks / Notes
Next suggested task
```

---

# Output Format

When completing LINE work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

LINE behavior notes
- optional flow
- guest fallback
- token verification
- consent

Privacy/security notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

LINE is an optional enhancement, not the system foundation.

The project must remain usable for tourists who do not have LINE.
