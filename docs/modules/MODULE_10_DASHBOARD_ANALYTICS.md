# MODULE_10_DASHBOARD_ANALYTICS.md

## 1. Module Name

**Dashboard Analytics Module**

---

## 2. Module Purpose

The Dashboard Analytics Module converts collected tourism data into useful planning insights.

This module is central to the project because the original goal is not only to collect tourist data, but to use that data for sustainable tourism planning in Yala, Pattani, and Narathiwat.

The dashboard must be decision-oriented, not decorative.

---

## 3. Business Purpose

The dashboard helps administrators, researchers, and planners answer questions such as:

- How many tourists visited each province?
- Which attractions are most visited?
- Where do tourists come from?
- How do tourists travel?
- How much do tourists spend?
- How satisfied are tourists?
- Which attractions need improvement?
- Which attractions are under-promoted?
- Where do users drop out of the QR/certificate/survey flow?
- How can tourism development be made more sustainable?

---

## 4. Core Design Decision

Every dashboard metric must have a clear definition.

Do not create charts only because they look good.

Each metric must define:

```text
metric name
business meaning
source tables
calculation
filters
interpretation
limitations
```

---

## 5. Primary Users

## 5.1 Admin

Uses dashboard to monitor system activity and attraction performance.

## 5.2 Tourism Staff

Uses dashboard to understand visitor patterns at managed attractions.

## 5.3 Researcher

Uses dashboard and exports for academic analysis.

## 5.4 Planner or Policy User

Uses dashboard to support tourism development decisions.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Executive overview
- Visits by province
- Visits by attraction
- Tourist origin distribution
- Age group distribution
- Travel behavior summary
- Spending range distribution
- Satisfaction summary
- Certificate count
- Stamp count
- Funnel counts
- Date filter
- Province filter if feasible
- Attraction filter if feasible
- Empty states
- Basic export link or export integration

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Sustainable tourism dashboard
- Funnel conversion rates
- Returning tourist analysis
- Digital passport progress analytics
- Satisfaction category breakdown
- Expense category analysis
- Official data comparison
- Trend analysis
- Advanced filters
- Dashboard cache
- Materialized views
- PDF report export

## 6.3 Out of Scope

This module does not directly handle:

- tourist form submission
- QR code management
- certificate rendering
- raw data editing
- LINE messaging

It reads data from other modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_01_PUBLIC_ATTRACTIONS.md
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_09_ADMIN_ATTRACTION_CMS.md
MODULE_11_REPORT_EXPORT.md
MODULE_13_OFFICIAL_DATA_IMPORT.md
```

---

## 8. Required Data Tables

This module reads from:

```text
tourists
tourist_identities
visits
attractions
photo_spots
checkin_codes
provinces
districts
certificates
tourist_stamps
visit_expenses
expense_categories
satisfaction_surveys
funnel_events
travel_companions
transport_modes
travel_purposes
```

Future analytics may read from:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
official_tourism_stats
official_attraction_refs
```

---

## 9. Dashboard Categories

MVP dashboard categories:

```text
Executive Overview
Tourist Profile
Travel Behavior
Attraction Performance
Expense Analysis
Satisfaction Analysis
Funnel Analytics
```

Phase 2:

```text
Sustainable Tourism Indicators
Official Data Comparison
Digital Passport Analytics
Campaign Analytics
```

---

## 10. Global Dashboard Filters

## 10.1 Date Range

Default:

```text
current month
```

or:

```text
last 30 days
```

Filter source:

```text
visits.visit_date
certificates.generated_at
satisfaction_surveys.completed_at
funnel_events.event_time
```

Use the date field appropriate to each metric.

## 10.2 Province

Source:

```text
attractions.province_id
```

## 10.3 Attraction

Source:

```text
attractions.attraction_id
```

## 10.4 Tourist Origin

Source:

```text
tourists.origin_country_id
tourists.origin_province_id
```

## 10.5 Identity Provider

Source:

```text
tourist_identities.provider
```

Optional for MVP.

---

## 11. Executive Overview Dashboard

## 11.1 Purpose

Provide a quick high-level summary.

## 11.2 Required KPI Cards

```text
Total tourist profiles
Total visits
Certificates generated
Stamps earned
Survey completion rate
Average satisfaction
Estimated spending range
Top attraction
```

## 11.3 Metric Definitions

### Total Tourist Profiles

Source:

```text
tourists
```

Calculation:

```text
count(distinct tourist_id)
```

Limitation:

Guest users may be duplicated across devices.

Label if needed:

```text
Tourist profiles
```

not guaranteed unique real humans.

### Total Visits

Source:

```text
visits
```

Calculation:

```text
count(visit_id)
```

Definition:

Number of recorded visit events.

### Certificates Generated

Source:

```text
certificates
```

Calculation:

```text
count(certificate_id)
```

### Stamps Earned

Source:

```text
tourist_stamps
```

Calculation:

```text
count(stamp_id)
```

### Survey Completion Rate

Source:

```text
certificates
satisfaction_surveys
```

Calculation:

```text
survey_completed_count / certificate_generated_count
```

If denominator is zero, show no data.

### Average Satisfaction

Source:

```text
satisfaction_surveys.overall_score
```

Calculation:

```text
average of non-null overall_score
```

Do not count missing scores as zero.

### Estimated Spending Range

Source:

```text
visit_expenses
```

Calculation:

```text
sum(amount_min) to sum(amount_max)
```

Use label:

```text
Estimated
```

not exact revenue.

---

## 12. Tourist Profile Dashboard

## 12.1 Purpose

Understand who visits the region.

## 12.2 Charts

```text
Origin country distribution
Origin province distribution
Age group distribution
Preferred language distribution
Identity provider distribution
New vs returning tourist profiles
```

## 12.3 Source Tables

```text
tourists
tourist_identities
countries
provinces
visits
```

## 12.4 Important Rule

For visitors within a date range, count tourists who have visits in that date range.

Do not simply count all tourist profiles if the dashboard filter is visit-based.

---

## 13. Travel Behavior Dashboard

## 13.1 Purpose

Understand how tourists travel.

## 13.2 Metrics

```text
travel companion distribution
average group size
transport mode distribution
travel purpose distribution
same-day vs overnight ratio
average nights
```

## 13.3 Source Tables

```text
visits
travel_companions
transport_modes
travel_purposes
```

## 13.4 Interpretation Examples

High private car usage may indicate:

```text
need for parking planning
self-drive tourism opportunity
```

High overnight ratio may indicate:

```text
local accommodation benefit
potential for multi-day tourism routes
```

Low overnight ratio may indicate:

```text
need for stronger overnight packages
```

---

## 14. Attraction Performance Dashboard

## 14.1 Purpose

Compare attractions by participation and engagement.

## 14.2 Metrics

```text
visits by attraction
unique tourists by attraction
certificates by attraction
stamps by attraction
survey completion by attraction
average satisfaction by attraction
estimated spending by attraction
photo spot performance
```

## 14.3 Source Tables

```text
visits
attractions
photo_spots
certificates
tourist_stamps
satisfaction_surveys
visit_expenses
```

## 14.4 Useful Views

```text
Top attractions by visit count
Low-visit attractions
High-satisfaction low-visit attractions
High-visit low-satisfaction attractions
Photo spot performance
```

---

## 15. Expense Dashboard

## 15.1 Purpose

Understand tourist spending patterns.

## 15.2 Metrics

```text
spending range distribution
expense category distribution
estimated spending range by province
estimated spending range by attraction
estimated average spending range per visit
```

## 15.3 Source Tables

```text
visit_expenses
expense_categories
visits
attractions
provinces
```

## 15.4 Important Rule

Expense range is approximate.

Dashboard must say:

```text
Estimated spending
```

Do not say:

```text
Revenue
```

unless actual verified transaction data exists.

---

## 16. Satisfaction Dashboard

## 16.1 Purpose

Identify tourism quality and improvement priorities.

## 16.2 Metrics

```text
average overall satisfaction
satisfaction by attraction
satisfaction by province
safety score
cleanliness score
transport/access score
information/signage score
service score
value for money score
revisit intention rate
recommendation intention rate
low-score attraction list
```

## 16.3 Source Tables

```text
satisfaction_surveys
visits
attractions
provinces
```

## 16.4 Important Rule

Missing satisfaction is not zero.

Show:

```text
No satisfaction responses
```

when there is no data.

---

## 17. Funnel Analytics Dashboard

## 17.1 Purpose

Find where tourists drop out of the participation flow.

This directly addresses the teacher's concern:

> Tourists usually do not want to fill forms.

## 17.2 Funnel Stages

```text
qr_scanned
landing_viewed
certificate_started
photo_uploaded
minimal_form_completed
certificate_generated
survey_started
survey_completed
passport_saved
```

## 17.3 Metrics

```text
count by stage
conversion rate between stages
drop-off rate
funnel by attraction
funnel by photo spot
funnel by date
```

## 17.4 Source Table

```text
funnel_events
```

## 17.5 Interpretation Examples

Low `certificate_started` rate:

```text
landing page value proposition may be weak
```

Low `photo_uploaded` rate:

```text
upload UX may be difficult
```

Low `survey_completed` rate:

```text
survey may be too long or shown at wrong time
```

---

## 18. Sustainable Tourism Dashboard

## 18.1 MVP Status

Phase 2, but should be planned from MVP.

## 18.2 Purpose

Support sustainable tourism development.

## 18.3 Suggested Indicators

```text
attraction concentration
under-visited attractions
high-satisfaction low-visit attractions
low-satisfaction high-visit attractions
overnight stay ratio
estimated spending distribution
community-based attraction visits
revisit intention
recommendation intention
transport accessibility issues
problem categories from comments
```

## 18.4 Planning Questions

```text
Which attractions need improvement?
Which attractions should be promoted?
Which areas receive too little tourism benefit?
Which locations may be overcrowded?
Which routes could increase overnight stays?
Where should infrastructure be improved?
```

---

## 19. Dashboard Data Freshness

Every dashboard should indicate data freshness.

Examples:

```text
Last updated: 2026-05-18 21:30
Source: raw data
Source: daily summary
Source: cached
```

MVP can use real-time raw queries.

Production should show summary refresh time.

---

## 20. Empty State Handling

Dashboard must handle missing data.

Examples:

```text
No visits in selected date range.
No satisfaction responses yet.
No expense data submitted yet.
No funnel events recorded.
```

Do not show misleading zeros.

---

## 21. Dashboard UI Requirements

Dashboard should be:

- clean
- professional
- responsive
- filterable
- easy to read
- not overloaded
- useful for presentation
- useful for planning

Recommended layout:

```text
filter bar
KPI cards
main charts
tables for top/bottom insights
export button
data freshness note
```

---

## 22. Chart Recommendations

## 22.1 KPI Cards

Use for:

```text
total tourists
total visits
certificates
stamps
average satisfaction
survey completion rate
```

## 22.2 Bar Charts

Use for:

```text
visits by attraction
visits by province
transport mode distribution
expense category distribution
```

## 22.3 Line Charts

Use for:

```text
visit trend over time
certificate trend
satisfaction trend
```

## 22.4 Pie or Donut Charts

Use sparingly for:

```text
age group
origin type
spending range
```

Avoid too many pie charts.

## 22.5 Tables

Use for:

```text
top attractions
low satisfaction attractions
under-visited high satisfaction attractions
photo spot performance
```

---

## 23. Metric Dictionary Requirement

Every metric must be documented in:

```text
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

Before implementing a new chart, define:

```text
metric name
definition
source tables
calculation
filters
display format
interpretation
limitations
```

---

## 24. API or Service Responsibilities

Recommended functions:

```text
getExecutiveMetrics(filters)
getVisitsByProvince(filters)
getVisitsByAttraction(filters)
getTouristOriginDistribution(filters)
getTravelBehaviorMetrics(filters)
getExpenseMetrics(filters)
getSatisfactionMetrics(filters)
getFunnelMetrics(filters)
getSustainableTourismIndicators(filters)
```

Use a dashboard service layer.

Do not place complex SQL directly inside UI components.

---

## 25. Data Query Strategy

## 25.1 MVP

Use raw SQL queries with proper indexes.

## 25.2 Production

Use:

```text
summary tables
materialized views
dashboard cache
scheduled refresh
```

See:

```text
docs/database/ANALYTICS_TABLES.md
```

---

## 26. Performance Requirements

## 26.1 Query Performance

Dashboard should not run unbounded queries.

Always use:

```text
date range filter
pagination for detail tables
indexed joins
```

## 26.2 Heavy Aggregations

If slow, use summary tables.

## 26.3 Frontend Performance

- lazy load heavy charts
- avoid rendering too many points
- show loading states
- handle errors gracefully

---

## 27. Security and Permissions

Dashboard access must be protected.

Roles:

```text
super_admin
admin
staff
viewer
researcher
```

Possible permissions:

```text
dashboard.read
dashboard.export
dashboard.sensitive_view
```

Dashboard should not expose:

```text
email
LINE user ID
device token
raw photo path
private certificate URL
```

unless specifically authorized.

---

## 28. Privacy Rules

Analytics should be aggregated.

Rules:

- avoid showing individual tourist identity.
- hide or anonymize small groups if needed.
- do not expose contact data.
- do not export personal data by default.
- comments may need review before sharing.

---

## 29. Export Integration

Dashboard should connect to report/export module.

Exports may include:

```text
summary CSV
filtered visit data
survey summary
satisfaction summary
expense summary
dashboard image/PDF future
```

Export must respect permissions.

Export action should be logged.

---

## 30. Error Handling

## 30.1 Query Failed

Message:

```text
Could not load dashboard data. Please try again.
```

## 30.2 No Data

Message:

```text
No data available for the selected filters.
```

## 30.3 Unauthorized

Message:

```text
You do not have permission to view this dashboard.
```

## 30.4 Slow Query

Show loading state and consider optimization.

---

## 31. Example User Stories

## 31.1 Admin Views Executive Dashboard

As an admin, I want to see total visits and certificates.

Acceptance:

```text
Given visit and certificate records exist
When I open the dashboard
Then I see total visits and certificates generated
```

## 31.2 Planner Filters by Province

As a planner, I want to filter dashboard by province.

Acceptance:

```text
Given records exist in multiple provinces
When I select Yala
Then dashboard metrics show only Yala-related attraction visits
```

## 31.3 Researcher Reviews Satisfaction

As a researcher, I want to see low satisfaction attractions.

Acceptance:

```text
Given satisfaction responses exist
When I open satisfaction dashboard
Then attractions with lower average scores are visible
```

## 31.4 UX Team Reviews Funnel

As a UX analyst, I want to see where tourists drop out.

Acceptance:

```text
Given funnel events exist
When I view funnel dashboard
Then I see counts and conversion rates by stage
```

---

## 32. MVP Acceptance Checklist

```text
[ ] Dashboard route is protected.
[ ] Date filter exists.
[ ] Executive KPI cards exist.
[ ] Total tourist profile count displays.
[ ] Total visit count displays.
[ ] Certificate count displays.
[ ] Stamp count displays.
[ ] Visits by province chart exists.
[ ] Visits by attraction chart exists.
[ ] Tourist origin distribution exists.
[ ] Age group distribution exists.
[ ] Travel behavior summary exists.
[ ] Spending range distribution exists.
[ ] Average satisfaction displays.
[ ] Funnel counts display.
[ ] Missing data is handled correctly.
[ ] Dashboard does not expose private identity data.
[ ] Metrics have documented definitions.
```

---

## 33. Do Not Do

Do not:

```text
Count QR scans as completed visits.
Count visits as unique tourists.
Count missing satisfaction as zero.
Call spending estimate actual revenue.
Build charts without metric definitions.
Expose email or LINE ID in dashboard.
Query all raw records without filters forever.
Load huge tables into frontend for aggregation.
Ignore date/province filters.
Use decorative charts with no planning value.
```

---

## 34. Future Enhancements

Possible future features:

```text
sustainable tourism indicators
official data comparison
forecasting after enough data exists
map-based dashboard
route analysis
campaign dashboard
passport progress dashboard
PDF dashboard report
scheduled summary refresh
materialized views
dashboard cache
```

---

## 35. Definition of Done

This module is done when:

```text
[ ] Dashboard uses real database data.
[ ] Metrics are defined.
[ ] Filters work.
[ ] Charts answer planning questions.
[ ] Missing data is handled honestly.
[ ] Private data is not exposed.
[ ] Performance is acceptable for MVP.
[ ] Export path is available or planned.
[ ] Documentation and tests are updated.
```
