# DASHBOARD_METRICS_DICTIONARY.md

## 1. Document Purpose

This document defines dashboard metrics for the **Southern Border Tourism Data & Intelligence Platform**.

Every metric used in dashboard cards, charts, reports, exports, or academic analysis should be defined here before implementation.

This prevents confusion between:

```text
QR scans
visits
tourist profiles
certificates
stamps
surveys
official tourist statistics
```

---

## 2. Metric Dictionary Rules

Every metric should define:

```text
metric_key
display_name
business_meaning
source_tables
calculation
filters
display_format
limitations
owner/service
```

Dashboard services and export services should use this document as the source of metric meaning.

---

## 3. Global Definitions

## 3.1 Local Platform Data

Data collected through this platform, including:

```text
QR scans
tourist profile submissions
visit records
photo uploads
certificate generation
digital stamps
survey answers
expense ranges
satisfaction scores
```

## 3.2 Official Tourism Data

Data imported from official or external sources.

Important:

```text
Local platform data is not the same as official tourism statistics.
```

## 3.3 Visit

A `visit` is a record created when a tourist completes the minimal profile/visit step for an attraction.

It is not the same as QR scan.

## 3.4 Tourist Profile

A tourist profile is a system profile.

It may represent:

```text
guest device user
Google-linked user
LINE-linked user
email-linked user future
```

It is not guaranteed to be a unique real-world person.

## 3.5 Certificate

A certificate is a generated digital travel memory linked to a visit.

## 3.6 Stamp

A stamp is a collectible digital record usually unique per tourist per attraction.

A tourist can visit the same attraction multiple times but usually earns one stamp for that attraction.

## 3.7 Request-Level Data Source Contract

All populated metrics returned by one dashboard request must use one declared data source contract.

Current production contract:

```text
source = live_database
generated_at = server response time
summary_refresh_timestamp = null
```

`dashboard_daily_summary` remains available for refresh and operational inspection, but it must not be mixed into a live response until it supports the same dimensions, filters, and metric formulas as the complete dashboard view model. A stale or partially populated summary must never replace individual widgets inside an otherwise live response.

When pre-aggregated mode is enabled in the future, every populated metric in that response must come from the same refresh snapshot and `summary_refresh_timestamp` must be the actual refresh time used.

## 3.8 Filter Contract

Visit, certificate, stamp, survey, and expense metrics apply destination and tourist-profile filters through the associated `visits` record. Transport and travel-purpose filters use `visits.transport_mode_id` and `visits.travel_purpose_id` consistently.

Funnel stages before visit creation cannot be attributed safely to origin, age, transport, travel purpose, or satisfaction. With any of those filters active:

```text
funnel counts = unavailable for that request
QR scan and landing KPI counts = unavailable for that request
```

The service must not return unfiltered funnel counts beside filtered visit metrics.

## 3.9 Minimum Sample Contract

Default analytical threshold:

```text
minimum_sample_size = 30
```

The threshold applies before creating warning or critical classifications from:

```text
satisfaction averages and dimensions
revisit and recommendation intention
funnel drop-off
survey completion
expense patterns
sustainable tourism insight classifications
```

Values below the threshold may still be displayed as descriptive data with the response count, but must be marked as limited evidence and must not generate warning or critical claims.

## 3.10 Zero-Denominator Contract

Rates use `null` when the denominator is zero. This applies to survey completion, intention rates, and funnel conversion/drop-off. The UI must display `No data`, not `0%`, when no denominator exists.

---

## 4. Metric Format Standards

## 4.1 Count

Display:

```text
1,250
```

## 4.2 Percentage

Store/calculation:

```text
0.75
```

Display:

```text
75%
```

## 4.3 Rating

Display:

```text
4.3 / 5
```

## 4.4 Currency / Spending

Display:

```text
Estimated ฿10,000 - ฿25,000
```

Must include:

```text
Estimated
```

## 4.5 No Data

Use:

```text
No data
```

when denominator is zero or no valid responses exist.

Do not show misleading 0.

---

## 5. Common Filter Rules

## 5.1 Attraction Intelligence Scope (Phase 22)

The attraction workspace requires one `attraction_id` and uses `visits.visit_date` for its reporting period.

Default evidence scope:

```text
include = operational visits without a research session
include = final_collection + field_observation
exclude = pilot study records
exclude = pilot_internal
exclude = simulated_usability
```

An administrator may explicitly select pilot or simulated data for QA, but the interface and export must label that scope and must not present it as a field-tourism claim.

| Metric key | Unit | Denominator | Source | Missing-data rule | Decision use |
| --- | --- | --- | --- | --- | --- |
| `attraction_unique_tourists` | system profile | none | `visits.tourist_id` | deduplicate only within selected scope | approximate distinct platform users, not verified persons |
| `attraction_visits` | visit record | none | `visits` | exclude rows outside evidence scope | observed platform activity at the attraction |
| `attraction_repeat_visits` | visit record | selected unique profiles | `visits` | visits minus unique profiles, minimum zero | monitor repeat activity without claiming loyalty causation |
| `attraction_certificate_visits` | visit record | selected visits | `certificates.visit_id` | count a visit once when one or more certificates exist | reward-flow completion |
| `attraction_stamp_visits` | visit record | selected visits | `tourist_stamps.visit_id` | count only `earned` stamps and a visit once | passport engagement |
| `attraction_survey_rate` | percentage | selected visits | `satisfaction_surveys`, `visits` | `null` when visits = 0 | feedback coverage, not satisfaction quality |
| `attraction_satisfaction_*` | mean score 1-5 | non-null responses for that dimension | `satisfaction_surveys` | do not replace null with zero; suppress mean when `n < 10` | identify dimensions for reviewed improvement evidence |
| `attraction_expense_range` | response category | expense responses | `visit_expenses`, `spending_ranges` | exclude unanswered values; suppress small categories | describe self-reported spending patterns, never business revenue |
| `attraction_funnel_*` | unique visit/session | previous attributable stage | `funnel_events`, operational tables | entry stage is unavailable when it cannot be linked to an included visit | locate workflow friction without inflating event retries |

Campaign filtering uses `checkin_codes.campaign_id`. Entry-channel filtering uses `visits.entry_channel`; records remain `unknown` when evidence does not support QR, NFC, direct, or import attribution. Phase 22 does not trust a client form field for channel attribution; Phase 23 must add a server-verifiable entry contract before QR/NFC labels are populated.

All segmented distributions suppress categories below `n=10`. Each satisfaction dimension keeps an independent denominator. Peer comparison is unavailable when campaign, check-in point, or entry-channel filters make the peer scope non-comparable.

Most metrics should support:

```text
start_date
end_date
province_id
attraction_id
```

Optional filters:

```text
origin_country_id
origin_province_id
age_group
transport_mode_id
travel_purpose_id
completion_status
```

Date field must be specified per metric.

## 5.1 Phase 09 Implementation Notes

The MVP dashboard implementation uses:

```text
Route: /admin/dashboard
Permission: dashboard.read
Filter validation: server-side Zod schema
Data source: live Supabase PostgreSQL tables
Aggregation: server-side repository/service layer
Response shape: aggregated privacy-safe DTO
```

Schema alignment:

- `funnel_events.event_type` is the implemented event column, even where older docs use `event_name`.
- `satisfaction_surveys.submitted_at` remains the initial-schema/default timestamp, while `completed_at` is the preferred survey completion timestamp added by the schema hardening migration.
- Current satisfaction dimension fields include nullable `overall_score`, `facility_score`, `safety_score`, `cleanliness_score`, `accessibility_score`, `information_score`, and `value_score`; `facility_score` is included in the satisfaction averages and response counts when answered.
- Spending estimates use `visit_expenses.spending_range_id -> spending_ranges.min_value/max_value` when range data exists.
- The dashboard does not expose `tourist_id`, `visit_id`, provider identifiers, guest tokens, private photo paths, certificate paths, or raw comments.

Future optimization:

- Move heavy aggregations to summary tables/materialized views when real data volume grows.

---

# Executive Metrics

---

## 6. tourist_profile_count

## 6.1 Display Name

```text
Tourist Profiles
```

## 6.2 Business Meaning

Number of tourist profiles associated with visits in the selected filters.

This indicates participation reach, but it is not guaranteed to be unique real people.

Use the label `Tourist Profiles`, not `Verified Unique Tourists`, `Official Tourist Count`, or `Total Travelers`.

## 6.3 Source Tables

```text
visits
tourists
attractions
```

## 6.4 Calculation

For visit-filtered dashboard:

```sql
count(distinct visits.tourist_id)
```

## 6.5 Date Field

```text
visits.visit_date
```

## 6.6 Filters

```text
date range
province
attraction
origin
age group
```

## 6.7 Display Format

```text
count
```

## 6.8 Limitations

```text
Guest profiles may be duplicated across devices.
One real person may have multiple profiles.
Do not call this unique people.
```

## 6.9 Service

```text
DashboardService.getExecutiveMetrics
```

---

## 7. visit_count

## 7.1 Display Name

```text
Total Visits
```

## 7.2 Business Meaning

Number of recorded visit records in the selected filters.

## 7.3 Source Tables

```text
visits
attractions
```

## 7.4 Calculation

```sql
count(visits.visit_id)
```

## 7.5 Date Field

```text
visits.visit_date
```

## 7.6 Filters

```text
date range
province
attraction
completion status
origin
age group
```

## 7.7 Display Format

```text
count
```

## 7.8 Limitations

```text
This is platform-recorded participation, not official total tourist arrivals.
QR scans are not counted as visits.
A tourist may have multiple visits.
```

## 7.9 Service

```text
DashboardService.getExecutiveMetrics
DashboardService.getVisitsByProvince
DashboardService.getVisitsByAttraction
```

---

## 8. qr_scan_count

## 8.1 Display Name

```text
QR Scans
```

## 8.2 Business Meaning

Number of QR scan events recorded by the platform.

## 8.3 Source Tables

```text
funnel_events
```

## 8.4 Calculation

```sql
count(funnel_events.event_id)
where event_name = 'qr_scanned'
```

## 8.5 Date Field

```text
funnel_events.event_time
```

## 8.6 Filters

```text
date range
province
attraction
photo spot
check-in code
```

## 8.7 Display Format

```text
count
```

## 8.8 Limitations

```text
QR scans are not visits.
One person may scan multiple times.
Some scans may not continue to profile/certificate.
```

## 8.9 Service

```text
DashboardService.getFunnelMetrics
```

---

## 9. certificate_count

## 9.1 Display Name

```text
Certificates Generated
```

## 9.2 Business Meaning

Number of certificates generated by tourists.

This indicates completed core engagement.

## 9.3 Source Tables

```text
certificates
visits
attractions
```

## 9.4 Calculation

```sql
count(certificates.certificate_id)
```

Join through visits to apply attraction/province filters.

## 9.5 Date Field

Recommended for dashboard consistency:

```text
visits.visit_date
```

Alternative trend:

```text
certificates.generated_at
```

The selected dashboard must state which one it uses.

## 9.6 Filters

```text
date range
province
attraction
```

## 9.7 Display Format

```text
count
```

## 9.8 Limitations

```text
Certificate count is not tourist count.
One visit should normally have one generated certificate.
```

## 9.9 Service

```text
DashboardService.getExecutiveMetrics
```

---

## 10. stamp_count

## 10.1 Display Name

```text
Stamps Earned
```

## 10.2 Business Meaning

Number of digital stamps earned.

## 10.3 Source Tables

```text
tourist_stamps
attractions
visits optional
```

## 10.4 Calculation

```sql
count(tourist_stamps.stamp_id)
```

## 10.5 Date Field

Use:

```text
tourist_stamps.earned_at
```

or join through visit if stamp stores source visit.

MVP should use:

```text
tourist_stamps.earned_at
```

## 10.6 Filters

```text
date range
province
attraction
```

## 10.7 Display Format

```text
count
```

## 10.8 Limitations

```text
A tourist may visit the same attraction multiple times but earn only one stamp.
Stamp count is not visit count.
```

## 10.9 Service

```text
DashboardService.getExecutiveMetrics
```

---

## 11. survey_completion_rate

## 11.1 Display Name

```text
Survey Completion Rate
```

## 11.2 Business Meaning

Percentage of certificate-generating visits that also completed the optional survey.

## 11.3 Source Tables

```text
certificates
satisfaction_surveys
visits
```

## 11.4 Calculation

```text
completed_survey_count / certificate_count
```

Where:

```text
completed_survey_count = count(satisfaction_surveys.satisfaction_id)
certificate_count = count(certificates.certificate_id)
```

## 11.5 Date Field

Recommended:

```text
visits.visit_date
```

## 11.6 Filters

```text
date range
province
attraction
```

## 11.7 Display Format

```text
percentage
```

## 11.8 Zero Denominator Rule

If certificate_count = 0:

```text
return null
display No data
```

## 11.9 Limitations

```text
Survey is optional.
Low rate may indicate survey timing, length, or incentive issue.
```

## 11.10 Service

```text
DashboardService.getExecutiveMetrics
DashboardService.getFunnelMetrics
```

---

## 12. average_satisfaction

## 12.1 Display Name

```text
Average Satisfaction
```

## 12.2 Business Meaning

Average overall satisfaction score from submitted surveys.

## 12.3 Source Tables

```text
satisfaction_surveys
visits
attractions
```

## 12.4 Calculation

```sql
avg(satisfaction_surveys.overall_score)
```

Only include non-null scores.

## 12.5 Date Field

Recommended:

```text
visits.visit_date
```

or for survey trend:

```text
satisfaction_surveys.completed_at
```

## 12.6 Filters

```text
date range
province
attraction
```

## 12.7 Display Format

```text
rating out of 5
```

Example:

```text
4.3 / 5
```

## 12.8 Missing Data Rule

If no valid scores:

```text
return null
display No data
```

Do not show 0.

## 12.9 Limitations

```text
Only includes tourists who answered survey.
Missing answers are excluded.
```

## 12.10 Service

```text
DashboardService.getSatisfactionMetrics
DashboardService.getExecutiveMetrics
```

---

## 13. estimated_spending_range

## 13.1 Display Name

```text
Estimated Spending
```

## 13.2 Business Meaning

Estimated total tourist spending range based on self-reported spending range answers.

## 13.3 Source Tables

```text
visit_expenses
visits
attractions
```

## 13.4 Calculation

```text
sum(amount_min) to sum(amount_max)
```

If amount_max is null for open-ended ranges, return open-ended indicator.

## 13.5 Date Field

```text
visits.visit_date
```

## 13.6 Filters

```text
date range
province
attraction
expense category
```

## 13.7 Display Format

```text
Estimated ฿min - ฿max
```

## 13.8 Limitations

```text
This is self-reported range-based estimate.
It is not verified revenue.
Do not call it revenue.
```

## 13.9 Service

```text
DashboardService.getExpenseMetrics
DashboardService.getExecutiveMetrics
```

---

# Visit and Attraction Metrics

---

## 14. visits_by_province

## 14.1 Display Name

```text
Visits by Province
```

## 14.2 Business Meaning

Shows platform-recorded visits grouped by province.

## 14.3 Source Tables

```text
visits
attractions
provinces
```

## 14.4 Calculation

```sql
count(visits.visit_id)
group by attractions.province_id
```

## 14.5 Date Field

```text
visits.visit_date
```

## 14.6 Display Format

```text
bar chart
table
```

## 14.7 Limitations

```text
This measures platform participation, not official tourist arrivals.
```

## 14.8 Service

```text
DashboardService.getVisitsByProvince
```

---

## 15. visits_by_attraction

## 15.1 Display Name

```text
Visits by Attraction
```

## 15.2 Business Meaning

Shows recorded visits grouped by attraction.

## 15.3 Source Tables

```text
visits
attractions
provinces
```

## 15.4 Calculation

```sql
count(visits.visit_id)
group by visits.attraction_id
```

## 15.5 Date Field

```text
visits.visit_date
```

## 15.6 Display Format

```text
ranked bar chart
ranked table
```

## 15.7 Limitations

```text
Higher count may reflect better QR placement or promotion, not only true popularity.
```

## 15.8 Service

```text
DashboardService.getVisitsByAttraction
```

---

## 16. visit_trend

## 16.1 Display Name

```text
Visit Trend
```

## 16.2 Business Meaning

Shows visits over time.

## 16.3 Source Tables

```text
visits
attractions
```

## 16.4 Calculation

```sql
count(visits.visit_id)
group by date_trunc(day/week/month, visits.visit_date)
```

Granularity depends on date range.

## 16.5 Date Field

```text
visits.visit_date
```

## 16.6 Display Format

```text
line chart
```

## 16.7 Limitations

```text
Small sample sizes may fluctuate strongly.
Campaigns or QR placement changes may affect trend.
```

## 16.8 Service

```text
DashboardService.getVisitTrend
```

---

## 17. photo_spot_visit_count

## 17.1 Display Name

```text
Photo Spot Visits
```

## 17.2 Business Meaning

Shows visits grouped by photo spot.

## 17.3 Source Tables

```text
visits
photo_spots
attractions
```

## 17.4 Calculation

```sql
count(visits.visit_id)
group by visits.photo_spot_id
```

## 17.5 Date Field

```text
visits.visit_date
```

## 17.6 Display Format

```text
ranked table
bar chart
```

## 17.7 Limitations

```text
Only visits linked to photo spots are counted.
Attractions without photo spots may be excluded.
```

## 17.8 Service

```text
DashboardService.getPhotoSpotPerformance
```

---

# Tourist Profile Metrics

---

## 18. origin_country_distribution

## 18.1 Display Name

```text
Origin Country Distribution
```

## 18.2 Business Meaning

Shows where participating tourists come from by country.

## 18.3 Source Tables

```text
visits
tourists
countries
```

## 18.4 Calculation

```sql
count(distinct visits.tourist_id)
group by tourists.origin_country_id
```

## 18.5 Date Field

```text
visits.visit_date
```

## 18.6 Display Format

```text
bar chart
table
```

## 18.7 Limitations

```text
Self-reported origin.
Guest profiles may duplicate real people.
```

## 18.8 Service

```text
DashboardService.getTouristOriginDistribution
```

---

## 19. origin_province_distribution

## 19.1 Display Name

```text
Thai Origin Province Distribution
```

## 19.2 Business Meaning

Shows Thai domestic tourist origins by province.

## 19.3 Source Tables

```text
visits
tourists
provinces
```

## 19.4 Calculation

```sql
count(distinct visits.tourist_id)
group by tourists.origin_province_id
```

## 19.5 Date Field

```text
visits.visit_date
```

## 19.6 Display Format

```text
bar chart
table
```

## 19.7 Limitations

```text
Only applies where origin province is provided.
Foreign tourists may not have Thai province.
```

## 19.8 Service

```text
DashboardService.getTouristOriginDistribution
```

---

## 20. age_group_distribution

## 20.1 Display Name

```text
Age Group Distribution
```

## 20.2 Business Meaning

Shows age group composition of participating tourists.

## 20.3 Source Tables

```text
visits
tourists
```

## 20.4 Calculation

```sql
count(distinct visits.tourist_id)
group by tourists.age_group
```

## 20.5 Date Field

```text
visits.visit_date
```

## 20.6 Display Format

```text
donut chart
bar chart
table
```

## 20.7 Limitations

```text
Self-reported.
Uses age groups, not exact age.
Prefer not to answer should be shown separately.
```

## 20.8 Service

```text
DashboardService.getAgeGroupDistribution
```

---

## 21. identity_provider_distribution

## 21.1 Display Name

```text
Identity Provider Distribution
```

## 21.2 Business Meaning

Shows how tourists are linked or saved in the system.

## 21.3 Source Tables

```text
tourist_identities
visits
```

## 21.4 Calculation

```sql
count(distinct tourist_id)
group by provider
```

Possible providers:

```text
anonymous_device
line
email
google
```

## 21.5 Date Field

```text
visits.visit_date
```

## 21.6 Display Format

```text
bar chart
table
```

## 21.7 Limitations

```text
A tourist may have multiple identities.
Percentages describe provider links and may sum beyond 100% when a profile has multiple providers.
Profiles without a linked provider are reported separately as missing; unknown provider values are not merged into a known provider.
Do not expose provider_user_id.
```

## 21.8 Service

```text
DashboardService.getTouristIdentityMetrics
```

---

# Travel Behavior Metrics

---

## 22. transport_mode_distribution

## 22.1 Display Name

```text
Transport Mode Distribution
```

## 22.2 Business Meaning

Shows how tourists travel to/within attractions.

## 22.3 Source Tables

```text
visits
transport_modes
```

## 22.4 Calculation

```sql
count(visits.visit_id)
group by visits.transport_mode_id
```

## 22.5 Date Field

```text
visits.visit_date
```

## 22.6 Display Format

```text
bar chart
table
```

## 22.7 Limitations

```text
Only includes tourists who answered travel behavior questions.
Blank transport answers are excluded from the denominator and reported as a data-quality warning.
```

## 22.8 Service

```text
DashboardService.getTravelBehaviorMetrics
```

---

## 23. travel_companion_distribution

## 23.1 Display Name

```text
Travel Companion Distribution
```

## 23.2 Business Meaning

Shows whether tourists travel alone, with family, friends, tour groups, etc.

## 23.3 Source Tables

```text
visits
travel_companions
```

## 23.4 Calculation

```sql
count(visits.visit_id)
group by visits.travel_companion_id
```

## 23.5 Date Field

```text
visits.visit_date
```

## 23.6 Display Format

```text
bar chart
table
```

## 23.7 Limitations

```text
Only includes answered records.
```

## 23.8 Service

```text
DashboardService.getTravelBehaviorMetrics
```

---

## 24. average_group_size

## 24.1 Display Name

```text
Average Group Size
```

## 24.2 Business Meaning

Average number of people in travel group for answered visits.

## 24.3 Source Tables

```text
visits
```

## 24.4 Calculation

```sql
avg(visits.group_size)
where group_size is not null
```

## 24.5 Date Field

```text
visits.visit_date
```

## 24.6 Display Format

```text
number with 1 decimal
```

## 24.7 Missing Data Rule

Do not treat null group size as 0.

## 24.8 Service

```text
DashboardService.getTravelBehaviorMetrics
```

---

## 25. overnight_ratio

## 25.1 Display Name

```text
Same-Day vs Overnight Ratio
```

## 25.2 Business Meaning

Shows whether tourists stay overnight or visit same day.

## 25.3 Source Tables

```text
visits
```

## 25.4 Calculation

```sql
count by overnight_status
```

Values:

```text
same_day
overnight
unknown
prefer_not_to_answer
```

## 25.5 Date Field

```text
visits.visit_date
```

## 25.6 Display Format

```text
percentage distribution
```

## 25.7 Limitations

```text
Self-reported.
Missing/unknown should be shown separately.
```

## 25.8 Service

```text
DashboardService.getTravelBehaviorMetrics
```

---

# Expense Metrics

---

## 26. spending_range_distribution

## 26.1 Display Name

```text
Spending Range Distribution
```

## 26.2 Business Meaning

Shows distribution of self-reported spending ranges.

## 26.3 Source Tables

```text
visit_expenses
visits
```

## 26.4 Calculation

```sql
count(visit_expenses.expense_id)
group by visit_expenses.spending_range
```

## 26.5 Date Field

```text
visits.visit_date
```

## 26.6 Display Format

```text
bar chart
donut chart
table
```

## 26.7 Limitations

```text
Self-reported range.
Not verified spending.
Blank spending-range answers are excluded from the distribution denominator and reported as a data-quality warning.
The dashboard keeps separate answered counts for spending range and expense category; estimated totals use only spending-range answers.
```

## 26.8 Service

```text
DashboardService.getExpenseMetrics
```

---

## 27. expense_category_distribution

## 27.1 Display Name

```text
Expense Category Distribution
```

## 27.2 Business Meaning

Shows what tourists report spending on.

## 27.3 Source Tables

```text
visit_expenses
expense_categories
visits
```

## 27.4 Calculation

```sql
count(visit_expenses.expense_id)
group by visit_expenses.expense_category_id
```

## 27.5 Date Field

```text
visits.visit_date
```

## 27.6 Display Format

```text
bar chart
table
```

## 27.7 Limitations

```text
Only includes answered records.
May represent main expense category, not full spending breakdown.
```

## 27.8 Service

```text
DashboardService.getExpenseMetrics
```

---

# Satisfaction Metrics

---

## 28. satisfaction_by_attraction

## 28.1 Display Name

```text
Satisfaction by Attraction
```

## 28.2 Business Meaning

Shows average satisfaction per attraction.

## 28.3 Source Tables

```text
satisfaction_surveys
visits
attractions
```

## 28.4 Calculation

```sql
avg(satisfaction_surveys.overall_score)
group by visits.attraction_id
```

Only non-null scores.

## 28.5 Date Field

```text
visits.visit_date
```

## 28.6 Display Format

```text
bar chart
ranked table
rating out of 5
```

## 28.7 Limitations

```text
Low response count may make average unstable.
Only includes survey respondents.
```

## 28.8 Service

```text
DashboardService.getSatisfactionMetrics
```

---

## 29. revisit_intention_rate

## 29.1 Display Name

```text
Revisit Intention Rate
```

## 29.2 Business Meaning

Percentage of survey respondents who said they would revisit.

## 29.3 Source Tables

```text
satisfaction_surveys
visits
```

## 29.4 Calculation

```text
count(revisit_intention = true) / count(non-null revisit_intention)
```

## 29.5 Date Field

```text
visits.visit_date
```

## 29.6 Display Format

```text
percentage
```

## 29.7 Missing Data Rule

If denominator is zero:

```text
return null
```

## 29.8 Service

```text
DashboardService.getSatisfactionMetrics
```

---

## 30. recommendation_intention_rate

## 30.1 Display Name

```text
Recommendation Intention Rate
```

## 30.2 Business Meaning

Percentage of survey respondents who said they would recommend the attraction.

## 30.3 Source Tables

```text
satisfaction_surveys
visits
```

## 30.4 Calculation

```text
count(recommendation_intention = true) / count(non-null recommendation_intention)
```

## 30.5 Date Field

```text
visits.visit_date
```

## 30.6 Display Format

```text
percentage
```

## 30.7 Missing Data Rule

If denominator is zero:

```text
return null
```

## 30.8 Service

```text
DashboardService.getSatisfactionMetrics
```

---

# Funnel Metrics

---

## 31. funnel_stage_count

## 31.1 Display Name

```text
Funnel Stage Count
```

## 31.2 Business Meaning

Number of events recorded for each QR-to-certificate flow stage.

## 31.3 Source Tables

```text
funnel_events
```

## 31.4 Calculation

```sql
count(funnel_events.event_id)
group by event_name
```

## 31.5 Date Field

```text
funnel_events.event_time
```

## 31.6 Display Format

```text
funnel chart
table
```

## 31.7 Limitations

```text
Event counts are not unique users.
A user may trigger same event multiple times depending on implementation.
```

## 31.8 Service

```text
DashboardService.getFunnelMetrics
```

---

## 32. funnel_conversion_rate

## 32.1 Display Name

```text
Funnel Conversion Rate
```

## 32.2 Business Meaning

Percentage of users/events moving from one funnel stage to the next.

## 32.3 Source Tables

```text
funnel_events
```

## 32.4 Calculation

```text
current_stage_count / previous_stage_count
```

## 32.5 Date Field

```text
funnel_events.event_time
```

## 32.6 Display Format

```text
percentage
```

## 32.7 Zero Denominator Rule

If previous stage count = 0:

```text
return null
display No data
```

## 32.8 Limitations

```text
Accurate conversion depends on consistent event recording and session tracking.
```

## 32.9 Service

```text
DashboardService.getFunnelMetrics
```

---

## 33. funnel_dropoff_rate

## 33.1 Display Name

```text
Funnel Drop-off Rate
```

## 33.2 Business Meaning

Percentage lost between two funnel stages.

## 33.3 Source Tables

```text
funnel_events
```

## 33.4 Calculation

```text
1 - funnel_conversion_rate
```

## 33.5 Display Format

```text
percentage
```

## 33.6 Limitations

```text
Same limitations as funnel_conversion_rate.
```

## 33.7 Service

```text
DashboardService.getFunnelMetrics
```

---

# Sustainable Tourism Metrics

---

## 34. high_visit_low_satisfaction_attractions

## 34.1 Display Name

```text
High Visit / Low Satisfaction Attractions
```

## 34.2 Business Meaning

Attractions with high participation but low satisfaction.

These may need improvement before further promotion.

## 34.3 Source Tables

```text
visits
satisfaction_surveys
attractions
```

## 34.4 Calculation

Example rule:

```text
visit_count >= dashboard median visit_count
average_satisfaction < 3.5
response_count >= minimum_response_threshold
```

Thresholds should be configurable.

## 34.5 Display Format

```text
insight table
```

## 34.6 Limitations

```text
Requires enough satisfaction responses.
Thresholds are analytical assumptions.
```

## 34.7 Service

```text
DashboardService.getSustainableTourismIndicators
```

---

## 35. low_visit_high_satisfaction_attractions

## 35.1 Display Name

```text
Low Visit / High Satisfaction Attractions
```

## 35.2 Business Meaning

Attractions with low participation but high satisfaction.

These may be promotion opportunities.

## 35.3 Source Tables

```text
visits
satisfaction_surveys
attractions
```

## 35.4 Calculation

Example rule:

```text
visit_count < dashboard median visit_count
average_satisfaction >= 4.0
response_count >= minimum_response_threshold
```

## 35.5 Display Format

```text
insight table
```

## 35.6 Limitations

```text
Requires enough satisfaction responses.
Low visit count may be caused by poor QR placement, not true low demand.
```

## 35.7 Service

```text
DashboardService.getSustainableTourismIndicators
```

---

## 36. attraction_concentration_rate

## 36.1 Display Name

```text
Attraction Concentration
```

## 36.2 Business Meaning

Shows how much participation is concentrated in top attractions.

## 36.3 Source Tables

```text
visits
attractions
```

## 36.4 Calculation

Example:

```text
top_3_attraction_visit_count / total_visit_count
```

## 36.5 Display Format

```text
percentage
insight card
```

## 36.6 Limitations

```text
High concentration may reflect promotion or QR availability, not only true tourism pressure.
```

## 36.7 Service

```text
DashboardService.getSustainableTourismIndicators
```

---

# Official Data Comparison Metrics

---

## 37. official_visitor_count

## 37.1 Display Name

```text
Official Visitor Count
```

## 37.2 Business Meaning

Visitor count from official imported statistics.

## 37.3 Source Tables

```text
official_tourism_stats
provinces
```

## 37.4 Calculation

```sql
sum(official_tourism_stats.visitor_count)
```

## 37.5 Date Field

```text
year/month fields
```

## 37.6 Display Format

```text
count
```

## 37.7 Limitations

```text
Official definitions may differ from local platform participation.
```

## 37.8 Service

```text
OfficialComparisonService future
```

---

## 38. platform_coverage_estimate

## 38.1 Display Name

```text
Platform Coverage Estimate
```

## 38.2 Business Meaning

Estimated ratio of local platform visits compared with official visitor count.

## 38.3 Source Tables

```text
visits
official_tourism_stats
```

## 38.4 Calculation

```text
local_platform_visit_count / official_visitor_count
```

## 38.5 Display Format

```text
percentage
```

## 38.6 Limitations

```text
This is only an estimate.
Local platform visits and official visitor counts may use different definitions.
Do not call this exact market share.
```

## 38.7 Service

```text
OfficialComparisonService future
```

---

## 39. Metric Implementation Checklist

Before implementing any metric:

```text
[ ] Metric key exists in this dictionary.
[ ] Business meaning is clear.
[ ] Source tables are identified.
[ ] Calculation is defined.
[ ] Date field is defined.
[ ] Filters are defined.
[ ] Display format is defined.
[ ] Limitations are documented.
[ ] Service owner is identified.
[ ] Privacy risk is reviewed.
```

---

## 40. Metric Anti-Patterns

Do not:

```text
Use QR scans as visits.
Use visit count as unique tourist count.
Use tourist profiles as verified people.
Use missing satisfaction as zero.
Use estimated spending as revenue.
Mix official data and local data without labels.
Expose raw identity data.
Expose Google subject, LINE user ID, provider_user_id, guest token, tourist_id, visit_id, or private storage paths in dashboard by default.
Build chart without metric definition.
Change metric formula in export without updating dashboard definition.
```

---

## 41. Final Metric Rule

Every number on the dashboard must answer:

```text
What does this mean?
Where did it come from?
How was it calculated?
What are its limitations?
```

If those questions cannot be answered, the metric should not be shown.

---

## 42. Optional Survey Operational Drill-down

Dashboard travel behavior, expense, and satisfaction sections provide aggregate planning views. They may link authorized staff to `/admin/surveys`, but must not embed unrestricted respondent records inside charts.

Operational drill-down rules:

```text
Dashboard aggregate view          requires dashboard.read
Survey response list              requires survey.read
Single response detail            requires survey.detail
Free-text optional comment        requires survey.comment_read
Planning-safe survey export       requires export.survey_data
Tourist profile link              requires tourist.detail
```

The response list shows section coverage and answered-field counts. The detail page connects one response to one visit and groups answers into travel behavior, self-reported expense, satisfaction, and optional comment.

Interpretation rules:

- Unanswered optional fields are missing data, not zero.
- Expense ranges are self-reported estimates, not verified transactions or revenue.
- Revisit and recommend rates use only respondents who answered the respective question as denominators.
- Row-level review supports data-quality and service follow-up; policy conclusions should use aggregate dashboard metrics with sample counts.
- Public or shared dashboard views must not expose respondent names, masked references, comments, tourist IDs, or visit IDs.

---

## 43. Story Meaningful Completion Rate

**Metric key:** `story_meaningful_completion_rate`

**Meaning:** The share of deduplicated Story opens that reached the end-of-
article sentinel. It supports editorial improvement and deterministic
recommendations; it is not proof that a person read or understood every word.

**Source:** `story_engagement_daily`

**Calculation:**

```text
sum(unique_session_count where event_name = meaningful_read_complete)
/
sum(unique_session_count where event_name = story_open)
```

**Minimum sample:** At least 100 deduplicated Story opens. Below the threshold,
the recommendation engagement component is zero and the dashboard must show
insufficient sample rather than a percentage.

**Filters:** date range, Story, topic, destination scope, locale.

**Privacy:** No tourist identity, visit, guest token, IP address, URL, or
referrer is available in this metric.

**Limitations:** Session deduplication is approximate, privacy controls can
reduce counts, and completion does not equal satisfaction.

---

## 44. Research Evaluation Metrics

All metrics require an explicit `research_study`, date range, participant type, and collection mode. Default collection mode is `field_observation`. Unit is `research_session` unless stated otherwise.

| Metric | Definition | Source | Privacy/interpretation |
|---|---|---|---|
| Consented sessions | Count of research sessions in scope | `research_sessions` | Not unique tourists |
| Eligible sessions | Sessions not withdrawn, excluded, or expired | `research_sessions` | Denominator for completion |
| Evaluation completion rate | Sessions with submitted audience instrument / eligible sessions | `research_responses`, `research_sessions` | Descriptive; not system effectiveness by itself |
| Median evaluation duration | Median submitted response duration | `research_responses.duration_seconds` | Missing duration excluded |
| Required-answer completeness | Present required answers / expected required answers | `research_items`, `research_answers` | Missing is not zero |
| Construct mean | Mean valid 1–5 answers after reverse scoring | items/answers/responses | Suppress when distinct sessions `< 10` |
| Funnel conversion | Distinct sessions reaching each approved event / eligible sessions | `funnel_events.research_session_id` | Never count events as people |
| Optional tourism-survey follow-through | Sessions with `survey_completed` after `certificate_generated` / sessions with `certificate_generated` | correlated `funnel_events` | Descriptive association only; suppress when certificate denominator `< 10` |
| Research-evaluation follow-through | Sessions with submitted evaluation after `certificate_generated` / sessions with `certificate_generated` | `research_responses`, correlated `funnel_events` | Descriptive association only; suppress when certificate denominator `< 10` |
| Passport-save follow-through | Sessions with `passport_saved` after `certificate_generated` / sessions with `certificate_generated` | correlated `funnel_events` | Does not prove Certificate, Stamp, or Leaderboard caused the action; suppress denominator `< 10` |
| Operator task completion | Completed task attempts | `research_operator_task_attempts` | Unit is attempt |
| Operator assessed success | Passed assessed attempts / assessed attempts | task attempts | `not_assessed` excluded; suppress when assessed n `< 10` |
| Operator confidence | Mean confidence among completed attempts with a confidence value | task attempts | Suppress when confidence n `< 10`; no `NaN`/zero fill |
| Operator task duration | Median `completed_at - started_at` | task attempts | Timer begins on explicit Start; suppress n `< 10` |

The workspace must display date scope, collection mode, participant type, analysis unit, instrument versions present in submitted responses, denominators, and small-cell policy. It must state that associations between rewards, engagement, optional-data completion, and system evaluation do not establish causation. Perceptions of Certificate, Stamp, and Leaderboard are reported only from approved `incentive_engagement` instrument items; operational follow-through uses Certificate as the observable value-delivery boundary and must not be described as a randomized incentive effect.

## 45. Attraction Improvement Monitoring

Feedback issue qualification is transparent and human-reviewed. Issue/action metrics include evidence count, denominator, baseline window, owner, priority, due date, status, follow-up metric, and follow-up window. Before/after display is operational monitoring only; it must not claim the action caused an observed change without an appropriate research design.

---

## 46. Public Evidence Report

The public report at `/dashboard` uses the approved formulas in this dictionary,
but applies an additional privacy and interpretation layer.

| Public metric | Definition and source | Public rule |
|---|---|---|
| Tourist profiles with visits | Distinct `visits.tourist_id` | Not verified people; counts below 5 display as suppressed |
| Recorded visits | Count of `visits` after minimal form and consent | Not page views or QR scans |
| Certificates generated | Count of `certificates` linked to scoped visits | Counts below 5 display as suppressed |
| Average satisfaction | Mean non-null `satisfaction_surveys.overall_score` | Display only when response count is at least 30 |
| Visit trend | Daily count of `visits.visit_date` | Each daily cell below 5 is suppressed; table alternative required |
| Visitor profile and travel behavior | Existing distribution formulas | Category labels/counts below 5 are not published |
| Attraction evidence | Existing top-attraction visit and survey formulas | Attraction requires at least 5 visits; satisfaction requires at least 30 responses |
| Improvement/promotion signal | Existing satisfaction thresholds over eligible attraction rows | Operational signal only, not causal evidence |

The report scope is resolved from the active province master row named `ยะลา` or
`Yala`; it does not hardcode a database ID. The displayed data-as-of timestamp is
the processing time, not the latest event timestamp. Public output must not
contain viewer identity, raw respondent records, comments, IDs, or private URLs.

---

## 47. Executive Previous-Period Comparison

The protected executive dashboard can optionally compare its current date range
with the immediately preceding range of equal inclusive calendar length. This
mode is disabled by default and is not available on the public evidence report.

| Comparison | Calculation | Unavailable when |
|---|---|---|
| Count KPI | `(current - previous) / abs(previous) * 100` | previous is zero, either value is missing, or either query is truncated |
| Rate KPI | `(current rate - previous rate) * 100` percentage points | either rate is missing or either query is truncated |

The current dashboard remains available if the optional prior-period query
fails. Directional wording is descriptive only and must not be interpreted as
causal, statistically significant, or inherently positive/negative.
