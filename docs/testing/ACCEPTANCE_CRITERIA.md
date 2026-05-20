# ACCEPTANCE_CRITERIA.md

## 1. Document Purpose

This document defines acceptance criteria for the **Southern Border Tourism Data & Intelligence Platform**.

Acceptance criteria define when the system is considered ready for MVP submission, academic demonstration, staging release, or production-oriented deployment.

The criteria cover:

```text
tourist flow
admin backoffice
database quality
dashboard analytics
exports
security/privacy
performance
testing
documentation
deployment
```

This document should be used by the developer, project owner, instructor, and reviewer to decide whether a feature or release is complete.

---

## 2. Acceptance Mission

The acceptance mission is:

```text
Ensure the platform is not only built, but correct, usable, secure, measurable, and ready to support real tourism planning.
```

A feature is not accepted only because the UI looks good.

It must also satisfy:

```text
business requirement
database integrity
security rule
UX requirement
testing evidence
documentation alignment
```

---

## 3. Acceptance Levels

## 3.1 Feature Acceptance

A single feature is complete.

Examples:

```text
QR check-in
photo upload
certificate generation
admin attraction CRUD
dashboard KPI card
CSV export
```

## 3.2 Module Acceptance

A complete module is ready.

Examples:

```text
Public attraction pages
QR check-in flow
Certificate generation
Admin CMS
Dashboard analytics
Export/reporting
```

## 3.3 MVP Acceptance

The minimum viable product is ready for demonstration and controlled use.

## 3.4 Production Readiness Acceptance

The system is suitable for real-world deployment with stronger security, performance, monitoring, and operational controls.

---

## 4. Global Acceptance Rules

Every completed feature should satisfy:

```text
[ ] It solves a documented requirement.
[ ] It has server-side validation.
[ ] It handles loading, empty, and error states.
[ ] It enforces permissions where required.
[ ] It does not expose private data.
[ ] It creates or updates correct database records.
[ ] It has relevant tests or manual QA evidence.
[ ] It is documented or references existing documentation.
```

---

## 5. Definition of Done

A feature is done only when:

```text
implementation complete
database changes complete
server-side validation complete
authorization/ownership checks complete
error handling complete
loading/empty states complete
tests added or manual test evidence recorded
documentation updated
security/privacy reviewed
no critical bugs remain
```

---

# MVP Acceptance Criteria

---

## 6. MVP Business Acceptance

The MVP must support the original project goal:

```text
Create a tourist database for southern border tourism planning and sustainable tourism development.
```

MVP must support:

```text
[ ] recording tourist participation
[ ] analyzing travel behavior
[ ] supporting tourism promotion planning
[ ] building a dashboard for southern border tourism
[ ] collecting data across Yala, Pattani, and Narathiwat
[ ] connecting tourists, visits, attractions, spending, and satisfaction data
```

---

## 7. MVP System Scope Acceptance

MVP must include:

```text
[ ] public attraction pages
[ ] QR/check-in entry flow
[ ] location-specific QR landing page before form
[ ] minimal tourist profile form
[ ] consent capture
[ ] photo upload
[ ] certificate generation
[ ] digital stamp/passport basics
[ ] optional certificate sharing after download is available
[ ] optional survey for travel behavior, expense, and satisfaction
[ ] admin attraction CMS
[ ] admin photo spot/check-in code management
[ ] dashboard analytics
[ ] CSV export
[ ] security/privacy basics
```

Optional MVP but recommended:

```text
[ ] LINE LIFF optional passport saving
[ ] 360 media embedding
[ ] official data import placeholder
[ ] sustainable tourism insight cards
```

---

# Tourist Flow Acceptance

---

## 8. QR Check-in Acceptance

Acceptance criteria:

```text
[ ] Active QR/check-in code resolves to correct landing page.
[ ] Invalid QR code shows safe error.
[ ] Inactive QR code shows unavailable message.
[ ] Expired QR code shows unavailable/expired message.
[ ] QR landing page shows attraction context.
[ ] QR landing page shows photo spot context when available.
[ ] QR landing page shows certificate benefit clearly.
[ ] QR landing page shows CTA such as "Create my certificate".
[ ] QR landing page works without login.
[ ] QR landing page works for tourists without LINE.
[ ] QR landing page works for tourists without Google login.
[ ] QR scan/landing event is recorded if funnel tracking is enabled.
```

Must not:

```text
[ ] expose admin notes
[ ] expose private storage paths
[ ] show stack traces
[ ] require admin authentication
[ ] require Google, LINE, email, phone, survey, or sharing before certificate creation
```

---

## 9. Public Attraction Page Acceptance

Acceptance criteria:

```text
[ ] Published active attraction is publicly visible.
[ ] Unpublished attraction is not publicly visible.
[ ] Inactive attraction is not publicly visible.
[ ] Attraction shows name, province, district, description/history, images, and useful public details.
[ ] 360 media can be displayed if configured.
[ ] Page is mobile responsive.
[ ] Page does not expose private/admin fields.
```

---

## 10. Minimal Tourist Profile Acceptance

Acceptance criteria:

```text
[ ] Tourist can enter display name.
[ ] Tourist can provide non-specific origin information.
[ ] Tourist can select age group.
[ ] Tourist can select or use language preference.
[ ] Consent checkbox is visible.
[ ] Consent checkbox is not pre-checked.
[ ] Submission is blocked without required consent.
[ ] Backend validates all required fields.
[ ] Form does not require LINE.
[ ] Form does not require Google login.
[ ] Form does not require email.
[ ] Form does not require phone number.
[ ] Form does not require national ID.
[ ] Form does not require full address.
[ ] Display name label does not imply legal full name is required.
```

Database acceptance:

```text
[ ] tourist record is created or reused.
[ ] tourist identity is created or reused.
[ ] visit record is created.
[ ] consent record is stored with version/source/timestamp.
```

---

## 11. Photo Upload Acceptance

Acceptance criteria:

```text
[ ] Tourist can upload JPEG.
[ ] Tourist can upload PNG.
[ ] Tourist can upload WebP.
[ ] Unsupported files are rejected.
[ ] Oversized files are rejected.
[ ] Upload shows loading/progress state.
[ ] Upload can be retried.
[ ] Uploaded photo is linked to correct visit.
[ ] Storage path is generated server-side.
[ ] Storage path contains no personal data.
[ ] Photo is not public by default.
```

Must reject:

```text
[ ] SVG tourist upload
[ ] PDF upload
[ ] HTML/JS disguised as image
[ ] file above configured size limit
[ ] upload to another tourist's visit
```

---

## 12. Certificate Generation Acceptance

Acceptance criteria:

```text
[ ] Certificate preview loads after valid photo upload.
[ ] Certificate contains tourist display name.
[ ] Certificate contains attraction name.
[ ] Certificate contains visit date.
[ ] Certificate uses uploaded photo.
[ ] Certificate can be generated.
[ ] Certificate file is stored.
[ ] Certificate database record is created.
[ ] Duplicate generation returns existing certificate or prevents duplicate.
[ ] Certificate can be downloaded.
[ ] Certificate generation updates visit completion status.
[ ] Certificate generation records funnel event if enabled.
```

Must not:

```text
[ ] include email
[ ] include LINE ID
[ ] include Google ID
[ ] include provider_user_id
[ ] include guest token
[ ] include internal tourist ID
[ ] include internal visit ID
[ ] include full address
[ ] include phone number
[ ] include national ID
[ ] expose private storage path
[ ] create duplicate certificate records from double-click
[ ] block download behind survey, sharing, Google, LINE, email, or phone
```

---

## 13. Stamp and Passport Acceptance

Acceptance criteria:

```text
[ ] Stamp is awarded after certificate generation where stamp definition exists.
[ ] Same tourist does not receive duplicate stamp for same attraction.
[ ] Repeat visit to same attraction can be recorded without duplicate stamp.
[ ] Passport view shows earned stamps.
[ ] Guest passport works on same browser/device.
[ ] Returning tourist can collect stamps from multiple attractions.
[ ] Passport response does not expose provider_user_id.
[ ] Passport response does not expose Google subject, LINE ID, guest token, tourist_id, visit_id, or private storage path.
```

Optional:

```text
[ ] Passport can be linked to Google/LINE for future access.
[ ] Google/LINE linking is optional.
[ ] Future email linking remains optional.
```

---

## 14. Survey Acceptance

Acceptance criteria:

```text
[ ] Survey appears after certificate reward.
[ ] Survey is optional.
[ ] Certificate download is not blocked by survey.
[ ] Stamp and passport progress are not blocked by survey.
[ ] Survey does not require Google, LINE, email, or phone number.
[ ] Survey can collect travel companion.
[ ] Survey can collect group size.
[ ] Survey can collect transport mode.
[ ] Survey can collect travel purpose.
[ ] Survey can collect overnight status/nights.
[ ] Survey can collect spending range.
[ ] Survey can collect satisfaction score.
[ ] Survey can collect revisit/recommendation intention.
[ ] Comment is optional.
[ ] Backend validates score ranges.
[ ] Survey submission creates correct database records.
[ ] Duplicate survey behavior is controlled.
```

Must not:

```text
[ ] require sensitive personal data
[ ] treat missing satisfaction as zero
[ ] force survey before certificate
```

---

## 15. Returning Tourist Acceptance

Acceptance criteria:

```text
[ ] Returning guest user can be recognized by guest identity/token.
[ ] Returning Google/LINE user can be recognized if optional identity linking exists.
[ ] Existing profile can be reused.
[ ] Tourist does not need to fill all fields repeatedly.
[ ] New attraction visit creates new visit.
[ ] New attraction visit can earn new stamp.
[ ] Repeat same attraction does not duplicate stamp.
```

---

# Admin Acceptance

---

## 16. Admin Authentication Acceptance

Acceptance criteria:

```text
[ ] Admin routes require authentication.
[ ] Anonymous users cannot access admin pages.
[ ] Admin session is checked server-side.
[ ] Inactive admin cannot access admin system.
[ ] Logout works.
```

---

## 17. Admin Role/Permission Acceptance

Acceptance criteria:

```text
[ ] super_admin role exists.
[ ] admin role exists.
[ ] viewer role exists.
[ ] Viewer can view allowed dashboard.
[ ] Viewer cannot create/update/delete content.
[ ] Viewer cannot export detailed data.
[ ] Admin can manage content.
[ ] Admin cannot manage users/roles unless permitted.
[ ] Super admin can manage users/roles.
[ ] Backend enforces permissions.
```

Frontend button hiding alone is not sufficient.

---

## 18. Attraction CMS Acceptance

Acceptance criteria:

```text
[ ] Admin can create attraction.
[ ] Admin can update attraction.
[ ] Admin can publish attraction.
[ ] Admin can unpublish/deactivate attraction.
[ ] Attraction has province/district relationship.
[ ] Attraction has slug.
[ ] Attraction has Thai/English content where required.
[ ] Attraction media can be managed.
[ ] Public page reflects publish status.
[ ] Important actions are audit logged.
```

---

## 19. Photo Spot CMS Acceptance

Acceptance criteria:

```text
[ ] Admin can create photo spot.
[ ] Photo spot belongs to attraction.
[ ] Admin can update photo spot.
[ ] Admin can deactivate photo spot.
[ ] Inactive photo spot is not usable in public check-in flow.
[ ] Important actions are audit logged.
```

---

## 20. Check-in Code CMS Acceptance

Acceptance criteria:

```text
[ ] Admin can create check-in code.
[ ] Check-in code is unique.
[ ] Check-in code is URL-safe.
[ ] Check-in code links to attraction.
[ ] Check-in code can link to photo spot.
[ ] Admin can deactivate check-in code.
[ ] Deactivated code cannot be used publicly.
[ ] QR/download/copy link is available if implemented.
[ ] Important actions are audit logged.
```

---

# Database Acceptance

---

## 21. Database Schema Acceptance

Acceptance criteria:

```text
[ ] Core tables exist.
[ ] Reference/master tables exist.
[ ] Foreign keys are defined.
[ ] Required unique constraints exist.
[ ] Required check constraints exist.
[ ] Timestamps exist where needed.
[ ] Soft delete/deactivate fields exist where needed.
[ ] Data dictionary is documented.
[ ] ERD is documented.
```

Core data must support:

```text
tourist
identity
visit
attraction
photo spot
check-in code
photo upload
certificate
stamp
survey
expense
satisfaction
dashboard
export
audit
consent
```

---

## 22. Database Constraint Acceptance

Required constraints:

```text
[ ] unique attractions.slug
[ ] unique checkin_codes.code
[ ] unique tourist_identities(provider, provider_user_id)
[ ] unique tourist_stamps(tourist_id, attraction_id)
[ ] unique satisfaction_surveys(visit_id) or equivalent duplicate control
[ ] score ranges 1-5
[ ] valid status values
[ ] foreign keys between visits and attractions/tourists
[ ] foreign keys between certificates and visits
```

---

## 23. Data Quality Acceptance

Acceptance criteria:

```text
[ ] Required reference data is seeded.
[ ] Province/district data supports Yala, Pattani, Narathiwat.
[ ] Age groups are controlled values.
[ ] Spending ranges are controlled values.
[ ] Transport modes are controlled values.
[ ] Travel purposes are controlled values.
[ ] Null/missing values are meaningful.
[ ] No private identifiers appear in analytics tables.
```

---

# Dashboard Acceptance

---

## 24. Dashboard General Acceptance

Acceptance criteria:

```text
[ ] Dashboard route is protected.
[ ] Dashboard uses backend aggregation.
[ ] Dashboard does not load all raw records into frontend.
[ ] Dashboard has date filter.
[ ] Dashboard has province filter.
[ ] Dashboard has attraction filter.
[ ] Dashboard shows loading states.
[ ] Dashboard shows empty states.
[ ] Dashboard shows error states.
[ ] Dashboard includes data limitations.
```

---

## 25. Executive Dashboard Acceptance

Required metrics:

```text
[ ] Tourist Profiles
[ ] Total Visits
[ ] Certificates Generated
[ ] Stamps Earned
[ ] Survey Completion Rate
[ ] Average Satisfaction
[ ] Estimated Spending
[ ] Top Attraction
```

Rules:

```text
[ ] Tourist Profiles is not labeled as verified unique people.
[ ] Visits are not QR scans.
[ ] Estimated Spending is not called revenue.
[ ] Missing satisfaction is not shown as 0.
[ ] Zero denominator returns No data/null.
```

---

## 26. Tourist Profile Dashboard Acceptance

Required analytics:

```text
[ ] origin country distribution
[ ] Thai origin province distribution
[ ] age group distribution
[ ] preferred language distribution
[ ] domestic vs foreign summary
[ ] returning profile summary or planned
```

Privacy:

```text
[ ] no email
[ ] no LINE ID
[ ] no provider_user_id
[ ] no guest token
```

---

## 27. Travel Behavior Dashboard Acceptance

Required analytics:

```text
[ ] travel companion distribution
[ ] group size analysis
[ ] transport mode distribution
[ ] travel purpose distribution
[ ] same-day vs overnight
[ ] average nights
```

Rules:

```text
[ ] missing group size is not zero.
[ ] missing nights is not zero unless explicitly defined.
[ ] answer counts are visible.
```

---

## 28. Expense Dashboard Acceptance

Required analytics:

```text
[ ] expense response count
[ ] spending range distribution
[ ] estimated spending min/max
[ ] expense category distribution
[ ] expense by province or attraction
```

Rules:

```text
[ ] spending is labeled estimated.
[ ] spending is not labeled revenue.
[ ] prefer_not_to_answer is handled correctly.
[ ] open-ended ranges are handled.
```

---

## 29. Satisfaction Dashboard Acceptance

Required analytics:

```text
[ ] response count
[ ] average satisfaction
[ ] satisfaction by attraction
[ ] satisfaction by province or planned
[ ] revisit intention rate
[ ] recommendation intention rate
[ ] low satisfaction alerts or planned
```

Rules:

```text
[ ] null scores are excluded from average.
[ ] no responses returns No data.
[ ] response count is shown with averages.
```

---

## 30. Funnel Dashboard Acceptance

Required analytics:

```text
[ ] QR scans
[ ] landing viewed
[ ] certificate started
[ ] minimal form completed
[ ] photo uploaded
[ ] certificate generated
[ ] survey completed
[ ] passport saved or planned
[ ] conversion rates
[ ] drop-off rates
[ ] largest drop-off step
```

Rules:

```text
[ ] QR scans are not counted as visits.
[ ] zero denominator returns null/No data.
[ ] event count is not called unique people.
```

---

## 31. Sustainable Tourism Dashboard Acceptance

Required or planned indicators:

```text
[ ] high visit / low satisfaction
[ ] low visit / high satisfaction
[ ] attraction concentration
[ ] overnight opportunity
[ ] local economic opportunity
[ ] data quality indicators
[ ] confidence/limitations
```

Rules:

```text
[ ] insights are evidence-based.
[ ] insights do not claim official impact from platform data alone.
[ ] confidence/sample size is considered.
```

---

# Export Acceptance

---

## 32. Export General Acceptance

Acceptance criteria:

```text
[ ] Export requires authentication.
[ ] Export requires permission.
[ ] Export validates filters.
[ ] Export uses safe columns.
[ ] Export creates audit log.
[ ] Export supports Thai text.
[ ] Export file name is safe.
[ ] Export handles no-data case.
[ ] Export handles too-large case.
```

---

## 33. Export Privacy Acceptance

Default exports must not include:

```text
[ ] email
[ ] LINE user ID
[ ] provider_user_id
[ ] guest token
[ ] device token
[ ] raw photo path
[ ] private certificate path
[ ] raw comments unless permitted
```

If comments are exported:

```text
[ ] export.comments permission required.
[ ] audit log created.
```

---

## 34. CSV Acceptance

CSV must:

```text
[ ] include header row.
[ ] escape commas.
[ ] escape quotes.
[ ] escape newlines.
[ ] preserve Thai text.
[ ] use clear column names.
[ ] not include private identifiers by default.
```

---

# Security and Privacy Acceptance

---

## 35. Authentication and Authorization Acceptance

```text
[ ] Anonymous users cannot access admin.
[ ] Admin APIs require authentication.
[ ] Backend enforces permissions.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Tourist can access only own data.
[ ] Guest token cannot access admin.
```

---

## 36. PDPA/Privacy Acceptance

```text
[ ] Data collection is minimized.
[ ] Consent is collected.
[ ] Consent is versioned.
[ ] Survey is optional.
[ ] Google/LINE/email are optional.
[ ] Tourist photo purpose is explained.
[ ] Dashboard is aggregated.
[ ] Exports are privacy-safe.
[ ] Data retention/anonymization is documented.
```

---

## 37. Storage Security Acceptance

```text
[ ] Tourist photos are private or controlled.
[ ] Certificate files are private or controlled.
[ ] Export files are private.
[ ] Public media buckets contain only public assets.
[ ] Signed URLs are not stored permanently.
[ ] Service role key is server-only.
```

---

## 38. Error Handling Acceptance

User-facing errors must not expose:

```text
[ ] stack trace
[ ] SQL query
[ ] service key
[ ] raw Supabase error object
[ ] private storage path
[ ] provider_user_id
```

Errors must include:

```text
[ ] stable error code
[ ] user-friendly message
[ ] field-level validation where useful
```

---

# Performance Acceptance

---

## 39. Tourist Performance Acceptance

```text
[ ] QR landing page loads quickly on mobile.
[ ] Public attraction page images are optimized.
[ ] Minimal profile submit is responsive.
[ ] Photo upload shows loading/progress.
[ ] Certificate generation shows loading/progress.
[ ] Duplicate submit is prevented.
[ ] Survey submit is responsive.
```

---

## 40. Dashboard Performance Acceptance

```text
[ ] Dashboard uses backend aggregation.
[ ] Dashboard queries use date filters/indexes.
[ ] Dashboard does not fetch all raw rows to frontend.
[ ] Large date ranges are handled safely.
[ ] Heavy metrics can be moved to summary tables later.
```

---

## 41. Export Performance Acceptance

```text
[ ] Small exports complete successfully.
[ ] Large/unfiltered exports are limited or rejected safely.
[ ] Export does not cause server timeout in normal use.
[ ] Export files expire if stored.
```

---

# Testing Acceptance

---

## 42. Required Test Evidence

MVP should have evidence for:

```text
[ ] QR-to-certificate E2E.
[ ] minimal profile validation.
[ ] consent required.
[ ] photo upload validation.
[ ] certificate idempotency.
[ ] stamp duplicate prevention.
[ ] survey submission.
[ ] admin CMS.
[ ] dashboard metrics.
[ ] export privacy.
[ ] permission enforcement.
```

Evidence can include:

```text
automated tests
manual QA checklist
screenshots
test case tables
recorded demo
```

---

## 43. Critical Release Blockers

Do not accept/release if:

```text
[ ] service role key is exposed.
[ ] anonymous user can access admin data.
[ ] tourist can access another tourist's photo/certificate/passport.
[ ] export includes personal identifiers by default.
[ ] certificate generation does not work.
[ ] QR flow is broken.
[ ] dashboard visit count is wrong.
[ ] estimated spending is labeled revenue.
[ ] missing satisfaction is shown as 0.
[ ] photo upload accepts dangerous files.
[ ] consent is missing.
```

---

# Documentation Acceptance

---

## 44. Required Documentation

MVP documentation should include:

```text
[ ] README
[ ] project overview
[ ] product requirements
[ ] MVP scope
[ ] architecture overview
[ ] database documentation
[ ] data dictionary
[ ] frontend requirements
[ ] backend requirements
[ ] dashboard requirements
[ ] security/privacy documents
[ ] testing strategy
[ ] deployment guide
```

Academic report documentation should include:

```text
[ ] Chapter 1 Introduction
[ ] Chapter 2 Theory and Related Work
[ ] Chapter 3 System Analysis and Design
[ ] Chapter 4 Implementation
[ ] Chapter 5 Conclusion
[ ] ERD report
[ ] Data dictionary report
[ ] Dashboard report
```

---

# Release Acceptance

---

## 45. MVP Release Acceptance Checklist

```text
[ ] Core tourist QR-to-certificate flow works.
[ ] Tourist profile/visit data is stored correctly.
[ ] Photo upload works safely.
[ ] Certificate generation works.
[ ] Stamp/passport basics work.
[ ] Optional survey works.
[ ] Admin can manage attractions/photo spots/check-in codes.
[ ] Dashboard shows core metrics.
[ ] Export works and is privacy-safe.
[ ] Database constraints are applied.
[ ] Admin permissions are enforced.
[ ] Consent is recorded.
[ ] No critical security issue remains.
[ ] Documentation is sufficient for Codex/developer continuation.
```

---

## 46. Production-Oriented Acceptance Checklist

```text
[ ] RLS/storage policies reviewed.
[ ] Backups configured.
[ ] Environment variables secured.
[ ] Error monitoring configured.
[ ] Audit logs enabled.
[ ] Export retention configured.
[ ] Cleanup jobs configured or planned.
[ ] Dashboard performance acceptable.
[ ] Security tests passed.
[ ] Performance tests passed.
[ ] Manual mobile QR test passed.
[ ] Rollback plan exists.
```

---

## 47. Final Acceptance Rule

The platform is accepted when it can collect tourist data respectfully, generate value for tourists, protect privacy, and produce trustworthy analytics for sustainable tourism planning.

A working UI alone is not enough.
