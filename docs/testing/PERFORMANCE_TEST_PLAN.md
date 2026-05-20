# PERFORMANCE_TEST_PLAN.md

## 1. Document Purpose

This document defines the performance test plan for the **Southern Border Tourism Data & Intelligence Platform**.

Performance matters because the system is used by tourists in real locations, often on mobile networks, after scanning QR codes. If pages load slowly, photo upload feels stuck, certificate generation takes too long, or dashboards are heavy, users may abandon the flow and the database will not collect enough useful data.

Performance testing must cover:

```text
public pages
QR landing
minimal profile form
photo upload
certificate generation
survey submission
admin backoffice
dashboard analytics
exports
database queries
storage operations
```

---

## 2. Performance Testing Mission

The mission is:

```text
Ensure that the platform feels fast, reliable, and usable for tourists, admins, and planners under realistic conditions.
```

Performance tests should protect:

```text
tourist completion rate
mobile usability
QR landing conversion
photo upload reliability
certificate reward experience
dashboard responsiveness
export scalability
database stability
server resource usage
```

---

## 3. Performance Risks

Main risks:

```text
slow QR landing page
large attraction images
slow mobile network
large tourist photo uploads
certificate image rendering delay
duplicate submits while loading
dashboard queries scanning too much data
exports loading too many rows
storage bucket latency
unoptimized database indexes
serverless cold starts
```

---

## 4. Related Documents

This document aligns with:

```text
docs/frontend/PWA_STRATEGY.md
docs/frontend/TOURIST_FLOW_UI_SPEC.md
docs/backend/DASHBOARD_SERVICES.md
docs/backend/STORAGE_FILE_UPLOADS.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/backend/EXPORT_REPORTING_SERVICES.md
docs/database/INDEXING_STRATEGY.md
docs/database/ANALYTICS_TABLES.md
docs/testing/E2E_TEST_PLAN.md
docs/testing/UX_TEST_PLAN.md
```

---

## 5. Performance Test Scope

Test these areas:

```text
public attraction pages
QR/check-in landing pages
tourist profile form submit
photo upload
certificate preview/generation
survey submit
passport/stamp page
admin attraction CMS
admin QR/check-in management
dashboard API/services
dashboard frontend rendering
CSV exports
storage signed URL generation
database query performance
```

---

## 6. Performance Targets

## 6.1 Tourist QR Landing

Target:

```text
initial meaningful content visible within 2 seconds on normal mobile network
page usable within 3 seconds
```

Under slow network:

```text
clear loading state shown quickly
```

## 6.2 Minimal Profile Submit

Target:

```text
submit response within 1 second to 2 seconds
```

## 6.3 Photo Upload

Target depends on file size/network.

For 2-5 MB image:

```text
show upload progress/loading immediately
complete within reasonable mobile network time
no duplicate submits
```

Hard target may vary by network, but UX must not feel stuck.

## 6.4 Certificate Generation

Frontend-rendered MVP target:

```text
preview ready within 2 seconds after photo loaded
generation action completes within 3-5 seconds after click
```

If server-side rendering future:

```text
use background job or progress state if longer than 5 seconds
```

## 6.5 Survey Submit

Target:

```text
submit within 1-2 seconds
```

## 6.6 Dashboard Load

MVP target:

```text
KPI cards visible within 2-3 seconds
dashboard sections load within 5 seconds
```

For large data future:

```text
use summary tables or cached metrics
```

## 6.7 Export

Small CSV target:

```text
complete within 5 seconds
```

Large export:

```text
use background job future
```

---

## 7. Key Performance Metrics

Measure:

```text
Time to First Byte
First Contentful Paint
Largest Contentful Paint
Interaction to Next Paint
Total Blocking Time
Cumulative Layout Shift
API response time
database query time
photo upload duration
certificate generation duration
dashboard query duration
CSV export duration
error rate
timeout rate
```

For UX-specific flow:

```text
time from QR open to certificate generated
time from certificate generated to survey submitted
form completion time
drop-off step from funnel analytics
```

---

## 8. Tools

Recommended tools:

```text
Chrome DevTools
Lighthouse
Playwright timing checks
WebPageTest optional
Vercel Analytics optional
Supabase query logs
PostgreSQL EXPLAIN ANALYZE
k6 or Artillery future
browser network throttling
real mobile device testing
```

MVP minimum:

```text
Chrome DevTools
Lighthouse
Playwright E2E timing checks
database EXPLAIN for heavy dashboard queries
```

---

## 9. Test Network Conditions

Test under:

```text
desktop fast network
mobile 4G
slow 4G
offline/poor network behavior for PWA future
```

Recommended Chrome throttles:

```text
Fast 4G
Slow 4G
Regular 3G optional
```

Real device testing is important for photo upload and certificate download.

---

## 10. Device and Browser Matrix

Minimum:

```text
desktop Chrome
mobile Chrome Android
mobile Safari iOS
```

If LINE LIFF is implemented:

```text
LINE in-app browser Android
LINE in-app browser iOS
```

Optional:

```text
Edge desktop
Firefox desktop
tablet viewport
```

---

# Tourist Flow Performance Tests

---

## 11. QR Landing Page Performance Test

## 11.1 Scenario

```text
Tourist opens /checkin/[code] from QR scan.
```

## 11.2 Measure

```text
TTFB
FCP
LCP
page JS size
image load size
API response time for check-in context
funnel event request time
```

## 11.3 Acceptance

```text
page shows attraction context quickly
primary CTA visible without long wait
no heavy dashboard/admin bundle loaded
images optimized
no layout shift that moves CTA unexpectedly
```

## 11.4 Common Fixes

```text
optimize hero image
server-render public context
split admin code from public bundle
lazy-load 360 media
preload key font/assets
reduce third-party scripts
```

---

## 12. Public Attraction Page Performance Test

## 12.1 Scenario

```text
Visitor opens public attraction page.
```

## 12.2 Measure

```text
page size
image size
LCP
360 media lazy-load behavior
route transition time
```

## 12.3 Acceptance

```text
published attraction content loads quickly
360 media does not block initial page
large images are optimized
```

---

## 13. Minimal Profile Submit Performance Test

## 13.1 Scenario

```text
Tourist submits minimal profile after QR scan.
```

## 13.2 Measure

```text
API response time
database insert time
consent record insert time
funnel event insert time
client loading state latency
```

## 13.3 Acceptance

```text
submit button enters loading state immediately
request completes within target
duplicate submit is prevented
user sees next step clearly
```

---

## 14. Photo Upload Performance Test

## 14.1 Scenario

```text
Tourist uploads photo for certificate.
```

## 14.2 Test Files

Use synthetic images:

```text
500 KB JPEG
2 MB JPEG
5 MB JPEG
invalid large file
```

Optional:

```text
PNG
WebP
iPhone HEIC unsupported case
```

## 14.3 Measure

```text
upload duration
storage response time
metadata insert time
preview render time
error handling time
```

## 14.4 Acceptance

```text
upload progress/loading shown immediately
valid file succeeds
large invalid file rejected quickly
user can retry
no duplicate metadata from retry
```

## 14.5 Common Fixes

```text
client-side image compression future
show progress indicator
file size hint
resize/compress before upload future
use direct upload signed URL future if needed
```

---

## 15. Certificate Generation Performance Test

## 15.1 Scenario

```text
Tourist generates certificate after photo upload.
```

## 15.2 Measure

```text
time to certificate preview
time to render image
time to upload generated image
time to create certificate record
time to award stamp
time to show success page
```

## 15.3 Acceptance

```text
user sees progress state
double-click prevented
certificate appears within target
success state clearly shown
stamp failure does not block certificate
```

## 15.4 Common Fixes

```text
optimize certificate component
ensure fonts/assets preloaded
reduce certificate image size
avoid huge base64 strings in state
use server-side/background rendering future
```

---

## 16. Survey Submit Performance Test

## 16.1 Scenario

```text
Tourist submits optional survey.
```

## 16.2 Measure

```text
API response time
database write time
dashboard-impacting fields saved
funnel event insert time
```

## 16.3 Acceptance

```text
submit completes quickly
thank-you page shown
certificate access remains available
```

---

## 17. Passport Page Performance Test

## 17.1 Scenario

```text
Tourist opens digital passport/stamp page.
```

## 17.2 Measure

```text
API response time
stamp list render time
certificate thumbnails if any
image loading
```

## 17.3 Acceptance

```text
passport loads quickly
stamp graphics are optimized
guest passport does not require heavy auth flow
```

---

# Admin Performance Tests

---

## 18. Admin Login and Dashboard Entry Test

Measure:

```text
login route load time
auth session check time
admin shell load time
dashboard initial load time
```

Acceptance:

```text
admin login feels responsive
protected route redirects correctly
dashboard loads KPI skeletons quickly
```

---

## 19. Admin Attraction List Performance Test

Scenario:

```text
Admin opens attraction list with many attractions.
```

Test sizes:

```text
10 attractions
100 attractions
1000 attractions future
```

Acceptance:

```text
pagination or server filtering used
no huge client-side list if data grows
search/filter responsive
```

---

## 20. Admin CMS Save Performance Test

Measure:

```text
create attraction response time
update attraction response time
publish/deactivate response time
audit log write time
```

Acceptance:

```text
form shows loading state
save completes within target
audit log does not noticeably slow down normal action
```

---

# Dashboard Performance Tests

---

## 21. Executive Dashboard Performance Test

Scenario:

```text
Admin opens /admin/dashboard with default filters.
```

Measure:

```text
executive metrics query time
visits by province query time
visits by attraction query time
funnel metrics query time
satisfaction metrics query time
expense metrics query time
frontend render time
```

Acceptance:

```text
KPI cards load within target
heavy charts can load progressively
section-level loading allowed
no raw full-table aggregation in frontend
```

---

## 22. Dashboard Filter Performance Test

Scenario:

```text
Admin changes date/province/attraction filters.
```

Measure:

```text
API request duration
database query duration
UI update time
URL update
```

Acceptance:

```text
filter changes do not freeze UI
old loading state replaced clearly
empty states work
```

---

## 23. Dashboard Large Dataset Test

Suggested synthetic data sizes:

```text
1,000 visits
10,000 visits
100,000 visits future
```

Measure:

```text
query time
CPU/memory
response payload size
chart rendering time
```

Acceptance MVP:

```text
1,000-10,000 visit dataset remains usable with indexes
```

Production:

```text
summary tables/materialized views used for heavier ranges
```

---

## 24. Dashboard Query EXPLAIN Tests

Run EXPLAIN ANALYZE for heavy queries:

```text
visit count by province
visit count by attraction
average satisfaction by attraction
expense summary
funnel stage counts
tourist origin distribution
```

Check:

```text
indexes used
no unexpected full scans on large tables
join order reasonable
query time acceptable
```

Required indexes documented in:

```text
docs/database/INDEXING_STRATEGY.md
```

---

# Export Performance Tests

---

## 25. Small CSV Export Test

Scenario:

```text
Admin exports dashboard summary or filtered visits under 1,000 rows.
```

Measure:

```text
query time
CSV generation time
download response time
audit log write time
```

Acceptance:

```text
complete within 5 seconds
file opens correctly
no memory spike
```

---

## 26. Medium CSV Export Test

Scenario:

```text
Admin exports 10,000 rows.
```

Measure:

```text
memory usage
duration
timeout risk
CSV size
```

Acceptance:

```text
works if within platform timeout
otherwise system returns EXPORT_TOO_LARGE and asks user to narrow filters
```

Future:

```text
background export job
streaming CSV
```

---

## 27. Export Limit Test

Test:

```text
unfiltered detailed export with too many rows
```

Expected:

```text
safe rejection
clear error message
no server timeout
no partial file leaked
```

---

# Database Performance Tests

---

## 28. Index Validation

Verify indexes exist for:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
visits(completion_status)
attractions(province_id)
certificates(visit_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys(visit_id)
satisfaction_surveys(attraction_id)
visit_expenses(visit_id)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
```

---

## 29. Insert Performance

Test inserts for:

```text
tourist profile + identity
visit
consent records
funnel events
photo metadata
certificate record
survey responses
audit logs
```

Acceptance:

```text
normal user flow writes quickly
no unnecessary multiple sequential queries when batch/transaction is better
```

---

## 30. Transaction Performance

For workflows:

```text
profile + visit + consent
certificate + visit update + stamp
survey + expense + funnel event
```

Check:

```text
transaction duration
lock contention
duplicate conflict behavior
```

---

# API Performance Tests

---

## 31. API Response Size

APIs must not return more data than needed.

Check:

```text
QR context response small
dashboard response aggregated
exports streamed/downloaded not JSON huge payload
admin list paginated
```

Do not return:

```text
entire visits table
full tourist profiles in dashboard
private storage paths unnecessarily
```

---

## 32. N+1 Query Tests

Detect N+1 in:

```text
admin attraction list
dashboard by attraction
passport stamp list
certificate preview data
```

Acceptance:

```text
service uses joins/batched queries
query count stays reasonable
```

---

# Frontend Bundle Performance

---

## 33. Bundle Size Checks

Public tourist pages should not load admin/dashboard code.

Check:

```text
QR landing bundle
public attraction bundle
admin dashboard bundle
certificate page bundle
```

Rules:

- lazy-load heavy admin components.
- lazy-load charts.
- lazy-load 360 media.
- avoid importing all chart libraries into tourist landing page.

---

## 34. Image Optimization Checks

Check:

```text
attraction hero images optimized
stamp images small
certificate template assets optimized
lazy loading for below-the-fold images
correct width/height to reduce layout shift
```

---

## 35. Font Performance

Check:

```text
fonts load without blocking too long
Thai/English fonts display correctly
avoid too many font weights
```

Use:

```text
font-display: swap
```

where appropriate.

---

# Load and Stress Tests

---

## 36. MVP Load Test

MVP basic test:

```text
50 concurrent QR landing requests
20 concurrent profile submissions
10 concurrent photo uploads
10 concurrent dashboard loads
```

Goal:

```text
detect obvious failures
```

---

## 37. Production Load Test Future

Future test:

```text
100-500 concurrent QR scans during event
large photo upload burst
dashboard access by multiple admins
scheduled export/report generation
```

Tools:

```text
k6
Artillery
Playwright parallel
```

Do not run load tests against production without approval.

---

# Monitoring and Observability

---

## 38. Runtime Metrics to Monitor

Production should monitor:

```text
API response time
error rate
photo upload failure rate
certificate generation failure rate
dashboard query duration
export failure rate
database CPU/connection count
storage errors
cron/job failures
```

---

## 39. Funnel-Performance Link

Performance should be analyzed with funnel data.

Example:

```text
high photo upload drop-off + slow upload time = upload UX/performance issue
high landing drop-off + slow LCP = landing performance issue
high certificate drop-off + render errors = certificate performance issue
```

---

# Acceptance Checklist

---

## 40. MVP Performance Acceptance Checklist

```text
[ ] QR landing loads quickly on mobile.
[ ] Public attraction page images are optimized.
[ ] Minimal profile submit is responsive.
[ ] Photo upload shows loading/progress and handles valid 5 MB file.
[ ] Invalid large file is rejected quickly.
[ ] Certificate generation shows progress and prevents duplicate click.
[ ] Survey submit is responsive.
[ ] Admin attraction list is paginated or bounded.
[ ] Dashboard uses backend aggregation.
[ ] Dashboard does not aggregate all raw rows in frontend.
[ ] Main dashboard queries have indexes.
[ ] Small CSV export completes successfully.
[ ] Large/unfiltered export has safe limit.
[ ] Loading/empty/error states exist.
```

---

## 41. Do Not Do

Do not:

```text
Load all raw visits into frontend for dashboard.
Load admin bundle on QR landing page.
Use unoptimized large attraction images.
Let users double-submit certificate generation.
Run unbounded exports.
Store certificate as huge base64 in database.
Ignore slow mobile networks.
Ignore LINE browser performance if LIFF is used.
Run heavy dashboard queries without date filters/indexes.
```

---

## 42. Future Enhancements

Possible future improvements:

```text
dashboard summary tables
materialized views
short TTL dashboard cache
streaming CSV exports
background export jobs
image compression pipeline
thumbnail generation
CDN optimization
real user monitoring
automated Lighthouse CI
performance budget CI
```

---

## 43. Final Performance Rule

Performance is part of data collection strategy.

If the system is slow, tourists will not complete the flow, and the database will not have enough useful data for planning.
