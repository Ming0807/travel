# PHASE_11_LINE_LIFF_OPTIONAL.md

## Status

MVP foundation implemented.

Phase 11 implements the optional LINE LIFF linking foundation for tourists who choose to save passport progress with LINE. It is not mandatory login, LINE messaging, or a claim that production-grade unlinking or returning LINE recovery is complete.

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
- after certificate download is already available
- after stamp award
- on passport page

Do not require LINE before certificate, download, stamp, or optional survey.

## Environment Variables

Use these names:

```text
NEXT_PUBLIC_LIFF_ID
LINE_CHANNEL_ID
LINE_CHANNEL_SECRET
```

Do not use `NEXT_PUBLIC_LINE_LIFF_ID`.

## Relationship to Google

Google linking is also optional for tourists and is useful for cross-device passport, profile, and certificate history recovery.

Google/Gmail-style login may be used for admin authentication, but admin authentication is separate from tourist account linking.

## Privacy Rules

- Server-side token verification is required before linking LINE identity.
- LINE ID is stored only in tourist_identities as provider identity data.
- LINE linking requires clear user action and separate consent/notice.
- Do not expose LINE ID or provider_user_id in public UI, dashboard, share URL, or default export.
- Do not send LINE messages without separate communication consent.
- Do not create separate QR codes for LINE users.
- Do not describe notifications, unlinking, or returning LINE recovery as production-complete unless separately implemented and verified.

## Acceptance Criteria

- [x] LINE is never required before certificate download.
- [x] Guest profile can be linked to LINE without creating a duplicate Tourist Profile when LIFF and LINE channel configuration are available.
- [x] Non-LINE tourists and foreign tourists can complete the flow.
- [x] Dashboard and default exports must not expose LINE identifiers.
- [x] LINE linking can be skipped without losing certificate, stamp, survey, or guest passport progress.
- [x] LINE token verification happens server-side before storing provider identity.
- [x] LINE linking consent is separate from certificate, survey, and communication consent.
- [x] Generic client-submitted identity linking is disabled in favor of provider-specific verification.
- [ ] Production LINE channel setup and LIFF console configuration remain deployment tasks.
- [ ] Returning LINE user recovery across devices is prepared by identity linking but not production-complete.
