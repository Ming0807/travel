# PHASE_09_DASHBOARD.md

## Status

Planned

## Objective

Build privacy-safe dashboards that convert tourist participation data into planning insight for Yala, Pattani, and Narathiwat.

## Required Dashboard Rules

- QR Scans are not Visits.
- Tourist Profiles are not verified unique people.
- Estimated Spending is not Revenue.
- Missing Satisfaction is `No data`, not `0`.
- Zero denominator is `No data`.
- Dashboard views use aggregated data only by default.
- Dashboard must not expose private identifiers.

Do not expose:

- provider_user_id
- Google subject
- LINE user ID
- guest token
- tourist_id
- visit_id
- private photo path
- private certificate path

## Dashboard Areas

MVP:

- executive overview
- visits by province and attraction
- tourist profile distribution
- certificate/stamp counts
- optional survey completion
- estimated spending
- satisfaction

Phase 2:

- funnel analytics
- sustainable tourism indicators
- route and community tourism insights
- official data comparison

## Acceptance Criteria

- Every metric has a definition in the metrics dictionary.
- Dashboard labels do not overclaim.
- Funnel shows QR scan, landing view, certificate generation, certificate download, optional sharing, and optional survey.
- Dashboard supports planning questions for Yala, Pattani, and Narathiwat.
- Exports are permission-controlled and privacy-safe by default.

