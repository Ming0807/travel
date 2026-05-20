# PHASE_05_QR_CHECKIN_FLOW.md

## Status

Planned

## Objective

Build the QR check-in flow as the main tourism data collection entry point.

## Required Strategy

One QR code should be used per attraction entry point or photo spot:

```text
/c/[checkinCode]
```

The QR route must open a location-specific landing page before any form.

The landing page should show:

- attraction context
- photo spot context when available
- province
- certificate/travel memory preview
- short privacy/trust cue
- CTA such as `Create my certificate`

## Identity Rules

- Guest mode works first.
- Guest identity uses anonymous browser/device ID, not IP address.
- Google and LINE are optional account-linking features.
- QR must not require LINE, Google, email, phone number, or survey.
- Same QR must work for Thai tourists, foreign tourists, LINE users, non-LINE users, Google users, and guests.

## Funnel Events

Recommended events:

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
certificate_downloaded
share_opened optional
share_completed optional
survey_started
survey_completed
passport_saved
```

## Acceptance Criteria

- Active QR resolves to the correct attraction/photo spot landing page.
- Invalid, inactive, and expired QR codes show safe user-facing errors.
- Landing page does not open a long form first.
- Guest can start certificate flow without login.
- No private identifiers appear in URL or UI.
- QR scans are recorded as funnel events, not visits.
- Dashboard can distinguish QR scans, landing views, visits, certificates, and surveys.

