---
name: dashboard-analytics
description: Use when building, reviewing, or debugging dashboard analytics including KPI cards, charts, metric formulas, filters, funnel analytics, expense/satisfaction analysis, and sustainable tourism insights.
---

# Dashboard Analytics Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging dashboard analytics for the Southern Border Tourism Data & Intelligence Platform.

The dashboard is the planning and decision-support layer of the project. It must convert tourist participation data into trustworthy insight for sustainable tourism planning in:

```text
Yala
Pattani
Narathiwat
```

Dashboard work must be accurate, privacy-safe, explainable, filterable, and performance-conscious.

---

## When to Use This Skill

Use this skill for tasks involving:

```text
dashboard metrics
KPI cards
charts
tables
dashboard filters
dashboard API/service
dashboard SQL queries
dashboard exports
metric dictionary
funnel analytics
expense analytics
satisfaction analytics
tourist profile analytics
sustainable tourism insights
dashboard tests
```

Use together with:

```text
backend-api
database-design
frontend-nextjs-pwa
ux-ui-design
testing-qa
pdpa-security
```

when the task affects implementation, UX, testing, or privacy.

---

## Required Context

Before dashboard work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_DASHBOARD_PROMPT.md
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
checklists/DASHBOARD_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PERFORMANCE_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

---

## Dashboard Mission

The dashboard mission is:

```text
Turn tourist participation data into reliable planning insight without misleading decision-makers or exposing private data.
```

The dashboard should help answer:

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

# Critical Analytics Rules

---

## Rule 1: QR Scans Are Not Visits

Definitions:

```text
QR scan = funnel event
landing view = funnel event
visit = tourist participation record after minimal profile/consent
certificate = reward generated for visit
survey = optional post-certificate response
```

Do not count:

```text
QR scans as visits
landing views as visits
certificate starts as visits
```

---

## Rule 2: Tourist Profiles Are Not Verified Unique People

Use label:

```text
Tourist Profiles
```

Avoid label:

```text
Verified Unique Tourists
Official Tourist Count
Total Travelers
```

Recommended calculation:

```text
count(distinct tourist_id) among visits in selected filter
```

Unless another documented definition is used.

---

## Rule 3: Estimated Spending Is Not Revenue

Use label:

```text
Estimated Spending
```

Do not use:

```text
Revenue
Income
Economic Impact
```

unless there is a verified methodology and official data integration.

Spending data is:

```text
self-reported
range-based
optional
estimated
```

---

## Rule 4: Missing Satisfaction Is Not Zero

Rules:

```text
null score = no answer
average excludes null
no responses = No data
show response count with average
small sample warning where useful
```

Do not:

```text
convert null to 0
display missing satisfaction as 0
average unanswered survey rows
```

---

## Rule 5: Zero Denominator Returns No Data

For rates:

```text
if denominator = 0
return null / No data
```

Do not return misleading 0% unless the denominator exists and count is truly zero.

---

## Rule 6: Dashboard Must Be Privacy-Safe

Dashboard responses must not include:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw IP
raw user agent
private photo path
private certificate path
raw comments by default
```

Dashboard should use aggregated data:

```text
counts
percentages
averages
ranges
rankings
grouped categories
insight cards
```

---

# Dashboard Architecture

---

## Recommended Flow

```text
Dashboard UI
  -> Dashboard API / Server Action
  -> Dashboard Filter Validator
  -> Permission Guard
  -> Dashboard Service
  -> Repository / SQL Query
  -> Aggregated Privacy-Safe DTO
  -> KPI / Chart / Table
```

Rules:

```text
calculate metrics server-side
validate filters server-side
return aggregated data
avoid raw personal rows
centralize metric formulas
test metric formulas
```

---

## Required Access Control

Dashboard endpoints must:

```text
require authentication
require dashboard.read permission
block anonymous users
allow viewer/admin/super_admin according to role
return safe errors
```

---

## Global Filters

Required:

```text
date range
province
attraction
```

Recommended:

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

Filter rules:

```text
validate all filters
apply filters server-side
default date range should be safe
invalid province-attraction combination handled
large date ranges limited or optimized
```

---

# Metric Definitions

---

## Executive KPIs

Required:

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

Optional:

```text
QR Scans
Landing Views
Certificate Conversion Rate
Photo Upload Rate
Passport Save Rate
Returning Tourist Profiles
```

---

## Tourist Profiles

Recommended formula:

```text
count(distinct visits.tourist_id)
where visits match selected filters
```

Use visits to apply date/province/attraction filters.

Privacy:

```text
do not return individual tourist rows
do not return identities
```

---

## Total Visits

Formula:

```text
count(visits.visit_id)
```

Rules:

```text
visits only
not QR scans
not landing views
not certificate starts
```

---

## Certificates Generated

Formula:

```text
count(certificates.certificate_id)
```

Filtered through visit/attraction/date as documented.

---

## Stamps Earned

Formula:

```text
count(tourist_stamps.tourist_stamp_id)
```

or filtered through source visit/date/attraction as documented.

Be clear whether the date is:

```text
earned_at
source visit date
```

---

## Survey Completion Rate

Possible denominator:

```text
surveys / certificates
```

or:

```text
surveys / visits
```

Choose one and document it.

Recommended MVP:

```text
survey_count / certificate_count
```

because survey appears after certificate.

Rules:

```text
zero denominator = No data
show numerator and denominator
```

---

## Average Satisfaction

Formula:

```text
avg(overall_score) where overall_score is not null
```

Rules:

```text
scores 1-5
null excluded
show response count
no response = No data
```

---

## Estimated Spending

Use spending ranges.

Possible output:

```text
estimated_min
estimated_max
response_count
has_open_ended_range
most_common_spending_range
```

Rules:

```text
exclude prefer_not_to_answer from estimate
handle open-ended ranges
show limitation
label estimated
never label revenue
```

---

## Top Attraction

Recommended formula:

```text
attraction with highest visit count in selected filters
```

Tie handling should be documented or stable.

---

# Dashboard Modules

---

## Executive Dashboard

Must include:

```text
KPI cards
visit trend
visits by province
top attractions
funnel summary
satisfaction summary
expense summary
planning insight cards
```

---

## Tourist Profile Dashboard

Metrics:

```text
domestic vs foreign
origin country distribution
Thai origin province distribution
age group distribution
preferred language distribution
profile data completeness
returning profile summary
```

Rules:

```text
unknown origin is not guessed
date filters apply through visits
no identities exposed
```

---

## Travel Behavior Dashboard

Metrics:

```text
travel companion distribution
group size distribution
average group size
transport mode distribution
travel purpose distribution
same-day vs overnight
average nights
behavior by attraction/province
```

Rules:

```text
missing group size not 0
missing nights not 0 unless known same-day
show response counts
```

---

## Expense Dashboard

Metrics:

```text
expense response count
spending range distribution
estimated min/max
expense category distribution
spending by province
spending by attraction
expense vs overnight if useful
```

Rules:

```text
estimated, not revenue
range-based limitation shown
open-ended range handled
prefer_not_to_answer handled
```

---

## Satisfaction Dashboard

Metrics:

```text
survey response count
average satisfaction
satisfaction by province
satisfaction by attraction
revisit intention rate
recommendation intention rate
low satisfaction alerts
top rated attractions
lowest rated attractions
```

Rules:

```text
null excluded
response count shown
raw comments hidden by default
small sample warning
```

---

## Funnel Dashboard

Stages:

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

Metrics:

```text
stage count
conversion from previous stage
drop-off from previous stage
largest drop-off
funnel by attraction
funnel by photo spot
funnel trend
```

Rules:

```text
zero denominator = No data
event count not unique people unless deduped
QR scans are not visits
```

---

## Sustainable Tourism Dashboard

Possible indicators:

```text
attraction concentration
high visit / low satisfaction
low visit / high satisfaction
overnight opportunity
local economic opportunity
data quality
survey confidence
promotion opportunity
improvement priority
```

Insight card should include:

```text
finding
evidence metric
suggested action
confidence/limitation
```

Avoid overclaiming official tourism impact.

---

# Data Quality

---

## Required Data Quality Indicators

Recommended:

```text
survey response count
survey completion rate
unknown origin count
unknown age group count
expense response count
satisfaction response count
photo upload completion rate
certificate conversion rate
small sample warning
```

---

## Unknown and Not Answered

Handle separately where useful:

```text
unknown
not_answered
prefer_not_to_answer
null
```

Do not silently drop missing categories unless documented.

---

# Dashboard UI Rules

---

## KPI Cards

KPI cards should show:

```text
label
value
unit
change/trend if available and meaningful
tooltip/definition
No data state
loading state
```

Do not show fake 0 for missing data.

---

## Charts

Charts must have:

```text
clear title
legend
axis labels where needed
tooltip
empty state
mobile layout
non-color-only meaning where possible
```

---

## Tables

Tables must have:

```text
clear columns
rank/order
bounded row count
pagination or top-N limit
empty state
export if allowed
```

---

## Tooltips and Definitions

Tooltips should define:

```text
Tourist Profiles
Total Visits
QR Scans
Estimated Spending
Survey Completion Rate
Average Satisfaction
Conversion Rate
Drop-off Rate
```

---

# Export from Dashboard

Dashboard export should:

```text
require permission
respect filters
export aggregated data where possible
exclude private identifiers
create audit log
preserve Thai text
include clear headers
```

Do not export raw personal data by default.

---

# Performance

---

## Query Performance

Dashboard queries must:

```text
apply date filters
use indexes
aggregate server-side
avoid raw row fetch to frontend
limit ranked lists
handle empty data quickly
```

Recommended indexes:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
satisfaction_surveys(visit_id)
visit_expenses(visit_id)
certificates(visit_id)
tourist_stamps(tourist_id, attraction_id)
```

---

## Summary Tables Future

For larger datasets, plan:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
materialized views
scheduled refresh
```

Summary tables must not include personal identifiers.

---

# Testing

---

## Unit Tests

Test formulas:

```text
average satisfaction
survey completion rate
funnel conversion
funnel drop-off
estimated spending range
open-ended spending range
planning quadrant
zero denominator
null handling
```

---

## Integration Tests

Test dashboard services with known seed data:

```text
executive KPIs
profile distribution
travel behavior metrics
expense metrics
satisfaction metrics
funnel metrics
sustainable insight classification
filters
privacy of response
```

---

## Manual QA

Check:

```text
dashboard loads with data
dashboard loads with no data
filters work
KPI values match seed data
charts readable
No data states clear
tooltips explain metrics
no private identifiers visible
export respects filters
```

---

# Review Checklist

Before accepting dashboard work:

```text
[ ] Metrics match dictionary.
[ ] Filters validated server-side.
[ ] Metrics calculated server-side.
[ ] Response aggregated.
[ ] No private identifiers returned.
[ ] Null/zero rules correct.
[ ] Response counts included.
[ ] Estimated spending labeled estimated.
[ ] QR scans separate from visits.
[ ] Tooltips/limitations included.
[ ] Tests cover formulas.
[ ] Performance acceptable.
```

---

## Critical Dashboard Blockers

Block if:

```text
QR scans counted as visits
Tourist Profiles labeled verified unique people
Estimated Spending labeled revenue
null satisfaction treated as 0
zero denominator shown misleadingly
dashboard exposes email/LINE/provider_user_id
dashboard fetches all raw personal rows
dashboard API lacks permission check
export leaks identifiers
```

---

# Dashboard Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Build/fix/refactor dashboard metric or section.]

Context:
Dashboard metrics support tourism planning and must be correct, explainable, privacy-safe, and filterable.

Read first:
- .codex/skills/dashboard-analytics/SKILL.md
- docs/dashboard/DASHBOARD_REQUIREMENTS.md
- docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
- docs/dashboard/[RELEVANT_DASHBOARD_DOC].md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/DASHBOARD_CHECKLIST.md

Requirements:
- Calculate metric server-side.
- Validate filters.
- Return aggregated response only.
- Add UI loading/empty/error states if frontend involved.
- Add tooltip/definition text.
- Add unit/integration tests where practical.

Critical:
- QR scans are not visits.
- Estimated spending is not revenue.
- Missing satisfaction is not 0.
- Tourist Profiles are not verified unique people.
- No private identifiers in response.

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

# Output Format

When completing dashboard work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

Metric notes
- formula
- denominator
- null/zero behavior
- filters

Privacy notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

Dashboard numbers must be trustworthy and explainable.

If a metric cannot be defined, tested, and interpreted clearly, do not present it as a decision-making metric.
