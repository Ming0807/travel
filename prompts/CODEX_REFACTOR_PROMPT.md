# CODEX_REFACTOR_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to refactor code in the **Southern Border Tourism Data & Intelligence Platform**.

Refactoring means improving structure, readability, maintainability, typing, performance, or testability **without changing intended behavior**.

This project is a production-oriented tourism database and dashboard platform. Refactors must not weaken:

```text
tourist flow
database integrity
security
PDPA/privacy
permissions
dashboard metric definitions
export privacy
file upload safety
certificate generation
```

---

## 2. Refactor Mission

The mission of refactoring is:

```text
Make the codebase easier to maintain and safer to extend without breaking existing behavior.
```

Good refactors should improve:

```text
separation of concerns
type safety
service/repository boundaries
validation consistency
permission enforcement
testability
readability
performance
duplication
documentation alignment
```

Bad refactors:

```text
change business rules silently
remove validation
weaken permission checks
change dashboard formulas without tests/docs
expose private data
rewrite unrelated modules
hide bugs instead of fixing root cause
```

---

## 3. Required Starting Instruction

Start every refactor task with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Refactor only the requested area.
Preserve existing behavior unless an intentional behavior change is explicitly requested.
Do not weaken security, privacy, validation, permissions, dashboard metric definitions, or tests.
```

---

## 4. Standard Refactor Prompt

Use this prompt:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Refactor [specific module/file/area] to improve [reason].

Context:
[Explain why this refactor is needed.]

Read first:
- CODEX_MAIN_PROMPT.md
- CODEX_REVIEW_PROMPT.md
- docs/architecture/ARCHITECTURE_OVERVIEW.md
- docs/testing/ACCEPTANCE_CRITERIA.md
- checklists/BACKEND_CHECKLIST.md
- checklists/FRONTEND_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- [add task-specific docs]

Scope:
- Refactor only [specific files/folders].
- Preserve public behavior.
- Preserve API contracts unless explicitly stated.
- Preserve database schema unless explicitly stated.
- Preserve dashboard formulas unless explicitly stated.

Requirements:
- Improve structure/readability/testability.
- Keep TypeScript types strict.
- Remove duplication if safe.
- Keep validation server-side.
- Keep permission/ownership checks server-side.
- Keep errors safe.
- Update tests if needed.
- Update docs if behavior or architecture changes.

Do not:
- Do not rewrite unrelated modules.
- Do not change business rules silently.
- Do not remove tests.
- Do not weaken validation.
- Do not weaken authorization.
- Do not expose private data.
- Do not change dashboard metric meaning.
- Do not change export columns without explicit requirement.

Validation:
- Run relevant tests/commands if available.
- Report what was not run and why.

Completion response:
Summary
Files changed
Validation
Behavior changes
Risks / Notes
Next suggested task
```

---

# Refactor Safety Rules

---

## 5. Behavior Preservation Rule

Unless the task explicitly says otherwise:

```text
input behavior must remain the same
output behavior must remain the same
database writes must remain equivalent
permissions must remain the same or stricter
privacy protections must remain the same or stricter
dashboard metric definitions must remain the same
export default columns must remain the same or safer
```

Any behavior change must be documented in the completion response.

---

## 6. Security Preservation Rule

During refactor, never remove or weaken:

```text
admin authentication
permission checks
tourist ownership checks
server-side validation
file type validation
file size validation
consent checks
export permission checks
audit logging for sensitive actions
private storage controls
safe error mapping
```

Security can be made stricter, but not weaker.

---

## 7. Privacy Preservation Rule

During refactor, never expose:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw IP
raw user agent
private photo path
private certificate path
raw comments
service role key
database URL
```

Privacy-safe defaults must remain.

---

## 8. Dashboard Preservation Rule

Dashboard refactors must preserve metric definitions.

Do not change:

```text
QR scans are not visits.
Tourist profiles are system profiles, not verified unique people.
Estimated spending is not revenue.
Missing satisfaction is null/No data, not zero.
Zero denominator returns null/No data.
Average satisfaction excludes null values.
```

If a dashboard formula changes, update:

```text
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
tests
dashboard tooltips
acceptance criteria if needed
```

---

## 9. Export Preservation Rule

Export refactors must preserve privacy-safe defaults.

Default exports must continue excluding:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments unless permission allows
```

Do not broaden export fields during refactor.

---

# Refactor Types

---

## 10. Service Layer Refactor Prompt

Use when moving business logic into services.

```text
Task:
Refactor [workflow] logic into a dedicated service layer.

Requirements:
- Create or improve service file under src/server/services.
- Keep route handler/server action thin.
- Keep validation before service execution.
- Keep permission/ownership checks before sensitive service calls.
- Return consistent ServiceResult.
- Keep database access in repository layer if existing.
- Add/update unit or integration tests.

Security:
- Do not remove auth/permission/ownership checks.
- Do not expose raw database errors.
- Do not return private identifiers.

Validation:
- Run unit/integration tests if possible.
```

Good candidates:

```text
TouristService
VisitService
PhotoService
CertificateService
StampService
SurveyService
DashboardService
ExportService
AuditService
```

---

## 11. Repository Layer Refactor Prompt

Use when centralizing database queries.

```text
Task:
Refactor database queries for [area] into repository functions.

Requirements:
- Create or improve repository file under src/server/repositories.
- Keep SQL/query logic out of UI components.
- Keep query functions typed.
- Keep filters validated before query.
- Avoid over-fetching.
- Return only required columns.
- Preserve existing query behavior.
- Add tests or update integration tests if practical.

Do not:
- Do not return sensitive columns by default.
- Do not remove indexes/constraints.
- Do not change dashboard formulas silently.
```

---

## 12. Validation Refactor Prompt

Use when centralizing Zod schemas or validation logic.

```text
Task:
Refactor validation for [area] into centralized schemas.

Requirements:
- Create or update schemas under src/server/validators or src/lib/validation.
- Use clear field-level error messages.
- Reuse schemas in route handlers/server actions.
- Keep server-side validation mandatory.
- Add tests for valid and invalid inputs.
- Preserve privacy/data-minimization rules.

Do not:
- Do not make email/LINE/phone required for certificate flow.
- Do not accept national ID/full address.
- Do not loosen file upload validation.
- Do not remove consent requirement.
```

---

## 13. Auth/Permission Refactor Prompt

Use when improving RBAC helpers.

```text
Task:
Refactor authentication and permission helpers.

Requirements:
- Centralize current admin lookup.
- Centralize active admin check.
- Centralize permission checks.
- Support requirePermission, requireAnyPermission, requireAllPermissions if needed.
- Ensure inactive admins are blocked.
- Ensure viewer remains read-only.
- Add permission tests.
- Preserve route/API behavior.

Do not:
- Do not trust client role/localStorage.
- Do not weaken admin checks.
- Do not expose role/permission internals in unsafe responses.
```

---

## 14. Tourist Ownership Refactor Prompt

Use when standardizing ownership checks.

```text
Task:
Refactor tourist ownership checks for visit/photo/certificate/survey/passport access.

Requirements:
- Centralize guest/identity verification.
- Centralize requireTouristAccessToVisit.
- Centralize requireTouristAccessToPassport.
- Centralize requireTouristAccessToCertificate.
- Ensure wrong tourist gets 403 or safe 404.
- Add tests for tourist A vs tourist B.
- Preserve guest and optional LINE/email flow.

Do not:
- Do not trust tourist_id from browser.
- Do not expose whether another tourist's resource exists unnecessarily.
- Do not require LINE for ownership.
```

---

## 15. Storage Refactor Prompt

Use when centralizing file upload/storage code.

```text
Task:
Refactor storage/file handling into a centralized storage adapter.

Requirements:
- Centralize bucket names.
- Centralize path generation.
- Centralize signed URL creation.
- Centralize file validation.
- Centralize delete/cleanup helpers.
- Keep tourist photos private/controlled.
- Keep certificates private/controlled.
- Add tests for path safety and invalid files.

Do not:
- Do not store signed URLs permanently.
- Do not use original filename as storage filename.
- Do not include personal data in storage paths.
- Do not make private buckets public.
```

---

## 16. Dashboard Refactor Prompt

Use when improving dashboard code organization.

```text
Task:
Refactor dashboard metrics into clear server-side metric services.

Requirements:
- Keep metric definitions aligned with docs.
- Keep dashboard filters validated.
- Keep metrics server-side.
- Keep response aggregated and privacy-safe.
- Reuse shared calculation helpers.
- Add unit tests for formulas.
- Add integration tests for known seed data if practical.
- Update docs if definitions change.

Critical rules:
- QR scans are not visits.
- Estimated spending is not revenue.
- Missing satisfaction is not zero.
- Tourist Profiles are not verified unique people.
```

---

## 17. Export Refactor Prompt

Use when improving CSV/export code.

```text
Task:
Refactor export generation into a safe ExportService.

Requirements:
- Centralize export type definitions.
- Centralize column definitions.
- Centralize CSV escaping.
- Centralize row limit enforcement.
- Centralize permission checks.
- Create audit log for exports.
- Preserve privacy-safe default columns.
- Add tests for CSV escaping and privacy exclusions.

Do not:
- Do not include private identifiers by default.
- Do not allow unbounded exports.
- Do not make export files public.
- Do not skip audit logging.
```

---

## 18. Frontend Component Refactor Prompt

Use when improving UI component structure.

```text
Task:
Refactor [frontend area] into reusable, accessible components.

Requirements:
- Keep existing behavior.
- Improve component boundaries.
- Extract repeated UI patterns.
- Keep mobile-first behavior.
- Keep loading/empty/error states.
- Keep form accessibility.
- Keep privacy UX.
- Add/update component tests if practical.

Do not:
- Do not remove consent text.
- Do not hide certificate download.
- Do not make survey mandatory.
- Do not require LINE/email.
- Do not break mobile layout.
```

---

## 19. Form Refactor Prompt

Use when improving form components and validation UX.

```text
Task:
Refactor [form] to improve validation, accessibility, and maintainability.

Requirements:
- Keep required fields unchanged unless explicitly requested.
- Keep server-side validation.
- Improve field labels/errors.
- Add loading state.
- Prevent duplicate submit.
- Ensure accessibility labels.
- Add tests for validation/errors.

Important:
- Minimal tourist form must remain short.
- Consent checkbox must not be pre-checked.
- Survey must remain optional.
```

---

## 20. Test Refactor Prompt

Use when improving test organization.

```text
Task:
Refactor tests for [area] to improve coverage and maintainability.

Requirements:
- Keep test intent clear.
- Remove duplicate setup.
- Add helper fixtures if useful.
- Do not remove important negative tests.
- Ensure tests use synthetic data only.
- Ensure tests do not depend on production services.
- Keep security/privacy tests.

Do not:
- Do not delete failing tests without fixing cause.
- Do not weaken assertions for privacy/security.
- Do not skip dashboard formula edge cases.
```

---

# Pre-Refactor Checklist

---

## 21. Before Refactoring

Codex should verify:

```text
[ ] What behavior must be preserved?
[ ] Which tests currently cover this area?
[ ] Which docs define this behavior?
[ ] Which files are in scope?
[ ] Which files are out of scope?
[ ] Are there security/privacy implications?
[ ] Are there dashboard/export implications?
[ ] Can the refactor be smaller?
```

If the scope is too large, split the refactor into smaller tasks.

---

## 22. Refactor Risk Assessment

Before changing code, identify risk:

```text
low: component extraction, naming cleanup, small utility extraction
medium: service/repository extraction, validation centralization
high: auth/permission refactor, database query refactor, dashboard metric refactor, export refactor, storage refactor
critical: schema migration, RLS/storage policy changes, certificate generation changes
```

High/critical refactors require stronger tests and review.

---

# Post-Refactor Checklist

---

## 23. After Refactoring

Verify:

```text
[ ] Existing behavior preserved.
[ ] Tests pass or failures documented.
[ ] Typecheck passes or failure documented.
[ ] Lint passes or failure documented.
[ ] Security checks remain.
[ ] Privacy defaults remain.
[ ] UI still works.
[ ] Dashboard metrics unchanged unless documented.
[ ] Exports unchanged unless documented.
[ ] Docs updated if architecture changed.
```

---

## 24. Required Validation Commands

Run as applicable:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run build
```

For UI behavior:

```bash
npm run test:e2e
```

If a command is unavailable or not run, report why.

---

## 25. Refactor Completion Format

Codex must respond:

```text
Summary
- What was refactored and why.

Files changed
- path/to/file

Behavior changes
- None.
- Or list intentional changes.

Validation
- npm run typecheck: passed/failed/not run
- npm run lint: passed/failed/not run
- npm run test: passed/failed/not run
- npm run build: passed/failed/not run

Risks / Notes
- Any remaining risk or follow-up.

Next suggested task
- One clear next step.
```

---

# Refactor Review Checklist

---

## 26. Reviewer Questions

When reviewing refactor, ask:

```text
Did behavior change?
Were tests updated?
Did validation remain server-side?
Did permission checks remain server-side?
Did ownership checks remain server-side?
Did privacy-safe defaults remain?
Did dashboard formulas remain correct?
Did export columns remain safe?
Did storage paths remain safe?
Was scope limited?
```

---

## 27. Refactor Blockers

Block refactor if:

```text
service role key moves to frontend
permission check removed
ownership check removed
consent check removed
photo upload validation loosened
export includes private identifiers
dashboard formula changes incorrectly
QR scan becomes visit
certificate flow requires survey/LINE/email
tests removed without replacement
```

---

## 28. Common Refactor Mistakes

Avoid:

```text
rewriting entire feature when extracting one service
mixing refactor with new feature
moving server-only code into client component
weakening TypeScript types with any
removing edge-case tests
renaming metrics without updating docs
changing null/zero behavior
changing export fields silently
removing audit logs
```

---

## 29. Safe Refactor Examples

Good refactors:

```text
extract repeated KPI card UI into KpiCard
move dashboard formulas into dashboard-metrics.ts
centralize file validation in file-validation.ts
centralize permission checks in authz.ts
move CSV escaping into csv-utils.ts
extract tourist ownership guard into requireTouristVisitAccess
```

Unsafe without explicit task:

```text
changing visit count formula
changing schema relationships
making buckets public
removing consent table
requiring LINE login
removing export permission checks
```

---

## 30. Final Refactor Rule

Refactoring should make the system safer and easier to build, not less predictable.

If the refactor changes business behavior, dashboard numbers, security posture, or privacy guarantees, it is no longer just a refactor and must be treated as a feature or architecture change.
