# EXECUTIVE_DASHBOARD.md

## 1. Document Purpose

This document defines the Executive Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

The Executive Dashboard is the first dashboard view for administrators, instructors, researchers, and tourism planners. The current rollout focuses on Yala while the data model and filters remain ready for Pattani and Narathiwat when those provinces are activated.

The dashboard must provide a high-level view without misleading users about what the data represents.

---

## 2. Dashboard Mission

The Executive Dashboard mission is:

```text
Show the overall health, participation, engagement, and planning value of the tourism data platform.
```

It should answer:

```text
How much activity is happening?
Which provinces and attractions are performing well?
Are tourists completing the QR-to-certificate flow?
Are tourists answering the optional survey?
What is the overall satisfaction level?
What is the estimated spending range?
Which attractions need attention?
```

Required interpretation rules:

- Use `Tourist Profiles`, not verified unique people.
- QR Scans are funnel events, not Visits.
- Estimated Spending is not Revenue.
- Missing Satisfaction is `No data`, not `0`.
- Certificate, stamp, sharing, and survey counts are engagement metrics, not official tourist arrivals.
- All executive metrics must be aggregated and privacy-safe.

---

## 3. Dashboard Audience

Primary users:

```text
admin
super admin
tourism planner
researcher
instructor/project evaluator
```

Secondary users:

```text
tourism staff
local agency staff
future dashboard viewers
```

---

## 4. Route

Recommended route:

```text
/admin/dashboard
```

or if using separate pages:

```text
/admin/dashboard/executive
```

MVP recommendation:

```text
Use /admin/dashboard as the Executive Dashboard first.
```

---

## 5. Required Permissions

Required permission:

```text
dashboard.read
```

Export actions require:

```text
export.create
```

Sensitive export actions may require:

```text
export.visit_records
export.survey_data
export.expense_data
```

---

## 6. Page Structure

Recommended structure:

```text
Page Header
Compact Global Filter Bar
Four Executive KPI Cards
Visit Trend and Decision Support Summary
Engagement Funnel and Attraction Performance Matrix
Data Coverage and Quality Strip
Export Actions
```

### 6.1 Current visual system

- Thai-first operational interface with near-black text, white surfaces, and brand orange for active states and priority actions.
- Panels use a restrained `4-8px` corner radius with clear borders. Chart lines and progress bars may use rounded ends for legibility, without turning controls into decorative capsules.
- Data source and methodology remain available in a compact footer disclosure instead of occupying the first viewport.
- Filters are URL-driven, visible as one compact command row on desktop, and collapsed behind an explicit mobile control. Their summary exposes the selected date range and active-filter count.
- The executive band contains exactly four KPIs: tourist profiles, visits, generated certificates, and survey completion. Detailed metrics stay in their dedicated tabs.
- A visit sparkline must never be presented as the trend of tourist profiles or certificates.
- The main cockpit pairs visit trend with existing decision-support insights, then compares the QR-to-certificate-to-survey funnel with an attraction performance matrix in the same row.
- The attraction matrix uses recorded visits on the horizontal axis and valid satisfaction scores on the vertical axis. On mobile, it becomes a ranked summary so labels remain readable.
- The quality strip shows survey coverage, expense completeness, average satisfaction, and processing time without inventing period comparisons.
- The visit-trend subtitle must state that the metric counts successfully recorded `visits`; it is neither public page views nor QR scan events.
- Shared bar, donut, and stacked-distribution components use the same coral, deep-teal, muted-gold, green, and slate visual vocabulary across detailed dashboard pages without changing metric formulas.
- Interactive line, bar, donut, funnel, scatter, and research-construct charts use the existing `Recharts` dependency with animation disabled for stable reporting. Every chart keeps a text legend, detail list, or table equivalent and must not expose privacy-suppressed values.
- The public evidence dashboard and attraction-level analytics use the same chart engine. Suppressed public cells remain in qualified tables where permitted but are never represented by placeholder bars, points, or inferred values.
- Province comparison is omitted from the executive view while Yala is the only active rollout province; a one-bar comparison would imply analytical value that is not present. Province analysis remains available when multi-province data is activated.
- Charts retain a readable table view so reviewers can validate values and assistive technology can access the same data.
- Desktop layouts prioritize comparison; mobile layouts stack without horizontal page overflow while tabs remain horizontally scrollable.

---

## 7. Page Header

## 7.1 Title

English:

```text
Tourism Intelligence Dashboard
```

Thai:

```text
แดชบอร์ดวิเคราะห์การท่องเที่ยว
```

## 7.2 Description

English:

```text
Overview of tourist participation, visits, certificates, satisfaction, spending, and QR flow performance.
```

Thai:

```text
ภาพรวมการมีส่วนร่วมของนักท่องเที่ยว การเยี่ยมชม ใบประกาศ ความพึงพอใจ ค่าใช้จ่าย และประสิทธิภาพของ QR Flow
```

## 7.3 Header Actions

Recommended:

```text
Refresh
Export Summary
View Detailed Reports
```

MVP:

```text
Export Summary CSV
```

---

## 8. Global Filters

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
completion status
```

## 8.3 Default Filter

Recommended:

```text
current month
```

Alternative:

```text
last 30 days
```

The selected date range must be visible.

Example:

```text
Showing data from 1 May 2026 to 31 May 2026
```

## 8.4 Filter Behavior

Rules:

- update URL query parameters
- reload all dashboard metrics
- show loading state per section
- preserve filter state on refresh
- allow reset/clear filters

---

## 9. Data Freshness Note

Display:

```text
Data source: Live database
Last updated: [timestamp]
```

If using summary tables later:

```text
Data source: Dashboard summary table
Last refreshed: [timestamp]
```

This builds trust and avoids confusion.

---

# Executive KPI Cards

---

## 10. Required KPI Cards

MVP KPI cards:

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

Optional KPI cards:

```text
QR Scans
Certificate Conversion Rate
Photo Upload Rate
Returning Tourist Profiles
Passport Save Rate
```

---

## 11. KPI Card: Tourist Profiles

## 11.1 Metric Key

```text
tourist_profile_count
```

## 11.2 Meaning

Number of tourist profiles associated with visits in the selected filter range.

## 11.3 Calculation

```sql
count(distinct visits.tourist_id)
```

## 11.4 Display

Example:

```text
1,245
Tourist Profiles
```

## 11.5 Tooltip

```text
Number of tourist profiles linked to recorded visits. Guest profiles may not equal unique real-world people.
```

## 11.6 Warning

Do not label as:

```text
Unique Tourists
```

---

## 12. KPI Card: Total Visits

## 12.1 Metric Key

```text
visit_count
```

## 12.2 Meaning

Number of visit records created in the selected filter range.

## 12.3 Calculation

```sql
count(visits.visit_id)
```

## 12.4 Tooltip

```text
Recorded visits from tourists who completed the minimum visit/profile step. QR scans are not counted as visits.
```

---

## 13. KPI Card: Certificates Generated

## 13.1 Metric Key

```text
certificate_count
```

## 13.2 Meaning

Number of digital certificates generated.

## 13.3 Calculation

```sql
count(certificates.certificate_id)
```

joined through visits for filters.

## 13.4 Tooltip

```text
Certificates generated after a tourist completed profile and photo upload steps.
```

---

## 14. KPI Card: Stamps Earned

## 14.1 Metric Key

```text
stamp_count
```

## 14.2 Meaning

Number of digital stamps earned.

## 14.3 Calculation

```sql
count(tourist_stamps.stamp_id)
```

## 14.4 Tooltip

```text
Digital stamps earned by tourist profiles. A tourist can usually earn one stamp per attraction.
```

---

## 15. KPI Card: Survey Completion Rate

## 15.1 Metric Key

```text
survey_completion_rate
```

## 15.2 Meaning

Percentage of certificate-generating visits that completed the optional survey.

## 15.3 Calculation

```text
completed_survey_count / certificate_count
```

## 15.4 Zero Denominator Rule

If certificate count is 0:

```text
return null
display No data
```

## 15.5 Tooltip

```text
Completed surveys divided by generated certificates. Survey is optional.
```

---

## 16. KPI Card: Average Satisfaction

## 16.1 Metric Key

```text
average_satisfaction
```

## 16.2 Meaning

Average overall satisfaction score from completed surveys.

## 16.3 Calculation

```sql
avg(satisfaction_surveys.overall_score)
```

Only non-null scores.

## 16.4 Display

```text
4.3 / 5
```

## 16.5 Empty State

```text
No data
```

if no valid scores.

## 16.6 Tooltip

```text
Average overall satisfaction from submitted surveys. Missing responses are excluded.
```

---

## 17. KPI Card: Estimated Spending

## 17.1 Metric Key

```text
estimated_spending_range
```

## 17.2 Meaning

Estimated spending based on self-reported spending ranges.

## 17.3 Calculation

```text
sum(amount_min) to sum(amount_max)
```

## 17.4 Display

```text
Estimated ฿120,000 - ฿250,000
```

## 17.5 Tooltip

```text
Self-reported spending range estimate. This is not verified revenue.
```

## 17.6 Rule

Never label this as revenue.

---

## 18. KPI Card: Top Attraction

## 18.1 Metric Key

```text
top_attraction_by_visits
```

## 18.2 Meaning

Attraction with the highest visit count in selected filters.

## 18.3 Calculation

```sql
count(visits.visit_id)
group by attraction
order by count desc
limit 1
```

## 18.4 Display

```text
Aiyerweng Skywalk
456 visits
```

## 18.5 Tooltip

```text
Attraction with the highest recorded visit count in the selected filters.
```

---

# Main Sections

---

## 19. Visit Trend Section

## 19.1 Purpose

Show platform participation over time.

## 19.2 Chart

Recommended:

```text
line chart
```

## 19.3 Metric

```text
visit_trend
```

## 19.4 Data Grouping

Suggested grouping:

```text
daily for date range <= 60 days
weekly for date range <= 180 days
monthly for longer ranges
```

## 19.5 Required Labels

```text
X-axis: Date
Y-axis: Visits
```

## 19.6 Empty State

```text
No visits in the selected date range.
```

## 19.7 Planning Use

Helps identify:

```text
campaign effects
seasonal changes
QR rollout impact
tourism activity patterns
```

---

## 20. Province Comparison Section

## 20.1 Purpose

Compare participation across Yala, Pattani, and Narathiwat.

## 20.2 Chart

Recommended:

```text
bar chart
```

## 20.3 Metric

```text
visits_by_province
```

## 20.4 Data

```text
province_name
visit_count
certificate_count optional
average_satisfaction optional
```

## 20.5 Planning Use

Helps answer:

```text
Which provinces have more platform activity?
Where may QR placement or promotion need improvement?
```

## 20.6 Limitation Note

```text
This reflects platform participation, not official total arrivals.
```

---

## 21. Top Attractions Section

## 21.1 Purpose

Identify attractions with high participation.

## 21.2 Recommended UI

```text
ranked table
horizontal bar chart
```

## 21.3 Columns

```text
rank
attraction_name
province_name
visit_count
certificate_count
average_satisfaction
survey_response_count
```

## 21.4 Default Limit

```text
Top 10
```

## 21.5 Planning Use

Helps answer:

```text
Which attractions attract participation?
Which attractions should be used as flagship locations?
Which attractions need further analysis?
```

---

## 22. Engagement Funnel Summary

## 22.1 Purpose

Show conversion from QR scan to certificate and survey.

## 22.2 Required Stages

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
survey_completed
passport_saved
```

## 22.3 Recommended UI

```text
funnel chart
stage table
conversion badges
```

## 22.4 Columns

```text
stage
count
conversion_from_previous
dropoff_from_previous
```

## 22.5 Planning Use

Helps answer:

```text
Where do tourists drop out?
Is the profile form too long?
Is photo upload difficult?
Is the survey shown at the right time?
```

---

## 23. Satisfaction and Spending Summary

## 23.1 Purpose

Show early quality and economic signals.

## 23.2 Components

```text
Average Satisfaction KPI
Satisfaction by Province mini chart
Estimated Spending Range KPI
Spending Range Distribution mini chart
```

## 23.3 Rules

- satisfaction missing values are not zero
- spending is estimated
- small sample size should be shown

## 23.4 Planning Use

Helps answer:

```text
Are tourists satisfied?
Which provinces/attractions show quality issues?
What spending range is reported?
```

---

## 24. Planning Insight Cards

## 24.1 Purpose

Turn raw metrics into planning-oriented signals.

## 24.2 Recommended Cards

```text
Improvement Priority
Promotion Opportunity
High Participation Area
Low Survey Completion Alert
Spending Opportunity
```

## 24.3 Example: Improvement Priority

Condition:

```text
high visits + low satisfaction
```

Display:

```text
High participation but lower satisfaction. Review visitor experience and services.
```

## 24.4 Example: Promotion Opportunity

Condition:

```text
low visits + high satisfaction
```

Display:

```text
Visitors rate this attraction highly, but participation is low. Consider promotion or route packaging.
```

## 24.5 Rule

Insight cards must be based on documented formulas or clearly labeled as heuristic.

---

## 25. Export Actions

## 25.1 Required MVP Export

```text
Export Dashboard Summary CSV
```

## 25.2 Optional Exports

```text
Export Visit Records CSV
Export Satisfaction CSV
Export Expense CSV
Export Funnel Summary CSV
```

## 25.3 Permission

Export requires:

```text
export.create
```

or more specific permission.

## 25.4 Audit

Every export must create audit log.

---

## 26. Empty States

Required empty states:

## 26.1 No Dashboard Data

```text
No data available for the selected filters.
Try changing the date range, province, or attraction.
```

## 26.2 No Satisfaction Data

```text
No satisfaction responses yet.
Average satisfaction will appear after tourists answer the optional survey.
```

## 26.3 No Expense Data

```text
No expense data yet.
Spending analysis will appear after tourists submit expense information.
```

## 26.4 No Funnel Data

```text
No funnel events recorded yet.
Funnel analytics will appear after QR activity starts.
```

---

## 27. Loading States

Use:

```text
KPI skeleton cards
chart skeletons
table row skeletons
export button loading state
```

Button loading examples:

```text
Exporting...
Refreshing...
```

---

## 28. Error States

## 28.1 Page-Level Error

```text
Could not load dashboard data. Please try again.
```

## 28.2 Section-Level Error

```text
Could not load visit trend.
Could not load satisfaction metrics.
Could not load funnel analytics.
```

Other sections should remain visible when possible.

---

## 29. Accessibility Requirements

The Executive Dashboard must support:

```text
keyboard accessible filters
readable KPI labels
chart titles
chart summaries
table alternatives for major chart data
color not the only meaning
loading/error text
```

---

## 30. Performance Requirements

## 30.1 MVP

Use backend aggregation with indexed queries.

Do not load all raw visits into frontend.

## 30.2 Production

Use:

```text
summary tables
materialized views
dashboard cache
scheduled refresh
```

for heavier metrics.

---

## 31. Backend Services

Executive Dashboard should use:

```text
DashboardService.getExecutiveMetrics
DashboardService.getVisitTrend
DashboardService.getVisitsByProvince
DashboardService.getVisitsByAttraction
DashboardService.getFunnelMetrics
DashboardService.getSatisfactionMetrics
DashboardService.getExpenseMetrics
DashboardService.getSustainableTourismIndicators optional
```

---

## 32. Data Limitations to Display

Some limitation notes should be visible or accessible via tooltip:

```text
Local platform visits are participation records, not official tourist arrivals.
Tourist profiles may not equal unique real people.
Estimated spending is self-reported and range-based.
Average satisfaction includes only survey respondents.
QR scans are not counted as visits.
```

---

## 33. Testing Checklist

Test:

```text
no data
current month data
date range filter
province filter
attraction filter
zero certificates
zero surveys
missing satisfaction
missing expense
repeat tourist visits
duplicate stamp rule
funnel zero denominator
export permission denied
export success
large result set
dashboard section error
mobile/tablet layout
```

---

## 34. MVP Acceptance Checklist

```text
[ ] Executive dashboard route exists.
[ ] Dashboard route is protected.
[ ] Global filters exist.
[ ] KPI cards use backend metrics.
[ ] Tourist profile count is not labeled unique people.
[ ] Visit count does not include QR scans.
[ ] Certificate count works.
[ ] Stamp count works.
[ ] Survey completion rate handles zero denominator.
[ ] Average satisfaction ignores null values.
[ ] Estimated spending is labeled as estimated.
[ ] Visit trend chart exists.
[ ] Visits by province chart exists.
[ ] Top attractions table exists.
[ ] Funnel summary exists.
[ ] Loading states exist.
[ ] Empty states exist.
[ ] Error states exist.
[ ] Export summary action exists or is planned.
[ ] No private identifiers are shown.
```

---

## 35. Do Not Do

Do not:

```text
Count QR scans as visits.
Call tourist profiles unique people.
Call estimated spending revenue.
Show missing satisfaction as 0.
Show email or LINE ID.
Aggregate all data in frontend.
Hide data limitations.
Build decorative charts without planning purpose.
Export data without permission.
```

---

## 36. Future Enhancements

Possible future improvements:

```text
AI-generated executive insights
PDF executive report
monthly dashboard snapshot
official data comparison
map-based executive view
campaign comparison
province benchmark view
public-safe summary view
```

---

## 37. Final Executive Dashboard Rule

The Executive Dashboard must give decision-makers a truthful high-level view.

It should be simple enough to understand quickly and rigorous enough to support planning.
# EXECUTIVE_DASHBOARD.md
