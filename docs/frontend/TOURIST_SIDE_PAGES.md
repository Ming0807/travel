# TOURIST_SIDE_PAGES.md

## 1. Document Purpose

This document defines tourist-facing page strategy for the **Southern Border Tourism Data & Intelligence Platform**.

Tourist pages must make voluntary participation feel quick, safe, and rewarding. They support the core database objective by helping tourists complete the QR-to-certificate flow and optionally provide deeper planning data after receiving value.

---

## 2. Tourist Page Groups

| Page Group | Primary Purpose | MVP Status |
|---|---|---|
| Public homepage | Discovery, credibility, SEO, travel stories, routes, certificate/passport explanation | Optional MVP / Phase 2 |
| Attraction list/detail | Public attraction discovery and information | MVP |
| QR landing | Main field data collection entry point | MVP |
| Minimal form | Collect only display name, origin, age group, consent | MVP |
| Photo upload | Add photo for certificate/travel memory card | MVP |
| Certificate success | Download certificate, show stamp, offer optional sharing/survey/linking | MVP |
| Digital passport | Show earned stamps and progress | Basic MVP / Phase 2 |
| Optional survey | Collect travel behavior, spending, and satisfaction after reward | MVP |

---

## 3. Public Website vs QR Flow

The public website is used for:

- SEO
- project credibility
- attraction discovery
- travel stories
- suggested routes
- 360 media
- general information
- privacy/trust explanation
- dashboard value preview

The QR check-in route is used for:

- location-specific participation
- attraction/photo spot context
- certificate CTA
- visit recording
- certificate generation
- stamp award
- optional micro survey

Do not make the homepage the only path to certificate creation. Real visit/certificate creation should normally begin from `/c/[checkinCode]` so the system knows the attraction and photo spot context.

---

## 4. QR Landing Page Requirements

The route `/c/[checkinCode]` should open a landing page first.

Required content:

- attraction name
- province
- photo spot context if available
- certificate / travel memory preview
- short privacy/trust message
- language option where applicable
- clear CTA such as `Create my certificate`

The QR landing page must not:

- open a long form immediately
- require LINE
- require Google
- require email or phone number
- ask survey questions before certificate reward
- show internal IDs or private storage paths

---

## 5. Certificate Success Page

The success page should show:

- certificate preview
- download/save image action
- stamp earned confirmation
- passport progress CTA
- optional share bottom sheet/popup
- optional micro survey CTA
- optional Google or LINE linking CTA
- continue exploring CTA

Rules:

- Certificate download must be available before optional survey and account linking.
- Sharing must be optional.
- Survey must be optional.
- Google and LINE linking must be optional.
- Guest users must still earn stamps.

---

## 6. Digital Passport Page

The passport page should show:

- earned stamps
- attraction names
- province labels
- progress by province or campaign
- certificate history where available
- CTA to continue exploring
- account-linking prompt for cross-device recovery

Guest passport works on the same browser/device through an anonymous guest ID. Google or LINE linking allows cross-device recovery when the tourist chooses it.

Do not expose provider_user_id, Google subject, LINE user ID, guest token, tourist_id, visit_id, or private storage paths.

---

## 7. Acceptance Criteria

Tourist-side pages are acceptable when:

- The QR landing page shows attraction context before any form.
- Guest mode works first.
- Minimal pre-certificate data is limited to display name, origin, age group, consent, and photo.
- Certificate download is not blocked by survey, sharing, Google, LINE, email, or phone.
- Optional survey appears after reward.
- Optional sharing is user-initiated.
- Passport works for same-device guests and explains optional Google/LINE recovery.
- Public pages feel premium, mobile-first, and appropriate for a real tourism platform.
