# TOURIST_DATA_COLLECTION_STRATEGY.md

## 1. Purpose

This document defines the data collection strategy for the platform, explaining how tourist data is gathered progressively without overwhelming visitors.

---

## 2. Core Principle: Progressive Data Collection

> Collect the minimum needed first. Ask for more only after the tourist receives value.

```text
Step 1: Minimal form (before certificate)  →  Required data
Step 2: Certificate + Stamp (value given)  →  Tourist feels rewarded
Step 3: Optional survey (after value)      →  Planning data
```

---

## 3. Data Collection Stages

### Stage 1: Automatic (Zero Effort)

Collected without tourist input:

| Data | Source | Dimension |
|---|---|---|
| Attraction visited | QR check-in code | Attractions Visited |
| Photo spot | QR check-in code | Attractions Visited |
| Visit timestamp | System clock | Travel Behavior |
| Device language | Browser | Tourist |
| Entry source | QR / direct link | Travel Behavior |
| Funnel events | System tracking | Analytics |

### Stage 2: Minimal Form (Before Certificate)

Required fields — short, mobile-friendly:

| Field | Type | Dimension |
|---|---|---|
| Name on certificate | Text input | Tourist |
| Origin country/province | Dropdown | Tourist |
| Age group | Dropdown | Tourist |
| Visit date | Date picker (pre-filled) | Travel Behavior |
| Consent confirmation | Checkbox | Privacy |

**Target completion time:** Under 60 seconds

### Stage 3: Optional Survey (After Certificate)

Shown after the tourist has received their certificate:

| Field | Type | Dimension |
|---|---|---|
| Travel companion | Chips/radio | Travel Behavior |
| Group size | Number selector | Travel Behavior |
| Transport mode | Chips/radio | Travel Behavior |
| Overnight status | Yes/No | Travel Behavior |
| Number of nights | Number (if overnight) | Travel Behavior |
| Travel purpose | Chips | Travel Behavior |
| Spending range | Range selector | Expenses |
| Expense categories | Multi-select chips | Expenses |
| Overall satisfaction | 1-5 stars | Satisfaction |
| Revisit intention | Yes/Maybe/No | Satisfaction |
| Recommendation intention | Yes/Maybe/No | Satisfaction |
| Comment | Optional textarea | Satisfaction |

**Skippable:** Yes — tourist can dismiss without penalty

---

## 4. Five Core Dimensions Mapping

| Dimension | Stage 1 (Auto) | Stage 2 (Required) | Stage 3 (Optional) |
|---|---|---|---|
| Tourist | Device language | Name, origin, age group | — |
| Travel Behavior | Timestamp, entry source | Visit date | Companion, transport, overnight |
| Attractions Visited | QR attraction + spot | — | — |
| Expenses | — | — | Spending range, categories |
| Satisfaction | — | — | Rating, revisit, recommend |

---

## 5. Data Quality Rules

### 5.1 Required Field Validation

- Name: 2-100 characters, no scripts
- Origin: Must select from predefined list
- Age group: Must select from predefined ranges
- Visit date: Cannot be future date, within reasonable range
- Consent: Must be checked

### 5.2 Optional Field Handling

- All optional fields accept null/empty
- Partial survey submission is accepted
- Survey can be skipped entirely
- No data loss if tourist closes browser mid-survey

### 5.3 Duplicate Prevention

- Same device + same attraction + same day = warn about duplicate
- Allow re-visit on different days
- Do not create duplicate tourist profiles for same identity

---

## 6. Survey UX Guidelines

### 6.1 Design Principles

- Use **chips and radio buttons** instead of dropdowns where possible
- Use **star ratings** instead of numeric scales
- Use **range selectors** instead of exact number inputs
- Group related questions on single screens
- Show progress indicator for multi-step surveys
- Allow backward navigation

### 6.2 Mobile Optimization

- All controls must be touch-friendly (min 44px touch targets)
- Avoid typing where possible
- Pre-fill known data (date, attraction name)
- Support both portrait and landscape
- Work offline if possible (queue submission)

### 6.3 Language

- All labels in Thai and English
- Use simple, friendly language
- Avoid technical or government-style wording

---

## 7. Expected Completion Rates

Based on progressive collection approach:

| Stage | Expected Rate | Rationale |
|---|---|---|
| Stage 1 (Auto) | 100% | No user action required |
| Stage 2 (Minimal) | >90% | Required for certificate |
| Stage 3 (Survey) | 30-50% | Optional but encouraged |

Even at 30% survey completion, the platform generates significantly more structured data than traditional paper surveys.

---

## 8. Data Storage

Each stage stores data in different tables:

```text
Stage 1 → funnel_events, visits (partial)
Stage 2 → tourists, tourist_identities, visits, consent_logs
Stage 3 → visits (behavior), visit_expenses, satisfaction_surveys
```

---

## 9. Incentive Alignment

| Tourist Action | Incentive Received | Data Collected |
|---|---|---|
| Scan QR | See location-specific attraction/photo spot context | Funnel event |
| Fill minimal form | Unlock certificate creation | Tourist profile + consent + visit context |
| Upload photo | Photo becomes part of certificate | Photo metadata |
| Generate/download certificate | Immediate reward | Certificate record + visit completion |
| Earn stamp | Passport progress | Tourist-attraction stamp record |
| Optional sharing | Social/travel memory value | Optional share event only |
| Save passport with Google or LINE | Persist stamps across devices | Optional identity linkage |
| Complete survey | "Thank you" + possibly future reward | Behavior + expense + satisfaction |

---

## 9.1 Minimal Data and Identity Rules

Before certificate generation, collect only:

- display name / name to show on certificate
- origin country or Thai province
- age group
- consent
- photo for certificate

Do not require legal full name, national ID, passport number, phone number, email, LINE, Google login, full address, exact birthdate, income, or a long survey before the certificate is downloadable.

Guest users should be identified by an anonymous guest ID stored in the browser/device. IP address must not be used as the main tourist identity mechanism. If a guest later links Google or LINE, link that identity to the existing Tourist Profile.

The optional micro survey must appear after the certificate reward and must be skippable.

## 10. Future Enhancements

- **Gamified survey:** Earn bonus passport badges for survey completion
- **Seasonal questions:** Rotate optional questions based on campaign
- **Feedback loop:** Show "Your feedback helped improve [attraction]"
- **Smart skipping:** If returning tourist, skip already-answered profile questions
- **AI suggestions:** Pre-fill likely answers based on tourist segment
