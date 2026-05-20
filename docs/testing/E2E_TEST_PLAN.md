# E2E_TEST_PLAN.md

## 1. Document Purpose

This document defines the end-to-end test plan for the **Southern Border Tourism Data & Intelligence Platform**.

End-to-end tests verify complete user journeys from the user's perspective. They confirm that frontend pages, backend APIs, database records, storage, authentication, permissions, dashboard, and exports work together.

The most important E2E question is:

```text
Can a real tourist scan a QR code, view a location-specific landing page, submit minimal information, upload a photo, receive a certificate, earn a stamp, optionally share, optionally answer the survey, and optionally link Google or LINE without friction?
```

---

## 2. E2E Testing Mission

The mission of E2E testing is:

```text
Prove that critical real-world workflows work from start to finish.
```

E2E tests should catch:

```text
broken routes
broken QR flow
form submission issues
upload failures
certificate generation failures
auth/session problems
permission gaps
guest identity persistence problems
optional account-linking problems
dashboard loading failures
export failures
mobile UX issues
deployment configuration problems
```

---

## 3. Recommended E2E Test Stack

Recommended:

```text
Playwright
TypeScript
seeded test database
test storage bucket
staging environment
```

Optional:

```text
GitHub Actions
Vercel preview deployment tests
Supabase local stack
visual snapshots for certificate pages
axe accessibility checks
```

---

## 4. E2E Test Environments

## 4.1 Local E2E

Purpose:

```text
developer validation before commit
```

Uses:

```text
local app
local/test database
test storage
seed data
```

## 4.2 Staging E2E

Purpose:

```text
pre-release validation
```

Uses:

```text
staging URL
staging Supabase project
staging storage buckets
test admin accounts
synthetic tourist data
```

## 4.3 Production Smoke E2E

Purpose:

```text
safe deployment verification
```

Only run non-destructive tests:

```text
public page loads
admin login page loads
valid test QR in staging only
```

Do not create fake tourist data in production unless there is a clearly marked test attraction and cleanup policy.

---

## 5. Test Data Requirements

Before E2E tests run, seed:

```text
published attraction in Yala
published attraction in Pattani
published attraction in Narathiwat
unpublished attraction
active photo spot
inactive photo spot
active check-in code
inactive check-in code
expired check-in code
certificate template
stamp definition
admin user
viewer user
super_admin user
transport modes
travel purposes
travel companions
expense categories
```

All test data must be synthetic.

---

## 6. E2E Test Account Requirements

Recommended accounts:

```text
e2e.superadmin@example.test
e2e.admin@example.test
e2e.viewer@example.test
```

Rules:

- never use real staff personal accounts in automated tests.
- use strong generated passwords stored in test environment variables.
- do not commit test credentials to git.
- reset test data when needed.

---

## 7. E2E Test File Structure

Recommended:

```text
tests/e2e/
  public-attractions.spec.ts
  qr-checkin.spec.ts
  tourist-certificate-flow.spec.ts
  guest-passport.spec.ts
  optional-sharing.spec.ts
  optional-account-linking.spec.ts
  returning-tourist.spec.ts
  survey-flow.spec.ts
  passport-stamps.spec.ts
  admin-auth.spec.ts
  admin-cms.spec.ts
  dashboard.spec.ts
  exports.spec.ts
  permissions.spec.ts
  mobile.spec.ts
```

---

## 8. E2E Test Naming

Use scenario-based names.

Good:

```text
tourist can generate certificate from active QR code
viewer cannot create attraction
admin can export dashboard summary CSV
invalid QR shows safe error page
```

Bad:

```text
test QR
flow works
admin test
```

---

# Tourist-Side E2E Tests

---

## 9. Public Attraction Page E2E

## 9.1 Purpose

Verify that public tourism content works.

## 9.2 Scenario

```text
Visitor opens public attraction page.
```

## 9.3 Steps

```text
open /attractions/[slug]
verify page loads
verify attraction name is visible
verify province/district is visible
verify description/history is visible
verify cover image loads
verify 360 media section appears if configured
verify CTA or QR/check-in explanation appears if applicable
```

## 9.4 Expected Result

```text
public page loads without admin login
only published/active content is visible
unpublished admin data is not visible
```

## 9.5 Negative Case

```text
open unpublished attraction slug
expect 404 or safe unavailable page
```

---

## 10. Active QR Check-in E2E

## 10.1 Purpose

Verify that QR/check-in entry works.

## 10.2 Scenario

```text
Tourist scans an active QR code.
```

## 10.3 Steps

```text
open /checkin/[active-code]
verify attraction landing context loads
verify photo spot name/context if configured
verify certificate benefit is clear
verify primary CTA is visible
verify language switch works
```

## 10.4 Expected Result

```text
landing page loads
qr_scanned or landing_viewed event recorded if tracking enabled
tourist can start certificate flow
```

---

## 11. Invalid QR E2E

## 11.1 Purpose

Verify safe handling of invalid QR codes.

## 11.2 Steps

```text
open /checkin/invalid-code
```

## 11.3 Expected Result

```text
safe error page is shown
no internal error is displayed
no stack trace is shown
no admin data is leaked
```

Expected message:

```text
This QR code is not valid.
```

Thai:

```text
QR Code นี้ไม่ถูกต้อง
```

---

## 12. Inactive QR E2E

## 12.1 Steps

```text
open /checkin/[inactive-code]
```

## 12.2 Expected Result

```text
safe unavailable page is shown
tourist cannot continue to certificate flow
```

Expected message:

```text
This QR code is currently not available.
```

---

## 13. Expired QR E2E

## 13.1 Steps

```text
open /checkin/[expired-code]
```

## 13.2 Expected Result

```text
safe expired message is shown
tourist cannot continue to certificate flow
```

---

## 14. Tourist Certificate Flow E2E

## 14.1 Purpose

Verify the core product flow.

## 14.2 Scenario

```text
Tourist scans QR, fills minimal profile, uploads photo, generates certificate, and earns stamp.
```

## 14.3 Steps

```text
open /checkin/[active-code]
click Create Certificate / Start
fill display name
select origin country/province
select age group
confirm consent checkbox
submit minimal form
upload valid test image
verify upload preview
continue to certificate preview
verify certificate preview contains display name
verify certificate preview contains attraction name
click Generate Certificate
verify success page
verify download button visible
verify stamp earned message
verify optional survey prompt visible
```

## 14.4 Expected Database Results

```text
tourists row created
tourist_identities row created for guest flow
visits row created
consent_records row created
visit_photos row created
certificates row created
tourist_stamps row created
funnel events recorded if enabled
```

## 14.5 Expected UI Result

```text
certificate is generated
tourist can download certificate
stamp is awarded or clearly shown as already earned
survey is optional
```

---

## 15. Tourist Minimal Form Validation E2E

## 15.1 Purpose

Verify user-facing validation.

## 15.2 Steps

```text
open active QR
start certificate flow
submit empty profile form
```

## 15.3 Expected Result

```text
display name error visible
origin error visible
age group error visible
consent error visible
form does not submit
errors are near fields
```

## 15.4 Important Rule

The form must not require:

```text
email
LINE account
phone number
full address
national ID
```

---

## 16. Consent E2E

## 16.1 Purpose

Verify consent UX.

## 16.2 Steps

```text
open minimal profile form
verify consent checkbox is visible
verify checkbox is not pre-checked
try submit without checking consent
check consent
submit form
```

## 16.3 Expected Result

```text
submit without consent fails
submit with consent succeeds
consent record is saved with version/source/timestamp
```

---

## 17. Photo Upload E2E

## 17.1 Valid Photo Steps

```text
upload JPEG test image
verify preview
continue
```

Expected:

```text
upload succeeds
metadata saved
```

## 17.2 Invalid File Steps

```text
attempt upload PDF
attempt upload SVG
attempt upload too-large file
```

Expected:

```text
friendly error is shown
file is not stored
flow does not crash
```

## 17.3 Mobile Upload

Manual or automated device simulation:

```text
upload from mobile viewport
verify upload UI remains usable
```

---

## 18. Certificate Duplicate Submit E2E

## 18.1 Purpose

Verify idempotency.

## 18.2 Steps

```text
complete photo upload
double-click Generate Certificate
or refresh success page and retry generation
```

## 18.3 Expected Result

```text
only one certificate record exists
existing certificate is returned
no duplicate stamp is created
user sees success, not duplicate error
```

---

## 19. Optional Survey E2E

## 19.1 Purpose

Verify post-certificate optional survey.

## 19.2 Steps

```text
complete certificate flow
click Answer Survey
select travel companion
enter group size
select transport mode
select travel purpose
select overnight status/nights
select spending range
select satisfaction score
select revisit/recommendation
submit survey
```

## 19.3 Expected Result

```text
survey submission succeeds
thank-you page appears
satisfaction/expense/travel data saved
survey_completed funnel event recorded if enabled
certificate remains downloadable even if survey skipped
```

---

## 20. Survey Skip E2E

## 20.1 Purpose

Verify survey is optional.

## 20.2 Steps

```text
complete certificate flow
do not answer survey
click download certificate or finish
```

## 20.3 Expected Result

```text
certificate still available
tourist is not blocked
no error state
```

---

## 21. Returning Tourist E2E

## 21.1 Purpose

Verify returning user flow and reduced repeated data entry.

## 21.2 Scenario

```text
Same tourist visits another attraction.
```

## 21.3 Steps

```text
complete certificate flow at attraction A
open active QR for attraction B in same browser
start certificate flow
verify profile data is prefilled or minimized
submit/confirm profile
upload photo
generate certificate
```

## 21.4 Expected Result

```text
same tourist profile reused
new visit created
new certificate created
new stamp earned for attraction B
tourist does not need to fill all data again
```

---

## 22. Repeat Same Attraction E2E

## 22.1 Purpose

Verify repeat visit and duplicate stamp behavior.

## 22.2 Steps

```text
complete certificate flow at attraction A
open same QR/attraction again
create another visit
generate certificate if allowed
```

## 22.3 Expected Result

```text
repeat visit is recorded
stamp is not duplicated
UI shows already earned stamp gracefully
```

---

## 23. Guest Passport E2E

## 23.1 Purpose

Verify digital passport as guest.

## 23.2 Steps

```text
earn a stamp
open passport page
verify stamp appears
verify attraction/province/stamp shown
```

## 23.3 Expected Result

```text
guest can view own passport on same device/browser
passport does not expose provider_user_id
```

---

## 24. Optional LINE/Identity Save E2E

MVP may skip if LINE LIFF is not implemented.

If implemented, test:

```text
passport save CTA visible after certificate
LINE link optional
guest can continue without LINE
LINE-linked passport preserves stamps
foreign/non-LINE path still works
```

---

# Admin-Side E2E Tests

---

## 25. Admin Login E2E

## 25.1 Steps

```text
open /admin
redirect to login if not authenticated
login as admin test user
redirect to dashboard
```

## 25.2 Expected Result

```text
admin dashboard loads
session persists according to auth config
```

---

## 26. Viewer Permission E2E

## 26.1 Steps

```text
login as viewer
open dashboard
verify dashboard visible
try open create attraction page
try POST create attraction directly if test harness supports API call
try export visit records
```

## 26.2 Expected Result

```text
viewer can view allowed dashboard
viewer cannot create/update/delete
viewer cannot export detailed data
forbidden message appears
```

---

## 27. Admin Attraction CMS E2E

## 27.1 Steps

```text
login as admin
open /admin/attractions
click Create Attraction
fill attraction form
save
verify attraction appears in table
edit attraction
publish attraction
open public page
deactivate/unpublish attraction
verify public page unavailable
```

## 27.2 Expected Result

```text
CRUD/publish flow works
audit logs created for important actions
public content reflects publish status
```

---

## 28. Admin Photo Spot E2E

## 28.1 Steps

```text
login as admin
open attraction detail/edit
add photo spot
save
create/check QR context using that photo spot
deactivate photo spot
```

## 28.2 Expected Result

```text
photo spot created
photo spot linked to attraction
inactive photo spot no longer appears in public check-in flow
```

---

## 29. Admin Check-in Code E2E

## 29.1 Steps

```text
login as admin
open check-in codes page
create check-in code for attraction/photo spot
verify QR link generated
open QR link in new context
deactivate code
open QR link again
```

## 29.2 Expected Result

```text
active code resolves
deactivated code shows unavailable page
audit log created
```

---

## 30. Admin Media Upload E2E

## 30.1 Steps

```text
login as admin
upload attraction image
verify preview
save attraction media
open public attraction page
verify image loads
```

## 30.2 Negative Cases

```text
upload invalid PDF
upload too-large image
```

Expected:

```text
friendly error
no crash
```

---

# Dashboard and Export E2E Tests

---

## 31. Dashboard Load E2E

## 31.1 Steps

```text
login as admin
open /admin/dashboard
wait for KPI cards
verify visit count visible
verify certificate count visible
verify satisfaction card visible
verify funnel section visible
```

## 31.2 Expected Result

```text
dashboard loads without private identifiers
empty states appear where data is missing
```

---

## 32. Dashboard Filter E2E

## 32.1 Steps

```text
open dashboard
select date range
select province
select attraction
apply filters
verify URL query updates
verify KPI/charts reload
refresh page
```

## 32.2 Expected Result

```text
filters persist through URL
dashboard reloads with selected filters
no crash on empty filtered data
```

---

## 33. Dashboard Metric Sanity E2E

## 33.1 Purpose

Verify obvious metric relationships.

## 33.2 Checks

```text
QR scan count can be greater than visit count
visit count is not equal to QR scan count unless data says so
survey completion rate displays No data if denominator zero
average satisfaction displays No data if no survey
estimated spending label includes Estimated
```

---

## 34. Export Summary CSV E2E

## 34.1 Steps

```text
login as admin
open dashboard
click Export Summary CSV
download file
verify file exists
verify filename is safe
verify CSV headers
verify Thai text encoding if possible
```

## 34.2 Expected Result

```text
CSV downloads
audit log created
no personal identifiers included
```

---

## 35. Visit Export Privacy E2E

## 35.1 Steps

```text
login as admin with export permission
export visit records
inspect CSV text
```

## 35.2 Expected Exclusions

CSV must not include:

```text
email
LINE user ID
provider_user_id
guest token
device token
private photo path
private certificate path
```

---

# Security E2E Tests

---

## 36. Anonymous Admin Access E2E

## 36.1 Steps

```text
open /admin/dashboard without login
open /admin/attractions without login
open admin API route without login
```

## 36.2 Expected Result

```text
redirect to login or 401/403
no dashboard/admin data returned
```

---

## 37. Tourist Ownership E2E

## 37.1 Purpose

Verify one tourist cannot access another tourist's data.

## 37.2 Steps

```text
create tourist A certificate/passport
create tourist B session
attempt access tourist A visit/certificate/passport using tourist B context
```

## 37.3 Expected Result

```text
access denied or not found
no private data leaked
```

---

## 38. Private File Access E2E

## 38.1 Purpose

Verify private photos/certificates are controlled.

## 38.2 Steps

```text
generate tourist photo/certificate
try access raw storage path directly if possible
try access expired signed URL if supported
```

## 38.3 Expected Result

```text
private files are not publicly listable
access requires signed URL or permission
```

---

# Mobile and Browser E2E Tests

---

## 39. Mobile Tourist Flow E2E

Run main tourist certificate flow in mobile viewport:

```text
iPhone viewport
Android viewport
```

Checks:

```text
landing page fits screen
form fields usable
photo upload visible
certificate preview not cut off
download button visible
survey prompt visible
```

---

## 40. LINE Browser Manual E2E

If LIFF/LINE is used, manually test:

```text
open QR link in LINE in-app browser
complete certificate flow
upload image
download/share certificate
passport save prompt
```

Expected:

```text
flow works or graceful fallback explains how to open in external browser
```

---

## 41. Foreign Tourist Path E2E

## 41.1 Purpose

Verify non-LINE, English-language path.

## 41.2 Steps

```text
switch language to English
complete QR-to-certificate flow as guest
select foreign origin country
skip LINE
download certificate
answer optional survey if desired
```

## 41.3 Expected Result

```text
English flow works
LINE is not required
guest path works
```

---

# Error and Empty State E2E Tests

---

## 42. Network/Server Error E2E

Simulate API failure where possible.

Expected:

```text
friendly error shown
no stack trace
retry available where appropriate
form data not lost unnecessarily
```

---

## 43. Dashboard Empty Data E2E

Use filters with no data.

Expected:

```text
No data message
no fake zeros
charts do not crash
export behavior is clear
```

---

## 44. Upload Failure E2E

Simulate storage/upload failure if test adapter supports.

Expected:

```text
friendly error
no certificate step allowed until upload succeeds
no orphan metadata record
```

---

# E2E Commands

---

## 45. Suggested Commands

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

Suggested package scripts:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ui": "playwright test --ui"
}
```

---

## 46. CI Strategy

Recommended:

```text
run critical E2E tests on staging/preview before release
run full E2E suite before production release
capture screenshots/videos on failure
```

Minimum release blockers:

```text
QR-to-certificate flow
admin login
admin check-in code creation
dashboard load
export privacy
```

---

## 47. E2E Acceptance Checklist

```text
[ ] Public attraction page loads.
[ ] Active QR flow works.
[ ] Invalid/inactive/expired QR errors are safe.
[ ] Tourist can complete QR-to-certificate flow.
[ ] Consent is required and recorded.
[ ] Photo upload works with valid image.
[ ] Invalid file upload fails safely.
[ ] Certificate generation works.
[ ] Duplicate certificate generation is idempotent.
[ ] Stamp is awarded or already-earned is handled.
[ ] Survey is optional and can be submitted.
[ ] Returning tourist flow works.
[ ] Admin login works.
[ ] Viewer permissions are enforced.
[ ] Admin can manage attractions/photo spots/check-in codes.
[ ] Dashboard loads.
[ ] Dashboard filters work.
[ ] Export works and excludes private identifiers.
[ ] Mobile viewport tourist flow works.
```

---

## 48. Do Not Do

Do not:

```text
Run destructive E2E tests on production.
Use real personal data.
Skip invalid QR tests.
Skip permission tests.
Skip export privacy inspection.
Only test desktop.
Assume frontend button hiding means security works.
Ignore mobile photo upload.
```

---

## 49. Future Enhancements

Possible future improvements:

```text
visual regression testing
certificate image snapshot testing
A/B funnel test validation
multi-browser matrix
LINE LIFF automated test harness
public share link tests
offline/PWA tests
scheduled E2E smoke tests
```

---

## 50. Final E2E Testing Rule

E2E tests should prove that the platform works for real tourists and real administrators, not just isolated code.

If QR-to-certificate-to-dashboard does not work end to end, the project is not ready.
