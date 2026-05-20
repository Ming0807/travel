# TESTING_CHECKLIST.md

## 1. Document Purpose

This checklist defines the complete testing readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist before:

```text
submitting a Codex-generated feature
merging a pull request
running a demo
releasing MVP
deploying to staging
deploying to pilot/production
```

Testing must verify that the system is not only visually complete, but also correct, secure, privacy-safe, performant, and useful for tourism planning.

---

## 2. Testing Mission

The testing mission is:

```text
Prove that the platform correctly collects tourist data, protects privacy, generates certificates, supports admin operations, and produces trustworthy dashboard analytics.
```

The system must be tested across:

```text
tourist QR flow
photo upload
certificate generation
digital passport/stamp
optional survey
admin CMS
dashboard analytics
exports
database constraints
security/PDPA
performance
mobile UX
deployment
```

---

## 3. Related Documents

This checklist must align with:

```text
docs/testing/TESTING_STRATEGY.md
docs/testing/UNIT_TEST_PLAN.md
docs/testing/INTEGRATION_TEST_PLAN.md
docs/testing/E2E_TEST_PLAN.md
docs/testing/UX_TEST_PLAN.md
docs/testing/PERFORMANCE_TEST_PLAN.md
docs/testing/SECURITY_TEST_PLAN.md
docs/testing/ACCEPTANCE_CRITERIA.md
checklists/PROJECT_SETUP_CHECKLIST.md
checklists/DATABASE_CHECKLIST.md
checklists/FRONTEND_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
checklists/DASHBOARD_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PERFORMANCE_CHECKLIST.md
checklists/PRODUCTION_RELEASE_CHECKLIST.md
```

---

## 4. Testing Levels

Required testing levels:

```text
unit testing
integration testing
end-to-end testing
manual UX testing
security testing
privacy testing
performance testing
database testing
export testing
deployment smoke testing
```

Checklist:

```text
[ ] Unit tests are defined.
[ ] Integration tests are defined.
[ ] E2E tests are defined.
[ ] UX tests are defined.
[ ] Security tests are defined.
[ ] Performance tests are defined.
[ ] Acceptance criteria are defined.
[ ] Manual QA process is defined.
```

---

# Test Environment Checklist

---

## 5. Local Test Environment

Checklist:

```text
[ ] Local app runs.
[ ] Local/test database is available.
[ ] Test environment variables are configured.
[ ] Test storage bucket or mock storage is available.
[ ] Test admin users exist.
[ ] Test seed data exists.
[ ] Tests do not use production database.
[ ] Tests do not use real tourist data.
```

---

## 6. Staging Test Environment

Checklist:

```text
[ ] Staging app is deployed.
[ ] Staging Supabase/database is separate from production.
[ ] Staging storage buckets are separate from production.
[ ] Staging admin users are test accounts.
[ ] Staging data is synthetic.
[ ] Staging QR/check-in codes are test codes.
[ ] Staging export files do not contain real personal data.
```

---

## 7. Test Data Checklist

Required seed/test data:

```text
[ ] Yala province.
[ ] Pattani province.
[ ] Narathiwat province.
[ ] District data.
[ ] Countries reference.
[ ] Age groups.
[ ] Transport modes.
[ ] Travel purposes.
[ ] Travel companions.
[ ] Expense categories.
[ ] Spending ranges.
[ ] Published attraction.
[ ] Unpublished attraction.
[ ] Active photo spot.
[ ] Inactive photo spot.
[ ] Active check-in code.
[ ] Inactive check-in code.
[ ] Expired check-in code.
[ ] Certificate template.
[ ] Stamp definition.
[ ] Viewer admin.
[ ] Admin user.
[ ] Super admin user.
```

Rules:

```text
[ ] No real tourist data.
[ ] No real LINE user IDs.
[ ] No real private photos.
[ ] No real national ID/passport data.
```

---

# Unit Testing Checklist

---

## 8. Validation Unit Tests

Checklist:

```text
[ ] Tourist profile schema tested.
[ ] Consent schema tested.
[ ] Visit creation schema tested.
[ ] Photo upload validation tested.
[ ] Survey schema tested.
[ ] Expense schema tested.
[ ] Satisfaction score schema tested.
[ ] Admin attraction schema tested.
[ ] Photo spot schema tested.
[ ] Check-in code schema tested.
[ ] Dashboard filter schema tested.
[ ] Export filter schema tested.
```

Important validation rules:

```text
[ ] Email is not required for certificate flow.
[ ] LINE is not required for certificate flow.
[ ] Phone is not required for certificate flow.
[ ] Full address is not required.
[ ] National ID is not accepted.
[ ] Consent is required before profile/visit save.
```

---

## 9. Dashboard Formula Unit Tests

Checklist:

```text
[ ] Visit count calculation tested.
[ ] Tourist profile count tested.
[ ] Survey completion rate tested.
[ ] Average satisfaction tested.
[ ] Null satisfaction excluded from average.
[ ] Zero denominator returns null/No data.
[ ] Estimated spending min/max tested.
[ ] Open-ended spending range tested.
[ ] Funnel conversion tested.
[ ] Funnel drop-off tested.
[ ] Attraction concentration tested.
[ ] Planning quadrant classification tested.
```

Must verify:

```text
[ ] QR scans are not counted as visits.
[ ] Estimated spending is not treated as revenue.
[ ] Missing satisfaction is not treated as 0.
```

---

## 10. Permission Unit Tests

Checklist:

```text
[ ] super_admin permissions tested.
[ ] admin permissions tested.
[ ] viewer permissions tested.
[ ] viewer cannot mutate data.
[ ] viewer cannot export detailed data.
[ ] inactive admin blocked.
[ ] requirePermission helper tested.
[ ] requireAnyPermission helper tested if implemented.
[ ] requireAllPermissions helper tested if implemented.
```

---

## 11. Storage and File Unit Tests

Checklist:

```text
[ ] JPEG accepted.
[ ] PNG accepted.
[ ] WebP accepted.
[ ] SVG rejected for tourist upload.
[ ] PDF rejected.
[ ] HTML/JS disguised as image rejected.
[ ] Oversized file rejected.
[ ] Empty file rejected.
[ ] Storage path generated server-side.
[ ] Storage path does not include tourist name.
[ ] Storage path does not include email/LINE ID.
[ ] Storage path does not include original filename.
```

---

## 12. Export Unit Tests

Checklist:

```text
[ ] CSV escaping tested.
[ ] Thai text preservation tested.
[ ] Export headers tested.
[ ] Visit export default columns tested.
[ ] Survey export default columns tested.
[ ] Comments excluded by default.
[ ] Personal identifiers excluded by default.
[ ] Export filename is safe.
[ ] Too-large export logic tested.
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

---

## 13. Error Mapping Unit Tests

Checklist:

```text
[ ] Validation error mapping tested.
[ ] Duplicate slug error mapping tested.
[ ] Duplicate check-in code error mapping tested.
[ ] Duplicate stamp error mapping tested.
[ ] Storage error mapping tested.
[ ] Unauthorized error tested.
[ ] Forbidden error tested.
[ ] Safe internal error tested.
```

User-facing errors must not include:

```text
stack trace
SQL query
service key
raw Supabase error object
private storage path
```

---

# Integration Testing Checklist

---

## 14. QR Resolution Integration Tests

Checklist:

```text
[ ] Active QR resolves correctly.
[ ] Invalid QR returns safe error.
[ ] Inactive QR returns safe unavailable response.
[ ] Expired QR returns safe expired response.
[ ] QR linked to inactive attraction is blocked.
[ ] QR response excludes admin notes.
[ ] QR response excludes private storage paths.
[ ] Funnel event is recorded if enabled.
```

---

## 15. Tourist Profile + Visit Integration Tests

Checklist:

```text
[ ] New guest creates tourist profile.
[ ] New guest creates anonymous identity.
[ ] Existing guest reuses tourist profile.
[ ] Visit record is created.
[ ] Consent record is created.
[ ] Missing consent is rejected.
[ ] Invalid attraction is rejected.
[ ] Invalid photo spot is rejected.
[ ] Minimal form completed event recorded if enabled.
```

---

## 16. Photo Upload Integration Tests

Checklist:

```text
[ ] Valid photo stores file.
[ ] Valid photo stores metadata.
[ ] Invalid file does not store metadata.
[ ] Wrong visit ownership rejected.
[ ] Storage path is safe.
[ ] Upload failure handled safely.
[ ] Metadata failure cleans up storage or flags cleanup.
[ ] Photo upload event recorded if enabled.
```

---

## 17. Certificate Generation Integration Tests

Checklist:

```text
[ ] Certificate generated for valid visit/photo.
[ ] Certificate record created.
[ ] Certificate file stored.
[ ] Visit status updated.
[ ] Stamp awarded.
[ ] Duplicate certificate generation is idempotent.
[ ] Duplicate stamp is non-fatal/already-earned.
[ ] Missing photo is rejected.
[ ] Wrong tourist ownership rejected.
[ ] Certificate generated event recorded if enabled.
```

---

## 18. Passport/Stamp Integration Tests

Checklist:

```text
[ ] Earned stamp appears in passport.
[ ] Same tourist cannot duplicate stamp for same attraction.
[ ] Repeat visit can be recorded.
[ ] New attraction creates new stamp.
[ ] Guest can view own passport.
[ ] Guest cannot view another tourist passport.
[ ] Passport response excludes provider_user_id.
```

---

## 19. Survey Integration Tests

Checklist:

```text
[ ] Valid survey creates satisfaction record.
[ ] Valid expense range is stored.
[ ] Travel behavior is stored.
[ ] Duplicate survey behavior is controlled.
[ ] Invalid score rejected.
[ ] Optional fields can be null.
[ ] Comment length enforced.
[ ] Wrong tourist ownership rejected.
[ ] Survey completed event recorded if enabled.
```

---

## 20. Admin CMS Integration Tests

Checklist:

```text
[ ] Admin can create attraction.
[ ] Admin can update attraction.
[ ] Admin can publish/unpublish attraction.
[ ] Admin can deactivate attraction.
[ ] Viewer cannot create/update.
[ ] Admin can create photo spot.
[ ] Admin can create check-in code.
[ ] Duplicate check-in code rejected.
[ ] Deactivated check-in code no longer resolves.
[ ] Important actions create audit log.
```

---

## 21. Dashboard Integration Tests

Checklist:

```text
[ ] Executive metrics match seed data.
[ ] Tourist profile distribution matches seed data.
[ ] Travel behavior metrics match seed data.
[ ] Expense metrics match seed data.
[ ] Satisfaction metrics match seed data.
[ ] Funnel metrics match seed data.
[ ] Sustainable tourism insights match rules.
[ ] Filters apply correctly.
[ ] Empty filtered data handled.
[ ] Dashboard response excludes personal identifiers.
```

---

## 22. Export Integration Tests

Checklist:

```text
[ ] Admin can export allowed CSV.
[ ] Viewer cannot export detailed data.
[ ] Export respects filters.
[ ] Export headers correct.
[ ] Export excludes private identifiers.
[ ] Raw comments excluded by default.
[ ] Comments require permission.
[ ] Export creates audit log.
[ ] Export handles no-data case.
[ ] Export handles too-large case.
```

---

# E2E Testing Checklist

---

## 23. Tourist QR-to-Certificate E2E

Checklist:

```text
[ ] Tourist opens active QR.
[ ] Tourist sees attraction landing.
[ ] Tourist starts certificate flow.
[ ] Tourist fills minimal profile.
[ ] Tourist confirms consent.
[ ] Tourist uploads valid photo.
[ ] Tourist sees certificate preview.
[ ] Tourist generates certificate.
[ ] Tourist downloads certificate.
[ ] Tourist earns stamp.
[ ] Tourist sees optional survey prompt.
```

This is the most important MVP E2E test.

---

## 24. QR Error E2E

Checklist:

```text
[ ] Invalid QR safe error page works.
[ ] Inactive QR safe unavailable page works.
[ ] Expired QR safe expired page works.
[ ] Error page shows no stack trace.
[ ] Error page shows no admin details.
```

---

## 25. Returning Tourist E2E

Checklist:

```text
[ ] First attraction flow completed.
[ ] Second attraction QR opened in same browser.
[ ] Existing profile reused.
[ ] User does not re-enter all details.
[ ] New visit created.
[ ] New certificate generated.
[ ] New stamp earned.
[ ] Same attraction repeat visit does not duplicate stamp.
```

---

## 26. Optional Survey E2E

Checklist:

```text
[ ] Survey appears after certificate.
[ ] Certificate remains downloadable without survey.
[ ] Survey can be submitted.
[ ] Thank-you state appears.
[ ] Dashboard can read survey data.
```

---

## 27. Admin E2E

Checklist:

```text
[ ] Admin login works.
[ ] Viewer permission restrictions work.
[ ] Admin creates attraction.
[ ] Admin creates photo spot.
[ ] Admin creates check-in code.
[ ] Admin tests QR link.
[ ] Admin deactivates check-in code.
[ ] Public inactive QR is blocked.
[ ] Admin opens dashboard.
[ ] Admin exports CSV.
```

---

## 28. Mobile E2E / Manual

Checklist:

```text
[ ] Real phone QR scan tested.
[ ] Mobile QR landing usable.
[ ] Mobile form usable.
[ ] Mobile photo upload works.
[ ] Mobile certificate preview fits.
[ ] Mobile certificate download works.
[ ] Mobile survey usable.
[ ] English/non-LINE guest path works.
[ ] LINE browser tested if LIFF is used.
```

---

# Security Testing Checklist

---

## 29. Authentication and Authorization Tests

Checklist:

```text
[ ] Anonymous cannot access admin pages.
[ ] Anonymous cannot access admin APIs.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Admin cannot manage users unless permitted.
[ ] Inactive admin blocked.
[ ] Tourist cannot access admin APIs.
```

---

## 30. Tourist Ownership Tests

Checklist:

```text
[ ] Tourist A cannot upload photo to tourist B visit.
[ ] Tourist A cannot generate certificate for tourist B visit.
[ ] Tourist A cannot submit survey for tourist B visit.
[ ] Tourist A cannot view tourist B passport.
[ ] Tourist A cannot access tourist B private certificate/photo.
```

---

## 31. File Upload Security Tests

Checklist:

```text
[ ] SVG rejected.
[ ] PDF rejected.
[ ] HTML disguised as image rejected.
[ ] JS disguised as image rejected.
[ ] Oversized file rejected.
[ ] Empty file rejected.
[ ] Private storage is not publicly listable.
```

---

## 32. Privacy Tests

Checklist:

```text
[ ] Consent required.
[ ] Consent not pre-checked.
[ ] LINE optional.
[ ] Email optional.
[ ] Survey optional.
[ ] Dashboard excludes private identifiers.
[ ] Export excludes private identifiers.
[ ] Raw comments restricted.
[ ] Certificate does not include private identifiers.
```

---

## 33. Secret Safety Tests

Checklist:

```text
[ ] Service role key not in frontend bundle.
[ ] DATABASE_URL not in frontend bundle.
[ ] LINE channel secret not in frontend bundle.
[ ] .env not committed.
[ ] Logs do not contain secrets.
```

---

# Performance Testing Checklist

---

## 34. Tourist Performance Tests

Checklist:

```text
[ ] QR landing loads quickly on mobile.
[ ] Public attraction page images optimized.
[ ] Profile submit responsive.
[ ] Photo upload shows immediate feedback.
[ ] 2 MB image upload tested.
[ ] 5 MB image upload tested.
[ ] Certificate generation shows loading.
[ ] Survey submit responsive.
```

---

## 35. Dashboard Performance Tests

Checklist:

```text
[ ] Dashboard uses backend aggregation.
[ ] Dashboard queries use indexes.
[ ] Dashboard does not fetch all raw rows.
[ ] Dashboard filters respond reasonably.
[ ] Empty/no-data state is fast.
[ ] Large date range handled safely.
```

---

## 36. Export Performance Tests

Checklist:

```text
[ ] Small CSV export completes.
[ ] Large export limit works.
[ ] Too-large export returns safe error.
[ ] Export does not timeout in normal use.
```

---

# Accessibility and UX Testing Checklist

---

## 37. Accessibility Tests

Checklist:

```text
[ ] Inputs have labels.
[ ] Required fields indicated.
[ ] Error messages are readable.
[ ] Keyboard navigation works.
[ ] Focus states visible.
[ ] Buttons have accessible names.
[ ] Color is not only meaning.
[ ] Dashboard charts have titles.
[ ] Important chart data has table/text alternative.
```

---

## 38. Tourist UX Tests

Checklist:

```text
[ ] Tourist understands QR landing benefit within 5 seconds.
[ ] Tourist can complete minimal form in 60-90 seconds.
[ ] Tourist understands consent.
[ ] Tourist can upload photo without help.
[ ] Tourist sees certificate as valuable.
[ ] Tourist understands survey is optional.
[ ] Tourist understands stamp/passport.
[ ] Non-LINE tourist can complete flow.
```

---

## 39. Admin UX Tests

Checklist:

```text
[ ] Admin can create attraction without developer help.
[ ] Admin can create QR/check-in code without developer help.
[ ] Admin understands active/inactive status.
[ ] Admin can interpret dashboard metrics.
[ ] Admin understands QR scans vs visits.
[ ] Admin understands estimated spending.
[ ] Admin can export safely.
```

---

# Regression Testing Checklist

---

## 40. Core Regression Tests

Before each release, retest:

```text
[ ] Active QR flow.
[ ] Invalid/inactive QR flow.
[ ] Minimal profile form.
[ ] Consent.
[ ] Photo upload.
[ ] Certificate generation.
[ ] Stamp award.
[ ] Optional survey.
[ ] Returning tourist.
[ ] Admin login.
[ ] Admin CRUD.
[ ] Dashboard metrics.
[ ] Export privacy.
[ ] Permission enforcement.
```

---

## 41. Bug Fix Regression

For every bug fix:

```text
[ ] Reproduce bug before fix if possible.
[ ] Add automated test if practical.
[ ] Verify fix.
[ ] Verify related flows still work.
[ ] Update documentation if behavior changed.
```

---

# Deployment Smoke Testing Checklist

---

## 42. Post-Deployment Smoke Tests

After deployment:

```text
[ ] Public home page loads.
[ ] Public attraction page loads.
[ ] Active test QR resolves.
[ ] Admin login page loads.
[ ] Admin login works.
[ ] Dashboard loads.
[ ] Storage upload works in staging.
[ ] Export works in staging.
[ ] Environment variables are correct.
```

Do not create real fake data in production unless a controlled test attraction exists.

---

# Test Commands Checklist

---

## 43. Recommended Commands

Adjust to actual package scripts.

```bash
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

Checklist:

```text
[ ] typecheck passes.
[ ] lint passes.
[ ] unit tests pass.
[ ] integration tests pass or manual equivalent documented.
[ ] E2E tests pass or manual equivalent documented.
[ ] build passes.
```

---

# Test Evidence Checklist

---

## 44. Evidence for Academic Report / Review

Collect:

```text
[ ] Screenshots of QR landing.
[ ] Screenshots of profile form.
[ ] Screenshots of photo upload.
[ ] Screenshots of certificate preview/success.
[ ] Screenshots of passport/stamp.
[ ] Screenshots of survey.
[ ] Screenshots of admin CMS.
[ ] Screenshots of dashboard.
[ ] Screenshots/sample of export CSV.
[ ] Test case table.
[ ] Acceptance checklist result.
[ ] Security/privacy checklist result.
```

---

# Release Testing Gate

---

## 45. MVP Testing Gate

MVP should not be accepted unless:

```text
[ ] QR-to-certificate E2E passed.
[ ] Consent test passed.
[ ] Photo upload security test passed.
[ ] Certificate idempotency test passed.
[ ] Stamp duplicate prevention test passed.
[ ] Survey optional flow test passed.
[ ] Admin CMS test passed.
[ ] Dashboard metric test passed.
[ ] Export privacy test passed.
[ ] Permission enforcement test passed.
[ ] Mobile manual test passed.
```

---

## 46. Critical Test Failures / Blockers

Do not release if:

```text
[ ] Tourist cannot generate certificate.
[ ] QR flow is broken.
[ ] Consent is missing.
[ ] Photo upload accepts dangerous files.
[ ] Tourist can access another tourist's data.
[ ] Anonymous can access admin data.
[ ] Viewer can export detailed data.
[ ] Export includes private identifiers by default.
[ ] Dashboard counts QR scans as visits.
[ ] Missing satisfaction is shown as 0.
[ ] Service role key is exposed.
[ ] Build fails.
```

---

## 47. Accepted Risk Log

If a test is not completed, record:

```text
test not completed
reason
risk
temporary mitigation
owner
review date
```

Example:

```text
Test not completed: Automated LINE LIFF test.
Reason: LIFF is optional and not included in MVP.
Risk: LINE passport save not verified.
Mitigation: Guest flow tested; LINE marked future.
Owner: Developer
Review date: Before LINE phase.
```

---

## 48. Do Not Do

Do not:

```text
use production data in tests.
skip invalid QR tests.
skip consent tests.
skip permission tests.
skip export privacy tests.
skip mobile testing.
only test happy paths.
treat dashboard rendering as metric correctness.
ignore null/zero denominator cases.
release with failed core E2E flow.
```

---

## 49. Final Testing Rule

Testing must prove that the platform works for real tourists and real administrators.

If the QR-to-certificate flow, permissions, dashboard metrics, or exports are wrong, the project is not ready.
