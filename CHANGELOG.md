# CHANGELOG.md

All notable changes to the **Southern Border Tourism Data & Intelligence Platform** should be documented in this file.

This project follows a practical changelog style based on:

```text
Added
Changed
Fixed
Removed
Security
Performance
Documentation
Migration
Known Issues
```

The changelog must stay accurate. Do not claim a feature is implemented if it is only planned.

---

## Changelog Rules

When updating this file:

```text
Use clear dates.
Group changes by release/version.
Mention user-visible changes.
Mention database migrations.
Mention security/privacy changes.
Mention dashboard metric definition changes.
Mention export behavior changes.
Mention breaking changes.
Mention known issues honestly.
```

Do not include:

```text
secrets
tokens
private keys
real tourist data
real LINE user IDs
real emails/phone numbers
private file paths
raw production errors with sensitive data
```

---

## Version Format

Recommended:

```text
[0.1.0] - YYYY-MM-DD
```

For unreleased work:

```text
[Unreleased]
```

---

## Categories

Use these categories where relevant.

```text
Added
Changed
Fixed
Removed
Security
Performance
Documentation
Migration
Known Issues
```

---

## [Unreleased]

### Added

- Added project documentation guardrails for Codex, Copilot, pull requests, issues, prompts, and skills.
- Added contribution workflow guidance for production-oriented development.
- Added changelog structure for future release tracking.
- Added Phase 01 Next.js App Router project foundation with TypeScript, Tailwind CSS, Supabase client boundaries, route shells, homepage shell, and basic test configuration.
- Added Phase 09 MVP dashboard analytics foundation with protected `/admin/dashboard`, server-side filter validation, dashboard service/repository aggregation, KPI cards, profile/behavior/expense/satisfaction/funnel sections, sustainable tourism insight cards, and dashboard metric unit tests.
- Added Phase 08 admin backoffice documentation alignment for Next.js fullstack admin pages, server-side authorization guards, attraction CMS, photo spot CMS, check-in code CMS, read-only visits, read-only surveys, audit logging, and privacy-safe admin tables.
- Added Phase 11 optional LINE LIFF linking foundation with browser LIFF helper, optional linking UI, server-side LINE token verification routes, current guest profile linking, and LINE validation tests.

### Changed

- None.

### Fixed

- None.

### Removed

- None.

### Security

- Added repository-level contribution rules to prevent exposing service role keys, private identifiers, unsafe exports, and privacy-sensitive dashboard responses.
- Added server-only Supabase service-role client boundary and `.env.example` placeholders without real secrets.
- Added dashboard privacy guardrails through `dashboard.read` permission checks and aggregated dashboard responses that exclude provider IDs, guest tokens, private storage paths, raw comments, tourist IDs, and visit IDs.
- Documented Phase 08 server-side permission guard requirements for admin pages and mutations.
- Documented Phase 08 audit logging expectations for attraction, photo spot, check-in code, and sensitive denied admin actions.
- Added provider-specific LINE linking security so client-submitted LINE user IDs are not trusted and the legacy generic tourist identity-linking endpoint is disabled.

### Migration

- Added migration support for LINE identity linking metadata and dedicated consent fields for optional passport recovery consent.

### Performance

- Added contribution guidance for QR landing, upload, certificate, dashboard, and export performance review.

### Documentation

- Added development contribution rules.
- Added changelog policy and release note structure.
- Updated Phase 09 dashboard task/module/metric/privacy documentation to reflect the implemented MVP analytics route and live-query limitations.
- Updated Phase 08 admin documentation to avoid claiming full dashboard analytics, report/export jobs, LINE LIFF, or official data import automation as implemented.
- Aligned admin page, authorization, role/permission, audit logging, and Admin Attraction CMS docs around privacy-safe operational backoffice behavior.

### Known Issues

- Implementation status depends on future code phases.
- This changelog currently documents documentation/process setup only, not a completed application release.
- Full Phase 09 dashboard analytics and Phase 10 report/export workflows remain future work unless implemented and verified in a later change.

---

## [0.0.0] - Initial Planning Baseline

### Added

- Defined the project as a southern border tourism data and intelligence platform for Yala, Pattani, and Narathiwat.
- Defined the core product strategy: reward first, ask minimal data first, optional survey after certificate, guest-first, LINE-optional.
- Defined the high-level modules:
  - Public attraction pages
  - QR check-in
  - Minimal tourist profile
  - Consent management
  - Photo upload
  - Certificate generation
  - Digital stamp/passport
  - Optional survey
  - Admin CMS
  - Dashboard analytics
  - Privacy-safe export
  - Testing and deployment readiness
- Defined recommended stack:
  - Next.js App Router
  - TypeScript
  - Tailwind CSS
  - Supabase PostgreSQL
  - Supabase Auth
  - Supabase Storage
  - Zod
  - Vitest
  - Playwright

### Security

- Established privacy-by-design direction:
  - Do not require LINE, email, phone, national ID, passport number, full address, exact birthdate, or income before certificate.
  - Consent must be visible, not pre-checked, versioned, timestamped, and purpose-linked.
  - Dashboard and export outputs must exclude private identifiers by default.

### Documentation

- Established the documentation-first development approach for Codex-assisted implementation.

### Known Issues

- No production application has been implemented in this baseline.
- The project still requires actual code, migrations, tests, deployment configuration, and UI implementation in later phases.

---

## Future Release Template

Copy this section when creating a new release.

```markdown
## [x.y.z] - YYYY-MM-DD

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Removed

- ...

### Security

- ...

### Performance

- ...

### Documentation

- ...

### Migration

- ...

### Known Issues

- ...
```

---

## Release Notes Guidance

For each release, include enough detail for:

```text
developer review
academic reporting
deployment tracking
security/privacy audit
dashboard metric traceability
database migration traceability
```

Example:

```text
### Added
- Implemented active/invalid/inactive/expired QR check-in resolution.
- Added public-safe QR landing page for attraction/photo spot context.

### Security
- QR response excludes admin notes and private storage paths.
- Invalid QR errors use safe user-facing messages.

### Migration
- Added checkin_codes table with unique code constraint and active/expiry fields.
```

---

## Critical Change Documentation

Always document these changes:

```text
database schema changes
RLS/storage policy changes
authentication/permission changes
tourist identity changes
consent text/version changes
dashboard formula changes
export column changes
file upload validation changes
certificate generation behavior changes
deployment/environment changes
```

---

## Dashboard Metric Change Note

If dashboard metrics change, include:

```text
metric name
old definition
new definition
reason
affected dashboard sections
test coverage
documentation updated
```

Example:

```text
### Changed
- Updated Survey Completion Rate denominator from total visits to generated certificates because the survey appears after the certificate reward.
```

---

## Security/Privacy Change Note

If security/privacy behavior changes, include:

```text
what changed
why it changed
data affected
risk reduction
tests or verification
```

Example:

```text
### Security
- Export service now excludes provider_user_id and guest_token from all default CSV exports.
- Added audit logging for export requests.
```

---

## Migration Change Note

If migrations are added, include:

```text
migration filename
tables changed
constraints/indexes added
backfill required or not
rollback notes if relevant
```

Example:

```text
### Migration
- Added `202605190930_create_tourism_core_tables.sql`.
- Created attractions, photo_spots, checkin_codes, tourists, tourist_identities, and visits.
- Added unique constraint on checkin_codes.code.
```

---

## Known Issue Guidance

Known issues must be honest and actionable.

Good:

```text
- LINE LIFF identity linking is not implemented in MVP; guest passport works only on the same browser/device.
```

Bad:

```text
- Some things may not work.
```

---

## Final Changelog Rule

The changelog is part of production and academic traceability.

Keep it truthful, specific, and safe.
