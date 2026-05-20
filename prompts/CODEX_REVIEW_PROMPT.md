# CODEX_REVIEW_PROMPT.md

## 1. Purpose

Use this prompt to review code, migrations, UI, documentation, or tests created by Codex for the **Southern Border Tourism Data & Intelligence Platform**.

The goal is to catch architectural, security, privacy, database, UX, dashboard, and testing problems before merging or continuing.

This project is production-oriented. Review must be stricter than a normal classroom CRUD project.

---

## 2. Review Role

You are reviewing work for a real tourism data platform that collects tourist participation data for Yala, Pattani, and Narathiwat.

Review the work as a senior full-stack engineer, database designer, security reviewer, and product/UX reviewer.

You must verify:

```text
functional correctness
architecture consistency
database integrity
security and privacy
PDPA-oriented design
tourist UX
admin UX
dashboard metric correctness
export safety
performance risk
test coverage
documentation alignment
```

---

## 3. Standard Review Prompt

Use this prompt when reviewing a completed task:

```text
You are reviewing Codex changes for the Southern Border Tourism Data & Intelligence Platform.

Review the implementation against the project documentation and requirements.

Focus on:
- correctness
- architecture
- database integrity
- security/PDPA
- tourist UX
- admin UX
- dashboard metric accuracy
- export privacy
- performance
- tests
- documentation alignment

Read relevant docs:
- CODEX_MAIN_PROMPT.md
- docs/testing/ACCEPTANCE_CRITERIA.md
- checklists/PRODUCTION_RELEASE_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- checklists/TESTING_CHECKLIST.md
- plus any task-specific documents.

Return:
1. Verdict: approve / approve with changes / request changes / block
2. Critical issues
3. High priority issues
4. Medium/low issues
5. Security/privacy concerns
6. Database concerns
7. UX concerns
8. Testing gaps
9. Suggested fixes
10. Final merge recommendation
```

---

## 4. Review Verdict Definitions

## 4.1 Approve

Use only when:

```text
implementation is correct
tests/validation are acceptable
no critical/high risk issues
security/privacy rules followed
documentation alignment acceptable
```

## 4.2 Approve with Changes

Use when:

```text
minor issues exist
changes are small and safe
no critical security/data issues
```

## 4.3 Request Changes

Use when:

```text
feature partly works but has important issues
tests missing for critical logic
UX/data quality issues exist
dashboard/export assumptions are weak
```

## 4.4 Block

Use when:

```text
security risk
privacy leak
data corruption risk
incorrect dashboard metric
broken core tourist flow
service role exposure
unbounded export
tourist ownership bypass
```

---

# Review Checklist by Area

---

## 5. Architecture Review

Check:

```text
[ ] Code follows frontend -> server action/API -> validator -> auth/guard -> service -> repository -> DB/storage.
[ ] Business logic is not only in React components.
[ ] Validation is server-side.
[ ] Permissions are server-side.
[ ] Tourist ownership checks are server-side.
[ ] Services are cohesive.
[ ] Repositories handle database queries cleanly.
[ ] Shared constants are not duplicated.
[ ] No unnecessary dependency added.
[ ] Public/tourist/admin separation is maintained.
```

Red flags:

```text
direct DB access from random UI component
client component using service role key
business rules duplicated in many places
dashboard metric calculated from raw rows in browser
large unrelated rewrite
```

---

## 6. Database Review

Check:

```text
[ ] Tables match documented schema.
[ ] Primary keys exist.
[ ] Foreign keys exist.
[ ] Unique constraints exist.
[ ] Check constraints exist.
[ ] Indexes exist for expected queries.
[ ] Migrations are ordered and safe.
[ ] Seed data is rerunnable.
[ ] Repeat visits are allowed.
[ ] Duplicate stamps are prevented.
[ ] Duplicate certificate behavior is controlled.
[ ] Survey duplicate behavior is controlled.
```

Critical constraints to verify:

```text
unique attractions.slug
unique checkin_codes.code
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
score range 1-5
group_size >= 1
nights >= 0
```

Red flags:

```text
no FK constraints
no unique stamp constraint
visit uniqueness prevents repeat visits incorrectly
stores image base64 in DB
stores signed URL permanently
stores national ID/full address
```

---

## 7. Security Review

Check:

```text
[ ] SUPABASE_SERVICE_ROLE_KEY is server-only.
[ ] Admin routes require authentication.
[ ] Admin APIs require authentication.
[ ] Permission checks are backend-enforced.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Tourist ownership checks exist.
[ ] Private files are not public by default.
[ ] Safe error handling exists.
[ ] Secrets are not logged.
[ ] Cron endpoints are protected if present.
```

Critical blockers:

```text
service role key in frontend
trusting role from localStorage
trusting tourist_id from client
anonymous admin access
viewer can mutate/export
tourist can access another tourist data
raw SQL/stack trace shown to user
```

---

## 8. PDPA / Privacy Review

Check:

```text
[ ] Data minimization is respected.
[ ] Consent is collected before saving required tourist data.
[ ] Consent checkbox is not pre-checked.
[ ] Consent version/source/timestamp is stored.
[ ] LINE is optional.
[ ] Email is optional.
[ ] Survey is optional.
[ ] Photo purpose is explained.
[ ] Dashboard is aggregated.
[ ] Exports exclude identifiers by default.
[ ] Raw comments are restricted.
```

Must not collect by default:

```text
national ID
passport number
full address
exact birthdate
required phone
required email
required LINE
exact income
sensitive personal attributes
```

Critical blockers:

```text
certificate flow requires LINE
export includes LINE ID/email by default
dashboard exposes provider_user_id
tourist photos public unintentionally
no consent before saving tourist data
```

---

## 9. Tourist UX Review

Check:

```text
[ ] QR landing explains benefit quickly.
[ ] Tourist can start without login.
[ ] Tourist can start without LINE.
[ ] Minimal profile form is short.
[ ] Required fields are only necessary.
[ ] Consent is clear.
[ ] Photo upload is understandable.
[ ] Certificate looks rewarding.
[ ] Certificate download is easy to find.
[ ] Survey appears after reward and is optional.
[ ] Returning tourist does not repeat all fields.
[ ] English/non-LINE path works if required.
```

Red flags:

```text
long academic text first on QR page
survey before certificate
email/phone/LINE required before certificate
download hidden behind survey
photo upload has no error/retry state
mobile UI broken
```

---

## 10. Admin UX Review

Check:

```text
[ ] Admin layout is clear.
[ ] Admin can create/update attractions.
[ ] Admin can create photo spots.
[ ] Admin can create/deactivate check-in codes.
[ ] QR link/copy/download flow is clear.
[ ] Dashboard is understandable.
[ ] Export UI explains privacy.
[ ] Destructive actions have confirmation.
[ ] Permission-based UI states make sense.
```

Red flags:

```text
admin needs developer to create QR code
active/inactive status unclear
viewer sees dangerous actions
export warning missing
no validation messages
```

---

## 11. Dashboard Review

Check:

```text
[ ] Metrics follow DASHBOARD_METRICS_DICTIONARY.md.
[ ] Dashboard metrics are server-side aggregated.
[ ] QR scans are not counted as visits.
[ ] Tourist profiles are not labeled verified unique people.
[ ] Estimated spending is not labeled revenue.
[ ] Missing satisfaction is not treated as 0.
[ ] Zero denominator returns null/No data.
[ ] Response counts are shown with averages.
[ ] Data limitations are visible.
[ ] No private identifiers are shown.
```

Critical blockers:

```text
QR scan counted as visit
estimated spending called revenue
null satisfaction averaged as zero
dashboard exposes LINE ID/email/provider_user_id
frontend fetches all raw rows for dashboard
```

---

## 12. Export Review

Check:

```text
[ ] Export requires authentication.
[ ] Export requires permission.
[ ] Export filters are validated.
[ ] Export respects filters.
[ ] CSV headers are clear.
[ ] CSV escapes commas/quotes/newlines.
[ ] Thai text preserved.
[ ] Export has row limit.
[ ] Export creates audit log.
[ ] Export files are private if stored.
```

Default export must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments unless permission
```

Critical blockers:

```text
viewer can export detailed data
export includes private identifiers by default
export has no audit log
unbounded export can timeout or leak data
export file is public
```

---

## 13. File Upload Review

Check:

```text
[ ] File type validated server-side.
[ ] File size validated server-side.
[ ] SVG tourist upload rejected.
[ ] PDF/HTML/JS rejected.
[ ] Visit ownership checked.
[ ] Storage path generated server-side.
[ ] Storage path contains no personal data.
[ ] Tourist photos private/controlled.
[ ] Metadata stored correctly.
[ ] Upload error/retry handled.
```

Critical blockers:

```text
accepts arbitrary file types
stores original filename with personal data
public tourist photo bucket
no ownership check before upload
service role key in client upload
```

---

## 14. Certificate Review

Check:

```text
[ ] Certificate includes display name/photo/attraction/visit date.
[ ] Certificate excludes email/LINE ID/internal ID.
[ ] Certificate generation is idempotent.
[ ] Duplicate click does not create duplicates.
[ ] Certificate file access is private/controlled.
[ ] Stamp award is handled.
[ ] Survey is not required for download.
[ ] Long display names handled.
```

Critical blockers:

```text
certificate exposes private identifiers
certificate download blocked by survey
duplicate certificate rows from double click
certificate file public unintentionally
```

---

## 15. Survey Review

Check:

```text
[ ] Survey appears after certificate.
[ ] Survey is optional.
[ ] Certificate remains available if skipped.
[ ] Spending uses ranges.
[ ] Satisfaction scores validated 1-5.
[ ] Null scores are allowed where optional.
[ ] Comment is optional and length-limited.
[ ] Raw comments restricted.
```

Red flags:

```text
survey before reward
exact income requested
comment required
missing satisfaction stored as 0
```

---

## 16. Testing Review

Check:

```text
[ ] Relevant unit tests added.
[ ] Relevant integration tests added.
[ ] E2E/manual test evidence exists for major flows.
[ ] Security/privacy tests exist for sensitive changes.
[ ] Dashboard formula tests exist for metric changes.
[ ] Export privacy tests exist for export changes.
[ ] Tests do not use production data.
[ ] Tests cover negative cases.
[ ] Validation commands run or failure explained.
```

Critical gaps:

```text
no test for critical backend permission
no test for dashboard metric formula
no export privacy test
no ownership test
no file upload rejection test
```

---

## 17. Performance Review

Check:

```text
[ ] Tourist pages do not load admin/dashboard bundles.
[ ] Images are optimized.
[ ] Upload shows loading/progress.
[ ] Certificate generation prevents duplicate submit.
[ ] Dashboard uses backend aggregation.
[ ] Admin lists are paginated/bounded.
[ ] Exports are bounded.
[ ] Queries use indexes where needed.
```

Red flags:

```text
dashboard fetches all visits to frontend
unbounded export
large unoptimized hero images
chart library loaded on QR page
no loading state for upload/generation
```

---

## 18. Documentation Review

Check:

```text
[ ] Related docs updated when behavior changes.
[ ] Data dictionary updated for schema change.
[ ] API docs updated for route changes.
[ ] Dashboard metric docs updated for metric changes.
[ ] Security docs updated for security behavior changes.
[ ] Checklists remain consistent.
[ ] No false claim that unimplemented feature exists.
```

Red flags:

```text
docs say one thing, code does another
implemented schema missing data dictionary updates
dashboard formula changed without docs/tests
security behavior undocumented
```

---

# Review Output Format

---

## 19. Required Review Response Format

Use this exact structure:

```text
Verdict:
[approve | approve with changes | request changes | block]

Summary:
- [Short summary of reviewed work.]

Critical Issues:
- [Issue, impact, required fix.]
- None.

High Priority Issues:
- [Issue, impact, suggested fix.]
- None.

Medium / Low Issues:
- [Issue, suggested improvement.]
- None.

Security / Privacy Concerns:
- [Concern and fix.]
- None.

Database Concerns:
- [Concern and fix.]
- None.

UX Concerns:
- [Concern and fix.]
- None.

Dashboard / Metric Concerns:
- [Concern and fix.]
- None.

Export Concerns:
- [Concern and fix.]
- None.

Testing Gaps:
- [Missing tests.]
- None.

Documentation Gaps:
- [Missing docs updates.]
- None.

Suggested Fix Plan:
1. ...
2. ...
3. ...

Final Recommendation:
[Clear merge/continue recommendation.]
```

---

## 20. Severity Guide

## 20.1 Critical

Block merge/release.

Examples:

```text
data leak
service role exposed
tourist ownership bypass
wrong core metric
broken certificate flow
unsafe file upload
export privacy leak
```

## 20.2 High

Request changes before merge.

Examples:

```text
missing backend validation
missing permission check
poor dashboard denominator logic
unbounded export
missing consent record
mobile core flow broken
```

## 20.3 Medium

Can be fixed soon, may approve with changes depending on scope.

Examples:

```text
missing tooltip
minor test gap
admin UI clarity issue
minor performance issue
```

## 20.4 Low

Polish or future improvement.

Examples:

```text
copy improvement
minor layout spacing
small refactor opportunity
```

---

# Review Prompts by Task Type

---

## 21. Database Review Prompt

```text
Review this database migration/schema change.

Focus on:
- table design
- foreign keys
- unique constraints
- check constraints
- indexes
- privacy minimization
- repeat visit vs duplicate stamp logic
- dashboard readiness
- migration safety

Confirm:
- no national ID/full address/exact birthdate
- repeat visits allowed
- duplicate stamp prevented
- QR scans not modeled as visits
- storage paths not signed URLs
```

---

## 22. QR Flow Review Prompt

```text
Review this QR/check-in implementation.

Focus on:
- active/invalid/inactive/expired code handling
- public-safe response
- mobile landing UX
- no login/LINE requirement
- funnel event recording
- no full tourist record on QR scan
- no admin/private data leakage
```

---

## 23. Photo Upload Review Prompt

```text
Review this photo upload implementation.

Focus on:
- server-side MIME/size validation
- SVG/PDF/HTML rejection
- visit ownership check
- private/controlled storage
- safe storage path generation
- metadata consistency
- upload error/retry behavior
- no base64 in database
- no signed URL stored permanently
```

---

## 24. Certificate Review Prompt

```text
Review this certificate generation implementation.

Focus on:
- preview correctness
- privacy-safe certificate fields
- idempotency
- duplicate click protection
- storage safety
- stamp award behavior
- optional survey after reward
- mobile UI
```

---

## 25. Dashboard Review Prompt

```text
Review this dashboard implementation.

Focus on:
- metric definitions
- denominator rules
- null/zero behavior
- server-side aggregation
- filters
- privacy-safe response
- performance
- tooltips/data limitations
- tests

Critical rules:
- QR scans are not visits.
- Estimated spending is not revenue.
- Missing satisfaction is not zero.
- Tourist profiles are not verified unique people.
```

---

## 26. Export Review Prompt

```text
Review this export implementation.

Focus on:
- permission checks
- filter validation
- privacy-safe columns
- CSV escaping
- Thai text
- row limits
- audit logging
- private file storage
- no raw comments unless permission
```

---

## 27. Security Review Prompt

```text
Review this security-sensitive change.

Focus on:
- auth
- permissions
- ownership
- RLS/storage safety
- secret exposure
- safe errors
- audit logs
- tests

Block if:
- service role exposed
- unauthorized access possible
- ownership bypass possible
- private files public
- export privacy broken
```

---

# Automated Review Checklist

---

## 28. Commands to Request / Verify

Ask whether these were run:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

Not every task needs every command, but critical features should run relevant validation.

If commands were not run, the review should mention that.

---

## 29. Files to Inspect by Change Type

Database:

```text
migrations/
seed/
docs/database/
```

Backend:

```text
src/server/
src/app/api/
tests/unit/
tests/integration/
```

Frontend:

```text
src/app/
src/components/
src/styles/
tests/e2e/
```

Dashboard:

```text
src/server/dashboard/
src/components/dashboard/
docs/dashboard/
tests/unit/dashboard/
tests/integration/dashboard/
```

Security:

```text
src/server/auth/
src/server/storage/
src/server/validators/
migrations/RLS
docs/security/
tests/security/
```

Export:

```text
src/server/exports/
src/app/api/exports/
docs/backend/EXPORT_REPORTING_SERVICES.md
tests/integration/exports/
```

---

# Review Red Flags

---

## 30. Immediate Blockers

Block immediately if any are found:

```text
SUPABASE_SERVICE_ROLE_KEY in client code.
DATABASE_URL in client code.
Tourist photos bucket made public unintentionally.
Export includes email/LINE ID/provider_user_id by default.
Anonymous can access admin data.
Viewer can mutate or export detailed data.
Tourist can access another tourist data.
QR scan creates full visit without consent/profile.
Certificate download blocked by survey.
Dashboard counts QR scans as visits.
Estimated spending labeled revenue.
Missing satisfaction displayed as 0.
National ID/full address required.
LINE required for all tourists.
```

---

## 31. Request Changes Red Flags

Request changes if:

```text
server-side validation missing
permission check missing
ownership check missing
tests missing for critical logic
audit log missing for export
dashboard filters applied only frontend-side
unbounded export
raw Supabase errors returned
mobile flow not considered
```

---

## 32. Approve with Changes Candidates

Could approve with small follow-up if:

```text
minor copy issue
missing tooltip
small layout issue
non-critical test missing
minor refactor needed
documentation link missing
```

Only if there are no security/data/metric risks.

---

# Final Review Rule

Review as if real tourist data may be collected.

A change is not acceptable if it improves the UI but weakens data integrity, privacy, security, metric correctness, or tourist completion.
