# PRODUCTION_RELEASE_CHECKLIST.md

## 1. Document Purpose

This checklist defines what must be verified before releasing the **Southern Border Tourism Data & Intelligence Platform** to staging, academic demonstration, pilot use, or production-oriented deployment.

Use this checklist before:

```text
demo to instructor
MVP milestone
staging deployment
pilot deployment
production deployment
major release
```

---

## 2. Release Principle

A release is acceptable only when the system is:

```text
functional
secure
privacy-safe
tested
documented
deployable
recoverable
```

A beautiful interface is not enough if data, permissions, exports, or dashboard metrics are wrong.

---

## 3. Release Types

## 3.1 Academic Demo Release

Goal:

```text
show complete project concept, database design, core flows, dashboard, and documentation
```

Can tolerate:

```text
limited scale
manual operations
some future/planned features
```

Cannot tolerate:

```text
broken core flow
wrong dashboard logic
privacy leak
missing database design
```

## 3.2 MVP Pilot Release

Goal:

```text
allow controlled real-world testing with a small number of attractions/users
```

Requires stronger:

```text
security
storage safety
consent
export privacy
mobile testing
```

## 3.3 Production-Oriented Release

Goal:

```text
ready for wider real use
```

Requires:

```text
monitoring
backups
RLS/storage review
performance testing
security review
operational process
```

---

# 4. Release Readiness Summary

Before release, confirm:

```text
[ ] core tourist flow works end to end
[ ] admin flow works
[ ] dashboard metrics are correct
[ ] exports are privacy-safe
[ ] database constraints are applied
[ ] storage buckets are secured
[ ] admin permissions are enforced
[ ] consent is recorded
[ ] tests or manual QA evidence exist
[ ] deployment configuration is correct
[ ] no critical blockers remain
```

---

# Functional Checklist

---

## 5. Public Website

```text
[ ] Home/public landing page loads.
[ ] Public attraction list loads.
[ ] Public attraction detail page loads.
[ ] Published active attraction is visible.
[ ] Unpublished attraction is not public.
[ ] Inactive attraction is not public.
[ ] Attraction images load correctly.
[ ] 360 media references load or gracefully fallback.
[ ] Thai content displays correctly.
[ ] English content displays correctly if available.
[ ] Mobile layout is usable.
```

---

## 6. QR / Check-in Flow

```text
[ ] Active QR/check-in code opens correct landing page.
[ ] Invalid QR shows safe error.
[ ] Inactive QR shows safe unavailable message.
[ ] Expired QR shows safe unavailable message.
[ ] Landing page shows attraction name.
[ ] Landing page shows photo spot context if available.
[ ] Landing page explains certificate benefit.
[ ] CTA is visible on mobile.
[ ] QR flow does not require login.
[ ] QR flow does not require LINE.
[ ] QR flow works for English/foreign guest path.
```

---

## 7. Tourist Minimal Profile

```text
[ ] Display name field works.
[ ] Origin country/province field works.
[ ] Age group field works.
[ ] Preferred language works if included.
[ ] Consent checkbox exists.
[ ] Consent checkbox is not pre-checked.
[ ] Submit without consent is blocked.
[ ] Submit without required fields is blocked.
[ ] Backend validates form.
[ ] No email required.
[ ] No LINE required.
[ ] No phone required.
[ ] No national ID required.
[ ] No full address required.
[ ] Tourist record is created/reused.
[ ] Visit record is created.
[ ] Consent record is created.
```

---

## 8. Photo Upload

```text
[ ] JPEG upload works.
[ ] PNG upload works.
[ ] WebP upload works.
[ ] PDF upload is rejected.
[ ] SVG tourist upload is rejected.
[ ] Oversized file is rejected.
[ ] Upload loading/progress is visible.
[ ] Upload preview appears.
[ ] Retry works.
[ ] Upload is linked to correct visit.
[ ] Wrong visit ownership is rejected.
[ ] Storage path is server-generated.
[ ] Storage path contains no personal data.
[ ] Tourist photo is not publicly listable.
```

---

## 9. Certificate Generation

```text
[ ] Certificate preview loads.
[ ] Certificate contains display name.
[ ] Certificate contains attraction name.
[ ] Certificate contains visit date.
[ ] Certificate uses uploaded photo.
[ ] Certificate generation works.
[ ] Certificate file is stored.
[ ] Certificate database record is created.
[ ] Visit status updates.
[ ] Duplicate generation does not create duplicate certificate.
[ ] Download button works.
[ ] Certificate does not include email/LINE ID/internal ID.
[ ] Certificate file access is private/controlled.
```

---

## 10. Digital Stamp and Passport

```text
[ ] Stamp definition exists for test attraction.
[ ] Stamp is awarded after certificate.
[ ] Duplicate stamp for same tourist-attraction is prevented.
[ ] Passport page shows earned stamp.
[ ] Guest passport works on same browser/device.
[ ] Returning tourist can earn stamp at another attraction.
[ ] Passport response does not expose provider_user_id.
[ ] Optional LINE/email saving is not required.
```

---

## 11. Optional Survey

```text
[ ] Survey appears after certificate.
[ ] Survey is optional.
[ ] Certificate download works without survey.
[ ] Travel companion field works.
[ ] Group size field works.
[ ] Transport mode field works.
[ ] Travel purpose field works.
[ ] Overnight/nights fields work.
[ ] Spending range field works.
[ ] Satisfaction score field works.
[ ] Revisit/recommendation fields work.
[ ] Comment is optional.
[ ] Survey submit works.
[ ] Survey duplicate behavior is controlled.
[ ] Dashboard updates or can read survey data.
```

---

# Admin Checklist

---

## 12. Admin Authentication

```text
[ ] Anonymous user is redirected from admin pages.
[ ] Admin login works.
[ ] Admin logout works.
[ ] Inactive admin is blocked.
[ ] Admin session is checked server-side.
[ ] Admin route access does not rely only on frontend.
```

---

## 13. Roles and Permissions

```text
[ ] super_admin role exists.
[ ] admin role exists.
[ ] viewer role exists.
[ ] Viewer can view allowed dashboard.
[ ] Viewer cannot create attraction.
[ ] Viewer cannot update attraction.
[ ] Viewer cannot export detailed data.
[ ] Admin can manage content.
[ ] Admin cannot manage users unless permitted.
[ ] Super admin can manage users/roles.
[ ] Direct API calls enforce permissions.
```

---

## 14. Attraction CMS

```text
[ ] Admin can create attraction.
[ ] Admin can edit attraction.
[ ] Admin can publish attraction.
[ ] Admin can unpublish/deactivate attraction.
[ ] Slug uniqueness is enforced.
[ ] Province/district relationship works.
[ ] Image/media upload works.
[ ] Public page reflects publish status.
[ ] Audit log is created for publish/deactivate.
```

---

## 15. Photo Spot Management

```text
[ ] Admin can create photo spot.
[ ] Photo spot belongs to attraction.
[ ] Admin can update photo spot.
[ ] Admin can deactivate photo spot.
[ ] Inactive photo spot is not usable in public flow.
[ ] Audit log is created.
```

---

## 16. Check-in Code Management

```text
[ ] Admin can create check-in code.
[ ] Check-in code is unique.
[ ] Check-in code is URL-safe.
[ ] Check-in code links to attraction.
[ ] Check-in code can link to photo spot.
[ ] Admin can deactivate check-in code.
[ ] Active code resolves publicly.
[ ] Deactivated code is blocked publicly.
[ ] QR link/download/copy works if implemented.
[ ] Audit log is created.
```

---

# Database Checklist

---

## 17. Schema and Migration

```text
[ ] Latest migrations applied.
[ ] Database schema matches documentation.
[ ] Core tables exist.
[ ] Reference tables exist.
[ ] Foreign keys exist.
[ ] Unique constraints exist.
[ ] Check constraints exist.
[ ] Indexes exist for dashboard/export queries.
[ ] Seed data inserted.
[ ] Migration rollback plan exists or is documented.
```

---

## 18. Critical Constraints

```text
[ ] attractions.slug unique.
[ ] checkin_codes.code unique.
[ ] tourist_identities(provider, provider_user_id) unique.
[ ] tourist_stamps(tourist_id, attraction_id) unique.
[ ] satisfaction survey duplicate rule enforced.
[ ] score range checks 1-5.
[ ] valid status values enforced.
[ ] visit -> tourist FK valid.
[ ] visit -> attraction FK valid.
[ ] certificate -> visit FK valid.
```

---

## 19. Seed Data

```text
[ ] Yala province exists.
[ ] Pattani province exists.
[ ] Narathiwat province exists.
[ ] District/reference data exists.
[ ] Countries reference exists.
[ ] Age group values exist.
[ ] Transport modes exist.
[ ] Travel purposes exist.
[ ] Travel companions exist.
[ ] Expense categories exist.
[ ] Spending ranges exist.
[ ] Certificate template exists.
[ ] Stamp assets/definitions exist.
[ ] Test attraction/photo spot/check-in code exists for staging/demo.
```

---

# Dashboard Checklist

---

## 20. Dashboard Access

```text
[ ] Dashboard route is protected.
[ ] Viewer/admin permissions work.
[ ] Dashboard loads with default filters.
[ ] Date filter works.
[ ] Province filter works.
[ ] Attraction filter works.
[ ] URL filter state works if implemented.
[ ] Loading states exist.
[ ] Empty states exist.
[ ] Error states exist.
```

---

## 21. Executive Metrics

```text
[ ] Tourist Profiles count works.
[ ] Total Visits count works.
[ ] Certificates Generated count works.
[ ] Stamps Earned count works.
[ ] Survey Completion Rate works.
[ ] Average Satisfaction works.
[ ] Estimated Spending works.
[ ] Top Attraction works.
[ ] QR scans are not counted as visits.
[ ] Missing satisfaction is not 0.
[ ] Estimated spending is not labeled revenue.
```

---

## 22. Profile/Behavior/Expense/Satisfaction Dashboards

```text
[ ] Origin country distribution works.
[ ] Origin province distribution works.
[ ] Age group distribution works.
[ ] Travel companion distribution works.
[ ] Transport mode distribution works.
[ ] Travel purpose distribution works.
[ ] Same-day/overnight analysis works.
[ ] Spending range distribution works.
[ ] Expense category distribution works.
[ ] Satisfaction by attraction works.
[ ] Revisit/recommendation rates work.
```

---

## 23. Funnel and Sustainability Dashboards

```text
[ ] Funnel stage counts work.
[ ] Funnel conversion rates work.
[ ] Funnel drop-off rates work.
[ ] Zero denominator shows No data/null.
[ ] Funnel by attraction/photo spot works or is planned.
[ ] High visit/low satisfaction insight works or is planned.
[ ] Low visit/high satisfaction insight works or is planned.
[ ] Attraction concentration works or is planned.
[ ] Data limitations are visible.
```

---

# Export Checklist

---

## 24. Export Functionality

```text
[ ] Dashboard summary export works.
[ ] Visit export works.
[ ] Satisfaction export works or is planned.
[ ] Expense export works or is planned.
[ ] Funnel summary export works or is planned.
[ ] CSV has header row.
[ ] CSV handles Thai text.
[ ] CSV escapes commas/quotes/newlines.
[ ] Filename is safe.
[ ] No-data export behavior is clear.
[ ] Large export limit is enforced.
```

---

## 25. Export Privacy and Audit

```text
[ ] Export requires authentication.
[ ] Export requires permission.
[ ] Viewer cannot export detailed data.
[ ] Export excludes email by default.
[ ] Export excludes LINE ID/provider_user_id by default.
[ ] Export excludes guest token/device token by default.
[ ] Export excludes private photo/certificate paths.
[ ] Raw comments excluded unless permission allows.
[ ] Export creates audit log.
[ ] Audit log includes filters and row count.
[ ] Export files are private if stored.
[ ] Export files expire if stored.
```

---

# Security Checklist

---

## 26. Authentication and Authorization

```text
[ ] Admin routes require login.
[ ] Admin APIs require login.
[ ] Backend checks permissions.
[ ] Viewer cannot mutate data.
[ ] Admin cannot manage users unless permitted.
[ ] Tourist ownership checks exist.
[ ] Guest token cannot access admin.
[ ] Inactive admin is blocked.
```

---

## 27. Storage Security

```text
[ ] visit-photos bucket is private or controlled.
[ ] certificate-files bucket is private or controlled.
[ ] export-files bucket is private.
[ ] official-imports bucket is private if used.
[ ] temp-uploads bucket is private if used.
[ ] attraction-media public read only if intended.
[ ] stamp-assets public read only if intended.
[ ] Public write is disabled.
[ ] Signed URLs are short-lived.
[ ] Signed URLs are not stored permanently.
```

---

## 28. Secrets and Environment

```text
[ ] .env is not committed.
[ ] .env.example exists and contains no secrets.
[ ] SUPABASE_SERVICE_ROLE_KEY is server-only.
[ ] DATABASE_URL is server-only.
[ ] LINE_CHANNEL_SECRET is server-only if used.
[ ] CRON_SECRET is server-only if used.
[ ] Frontend bundle does not contain private secrets.
[ ] Environment variables are configured in deployment.
```

---

## 29. RLS / Database Security

```text
[ ] RLS enabled on sensitive tables if direct Supabase access is used.
[ ] Public can read only published public content.
[ ] tourists table is not publicly readable.
[ ] tourist_identities table is not publicly readable.
[ ] visits table is not publicly readable.
[ ] visit_photos table is not publicly readable.
[ ] certificates table is not publicly readable.
[ ] survey tables are not publicly readable.
[ ] audit_logs are restricted.
[ ] export_jobs are restricted.
```

---

## 30. Input and File Validation

```text
[ ] Tourist form validates server-side.
[ ] Admin forms validate server-side.
[ ] Dashboard filters validate server-side.
[ ] Export filters validate server-side.
[ ] File type validates server-side.
[ ] File size validates server-side.
[ ] SVG tourist upload rejected.
[ ] Dangerous disguised files rejected.
[ ] Error responses are safe.
```

---

# Privacy / PDPA Checklist

---

## 31. Data Minimization

```text
[ ] No national ID collected.
[ ] No full address collected.
[ ] No phone required.
[ ] No exact birthdate required.
[ ] Age group used instead of exact age.
[ ] Origin is non-specific.
[ ] Spending is range-based.
[ ] Survey is optional.
[ ] LINE/email optional.
```

---

## 32. Consent

```text
[ ] Consent text shown.
[ ] Consent checkbox not pre-checked.
[ ] Consent required before profile/visit save.
[ ] Consent version stored.
[ ] Consent source stored.
[ ] Consent timestamp stored.
[ ] Photo usage notice shown.
[ ] Survey optional notice shown.
[ ] LINE linking consent separate if implemented.
[ ] Communication consent separate if implemented.
```

---

## 33. Personal Data Protection

```text
[ ] Dashboard is aggregated by default.
[ ] Exports exclude identifiers by default.
[ ] Raw comments restricted.
[ ] Tourist photos protected.
[ ] Certificate sharing not public by default.
[ ] Anonymization/deletion strategy documented.
[ ] Data retention policy documented.
```

---

# Performance Checklist

---

## 34. Tourist Performance

```text
[ ] QR landing loads quickly on mobile.
[ ] Public attraction page images are optimized.
[ ] Minimal form submit is responsive.
[ ] Photo upload has loading/progress state.
[ ] Certificate generation has loading/progress state.
[ ] Duplicate submit is prevented.
[ ] Survey submit is responsive.
[ ] Real mobile device test passed.
```

---

## 35. Admin/Dashboard Performance

```text
[ ] Admin pages do not load unnecessary public/tourist bundles.
[ ] Attraction list uses pagination/filtering if needed.
[ ] Dashboard uses backend aggregation.
[ ] Dashboard queries use indexes.
[ ] Dashboard does not fetch all raw rows.
[ ] Large export has safe limit or background plan.
```

---

# Testing Checklist

---

## 36. Automated Tests

```text
[ ] Unit tests pass.
[ ] Integration tests pass.
[ ] E2E tests pass or manual equivalent documented.
[ ] Security tests pass.
[ ] Typecheck passes.
[ ] Lint passes.
[ ] Build passes.
```

Recommended commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Adjust commands to actual project scripts.

---

## 37. Manual QA

```text
[ ] Scan real QR from phone.
[ ] Complete tourist certificate flow on phone.
[ ] Upload photo from phone.
[ ] Download certificate on phone.
[ ] Submit optional survey.
[ ] Test English/foreign guest path.
[ ] Test admin create attraction.
[ ] Test admin create QR code.
[ ] Test dashboard filters.
[ ] Test export CSV opens correctly.
```

---

## 38. Regression Tests

Before release, retest:

```text
[ ] QR flow.
[ ] Photo upload.
[ ] Certificate generation.
[ ] Stamp/passport.
[ ] Survey submit.
[ ] Admin CRUD.
[ ] Dashboard metrics.
[ ] Export.
[ ] Permission checks.
[ ] Storage access.
```

---

# Documentation Checklist

---

## 39. Project Documentation

```text
[ ] README updated.
[ ] PROJECT_OVERVIEW updated.
[ ] PRODUCT_REQUIREMENTS updated.
[ ] MVP_SCOPE updated.
[ ] ROADMAP updated.
[ ] ARCHITECTURE docs updated.
[ ] DATABASE docs updated.
[ ] FRONTEND docs updated.
[ ] BACKEND docs updated.
[ ] DASHBOARD docs updated.
[ ] SECURITY docs updated.
[ ] TESTING docs updated.
[ ] DEPLOYMENT docs updated.
[ ] ENVIRONMENT docs updated.
```

---

## 40. Academic Report Documentation

```text
[ ] Chapter 1 draft ready.
[ ] Chapter 2 draft ready.
[ ] Chapter 3 analysis/design ready.
[ ] Chapter 4 implementation evidence ready.
[ ] Chapter 5 conclusion/recommendations ready.
[ ] ERD report ready.
[ ] Data dictionary report ready.
[ ] Dashboard report ready.
[ ] Screenshots collected.
[ ] Test evidence collected.
```

---

# Deployment Checklist

---

## 41. Environment Setup

```text
[ ] Production/staging environment selected.
[ ] Database project configured.
[ ] Storage buckets configured.
[ ] Environment variables set.
[ ] Public URL configured.
[ ] Auth redirect URLs configured.
[ ] LINE LIFF callback/domain configured if used.
[ ] CORS/settings reviewed.
```

---

## 42. Build and Release

```text
[ ] Clean install works.
[ ] Build command succeeds.
[ ] Migration command succeeds.
[ ] Seed command succeeds for required data.
[ ] Deployment succeeds.
[ ] Smoke test passes.
[ ] Rollback procedure known.
```

---

## 43. Monitoring and Operations

Production-oriented checklist:

```text
[ ] Error logging configured.
[ ] Database backup configured.
[ ] Storage backup/retention reviewed.
[ ] Export cleanup planned.
[ ] Orphan file cleanup planned.
[ ] Cron endpoints protected if used.
[ ] Admin account recovery plan exists.
[ ] Contact/support process exists.
```

---

# Release Blockers

---

## 44. Critical Blockers

Do not release if any are true:

```text
[ ] QR-to-certificate flow is broken.
[ ] Certificate generation fails.
[ ] Photo upload is unsafe or broken.
[ ] Anonymous user can access admin.
[ ] Viewer can mutate data.
[ ] Export includes personal identifiers by default.
[ ] Service role key exposed.
[ ] Tourist can access another tourist's data.
[ ] Tourist photos are publicly exposed unintentionally.
[ ] Dashboard metrics are clearly wrong.
[ ] Consent is not collected.
[ ] Build fails.
```

---

## 45. High-Risk Issues to Fix Before Real Pilot

```text
[ ] No mobile testing done.
[ ] No export privacy testing done.
[ ] No storage access testing done.
[ ] No permission testing done.
[ ] No database constraints for duplicate stamps/certificates.
[ ] No audit logs for exports.
[ ] No safe large export limit.
[ ] No data retention/anonymization plan.
```

---

# Final Sign-Off

---

## 46. Release Sign-Off Table

| Area | Owner | Status | Notes |
|---|---|---|---|
| Tourist flow |  | pending |  |
| Admin CMS |  | pending |  |
| Database |  | pending |  |
| Dashboard |  | pending |  |
| Export |  | pending |  |
| Security |  | pending |  |
| Privacy/PDPA |  | pending |  |
| Performance |  | pending |  |
| Testing |  | pending |  |
| Documentation |  | pending |  |
| Deployment |  | pending |  |

Status values:

```text
pending
passed
failed
accepted_with_risk
not_applicable
```

---

## 47. Accepted Risks

If releasing with known limitations, document them:

```text
risk
impact
reason accepted
mitigation
owner
review date
```

Example:

```text
Risk: Background export jobs not implemented.
Impact: Very large exports may be rejected.
Reason accepted: MVP dataset is small.
Mitigation: Enforce export row limit and document future background jobs.
Owner: Developer
Review date: Before pilot expansion
```

---

## 48. Final Release Rule

Release only when the core tourist flow works, sensitive data is protected, dashboard numbers are trustworthy, and the team understands any remaining risks.

If the system cannot safely collect and analyze tourist data, it is not ready.
