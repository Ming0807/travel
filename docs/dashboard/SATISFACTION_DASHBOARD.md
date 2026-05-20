# SATISFACTION_DASHBOARD.md

## 1. Document Purpose

This document defines the Satisfaction Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

The Satisfaction Dashboard helps stakeholders understand tourist experience quality across attractions, provinces, and service dimensions.

It supports sustainable tourism planning by identifying strengths, problems, and improvement priorities.

---

## 2. Dashboard Mission

The mission of the Satisfaction Dashboard is:

```text
Measure tourist experience quality and identify improvement priorities for southern border tourism.
```

It should answer:

```text
How satisfied are tourists overall?
Which attractions have high or low satisfaction?
Which provinces show stronger visitor experience?
Which service dimensions need improvement?
Would tourists revisit?
Would tourists recommend the attraction?
Which comments or issues need attention?
```

---

## 3. Why Satisfaction Matters

Satisfaction data supports:

```text
service improvement
attraction quality management
visitor experience planning
promotion prioritization
sustainable tourism development
community tourism quality
repeat visit strategy
word-of-mouth potential
```

High visits alone do not mean good tourism quality.

A professional dashboard should compare:

```text
visit volume
satisfaction
recommendation
revisit intention
```

---

## 4. Important Interpretation Rule

Satisfaction data is based on optional survey responses.

Therefore:

```text
missing satisfaction is not zero
average satisfaction includes only submitted scores
low response count must be shown
comments may contain personal data
```

Never assume all tourists answered satisfaction questions.

---

## 5. Dashboard Audience

Primary users:

```text
tourism planner
researcher
admin
local tourism staff
```

Secondary users:

```text
attraction managers
community tourism operators
instructors/project evaluators
```

---

## 6. Route

Recommended future route:

```text
/admin/dashboard/satisfaction
```

MVP can include this as a section inside:

```text
/admin/dashboard
```

---

## 7. Required Permission

Required permission:

```text
dashboard.read
```

Reading raw comments may require:

```text
survey.comment_read
```

Exporting comments may require:

```text
export.comments
```

MVP should not expose raw comments widely.

---

## 8. Data Privacy Principle

Satisfaction dashboard should use aggregated data by default.

Do not show:

```text
tourist display name
email
LINE user ID
provider_user_id
device token
private photo path
private certificate URL
```

Raw comments should be restricted because tourists may type personal information.

---

## 9. Page Structure

Recommended structure:

```text
Page Header
Global Filter Bar
Satisfaction KPI Cards
Overall Satisfaction Trend
Satisfaction by Province
Satisfaction by Attraction
Service Dimension Scores
Revisit and Recommendation Analysis
Low Satisfaction Alerts
Comment/Issue Summary
Planning Insight Cards
Export Actions
```

---

## 10. Page Header

## 10.1 Title

```text
Satisfaction Dashboard
```

Thai:

```text
แดชบอร์ดความพึงพอใจนักท่องเที่ยว
```

## 10.2 Description

```text
Analyze tourist satisfaction, service quality, revisit intention, recommendation intention, and improvement priorities.
```

Thai:

```text
วิเคราะห์ความพึงพอใจ คุณภาพบริการ ความตั้งใจกลับมาเที่ยวซ้ำ ความตั้งใจแนะนำ และประเด็นที่ควรปรับปรุง
```

## 10.3 Required Note

```text
Satisfaction data is based on optional survey responses. Missing responses are excluded from averages.
```

Thai:

```text
ข้อมูลความพึงพอใจมาจากแบบสอบถามที่ตอบโดยสมัครใจ คำตอบที่ไม่ได้กรอกจะไม่ถูกนำมาคิดเป็นคะแนนศูนย์
```

---

## 11. Global Filters

Required filters:

```text
date range
province
attraction
```

Optional filters:

```text
origin country
origin province
age group
transport mode
travel purpose
spending range
overall score range
revisit intention
recommendation intention
```

Date field recommendation:

```text
visits.visit_date
```

Alternative for survey operations:

```text
satisfaction_surveys.completed_at
```

The selected dashboard implementation must clearly define which date field is used.

---

# KPI Cards

---

## 12. Required KPI Cards

```text
Survey Response Count
Average Overall Satisfaction
Low Satisfaction Count
Revisit Intention Rate
Recommendation Intention Rate
Top Rated Attraction
Lowest Rated Attraction
```

Optional:

```text
Average Safety Score
Average Cleanliness Score
Average Transport Score
Average Information Score
Average Service Score
Average Value for Money Score
```

---

## 13. KPI: Survey Response Count

## 13.1 Metric Key

```text
satisfaction_response_count
```

## 13.2 Meaning

Number of completed satisfaction survey responses in selected filters.

## 13.3 Calculation

```sql
count(satisfaction_surveys.satisfaction_id)
```

## 13.4 Display

```text
845 responses
```

## 13.5 Tooltip

```text
Number of submitted satisfaction surveys. Survey is optional.
```

---

## 14. KPI: Average Overall Satisfaction

## 14.1 Metric Key

```text
average_satisfaction
```

## 14.2 Meaning

Average overall satisfaction score from submitted surveys.

## 14.3 Calculation

```sql
avg(satisfaction_surveys.overall_score)
where overall_score is not null
```

## 14.4 Display

```text
4.3 / 5
```

## 14.5 Missing Data Rule

If no valid scores:

```text
return null
display No data
```

Never show 0 for missing responses.

---

## 15. KPI: Low Satisfaction Count

## 15.1 Metric Key

```text
low_satisfaction_count
```

## 15.2 Meaning

Number of responses with low overall satisfaction.

## 15.3 Recommended Threshold

```text
overall_score <= 2
```

Configurable.

## 15.4 Calculation

```sql
count(satisfaction_id)
where overall_score <= 2
```

## 15.5 Planning Use

Shows potential service quality problems requiring review.

---

## 16. KPI: Revisit Intention Rate

## 16.1 Metric Key

```text
revisit_intention_rate
```

## 16.2 Meaning

Percentage of respondents who said they would revisit.

## 16.3 Calculation

```text
count(revisit_intention = true) / count(revisit_intention is not null)
```

## 16.4 Zero Denominator Rule

If denominator is zero:

```text
return null
display No data
```

---

## 17. KPI: Recommendation Intention Rate

## 17.1 Metric Key

```text
recommendation_intention_rate
```

## 17.2 Meaning

Percentage of respondents who said they would recommend the attraction.

## 17.3 Calculation

```text
count(recommendation_intention = true) / count(recommendation_intention is not null)
```

## 17.4 Planning Use

Indicates word-of-mouth potential.

---

## 18. KPI: Top Rated Attraction

## 18.1 Metric Key

```text
top_rated_attraction
```

## 18.2 Meaning

Attraction with the highest average satisfaction score among attractions with enough responses.

## 18.3 Calculation

```text
avg(overall_score)
group by attraction
having response_count >= minimum_response_threshold
order by avg desc
limit 1
```

## 18.4 Recommended Minimum Response Threshold

MVP:

```text
3 responses
```

Production:

```text
10 responses or configurable
```

## 18.5 Tooltip

```text
Highest average satisfaction among attractions with enough responses.
```

---

## 19. KPI: Lowest Rated Attraction

## 19.1 Metric Key

```text
lowest_rated_attraction
```

## 19.2 Meaning

Attraction with the lowest average satisfaction score among attractions with enough responses.

## 19.3 Calculation

```text
avg(overall_score)
group by attraction
having response_count >= minimum_response_threshold
order by avg asc
limit 1
```

## 19.4 Planning Use

Highlights attractions needing review.

---

# Main Analytics Sections

---

## 20. Overall Satisfaction Trend

## 20.1 Purpose

Show satisfaction changes over time.

## 20.2 Chart

Recommended:

```text
line chart
```

## 20.3 Calculation

```text
avg(overall_score)
group by day/week/month
```

## 20.4 Date Field

Options:

```text
visits.visit_date
satisfaction_surveys.completed_at
```

Implementation must state chosen field.

## 20.5 Display

```text
average score
response count
```

## 20.6 Empty State

```text
No satisfaction responses in the selected date range.
```

---

## 21. Satisfaction by Province

## 21.1 Purpose

Compare satisfaction across Yala, Pattani, and Narathiwat.

## 21.2 Chart

Recommended:

```text
bar chart
table
```

## 21.3 Columns

```text
province_name
average_overall_score
response_count
low_score_count
revisit_intention_rate
recommendation_intention_rate
```

## 21.4 Planning Use

Helps provincial-level quality improvement planning.

## 21.5 Caution

Province comparison should consider response count.

---

## 22. Satisfaction by Attraction

## 22.1 Purpose

Identify high and low performing attractions.

## 22.2 Recommended UI

```text
ranked table
bar chart
```

## 22.3 Columns

```text
rank
attraction_name
province_name
average_overall_score
response_count
low_score_count
revisit_intention_rate
recommendation_intention_rate
visit_count
```

## 22.4 Sorting Options

```text
highest satisfaction
lowest satisfaction
most responses
low satisfaction count
```

## 22.5 Planning Use

Helps identify:

```text
promotion candidates
improvement priorities
visitor experience problems
```

---

## 23. Service Dimension Scores

## 23.1 Purpose

Understand which specific service dimensions need improvement.

## 23.2 Optional Dimension Fields

```text
safety_score
cleanliness_score
transport_score
information_score
service_score
value_for_money_score
```

## 23.3 Chart

Recommended:

```text
radar chart optional
bar chart recommended
```

Bar chart is easier to read and more accessible.

## 23.4 Calculation

```text
avg(score_field)
where score_field is not null
```

## 23.5 Missing Data Rule

Each dimension average must use only non-null values.

## 23.6 Planning Use

Examples:

- Low transport score: access/signage/transport issue.
- Low cleanliness score: maintenance issue.
- Low information score: signage/content issue.
- Low value score: pricing/experience mismatch.

---

## 24. Revisit and Recommendation Analysis

## 24.1 Purpose

Measure future demand and word-of-mouth potential.

## 24.2 Recommended Visuals

```text
revisit intention rate by attraction
recommendation intention rate by attraction
comparison table
```

## 24.3 Columns

```text
attraction_name
response_count
revisit_intention_rate
recommendation_intention_rate
average_satisfaction
```

## 24.4 Planning Use

High recommendation + high satisfaction suggests promotion opportunity.

Low revisit + low satisfaction suggests improvement priority.

---

## 25. Low Satisfaction Alerts

## 25.1 Purpose

Highlight attractions that may require action.

## 25.2 Alert Rules

Recommended MVP rule:

```text
average_overall_score < 3.0
and response_count >= 3
```

or:

```text
low_score_count >= 3
```

Production threshold should be configurable.

## 25.3 Alert Table Columns

```text
attraction_name
province_name
average_score
response_count
low_score_count
top_low_dimension
latest_low_score_date
```

## 25.4 Planning Use

Supports service quality review.

---

## 26. Comment and Issue Summary

## 26.1 MVP Status

Optional and permission-restricted.

## 26.2 Purpose

Summarize qualitative feedback.

## 26.3 Privacy Rule

Raw comments may include personal data.

Default dashboard should show:

```text
comment_count
common issue tags future
admin-reviewed highlights future
```

not all raw comments.

## 26.4 Future Enhancement

Possible:

```text
manual tagging
AI-assisted topic clustering
sentiment summary
moderation workflow
```

Must be privacy-reviewed before production.

---

## 27. Satisfaction vs Visits Analysis

## 27.1 Purpose

Combine quantity and quality.

## 27.2 Recommended Table

```text
attraction_name
visit_count
average_satisfaction
response_count
category
```

## 27.3 Insight Categories

```text
High visit / high satisfaction
High visit / low satisfaction
Low visit / high satisfaction
Low visit / low satisfaction
```

## 27.4 Planning Use

This is one of the most useful sustainable tourism views.

---

## 28. Satisfaction vs Spending Analysis

## 28.1 MVP Status

Optional.

## 28.2 Purpose

Understand whether higher spending relates to better or worse satisfaction.

## 28.3 Recommended View

```text
spending_range
response_count
average_satisfaction
recommendation_intention_rate
```

## 28.4 Caution

Correlation is not causation.

Do not overstate.

---

## 29. Planning Insight Cards

## 29.1 High Satisfaction Promotion Candidate

Condition:

```text
average_satisfaction >= 4.2
and response_count >= threshold
```

Insight:

```text
This attraction has strong visitor satisfaction and may be suitable for promotion.
```

## 29.2 Improvement Priority

Condition:

```text
average_satisfaction < 3.0
and response_count >= threshold
```

Insight:

```text
Visitor satisfaction is low. Review service quality, access, cleanliness, safety, or information.
```

## 29.3 High Visit Low Satisfaction Risk

Condition:

```text
visit_count high
average_satisfaction low
```

Insight:

```text
Many tourists participate here, but satisfaction is low. Improve experience before increasing promotion.
```

## 29.4 Low Visit High Satisfaction Opportunity

Condition:

```text
visit_count low
average_satisfaction high
```

Insight:

```text
Visitors rate this attraction highly, but participation is low. Consider targeted promotion or route packaging.
```

---

## 30. Backend Services

Recommended methods:

```ts
DashboardService.getSatisfactionMetrics(filters)
DashboardService.getSatisfactionByProvince(filters)
DashboardService.getSatisfactionByAttraction(filters)
DashboardService.getServiceDimensionScores(filters)
DashboardService.getRevisitRecommendationMetrics(filters)
DashboardService.getLowSatisfactionAlerts(filters)
DashboardService.getSatisfactionVisitMatrix(filters)
```

Possible combined method:

```ts
DashboardService.getSatisfactionDashboard(filters)
```

---

## 31. Response Type

Conceptual TypeScript:

```ts
type SatisfactionDashboardResponse = {
  kpis: {
    responseCount: number;
    averageOverallScore: number | null;
    lowSatisfactionCount: number;
    revisitIntentionRate: number | null;
    recommendationIntentionRate: number | null;
    topRatedAttraction?: string;
    lowestRatedAttraction?: string;
  };
  trend: Array<{
    dateLabel: string;
    averageScore: number | null;
    responseCount: number;
  }>;
  byProvince: Array<{
    provinceId: number;
    provinceName: string;
    averageScore: number | null;
    responseCount: number;
    lowScoreCount: number;
    revisitIntentionRate: number | null;
    recommendationIntentionRate: number | null;
  }>;
  byAttraction: Array<{
    attractionId: number;
    attractionName: string;
    provinceName: string;
    averageScore: number | null;
    responseCount: number;
    lowScoreCount: number;
    revisitIntentionRate: number | null;
    recommendationIntentionRate: number | null;
    visitCount: number;
  }>;
  dimensionScores: Array<{
    dimensionKey: string;
    label: string;
    averageScore: number | null;
    responseCount: number;
  }>;
  lowSatisfactionAlerts: Array<{
    attractionId: number;
    attractionName: string;
    provinceName: string;
    averageScore: number;
    responseCount: number;
    lowScoreCount: number;
  }>;
  limitations: string[];
};
```

---

## 32. Empty States

Required empty states:

```text
No satisfaction responses for the selected filters.
No service dimension scores yet.
No low satisfaction alerts.
No revisit intention data.
No recommendation intention data.
```

---

## 33. Loading States

Use:

```text
KPI skeletons
chart skeletons
table skeletons
```

---

## 34. Error States

Examples:

```text
Could not load satisfaction metrics.
Could not load satisfaction by attraction.
Could not load service dimension scores.
Could not load low satisfaction alerts.
```

Use section-level errors when possible.

---

## 35. Export Requirements

Export option:

```text
Export Satisfaction CSV
```

Default columns:

```text
satisfaction_id
visit_id
visit_date
province_name
attraction_name
overall_score
safety_score
cleanliness_score
transport_score
information_score
service_score
value_for_money_score
revisit_intention
recommendation_intention
completed_at
```

Comment column requires:

```text
export.comments
```

Excluded by default:

```text
display_name
email
LINE user ID
provider_user_id
device token
photo path
certificate path
```

---

## 36. Data Quality Requirements

Dashboard should show:

```text
response_count
response_rate
minimum threshold warning
missing dimension counts
```

Recommended survey response rate:

```text
satisfaction_response_count / certificate_count
```

If certificate count = 0:

```text
return null
```

---

## 37. Small Sample Warning

If response count is low, show note:

```text
This result is based on a small number of responses and should be interpreted carefully.
```

Recommended threshold:

```text
response_count < 10
```

MVP threshold can be:

```text
response_count < 3
```

---

## 38. Planning Interpretation Examples

## 38.1 Low Transport Score

```text
Transport/access score is lower than other dimensions. Review road access, parking, signage, and connection to public transport.
```

## 38.2 Low Information Score

```text
Information/signage score is low. Improve attraction descriptions, QR instructions, multilingual content, and on-site signage.
```

## 38.3 High Satisfaction but Low Visits

```text
Tourists who visit this attraction rate it highly, but participation is low. Consider targeted promotion or route packaging.
```

## 38.4 High Visits but Low Satisfaction

```text
This attraction has many visits but lower satisfaction. Prioritize experience improvement before further promotion.
```

---

## 39. Testing Checklist

Test:

```text
no satisfaction data
single response
multiple responses
missing overall score
missing dimension scores
low score alerts
zero certificate denominator
revisit true/false/null
recommendation true/false/null
province filter
attraction filter
date filter
small sample warning
export without comments
export with comments permission
```

---

## 40. MVP Acceptance Checklist

```text
[ ] Satisfaction dashboard section exists.
[ ] Survey response count exists.
[ ] Average satisfaction ignores null.
[ ] Missing satisfaction displays No data.
[ ] Satisfaction by attraction exists.
[ ] Satisfaction by province exists or is planned.
[ ] Revisit intention rate exists.
[ ] Recommendation intention rate exists.
[ ] Low satisfaction alert exists or is planned.
[ ] Service dimension scores exist or are planned.
[ ] Response count is shown with averages.
[ ] Raw comments are not exposed by default.
[ ] Export excludes direct identifiers.
```

---

## 41. Do Not Do

Do not:

```text
Treat missing satisfaction as 0.
Hide response count.
Compare attractions without showing sample size.
Expose raw comments to all users.
Expose personal identifiers.
Use satisfaction data as complete population truth.
Ignore optional survey bias.
```

---

## 42. Future Enhancements

Possible future improvements:

```text
comment topic analysis
sentiment classification
service quality index
visitor experience score
alert dashboard for low satisfaction
survey response improvement experiment
satisfaction by route/campaign
public-safe satisfaction report
```

---

## 43. Final Satisfaction Dashboard Rule

Satisfaction data should guide improvement, not blame.

Use it carefully, show sample size, and combine it with visits, spending, and travel behavior for better planning.
