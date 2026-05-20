# PERFORMANCE_CHECKLIST.md

## 1. Document Purpose

This checklist defines performance readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist when reviewing:

```text
QR landing page
public attraction pages
tourist form
photo upload
certificate generation
survey submission
passport/stamps
admin CMS
dashboard
exports
database queries
storage operations
deployment
```

Performance matters because tourists may use the system outdoors, on mobile networks, after scanning a QR code. If the flow is slow, users will abandon it and the database will not collect enough useful data.

---

## 2. Performance Mission

The performance mission is:

```text
Make the platform fast enough that tourists complete the flow and administrators can use analytics without waiting unnecessarily.
```

Performance is part of data collection strategy.

Slow UX leads to:

```text
low QR-to-certificate conversion
low photo upload success
low survey completion
weak database quality
poor admin trust
```

---

## 3. Related Documents

This checklist must align with:

```text
docs/testing/PERFORMANCE_TEST_PLAN.md
docs/frontend/PWA_REQUIREMENTS.md
docs/frontend/RESPONSIVE_GUIDELINES.md
docs/backend/DASHBOARD_SERVICES.md
docs/backend/STORAGE_FILE_UPLOADS.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/backend/EXPORT_REPORTING_SERVICES.md
docs/database/INDEXING_STRATEGY.md
docs/database/ANALYTICS_TABLES.md
checklists/FRONTEND_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
```

---

# Global Performance Checklist

---

## 4. General Performance Baseline

Checklist:

```text
[ ] App builds successfully.
[ ] Public pages load without admin bundle.
[ ] Tourist pages load without dashboard-heavy bundle.
[ ] Images are optimized.
[ ] Fonts are optimized.
[ ] Loading states appear quickly.
[ ] Duplicate submits are prevented.
[ ] APIs return only necessary data.
[ ] Dashboard queries run server-side.
[ ] Exports have row limits.
[ ] Heavy jobs are planned as background jobs when needed.
```

---

## 5. Performance Targets

Recommended MVP targets:

```text
[ ] QR landing meaningful content visible within 2 seconds on normal mobile network.
[ ] QR landing usable within 3 seconds.
[ ] Minimal profile submit returns within 1-2 seconds.
[ ] Survey submit returns within 1-2 seconds.
[ ] Certificate generation gives feedback immediately.
[ ] Dashboard KPI cards visible within 2-3 seconds.
[ ] Dashboard sections load within 5 seconds.
[ ] Small CSV export completes within 5 seconds.
```

If a target cannot be reached, document:

```text
reason
risk
temporary mitigation
future optimization
```

---

# Public and Tourist Page Performance

---

## 6. QR Landing Page

Checklist:

```text
[ ] QR landing page is mobile-first.
[ ] Primary content appears quickly.
[ ] Primary CTA appears without waiting for heavy media.
[ ] Large 360 media is lazy-loaded.
[ ] Attraction images are optimized.
[ ] Admin/dashboard JavaScript is not loaded.
[ ] Page does not call unnecessary APIs.
[ ] QR resolve API is fast.
[ ] Funnel event recording does not block page render.
[ ] Error/unavailable pages load quickly.
```

Common fixes:

```text
optimize hero image
server-render safe public context
lazy-load 360 media
reduce JavaScript
avoid blocking third-party scripts
```

---

## 7. Public Attraction Page

Checklist:

```text
[ ] Attraction list loads quickly.
[ ] Attraction cards use optimized images.
[ ] Attraction detail page uses optimized hero image.
[ ] 360 media is lazy-loaded.
[ ] Long content does not block first render.
[ ] Public page does not fetch admin-only data.
[ ] Public page uses caching where appropriate.
```

---

## 8. Minimal Profile Form

Checklist:

```text
[ ] Form page loads quickly.
[ ] Select/dropdown data is small or cached.
[ ] Submit button shows loading immediately.
[ ] Backend submit is fast.
[ ] Consent record creation does not create noticeable delay.
[ ] Duplicate submit is prevented.
[ ] Validation errors appear without full page reload where appropriate.
```

---

## 9. Photo Upload

Checklist:

```text
[ ] Upload component loads quickly.
[ ] Accepted file types are clear.
[ ] Invalid file type is rejected quickly.
[ ] Oversized file is rejected quickly.
[ ] Upload loading/progress state is visible.
[ ] Retry is possible.
[ ] Upload does not freeze UI.
[ ] Upload does not store huge base64 permanently.
[ ] Metadata insert is fast.
[ ] Storage failure is handled gracefully.
```

Test file sizes:

```text
[ ] 500 KB JPEG
[ ] 2 MB JPEG
[ ] 5 MB JPEG
[ ] oversized image
```

---

## 10. Certificate Preview and Generation

Checklist:

```text
[ ] Certificate preview renders without freezing UI.
[ ] Template assets are optimized.
[ ] Fonts used in certificate are loaded efficiently.
[ ] Generate button shows loading immediately.
[ ] Duplicate generation click is prevented.
[ ] Certificate image size is reasonable.
[ ] Certificate upload/storage is efficient.
[ ] Stamp award does not block certificate success unnecessarily.
[ ] Existing certificate is reused when applicable.
```

Avoid:

```text
huge canvas render size
large base64 stored in DB
multiple duplicate generation requests
unoptimized template images
```

---

## 11. Survey Submit

Checklist:

```text
[ ] Survey page loads quickly.
[ ] Survey uses small reference data payloads.
[ ] Submit button shows loading state.
[ ] Backend writes are efficient.
[ ] Survey completion event does not block response unnecessarily.
[ ] Thank-you state appears quickly.
```

---

## 12. Passport / Stamp Page

Checklist:

```text
[ ] Passport loads quickly.
[ ] Stamp assets are optimized.
[ ] Empty state loads quickly.
[ ] Large certificate thumbnails are not loaded unnecessarily.
[ ] Guest passport check is fast.
[ ] Optional identity linking does not block passport page.
```

---

# Frontend Bundle Performance

---

## 13. Bundle Splitting

Checklist:

```text
[ ] Public bundle does not include admin dashboard code.
[ ] QR landing does not include chart libraries.
[ ] Tourist certificate flow does not include admin tables.
[ ] Dashboard charts are lazy-loaded if heavy.
[ ] 360 media components are lazy-loaded.
[ ] Export/admin-only components are not loaded on tourist pages.
```

---

## 14. Image Optimization

Checklist:

```text
[ ] Attraction images are compressed.
[ ] Hero images use appropriate dimensions.
[ ] Stamp assets are small.
[ ] Certificate template assets are optimized.
[ ] Images have width/height to reduce layout shift.
[ ] Below-the-fold images are lazy-loaded.
[ ] Public media uses CDN/storage optimization where possible.
```

---

## 15. Font Optimization

Checklist:

```text
[ ] Only necessary fonts are loaded.
[ ] Font weights are limited.
[ ] Thai font renders correctly.
[ ] English font renders correctly.
[ ] font-display: swap or framework equivalent is used.
[ ] Certificate font loading is tested.
```

---

## 16. JavaScript Performance

Checklist:

```text
[ ] Heavy calculations are not done in render loops.
[ ] Dashboard chart data is pre-aggregated.
[ ] Large raw arrays are not stored in frontend state.
[ ] Forms do not rerender excessively.
[ ] Certificate rendering does not block for too long.
[ ] Debounce search/filter where useful.
```

---

# Backend/API Performance

---

## 17. API Response Size

Checklist:

```text
[ ] QR resolve API returns only safe needed fields.
[ ] Public attraction API is paginated or bounded.
[ ] Admin list APIs are paginated.
[ ] Dashboard API returns aggregated data.
[ ] Passport API returns only own needed data.
[ ] Export API does not return huge JSON payloads.
```

Avoid:

```text
returning all visits to frontend
returning all tourist profiles to dashboard
returning private file paths
returning unnecessary nested data
```

---

## 18. API Response Time

Checklist:

```text
[ ] QR resolve API is fast.
[ ] Profile submit API is fast.
[ ] Photo metadata API is fast.
[ ] Certificate generation API gives timely response.
[ ] Survey submit API is fast.
[ ] Dashboard API is acceptable with test data.
[ ] Export API handles small exports quickly.
```

---

## 19. N+1 Query Prevention

Check possible N+1 areas:

```text
[ ] Public attraction list.
[ ] Admin attraction list.
[ ] Passport stamp list.
[ ] Dashboard by attraction.
[ ] Certificate preview data.
[ ] Export row generation.
```

Fix with:

```text
joins
batched queries
views
summary tables
```

---

# Database Performance

---

## 20. Required Indexes

Checklist:

```text
[ ] visits(visit_date)
[ ] visits(attraction_id, visit_date)
[ ] visits(tourist_id)
[ ] visits(completion_status)
[ ] attractions(province_id)
[ ] attractions(slug)
[ ] checkin_codes(code)
[ ] certificates(visit_id)
[ ] tourist_stamps(tourist_id, attraction_id)
[ ] satisfaction_surveys(visit_id)
[ ] visit_expenses(visit_id)
[ ] funnel_events(event_name, event_time)
[ ] funnel_events(attraction_id, event_time)
[ ] audit_logs(created_at)
[ ] export_jobs(requested_by, created_at)
```

---

## 21. Query Performance Checks

Run or plan EXPLAIN ANALYZE for:

```text
[ ] visit count by province.
[ ] visit count by attraction.
[ ] visit trend by date.
[ ] satisfaction average by attraction.
[ ] expense summary.
[ ] funnel stage counts.
[ ] tourist origin distribution.
[ ] export visit records.
```

Acceptance:

```text
[ ] Queries use indexes for date/attraction/province filters.
[ ] Query time is acceptable with seeded test data.
[ ] No obviously unbounded full scans on large tables.
```

---

## 22. Summary Tables / Materialized Views

MVP can use live queries if data is small.

Production should consider:

```text
[ ] daily_attraction_stats
[ ] monthly_province_stats
[ ] daily_funnel_stats
[ ] daily_satisfaction_stats
[ ] daily_expense_stats
```

Checklist:

```text
[ ] Summary table need is documented.
[ ] Refresh strategy is planned.
[ ] Dashboard can switch to summary tables later.
[ ] Summary tables do not contain personal identifiers.
```

---

# Dashboard Performance

---

## 23. Dashboard Load

Checklist:

```text
[ ] KPI cards load first or have skeletons.
[ ] Heavy charts can load after KPI cards.
[ ] Dashboard filters are applied server-side.
[ ] Date range defaults to reasonable range.
[ ] Large date range is limited or warned.
[ ] Chart data is aggregated.
[ ] Tables are paginated or bounded.
```

---

## 24. Dashboard Filter Performance

Checklist:

```text
[ ] Filter changes show loading state.
[ ] Filtered query is server-side.
[ ] Empty result is handled.
[ ] Invalid filter is rejected.
[ ] Filter update does not freeze UI.
[ ] Old data does not display as if current after filter change.
```

---

## 25. Dashboard Payload Size

Checklist:

```text
[ ] Dashboard response excludes raw personal rows.
[ ] Dashboard response excludes raw comments by default.
[ ] Dashboard response excludes private identifiers.
[ ] Chart arrays are bounded.
[ ] Ranked tables have reasonable limits.
```

Recommended limits:

```text
top attractions: 10-20
chart categories: reasonable grouped values
large tables: pagination
```

---

# Export Performance

---

## 26. Export Limits

Checklist:

```text
[ ] Export row limit is defined.
[ ] Unfiltered large export is blocked or requires background job.
[ ] Export query uses filters.
[ ] Export query uses indexes.
[ ] Export memory usage is considered.
[ ] Export timeout behavior is safe.
```

Recommended MVP behavior:

```text
small/medium export works
large export returns EXPORT_TOO_LARGE with clear message
```

---

## 27. Export Generation

Checklist:

```text
[ ] CSV generation is streaming or bounded.
[ ] Thai text is preserved.
[ ] CSV escaping does not cause excessive memory overhead for normal size.
[ ] Audit log does not slow export too much.
[ ] Export file storage is optional and private.
[ ] Stored export files expire.
```

---

# Storage Performance

---

## 28. Storage Operations

Checklist:

```text
[ ] Photo upload to storage is tested.
[ ] Certificate file upload is tested.
[ ] Signed URL generation is fast.
[ ] Public attraction media loads efficiently.
[ ] Stamp assets load efficiently.
[ ] Export file upload/download is tested if used.
```

---

## 29. Orphan File Cleanup

Checklist:

```text
[ ] Orphan file risk is documented.
[ ] Cleanup job exists or is planned.
[ ] Failed DB insert after upload attempts cleanup.
[ ] Temp upload bucket is cleaned.
[ ] Expired export files are cleaned.
```

---

# Admin Performance

---

## 30. Admin Lists

Checklist:

```text
[ ] Attraction list uses pagination or bounded query.
[ ] Visit list uses pagination.
[ ] Survey list uses pagination if implemented.
[ ] Search/filter is server-side for large lists.
[ ] Admin tables do not render thousands of rows at once.
```

---

## 31. Admin Forms

Checklist:

```text
[ ] Form submit has loading state.
[ ] Save response is responsive.
[ ] Image upload does not freeze form.
[ ] Publish/deactivate actions respond quickly.
[ ] Audit logging does not create unacceptable delay.
```

---

# PWA / Offline Performance

---

## 32. PWA Basics

MVP PWA may be simple.

Checklist:

```text
[ ] App manifest exists or is planned.
[ ] Icons are optimized.
[ ] QR flow does not require install.
[ ] Offline fallback is planned.
[ ] Bad network behavior is graceful.
[ ] Passport guest storage limitation is explained.
```

Do not let PWA complexity delay core QR-to-certificate performance.

---

## 33. Poor Network Behavior

Checklist:

```text
[ ] Slow network loading states are visible.
[ ] Upload progress/loading is clear.
[ ] Failed upload can retry.
[ ] Failed certificate generation can retry.
[ ] Form data is not lost unnecessarily.
[ ] User is not left on blank page.
```

---

# Testing Performance Checklist

---

## 34. Manual Performance Test

Test manually:

```text
[ ] QR landing on desktop.
[ ] QR landing on real mobile phone.
[ ] QR flow on slow network throttle.
[ ] Photo upload with 2 MB image.
[ ] Photo upload with 5 MB image.
[ ] Certificate generation on mobile.
[ ] Dashboard load with seed data.
[ ] Export CSV with test data.
```

---

## 35. Lighthouse / DevTools

Checklist:

```text
[ ] Lighthouse run on public attraction page.
[ ] Lighthouse run on QR landing page.
[ ] DevTools network checked for large assets.
[ ] DevTools performance checked for certificate generation.
[ ] Bundle analyzer used if bundle is too large.
```

---

## 36. Load Testing Future

Future scenarios:

```text
[ ] 50 concurrent QR landing requests.
[ ] 20 concurrent profile submits.
[ ] 10 concurrent photo uploads.
[ ] 10 concurrent dashboard loads.
[ ] 10 concurrent exports blocked/queued if too heavy.
```

Do not load test production without approval.

---

# Monitoring Checklist

---

## 37. Runtime Monitoring

Production-oriented checklist:

```text
[ ] API response time monitored.
[ ] Error rate monitored.
[ ] Photo upload failure rate monitored.
[ ] Certificate generation failure rate monitored.
[ ] Dashboard query duration monitored.
[ ] Export failure rate monitored.
[ ] Database connection/CPU monitored.
[ ] Storage errors monitored.
[ ] Cron/job failures monitored.
```

---

## 38. Funnel + Performance Monitoring

Checklist:

```text
[ ] Funnel drop-off dashboard exists.
[ ] Landing drop-off can be compared with page performance.
[ ] Photo upload drop-off can be compared with upload failures.
[ ] Certificate drop-off can be compared with generation errors.
[ ] Survey drop-off can be compared with survey length/timing.
```

---

# Performance Acceptance Checklist

---

## 39. MVP Performance Acceptance

```text
[ ] QR landing page loads quickly enough on mobile.
[ ] Public attraction images are optimized.
[ ] Minimal form submit is responsive.
[ ] Photo upload gives immediate feedback.
[ ] Valid 5 MB image upload is tested.
[ ] Oversized file is rejected quickly.
[ ] Certificate generation gives immediate feedback.
[ ] Duplicate certificate generation is prevented.
[ ] Survey submit is responsive.
[ ] Dashboard uses backend aggregation.
[ ] Dashboard does not load all raw rows.
[ ] Main dashboard queries have indexes.
[ ] Small CSV export completes.
[ ] Large export has safe limit.
[ ] Real mobile test passed.
```

---

## 40. Critical Performance Blockers

Do not release if:

```text
[ ] QR landing is too slow to use.
[ ] Photo upload appears frozen.
[ ] Certificate generation has no loading/progress and often times out.
[ ] Dashboard loads all raw visits into frontend.
[ ] Dashboard queries time out with normal test data.
[ ] Export can trigger unbounded server timeout.
[ ] Large images make public pages unusable.
[ ] Duplicate clicks create duplicate records.
```

---

## 41. Do Not Do

Do not:

```text
load dashboard/chart libraries on QR landing page.
load all raw visits into frontend.
use unoptimized hero images.
store huge base64 certificate in database.
allow unbounded exports.
ignore mobile network conditions.
ignore real mobile photo upload testing.
run heavy dashboard queries without indexes.
hide slow operations without loading states.
```

---

## 42. Future Performance Enhancements

Possible future improvements:

```text
dashboard summary tables
materialized views
server-side dashboard cache
streaming CSV exports
background export jobs
image compression
thumbnail generation
WebP conversion
CDN optimization
bundle analyzer
Lighthouse CI
real user monitoring
```

---

## 43. Final Performance Rule

Performance is part of product quality and data quality.

If the system is slow, tourists will abandon the flow and the database will not support reliable tourism planning.
