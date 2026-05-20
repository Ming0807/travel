# PHASE_11_LINE_LIFF_OPTIONAL.md

## Status

Optional / Phase 2

## Objective

Add optional LINE LIFF support for tourists who want to save passport progress with LINE.

LINE is a convenience feature, not an entry gate.

## Required Strategy

The core flow must work without LINE:

- scan QR
- view QR landing
- continue as guest
- fill minimal form
- upload photo
- generate/download certificate
- earn stamp
- view same-device guest passport
- answer optional survey

Offer LINE linking:

- after certificate generation
- after stamp award
- on passport page

## Relationship to Google

Google linking is also optional for tourists and is useful for cross-device passport, profile, and certificate history recovery.

Google/Gmail-style login may be used for admin authentication, but admin authentication is separate from tourist account linking.

## Privacy Rules

- LINE ID is stored only in tourist_identities.
- LINE linking requires clear user action and separate consent/notice.
- Do not expose LINE ID in public UI, dashboard, share URL, or default export.
- Do not send LINE messages without separate communication consent.
- Do not create separate QR codes for LINE users.

## Acceptance Criteria

- LINE is never required before certificate download.
- Guest profile can be linked to LINE without creating a duplicate Tourist Profile.
- Non-LINE tourists and foreign tourists can complete the flow.
- Dashboard does not expose LINE identifiers.
- LINE linking can be skipped without losing certificate, stamp, survey, or guest passport progress.

