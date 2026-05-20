# SUSTAINABLE_TOURISM_DASHBOARD.md

## 1. Document Purpose

This document defines the Sustainable Tourism Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

This dashboard translates tourism participation, behavior, spending, satisfaction, and funnel data into planning indicators for sustainable tourism development in Yala, Pattani, and Narathiwat.

It is designed to make the project more than a CRUD system or basic chart dashboard.

---

## 2. Dashboard Mission

The mission of the Sustainable Tourism Dashboard is:

```text
Support balanced, evidence-based tourism development that improves visitor experience, local economic benefit, and attraction management.
```

It should answer:

```text
Which attractions should be promoted?
Which attractions need improvement first?
Where is tourism concentrated?
Where are hidden opportunities?
Which attractions may support overnight routes?
Where may local economic benefit be improved?
Which areas show access or service issues?
How can tourism development be more sustainable?
```

---

## 3. Why This Dashboard Matters

The original project is about:

```text
tourist database
planning
sustainable tourism development
southern border tourism
```

Therefore, the dashboard should not only show counts.

It must help interpret data for:

```text
promotion planning
quality improvement
visitor distribution
local economy
overnight route design
community tourism
service/infrastructure priorities
data collection improvement
```

---

## 4. Dashboard Audience

Primary users:

```text
tourism planner
researcher
local government staff
project evaluator
admin
```

Secondary users:

```text
community tourism operators
attraction managers
tourism promotion teams
academic report readers
```

---

## 5. Route

Recommended future route:

```text
/admin/dashboard/sustainability
```

MVP can include selected insight cards inside:

```text
/admin/dashboard
```

---

## 6. Required Permission

Required permission:

```text
dashboard.read
```

Export requires:

```text
export.create
```

Sensitive or detailed exports require more specific permissions.

---

## 7. Sustainability Interpretation Principle

This dashboard provides decision-support indicators.

It does not automatically prove causation.

Every insight should be framed as:

```text
indicator
signal
opportunity
priority
risk
```

not as absolute truth.

Avoid overclaiming.

Required caution labels:

- QR Scans are not Visits.
- Tourist Profiles are not verified unique people.
- Estimated Spending is not Revenue.
- Missing Satisfaction is `No data`, not `0`.
- Low visit count may mean weak QR placement, not true lack of tourism demand.
- High concentration may reflect QR deployment or promotion, not only overuse.

---

## 8. Data Sources

This dashboard may use:

```text
visits
tourists
attractions
provinces
certificates
tourist_stamps
visit_expenses
satisfaction_surveys
funnel_events
transport_modes
travel_purposes
travel_companions
```

Future:

```text
official_tourism_stats
official_attraction_refs
capacity data
environmental indicators
community business data
```

---

## 9. Page Structure

Recommended structure:

```text
Page Header
Global Filter Bar
Sustainable Tourism KPI Cards
Planning Quadrant Matrix
Improvement Priorities
Promotion Opportunities
Attraction Concentration
Overnight and Route Opportunity
Local Economic Opportunity
Access and Transport Signals
Data Collection Quality
Recommended Actions
Export Actions
```

---

## 10. Page Header

## 10.1 Title

```text
Sustainable Tourism Dashboard
```

Thai:

```text
แดชบอร์ดการท่องเที่ยวอย่างยั่งยืน
```

## 10.2 Description

```text
Identify promotion opportunities, improvement priorities, participation concentration, visitor experience signals, and local economic opportunities.
```

Thai:

```text
ระบุโอกาสในการส่งเสริมการท่องเที่ยว จุดที่ควรปรับปรุง การกระจุกตัวของนักท่องเที่ยว สัญญาณด้านประสบการณ์ และโอกาสทางเศรษฐกิจท้องถิ่น
```

## 10.3 Required Note

```text
These indicators are decision-support signals based on platform participation data, not absolute official tourism measurements.
```

Thai:

```text
ตัวชี้วัดเหล่านี้เป็นสัญญาณเพื่อช่วยตัดสินใจจากข้อมูลการใช้งานระบบ ไม่ใช่ตัวเลขทางการท่องเที่ยวอย่างเป็นทางการทั้งหมด
```

---

## 11. Global Filters

Required:

```text
date range
province
attraction
```

Optional:

```text
origin country
origin province
age group
travel purpose
transport mode
overnight status
spending range
satisfaction score range
```

Date field rules should follow each metric definition.

---

# KPI Cards

---

## 12. Required KPI Cards

```text
Total Visits
Average Satisfaction
Estimated Spending
Survey Completion Rate
Attraction Concentration
Overnight Stay Rate
Promotion Opportunity Count
Improvement Priority Count
```

These should reuse definitions from:

```text
DASHBOARD_METRICS_DICTIONARY.md
```

---

## 13. KPI: Attraction Concentration

## 13.1 Metric Key

```text
attraction_concentration_rate
```

## 13.2 Meaning

Share of visits concentrated in top attractions.

## 13.3 Recommended Calculation

```text
top_3_attraction_visit_count / total_visit_count
```

## 13.4 Display

```text
62% of visits in top 3 attractions
```

## 13.5 Interpretation

High concentration may indicate:

```text
flagship attraction dominance
promotion imbalance
QR placement imbalance
possible crowding/capacity risk
```

## 13.6 Caution

High concentration does not automatically mean overcrowding.

Need capacity and official data for stronger conclusion.

---

## 14. KPI: Promotion Opportunity Count

## 14.1 Metric Key

```text
promotion_opportunity_count
```

## 14.2 Meaning

Number of attractions with low visit count but high satisfaction.

## 14.3 Recommended Rule

```text
visit_count < median_visit_count
average_satisfaction >= 4.0
response_count >= minimum_response_threshold
```

## 14.4 Interpretation

These attractions may be good candidates for targeted promotion.

---

## 15. KPI: Improvement Priority Count

## 15.1 Metric Key

```text
improvement_priority_count
```

## 15.2 Meaning

Number of attractions with high visits but low satisfaction.

## 15.3 Recommended Rule

```text
visit_count >= median_visit_count
average_satisfaction < 3.5
response_count >= minimum_response_threshold
```

## 15.4 Interpretation

These attractions should be reviewed before increasing promotion.

---

## 16. KPI: Overnight Opportunity Rate

## 16.1 Metric Key

```text
overnight_opportunity_rate
```

## 16.2 Meaning

Share of satisfied same-day visitors that may indicate potential for longer-stay route planning.

## 16.3 Example Rule

```text
same_day visitors with satisfaction >= 4 / satisfied visitors with overnight_status answered
```

## 16.4 Caution

This is a heuristic, not proof that visitors will stay overnight.

---

# Main Insight Sections

---

## 17. Planning Quadrant Matrix

## 17.1 Purpose

Classify attractions by visit volume and satisfaction.

## 17.2 Matrix Axes

```text
X-axis: Visit Count
Y-axis: Average Satisfaction
```

## 17.3 Quadrants

```text
High Visit / High Satisfaction
High Visit / Low Satisfaction
Low Visit / High Satisfaction
Low Visit / Low Satisfaction
```

## 17.4 Quadrant Meaning

### High Visit / High Satisfaction

```text
Strong flagship attractions
```

Possible action:

```text
maintain quality
use as promotion anchor
monitor capacity
```

### High Visit / Low Satisfaction

```text
Improvement priority
```

Possible action:

```text
fix service/access/cleanliness/information before more promotion
```

### Low Visit / High Satisfaction

```text
Promotion opportunity
```

Possible action:

```text
include in routes
increase visibility
improve QR placement
```

### Low Visit / Low Satisfaction

```text
Needs diagnosis
```

Possible action:

```text
understand attraction readiness, access, content, or visitor expectation
```

## 17.5 Required Table Columns

```text
attraction_name
province_name
visit_count
average_satisfaction
response_count
quadrant
recommended_action
```

---

## 18. Improvement Priorities

## 18.1 Purpose

Identify attractions that should be improved before further promotion.

## 18.2 Recommended Rule

```text
high visit count
low average satisfaction
enough survey responses
```

## 18.3 Table Columns

```text
rank
attraction_name
province_name
visit_count
average_satisfaction
response_count
low_score_count
lowest_service_dimension
recommended_action
```

## 18.4 Possible Recommendations

```text
review service quality
improve cleanliness
improve transport/access
improve signage/information
review safety
review price/value perception
```

## 18.5 Planning Use

Improves sustainability by avoiding promotion of attractions that may disappoint visitors.

---

## 19. Promotion Opportunities

## 19.1 Purpose

Identify attractions that visitors like but do not yet receive many visits.

## 19.2 Recommended Rule

```text
low visit count
high satisfaction
enough responses
```

## 19.3 Table Columns

```text
rank
attraction_name
province_name
visit_count
average_satisfaction
response_count
top_travel_purpose
estimated_spending_range
recommended_action
```

## 19.4 Possible Recommendations

```text
promote through public website
include in route package
improve QR visibility
add 360 media
add story/history content
connect with nearby attractions
```

---

## 20. Attraction Concentration Analysis

## 20.1 Purpose

Understand whether participation is concentrated in a small number of attractions.

## 20.2 Metrics

```text
top 1 attraction share
top 3 attraction share
top 5 attraction share
province concentration
```

## 20.3 Chart

Recommended:

```text
ranked bar chart
Pareto chart optional
```

## 20.4 Planning Use

High concentration may suggest:

```text
flagship dominance
need to distribute tourists
need to promote secondary attractions
capacity monitoring
```

## 20.5 Caution

This is platform participation, not full destination crowding.

---

## 21. Overnight and Route Opportunity

## 21.1 Purpose

Identify opportunities for longer stays and route development.

## 21.2 Indicators

```text
same-day share
overnight share
average nights
high satisfaction same-day attractions
nearby attraction clusters future
travel purpose
spending range
```

## 21.3 Recommended Table Columns

```text
attraction_name
province_name
same_day_share
overnight_share
average_satisfaction
estimated_spending_range
route_opportunity_signal
```

## 21.4 Example Insight

```text
High satisfaction but mostly same-day visits may indicate potential for multi-attraction route packaging.
```

## 21.5 Future Enhancement

Route cluster analysis using:

```text
geolocation
travel time
province/district grouping
official attraction references
```

---

## 22. Local Economic Opportunity

## 22.1 Purpose

Identify where tourism may support local economic activity.

## 22.2 Indicators

```text
estimated spending range
expense category distribution
overnight share
souvenir/food spending share
visit count
satisfaction
```

## 22.3 Opportunity Categories

```text
food economy opportunity
souvenir/community product opportunity
accommodation opportunity
activity/service opportunity
transport/access improvement need
```

## 22.4 Table Columns

```text
attraction_name
province_name
estimated_spending_min
estimated_spending_max
top_expense_category
overnight_share
recommended_local_economic_action
```

## 22.5 Caution

Spending is estimated and self-reported.

---

## 23. Access and Transport Signals

## 23.1 Purpose

Use travel behavior and satisfaction to detect possible access issues.

## 23.2 Indicators

```text
transport mode distribution
transport/access satisfaction score
private car dependency
public transport low share
transport-related comments future
```

## 23.3 Example Signals

```text
high private car share + low transport score
low public transport share + low visit count
tour bus share + need group parking
```

## 23.4 Recommended Actions

```text
review parking
improve signage
coordinate transport routes
improve map/navigation content
support tour group management
```

---

## 24. Data Collection Quality

## 24.1 Purpose

Sustainable planning depends on data quality.

## 24.2 Metrics

```text
survey completion rate
expense response rate
satisfaction response rate
travel behavior response rate
origin completion rate
funnel drop-off at profile step
funnel drop-off at photo upload step
```

## 24.3 Planning Use

If data quality is weak, dashboard insight is weaker.

This section helps improve the system itself.

## 24.4 Example Insight

```text
Survey completion is low. Reduce survey length or improve post-certificate incentive.
```

---

## 25. Recommended Action Cards

Each action card should include:

```text
title
evidence metric
reason
suggested action
confidence level
```

Confidence levels:

```text
low
medium
high
```

Confidence depends on:

```text
response count
data completeness
consistency across metrics
```

---

## 26. Confidence Rules

## 26.1 High Confidence

Suggested:

```text
response_count >= 30
consistent metrics
clear pattern
```

## 26.2 Medium Confidence

Suggested:

```text
response_count 10-29
some supporting metrics
```

## 26.3 Low Confidence

Suggested:

```text
response_count < 10
limited data
missing key fields
```

MVP can use simpler thresholds.

---

## 27. Backend Services

Recommended methods:

```ts
DashboardService.getSustainableTourismIndicators(filters)
DashboardService.getPlanningQuadrantMatrix(filters)
DashboardService.getImprovementPriorities(filters)
DashboardService.getPromotionOpportunities(filters)
DashboardService.getAttractionConcentration(filters)
DashboardService.getOvernightRouteOpportunities(filters)
DashboardService.getLocalEconomicOpportunities(filters)
DashboardService.getAccessTransportSignals(filters)
DashboardService.getDataCollectionQuality(filters)
```

Possible combined method:

```ts
DashboardService.getSustainableTourismDashboard(filters)
```

---

## 28. Response Type

Conceptual TypeScript:

```ts
type SustainableTourismDashboardResponse = {
  kpis: {
    attractionConcentrationRate: number | null;
    promotionOpportunityCount: number;
    improvementPriorityCount: number;
    overnightStayRate: number | null;
    estimatedSpendingMin: number | null;
    estimatedSpendingMax: number | null;
    surveyCompletionRate: number | null;
  };
  planningMatrix: Array<{
    attractionId: number;
    attractionName: string;
    provinceName: string;
    visitCount: number;
    averageSatisfaction: number | null;
    responseCount: number;
    quadrant: string;
    recommendedAction: string;
    confidence: "low" | "medium" | "high";
  }>;
  improvementPriorities: PlanningInsight[];
  promotionOpportunities: PlanningInsight[];
  concentration: Array<{
    attractionId: number;
    attractionName: string;
    visitShare: number;
    cumulativeShare: number;
  }>;
  overnightOpportunities: PlanningInsight[];
  localEconomicOpportunities: PlanningInsight[];
  accessTransportSignals: PlanningInsight[];
  dataQuality: {
    surveyCompletionRate: number | null;
    expenseResponseRate: number | null;
    travelBehaviorResponseRate: number | null;
    funnelDropoffProfile: number | null;
    funnelDropoffPhoto: number | null;
  };
  limitations: string[];
};

type PlanningInsight = {
  insightKey: string;
  title: string;
  attractionId?: number;
  attractionName?: string;
  provinceName?: string;
  evidence: string;
  suggestedAction: string;
  confidence: "low" | "medium" | "high";
};
```

---

## 29. Data Limitations

This dashboard must display or provide access to limitations:

```text
Local platform visits are participation records, not official arrivals.
Satisfaction is based on optional survey responses.
Spending is self-reported and range-based.
High/low thresholds are analytical rules and should be reviewed.
Small response counts reduce confidence.
QR placement and promotion may affect participation counts.
```

---

## 30. Empty States

Required empty states:

```text
Not enough data to generate sustainable tourism insights.
No satisfaction responses available for planning matrix.
No expense data available for economic opportunity analysis.
No travel behavior data available for route opportunity analysis.
```

---

## 31. Loading States

Use:

```text
KPI skeletons
matrix skeleton
insight card skeletons
table skeletons
```

---

## 32. Error States

Examples:

```text
Could not load sustainable tourism indicators.
Could not load planning matrix.
Could not load promotion opportunities.
Could not load improvement priorities.
```

Use section-level errors if possible.

---

## 33. Export Requirements

Export option:

```text
Export Sustainable Tourism Insights CSV
```

Default columns:

```text
insight_type
attraction_name
province_name
evidence_metric
suggested_action
confidence
visit_count
average_satisfaction
response_count
estimated_spending_range
overnight_rate
```

Exclude:

```text
personal identifiers
raw comments
private file paths
provider IDs
```

---

## 34. Academic Report Use

This dashboard can support academic report sections:

```text
Chapter 1: problem and importance
Chapter 3: system analysis and design
Chapter 4: dashboard implementation and results
Chapter 5: conclusion and recommendations
```

Possible report statements:

```text
The system supports planning by identifying attractions with high satisfaction but low participation as promotion opportunities.
The system supports quality improvement by identifying attractions with high participation but low satisfaction.
The system supports sustainable tourism by combining visit, spending, satisfaction, and travel behavior data.
```

---

## 35. Testing Checklist

Test:

```text
no data
visits without satisfaction
satisfaction without enough response count
high visit high satisfaction
high visit low satisfaction
low visit high satisfaction
low visit low satisfaction
open-ended spending range
missing travel behavior
high same-day share
high overnight share
low survey completion
province filter
attraction filter
date filter
export permission
```

---

## 36. MVP Acceptance Checklist

```text
[ ] Sustainable tourism dashboard section exists or is planned.
[ ] Planning matrix logic is defined.
[ ] Improvement priority rule is defined.
[ ] Promotion opportunity rule is defined.
[ ] Attraction concentration metric is defined.
[ ] Overnight opportunity indicator is defined.
[ ] Local economic opportunity indicator is defined.
[ ] Data quality indicators are defined.
[ ] Confidence level logic is defined.
[ ] Limitations are displayed.
[ ] No personal identifiers are shown.
```

---

## 37. Do Not Do

Do not:

```text
Claim official tourism impact from platform data alone.
Call estimated spending revenue.
Treat low visit count as lack of demand without caution.
Treat high visit count as overcrowding without capacity data.
Compare satisfaction without response count.
Generate recommendations without evidence.
Expose personal identifiers.
Hide limitations and confidence levels.
```

---

## 38. Future Enhancements

Possible future improvements:

```text
map-based sustainability view
route cluster analysis
capacity/carrying indicator
official data comparison
community product opportunity index
environmental impact indicators
AI-assisted recommendation summaries
public-safe sustainability report
monthly planning report
```

---

## 39. Final Sustainable Tourism Dashboard Rule

Sustainable tourism planning requires balanced interpretation.

This dashboard should combine quantity, quality, behavior, spending, and data reliability to support better decisions.
