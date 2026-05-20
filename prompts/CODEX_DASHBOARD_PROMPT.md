# CODEX_DASHBOARD_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to build, review, refactor, or debug dashboard analytics for the **Southern Border Tourism Data & Intelligence Platform**.

The dashboard is the planning layer of the project. It must transform tourist participation data into trustworthy insights for tourism planning in:

```text
Yala
Pattani
Narathiwat
```

Dashboard work must be accurate, privacy-safe, filterable, and honest about limitations.

---

## 2. Dashboard Mission

The dashboard mission is:

```text
Turn QR/certificate/survey data into reliable planning insight for sustainable southern border tourism development.
```

The dashboard should answer:

```text
Who visits?
Where do they visit?
How do they travel?
What do they spend on?
How satisfied are they?
Where does the QR-to-certificate flow drop off?
Which attractions should be promoted?
Which attractions need improvement?
What data quality limitations exist?
```

---

## 3. Required Opening Instruction for Codex

Start dashboard tasks with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Dashboard metrics must be server-side, privacy-safe, and aligned with the metric dictionary.
Do not count QR scans as visits.
Do not call estimated spending revenue.
Do not treat missing satisfaction as zero.
Do not expose personal identifiers.
```

---

## 4. Documents to Read Before Dashboard Work

Codex should read:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/dashboard/EXECUTIVE_DASHBOARD.md
docs/dashboard/TOURIST_PROFILE_DASHBOARD.md
docs/dashboard/TRAVEL_BEHAVIOR_DASHBOARD.md
docs/dashboard/EXPENSE_DASHBOARD.md
docs/dashboard/SATISFACTION_DASHBOARD.md
docs/dashboard/SUSTAINABLE_TOURISM_DASHBOARD.md
docs/dashboard/FUNNEL_ANALYTICS_DASHBOARD.md
docs/database/ANALYTICS_TABLES.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/backend/API_ENDPOINTS.md
checklists/DASHBOARD_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PERFORMANCE_CHECKLIST.md
docs/testing/UNIT_TEST_PLAN.md
docs/testing/INTEGRATION_TEST_PLAN.md
```

---

## 5. Dashboard Architecture Rules

Dashboard should follow:

```text
Dashboard Page
  -> Filter UI
  -> Dashboard API / Server Action
  -> Dashboard Service
  -> Repository / SQL Query
  -> Aggregated Response
  -> KPI / Chart / Table Components
```

Rules:

```text
Metrics calculated server-side.
Frontend receives aggregated data.
No personal identifiers in dashboard response.
Filters validated server-side.
Metric formulas centralized and tested.
```

Do not:

```text
fetch all visits into frontend and aggregate there
return raw tourist profiles
return private identifiers
build charts without metric definitions
```

---

## 6. Dashboard Route Rules

Admin dashboard should be protected.

Requirements:

```text
admin authentication required
dashboard.read permission required
viewer can view allowed dashboard
anonymous blocked
backend verifies permission
```

---

## 7. Global Dashboard Filters

Required filters:

```text
date range
province
attraction
```

Recommended optional filters:

```text
origin country
origin province
age group
transport mode
travel purpose
overnight status
spending range
satisfaction score range
```

Rules:

```text
filters must be validated
date range must have safe defaults
invalid filter rejected
province-attraction mismatch handled
filters apply consistently
```

---

## 8. Data Freshness and Limitations

Dashboard should show:

```text
selected date range
last updated / generated at
data source notes
limitations
```

Important limitations:

```text
Local platform visits are not official tourist arrivals.
Tourist Profiles are system profiles, not verified unique people.
Estimated Spending is self-reported/range-based, not revenue.
Satisfaction is based on optional survey responses.
QR scans are not visits.
```

---

# Critical Metric Rules

---

## 9. Visit and QR Rules

```text
QR scan = funnel event
Visit = record created after minimal profile/consent flow
Certificate = generated certificate record
Survey = optional survey response
```

Do not count:

```text
QR scans as visits
landing views as visits
certificate starts as visits
```

---

## 10. Tourist Profile Rules

Tourist Profiles should generally mean:

```text
count(distinct tourist_id) among visits in the selected filters
```

Not:

```text
verified unique humans
official arrivals
QR scanners
all tourist table rows regardless of filtered visit
```

Label clearly:

```text
Tourist Profiles
```

Avoid:

```text
Unique Tourists
Verified Tourists
Total Travelers
```

unless the methodology supports it.

---

## 11. Satisfaction Rules

Rules:

```text
scores are 1-5
missing score = null
average excludes null
no responses = No data/null
show response count with average
small sample warning recommended
```

Do not:

```text
treat null as 0
display missing data as 0 satisfaction
average unanswered surveys
```

---

## 12. Expense Rules

Rules:

```text
spending is range-based
label as Estimated Spending
do not label as Revenue
prefer_not_to_answer excluded from estimate
open-ended range flagged
show response count
```

If calculating min/max:

```text
estimated_min = sum of lower bounds or grouped estimate
estimated_max = sum of upper bounds where available
has_open_ended_range = true if any open-ended range included
```

---

## 13. Funnel Rules

Funnel stages may include:

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

Rules:

```text
conversion = current_stage / previous_stage
dropoff = 1 - conversion
zero denominator = null/No data
event count is not unique people unless session/user dedup logic is explicit
```

---

## 14. Sustainable Tourism Rules

Insights must be evidence-based.

Possible categories:

```text
high visit / high satisfaction = flagship
high visit / low satisfaction = improvement priority
low visit / high satisfaction = promotion opportunity
low visit / low satisfaction = needs diagnosis
```

Rules:

```text
show sample size
show confidence/limitation
do not overclaim official impact
do not treat platform data as complete official statistics
```

---

# Dashboard Modules

---

## 15. Executive Dashboard

Required KPIs:

```text
Tourist Profiles
Total Visits
Certificates Generated
Stamps Earned
Survey Completion Rate
Average Satisfaction
Estimated Spending
Top Attraction
```

Recommended sections:

```text
visit trend
visits by province
top attractions
funnel summary
satisfaction summary
expense summary
planning insights
```

---

## 16. Tourist Profile Dashboard

Metrics:

```text
domestic vs foreign distribution
origin country distribution
Thai origin province distribution
age group distribution
preferred language distribution
returning profile summary
profile data completeness
```

Privacy:

```text
no email
no LINE ID
no provider_user_id
no guest token
```

---

## 17. Travel Behavior Dashboard

Metrics:

```text
travel companion distribution
group size distribution
transport mode distribution
travel purpose distribution
same-day vs overnight
average nights
behavior by province/attraction
```

Rules:

```text
missing group size is not 0
missing nights is not 0
show denominators
```

---

## 18. Expense Dashboard

Metrics:

```text
expense response count
spending range distribution
estimated spending min/max
expense category distribution
spending by province
spending by attraction
```

Rules:

```text
estimated, not revenue
range-based limitation visible
prefer_not_to_answer handled
open-ended range handled
```

---

## 19. Satisfaction Dashboard

Metrics:

```text
survey response count
average overall satisfaction
satisfaction by province
satisfaction by attraction
revisit intention rate
recommendation intention rate
low satisfaction alerts
top/lowest rated attractions
```

Rules:

```text
null excluded
No data if no responses
response count shown
raw comments not shown by default
```

---

## 20. Funnel Analytics Dashboard

Metrics:

```text
stage counts
stage conversion rates
stage drop-off rates
largest drop-off
funnel by attraction
funnel by photo spot
funnel trend over time
```

Use funnel to diagnose:

```text
landing problem
form friction
photo upload problem
certificate generation problem
survey length/timing problem
passport save incentive weakness
```

---

## 21. Sustainable Tourism Dashboard

Indicators:

```text
attraction concentration
promotion opportunity
improvement priority
overnight opportunity
local economic opportunity
data quality
```

Insight card should include:

```text
title
metric evidence
suggested action
confidence/limitation
```

---

# Dashboard Backend Requirements

---

## 22. Dashboard API / Service Response

Response should be:

```text
aggregated
typed
filter-aware
privacy-safe
bounded
```

Include where useful:

```text
value
label
unit
count
denominator
percentage
trend
data_quality_note
last_updated_at
```

Do not include:

```text
email
LINE user ID
provider_user_id
guest token
raw photo path
private certificate path
raw comments by default
```

---

## 23. Dashboard Query Requirements

Queries must:

```text
apply date filters
apply province/attraction filters
use indexes
avoid unbounded raw row fetch
group/aggregate server-side
handle null values correctly
```

Recommended indexes:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
certificates(visit_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys(visit_id)
visit_expenses(visit_id)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
```

---

## 24. Summary Tables Future

For larger data, support or plan:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
```

Summary tables must not contain personal identifiers.

---

# Dashboard Frontend Requirements

---

## 25. Dashboard Components

Recommended:

```text
DashboardPageHeader
DashboardFilterBar
DataFreshnessNote
KpiGrid
KpiCard
ChartCard
MetricTooltip
EmptyState
LoadingState
ErrorState
ExportMenu
InsightCard
FunnelChart
RankedTable
```

---

## 26. Dashboard UI Rules

UI must:

```text
show clear metric labels
show tooltips/definitions
show response counts
show No data for null
show loading states
show empty states
show error states
show selected filters
show data limitations
```

Avoid:

```text
fake precision
misleading labels
color-only meaning
charts without titles
hiding denominator rules
```

---

## 27. Dashboard Accessibility

Checklist:

```text
charts have titles
chart data has table/text alternative where important
color is not only indicator
tooltips are accessible or definitions visible
filters keyboard accessible
KPI labels readable
```

---

# Dashboard Export Requirements

---

## 28. Dashboard Export

Dashboard export should:

```text
require permission
respect filters
export aggregated summary where possible
exclude private identifiers
create audit log
preserve Thai text
include clear headers
include metric definitions where practical
```

Do not:

```text
export raw personal identifiers by default
export raw comments by default
```

---

# Dashboard Testing Requirements

---

## 29. Unit Tests

Required formula tests:

```text
survey completion rate
average satisfaction
funnel conversion
funnel drop-off
estimated spending range
open-ended spending range
attraction concentration
planning quadrant classification
zero denominator behavior
null handling
```

---

## 30. Integration Tests

Required known-seed tests:

```text
executive KPI metrics
tourist profile distribution
travel behavior metrics
expense metrics
satisfaction metrics
funnel metrics
filters
privacy of dashboard responses
```

---

## 31. Manual Dashboard QA

Check:

```text
dashboard loads with sample data
dashboard loads with no data
filters work
KPI values match expected seed data
charts readable
tooltips explain metrics
No data states clear
export respects filters
no private identifiers visible
```

---

# Dashboard Task Prompt Template

---

## 32. Standard Dashboard Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Describe dashboard task.]

Context:
[Explain planning/analytics purpose.]

Read first:
- CODEX_MAIN_PROMPT.md
- prompts/CODEX_DASHBOARD_PROMPT.md
- docs/dashboard/DASHBOARD_REQUIREMENTS.md
- docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
- docs/dashboard/[RELEVANT_DASHBOARD_DOC].md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/database/ANALYTICS_TABLES.md
- checklists/DASHBOARD_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md

Requirements:
- Implement server-side metric calculation.
- Validate filters.
- Return aggregated privacy-safe response.
- Add frontend KPI/chart/table components if required.
- Add loading/empty/error states.
- Add tooltip/definition text.
- Add unit/integration tests where practical.

Critical metric rules:
- QR scans are not visits.
- Tourist Profiles are not verified unique people.
- Estimated Spending is not revenue.
- Missing satisfaction is null/No data, not zero.
- Zero denominator returns null/No data.
- Dashboard must not expose private identifiers.

Validation:
- Run relevant tests/commands if available.
- Verify metric against seed data or explain if not possible.

Do not:
- Do not fetch all raw rows into frontend.
- Do not expose email/LINE ID/provider_user_id.
- Do not hide denominator rules.
- Do not invent official tourism claims.

Completion response:
Summary
Files changed
Validation
Metric notes
Privacy notes
Risks / Notes
Next suggested task
```

---

# Specialized Dashboard Prompts

---

## 33. Executive Dashboard Prompt

```text
Task:
Implement executive dashboard metrics and UI.

Requirements:
- Tourist Profiles
- Total Visits
- Certificates Generated
- Stamps Earned
- Survey Completion Rate
- Average Satisfaction
- Estimated Spending
- Top Attraction
- Date/province/attraction filters
- Loading/empty/error states
- Metric tooltips
- Privacy-safe response

Critical:
- Visits are not QR scans.
- Estimated spending is not revenue.
- Missing satisfaction is not 0.
```

---

## 34. Tourist Profile Dashboard Prompt

```text
Task:
Implement tourist profile dashboard.

Requirements:
- domestic vs foreign
- origin country distribution
- Thai origin province distribution
- age group distribution
- preferred language distribution
- profile data completeness
- filters
- privacy-safe aggregation

Do not:
- Do not show email/LINE/provider_user_id.
- Do not label as verified unique tourists.
```

---

## 35. Travel Behavior Dashboard Prompt

```text
Task:
Implement travel behavior dashboard.

Requirements:
- travel companion distribution
- group size distribution/average
- transport mode distribution
- travel purpose distribution
- same-day vs overnight
- average nights
- behavior by province/attraction
- denominators/response counts

Critical:
- missing group size/nights are not 0.
```

---

## 36. Expense Dashboard Prompt

```text
Task:
Implement expense dashboard.

Requirements:
- expense response count
- spending range distribution
- estimated spending min/max
- expense category distribution
- spending by province/attraction
- open-ended range handling
- prefer_not_to_answer handling

Critical:
- Always label as Estimated Spending.
- Never label as Revenue.
```

---

## 37. Satisfaction Dashboard Prompt

```text
Task:
Implement satisfaction dashboard.

Requirements:
- survey response count
- average overall satisfaction
- satisfaction by province
- satisfaction by attraction
- revisit intention rate
- recommendation intention rate
- low satisfaction alerts
- response counts
- small sample warning where useful

Critical:
- null scores excluded
- no responses = No data
- raw comments hidden by default
```

---

## 38. Funnel Dashboard Prompt

```text
Task:
Implement funnel analytics dashboard.

Requirements:
- stage counts
- conversion rates
- drop-off rates
- largest drop-off
- funnel by attraction
- funnel by photo spot if available
- zero denominator handling
- stage definitions/tooltips

Critical:
- QR scans are funnel events, not visits.
- Event count is not unique people unless deduped explicitly.
```

---

## 39. Sustainable Tourism Dashboard Prompt

```text
Task:
Implement sustainable tourism planning dashboard/insight cards.

Requirements:
- classify attractions by visit volume and satisfaction
- attraction concentration
- promotion opportunities
- improvement priorities
- overnight opportunity
- local economic opportunity
- confidence/sample size
- evidence and suggested action per insight

Critical:
- Do not overclaim official impact.
- Show data limitations.
- Use platform data as local participation data, not full official arrivals.
```

---

# Dashboard Review Checklist

---

## 40. Before Accepting Dashboard Work

Check:

```text
[ ] Metrics match dictionary.
[ ] Filters are validated.
[ ] Metrics calculated server-side.
[ ] Response is aggregated.
[ ] No personal identifiers returned.
[ ] Null/zero rules correct.
[ ] Tooltips/definitions exist.
[ ] Data limitations visible.
[ ] Tests cover formulas.
[ ] Performance is reasonable.
[ ] Export if present is permission-controlled.
```

---

## 41. Critical Dashboard Blockers

Block if:

```text
QR scans counted as visits
Tourist Profiles labeled verified unique people
Estimated Spending labeled revenue
null satisfaction treated as 0
dashboard exposes email/LINE ID/provider_user_id
dashboard fetches all raw personal rows
zero denominator returns misleading 0%
no permission check on dashboard API
```

---

## 42. Dashboard Completion Response Format

Codex should respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

Metric notes
- formulas implemented
- denominators
- null/zero handling

Privacy notes
- identifiers excluded
- aggregation notes

Risks / Notes
- ...

Next suggested task
- ...
```

---

## 43. Final Dashboard Rule

Dashboard metrics must be trustworthy and explainable.

If a number cannot be clearly defined, tested, and interpreted without misleading planners, do not present it as a decision-making metric.
