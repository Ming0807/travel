# DASHBOARD_SERVICES.md

## 1. Document Purpose

This document defines backend service requirements for dashboard analytics in the **Southern Border Tourism Data & Intelligence Platform**.

The dashboard service layer must provide correct, safe, and useful metrics for tourism planning in Yala, Pattani, and Narathiwat.

The dashboard must not be built from random frontend aggregation or decorative chart logic.

It must be based on documented definitions, validated filters, and backend-controlled queries.

---

## 2. Dashboard Service Mission

The mission of dashboard services is:

```text
Transform raw tourism participation data into reliable planning metrics.
```

Dashboard services must help answer:

```text
How many visits were recorded?
Where did tourists visit?
Where did tourists come from?
How did tourists travel?
What did they spend?
How satisfied were they?
Where did users drop out of the QR-to-certificate flow?
Which attractions need promotion or improvement?
```

---

## 3. Core Design Principle

Dashboard services must calculate metrics on the backend.

Correct:

```text
Frontend sends filters
Backend validates filters
Backend calculates metric
Frontend renders result
```

Incorrect:

```text
Frontend loads all visits
Frontend calculates dashboard metrics in browser
```

Reason:

- performance
- security
- consistency
- permission control
- reusable exports
- metric definition control

---

## 4. Related Documents

Dashboard service implementation must align with:

```text
docs/modules/MODULE_10_DASHBOARD_ANALYTICS.md
docs/frontend/DASHBOARD_UI_SPEC.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/database/ANALYTICS_TABLES.md
docs/backend/API_DESIGN.md
docs/backend/SERVICE_LAYER.md
docs/backend/AUTHORIZATION_RBAC.md
```

---

## 5. Required Source Tables

Dashboard services may read from:

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
visit_photos
visit_expenses
expense_categories
satisfaction_surveys
travel_companions
transport_modes
travel_purposes
funnel_events
```

Future official comparison services may read from:

```text
official_tourism_stats
official_attraction_refs
```

Future performance services may read from:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
```

---

## 6. Required Dashboard Services

Recommended file:

```text
server/services/dashboard-service.ts
```

Recommended service methods:

```ts
getExecutiveMetrics(filters: DashboardFilters): Promise<ServiceResult<ExecutiveMetrics>>;
getVisitsByProvince(filters: DashboardFilters): Promise<ServiceResult<ChartSeries>>;
getVisitsByAttraction(filters: DashboardFilters): Promise<ServiceResult<RankedMetric[]>>;
getTouristOriginDistribution(filters: DashboardFilters): Promise<ServiceResult<OriginMetrics>>;
getAgeGroupDistribution(filters: DashboardFilters): Promise<ServiceResult<ChartSeries>>;
getTravelBehaviorMetrics(filters: DashboardFilters): Promise<ServiceResult<TravelBehaviorMetrics>>;
getExpenseMetrics(filters: DashboardFilters): Promise<ServiceResult<ExpenseMetrics>>;
getSatisfactionMetrics(filters: DashboardFilters): Promise<ServiceResult<SatisfactionMetrics>>;
getFunnelMetrics(filters: DashboardFilters): Promise<ServiceResult<FunnelMetrics>>;
getSustainableTourismIndicators(filters: DashboardFilters): Promise<ServiceResult<SustainableTourismIndicators>>;
getDataFreshness(): Promise<ServiceResult<DataFreshness>>;
```

MVP can implement fewer methods, but the interface should remain clean.

---

## 7. Dashboard Filters

## 7.1 Core Filters

Required MVP filters:

```text
start_date
end_date
province_id
attraction_id
```

## 7.2 Optional Filters

```text
origin_country_id
origin_province_id
age_group
transport_mode_id
travel_purpose_id
completion_status
identity_provider
```

## 7.3 Filter Validation

Rules:

```text
start_date must be valid date
end_date must be valid date
start_date <= end_date
province_id must be integer if provided
attraction_id must be integer if provided
attraction_id must belong to province_id if both provided
age_group must be controlled value if provided
date range should have safe maximum for raw queries
```

Recommended MVP max raw query range:

```text
366 days
```

For larger ranges, use summary tables later.

---

## 8. Dashboard Filter Type

Conceptual TypeScript:

```ts
type DashboardFilters = {
  startDate: string;
  endDate: string;
  provinceId?: number;
  attractionId?: number;
  originCountryId?: number;
  originProvinceId?: number;
  ageGroup?: string;
  transportModeId?: number;
  travelPurposeId?: number;
  completionStatus?: string;
};
```

All services should accept the same base filter type where possible.

---

## 9. Date Field Rules

Different metrics use different date fields.

## 9.1 Visit Metrics

Use:

```text
visits.visit_date
```

## 9.2 Certificate Metrics

Use:

```text
certificates.generated_at
```

or join to visits and filter by `visits.visit_date` depending on dashboard definition.

MVP recommendation:

```text
filter certificate metrics by visits.visit_date for consistency with visit context
```

## 9.3 Satisfaction Metrics

Use:

```text
satisfaction_surveys.completed_at
```

or join to visits and filter by `visits.visit_date`.

MVP recommendation:

```text
filter by visits.visit_date unless dashboard specifically shows survey submission trend
```

## 9.4 Funnel Metrics

Use:

```text
funnel_events.event_time
```

Funnel is event-based.

---

## 10. Metric Definition Rule

Every dashboard metric must be defined in:

```text
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

Before implementation, each metric should have:

```text
metric_key
display_name
business_meaning
source_tables
calculation
filters
display_format
limitations
```

Backend service names should align with metric keys.

---

## 11. Executive Metrics Service

Method:

```ts
getExecutiveMetrics(filters: DashboardFilters)
```

## 11.1 Returned Metrics

Required MVP:

```text
tourist_profile_count
visit_count
certificate_count
stamp_count
survey_completion_rate
average_satisfaction
estimated_spending_min
estimated_spending_max
top_attraction_by_visits
```

## 11.2 Conceptual Return Type

```ts
type ExecutiveMetrics = {
  touristProfileCount: number;
  visitCount: number;
  certificateCount: number;
  stampCount: number;
  surveyCompletionRate: number | null;
  averageSatisfaction: number | null;
  estimatedSpendingMin: number | null;
  estimatedSpendingMax: number | null;
  topAttractionByVisits?: {
    attractionId: number;
    attractionName: string;
    visitCount: number;
  };
  dataFreshness: string;
};
```

---

## 12. Tourist Profile Count

## 12.1 Definition

Number of tourist profiles associated with visits in the selected filter range.

## 12.2 Calculation

Recommended for visit-based filter:

```sql
count(distinct visits.tourist_id)
```

not:

```sql
count(tourists.tourist_id)
```

Reason:

If date filter is applied, count tourists who actually visited in that period.

## 12.3 Limitation

Guest profiles may not represent unique real humans.

Dashboard label should be:

```text
Tourist Profiles
```

not:

```text
Unique People
```

---

## 13. Visit Count

## 13.1 Definition

Number of recorded visit records.

## 13.2 Calculation

```sql
count(visits.visit_id)
```

## 13.3 Rule

Do not count QR scans as visits.

QR scans belong to funnel metrics.

---

## 14. Certificate Count

## 14.1 Definition

Number of generated certificate records.

## 14.2 Calculation

```sql
count(certificates.certificate_id)
```

with join to visits for filters.

## 14.3 Rule

Certificate count is engagement/completion metric.

It is not total tourist count.

---

## 15. Stamp Count

## 15.1 Definition

Number of earned digital stamps.

## 15.2 Calculation

```sql
count(tourist_stamps.stamp_id)
```

with join to attractions/visits if filtering by province/date.

## 15.3 Important Rule

A tourist normally earns one stamp per attraction.

Stamp count is not the same as visit count.

---

## 16. Survey Completion Rate

## 16.1 Definition

Completed surveys divided by generated certificates.

## 16.2 Calculation

```text
survey_completed_count / certificate_generated_count
```

## 16.3 Rule

If certificate count is zero:

```text
return null
```

Do not return 0 unless denominator exists.

## 16.4 Display

Frontend should display:

```text
No data
```

when value is null.

---

## 17. Average Satisfaction

## 17.1 Definition

Average of submitted overall satisfaction scores.

## 17.2 Calculation

```sql
avg(satisfaction_surveys.overall_score)
```

## 17.3 Rule

Ignore null scores.

Do not convert missing score to 0.

If no scores:

```text
return null
```

---

## 18. Estimated Spending

## 18.1 Definition

Estimated spending based on tourist-selected spending ranges.

## 18.2 Source

```text
visit_expenses.amount_min
visit_expenses.amount_max
```

## 18.3 Calculation

```text
sum(amount_min) to sum(amount_max)
```

For open-ended range:

```text
amount_max may be null
```

Service should return both min and max.

## 18.4 Rule

Always label as:

```text
Estimated Spending
```

Never label as:

```text
Revenue
```

unless actual verified transaction data exists.

---

## 19. Visits by Province Service

Method:

```ts
getVisitsByProvince(filters)
```

## 19.1 Output

```ts
type ProvinceVisitMetric = {
  provinceId: number;
  provinceName: string;
  visitCount: number;
};
```

## 19.2 Query Logic

Join:

```text
visits -> attractions -> provinces
```

Group by:

```text
province_id
```

Apply date filter to:

```text
visits.visit_date
```

---

## 20. Visits by Attraction Service

Method:

```ts
getVisitsByAttraction(filters)
```

## 20.1 Output

```ts
type AttractionVisitMetric = {
  attractionId: number;
  attractionName: string;
  provinceName: string;
  visitCount: number;
  certificateCount?: number;
  averageSatisfaction?: number | null;
};
```

## 20.2 Ranking

Default:

```text
order by visit_count desc
limit 10 or configurable
```

## 20.3 Use Cases

Used for:

```text
top attractions
low-visit attractions
high-visit low-satisfaction analysis
```

---

## 21. Tourist Origin Distribution Service

Method:

```ts
getTouristOriginDistribution(filters)
```

## 21.1 Domestic Origin

Source:

```text
tourists.origin_province_id
```

## 21.2 International Origin

Source:

```text
tourists.origin_country_id
```

## 21.3 Output

```ts
type OriginMetrics = {
  byCountry: Array<{
    countryId: number;
    countryName: string;
    touristCount: number;
  }>;
  byThaiProvince: Array<{
    provinceId: number;
    provinceName: string;
    touristCount: number;
  }>;
};
```

## 21.4 Rule

For dashboard filter date range, count tourists through visits.

Use:

```text
visits -> tourists
```

rather than all tourists.

---

## 22. Age Group Distribution Service

Method:

```ts
getAgeGroupDistribution(filters)
```

## 22.1 Source

```text
tourists.age_group
```

## 22.2 Output

```ts
type AgeGroupMetric = {
  ageGroup: string;
  label: string;
  count: number;
};
```

## 22.3 Rule

Use controlled age groups.

Show:

```text
Prefer not to answer
Unknown
```

separately if needed.

---

## 23. Travel Behavior Service

Method:

```ts
getTravelBehaviorMetrics(filters)
```

## 23.1 Metrics

```text
travel_companion_distribution
average_group_size
transport_mode_distribution
travel_purpose_distribution
overnight_ratio
average_nights
```

## 23.2 Source Tables

```text
visits
travel_companions
transport_modes
travel_purposes
```

## 23.3 Output Type

```ts
type TravelBehaviorMetrics = {
  companions: ChartPoint[];
  averageGroupSize: number | null;
  transportModes: ChartPoint[];
  travelPurposes: ChartPoint[];
  overnightRatio: {
    sameDay: number;
    overnight: number;
    unknown: number;
  };
  averageNights: number | null;
};
```

## 23.4 Missing Data Rule

Do not treat missing group size as zero.

Use only non-null values for average.

---

## 24. Expense Metrics Service

Method:

```ts
getExpenseMetrics(filters)
```

## 24.1 Metrics

```text
spending_range_distribution
expense_category_distribution
estimated_spending_min
estimated_spending_max
estimated_spending_by_province
estimated_spending_by_attraction
```

## 24.2 Source Tables

```text
visit_expenses
expense_categories
visits
attractions
provinces
```

## 24.3 Output Type

```ts
type ExpenseMetrics = {
  spendingRanges: ChartPoint[];
  expenseCategories: ChartPoint[];
  estimatedTotalMin: number | null;
  estimatedTotalMax: number | null;
  byProvince: Array<{
    provinceId: number;
    provinceName: string;
    estimatedMin: number | null;
    estimatedMax: number | null;
  }>;
};
```

## 24.4 Limitation

Expense data is self-reported and range-based.

Service can include:

```text
isEstimated: true
```

in response.

---

## 25. Satisfaction Metrics Service

Method:

```ts
getSatisfactionMetrics(filters)
```

## 25.1 Metrics

```text
average_overall_score
average_by_attraction
average_by_province
revisit_intention_rate
recommendation_intention_rate
low_satisfaction_attractions
```

Optional category scores:

```text
safety
cleanliness
transport
information
service
value_for_money
```

## 25.2 Source Tables

```text
satisfaction_surveys
visits
attractions
provinces
```

## 25.3 Output Type

```ts
type SatisfactionMetrics = {
  averageOverallScore: number | null;
  responseCount: number;
  byAttraction: Array<{
    attractionId: number;
    attractionName: string;
    averageScore: number | null;
    responseCount: number;
  }>;
  revisitIntentionRate: number | null;
  recommendationIntentionRate: number | null;
  lowSatisfactionAttractions: Array<{
    attractionId: number;
    attractionName: string;
    averageScore: number;
    responseCount: number;
  }>;
};
```

## 25.4 Missing Data Rule

If no responses:

```text
averageOverallScore = null
responseCount = 0
```

Do not return score 0.

---

## 26. Funnel Metrics Service

Method:

```ts
getFunnelMetrics(filters)
```

## 26.1 Funnel Stages

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

## 26.2 Output Type

```ts
type FunnelMetrics = {
  stages: Array<{
    eventName: string;
    label: string;
    count: number;
    conversionFromPrevious: number | null;
    dropoffFromPrevious: number | null;
  }>;
  byAttraction?: Array<{
    attractionId: number;
    attractionName: string;
    certificateGeneratedCount: number;
    surveyCompletedCount: number;
  }>;
};
```

## 26.3 Conversion Formula

```text
current_stage_count / previous_stage_count
```

If previous count is zero:

```text
return null
```

## 26.4 Rule

Funnel events are event records, not visits.

Do not use funnel counts as visit counts.

---

## 27. Sustainable Tourism Indicator Service

Method:

```ts
getSustainableTourismIndicators(filters)
```

## 27.1 MVP Status

Optional but recommended for project quality.

## 27.2 Indicators

```text
high_visit_low_satisfaction
low_visit_high_satisfaction
over_concentration_by_attraction
overnight_stay_opportunity
estimated_spending_distribution
transport_accessibility_signal
recommendation_strength
```

## 27.3 Output Type

```ts
type SustainableTourismIndicators = {
  improvementPriorities: AttractionInsight[];
  promotionOpportunities: AttractionInsight[];
  concentration: Array<{
    attractionId: number;
    attractionName: string;
    shareOfVisits: number;
  }>;
  overnightStayRatio: number | null;
};
```

## 27.4 Rule

These are decision-support indicators, not absolute truth.

Dashboard should show limitations.

---

## 28. Data Freshness Service

Method:

```ts
getDataFreshness()
```

## 28.1 Output

```ts
type DataFreshness = {
  sourceType: "live" | "summary_table" | "materialized_view" | "cached";
  lastUpdatedAt: string;
};
```

MVP can return:

```text
sourceType = live
lastUpdatedAt = current server timestamp
```

If using summary tables later, return actual refresh time.

---

## 29. Permission Requirements

Dashboard services require:

```text
dashboard.read
```

Sensitive sections may require:

```text
dashboard.sensitive_view
```

Export actions from dashboard require:

```text
export.create
```

Dashboard services must never return direct identifiers by default:

```text
email
LINE user ID
provider_user_id
device token
private storage path
raw uploaded photo path
```

---

## 30. Query Performance Requirements

## 30.1 MVP

Use indexed raw queries.

Required practices:

```text
date filters
indexed joins
limited ranked tables
pagination for detail tables
select only needed columns
```

## 30.2 Production

Move heavy aggregations to:

```text
summary tables
materialized views
scheduled refresh jobs
dashboard cache
```

See:

```text
docs/database/ANALYTICS_TABLES.md
```

---

## 31. Required Indexes

Recommended indexes:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
visits(photo_spot_id)
visits(completion_status)
attractions(province_id)
certificates(visit_id)
certificates(generated_at)
tourist_stamps(tourist_id)
tourist_stamps(attraction_id)
satisfaction_surveys(visit_id)
satisfaction_surveys(attraction_id)
satisfaction_surveys(completed_at)
satisfaction_surveys(overall_score)
visit_expenses(visit_id)
visit_expenses(spending_range)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
```

---

## 32. Caching Strategy

## 32.1 MVP

No complex cache required.

Use live database queries with indexes.

## 32.2 Production

Possible caching:

```text
per filter hash
short TTL cache
summary table refresh
materialized view refresh
```

Cache invalidation must consider:

```text
new visits
new certificates
new surveys
new expense data
admin attraction changes
```

---

## 33. API Response Shape

Dashboard APIs should use consistent format.

Example:

```ts
type DashboardResponse<T> = {
  success: true;
  data: T;
  meta: {
    filters: DashboardFilters;
    dataFreshness: DataFreshness;
    limitations?: string[];
  };
};
```

Error:

```ts
type DashboardErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

---

## 34. Limitations Metadata

Some responses should include limitations.

Examples:

```text
Tourist profiles may not equal unique real people.
Estimated spending is self-reported and range-based.
Local platform visits are participation records, not official arrivals.
Missing satisfaction responses are excluded from averages.
```

This helps dashboard UI communicate responsibly.

---

## 35. Testing Requirements

Test dashboard services with:

```text
no data
single province data
multiple province data
missing satisfaction
missing expense
guest users
repeat visits
repeat stamps
invalid filter
date range filter
province filter
attraction filter
division by zero
large date range
permission denied
```

---

## 36. Unit Test Examples

## 36.1 Survey Completion Rate

Given:

```text
10 certificates
4 completed surveys
```

Expected:

```text
surveyCompletionRate = 0.4
```

Given:

```text
0 certificates
0 surveys
```

Expected:

```text
surveyCompletionRate = null
```

## 36.2 Average Satisfaction

Given scores:

```text
5, 4, null, 3
```

Expected:

```text
average = 4
```

Do not include null as 0.

## 36.3 Stamp Count

Given:

```text
tourist visits same attraction twice
one tourist_stamps record
```

Expected:

```text
visit_count = 2
stamp_count = 1
```

---

## 37. MVP Acceptance Checklist

```text
[ ] Dashboard filter schema exists.
[ ] Executive metrics service exists.
[ ] Visits by province service exists.
[ ] Visits by attraction service exists.
[ ] Tourist origin distribution service exists.
[ ] Travel behavior metrics service exists or planned.
[ ] Expense metrics service exists or planned.
[ ] Satisfaction metrics service exists or planned.
[ ] Funnel metrics service exists or planned.
[ ] Metrics exclude private identity fields.
[ ] Missing satisfaction is not treated as zero.
[ ] QR scans are not counted as visits.
[ ] Spending is returned as estimated.
[ ] Date/province/attraction filters work.
[ ] Division by zero returns null, not misleading 0.
[ ] Services are permission-protected.
```

---

## 38. Do Not Do

Do not:

```text
Load all raw records into frontend for aggregation.
Count QR scans as visits.
Count visits as unique tourists.
Count missing satisfaction as zero.
Call estimated spending revenue.
Expose email or LINE ID in dashboard response.
Ignore dashboard filters.
Return raw SQL errors.
Create chart data without metric definitions.
Use unbounded queries forever.
```

---

## 39. Future Enhancements

Possible future improvements:

```text
materialized views
summary tables
dashboard cache
official data comparison
map-based analytics
route analysis
campaign analytics
forecasting after enough data
scheduled dashboard snapshots
advanced researcher filters
```

---

## 40. Final Dashboard Service Rule

Dashboard services must protect the meaning of the numbers.

A beautiful dashboard with wrong definitions is worse than no dashboard.
