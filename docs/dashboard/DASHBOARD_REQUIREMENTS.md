# DASHBOARD_REQUIREMENTS.md

## 1. Document Purpose

This document defines the dashboard requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The dashboard is a core project deliverable because the system is not only a tourist-facing certificate application. It is a data platform for tourism planning in Yala, Pattani, and Narathiwat.

This document defines what the dashboard must show, why each dashboard section exists, how data should be filtered, and how the dashboard should avoid misleading interpretations.

---

## 2. Dashboard Mission

The dashboard mission is:

```text
Convert collected tourism participation data into reliable planning insight.
```

The dashboard must help stakeholders answer:

```text
How many tourists participated?
Which attractions are most visited?
Where do tourists come from?
How do tourists travel?
How much do tourists spend?
How satisfied are tourists?
Which attractions need improvement?
Which attractions should be promoted?
Where do tourists drop out of the QR-to-certificate flow?
How can tourism be developed more sustainably?
```

---

## 3. Dashboard Role in the Project

The original project goal is:

```text
Create a tourist database for southern border tourism planning and sustainable tourism development.
```

Therefore, the dashboard must support:

```text
1. Tourist data recording
2. Travel behavior analysis
3. Tourism promotion planning
4. Southern border tourism dashboard development
```

The dashboard is the evidence layer of the system.

---

## 4. Dashboard Users

## 4.1 Admin

Needs:

```text
system activity overview
attraction performance
QR/certificate usage
visit records
survey completion
export actions
```

## 4.2 Tourism Staff

Needs:

```text
assigned attraction performance
photo spot usage
visitor feedback
operational improvement data
```

## 4.3 Researcher

Needs:

```text
defined metrics
filtered datasets
exportable data
survey results
methodological limitations
```

## 4.4 Planner or Policy User

Needs:

```text
province-level trends
attraction prioritization
spending patterns
satisfaction patterns
sustainable tourism indicators
```

## 4.5 Instructor / Project Evaluator

Needs:

```text
evidence that the system collects structured data
evidence that database design supports analytics
evidence that dashboard metrics are meaningful
```

---

## 5. Dashboard Principles

## 5.1 Decision-Oriented

Every chart must support a planning question.

Good:

```text
Which high-visit attractions have low satisfaction?
```

Bad:

```text
Add a pie chart because it looks nice.
```

## 5.2 Definition-Driven

Every metric must be defined in:

```text
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

Do not implement metrics without definitions.

## 5.3 Privacy-Safe

Dashboard must show aggregated data by default.

Do not expose:

```text
email
Google subject
LINE user ID
provider_user_id
device token
guest token
uploaded photo path
private certificate URL
private certificate path
internal tourist ID
internal visit ID
```

## 5.4 Honest Interpretation

Dashboard must not overstate the data.

Examples:

```text
QR scans are not visits.
Tourist profiles are not guaranteed unique real humans.
Estimated spending is not verified revenue.
Local platform participation is not official tourist arrival count.
Missing satisfaction is not zero.
```

## 5.5 Metric Honesty Rules

Dashboard labels and calculations must follow these rules:

- QR Scans are not Visits.
- Tourist Profiles are not verified unique people.
- Estimated Spending is not Revenue.
- Missing Satisfaction is `No data`, not `0`.
- Zero denominator is `No data`.
- Dashboard views use aggregated data only by default.
- Dashboards must support planning questions for Yala, Pattani, and Narathiwat.

---

## 6. Dashboard Scope

## 6.1 MVP Dashboard Scope

MVP should include:

```text
Executive overview
Visits by province
Visits by attraction
Tourist origin distribution
Age group distribution
Travel behavior summary
Spending range distribution
Satisfaction summary
Funnel analytics
Basic export actions
```

## 6.2 Phase 2 Dashboard Scope

Phase 2 should include:

```text
Sustainable tourism indicators
Photo spot performance
Passport/stamp analytics
Survey detail analytics
Official data comparison
Advanced filters
Map-based analytics
Summary tables/materialized views
```

## 6.3 Production Dashboard Scope

Production may include:

```text
scheduled dashboard refresh
PDF dashboard report
Excel export
forecasting after enough data
route planning insights
campaign analytics
researcher dashboard
public summary dashboard
```

---

## 7. Dashboard Page Structure

Recommended route:

```text
/admin/dashboard
```

Phase 09 implementation status:

```text
Implemented as the MVP protected dashboard route.
The route uses server-side `dashboard.read` permission checks, validated URL filters, live database aggregation, and aggregated privacy-safe DTOs.
```

Out of current Phase 09 scope:

```text
export/download reports
official data import comparison
scheduled summary table refresh
public dashboard (implemented later as the Yala public evidence report)
```

### Public evidence report implementation (11 August 2026)

`/dashboard` is a privacy-safe evidence report for the Yala pilot. It is not a
public copy of the protected admin dashboard.

Rules:

```text
scope                          Yala only, resolved from province master data
default period                 latest 30 calendar days
data-as-of                     time the page reads and processes the live database
public cell suppression        hide category/attraction cells below 5 records
interpretation threshold       at least 30 satisfaction responses
missing values                 show No data; never convert to zero
QR scans                       never described as visits
tourist profiles               not verified unique people
spending                       self-reported estimate, never revenue
chart accessibility            every charted dataset has an HTML table alternative
```

The public DTO contains only approved aggregate evidence. Admin viewer data,
identity-provider detail, raw comments, IDs, contact data, and private file paths
must not cross this boundary.

MVP page sections:

```text
Dashboard Header
Global Filters
Data Freshness Note
Executive KPI Cards
Visit Analytics
Tourist Profile Analytics
Travel Behavior Analytics
Expense Analytics
Satisfaction Analytics
Funnel Analytics
Sustainable Tourism Insights optional
Export Actions
```

Future routes:

```text
/admin/dashboard/executive
/admin/dashboard/tourists
/admin/dashboard/visits
/admin/dashboard/expenses
/admin/dashboard/satisfaction
/admin/dashboard/funnel
/admin/dashboard/sustainability
/admin/dashboard/official-comparison
```

## 7.1 Thai-First Dashboard UX Baseline

The admin dashboard uses Thai as the primary interface language. Metric keys and
database field names remain unchanged in the service layer, while visible titles,
filters, tabs, alerts, chart labels, empty states, and export notices use Thai.

The first viewport prioritizes decision-making context:

```text
page purpose
selected date range
data source and last refresh time
sample size
compact primary filters
five primary KPIs at most
```

The five executive KPIs are:

```text
tourist profiles with visits
recorded visits
certificates generated
survey completion rate
average satisfaction
```

Other metrics remain available in their relevant analysis sections and exports.
Alerts are collapsed by default and show no more than the three highest-priority
items when expanded. A large alert set must not push the actual dashboard below
the first viewport.

Chart selection rules:

```text
time series -> line chart
ranked categories -> horizontal bars
small mutually exclusive distribution -> stacked distribution
many categories -> bars, not donut charts
funnel -> sequential stages with count, conversion, and drop-off
```

Every visual chart must provide an accessible table or equivalent structured text.
Mobile layouts must not create page-level horizontal overflow. Wide data tables may
scroll inside their own bounded container.

---

## 8. Global Filters

## 8.1 Required MVP Filters

```text
date range
province
attraction
```

## 8.2 Recommended Optional Filters

```text
origin country
origin province
age group
transport mode
travel purpose
identity provider
completion status
```

## 8.3 Default Date Range

Recommended:

```text
current month
```

or:

```text
last 30 days
```

The selected range must be visible.

## 8.4 URL State

Dashboard filters should be reflected in URL query parameters.

Example:

```text
/admin/dashboard?start=2026-05-01&end=2026-05-31&province=1&attraction=5
```

Benefits:

```text
shareable dashboard view
reload-safe filters
easier debugging
```

---

## 9. Date Filtering Rules

Different metrics may use different date fields.

## 9.1 Visit-Based Metrics

Use:

```text
visits.visit_date
```

Examples:

```text
visit count
tourist profile count in period
visits by province
visits by attraction
travel behavior
expense
satisfaction by visit context
```

## 9.2 Funnel Metrics

Use:

```text
funnel_events.event_time
```

## 9.3 Certificate Trend

Can use:

```text
certificates.generated_at
```

But for comparison with visits, it may join to visits and filter by `visits.visit_date`.

## 9.4 Survey Submission Trend

Can use:

```text
satisfaction_surveys.completed_at
```

But for attraction planning, filter through visit context.

## 9.5 Rule

Each metric definition must state which date field it uses.

---

## 10. Executive Overview Requirements

## 10.1 Purpose

Provide a quick summary of platform activity and tourism participation.

## 10.2 Required KPI Cards

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

## 10.3 Optional KPI Cards

```text
QR Scans
Photo Upload Rate
Certificate Conversion Rate
Passport Save Rate
Returning Tourist Profiles
```

## 10.4 KPI Rules

- KPI cards must have definitions.
- KPI cards must support filters.
- KPI cards must show `No data` when denominator is zero.
- KPI cards must not show misleading zero values.

---

## 11. Visit Analytics Requirements

## 11.1 Purpose

Understand where tourists participate.

## 11.2 Required Visuals

```text
Visits by province
Visits by attraction
Visit trend over time
Top attractions table
```

## 11.3 Recommended Tables

```text
Top 10 attractions by visits
Low-visit attractions
High-visit attractions with low satisfaction
Low-visit attractions with high satisfaction
```

## 11.4 Planning Use

This section helps answer:

```text
Which attractions are popular?
Which attractions need promotion?
Which attractions may need capacity planning?
```

---

## 12. Tourist Profile Analytics Requirements

## 12.1 Purpose

Understand who participates in the tourism flow.

## 12.2 Required Visuals

```text
Origin country distribution
Origin Thai province distribution
Age group distribution
Preferred language distribution
Identity provider distribution
```

## 12.3 Important Rules

- Count tourists through visits when date filters are applied.
- Do not treat tourist profiles as verified unique people.
- Do not expose raw identity provider user IDs.

## 12.4 Planning Use

This section helps answer:

```text
Are visitors mostly local, domestic, or foreign?
Which language should tourism content prioritize?
Which age groups are engaging?
```

---

## 13. Travel Behavior Dashboard Requirements

## 13.1 Purpose

Understand how tourists travel.

## 13.2 Required Metrics

```text
Travel companion distribution
Average group size
Transport mode distribution
Travel purpose distribution
Same-day vs overnight ratio
Average nights
```

## 13.3 Planning Use

This section helps answer:

```text
Do tourists travel alone or in groups?
Do they use private cars, public transport, or tour groups?
Are they staying overnight?
Are there opportunities for route/package development?
```

## 13.4 Missing Data Rule

Do not treat missing group size or nights as zero.

Use only non-null answers for averages.

---

## 14. Expense Dashboard Requirements

## 14.1 Purpose

Analyze spending patterns.

## 14.2 Required Metrics

```text
Spending range distribution
Estimated spending min/max
Expense category distribution
Estimated spending by province
Estimated spending by attraction
```

## 14.3 Required Label

Always label as:

```text
Estimated Spending
```

Do not label as:

```text
Revenue
```

unless actual verified transaction data exists.

## 14.4 Planning Use

This section helps answer:

```text
Which attractions may generate local economic benefit?
What spending ranges are common?
Which expense categories matter?
```

---

## 15. Satisfaction Dashboard Requirements

## 15.1 Purpose

Understand tourism quality and improvement needs.

## 15.2 Required Metrics

```text
Average overall satisfaction
Satisfaction by attraction
Satisfaction by province
Revisit intention rate
Recommendation intention rate
Low satisfaction attraction list
```

## 15.3 Optional Category Scores

```text
Safety
Cleanliness
Transport/access
Information/signage
Service
Value for money
```

## 15.4 Missing Data Rule

Missing satisfaction must not be counted as zero.

If no responses:

```text
average = null
display = No data
```

## 15.5 Planning Use

This section helps answer:

```text
Which attractions need service improvement?
Which attractions are strong candidates for promotion?
What issues affect visitor experience?
```

---

## 16. Funnel Analytics Dashboard Requirements

## 16.1 Purpose

Identify where tourists drop out from QR scan to certificate/survey/passport.

This directly solves the project challenge:

```text
Tourists may not want to fill forms.
```

## 16.2 Required Funnel Stages

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

## 16.3 Required Metrics

```text
count by stage
conversion from previous stage
drop-off from previous stage
funnel by attraction
funnel by photo spot
```

## 16.4 Planning Use

This section helps answer:

```text
Is the landing page persuasive?
Is the profile form too hard?
Is photo upload causing drop-off?
Is the survey too long?
Which attractions have poor QR conversion?
```

---

## 17. Digital Passport and Stamp Analytics

## 17.1 MVP Status

Optional but useful.

## 17.2 Metrics

```text
Total stamps earned
Stamps by attraction
Passport save rate
Returning stamp collectors
Attractions with high repeat interest
```

## 17.3 Planning Use

This section helps answer:

```text
Are tourists motivated to collect stamps?
Which locations encourage repeat engagement?
```

---

## 18. Sustainable Tourism Dashboard Requirements

## 18.1 Purpose

Support sustainable tourism planning, not only operational monitoring.

## 18.2 Suggested Indicators

```text
High-visit low-satisfaction attractions
Low-visit high-satisfaction attractions
Attraction concentration
Overnight stay opportunity
Estimated spending distribution
Transport/accessibility signal
Recommendation strength
Revisit intention
```

## 18.3 Insight Categories

Recommended insight cards:

```text
Improvement Priority
Promotion Opportunity
Capacity/Concentration Risk
Economic Opportunity
Route Development Opportunity
```

## 18.4 Planning Use

This section helps answer:

```text
Which attractions should be improved before promotion?
Which hidden attractions deserve more marketing?
Where should infrastructure investment be considered?
```

---

## 19. Official Data Comparison Dashboard

## 19.1 MVP Status

Future / Phase 2.

## 19.2 Purpose

Compare local platform participation data with official tourism statistics.

## 19.3 Required Warning

Dashboard must state:

```text
Local platform visits are QR/certificate participation records and may not represent total official tourist arrivals.
```

## 19.4 Possible Metrics

```text
Official visitor count
Local platform visit count
Platform coverage estimate
Official revenue vs estimated local spending
```

## 19.5 Rule

Do not merge official and local numbers without labels.

---

## 20. Required Dashboard Components

Frontend components:

```text
DashboardPageHeader
DashboardFilterBar
DataFreshnessNote
KpiCard
KpiGrid
ChartCard
MetricTooltip
InsightCard
InsightTable
FunnelChart
ExportMenu
EmptyState
LoadingState
ErrorState
```

Backend services:

```text
DashboardService
ExportService
MetricDefinitionService optional
```

---

## 21. Dashboard Data Freshness

Dashboard must show:

```text
Last updated
Data source type
```

Source type values:

```text
live database
summary table
materialized view
cached
```

MVP can show:

```text
Data source: live database
Last updated: current server time
```

If summary tables are added, show actual refresh timestamp.

---

## 22. Dashboard Performance Requirements

## 22.1 MVP

MVP can use live queries if data is small.

Required:

```text
date filters
indexes
limited result sets
backend aggregation
no raw full-table frontend aggregation
```

## 22.2 Production

Production should use:

```text
summary tables
materialized views
scheduled refresh
dashboard cache
```

Especially for:

```text
funnel analytics
daily trends
large exports
official comparison
```

---

## 23. Dashboard Security Requirements

Dashboard access requires:

```text
admin authentication
dashboard.read permission
```

Export requires:

```text
export.create or detailed export permissions
```

Sensitive data must not be shown by default.

Do not expose:

```text
email
LINE user ID
provider_user_id
device token
raw photo path
private certificate URL
```

---

## 24. Dashboard Privacy Requirements

Dashboard should aggregate.

Rules:

- no direct identity fields in normal dashboard.
- no raw comments in summary dashboard unless permission and purpose are clear.
- small group suppression may be considered for public reports.
- export must be permission-controlled.

---

## 25. Dashboard Empty States

Required empty states:

```text
No visits in selected date range.
No satisfaction responses yet.
No expense data yet.
No funnel events recorded yet.
No attractions found for selected filters.
```

Empty state must explain what to do next.

---

## 26. Dashboard Loading States

Required loading states:

```text
KPI skeleton
chart skeleton
table skeleton
filter loading state
export generating state
```

Avoid one spinner for the entire page if sections can load independently.

---

## 27. Dashboard Error States

Errors should be section-level when possible.

Examples:

```text
Could not load satisfaction metrics.
Could not load funnel analytics.
Could not generate export.
```

Other sections should still display if available.

---

## 28. Dashboard Export Requirements

MVP export actions:

```text
Export dashboard summary CSV
Export visits CSV
Export satisfaction CSV
Export expenses CSV
Export funnel summary CSV
```

Rules:

- export permission required.
- export audit log required.
- default exports exclude direct identifiers.
- exports use same metric definitions as dashboard.

---

## 29. Dashboard Accessibility Requirements

Dashboard must support:

```text
keyboard accessible filters
readable KPI labels
chart titles and descriptions
table alternatives for key chart data
color not the only meaning
screen-reader friendly states where possible
```

Important chart data should be available in table or text summary where possible.

---

## 30. Dashboard Testing Requirements

Test:

```text
no data
single province
multiple provinces
date filter
province filter
attraction filter
missing satisfaction
missing expense
zero certificate denominator
repeat visits
repeat stamp rule
guest users
foreign users
large result set
permission denied
export action
mobile/tablet layout
```

---

## 31. MVP Acceptance Checklist

```text
[ ] Dashboard route is protected.
[ ] Dashboard uses backend aggregation services.
[ ] Global filters exist.
[ ] Date range filter works.
[ ] Province filter works or is planned.
[ ] Attraction filter works or is planned.
[ ] Executive KPI cards exist.
[ ] Visit count is not QR scan count.
[ ] Tourist profile count is defined correctly.
[ ] Certificate count is shown.
[ ] Stamp count is shown.
[ ] Survey completion rate handles zero denominator.
[ ] Average satisfaction ignores missing values.
[ ] Estimated spending is labeled as estimated.
[ ] Visits by province chart exists.
[ ] Visits by attraction chart/table exists.
[ ] Origin distribution exists.
[ ] Age group distribution exists.
[ ] Funnel counts exist.
[ ] Empty/loading/error states exist.
[ ] No private identifiers are displayed.
[ ] Export is permission-controlled.
[ ] Metric dictionary exists.
```

---

## 32. Do Not Do

Do not:

```text
Count QR scans as visits.
Count visits as unique people.
Count missing satisfaction as zero.
Call estimated spending revenue.
Show LINE user ID.
Show email.
Show private photo/certificate paths.
Build metrics only in frontend.
Load all raw rows into browser.
Create charts without planning purpose.
Hide limitations.
Use dashboard numbers without definitions.
```

---

## 33. Future Enhancements

Possible enhancements:

```text
Map-based analytics
Route development dashboard
Campaign analytics
Public summary dashboard
Official data comparison
Forecasting
AI-generated planning recommendations
PDF dashboard report
Excel dashboard workbook
Scheduled monthly dashboard report
```

---

## 34. Final Dashboard Requirement

A dashboard is only valuable if its numbers are correct and its interpretation is honest.

This dashboard must support real tourism planning, not just visual decoration.

---

## 35. Decision Question Matrix (Phase 24)

Each analytics page must answer its primary question before showing secondary detail. Existing URLs remain stable while navigation labels and screen hierarchy follow this matrix.

| Area | Primary decision question | First-view evidence | Required comparison | Primary next action |
|---|---|---|---|---|
| Executive overview | What needs attention now? | Five to seven outcome KPIs, freshness, quality, top priorities | Previous period; eligible attraction peer context | Open the highest-priority evidence or action |
| Audience | Which aggregate visitor groups are participating? | Origin, age, and language with coverage | Prior period or one privacy-safe segment | Adjust content, language, or audience plan |
| Journey and conversion | Where does the real participant flow lose people? | Ordered stage count, conversion, and drop-off with unit | Prior period, attraction, or verified entry channel | Investigate the highest supported drop-off |
| Visitor experience | Which experience dimensions need improvement? | Overall and dimension scores with `n` and missingness | Prior period and eligible attraction peer | Create or link a reviewed improvement issue |
| Economic signals | What self-reported spending patterns can inform planning? | Range/category distribution and response coverage | Prior period or privacy-safe visitor segment | Review product/package opportunity without revenue claims |
| Attraction intelligence | What is happening at this attraction and what should follow? | Visit-safe KPIs, funnel, audience, experience, action status | Up to three eligible peers and previous period | Assign an owner, due date, baseline, and follow-up |
| Sustainability and action center | Which evidence-backed issues or opportunities are most important? | Prioritized deterministic insights and confidence | Relevant baseline/peer where available | Accept, reject, or convert insight into tracked work |
| Research quality | Is the pilot ready for final field collection? | Consent, completion, burden, version, suppression, and data quality | Collection mode and participant type, descriptively | Record go/no-go evidence and instrument freeze |
| Public evidence | What can the public responsibly learn from the Yala pilot? | Small set of approved aggregates and limitations | Previous period only when enough points and sample exist | Explore public attractions or methodology |

### 35.1 Shared Reading Order

All protected analytics pages use this order:

```text
scope and freshness
key outcome
comparison
evidence strength
recommended next action
drill-down and metric definition
```

### 35.2 Shared Comparison Rules

- Previous-period comparison uses an immediately preceding range with equal calendar length.
- Peer comparison includes only attractions that satisfy the documented scope, date alignment, privacy threshold, and metric availability rules.
- A comparison displays its baseline, denominator, and eligibility note beside the result.
- Descriptive differences must not be labelled statistically significant unless a separately approved statistical method is implemented and documented.
- Suppressed, stale, or truncated results cannot generate directional narrative or action priority automatically.

### 35.3 Shared Action Contract

When a supported finding becomes an improvement issue, carry only aggregate and auditable context:

```text
metric key
attraction ID when applicable
date range
filter signature
baseline value and denominator
evidence strength
generated-at timestamp
```

Do not copy private comments, tourist identifiers, contact information, or media paths into the issue draft.
