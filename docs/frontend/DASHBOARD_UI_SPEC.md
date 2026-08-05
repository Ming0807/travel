# DASHBOARD_UI_SPEC.md

## 1. Document Purpose

This document defines the UI specification for the Dashboard Analytics feature of the **Southern Border Tourism Data & Intelligence Platform**.

The dashboard must support real planning, academic evaluation, and administrative monitoring for tourism in Yala, Pattani, and Narathiwat.

This document should guide frontend developers, backend developers, data designers, and AI coding agents when implementing dashboard pages, filters, KPI cards, charts, and reports.

---

## 2. Dashboard UI Mission

The dashboard mission is:

```text
Turn collected tourism data into clear planning insights.
```

The dashboard should help users understand:

- tourist volume
- tourist origin
- travel behavior
- attraction performance
- spending patterns
- satisfaction
- QR/certificate/survey funnel performance
- sustainable tourism opportunities

The dashboard must be useful, not just beautiful.

## 2.1 Product Boundary

This specification owns `/admin/dashboard`, the analytical center. The operational command center at `/admin` owns work queues, drafts, moderation, content health, and shortcuts.

The visual reference for the P2 redesign contributes compact density, a quiet sidebar, clear KPI hierarchy, and visible next actions. It does not change the dashboard into a project-management tool.

Approved P2 design:

- `docs/superpowers/specs/2026-07-16-story-cms-recommendation-dashboard-design.md`
- `docs/superpowers/plans/2026-07-16-story-cms-recommendation-dashboard.md`
- `docs/superpowers/specs/2026-08-05-admin-analytics-visual-system-design.md`
- `docs/superpowers/plans/2026-08-05-admin-analytics-visual-redesign.md`

---

## 3. Dashboard Users

## 3.1 Admin

Needs:

- system activity overview
- attraction performance
- recent visits
- operational issues

## 3.2 Tourism Staff

Needs:

- assigned attraction data
- QR performance
- visitor feedback
- photo spot performance

## 3.3 Researcher

Needs:

- structured metrics
- filters
- export
- data definitions
- careful interpretation

## 3.4 Planner

Needs:

- province comparison
- sustainable tourism insights
- attractions needing improvement
- spending and satisfaction trends

---

## 4. Dashboard Design Principles

## 4.1 Decision-Oriented

Each chart must answer a planning question.

Good:

```text
Which attractions have high visits but low satisfaction?
```

Bad:

```text
Add a chart because the page looks empty.
```

## 4.2 Definitions First

Every metric must have a clear definition.

KPI cards and charts should include tooltip or help text for important metrics.

## 4.3 Avoid Misleading Numbers

Rules:

- do not count QR scans as completed visits
- do not count visits as unique tourists
- do not count missing satisfaction as zero
- do not call spending estimates revenue
- do not treat local platform data as official total tourism arrivals

## 4.4 Use Filters Clearly

Dashboard filters must be visible and understandable.

Core filters:

```text
date range
province
attraction
```

## 4.5 First-Viewport Hierarchy

The executive dashboard first viewport must present, in order:

1. data freshness, export, and active filter context
2. four decision-oriented KPIs as distinct surfaces
3. the primary visit trend with comparison
4. the participation funnel beside the trend on desktop
5. ranked attractions and experience quality immediately below

The desktop viewport must show the complete KPI row and the beginning of the primary chart without scrolling. A large introductory context card, an expanded multi-row filter form, or duplicate desktop navigation is not allowed above the KPIs.

Secondary topics remain available as drill-down pages. Do not give every chart equal visual weight.

## 4.5 Show Data Freshness

Every dashboard should show:

```text
Last updated
Data source
Filter range
```

## 4.6 Current Production Visual System

The analytics workspace uses a restrained editorial operations style aligned with the public product:

```text
base: white and near-black
brand accent: warm orange
supporting data colors: teal, gold, blue, and semantic status colors
corner radius: 4-6px
border: 1px neutral gray
shadow: none or subtle, maximum 8px blur on primary surfaces
```

Do not use gradients, glass effects, floating decorative sections, nested cards, oversized headings, or a different color theme per route.

Every detailed analytics route follows this hierarchy:

```text
desktop analytics navigation in the sidebar
compact route title and action row
single-row global filter command bar
one-line data source and freshness context
compact KPI card grid
primary evidence (8 columns)
interpretation or planning context (4 columns)
supporting distributions
auditable detail tables
limitations and sample-size guidance
```

Desktop filters are visible in one compact command row. Secondary filters open progressively without expanding the initial viewport. Mobile filters are collapsed into one summary control by default. Wide tables scroll only inside their own bounded container and must never create page-level horizontal overflow.

Desktop uses the analytics routes in the main sidebar and must not repeat the same eight destinations in a second horizontal tab bar. Mobile and tablet use the horizontally scrollable analytics route switcher because the sidebar is unavailable.

---

## 5. Dashboard Route Structure

Implemented protected routes:

```text
/admin/dashboard
/admin/dashboard/tourists
/admin/dashboard/visits
/admin/dashboard/attractions
/admin/dashboard/expenses
/admin/dashboard/satisfaction
/admin/dashboard/funnel
/admin/dashboard/sustainability
```

Future routes:

```text
/admin/dashboard/official-comparison
```

MVP can implement one page with sections.

---

## 6. Dashboard Layout

Production layout:

```text
Admin layout shell
    |
Analytics route navigation
    |
Compact global filter command bar
    |
One-line data freshness and interpretation note
    |
Executive KPI grid
    |
Main charts grid
    |
Insight tables
    |
Export/report actions
```

---

## 7. Page Header

Header should include:

```text
page title
short description
date range summary
export button
refresh button optional
```

Example title:

```text
Tourism Intelligence Dashboard
```

Thai:

```text
แดชบอร์ดวิเคราะห์การท่องเที่ยว
```

Description:

```text
Analyze tourist visits, behavior, expenses, satisfaction, and QR flow performance.
```

---

## 8. Global Filter Bar

## 8.1 Required Filters

```text
date range
province
attraction
```

## 8.2 Optional Filters

```text
origin country
origin province
age group
transport mode
travel purpose
identity provider
completion status
```

## 8.3 Filter Behavior

Rules:

- filters should update URL query parameters
- dashboard should reload affected metrics
- show active filter summary
- allow clear filters
- default date range should be current month or last 30 days

Example URL:

```text
/admin/dashboard?start=2026-05-01&end=2026-05-31&province=yala
```

---

## 9. KPI Card Design

## 9.1 Required KPI Card Elements

Each KPI card should include:

```text
metric label
metric value
short description or tooltip
trend/change optional
icon
loading state
empty state
```

## 9.2 Recommended KPI Cards

```text
Tourist Profiles
Total Visits
Certificates Generated
Stamps Earned
Survey Completion Rate
Average Satisfaction
Estimated Spending Range
Top Attraction
```

## 9.3 KPI Visual Style

Use:

- clean card
- large value
- small label
- subtle icon
- neutral background
- semantic color only when meaningful

Avoid:

- too many colors
- huge icons
- unclear abbreviations

---

## 10. KPI Metric Definitions

## 10.1 Tourist Profiles

Label:

```text
Tourist Profiles
```

Definition:

```text
Number of tourist profiles created in the system.
```

Calculation:

```text
count(distinct tourists.tourist_id)
```

Limitation:

Guest profiles may not equal unique real people.

## 10.2 Total Visits

Definition:

```text
Number of recorded visit records.
```

Calculation:

```text
count(visits.visit_id)
```

Do not use QR scans.

## 10.3 Certificates Generated

Definition:

```text
Number of generated certificate records.
```

Calculation:

```text
count(certificates.certificate_id)
```

## 10.4 Stamps Earned

Definition:

```text
Number of digital stamps earned.
```

Calculation:

```text
count(tourist_stamps.stamp_id)
```

## 10.5 Survey Completion Rate

Definition:

```text
Completed surveys divided by generated certificates.
```

Calculation:

```text
survey_completed_count / certificate_generated_count
```

If denominator is zero:

```text
No data
```

## 10.6 Average Satisfaction

Definition:

```text
Average overall satisfaction from submitted surveys.
```

Calculation:

```text
avg(satisfaction_surveys.overall_score)
```

Ignore null.

## 10.7 Estimated Spending Range

Definition:

```text
Estimated spending based on tourist-selected spending ranges.
```

Label must include:

```text
Estimated
```

Do not call it revenue.

---

## 11. Executive Overview Section

## 11.1 Purpose

Give quick status of the tourism data platform.

## 11.2 Components

```text
KPI grid
visit trend chart
province comparison chart
top attractions table
```

## 11.3 Required Charts

```text
Visits over time
Visits by province
Top attractions by visits
```

---

## 12. Tourist Profile Section

## 12.1 Purpose

Understand who the tourists are.

## 12.2 Charts

```text
Origin country distribution
Origin province distribution
Age group distribution
Preferred language distribution
Identity provider distribution
```

## 12.3 Important UI Notes

Use labels like:

```text
Not answered
Unknown
Guest
LINE-linked
Email-linked
```

Do not expose LINE user IDs or emails.

---

## 13. Visit and Attraction Performance Section

## 13.1 Purpose

Understand which attractions receive participation.

## 13.2 Charts and Tables

```text
Visits by attraction
Visits by province
Visits by date
Photo spot performance
Certificate count by attraction
Stamp count by attraction
```

## 13.3 Insight Tables

Recommended:

```text
Top 10 attractions by visits
Low-visit attractions
High visit but low satisfaction
Low visit but high satisfaction
```

These tables are more useful than many decorative charts.

---

## 14. Travel Behavior Section

## 14.1 Purpose

Understand how tourists travel.

## 14.2 Metrics

```text
travel companion distribution
average group size
transport mode distribution
travel purpose distribution
same-day vs overnight ratio
average nights
```

## 14.3 Planning Interpretation

Dashboard may show small insight notes:

```text
High private car usage may indicate parking demand.
High overnight ratio may indicate local economic opportunity.
Low overnight ratio may suggest need for multi-day route planning.
```

Keep notes short.

---

## 15. Expense Section

## 15.1 Purpose

Understand spending patterns.

## 15.2 Charts

```text
Spending range distribution
Expense category distribution
Estimated spending by province
Estimated spending by attraction
```

## 15.3 UI Labels

Use:

```text
Estimated Spending
Estimated Spending Range
Tourist-Reported Spending Range
```

Do not use:

```text
Revenue
Actual Income
```

unless actual transaction data exists.

## 15.4 Missing Data

If no expense data:

```text
No expense responses yet.
```

Do not show 0 as spending.

---

## 16. Satisfaction Section

## 16.1 Purpose

Identify tourism quality and improvement priorities.

## 16.2 Metrics

```text
average overall satisfaction
satisfaction by attraction
satisfaction by province
low-score attractions
revisit intention rate
recommendation intention rate
```

Optional category scores:

```text
safety
cleanliness
transport/access
information/signage
service
value for money
```

## 16.3 Recommended Visuals

```text
Average satisfaction KPI
Bar chart by attraction
Low satisfaction table
Revisit/recommendation rates
```

## 16.4 Missing Data

If no satisfaction responses:

```text
No satisfaction responses yet.
```

Do not use score 0.

---

## 17. Funnel Analytics Section

## 17.1 Purpose

Find where tourists drop out.

This addresses the main UX challenge:

```text
tourists may not want to fill forms
```

## 17.2 Funnel Stages

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
survey_started
survey_completed
passport_saved
```

## 17.3 Required Visuals

```text
funnel step chart
conversion rate table
drop-off table
funnel by attraction
funnel by photo spot
```

## 17.4 Insight Examples

Low certificate start:

```text
Landing page CTA may not be clear enough.
```

Low photo upload:

```text
Photo upload step may be difficult or slow.
```

Low survey completion:

```text
Survey may be too long or shown too early.
```

---

## 18. Sustainable Tourism Section

## 18.1 MVP Status

Optional for MVP, important for final project quality.

## 18.2 Suggested Indicators

```text
Attraction concentration
High-visit low-satisfaction attractions
Low-visit high-satisfaction attractions
Overnight stay ratio
Estimated spending distribution
Recommendation intention
Revisit intention
Transport accessibility issues
```

## 18.3 Recommended UI

Use insight cards and ranked tables.

Examples:

```text
Promotion Opportunity
Improvement Priority
Overcrowding Risk
Overnight Stay Opportunity
```

---

## 19. Official Data Comparison Section

## 19.1 MVP Status

Future / Phase 2.

## 19.2 Purpose

Compare local platform participation data with official tourism data.

## 19.3 Required Warning

Show clear note:

```text
Local platform visits are participation records from QR/certificate users and may not represent total official tourist arrivals.
```

## 19.4 Possible Metrics

```text
official visitor count
local platform visits
platform coverage estimate
official revenue vs estimated local spending
```

---

## 20. Chart Specifications

## 20.1 Bar Charts

Use for:

```text
visits by attraction
visits by province
transport mode
expense category
satisfaction by attraction
```

Requirements:

- readable labels
- sorted where useful
- tooltip
- empty state
- no tiny unreadable text

## 20.2 Line Charts

Use for:

```text
visit trend over time
certificate trend
satisfaction trend
```

Requirements:

- clear x-axis date
- clear y-axis value
- handle missing dates
- avoid too many series

## 20.3 Donut Charts

Use sparingly for:

```text
age group
origin type
spending range
```

Do not overuse.

## 20.4 Tables

Use for ranked insights.

Tables should include:

- rank
- attraction/province
- metric value
- related context
- action/interpretation if useful

---

## 21. Dashboard Empty States

Examples:

## 21.1 No Visits

```text
No visits in the selected date range.
Try changing the filters.
```

## 21.2 No Satisfaction

```text
No satisfaction responses yet.
Average satisfaction will appear after tourists answer the optional survey.
```

## 21.3 No Expense Data

```text
No expense data yet.
Spending analysis will appear after tourists submit expense information.
```

## 21.4 No Funnel Data

```text
No funnel events recorded yet.
Funnel analytics will appear after QR activity starts.
```

---

## 22. Dashboard Loading States

Use skeletons:

```text
KPI card skeleton
chart skeleton
table row skeleton
filter loading state
```

Do not show one full-page spinner if only one chart is loading.

---

## 23. Dashboard Error States

If one dashboard section fails, show section-level error.

Example:

```text
Could not load satisfaction data.
```

Other sections should still render when possible.

Page-level error only if entire dashboard cannot load.

---

## 24. Dashboard Accessibility

Requirements:

- KPI cards have readable labels
- charts have titles and summaries
- data tables for important chart data where possible
- colors not the only meaning
- keyboard accessible filters
- readable contrast
- tooltip content accessible where feasible

---

## 25. Dashboard Performance Requirements

## 25.1 MVP

Use raw queries with indexes.

Rules:

- use date filters
- limit large tables
- paginate detail tables
- do not load all raw records into browser

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

## 26. Dashboard Data Fetching

Recommended service functions:

```text
getExecutiveMetrics(filters)
getVisitsByProvince(filters)
getVisitsByAttraction(filters)
getTouristOriginDistribution(filters)
getTravelBehaviorMetrics(filters)
getExpenseMetrics(filters)
getSatisfactionMetrics(filters)
getFunnelMetrics(filters)
getSustainableIndicators(filters)
```

UI components should receive prepared data.

Do not place complex SQL in chart components.

---

## 27. Dashboard Export UI

Export button should allow:

```text
Export summary CSV
Export visit records CSV
Export satisfaction CSV
Export expense CSV
```

MVP may provide one export menu.

Export must respect permissions.

Export action must be logged.

---

## 28. Dashboard Refresh UI

Optional refresh button:

```text
Refresh Data
```

Show:

```text
Last updated: [timestamp]
```

If using raw live queries:

```text
Data source: live database
```

If using summary tables:

```text
Data source: summary table
```

---

## 29. Dashboard Permission Rules

Dashboard routes require authentication.

Permissions:

```text
dashboard.read
export.create
dashboard.sensitive_view optional
```

Dashboard must not show:

```text
email
LINE user ID
device token
raw uploaded photo
private certificate URL
```

---

## 30. Dashboard UI Components

Recommended components:

```text
DashboardPageHeader
DashboardFilterBar
KpiCard
KpiGrid
ChartCard
MetricTooltip
DataFreshnessNote
InsightTable
FunnelChart
VisitsTrendChart
ProvinceComparisonChart
SatisfactionTable
ExportMenu
```

---

## 31. Dashboard Mobile/Responsive Behavior

Dashboard is mostly admin/desktop, but should still be responsive.

Rules:

- KPI cards stack on mobile
- charts scroll or resize
- tables allow horizontal scroll
- filter bar becomes collapsible on small screens
- avoid unreadable charts on mobile

---

## 32. Dashboard Testing Checklist

Test:

```text
no data
some data
large data
date filter
province filter
attraction filter
missing satisfaction
missing expense
unknown origin
guest users
export action
permission denied
chart load failure
mobile layout
```

---

## 33. MVP Acceptance Checklist

```text
[ ] Dashboard route is protected.
[ ] Page header exists.
[ ] Global filter bar exists.
[ ] Date range filter works.
[ ] Province/attraction filter works or is planned.
[ ] KPI cards display real data.
[ ] Visits by province chart exists.
[ ] Visits by attraction chart/table exists.
[ ] Tourist origin distribution exists.
[ ] Age group distribution exists.
[ ] Travel behavior summary exists.
[ ] Spending range distribution exists.
[ ] Satisfaction summary exists.
[ ] Funnel counts exist.
[ ] Empty states are correct.
[ ] Loading states exist.
[ ] Private identity data is not shown.
[ ] Export action exists or is clearly planned.
[ ] Metric definitions are documented.
```

---

## 34. Do Not Do

Do not:

```text
Count QR scans as visits.
Count visits as unique tourists.
Show missing satisfaction as 0.
Call estimated spending revenue.
Build charts without metric definitions.
Expose email or LINE ID.
Load all raw records into frontend for aggregation.
Ignore filters.
Use decorative charts with no planning value.
Hide data limitations.
```

---

## 35. Future Enhancements

Possible future improvements:

```text
official data comparison dashboard
sustainable tourism insight cards
map-based analytics
campaign analytics
passport progress analytics
forecasting after enough data
PDF dashboard report
scheduled report export
materialized view refresh status
advanced researcher filters
```

---

## 36. Final Dashboard Rule

A professional dashboard does not only show numbers.

It explains what the numbers mean, where they come from, and how they can support tourism planning decisions.
