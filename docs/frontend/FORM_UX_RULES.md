# FORM_UX_RULES.md

## 1. Document Purpose

This document defines form UX rules for tourist-facing and admin-facing forms.

The tourist form strategy is reward-first and minimal. The project should not ask tourists to complete a long survey before they receive a certificate or stamp.

---

## 2. Pre-Certificate Form

Before certificate generation, collect only:

| Field | User-Facing Label | Rule |
|---|---|---|
| display_name | Display name / Name to show on certificate | Can be nickname, alias, traveller name, or real name |
| origin | Country or Thai province | Use controlled options |
| age_group | Age group | Use chips or dropdown |
| consent | Consent checkbox | Required, not pre-checked |
| photo | Photo for certificate | Validate type and size |

Use fallback display names such as:

- `นักเดินทาง`
- `Southern Border Traveller`

Do not label the field as `Full legal name`.

---

## 3. Fields Not Required Before Certificate

Do not require:

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
- forced GPS permission

---

## 4. Optional Post-Certificate Survey

The micro survey appears after the certificate is downloadable and the stamp is awarded.

Allowed topics:

- travel companion
- group size
- transport mode
- travel purpose
- overnight or same-day trip
- number of nights
- spending range
- expense categories
- satisfaction score
- safety
- cleanliness
- accessibility
- information/signage
- value
- revisit intention
- recommendation intention
- optional comment

Rules:

- Survey is optional.
- Skip must be visible.
- Skipping survey must not remove certificate, stamp, visit, or passport progress.
- Use chips, segmented controls, sliders, rating buttons, steppers, and short optional comments instead of long free-text fields.

---

## 5. Account Linking Forms

Google and LINE linking are optional tourist account-linking flows.

They may be shown:

- after certificate download
- after stamp award
- on the passport page

They must not be shown as required gates before certificate creation.

Admin login is separate from tourist identity. Admin users may use real authentication such as Google/Gmail where configured.

---

## 6. Acceptance Criteria

Form UX is acceptable when:

- A tourist can complete required fields in under one minute.
- The form uses `Display name` or `Name to show on certificate`.
- The form does not imply legal identity verification.
- Guest mode works without account fields.
- Consent is clear, specific enough, and not pre-checked.
- Optional survey appears only after reward.
- Error messages are friendly and do not expose technical details.
