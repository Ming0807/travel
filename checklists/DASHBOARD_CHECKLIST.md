# DASHBOARD_CHECKLIST.md

## 1. Document Purpose

This checklist defines dashboard readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The dashboard must support the original project goal:

```text
build a tourist database for southern border tourism planning and sustainable tourism development
```

It should not be decorative. It must help planners understand tourist profiles, travel behavior, attractions, spending, satisfaction, funnel drop-off, and sustainable tourism opportunities.

---

## 2. Dashboard Mission

The dashboard mission is:

```text
Turn tourist participation data into trustworthy planning insight.
```

The dashboard should help answer:

```text
Who visits?
Where do they visit?
How do they travel?
What do they spend on?
How satisfied are they?
Where do they drop out of the QR/certificate flow?
Which attractions should be promoted?
Which attractions should be improved?
How can tourism development be more sustainable?
```

---

## 3. Dashboard Quality Principles

A good dashboard must be:

```text
accurate
privacy-safe
clear
filterable
fast
actionable
honest about limitations
not misleading
```

Bad dashboard behavior:

```text
showing wrong metrics
calling estimates revenue
hiding missing data
mixing QR scans with visits
showing personal identifiers
using charts without planning purpose
```

---

## 4. Related Documents

This checklist must align with:

```text
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
docs/testing/ACCEPTANCE_CRITERIA.md
```

---

# Global Dashboard Checklist

---

## 5. Dashboard Access

Checklist:

```text
[ ] Dashboard route requires authentication.
[ ] dashboard.read permission is required.
[ ] Viewer can access allowed dashboard.
[ ] Admin can access dashboard.
[ ] Anonymous user cannot access dashboard.
[ ] Dashboard API checks permission server-side.
[ ] Dashboard does not rely only on frontend route guard.
```

---

## 6. Global Filters

Required filters:

```text
[ ] Date range.
[ ] Province.
[ ] Attraction.
```

Recommended optional filters:

```text
[ ] Origin country.
[ ] Origin province.
[ ] Age group.
[ ] Transport mode.
[ ] Travel purpose.
[ ] Overnight status.
[ ] Spending range.
[ ] Satisfaction score range.
```

Behavior checklist:

```text
[ ] Filters apply to all relevant sections.
[ ] Filters are reflected in URL query or state.
[ ] Filters can be reset.
[ ] Filter loading state appears.
[ ] Empty filtered data is handled.
[ ] Invalid filters are rejected server-side.
```

---

## 7. Data Freshness and Limitations

Checklist:

```text
[ ] Dashboard shows selected date range.
[ ] Dashboard shows data freshness or last updated time.
[ ] Dashboard explains local platform data is not official arrivals.
[ ] Dashboard explains estimated spending is self-reported.
[ ] Dashboard explains satisfaction is based on optional surveys.
[ ] Dashboard explains tourist profiles may not equal verified unique people.
[ ] Dashboard explains QR scans are not visits.
```

---

## 8. Privacy Requirements

Dashboard must not show by default:

```text
[ ] email
[ ] LINE user ID
[ ] provider_user_id
[ ] guest token
[ ] device token
[ ] raw IP address
[ ] raw user agent
[ ] private photo path
[ ] private certificate path
[ ] raw comments
```

Dashboard may show:

```text
[ ] counts
[ ] averages
[ ] percentages
[ ] distributions
[ ] ranked attractions
[ ] aggregated province metrics
[ ] planning insights
```

---

## 9. Loading / Empty / Error States

Checklist:

```text
[ ] Dashboard page has loading state.
[ ] KPI cards have skeleton/loading state.
[ ] Charts have loading state.
[ ] Tables have loading state.
[ ] No-data state is clear.
[ ] Section-level error states exist.
[ ] One failed section does not break whole dashboard if avoidable.
[ ] Error messages are safe.
```

---

## 10. Dashboard Performance

Checklist:

```text
[ ] Dashboard metrics are calculated server-side.
[ ] Dashboard does not load all raw rows into frontend.
[ ] Date filters are applied in backend queries.
[ ] Queries use indexes.
[ ] Large date ranges are handled safely.
[ ] Summary tables/materialized views are planned for scale.
[ ] Charts render without freezing UI.
```

---

# Executive Dashboard Checklist

---

## 11. Executive KPI Cards

Required KPI cards:

```text
[ ] Tourist Profiles
[ ] Total Visits
[ ] Certificates Generated
[ ] Stamps Earned
[ ] Survey Completion Rate
[ ] Average Satisfaction
[ ] Estimated Spending
[ ] Top Attraction
```

Optional:

```text
[ ] QR Scans
[ ] Certificate Conversion Rate
[ ] Photo Upload Rate
[ ] Returning Tourist Profiles
[ ] Passport Save Rate
```

---

## 12. Executive KPI Accuracy Rules

Checklist:

```text
[ ] Tourist Profiles uses count(distinct visits.tourist_id).
[ ] Tourist Profiles is not labeled Unique Tourists.
[ ] Total Visits counts visits only.
[ ] Total Visits does not include QR scans.
[ ] Certificates Generated counts certificate records.
[ ] Stamps Earned counts tourist_stamps.
[ ] Survey Completion Rate handles zero denominator.
[ ] Average Satisfaction ignores null values.
[ ] Estimated Spending uses spending range min/max.
[ ] Estimated Spending is not labeled Revenue.
[ ] Top Attraction uses visit count by attraction.
```

---

## 13. Executive Charts/Tables

Checklist:

```text
[ ] Visit trend chart exists.
[ ] Visits by province chart exists.
[ ] Top attractions table exists.
[ ] Engagement funnel summary exists.
[ ] Satisfaction/spending summary exists.
[ ] Planning insight cards exist or are planned.
```

---

# Tourist Profile Dashboard Checklist

---

## 14. Tourist Profile Metrics

Checklist:

```text
[ ] Tourist profile count uses visits in selected date range.
[ ] Domestic tourist profile count works.
[ ] Foreign tourist profile count works.
[ ] Top origin province works.
[ ] Top origin country works.
[ ] Most common age group works.
[ ] Preferred language distribution works.
```

---

## 15. Tourist Profile Distributions

Required:

```text
[ ] Domestic vs foreign distribution.
[ ] Origin country distribution.
[ ] Thai origin province distribution.
[ ] Age group distribution.
[ ] Preferred language distribution.
```

Recommended:

```text
[ ] Identity provider distribution.
[ ] Returning tourist summary.
[ ] Profile data quality section.
```

Privacy checklist:

```text
[ ] No email shown.
[ ] No LINE ID shown.
[ ] No provider_user_id shown.
[ ] No guest token shown.
```

---

## 16. Tourist Profile Interpretation Rules

Checklist:

```text
[ ] Unknown origin is not guessed.
[ ] Missing age group is shown as Unknown/Not answered.
[ ] Domestic vs foreign logic is documented.
[ ] Date-filtered profiles are counted through visits.
[ ] All profile distributions show counts and/or percentages.
```

---

# Travel Behavior Dashboard Checklist

---

## 17. Travel Behavior KPI Cards

Required:

```text
[ ] Travel Behavior Response Count
[ ] Most Common Transport Mode
[ ] Most Common Travel Purpose
[ ] Most Common Travel Companion
[ ] Average Group Size
[ ] Overnight Stay Rate
[ ] Average Nights
```

---

## 18. Travel Behavior Sections

Required:

```text
[ ] Travel companion distribution.
[ ] Group size distribution.
[ ] Transport mode distribution.
[ ] Travel purpose distribution.
[ ] Same-day vs overnight section.
[ ] Average nights section.
[ ] Attraction behavior comparison.
```

Rules:

```text
[ ] Missing group size is not treated as 0.
[ ] Missing nights is not treated as 0 unless defined.
[ ] Answer counts are visible.
[ ] Percentages use clear denominators.
```

---

# Expense Dashboard Checklist

---

## 19. Expense KPI Cards

Required:

```text
[ ] Expense Response Count
[ ] Estimated Spending Range
[ ] Most Common Spending Range
[ ] Top Expense Category
```

Optional:

```text
[ ] Average Spending Midpoint
[ ] Overnight Spending Share
```

---

## 20. Expense Sections

Required:

```text
[ ] Spending range distribution.
[ ] Estimated spending by province.
[ ] Estimated spending by attraction.
[ ] Expense category distribution.
```

Recommended:

```text
[ ] Expense vs overnight analysis.
[ ] Expense vs satisfaction analysis.
[ ] Expense by tourist origin.
```

---

## 21. Expense Interpretation Rules

Checklist:

```text
[ ] Spending is clearly labeled estimated.
[ ] Spending is not called revenue.
[ ] Self-reported limitation is visible.
[ ] Range-based limitation is visible.
[ ] Open-ended range is handled.
[ ] prefer_not_to_answer is handled correctly.
[ ] Missing expense is not shown as zero.
```

---

# Satisfaction Dashboard Checklist

---

## 22. Satisfaction KPI Cards

Required:

```text
[ ] Survey Response Count
[ ] Average Overall Satisfaction
[ ] Low Satisfaction Count
[ ] Revisit Intention Rate
[ ] Recommendation Intention Rate
[ ] Top Rated Attraction
[ ] Lowest Rated Attraction
```

Optional:

```text
[ ] Safety Score
[ ] Cleanliness Score
[ ] Transport Score
[ ] Information Score
[ ] Service Score
[ ] Value for Money Score
```

---

## 23. Satisfaction Sections

Required:

```text
[ ] Overall satisfaction trend.
[ ] Satisfaction by province.
[ ] Satisfaction by attraction.
[ ] Revisit/recommendation analysis.
[ ] Low satisfaction alerts.
```

Recommended:

```text
[ ] Service dimension scores.
[ ] Satisfaction vs visits matrix.
[ ] Satisfaction vs spending analysis.
[ ] Comment/issue summary with restrictions.
```

---

## 24. Satisfaction Rules

Checklist:

```text
[ ] Null scores are excluded from averages.
[ ] No responses returns No data.
[ ] Response count is shown with average.
[ ] Low satisfaction threshold is documented.
[ ] Small sample warning exists.
[ ] Raw comments are not shown by default.
[ ] Revisit/recommendation denominators exclude null.
```

---

# Funnel Dashboard Checklist

---

## 25. Funnel Stages

Required stages:

```text
[ ] QR Scanned
[ ] Landing Viewed
[ ] Certificate Started
[ ] Minimal Form Completed
[ ] Photo Uploaded
[ ] Certificate Generated
[ ] Survey Started
[ ] Survey Completed
[ ] Passport Saved
```

If some stages are not implemented yet:

```text
[ ] Missing stages are documented as future/planned.
```

---

## 26. Funnel Metrics

Required:

```text
[ ] Stage count.
[ ] Conversion from previous stage.
[ ] Drop-off from previous stage.
[ ] Largest drop-off step.
[ ] Funnel by attraction.
[ ] Funnel by photo spot or planned.
[ ] Funnel trend over time or planned.
```

Rules:

```text
[ ] Zero denominator returns null/No data.
[ ] QR scans are not counted as visits.
[ ] Event count is not called unique people.
[ ] Session count is labeled separately if used.
```

---

## 27. Funnel Insight Rules

Checklist:

```text
[ ] Low start rate suggests landing/CTA issue.
[ ] Low form completion suggests form friction.
[ ] Low photo upload suggests upload/browser/network issue.
[ ] Low survey completion suggests survey length/timing issue.
[ ] Low passport save suggests weak save incentive.
[ ] Insights are framed as hypotheses unless tested.
```

---

# Sustainable Tourism Dashboard Checklist

---

## 28. Sustainability Indicators

Required or planned:

```text
[ ] Attraction concentration.
[ ] Promotion opportunity count.
[ ] Improvement priority count.
[ ] Overnight opportunity indicator.
[ ] Local economic opportunity indicator.
[ ] Data collection quality indicators.
```

---

## 29. Planning Matrix

Checklist:

```text
[ ] High Visit / High Satisfaction category exists.
[ ] High Visit / Low Satisfaction category exists.
[ ] Low Visit / High Satisfaction category exists.
[ ] Low Visit / Low Satisfaction category exists.
[ ] Thresholds are documented.
[ ] Response count threshold is used.
[ ] Confidence level is shown or planned.
```

---

## 30. Sustainable Tourism Insight Rules

Checklist:

```text
[ ] Insights include evidence metric.
[ ] Insights include suggested action.
[ ] Insights include confidence level or data limitation.
[ ] Insights do not claim official tourism impact.
[ ] Insights do not treat platform visits as full arrivals.
[ ] Spending insights remain estimated.
```

---

# Metric Calculation Checklist

---

## 31. Zero and Null Rules

Checklist:

```text
[ ] Zero count is shown as 0 when real.
[ ] Missing data is shown as No data.
[ ] Zero denominator returns null/No data.
[ ] Null satisfaction is excluded from average.
[ ] Null expense is excluded from estimate.
[ ] Unknown/Not answered categories are not silently dropped unless documented.
```

---

## 32. Percentage Rules

Checklist:

```text
[ ] Denominator is documented.
[ ] Percentage handles denominator 0.
[ ] Percentage formatting is consistent.
[ ] Percentages sum reasonably when categories are exhaustive.
[ ] Non-exhaustive percentages explain denominator.
```

---

## 33. Date Filter Rules

Checklist:

```text
[ ] Visit-based metrics use visits.visit_date.
[ ] Funnel metrics use funnel_events.event_time.
[ ] Survey metrics clearly use visit_date or completed_at.
[ ] Export date filters match dashboard date logic.
[ ] Timezone behavior is consistent.
```

---

## 34. Province/Attraction Filter Rules

Checklist:

```text
[ ] Province filter applies through attraction/province relation.
[ ] Attraction filter applies correctly.
[ ] Attraction options update with province filter if implemented.
[ ] Invalid province-attraction combination handled.
```

---

# Dashboard UI Checklist

---

## 35. KPI Card UI

Checklist:

```text
[ ] KPI label is clear.
[ ] KPI value is readable.
[ ] Unit is visible.
[ ] Tooltip explains definition.
[ ] Loading skeleton exists.
[ ] No-data state exists.
[ ] Trend/compare label is not misleading.
```

---

## 36. Chart UI

Checklist:

```text
[ ] Chart title is clear.
[ ] Axis labels exist where needed.
[ ] Legend is readable.
[ ] Tooltip is readable.
[ ] Empty state replaces empty chart.
[ ] Chart does not rely only on color.
[ ] Mobile layout is acceptable.
```

---

## 37. Table UI

Checklist:

```text
[ ] Table columns are clear.
[ ] Sort options exist where useful.
[ ] Long names do not break layout.
[ ] Mobile/horizontal scroll works.
[ ] Empty state exists.
[ ] Export from table is controlled if implemented.
```

---

## 38. Insight Card UI

Checklist:

```text
[ ] Insight title is clear.
[ ] Evidence metric is shown.
[ ] Suggested action is shown.
[ ] Confidence/limitation is shown.
[ ] Insight is not overly absolute.
[ ] User can understand why insight appears.
```

---

# Export from Dashboard Checklist

---

## 39. Dashboard Export

Checklist:

```text
[ ] Export button requires permission.
[ ] Summary export works.
[ ] Export respects filters.
[ ] Export includes metric definitions or clear headers where possible.
[ ] Export excludes personal identifiers.
[ ] Export creates audit log.
[ ] Export loading state exists.
[ ] Export error state exists.
```

---

# Dashboard Testing Checklist

---

## 40. Unit Tests

Required unit tests:

```text
[ ] Funnel conversion.
[ ] Drop-off calculation.
[ ] Survey completion rate.
[ ] Average satisfaction.
[ ] Estimated spending min/max.
[ ] Open-ended spending range.
[ ] Attraction concentration.
[ ] Planning quadrant classification.
```

---

## 41. Integration Tests

Required integration tests:

```text
[ ] Executive dashboard metrics.
[ ] Tourist profile distributions.
[ ] Travel behavior metrics.
[ ] Expense metrics.
[ ] Satisfaction metrics.
[ ] Funnel metrics.
[ ] Sustainable tourism insights.
[ ] Dashboard filters.
[ ] Export privacy.
```

---

## 42. Manual Dashboard QA

Checklist:

```text
[ ] Dashboard loads with sample data.
[ ] Dashboard loads with no data.
[ ] Dashboard filters work.
[ ] KPI values match known seed data.
[ ] Charts are readable.
[ ] Tables are readable.
[ ] Tooltips explain definitions.
[ ] No private identifiers visible.
[ ] Export file matches displayed filters.
```

---

# Dashboard Acceptance Checklist

---

## 43. MVP Dashboard Acceptance

```text
[ ] Dashboard is protected.
[ ] Global filters exist.
[ ] Executive KPI cards exist.
[ ] Visit trend exists.
[ ] Visits by province exists.
[ ] Top attractions exists.
[ ] Tourist profile distribution exists.
[ ] Travel behavior distribution exists.
[ ] Expense distribution exists.
[ ] Satisfaction summary exists.
[ ] Funnel summary exists.
[ ] Sustainable tourism insight section exists or is planned.
[ ] Metrics follow dictionary definitions.
[ ] Dashboard is privacy-safe.
[ ] Dashboard shows data limitations.
[ ] Export summary works.
```

---

## 44. Critical Dashboard Blockers

Do not release if:

```text
[ ] QR scans are counted as visits.
[ ] Tourist profiles are called verified unique people.
[ ] Estimated spending is called revenue.
[ ] Missing satisfaction is displayed as 0.
[ ] Dashboard shows email/LINE ID/provider_user_id.
[ ] Dashboard loads raw personal rows into frontend.
[ ] Dashboard metrics do not match seed data.
[ ] Export includes private identifiers by default.
```

---

## 45. Do Not Do

Do not:

```text
build charts without metric definitions.
aggregate all raw data in frontend.
hide denominator rules.
hide response counts.
show fake zero for missing data.
use dashboard as personal tracking tool.
show raw comments by default.
export personal identifiers by default.
overclaim official tourism impact.
```

---

## 46. Future Dashboard Enhancements

Possible future improvements:

```text
materialized views.
dashboard cache.
official data comparison.
map-based dashboard.
route opportunity dashboard.
AI-assisted planning summary.
public-safe dashboard.
monthly PDF report.
researcher anonymized dataset export.
```

---

## 47. Final Dashboard Rule

Dashboard numbers must be trustworthy.

If a metric cannot be explained clearly, it should not be shown as a decision-making metric.
