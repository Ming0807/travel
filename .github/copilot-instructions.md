# GitHub Copilot Instructions

## Project

This repository contains the **Southern Border Tourism Data & Intelligence Platform**, a production-oriented university-level system for tourist data collection and sustainable tourism planning in:

```text
Yala
Pattani
Narathiwat
```

The system includes public attraction pages, QR check-in, minimal tourist profile, consent, photo upload, certificate generation, digital passport/stamps, optional survey, admin CMS, dashboard analytics, and privacy-safe exports.

---

## High-Level Rule

Do not treat this as a basic CRUD app.

Every generated suggestion must respect:

```text
tourist-first UX
privacy by design
server-side validation
server-side permissions
tourist ownership checks
dashboard metric correctness
export privacy
production readiness
```

---

## Tech Stack

Prefer:

```text
Next.js App Router
TypeScript
Tailwind CSS
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Server Actions / Route Handlers
Zod
Vitest
Playwright
```

Do not introduce unnecessary packages.

---

## Architecture

Use:

```text
UI Component
  -> Server Action / API Route
  -> Validator
  -> Auth / Permission / Ownership Guard
  -> Service
  -> Repository
  -> Supabase Database / Storage
```

Do not place critical business rules only in client components.

---

## Tourist UX Rules

Before certificate, collect only:

```text
display name
origin country/province
age group
consent
photo
```

Do not require:

```text
LINE
email
phone
national ID
passport number
full address
exact birthdate
long survey
```

Survey must be optional and shown after the certificate.

LINE must be optional.

---

## Security Rules

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
SUPABASE_DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
EXPORT_SIGNING_SECRET
```

Do not trust:

```text
localStorage role
client-provided tourist_id
client-provided visit_id without ownership check
frontend validation only
frontend permission hiding only
```

---

## Privacy Rules

Avoid collecting unnecessary personal data.

Do not include these in dashboard/export by default:

```text
email
LINE user ID
provider_user_id
guest token
device token
private photo path
private certificate path
raw comments
```

Consent must not be pre-checked.

---

## Database Rules

Important distinctions:

```text
QR scan is not a visit.
Landing view is not a visit.
Visit is created after minimal profile and consent.
Repeat visits are allowed.
One stamp per tourist-attraction.
Certificate generation must be idempotent.
Survey is optional.
```

Do not add `unique(tourist_id, attraction_id)` to visits.

Use that uniqueness only for `tourist_stamps`.

---

## Dashboard Rules

Do not generate misleading dashboard labels or formulas.

Correct rules:

```text
QR Scans are separate from Total Visits.
Tourist Profiles are not verified unique people.
Estimated Spending is not Revenue.
Missing Satisfaction is No data/null, not 0.
Zero denominator returns No data/null.
```

Dashboard metrics must be calculated server-side and returned as aggregated data.

---

## Export Rules

Exports must:

```text
require permission
validate filters
use safe column whitelist
enforce row limits
create audit log
exclude private identifiers by default
```

---

## File Upload Rules

Tourist uploads may accept:

```text
JPEG
PNG
WebP
```

Reject:

```text
SVG
PDF
HTML
JavaScript
empty file
oversized file
```

Do not store base64 images in the database.

Do not store signed URLs permanently.

Do not include personal data in storage paths.

---

## Certificate Rules

Certificate may show:

```text
display name
photo
attraction
visit date
```

Certificate must not show:

```text
email
LINE ID
provider_user_id
internal tourist_id
phone
national ID
full address
```

Certificate download must not be blocked by survey or LINE.

---

## Testing Expectations

Suggest tests for:

```text
QR active/invalid/inactive/expired states
consent required
photo upload validation
certificate idempotency
stamp duplicate prevention
survey optional behavior
tourist ownership
admin permissions
dashboard formulas
export privacy
safe errors
```

Use synthetic data only.

---

## Style

Prefer:

```text
strict TypeScript
clear names
small functions
typed DTOs
Zod schemas
centralized constants
safe error codes
service/repository separation
```

Avoid:

```text
unsafe any
hardcoded secrets
raw Supabase error exposure
large unrelated rewrites
copy-pasted dashboard formulas
```

---

## Final Guardrail

If a suggestion makes the system easier to code but weaker in privacy, security, dashboard accuracy, or tourist UX, do not use it.
