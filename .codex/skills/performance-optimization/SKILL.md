---
name: performance-optimization
description: Use when improving, reviewing, or debugging performance including QR landing speed, photo upload, certificate rendering, mobile performance, bundle size, image optimization, dashboard query performance, database indexing, and export performance.
---

# Performance Optimization Skill

## Purpose

Use this skill when improving, reviewing, refactoring, or debugging performance for the **Southern Border Tourism Data & Intelligence Platform**.

Performance matters because tourists may scan QR codes outdoors on mobile networks. If the QR landing page, photo upload, or certificate generation is slow, tourists will abandon the flow and the database will not collect enough useful data.

Performance is directly tied to:

```text
conversion rate
data quality
tourist satisfaction
admin usability
dashboard trust
production readiness
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
QR landing performance
public attraction page performance
photo upload speed
certificate rendering speed
mobile performance
frontend bundle size
image optimization
dashboard query performance
database indexing
CSV export performance
storage performance
PWA performance
loading states
slow network behavior
admin table performance
```

Use together with:

```text
frontend-nextjs-pwa
backend-api
database-design
supabase-postgresql
dashboard-analytics
testing-qa
```

when the task touches implementation or tests.

---

## Required Context

Before performance work, read:

```text
CODEX_MAIN_PROMPT.md
docs/testing/PERFORMANCE_TEST_PLAN.md
checklists/PERFORMANCE_CHECKLIST.md
docs/frontend/PWA_REQUIREMENTS.md
docs/frontend/RESPONSIVE_GUIDELINES.md
docs/backend/FILE_UPLOAD_FLOW.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/database/INDEXING_STRATEGY.md
docs/database/ANALYTICS_TABLES.md
docs/dashboard/DASHBOARD_REQUIREMENTS.md
checklists/FRONTEND_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## Performance Mission

The performance mission is:

```text
Make the tourist flow fast enough to complete on mobile, and make admin/dashboard workflows responsive enough to support real planning work.
```

Most important:

```text
QR landing must load quickly.
Photo upload must feel reliable.
Certificate generation must show immediate feedback.
Dashboard must not fetch raw personal rows.
Exports must be bounded.
```

---

# Performance Priorities

---

## Priority 1: QR-to-Certificate Flow

Optimize first:

```text
QR landing page
minimal profile form
photo upload
certificate preview/generation
certificate download
stamp success state
```

This is the main data collection loop.

---

## Priority 2: Admin and Dashboard

Optimize:

```text
admin attraction lists
check-in code lists
dashboard KPIs
dashboard filters
dashboard charts
exports
```

Admins must trust the system and not wait unnecessarily.

---

## Priority 3: Optional Features

Optimize later:

```text
LINE LIFF
advanced PWA offline behavior
official data import
advanced PDF reports
AI insights
large-scale dashboard caching
```

Do not delay core flow for optional performance enhancements.

---

# Target Performance Guidance

---

## MVP Targets

Recommended targets:

```text
QR landing meaningful content within 2 seconds on normal mobile network
QR landing usable within 3 seconds
minimal profile submit within 1-2 seconds
survey submit within 1-2 seconds
photo upload shows feedback immediately
certificate generation shows feedback immediately
dashboard KPI cards visible within 2-3 seconds
dashboard sections load within 5 seconds
small CSV export completes within 5 seconds
```

If targets cannot be met, document:

```text
reason
risk
temporary mitigation
future optimization
```

---

# Frontend Performance

---

## Bundle Rules

Do not load:

```text
dashboard chart libraries on QR landing
admin table code on tourist pages
certificate rendering library on public attraction list unless needed
LINE LIFF library globally unless needed
heavy 360 media before user sees CTA
```

Use:

```text
route-level code splitting
dynamic imports for heavy components
lazy loading
server components where practical
```

---

## QR Landing Page Performance

QR landing must:

```text
show attraction/reward context quickly
show CTA quickly
lazy-load 360 media
use optimized hero image
avoid unnecessary API calls
avoid admin/dashboard bundle
record funnel events asynchronously or non-blocking where possible
```

Do not block first render on:

```text
large 360 embed
chart library
LINE LIFF initialization
admin permission logic
heavy analytics calls
```

---

## Public Attraction Page Performance

Optimize:

```text
hero image
attraction card images
lazy loaded gallery
lazy loaded 360 media
bounded list size
server-side data fetch
safe caching where appropriate
```

---

## Photo Upload Performance

Photo upload should:

```text
validate type/size before upload for UX
still validate server-side
show loading/progress immediately
prevent duplicate upload
allow retry
avoid base64 persistence
avoid freezing UI
handle slow mobile network
```

Test with:

```text
500 KB image
2 MB image
5 MB image
oversized image
invalid file
```

---

## Certificate Rendering Performance

Certificate generation should:

```text
show loading immediately
prevent double click
wait for images/fonts safely
use reasonable canvas/output size
avoid huge base64 memory use
upload file efficiently
reuse existing certificate if already generated
```

Avoid:

```text
huge canvas dimensions
multiple repeated renders
large uncompressed template images
many font weights
rendering before assets load
```

---

## Image Optimization

Optimize:

```text
attraction cover images
gallery images
stamp assets
certificate backgrounds
certificate logos
uploaded photo previews
```

Rules:

```text
use appropriate dimensions
compress images
lazy-load below fold
include width/height to reduce layout shift
avoid very large hero images
```

---

## Font Optimization

Use:

```text
limited font families
limited font weights
font-display swap or framework equivalent
Thai-readable font
preload only critical fonts if needed
```

Avoid loading many fonts/weights globally.

---

# Backend/API Performance

---

## API Payload Rules

APIs should return only needed data.

Avoid:

```text
returning all visits to frontend
returning all tourists to dashboard
returning raw personal rows for charts
returning private paths unnecessarily
large nested responses
```

Use:

```text
pagination
field selection
aggregated responses
bounded ranked lists
safe summaries
```

---

## API Response Rules

Important APIs:

```text
QR resolve
profile submit
photo upload metadata
certificate generate
survey submit
dashboard metrics
export
```

Must have:

```text
safe validation
bounded work
loading UX
safe timeouts
clear errors
```

---

## Duplicate Submit Prevention

Prevent duplicates for:

```text
profile submit
photo upload
certificate generation
survey submit
export request
admin create/update
```

Use:

```text
disabled button
idempotency
unique constraints
service-level duplicate handling
```

---

# Database Performance

---

## Required Indexes

Verify indexes for:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
visits(completion_status)
attractions(slug)
attractions(province_id)
checkin_codes(code)
certificates(visit_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys(visit_id)
visit_expenses(visit_id)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
audit_logs(created_at)
export_jobs(requested_by, created_at)
```

---

## Query Performance Rules

Use server-side aggregation for:

```text
visit counts
profile distributions
travel behavior distributions
expense summaries
satisfaction averages
funnel counts
top attractions
planning quadrants
```

Do not fetch raw rows into frontend for dashboard.

---

## N+1 Query Prevention

Watch for N+1 in:

```text
attraction list with images
admin attraction list
passport stamps with attractions
certificate preview data
dashboard top attractions
export generation
```

Fix with:

```text
joins
batched queries
views
summary tables
server-side aggregation
```

---

## Summary Tables Future

For larger data, plan:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
materialized views
scheduled refresh
dashboard cache
```

Summary tables must not contain personal identifiers.

---

# Dashboard Performance

---

## Dashboard Load Strategy

Recommended:

```text
load KPI summary first
load heavier charts after
show skeletons
cache stable reference data
apply filters server-side
limit ranked tables
avoid huge payloads
```

---

## Dashboard Payload Rules

Dashboard response should be:

```text
aggregated
bounded
privacy-safe
typed
filter-aware
```

Do not include:

```text
raw tourist rows
raw comments
email
LINE ID
provider_user_id
guest token
private storage paths
```

---

## Filter Performance

Filters must:

```text
validate server-side
apply in SQL/service
show loading state
handle empty result quickly
avoid stale old data after filter change
```

---

# Export Performance

---

## Export Rules

Exports must:

```text
have row limits
validate filters
use indexes
stream or bound memory where possible
return too-large error safely
audit export
store private files if stored
expire stored files
```

Recommended MVP:

```text
small/medium CSV export works
large unfiltered export returns EXPORT_TOO_LARGE
```

---

## CSV Performance

CSV generation should:

```text
escape safely
preserve Thai text
avoid loading excessive rows
avoid exporting unnecessary columns
avoid raw personal identifiers by default
```

---

# Storage Performance

---

## Storage Operations

Optimize:

```text
photo upload
certificate upload
signed URL generation
attraction media delivery
stamp asset delivery
export file delivery
```

Rules:

```text
private files use short-lived signed URLs
public media optimized
large temporary files cleaned up
orphan file cleanup planned
```

---

# Admin Performance

---

## Admin Lists

Admin lists should:

```text
paginate
filter/search server-side for large data
avoid rendering thousands of rows
show loading states
use bounded queries
```

Applies to:

```text
attractions
photo spots
check-in codes
visits
surveys
exports
audit logs
```

---

# PWA and Poor Network

---

## PWA Performance

MVP can be simple:

```text
manifest
icons
mobile-friendly layout
offline fallback planned
```

Do not delay core flow for complex offline sync.

---

## Poor Network Behavior

Tourist flow must handle:

```text
slow QR landing
slow photo upload
failed upload
certificate retry
form not losing data unnecessarily
friendly error messages
no blank page
```

---

# Performance Testing

---

## Manual Tests

Run or document:

```text
QR landing on real mobile
QR landing on slow network throttle
photo upload 2 MB
photo upload 5 MB
oversized photo rejection
certificate generation on mobile
dashboard with seed data
export with test data
```

---

## Automated/Programmatic Checks

Where practical, test:

```text
dashboard response is aggregated
dashboard response excludes raw rows
ranked list size is bounded
export row limit enforced
file size validation enforced
duplicate submit prevented
API payload does not include private large fields
```

---

## Lighthouse / DevTools

Recommended:

```text
Lighthouse QR landing
Lighthouse public attraction page
DevTools network asset review
bundle analyzer if bundle large
performance profiling for certificate render
```

---

# Monitoring Future

Production should monitor:

```text
QR landing response time
QR-to-certificate conversion
photo upload failure rate
certificate generation failure rate
dashboard query duration
export failure/too-large rate
API error rate
storage errors
database query performance
```

Performance and funnel analytics should be compared.

---

# Performance Review Checklist

Before accepting performance-sensitive work:

```text
[ ] Tourist pages do not load admin/dashboard bundles.
[ ] QR landing shows content quickly.
[ ] 360 media lazy-loaded.
[ ] Images optimized.
[ ] Photo upload shows feedback.
[ ] Certificate generation prevents duplicate submit.
[ ] Dashboard aggregates server-side.
[ ] Dashboard does not fetch raw rows.
[ ] Admin lists are paginated/bounded.
[ ] Exports have row limits.
[ ] Required indexes exist.
[ ] Slow network behavior considered.
```

---

## Critical Performance Blockers

Block if:

```text
QR landing unusably slow
photo upload appears frozen
certificate generation has no loading and duplicates records
dashboard fetches all raw visits into frontend
dashboard query times out with normal test data
unbounded export can hang server
large unoptimized images make public pages unusable
duplicate submits create duplicate records
```

---

# Task Prompt Template

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Optimize/review/debug performance for area.]

Context:
Performance affects tourist completion and database quality. Focus on practical, measurable improvements.

Read first:
- .codex/skills/performance-optimization/SKILL.md
- docs/testing/PERFORMANCE_TEST_PLAN.md
- checklists/PERFORMANCE_CHECKLIST.md
- [feature-specific docs]

Requirements:
- Identify performance risk.
- Optimize without weakening security/privacy.
- Keep dashboard/export responses aggregated and bounded.
- Keep loading states clear.
- Add tests/checks where practical.
- Document remaining risks.

Do not:
- Do not remove validation for speed.
- Do not bypass permission/ownership checks.
- Do not make private files public.
- Do not fetch raw dashboard rows to frontend.
- Do not allow unbounded exports.

Completion response:
Summary
Files changed
Validation
Performance notes
Security/privacy notes
Risks / Notes
Next suggested task
```

---

# Output Format

When completing performance work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- command results

Performance notes
- bottleneck
- optimization
- expected impact
- remaining risk

Security/privacy notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

Performance improvements must not weaken security, privacy, validation, ownership, or dashboard correctness.

A fast but unsafe system is not production-ready.
