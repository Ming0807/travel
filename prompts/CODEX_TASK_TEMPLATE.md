# CODEX_TASK_TEMPLATE.md

## 1. Purpose

Use this template to create focused development tasks for Codex in the **Southern Border Tourism Data & Intelligence Platform**.

Every Codex task must be clear, scoped, testable, and aligned with the project architecture.

This project is a production-oriented tourism database and dashboard platform for Yala, Pattani, and Narathiwat. Do not treat tasks as simple CRUD unless the task explicitly says so.

---

## 2. How to Use This Template

Copy this template into a new Codex task prompt and fill in each section.

A good Codex task should specify:

```text
what to build
why it matters
which files/docs to read
which files to edit
what constraints must be followed
what tests/validation are expected
what not to do
what output format Codex should use
```

Keep each task focused. Do not ask Codex to build the whole system in one task.

---

## 3. Task Header Template

```text
Task Title:
[Short imperative title]

Task Type:
[setup | database | backend | frontend | dashboard | security | testing | documentation | refactor | bugfix]

Priority:
[critical | high | medium | low]

Target Phase:
[PHASE_01_PROJECT_SETUP | PHASE_02_DATABASE_SCHEMA | PHASE_03_AUTH_IDENTITY | PHASE_04_PUBLIC_ATTRACTION_PAGES | PHASE_05_QR_CHECKIN_FLOW | PHASE_06_CERTIFICATE_GENERATION | PHASE_07_SURVEY_EXPENSE_SATISFACTION | PHASE_08_ADMIN_BACKOFFICE | PHASE_09_DASHBOARD | PHASE_10_REPORT_EXPORT | PHASE_11_LINE_LIFF_OPTIONAL | PHASE_12_TESTING_HARDENING | PHASE_13_DEPLOYMENT]

Estimated Scope:
[small | medium | large]

Expected Output:
[code changes | migration | docs | tests | analysis | checklist update]
```

---

## 4. Standard Task Prompt Structure

Use this structure for most tasks:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Please complete the task below.

Task:
[Describe exactly what to build or change.]

Context:
[Explain the business/product reason.]

Read first:
[List documents Codex must inspect before editing.]

Files likely involved:
[List likely files/folders. Say Codex should inspect existing structure first.]

Requirements:
[List concrete functional requirements.]

Security/Privacy requirements:
[List relevant security/PDPA constraints.]

UX requirements:
[List relevant UI/UX constraints.]

Database requirements:
[List schema/constraint/index rules if relevant.]

Testing requirements:
[List tests or validation commands expected.]

Do not:
[List mistakes to avoid.]

Completion response:
Use this format:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 5. Required Opening Instruction

Every task should begin with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Read the relevant documentation before editing.
Keep changes focused.
Do not break existing architecture.
Do not expose private data or secrets.
```

This reminds Codex to treat the project seriously.

---

## 6. Required Documentation References

For most tasks, include:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
docs/architecture/ARCHITECTURE_OVERVIEW.md
docs/testing/ACCEPTANCE_CRITERIA.md
```

Then add task-specific docs.

Examples:

Database task:

```text
docs/database/DATABASE_REQUIREMENTS.md
docs/database/ERD_OVERVIEW.md
docs/database/DATA_DICTIONARY.md
docs/database/RELATIONSHIPS.md
docs/database/INDEXING_STRATEGY.md
checklists/DATABASE_CHECKLIST.md
```

Frontend task:

```text
docs/frontend/FRONTEND_REQUIREMENTS.md
docs/frontend/UI_UX_PRINCIPLES.md
docs/frontend/DESIGN_SYSTEM.md
checklists/FRONTEND_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
```

Backend task:

```text
docs/backend/BACKEND_REQUIREMENTS.md
docs/backend/API_DESIGN_GUIDELINES.md
docs/backend/VALIDATION_RULES.md
docs/backend/ERROR_HANDLING.md
checklists/BACKEND_CHECKLIST.md
```

Security task:

```text
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/security/ROW_LEVEL_SECURITY.md
checklists/SECURITY_PDPA_CHECKLIST.md
```

Dashboard task:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/dashboard/EXECUTIVE_DASHBOARD.md
checklists/DASHBOARD_CHECKLIST.md
```

Testing task:

```text
docs/testing/TESTING_STRATEGY.md
docs/testing/UNIT_TEST_PLAN.md
docs/testing/INTEGRATION_TEST_PLAN.md
docs/testing/E2E_TEST_PLAN.md
checklists/TESTING_CHECKLIST.md
```

---

# Task Templates by Category

---

## 7. Project Setup Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Set up the initial Next.js + TypeScript + Tailwind CSS project foundation.

Context:
The project must start from a clean, production-oriented foundation before database and feature development.

Read first:
- CODEX_MAIN_PROMPT.md
- PROJECT_OVERVIEW.md
- MVP_SCOPE.md
- checklists/PROJECT_SETUP_CHECKLIST.md
- docs/architecture/ARCHITECTURE_OVERVIEW.md
- docs/frontend/FRONTEND_REQUIREMENTS.md

Requirements:
- Create or verify Next.js App Router setup.
- Enable TypeScript strict mode.
- Configure Tailwind CSS.
- Create recommended src folder structure.
- Add basic app layout.
- Add placeholder public and admin areas if appropriate.
- Add package scripts for dev, build, lint, typecheck, test.
- Add .env.example with required variable names only.
- Ensure .env.local is ignored.
- Do not add unnecessary dependencies.

Security/Privacy requirements:
- Do not commit secrets.
- Do not expose SUPABASE_SERVICE_ROLE_KEY in frontend.
- Environment variables must follow ENVIRONMENT.md.

Testing requirements:
- Run or document:
  - npm run typecheck
  - npm run lint
  - npm run build

Do not:
- Do not build feature-heavy pages yet.
- Do not hardcode secrets.
- Do not skip TypeScript strict mode.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 8. Database Schema Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Create the initial PostgreSQL/Supabase database schema for the tourism platform.

Context:
The database must support tourists, attractions, visits, QR/check-in flow, photo uploads, certificates, stamps, surveys, expenses, satisfaction, consent, admin roles, exports, audit logs, and dashboard analytics.

Read first:
- CODEX_MAIN_PROMPT.md
- docs/database/DATABASE_REQUIREMENTS.md
- docs/database/ERD_OVERVIEW.md
- docs/database/TABLE_GROUPS.md
- docs/database/DATA_DICTIONARY.md
- docs/database/RELATIONSHIPS.md
- docs/database/INDEXING_STRATEGY.md
- docs/database/DATA_QUALITY_RULES.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/DATABASE_CHECKLIST.md

Requirements:
- Create migration files for core tables.
- Add primary keys.
- Add foreign keys.
- Add required unique constraints.
- Add required check constraints.
- Add indexes for dashboard/filter queries.
- Add timestamp fields.
- Add soft delete/deactivate fields where appropriate.
- Add consent_records table.
- Add audit_logs table.
- Add admin roles/permissions tables.
- Add export_jobs table if export storage is planned.

Critical constraints:
- unique attractions.slug
- unique checkin_codes.code
- unique tourist_identities(provider, provider_user_id)
- unique tourist_stamps(tourist_id, attraction_id)
- controlled satisfaction score range 1-5
- group_size >= 1 if not null
- nights >= 0 if not null

Privacy requirements:
- Do not collect national ID.
- Do not collect full address.
- Do not require phone/email/LINE for certificate.
- Use age_group instead of exact birthdate.
- Storage paths must not contain personal data.

Testing requirements:
- Ensure migrations can run on an empty database.
- Add or update seed data if requested.
- Document any assumptions.

Do not:
- Do not prevent repeat visits with the stamp unique rule.
- Do not store image base64 in database.
- Do not store signed URLs permanently.
- Do not make QR scans equal visits.
- Do not over-collect personal data.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 9. Seed Data Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Create seed data for the MVP tourism platform.

Context:
The system needs stable reference data before tourist flow, dashboard, and admin CMS can work.

Read first:
- docs/database/SEED_DATA_GUIDE.md
- docs/database/DATA_DICTIONARY.md
- checklists/DATABASE_CHECKLIST.md
- checklists/PROJECT_SETUP_CHECKLIST.md

Requirements:
- Seed Yala, Pattani, and Narathiwat.
- Seed district data or provide a structured placeholder if full district list is not available.
- Seed countries including Thailand.
- Seed age groups.
- Seed preferred languages.
- Seed transport modes.
- Seed travel purposes.
- Seed travel companions.
- Seed spending ranges.
- Seed expense categories.
- Seed attraction types.
- Seed admin roles and permissions.
- Seed certificate template placeholder.
- Seed sample attraction/photo spot/check-in code for staging/demo if appropriate.

Rules:
- Seed scripts must be rerunnable safely.
- Do not create duplicate rows.
- Separate production seed from test/demo seed where possible.
- Use synthetic data only for demo tourist data.

Testing:
- Run seed script against local/test DB if possible.
- Verify important reference rows exist.

Do not:
- Do not seed real personal tourist data.
- Do not seed real LINE IDs.
- Do not hardcode production secrets.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 10. Backend Service Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement [service name] for [specific workflow].

Context:
[Explain why this backend service matters to the tourist/admin/dashboard flow.]

Read first:
- CODEX_MAIN_PROMPT.md
- docs/backend/BACKEND_REQUIREMENTS.md
- docs/backend/API_DESIGN_GUIDELINES.md
- docs/backend/VALIDATION_RULES.md
- docs/backend/ERROR_HANDLING.md
- docs/security/SECURITY_REQUIREMENTS.md
- checklists/BACKEND_CHECKLIST.md

Requirements:
- Implement service method(s) with clear input/output types.
- Validate input using centralized schemas.
- Enforce authentication/permission/ownership as relevant.
- Use repository layer for DB access if existing.
- Return consistent ServiceResult.
- Map known errors to stable error codes.
- Do not leak internal errors to UI.
- Add tests where practical.

Security requirements:
- Do not trust client-provided role.
- Do not trust tourist_id from localStorage.
- Verify ownership server-side.
- Do not expose private storage paths unnecessarily.
- Do not log secrets.

Testing requirements:
- Unit tests for logic.
- Integration tests if DB/storage interaction exists.
- Run relevant test command or document why not run.

Do not:
- Do not put business logic only in UI.
- Do not return raw Supabase errors.
- Do not skip permission checks.
- Do not over-fetch raw personal data.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 11. QR Check-in Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement the public QR/check-in flow for active, invalid, inactive, and expired check-in codes.

Context:
QR check-in is the main tourist entry point. It must be fast, safe, and clear.

Read first:
- docs/modules/MODULE_02_QR_CHECKIN.md
- docs/frontend/TOURIST_SIDE_PAGES.md
- docs/backend/API_ENDPOINTS.md
- docs/security/SECURITY_REQUIREMENTS.md
- docs/dashboard/FUNNEL_ANALYTICS_DASHBOARD.md
- checklists/FRONTEND_CHECKLIST.md
- checklists/BACKEND_CHECKLIST.md
- checklists/UI_UX_CHECKLIST.md

Requirements:
- Add public route /checkin/[code] or project-equivalent.
- Resolve active check-in code.
- Show attraction/photo spot context.
- Show certificate benefit clearly.
- Handle invalid code safely.
- Handle inactive code safely.
- Handle expired code safely.
- Do not require login or LINE.
- Record qr_scanned/landing_viewed funnel event if funnel tracking exists.
- Return only public-safe fields.

Security requirements:
- Do not expose admin notes.
- Do not expose private storage paths.
- Do not show stack traces.
- Validate code format.

UX requirements:
- Tourist should understand benefit within 5 seconds.
- CTA must be clear on mobile.
- Thai text required.
- English support if multilingual is implemented.

Testing requirements:
- Test active QR.
- Test invalid QR.
- Test inactive QR.
- Test expired QR.
- Test public response privacy.
- Add E2E or manual test notes.

Do not:
- Do not create full tourist/visit record from QR scan alone.
- Do not count QR scan as visit.
- Do not require LINE.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 12. Tourist Profile and Consent Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement the minimal tourist profile and consent step after QR/check-in.

Context:
This step collects only the necessary data before certificate generation. It must be low-friction and privacy-safe.

Read first:
- docs/modules/MODULE_03_TOURIST_PROFILE.md
- docs/security/CONSENT_MANAGEMENT.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/frontend/FORM_UX_RULES.md
- checklists/UI_UX_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md

Requirements:
- Create minimal profile form.
- Required fields: display name, origin country/province, age group, consent.
- Support guest tourist identity.
- Create or reuse tourist profile.
- Create visit record.
- Create consent record.
- Store consent version/source/timestamp.
- Backend validates consent.
- Prevent duplicate tourist identity where possible.
- Prepare returning tourist prefill/reuse behavior if existing identity is found.

Privacy requirements:
- No national ID.
- No full address.
- No exact birthdate.
- No phone required.
- No email required.
- No LINE required.
- Consent checkbox must not be pre-checked.

Testing requirements:
- Validate missing fields.
- Validate missing consent.
- Test new guest profile creation.
- Test returning guest profile reuse if implemented.
- Test consent record creation.

Do not:
- Do not ask long survey questions here.
- Do not block non-LINE users.
- Do not trust tourist_id from client.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 13. Photo Upload Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement secure tourist photo upload for certificate generation.

Context:
Tourist photo upload is required for the certificate reward and is privacy-sensitive.

Read first:
- docs/modules/MODULE_05_PHOTO_UPLOAD.md
- docs/backend/FILE_UPLOAD_FLOW.md
- docs/security/IMAGE_UPLOAD_SECURITY.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- checklists/PERFORMANCE_CHECKLIST.md

Requirements:
- Build photo upload UI.
- Accept JPEG, PNG, WebP.
- Reject SVG, PDF, HTML, JS, oversized, empty files.
- Validate file type/size server-side.
- Verify visit ownership.
- Generate storage path server-side.
- Store file in private/controlled bucket.
- Store metadata in visit_photos.
- Show preview/loading/error/retry states.
- Record photo_uploaded funnel event if available.

Security/privacy:
- Do not use original filename as storage filename.
- Do not include tourist name/email/LINE ID in path.
- Do not make tourist photos public by default.
- Do not store base64 in database.
- Do not store signed URL permanently.

Testing:
- Valid JPEG/PNG/WebP.
- Invalid SVG/PDF.
- Large file rejection.
- Wrong visit ownership rejection.
- Storage path safety.

Do not:
- Do not trust frontend validation only.
- Do not expose service role key.
- Do not proceed to certificate without successful upload.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 14. Certificate Generation Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement certificate generation after photo upload.

Context:
The certificate is the main incentive that encourages tourists to provide useful data. It must feel rewarding and must be privacy-safe.

Read first:
- docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
- docs/backend/CERTIFICATE_RENDERING_FLOW.md
- docs/security/IMAGE_UPLOAD_SECURITY.md
- docs/business/TOURIST_INCENTIVE_STRATEGY.md
- checklists/UI_UX_CHECKLIST.md
- checklists/BACKEND_CHECKLIST.md

Requirements:
- Show certificate preview.
- Include display name, photo, attraction, visit date.
- Generate certificate image/file.
- Store certificate metadata.
- Store certificate file in private/controlled bucket.
- Update visit status.
- Award stamp.
- Handle duplicate generation idempotently.
- Show download button.
- Show stamp earned/already-earned state.
- Show optional survey CTA after certificate.
- Record certificate_generated funnel event if available.

Privacy:
- Do not include email, LINE ID, internal tourist ID, phone, national ID, full address.
- Do not make certificate public by default.
- Do not store signed URL permanently.

Testing:
- Valid certificate generation.
- Duplicate generation.
- Missing photo rejection.
- Wrong tourist ownership rejection.
- Stamp duplicate handling.
- Long display name layout.

Do not:
- Do not block certificate behind survey.
- Do not create duplicate certificate on double click.
- Do not expose private storage path unnecessarily.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 15. Survey Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement optional post-certificate survey for travel behavior, expense, and satisfaction.

Context:
The survey collects deeper planning data after the tourist already receives the certificate reward.

Read first:
- docs/modules/MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
- docs/dashboard/TRAVEL_BEHAVIOR_DASHBOARD.md
- docs/dashboard/EXPENSE_DASHBOARD.md
- docs/dashboard/SATISFACTION_DASHBOARD.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/frontend/FORM_UX_RULES.md

Requirements:
- Survey appears after certificate.
- Survey is optional.
- Certificate remains downloadable if skipped.
- Collect travel companion.
- Collect group size.
- Collect transport mode.
- Collect travel purpose.
- Collect overnight status/nights.
- Collect spending range.
- Collect satisfaction score.
- Collect revisit/recommendation intention.
- Comment is optional.
- Validate all fields server-side.
- Store survey/expense/travel behavior correctly.
- Record survey_completed funnel event if available.

Privacy:
- Do not ask exact income.
- Do not ask sensitive personal questions.
- Do not require comment.
- Raw comments must not be exported by default.

Testing:
- Valid survey.
- Skipped survey.
- Invalid score.
- Duplicate survey policy.
- Wrong visit ownership.
- Missing optional fields.

Do not:
- Do not show missing satisfaction as 0.
- Do not block certificate download.
- Do not make survey too long.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 16. Admin CMS Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement admin CMS for [attractions | photo spots | check-in codes | media].

Context:
Admin users need to manage public tourism content and QR/check-in points without developer help.

Read first:
- docs/modules/MODULE_09_ADMIN_ATTRACTION_CMS.md
- docs/frontend/ADMIN_SIDE_PAGES.md
- docs/backend/AUTHORIZATION_RULES.md
- docs/security/ROLE_PERMISSION_MATRIX.md
- checklists/FRONTEND_CHECKLIST.md
- checklists/BACKEND_CHECKLIST.md

Requirements:
- Protected admin route.
- Permission-based access.
- List page.
- Create form.
- Edit form.
- Activate/deactivate or publish/unpublish as relevant.
- Validation errors.
- Loading/success/error states.
- Audit log for important actions.
- Public status reflected in public pages.

Security:
- Backend permission checks are required.
- Viewer cannot mutate data.
- Destructive actions require confirmation.
- Do not expose private fields publicly.

Testing:
- Admin can create/update.
- Viewer cannot create/update.
- Invalid input rejected.
- Audit log created.
- Public page respects publish status.

Do not:
- Do not rely only on frontend hidden buttons.
- Do not hard delete historical data without clear design.
- Do not expose admin notes on public pages.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 17. Dashboard Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement [dashboard section or metric group].

Context:
Dashboard metrics must support tourism planning and sustainable tourism decisions. Accuracy matters more than decorative charts.

Read first:
- docs/dashboard/DASHBOARD_REQUIREMENTS.md
- docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
- docs/dashboard/[RELEVANT_DASHBOARD_DOC].md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/DASHBOARD_CHECKLIST.md
- docs/testing/ACCEPTANCE_CRITERIA.md

Requirements:
- Calculate metrics server-side.
- Validate filters.
- Support date/province/attraction filters where relevant.
- Return aggregated data only.
- Add loading/empty/error states.
- Add tooltips/definitions where needed.
- Show data limitations.
- Add tests for metric calculation where practical.

Critical metric rules:
- QR scans are not visits.
- Tourist profiles are not verified unique people.
- Estimated spending is not revenue.
- Missing satisfaction is null/No data, not zero.
- Zero denominator returns null/No data.
- Response counts should be shown with averages.

Privacy:
- Do not return email, LINE ID, provider_user_id, guest token, private photo path, private certificate path, raw comments by default.

Testing:
- Use seed data to verify metrics.
- Test zero/null cases.
- Test filters.
- Test privacy of response.

Do not:
- Do not aggregate all raw rows in frontend.
- Do not show misleading labels.
- Do not hide denominator rules.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 18. Export Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Implement privacy-safe CSV export for [export type].

Context:
Exports are high-risk because they may expose personal data. Default exports must be privacy-safe.

Read first:
- docs/backend/EXPORT_REPORTING_SERVICES.md
- docs/security/SECURITY_REQUIREMENTS.md
- docs/security/AUDIT_LOGGING.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- checklists/DASHBOARD_CHECKLIST.md

Requirements:
- Export requires authentication.
- Export requires permission.
- Filters are validated.
- CSV has clear headers.
- CSV preserves Thai text.
- CSV escapes commas/quotes/newlines.
- Export respects dashboard filters.
- Export has row limit.
- Export creates audit log.
- Export returns safe errors.

Default export must exclude:
- email
- LINE user ID
- provider_user_id
- guest token
- device token
- raw photo path
- private certificate path
- raw comments unless permission allows

Testing:
- Admin allowed export.
- Viewer denied export.
- Privacy exclusions verified.
- Audit log created.
- No-data export handled.
- Too-large export handled.

Do not:
- Do not export personal identifiers by default.
- Do not skip audit log.
- Do not run unbounded export.
- Do not store export file publicly.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 19. Security Hardening Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Harden security for [area].

Context:
The platform stores tourist data, photos, certificates, and exports. Security must be enforced server-side and at storage/database layers.

Read first:
- docs/security/SECURITY_REQUIREMENTS.md
- docs/security/ROLE_PERMISSION_MATRIX.md
- docs/security/ROW_LEVEL_SECURITY.md
- docs/security/IMAGE_UPLOAD_SECURITY.md
- docs/testing/SECURITY_TEST_PLAN.md
- checklists/SECURITY_PDPA_CHECKLIST.md

Requirements:
- Identify current risk.
- Implement or improve server-side checks.
- Add/update validation.
- Add/update permission checks.
- Add/update ownership checks.
- Add/update storage/RLS safety if relevant.
- Add tests where practical.
- Document remaining risks.

Testing:
- Add security tests for the hardened behavior.
- Run relevant test command.
- Verify no secret exposure.

Do not:
- Do not rely on frontend checks only.
- Do not expose service role key.
- Do not broaden public access unnecessarily.
- Do not weaken privacy defaults.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 20. Testing Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Add or improve tests for [feature/module].

Context:
This project needs reliable tests for tourist flow, admin permissions, dashboard metrics, exports, and security/privacy.

Read first:
- docs/testing/TESTING_STRATEGY.md
- docs/testing/UNIT_TEST_PLAN.md
- docs/testing/INTEGRATION_TEST_PLAN.md
- docs/testing/E2E_TEST_PLAN.md
- docs/testing/SECURITY_TEST_PLAN.md
- checklists/TESTING_CHECKLIST.md

Requirements:
- Add tests that cover happy path and failure cases.
- Include privacy/security cases where relevant.
- Use synthetic data only.
- Do not depend on production data.
- Keep tests deterministic.
- Update test scripts if needed.

Important cases:
- validation errors
- unauthorized/forbidden
- ownership violation
- duplicate submission
- null/zero denominator
- export privacy
- file upload validation

Validation:
- Run relevant tests.
- Report any failures honestly.

Do not:
- Do not use real personal data.
- Do not test only happy paths.
- Do not skip security cases for sensitive features.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 21. Bugfix Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Fix the following bug:
[Describe bug clearly.]

Observed behavior:
[What happens now.]

Expected behavior:
[What should happen.]

Context:
[Why this matters.]

Read first:
[List relevant docs.]

Requirements:
- Reproduce or inspect cause.
- Fix root cause, not only symptom.
- Keep changes focused.
- Add regression test if practical.
- Ensure behavior aligns with docs.
- Do not break existing flows.

Validation:
- Run relevant tests/commands.
- Explain how the bug was verified.

Do not:
- Do not rewrite unrelated modules.
- Do not weaken validation/security.
- Do not hide errors without fixing cause.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 22. Refactor Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Refactor [area/module] to improve [reason].

Context:
[Explain why this refactor is needed.]

Read first:
[List relevant docs.]

Requirements:
- Preserve existing behavior.
- Improve structure/readability/testability.
- Keep public API stable unless task says otherwise.
- Update tests if needed.
- Do not add unnecessary dependencies.
- Do not change business rules silently.
- Document any intentional behavior change.

Validation:
- Run existing tests.
- Add tests if refactor touches critical logic.

Do not:
- Do not combine refactor with unrelated feature work.
- Do not weaken security/validation.
- Do not change dashboard formulas without updating docs/tests.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

## 23. Documentation Task Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Update documentation for [area].

Context:
Documentation guides architecture, Codex tasks, academic reporting, and production readiness.

Read first:
[List existing docs.]

Requirements:
- Update the relevant markdown files.
- Keep terminology consistent.
- Explain assumptions.
- Link related docs when useful.
- Do not contradict architecture/security/database rules.
- Keep docs actionable for future Codex tasks.

Validation:
- Check that file links/paths are correct.
- Check for outdated references.

Do not:
- Do not invent implemented features that do not exist.
- Do not remove important warnings.
- Do not weaken privacy/security guidance.

Completion response:
Summary
Files changed
Validation
Risks / Notes
Next suggested task
```

---

# Quality Gates for Every Task

---

## 24. Before Editing

Codex should:

```text
[ ] Read relevant docs.
[ ] Inspect existing project structure.
[ ] Identify dependencies.
[ ] Check whether similar code already exists.
[ ] Avoid duplicate implementations.
[ ] Plan minimal focused changes.
```

---

## 25. During Editing

Codex should:

```text
[ ] Keep changes focused.
[ ] Use TypeScript types.
[ ] Use server-side validation.
[ ] Use centralized constants where possible.
[ ] Follow existing patterns.
[ ] Avoid introducing unnecessary packages.
[ ] Keep sensitive logic server-side.
[ ] Avoid breaking public/tourist/admin separation.
```

---

## 26. Before Completion

Codex should:

```text
[ ] Run relevant command if possible.
[ ] Add/update tests if practical.
[ ] Check privacy/security rules.
[ ] Check docs if behavior changed.
[ ] Summarize changes clearly.
[ ] Mention incomplete items or risks.
```

---

## 27. Standard Validation Commands

Use as applicable:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

If commands fail because setup is incomplete, report clearly.

Do not claim tests passed if they were not run.

---

## 28. Standard Completion Format

Codex should respond:

```text
Summary
- ...

Files changed
- ...

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

## 29. Critical Do Not Do List for All Tasks

Codex must not:

```text
Expose SUPABASE_SERVICE_ROLE_KEY to frontend.
Trust role from localStorage.
Trust tourist_id from localStorage.
Require LINE for all tourists.
Require email/phone/national ID before certificate.
Store image base64 in database.
Store signed URLs permanently.
Make tourist photos public by default.
Count QR scans as visits.
Call estimated spending revenue.
Treat missing satisfaction as zero.
Export personal identifiers by default.
Show provider_user_id in dashboard/export.
Skip backend permission checks.
Skip ownership checks.
Hide certificate behind survey.
```

---

## 30. Final Task Rule

Every task should move the platform toward a real, secure, privacy-aware, production-oriented tourism data system.

If a change improves UI but weakens data quality, security, privacy, or metric correctness, it is not acceptable.
