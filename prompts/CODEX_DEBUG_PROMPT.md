# CODEX_DEBUG_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to debug issues in the **Southern Border Tourism Data & Intelligence Platform**.

Debugging must be systematic. Do not guess, patch randomly, or weaken security just to make an error disappear.

This project includes tourist flows, admin CMS, Supabase/PostgreSQL, storage, certificate generation, dashboard analytics, exports, permissions, and PDPA/privacy requirements. A bug fix can easily break data integrity or privacy if handled carelessly.

---

## 2. Debugging Mission

The mission is:

```text
Find the root cause, fix it safely, add regression protection where practical, and preserve production-quality behavior.
```

Debugging should improve:

```text
correctness
data integrity
security
privacy
UX reliability
dashboard accuracy
test coverage
documentation clarity
```

Debugging must not:

```text
remove validation
bypass permission checks
make files public
hide errors without fixing cause
change dashboard formulas silently
export private data
require LINE/email unnecessarily
```

---

## 3. Required Starting Instruction

Start debugging tasks with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Debug the issue systematically.
Find the root cause before changing code.
Keep the fix focused.
Do not weaken security, privacy, validation, permissions, ownership checks, dashboard formulas, or export safety.
```

---

## 4. Standard Debug Prompt

Use this template:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Bug:
[Describe the problem clearly.]

Observed behavior:
[What happens now? Include error message, route, action, screenshot description, log, or command output.]

Expected behavior:
[What should happen?]

Context:
[Which feature/module this affects and why it matters.]

Steps to reproduce:
1. ...
2. ...
3. ...

Relevant docs:
- CODEX_MAIN_PROMPT.md
- docs/testing/ACCEPTANCE_CRITERIA.md
- [add module-specific docs]

Files likely involved:
- [optional; let Codex inspect if uncertain]

Debugging requirements:
- Inspect relevant code before editing.
- Identify likely root cause.
- Fix root cause with minimal changes.
- Preserve existing intended behavior.
- Add/update test if practical.
- Run relevant validation command if available.
- Report any remaining risk.

Do not:
- Do not bypass validation.
- Do not remove permission checks.
- Do not expose private data.
- Do not change unrelated modules.
- Do not hide the error by swallowing it without handling.

Completion response:
Root cause
Fix summary
Files changed
Validation
Regression test added
Risks / Notes
Next suggested task
```

---

# Debugging Process

---

## 5. Required Debugging Steps

Codex should follow this order:

```text
1. Read the bug report carefully.
2. Inspect the relevant route/component/service/schema.
3. Reproduce or reason from logs if reproduction is not possible.
4. Identify the failing layer.
5. Trace data flow.
6. Identify root cause.
7. Apply minimal safe fix.
8. Add regression test if practical.
9. Run validation.
10. Report honestly.
```

---

## 6. Identify Failing Layer

Classify the issue:

```text
frontend UI
frontend state
server action/API route
validation schema
auth/permission
tourist ownership
service layer
repository/query
database constraint
RLS/storage policy
file upload/storage
certificate rendering
dashboard formula
export generation
deployment/environment
third-party integration
```

Do not fix the wrong layer.

Example:

```text
If backend rejects invalid file type correctly but UI shows raw error, fix UI error mapping, not backend validation.
```

---

## 7. Root Cause Statement

Every debug response must include a clear root cause.

Good:

```text
Root cause:
The certificate generation route called awardStamp before confirming the certificate insert succeeded, so duplicate certificate retries could create inconsistent stamp behavior.
```

Bad:

```text
Fixed the bug.
```

---

## 8. Minimal Fix Rule

Prefer the smallest safe fix that addresses the root cause.

Do not rewrite unrelated modules.

Do not combine debugging with a large refactor unless the issue is caused by structural duplication and the scope is approved.

---

# Debug Prompt by Bug Type

---

## 9. QR / Check-in Bug Prompt

Use for QR routing or check-in issues.

```text
Bug:
[active/invalid/inactive/expired QR behavior issue]

Expected rules:
- Active QR resolves to safe attraction/photo spot context.
- Invalid QR shows safe error.
- Inactive QR shows unavailable message.
- Expired QR shows expired/unavailable message.
- QR scan does not create full tourist visit.
- QR scan is not counted as visit.
- Public response excludes admin notes/private storage paths.

Debug:
- Inspect check-in route.
- Inspect check-in service/repository.
- Inspect code status/date logic.
- Inspect public response shape.
- Inspect funnel event logic if relevant.
- Add regression tests for active/invalid/inactive/expired.
```

Common root causes:

```text
code lookup not normalized
inactive flag ignored
expiration date timezone issue
route returns admin fields
public page treats QR scan as visit
missing seed/test code
```

---

## 10. Tourist Profile / Consent Bug Prompt

Use for minimal profile and consent issues.

```text
Bug:
[profile submit / consent / returning tourist issue]

Expected rules:
- Minimal form requires display name, origin, age group, consent.
- Consent checkbox is not pre-checked.
- Backend rejects missing consent.
- Email/LINE/phone are not required.
- Tourist identity is created or reused.
- Visit record is created.
- Consent record stores version/source/timestamp.

Debug:
- Inspect form schema.
- Inspect server validation.
- Inspect TouristService/VisitService/ConsentService.
- Inspect identity reuse logic.
- Inspect DB constraints.
- Add tests for missing consent and returning tourist.
```

Common root causes:

```text
frontend schema differs from backend schema
consent value not posted
backend expects email/LINE incorrectly
identity unique constraint not handled
guest token not persisted or not verified
```

---

## 11. Photo Upload Bug Prompt

Use for upload failures or unsafe uploads.

```text
Bug:
[photo upload issue]

Expected rules:
- JPEG/PNG/WebP accepted.
- SVG/PDF/HTML/JS rejected.
- File size limit enforced.
- Visit ownership verified.
- Storage path generated server-side.
- Tourist photo stored private/controlled.
- Metadata saved only after successful upload.
- Failed metadata insert cleans up or marks orphan.

Debug:
- Inspect upload component.
- Inspect upload route/action.
- Inspect server file validation.
- Inspect storage adapter.
- Inspect visit ownership guard.
- Inspect storage bucket configuration.
- Add tests for valid/invalid files and wrong ownership.
```

Common root causes:

```text
frontend sends wrong FormData field name
server trusts extension only
MIME validation too strict or too loose
bucket name mismatch
service role not available server-side
storage path uses original filename
ownership guard missing
```

Do not fix by:

```text
making bucket public
accepting all file types
removing ownership check
increasing size limit without reason
```

---

## 12. Certificate Generation Bug Prompt

Use for certificate preview/generation/download issues.

```text
Bug:
[certificate generation / preview / download issue]

Expected rules:
- Certificate uses display name, photo, attraction, visit date.
- Certificate excludes email/LINE/internal ID.
- Certificate generation is idempotent.
- Duplicate click does not create duplicates.
- Certificate file stored private/controlled.
- Stamp awarded after certificate.
- Survey is optional after certificate.

Debug:
- Inspect certificate preview component.
- Inspect certificate generation route/action.
- Inspect CertificateService.
- Inspect storage adapter.
- Inspect StampService.
- Inspect DB constraints for one certificate per visit.
- Add tests for duplicate generation and missing photo.
```

Common root causes:

```text
canvas/html-to-image font loading issue
storage upload fails
certificate insert not idempotent
duplicate button click creates multiple records
stamp unique conflict not handled
signed URL expired or not generated
photo does not belong to visit
```

Do not fix by:

```text
making certificate bucket public unintentionally
storing base64 in database
removing stamp unique constraint
blocking certificate behind survey
```

---

## 13. Stamp / Passport Bug Prompt

Use for duplicate stamps or passport access issues.

```text
Bug:
[stamp/passport issue]

Expected rules:
- One stamp per tourist-attraction.
- Repeat visits are allowed.
- Duplicate stamp is handled gracefully.
- Passport shows only current tourist's stamps.
- Passport response excludes provider_user_id and guest token.
- Guest passport works on same browser/device.

Debug:
- Inspect StampService.
- Inspect PassportService.
- Inspect tourist identity lookup.
- Inspect tourist_stamps unique constraint.
- Inspect ownership/access guard.
- Add tests for repeat visits and duplicate stamp.
```

Common root causes:

```text
unique constraint missing
wrong key used for stamp uniqueness
repeat visit incorrectly blocked
passport query returns all tourists
identity lookup mismatch
```

---

## 14. Survey Bug Prompt

Use for optional survey issues.

```text
Bug:
[survey submit / validation / dashboard update issue]

Expected rules:
- Survey is optional.
- Survey appears after certificate.
- Certificate remains downloadable if skipped.
- Scores are 1-5.
- Missing scores are null, not 0.
- Spending uses ranges.
- Comment is optional and length-limited.
- Wrong tourist ownership rejected.

Debug:
- Inspect survey form.
- Inspect validation schema.
- Inspect SurveyService.
- Inspect DB constraints.
- Inspect dashboard query if metric issue.
- Add tests for invalid score, optional fields, wrong ownership.
```

Common root causes:

```text
empty string converted to 0
null score averaged incorrectly
duplicate survey constraint missing
survey route trusts visit_id from client
comment required accidentally
```

---

## 15. Admin Permission Bug Prompt

Use when viewer/admin/super_admin behavior is wrong.

```text
Bug:
[admin permission issue]

Expected rules:
- Anonymous cannot access admin.
- Viewer is read-only.
- Viewer cannot export detailed data.
- Admin can manage content.
- Admin cannot manage users/roles unless permitted.
- Super admin can manage users/roles.
- Backend enforces permissions.

Debug:
- Inspect route middleware/guards.
- Inspect admin user lookup.
- Inspect permission helper.
- Inspect role_permission seed data.
- Inspect API route protection.
- Add direct API permission tests.
```

Common root causes:

```text
permission checked only in UI
role from localStorage trusted
inactive admin not checked
seed role missing permission
wrong permission key
API route missing guard
```

Do not fix by:

```text
granting all roles super_admin permissions
removing permission checks
trusting frontend state
```

---

## 16. Dashboard Metric Bug Prompt

Use for wrong dashboard numbers.

```text
Bug:
[dashboard metric incorrect]

Expected dashboard rules:
- QR scans are not visits.
- Tourist profiles are not verified unique people.
- Estimated spending is not revenue.
- Missing satisfaction is null/No data, not 0.
- Zero denominator returns null/No data.
- Averages exclude null.
- Filters apply server-side.
- Dashboard excludes private identifiers.

Debug:
- Inspect metric definition docs.
- Inspect dashboard service/query.
- Inspect filters.
- Inspect seed/test data.
- Compare expected vs actual formula.
- Add unit test for formula.
- Add integration test for seed dataset if practical.
```

Common root causes:

```text
counting funnel_events as visits
counting profiles without date-filtered visits
null converted to 0
wrong denominator
date filter applied to wrong timestamp
expense midpoint/open-ended range mishandled
frontend aggregation from stale/raw rows
```

Do not fix by:

```text
renaming metric to hide incorrect logic
showing fake zero
removing denominator details
```

---

## 17. Export Bug Prompt

Use for export CSV, permission, privacy, or performance issues.

```text
Bug:
[export issue]

Expected rules:
- Export requires auth.
- Export requires permission.
- Viewer cannot export detailed data.
- Filters validated.
- CSV escapes commas/quotes/newlines.
- Thai text preserved.
- Export excludes private identifiers by default.
- Export creates audit log.
- Large exports are limited or safe.

Debug:
- Inspect ExportService.
- Inspect permission guard.
- Inspect column definitions.
- Inspect CSV generation.
- Inspect audit logging.
- Inspect export row limit.
- Add tests for privacy exclusions and CSV escaping.
```

Default exports must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments unless permitted
```

Do not fix by:

```text
allowing viewer export
adding all columns to CSV
removing audit logging
making export file public
```

---

## 18. RLS / Storage Policy Bug Prompt

Use for Supabase RLS/storage access issues.

```text
Bug:
[RLS/storage access issue]

Expected rules:
- Public reads only safe published content.
- Sensitive tables are not publicly readable.
- Tourist photos are private/controlled.
- Certificate files are private/controlled.
- Export files are private.
- Service role key is server-only.

Debug:
- Inspect RLS policy.
- Inspect storage bucket policy.
- Inspect server vs client Supabase client usage.
- Inspect environment variables.
- Test anon/auth/admin access.
- Add security/RLS test if possible.
```

Common root causes:

```text
using (true) policy on sensitive table
bucket accidentally public
service role used in browser
missing signed URL generation
client direct access bypass design
```

Do not fix by:

```text
turning off RLS in production
making private bucket public
putting service role in frontend
```

---

## 19. Environment / Deployment Bug Prompt

Use for build/deploy/env issues.

```text
Bug:
[deployment/build/environment issue]

Expected rules:
- Build passes.
- Server-only env vars are server-only.
- Public env vars use NEXT_PUBLIC prefix only when safe.
- Migrations and seed data are clear.
- Storage buckets exist.
- Auth redirect URLs are correct.

Debug:
- Inspect error log.
- Inspect package scripts.
- Inspect env variable names.
- Inspect deployment platform config.
- Inspect Next.js server/client boundary.
- Fix env naming or server/client import issue safely.
```

Common root causes:

```text
server env imported in client component
missing env var in deployment
wrong Supabase URL/key
storage bucket missing
build command mismatch
ESM/CJS config issue
```

Do not fix by:

```text
moving server secret to NEXT_PUBLIC
hardcoding secrets
disabling typecheck permanently
```

---

# Debugging Safety Checklist

---

## 20. Before Editing

Codex should check:

```text
[ ] What is the observed behavior?
[ ] What is the expected behavior?
[ ] Which layer is failing?
[ ] Which docs define correct behavior?
[ ] Which tests should cover this?
[ ] Is this security/privacy sensitive?
[ ] Is this dashboard/export sensitive?
[ ] Is there a simpler root cause?
```

---

## 21. During Fix

Codex should:

```text
[ ] Make minimal changes.
[ ] Preserve architecture.
[ ] Preserve validation.
[ ] Preserve permission checks.
[ ] Preserve ownership checks.
[ ] Preserve privacy-safe defaults.
[ ] Preserve dashboard metric definitions.
[ ] Preserve export defaults.
[ ] Add regression test where practical.
```

---

## 22. After Fix

Codex should verify:

```text
[ ] Bug is fixed.
[ ] Related flow still works.
[ ] Tests pass or failure documented.
[ ] No new data leak.
[ ] No new permission bypass.
[ ] No metric definition drift.
[ ] No export privacy regression.
[ ] No secrets exposed.
```

---

# Validation Commands

---

## 23. Suggested Commands

Run as relevant:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

For database/RLS:

```bash
supabase db reset
supabase test
```

only if configured.

If a command is unavailable, not run, or fails, report honestly.

---

## 24. Regression Test Rule

If a bug is important enough to fix, consider adding a regression test.

Add a test especially when the bug affects:

```text
permissions
tourist ownership
consent
photo upload validation
certificate idempotency
stamp duplicates
dashboard metric formulas
export privacy
RLS/storage access
```

---

# Debug Completion Format

---

## 25. Required Completion Response

Codex must respond:

```text
Root cause
- ...

Fix summary
- ...

Files changed
- ...

Regression test added
- Yes/No. If no, explain why.

Validation
- npm run typecheck: passed/failed/not run
- npm run lint: passed/failed/not run
- npm run test: passed/failed/not run
- npm run build: passed/failed/not run

Risks / Notes
- ...

Next suggested task
- ...
```

---

## 26. If the Root Cause Is Unclear

If Codex cannot identify root cause with available information:

```text
State what was inspected.
State what evidence is missing.
Provide a safe diagnostic step.
Do not guess a risky fix.
Do not weaken security to bypass the error.
```

Acceptable response:

```text
I could not confirm the root cause because the failing API response/log is missing. I inspected the upload route and found validation is correct, but storage bucket configuration cannot be verified from code. Next step: verify the bucket exists and is private in Supabase, then rerun the upload test.
```

---

# Common Debug Anti-Patterns

---

## 27. Do Not Debug Like This

Do not:

```text
catch all errors and return success
remove validation to make submit pass
make bucket public to fix signed URL issue
grant viewer admin permissions to fix 403
require LINE to avoid guest identity bug
change metric label instead of fixing formula
ignore duplicate record issue
remove unique constraint
disable RLS
return raw errors to debug in UI
commit console logs with secrets
```

---

## 28. Safe Debug Examples

Good fixes:

```text
fix mismatched FormData field name
add missing server-side ownership check
handle unique constraint as idempotent existing result
normalize QR code before lookup
exclude null satisfaction before averaging
add missing index for dashboard query
fix export column whitelist
map storage error to safe user message
```

Unsafe fixes:

```text
accept all MIME types
make visit-photos bucket public
remove tourist_stamps unique constraint
trust client tourist_id
disable permission guard
show raw Supabase error to user
```

---

# Debug Severity Guide

---

## 29. Critical Bugs

Treat as critical:

```text
service role exposed
anonymous admin access
tourist data leakage
private photo/certificate public
export privacy leak
broken QR-to-certificate flow
wrong core dashboard metric
unsafe file upload
consent missing
```

Critical bugs require:

```text
focused fix
regression test if possible
security/privacy review
clear validation
```

---

## 30. High Bugs

Examples:

```text
admin CMS cannot create QR
photo upload fails on mobile
certificate duplicate records
dashboard filter incorrect
survey cannot submit
export fails for normal data
```

High bugs should be fixed before MVP release.

---

## 31. Medium/Low Bugs

Examples:

```text
minor visual spacing
tooltip wording
non-blocking warning
minor admin table layout issue
```

Fix when practical but do not let polish hide critical issues.

---

# Final Debugging Rule

Debugging must make the platform more correct and safer.

A bug fix is not acceptable if it makes the system easier to use by weakening validation, permissions, privacy, storage safety, export safety, or dashboard correctness.
