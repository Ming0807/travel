# AI_DESIGN_BRIEF.md

## 1. Purpose

This brief guides AI-assisted design work for the **Southern Border Tourism Data & Intelligence Platform** frontend, especially the planned premium homepage and tourist-facing QR-to-certificate experience.

Use this document when asking an AI tool or coding agent to generate UI concepts, component structure, page copy, or visual direction. It is a design brief only; it does not claim the UI is implemented.

---

## 2. Product Summary for Design

Design a mobile-first tourism data collection and intelligence platform for Yala, Pattani, and Narathiwat.

The platform solves this problem:

> Tourists usually travel, take photos, and leave without recording useful tourism planning data.

The UX solution is:

```text
Reward first
Ask minimal data
Create certificate
Award stamp
Offer optional survey
Offer optional account linking
Use aggregated dashboard data for planning
```

The design should make tourists feel:

- This is quick.
- This is worth doing.
- I can finish as a guest.
- I do not need LINE or Google to receive my certificate.
- My personal data will not be exposed.

---

## 3. Homepage Direction

Design direction:

```text
native-app-like responsive web design
premium smart tourism platform
Pinterest-style masonry discovery feed
bottom navigation on mobile
search bar and province filter chips
Southern Border discovery hero
QR certificate card
My Passport / stamp progress card
How it works section
Suggested routes section
Privacy & Trust section
Dashboard preview section
Travel stories / SEO content section
minimal premium footer
```

Visual theme:

```text
premium dark emerald
soft mist background
white cards
warm gold accent
subtle coral accent
soft shadows
rounded app-like surfaces
generous whitespace
```

Avoid:

```text
old government website
plain CRUD dashboard
generic SaaS landing page
overly dense section stacks
mandatory login screen
long form as first screen
single-color green page
```

---

## 4. Tourist Flow Direction

The QR route `/c/[checkinCode]` should open a location-specific landing page before any form.

The QR landing page should show:

- attraction name
- province
- photo spot context if available
- certificate/travel memory preview
- short privacy/trust cue
- clear CTA such as `Create my certificate`
- language support for Thai and English

The flow should be:

```text
QR landing
    |
Create my certificate
    |
Minimal form and consent
    |
Photo upload
    |
Certificate generation and download
    |
Stamp awarded
    |
Optional sharing
    |
Optional micro survey
    |
Optional Google or LINE linking
```

Survey, LINE, Google, email, and phone number must not block certificate download.

---

## 5. Identity UX Rules

Design must support:

- guest tourists
- Thai tourists
- foreign tourists
- LINE users
- tourists without LINE
- tourists who optionally link Google
- tourists who optionally link LINE
- admin users with real authentication

Guest mode:

- Works first.
- Uses an anonymous guest ID stored in the browser/device.
- Works on the same browser/device unless linked.
- Must not use IP address as the main identity mechanism.

Account linking:

- Google and LINE are optional for tourists.
- Google can help tourists recover profile, passport, and certificate history across devices.
- LINE can help users save passport progress if they prefer LINE.
- Admin authentication should use real authenticated accounts such as Google/Gmail where configured.

Do not expose provider user IDs, guest tokens, Google subject IDs, LINE user IDs, internal tourist IDs, or visit IDs in public UI.

---

## 6. Required Pre-Certificate Fields

Before certificate generation, design only for:

| Field | UX Label |
|---|---|
| display_name | Display name / Name to show on certificate |
| origin | Country or Thai province |
| age_group | Age group |
| consent | Consent checkbox |
| photo | Photo for certificate |

Design should allow display name values such as nickname, alias, traveller name, or real name. Provide a friendly fallback such as `นักเดินทาง` or `Southern Border Traveller`.

Do not ask before certificate:

- legal full name
- national ID
- passport number
- phone number
- email
- LINE
- Google login
- full address
- exact birthdate
- income
- long survey

---

## 7. Optional Post-Certificate UX

After certificate download is available, the UI may offer:

- micro survey
- share bottom sheet
- save passport with Google
- save passport with LINE
- view passport
- continue exploring

Optional micro survey topics:

- travel companion
- group size
- transport mode
- travel purpose
- overnight or same-day trip
- number of nights
- spending range
- expense categories
- satisfaction score
- safety, cleanliness, accessibility, information/signage, value
- revisit intention
- recommendation intention
- optional comment

Survey UI should use chips, segmented controls, sliders, rating buttons, and short optional text areas.

---

## 8. Sharing UX

After certificate download, show optional sharing only as a user-initiated action.

Preferred sharing options:

- Native Web Share API when supported
- Facebook Share fallback
- X Intent fallback
- Copy Link fallback
- Save Image

Instagram should be handled through downloaded image or mobile share sheet. Do not design automatic Instagram posting.

Do not require Facebook login just to get a display name. Do not design automatic social posting for MVP.

Share surfaces must not include sensitive identifiers, private storage paths, or internal IDs.

---

## 9. Dashboard Design Rules

Dashboard UI must be calm, credible, and definition-driven.

Always reflect these analytics rules:

- QR Scans are not Visits.
- Tourist Profiles are not verified unique people.
- Estimated Spending is not Revenue.
- Missing Satisfaction is `No data`, not `0`.
- Zero denominator is `No data`.
- Dashboard uses aggregated data only.
- Private identifiers are not shown.

Dashboard cards and charts should answer planning questions for Yala, Pattani, and Narathiwat, not decorate the UI.

---

## 10. AI Output Review Checklist

AI-generated design output is acceptable only when:

- It keeps QR check-in as the main data collection entry point.
- It uses a location-specific landing page before the form.
- It keeps the pre-certificate form short.
- It allows guest completion before login or survey.
- It treats Google and LINE as optional tourist linking features.
- It treats Google/Gmail-style authentication as appropriate for admin login.
- It includes optional certificate sharing without automatic social posting.
- It protects privacy in public UI, dashboards, share URLs, and exports.
- It uses the premium dark emerald, mist, white, gold, and coral direction without becoming a one-color theme.
- It does not claim planned features are already implemented.

