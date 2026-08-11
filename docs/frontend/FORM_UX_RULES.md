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
- Skip must be visible before the first question.
- Skipping survey must not remove certificate, stamp, visit, or passport progress.
- Use chips, segmented controls, sliders, rating buttons, steppers, and short optional comments instead of long free-text fields.
- Show one short section at a time, preserve answers when moving backward, and explain both ends of every rating scale.
- Disable duplicate submission while saving and preserve entered answers after a recoverable error.
- Keep operational tourism questions separate from consented research-evaluation items and storage.

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

## 7. Returning Tourist and Geography UX

- A returning guest is resolved from the existing anonymous-device identity before the form is shown.
- Show a compact profile summary with `ใช้ข้อมูลเดิมและดำเนินการต่อ` as the primary action.
- `แก้ไขข้อมูล` expands the same form with existing values prefilled.
- Profile edits affect future use only. Existing visits and certificates remain historical records.
- Country and Thai province must come from active master data IDs, not free text.
- The province field opens its option list on focus, supports Thai/English search, keyboard navigation, and touch targets of at least 44px.
- Thai tourists must select a province. Foreign tourists do not receive an irrelevant Thai province field.
- A guest account has no password. Explain same-device storage and optional account linking instead of showing an empty password field.
