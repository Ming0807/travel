# ANALYTICS_TABLES.md

## 1. Document Purpose

This document defines the analytics table strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The platform must support dashboard reporting and sustainable tourism planning.

Raw transactional tables are necessary, but dashboards should not always query raw data directly when data grows.

This document explains:

- Analytics requirements
- Raw table sources
- Dashboard metric groups
- Recommended summary tables
- Materialized view strategy
- Refresh strategy
- Metric definitions
- Data quality rules for analytics
- MVP vs production analytics scope

---

## 2. Analytics Mission

The analytics layer must help planners answer real tourism questions.

Examples:

- How many tourists visited each province?
- Which attractions are most visited?
- Where do tourists come from?
- What travel behaviors are common?
- How much do tourists spend?
- Which attractions have low satisfaction?
- Which QR/photo spots perform best?
- Where do users drop out of the tourist flow?
- Which attractions should be promoted?
- Which attractions need improvement?
- How can tourism benefits be distributed more sustainably?

The dashboard must be decision-oriented, not decorative.

---

## 3. Analytics Design Principles

## 3.1 Start with Raw Queries for MVP

For MVP, it is acceptable to query raw tables directly if the dataset is small.

Raw tables:

```text
tourists
tourist_identities
visits
attractions
photo_spots
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
funnel_events
```

This keeps development simple.

---

## 3.2 Add Summary Tables When Data Grows

When raw dashboard queries become slow, use summary tables or materialized views.

Summary tables reduce repeated aggregation work.

Examples:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
```

---

## 3.3 Every Metric Must Have a Definition

Do not create dashboard numbers without clear definitions.

Each metric should define:

```text
metric_name
business_definition
source_tables
calculation
filters
refresh_frequency
interpretation
```

---

## 3.4 Keep Raw Data as Source of Truth

Summary tables are derived data.

The source of truth remains the raw transactional tables.

If summary data is wrong, it should be rebuilt from raw tables.

---

## 3.5 Handle Missing Data Honestly

Dashboard must distinguish:

```text
0
No data
Not answered
Unknown
```

Example:

If no satisfaction survey was submitted, average satisfaction should not show 0.

It should show:

```text
No satisfaction data
```

---

## 3.6 Avoid Personal Data in Analytics Tables

Analytics tables should use aggregated, non-identifying data.

Avoid storing:

- display name
- email
- LINE user ID
- device token
- photo path
- certificate personal URL

Analytics tables should store counts, averages, and grouped dimensions.

---

## 4. Raw Data Source Tables

## 4.1 Tourist Profile Sources

```text
tourists
tourist_identities
countries
provinces
```

Used for:

- Origin distribution
- Age group distribution
- Language distribution
- New vs returning tourists
- Identity provider analysis

---

## 4.2 Visit Sources

```text
visits
attractions
photo_spots
checkin_codes
provinces
districts
```

Used for:

- Visit count
- Visits by province
- Visits by attraction
- Visits by photo spot
- Visit date trends
- Travel behavior analysis

---

## 4.3 Certificate and Stamp Sources

```text
certificates
tourist_stamps
stamp_definitions
certificate_templates
```

Used for:

- Certificate generation count
- Stamp count
- Digital passport progress
- Attraction engagement analysis

---

## 4.4 Expense Sources

```text
visit_expenses
expense_categories
visits
attractions
provinces
```

Used for:

- Spending range distribution
- Spending by category
- Estimated spending by province
- Estimated spending by attraction

---

## 4.5 Satisfaction Sources

```text
satisfaction_surveys
visits
attractions
provinces
```

Used for:

- Overall satisfaction
- Safety score
- Cleanliness score
- Transport score
- Information score
- Service score
- Value for money score
- Revisit intention
- Recommendation intention

---

## 4.6 Funnel Sources

```text
funnel_events
checkin_codes
photo_spots
attractions
visits
tourists
```

Used for:

- QR scanned count
- Landing viewed count
- Certificate started count
- Photo uploaded count
- Minimal form completed count
- Certificate generated count
- Survey started count
- Survey completed count
- Passport saved count
- Completion rate
- Drop-off rate

---

## 5. MVP Dashboard Approach

For MVP, use raw queries with proper indexes.

MVP dashboard should include:

```text
Executive overview
Tourist profile summary
Travel behavior summary
Expense summary
Satisfaction summary
Attraction performance
Funnel analytics
```

MVP does not require summary tables if data is small.

However, the schema should reserve future summary table names.

---

## 6. Production Dashboard Approach

For production, use a hybrid approach:

```text
Raw tables for detail views
Summary tables for dashboard overview
Materialized views for complex aggregations
Cache for expensive metrics
```

Recommended pattern:

```text
Raw event happens
    |
Raw table stores data
    |
Scheduled job or trigger updates summary
    |
Dashboard reads summary
```

---

## 7. Recommended Analytics Tables

## 7.1 daily_attraction_stats

### Purpose

Stores daily attraction-level summary metrics.

### Grain

One row per:

```text
date + attraction_id
```

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| stat_date | date | Summary date |
| attraction_id | bigint | Attraction |
| province_id | bigint | Province for faster filter |
| district_id | bigint | District for faster filter |
| visit_count | integer | Number of visits |
| unique_tourist_count | integer | Unique tourists |
| certificate_count | integer | Certificates generated |
| stamp_count | integer | Stamps earned |
| survey_completed_count | integer | Completed surveys |
| photo_upload_count | integer | Uploaded photos |
| guest_tourist_count | integer | Visits from guest users |
| line_tourist_count | integer | Visits from LINE-linked users |
| email_tourist_count | integer | Visits from email-linked users |
| average_group_size | numeric | Average group size |
| overnight_visit_count | integer | Overnight visits |
| same_day_visit_count | integer | Same-day visits |
| created_at | timestamptz | Row creation time |
| updated_at | timestamptz | Last refresh time |

### Primary Key

```text
primary key(stat_date, attraction_id)
```

### Source Tables

```text
visits
tourists
tourist_identities
certificates
tourist_stamps
visit_photos
satisfaction_surveys
```

### Use Cases

- Visits by attraction
- Top attractions
- Attraction trend
- Province comparison
- Campaign performance foundation

---

## 7.2 monthly_province_stats

### Purpose

Stores monthly province-level summary metrics.

### Grain

One row per:

```text
year + month + province_id
```

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| stat_year | integer | Year |
| stat_month | integer | Month |
| province_id | bigint | Province |
| visit_count | integer | Total visits |
| unique_tourist_count | integer | Unique tourists |
| certificate_count | integer | Certificates generated |
| stamp_count | integer | Stamps earned |
| average_satisfaction_score | numeric | Average overall score |
| survey_completed_count | integer | Completed surveys |
| estimated_min_spending | numeric | Sum of lower spending range |
| estimated_max_spending | numeric | Sum of upper spending range |
| overnight_visit_count | integer | Overnight visits |
| same_day_visit_count | integer | Same-day visits |
| returning_tourist_count | integer | Tourists with prior visits |
| created_at | timestamptz | Row creation time |
| updated_at | timestamptz | Last refresh time |

### Primary Key

```text
primary key(stat_year, stat_month, province_id)
```

### Source Tables

```text
visits
attractions
provinces
tourists
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
```

### Use Cases

- Monthly province dashboard
- Trend comparison
- Executive reporting
- Official data comparison

---

## 7.3 daily_funnel_stats

### Purpose

Stores daily funnel conversion metrics.

### Grain

One row per:

```text
date + attraction_id + photo_spot_id
```

`photo_spot_id` may be null for attraction-level funnel.

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| stat_date | date | Summary date |
| attraction_id | bigint | Attraction |
| photo_spot_id | bigint | Photo spot |
| qr_scanned_count | integer | QR scan events |
| landing_viewed_count | integer | Landing page views |
| certificate_started_count | integer | Certificate started |
| photo_uploaded_count | integer | Photo uploaded |
| minimal_form_completed_count | integer | Minimal form completed |
| certificate_generated_count | integer | Certificate generated |
| survey_started_count | integer | Survey started |
| survey_completed_count | integer | Survey completed |
| passport_saved_count | integer | Passport saved |
| certificate_completion_rate | numeric | Certificate generated / QR scanned |
| survey_completion_rate | numeric | Survey completed / certificate generated |
| created_at | timestamptz | Row creation time |
| updated_at | timestamptz | Last refresh time |

### Source Tables

```text
funnel_events
```

### Use Cases

- Identify drop-off points
- Improve form UX
- Compare QR/photo spot performance
- Measure incentive effectiveness

---

## 7.4 daily_satisfaction_stats

### Purpose

Stores daily attraction satisfaction summaries.

### Grain

One row per:

```text
date + attraction_id
```

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| stat_date | date | Summary date |
| attraction_id | bigint | Attraction |
| province_id | bigint | Province |
| response_count | integer | Number of satisfaction responses |
| average_overall_score | numeric | Average overall score |
| average_safety_score | numeric | Average safety score |
| average_cleanliness_score | numeric | Average cleanliness score |
| average_transport_score | numeric | Average transport score |
| average_information_score | numeric | Average information score |
| average_service_score | numeric | Average service score |
| average_value_for_money_score | numeric | Average value score |
| revisit_yes_count | integer | Count of revisit intention true |
| recommendation_yes_count | integer | Count of recommendation intention true |
| low_score_count | integer | Count of overall scores <= 2 |
| created_at | timestamptz | Row creation time |
| updated_at | timestamptz | Last refresh time |

### Source Tables

```text
satisfaction_surveys
visits
attractions
```

### Use Cases

- Satisfaction dashboard
- Identify attractions needing improvement
- Sustainable tourism planning
- Quality monitoring

---

## 7.5 daily_expense_stats

### Purpose

Stores daily spending summaries.

### Grain

One row per:

```text
date + attraction_id + expense_category_id
```

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| stat_date | date | Summary date |
| attraction_id | bigint | Attraction |
| province_id | bigint | Province |
| expense_category_id | bigint | Expense category |
| response_count | integer | Number of responses |
| estimated_min_spending | numeric | Sum of min spending range |
| estimated_max_spending | numeric | Sum of max spending range |
| spending_range_0_500_count | integer | Count |
| spending_range_501_1000_count | integer | Count |
| spending_range_1001_2000_count | integer | Count |
| spending_range_2001_5000_count | integer | Count |
| spending_range_5001_plus_count | integer | Count |
| prefer_not_count | integer | Count |
| created_at | timestamptz | Row creation time |
| updated_at | timestamptz | Last refresh time |

### Source Tables

```text
visit_expenses
visits
attractions
expense_categories
```

### Use Cases

- Spending dashboard
- Local economy analysis
- Expense category distribution
- Province-level spending estimate

---

## 7.6 tourist_origin_stats

### Purpose

Stores tourist origin summaries.

### Grain

One row per:

```text
date or month + attraction/province + origin country/province
```

For MVP, this can be a query rather than a table.

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| stat_date | date | Summary date |
| stat_month | integer | Optional month |
| stat_year | integer | Optional year |
| attraction_id | bigint | Optional attraction |
| province_id | bigint | Destination province |
| origin_country_id | bigint | Tourist origin country |
| origin_province_id | bigint | Tourist origin province |
| tourist_count | integer | Unique tourists |
| visit_count | integer | Visits |

### Source Tables

```text
tourists
visits
attractions
countries
provinces
```

### Use Cases

- Domestic origin analysis
- Foreign tourist analysis
- Cross-border tourist insight
- Marketing planning

---

## 7.7 dashboard_cache

### Purpose

Stores cached dashboard payloads or expensive metric results.

### Suggested Columns

| Column | Type | Description |
|---|---:|---|
| cache_key | varchar | Unique cache key |
| filter_hash | varchar | Hash of filter inputs |
| payload_json | jsonb | Cached metric result |
| generated_at | timestamptz | Generation time |
| expires_at | timestamptz | Expiration time |

### Use Cases

- Expensive dashboard views
- Repeated executive dashboard requests
- Slow multi-table aggregations

### MVP Status

Not required.

---

## 8. Materialized Views

Materialized views are useful when:

- Query logic is complex
- Data changes less frequently than dashboard reads
- Summary tables are too much work initially
- You need fast read performance

Example materialized views:

```text
mv_daily_attraction_stats
mv_monthly_province_stats
mv_tourist_origin_summary
mv_satisfaction_by_attraction
mv_funnel_conversion
```

---

## 9. Summary Tables vs Materialized Views

## 9.1 Summary Tables

Use summary tables when:

- You need full control over refresh logic.
- You need incremental updates.
- You need to store additional metadata.
- You need to edit or correct derived values.

## 9.2 Materialized Views

Use materialized views when:

- Query is derived directly from raw tables.
- Full refresh is acceptable.
- You want simpler implementation.
- You want to keep data derivation in SQL.

## 9.3 MVP Recommendation

For MVP:

```text
Use raw queries first.
Define summary table design in documentation.
Add materialized views only if dashboard gets slow.
```

For production:

```text
Use summary tables or materialized views for dashboard overview.
```

---

## 10. Refresh Strategy

## 10.1 Manual Refresh

Suitable for:

- MVP demo
- Development
- Small dataset

Example:

Admin clicks refresh dashboard summary.

---

## 10.2 Scheduled Refresh

Suitable for:

- Daily reports
- Monthly summaries
- Production dashboards

Example schedules:

```text
daily_attraction_stats: every hour or once per day
monthly_province_stats: once per day
daily_funnel_stats: every hour
satisfaction_stats: every hour or once per day
expense_stats: every day
```

---

## 10.3 Event-Driven Refresh

Suitable for production.

Trigger summary updates when events happen:

- visit created
- certificate generated
- survey completed
- expense submitted
- satisfaction submitted

This is more complex and should not be required in MVP.

---

## 11. Metric Definitions

## 11.1 Total Tourists

### Definition

Number of tourist profiles.

### Source

```text
tourists
```

### Calculation

```sql
count(distinct tourist_id)
```

### Notes

This is profile count, not visit count.

---

## 11.2 Total Visits

### Definition

Number of visit records.

### Source

```text
visits
```

### Calculation

```sql
count(visit_id)
```

### Notes

A tourist can have multiple visits.

---

## 11.3 Unique Tourists by Attraction

### Definition

Number of unique tourists who visited an attraction.

### Source

```text
visits
```

### Calculation

```sql
count(distinct tourist_id)
group by attraction_id
```

---

## 11.4 Certificates Generated

### Definition

Number of generated certificates.

### Source

```text
certificates
```

### Calculation

```sql
count(certificate_id)
```

---

## 11.5 Stamps Earned

### Definition

Number of unique attraction stamps earned.

### Source

```text
tourist_stamps
```

### Calculation

```sql
count(stamp_id)
```

---

## 11.6 Survey Completion Rate

### Definition

Percentage of certificate-generated visits that completed survey.

### Sources

```text
certificates
satisfaction_surveys
visits
```

### Calculation

```text
survey_completed_count / certificate_generated_count
```

### Notes

If certificate_generated_count is 0, show no data.

---

## 11.7 Average Satisfaction

### Definition

Average overall satisfaction score.

### Source

```text
satisfaction_surveys
```

### Calculation

```sql
avg(overall_score)
```

### Notes

Ignore null scores.

Do not treat missing scores as 0.

---

## 11.8 Revisit Intention Rate

### Definition

Percentage of satisfaction responses where tourist intends to revisit.

### Source

```text
satisfaction_surveys
```

### Calculation

```text
count(revisit_intention = true) / count(non-null revisit_intention)
```

---

## 11.9 Recommendation Intention Rate

### Definition

Percentage of satisfaction responses where tourist would recommend the attraction.

### Source

```text
satisfaction_surveys
```

### Calculation

```text
count(recommendation_intention = true) / count(non-null recommendation_intention)
```

---

## 11.10 Estimated Spending Range

### Definition

Estimated spending based on selected spending ranges.

### Source

```text
visit_expenses
```

### Calculation

```text
sum(amount_min) to sum(amount_max)
```

### Notes

If `amount_max` is null for open-ended ranges, use a documented assumption or show as "5001+ included".

Do not claim exact revenue from ranges.

Use label:

```text
Estimated spending range
```

not:

```text
Actual revenue
```

---

## 11.11 QR to Certificate Conversion Rate

### Definition

Percentage of QR scan sessions that generated certificates.

### Source

```text
funnel_events
```

### Calculation

```text
certificate_generated_count / qr_scanned_count
```

### Notes

Requires session-level or aggregated event counting.

---

## 11.12 Survey Drop-off Rate

### Definition

Percentage of users who started but did not complete survey.

### Source

```text
funnel_events
```

### Calculation

```text
(survey_started_count - survey_completed_count) / survey_started_count
```

---

## 12. Dashboard Filters

Analytics should support these filters.

## 12.1 Date Filter

Applies to:

```text
visits.visit_date
certificates.generated_at
satisfaction_surveys.completed_at
funnel_events.event_time
```

Default:

```text
last 30 days
```

or current month.

---

## 12.2 Province Filter

Uses:

```text
attractions.province_id
```

Applies to:

- visits
- certificates
- stamps
- satisfaction
- expense
- funnel

---

## 12.3 Attraction Filter

Uses:

```text
attraction_id
```

Applies to:

- visits
- certificates
- stamps
- satisfaction
- expense
- funnel

---

## 12.4 Tourist Origin Filter

Uses:

```text
tourists.origin_country_id
tourists.origin_province_id
```

Applies to:

- tourist profile dashboard
- visit dashboard
- campaign targeting

---

## 12.5 Identity Provider Filter

Uses:

```text
tourist_identities.provider
```

Applies to:

- guest vs LINE vs email analysis
- returning user analysis
- engagement strategy analysis

---

## 13. Sample Raw Dashboard Queries

## 13.1 Visits by Province

```sql
select
  p.province_name_en,
  count(v.visit_id) as visit_count
from visits v
join attractions a on a.attraction_id = v.attraction_id
join provinces p on p.province_id = a.province_id
where v.visit_date between :start_date and :end_date
group by p.province_id, p.province_name_en
order by visit_count desc;
```

---

## 13.2 Top Attractions

```sql
select
  a.attraction_id,
  a.name_en,
  count(v.visit_id) as visit_count
from visits v
join attractions a on a.attraction_id = v.attraction_id
where v.visit_date between :start_date and :end_date
group by a.attraction_id, a.name_en
order by visit_count desc
limit 10;
```

---

## 13.3 Average Satisfaction by Attraction

```sql
select
  a.attraction_id,
  a.name_en,
  avg(s.overall_score) as average_overall_score,
  count(s.satisfaction_id) as response_count
from satisfaction_surveys s
join attractions a on a.attraction_id = s.attraction_id
where s.completed_at between :start_date and :end_date
group by a.attraction_id, a.name_en
order by average_overall_score asc;
```

---

## 13.4 Spending Range Distribution

```sql
select
  ve.spending_range,
  count(*) as response_count
from visit_expenses ve
join visits v on v.visit_id = ve.visit_id
where v.visit_date between :start_date and :end_date
group by ve.spending_range
order by response_count desc;
```

---

## 13.5 Funnel Counts

```sql
select
  event_name,
  count(*) as event_count
from funnel_events
where event_time between :start_date and :end_date
group by event_name;
```

---

## 14. Data Freshness

Every dashboard should indicate freshness.

Examples:

```text
Last updated: 2026-05-18 21:30
Data source: raw tables
Data source: daily summary table
Data source: cached dashboard
```

For MVP, real-time raw query is acceptable.

For production, show summary refresh time.

---

## 15. Analytics Data Quality Rules

## 15.1 Do Not Count Missing Data as Zero

Example:

If satisfaction was not submitted, do not use 0.

Correct:

```text
average over submitted responses only
```

---

## 15.2 Use Correct Denominators

Example:

Survey completion rate denominator should be clear.

Options:

```text
survey completed / QR scanned
survey completed / certificate generated
survey completed / survey started
```

Use one definition and label it clearly.

---

## 15.3 Avoid Double Counting Tourists

A tourist may have multiple visits.

Use:

```text
count(visits)
```

for visit count.

Use:

```text
count(distinct tourist_id)
```

for unique tourist count.

---

## 15.4 Be Careful with Guest Users

Guest users may be duplicated across devices.

Dashboard should label unique tourist count as:

```text
Estimated unique tourist profiles
```

unless identity quality is strong.

---

## 15.5 Spending Is Estimated

Expense ranges are not exact revenue.

Dashboard should say:

```text
Estimated spending range
```

not:

```text
Revenue
```

---

## 16. Sustainable Tourism Analytics

Sustainable tourism dashboard should use indicators such as:

## 16.1 Attraction Concentration

### Definition

Share of visits concentrated in top attractions.

### Purpose

Detect over-concentration and under-promoted attractions.

### Calculation

```text
top_n_attraction_visits / total_visits
```

---

## 16.2 Under-Visited High-Satisfaction Attractions

### Definition

Attractions with low visit count but high satisfaction.

### Purpose

Identify promotion opportunities.

### Calculation

```text
visit_count below threshold
average_satisfaction above threshold
```

---

## 16.3 Low-Satisfaction High-Visit Attractions

### Definition

Attractions with high visit count but low satisfaction.

### Purpose

Identify urgent improvement priorities.

### Calculation

```text
visit_count above threshold
average_satisfaction below threshold
```

---

## 16.4 Overnight Stay Ratio

### Definition

Percentage of visits with overnight stay.

### Purpose

Indicates potential for local economic benefit.

### Calculation

```text
overnight_visit_count / total_visit_count
```

---

## 16.5 Local Spending Distribution

### Definition

Estimated spending by category and province.

### Purpose

Understand how tourism benefits local economy.

---

## 16.6 Revisit and Recommendation Indicators

### Definition

Rates of revisit and recommendation intention.

### Purpose

Measure long-term tourism potential.

---

## 17. Funnel Analytics

Funnel analytics directly supports the product problem:

> Tourists may not want to fill forms.

Track where users drop off.

## 17.1 Funnel Stages

```text
QR scanned
Landing viewed
Certificate started
Photo uploaded
Minimal form completed
Certificate generated
Survey started
Survey completed
Passport saved
```

## 17.2 Important Rates

```text
landing_viewed / qr_scanned
certificate_started / landing_viewed
photo_uploaded / certificate_started
minimal_form_completed / photo_uploaded
certificate_generated / minimal_form_completed
survey_started / certificate_generated
survey_completed / survey_started
passport_saved / certificate_generated
```

## 17.3 Interpretation

Low certificate start rate may mean:

- landing page is unclear
- benefit is not attractive
- page loads too slowly

Low photo upload rate may mean:

- upload UX is hard
- file size limit is too strict
- users do not understand why photo is needed

Low survey completion rate may mean:

- survey is too long
- questions are too sensitive
- reward is not strong enough

---

## 18. Analytics Table Refresh Examples

## 18.1 Rebuild Daily Attraction Stats

Conceptual SQL:

```sql
insert into daily_attraction_stats (
  stat_date,
  attraction_id,
  province_id,
  district_id,
  visit_count,
  unique_tourist_count,
  certificate_count,
  stamp_count,
  survey_completed_count,
  photo_upload_count,
  updated_at
)
select
  v.visit_date as stat_date,
  a.attraction_id,
  a.province_id,
  a.district_id,
  count(v.visit_id) as visit_count,
  count(distinct v.tourist_id) as unique_tourist_count,
  count(distinct c.certificate_id) as certificate_count,
  count(distinct ts.stamp_id) as stamp_count,
  count(distinct s.satisfaction_id) as survey_completed_count,
  count(distinct vp.photo_id) as photo_upload_count,
  now() as updated_at
from visits v
join attractions a on a.attraction_id = v.attraction_id
left join certificates c on c.visit_id = v.visit_id
left join tourist_stamps ts on ts.visit_id = v.visit_id
left join satisfaction_surveys s on s.visit_id = v.visit_id
left join visit_photos vp on vp.visit_id = v.visit_id
group by v.visit_date, a.attraction_id, a.province_id, a.district_id
on conflict (stat_date, attraction_id)
do update set
  visit_count = excluded.visit_count,
  unique_tourist_count = excluded.unique_tourist_count,
  certificate_count = excluded.certificate_count,
  stamp_count = excluded.stamp_count,
  survey_completed_count = excluded.survey_completed_count,
  photo_upload_count = excluded.photo_upload_count,
  updated_at = now();
```

This is conceptual and must be adjusted to actual schema.

---

## 19. Analytics Table Indexes

## 19.1 daily_attraction_stats

```sql
create index idx_daily_attraction_stats_date
on daily_attraction_stats(stat_date);

create index idx_daily_attraction_stats_attraction
on daily_attraction_stats(attraction_id);

create index idx_daily_attraction_stats_province_date
on daily_attraction_stats(province_id, stat_date);
```

## 19.2 monthly_province_stats

```sql
create index idx_monthly_province_stats_period
on monthly_province_stats(stat_year, stat_month);

create index idx_monthly_province_stats_province
on monthly_province_stats(province_id);
```

## 19.3 daily_funnel_stats

```sql
create index idx_daily_funnel_stats_date
on daily_funnel_stats(stat_date);

create index idx_daily_funnel_stats_attraction
on daily_funnel_stats(attraction_id);

create index idx_daily_funnel_stats_photo_spot
on daily_funnel_stats(photo_spot_id);
```

---

## 20. MVP Analytics Acceptance Criteria

The MVP analytics layer is acceptable when:

```text
[ ] Dashboard can show total tourists.
[ ] Dashboard can show total visits.
[ ] Dashboard can show visits by province.
[ ] Dashboard can show visits by attraction.
[ ] Dashboard can show tourist origin distribution.
[ ] Dashboard can show age group distribution.
[ ] Dashboard can show certificate count.
[ ] Dashboard can show stamp count.
[ ] Dashboard can show spending range distribution.
[ ] Dashboard can show average satisfaction.
[ ] Dashboard can show funnel counts.
[ ] Dashboard handles missing data correctly.
[ ] Dashboard filters by date.
[ ] Dashboard filters by province or attraction if feasible.
```

---

## 21. Production Analytics Acceptance Criteria

The production analytics layer is acceptable when:

```text
[ ] Dashboard overview uses summary tables or materialized views where needed.
[ ] Raw tables remain source of truth.
[ ] Summary refresh time is visible.
[ ] Dashboard queries are fast under expected data volume.
[ ] Aggregated data excludes unnecessary personal data.
[ ] Metric definitions are documented.
[ ] Summary tables can be rebuilt.
[ ] Exported analytics data is privacy-safe.
[ ] Sustainable tourism indicators are available.
[ ] Official data comparison is supported if implemented.
```

---

## 22. Analytics Anti-Patterns

Avoid:

```text
Counting visits as tourists.
Counting missing satisfaction as zero.
Calling spending range "actual revenue".
Building charts without metric definitions.
Querying huge raw tables for every dashboard request forever.
Putting display names or emails in summary tables.
Ignoring date filters.
Ignoring province and attraction filters.
Using free-text values for dashboard categories.
Not documenting metric formulas.
```

---

## 23. Analytics Development Roadmap

## 23.1 MVP

Use raw queries.

Build:

- Executive overview
- Visits by province
- Visits by attraction
- Origin distribution
- Age group distribution
- Spending range distribution
- Satisfaction average
- Funnel counts

## 23.2 Phase 2

Add:

- Digital passport analytics
- Returning tourist analysis
- More satisfaction breakdown
- Sustainable tourism indicators
- Daily summary tables
- Funnel conversion dashboard

## 23.3 Production

Add:

- Materialized views
- Scheduled refresh
- Dashboard cache
- Official data comparison
- Exportable analytics reports
- Advanced trend analysis
- Forecasting only after enough data exists

---

## 24. Final Analytics Rule

Dashboards must help people make better tourism decisions.

A chart is useful only if it answers a planning question.

Always connect analytics back to:

```text
Tourist profile
Travel behavior
Attractions visited
Expenses
Satisfaction
Sustainable tourism planning
```
