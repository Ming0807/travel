# PHASE_06_CERTIFICATE_GENERATION.md

## Status

Planned

## Objective

Create the digital certificate / travel memory card flow as the immediate reward that motivates voluntary data collection.

## Required Flow

```text
QR landing
    |
Minimal form and consent
    |
Photo upload
    |
Certificate preview
    |
Certificate generation/download
    |
Stamp award
    |
Optional sharing
    |
Optional micro survey
    |
Optional Google or LINE linking
```

## Certificate Content

May include:

- display name
- uploaded photo
- attraction name
- province
- date
- project branding

Must not include:

- email
- phone number
- LINE ID
- Google ID
- provider_user_id
- guest token
- internal tourist_id
- internal visit_id
- national ID
- full address
- private storage path

## Sharing Strategy

After certificate download is available, show optional sharing only.

Supported options:

- Native Web Share API where available
- Facebook Share fallback
- X Intent fallback
- Copy Link fallback
- Save Image

Instagram should be handled through downloaded image or mobile share sheet. Automatic posting is out of MVP.

## Acceptance Criteria

- Certificate generation is idempotent per visit.
- Certificate can be downloaded without survey, sharing, Google, LINE, email, or phone number.
- Stamp award is triggered after successful certificate generation.
- Certificate files and uploaded photos are stored separately.
- Public share URLs, if implemented in future, use random tokens and do not expose internal IDs.

