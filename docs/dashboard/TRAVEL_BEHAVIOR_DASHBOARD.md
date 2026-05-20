# TRAVEL_BEHAVIOR_DASHBOARD.md

## 1. Document Purpose

This document defines the Travel Behavior Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

The Travel Behavior Dashboard helps tourism planners understand how tourists travel in Yala, Pattani, and Narathiwat.

It focuses on travel companion, group size, transport mode, travel purpose, overnight behavior, and trip characteristics.

---

## 2. Dashboard Mission

The mission of this dashboard is:

```text
Understand how tourists travel so planners can improve access, routes, services, packages, and sustainable tourism strategy.
```

It should answer:

```text
Do tourists travel alone, with family, friends, or tour groups?
How large are travel groups?
How do tourists arrive or move around?
Why are tourists visiting?
Are they same-day visitors or overnight tourists?
How many nights do they stay?
Which attractions depend on which travel behavior?
```

---

## 3. Why Travel Behavior Matters

Travel behavior data supports planning for:

```text
transport access
parking and traffic management
tour route design
multi-day tourism packages
local business opportunities
visitor services
tourism marketing
sustainable tourism development
```

Examples:

- High private car usage may indicate parking demand.
- High same-day visits may indicate weak overnight economy.
- High family travel may suggest family-friendly facilities.
- High tour group usage may suggest coordination with tour operators.
- Low public transport usage may indicate access barriers.

---

## 4. Dashboard Audience

Primary users:

```text
tourism planner
researcher
admin
local tourism staff
```

Secondary users:

```text
transport planners
community tourism operators
instructors/project evaluators
```

---

## 5. Route

Recommended future route:

```text
/admin/dashboard/travel-behavior
```

MVP can include this as a section inside:

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

or:

```text
export.visit_records
```

depending on export detail.

---

## 7. Data Privacy Principle

Travel behavior dashboard should show aggregated data by default.

Do not show:

```text
tourist display name
email
LINE user ID
device token
provider_user_id
private photo path
private certificate path
```

Allowed:

```text
transport mode
travel purpose
travel companion
group size range
overnight status
nights
attraction
province
date
```

---

## 8. Page Structure

Recommended structure:

```text
Page Header
Global Filter Bar
Travel Behavior KPI Cards
Travel Companion Distribution
Group Size Analysis
Transport Mode Distribution
Travel Purpose Distribution
Same-Day vs Overnight Section
Average Nights Section
Attraction Behavior Comparison
Planning Insight Cards
Export Actions
```

---

## 9. Page Header

## 9.1 Title

```text
Travel Behavior Dashboard
```

Thai:

```text
แดชบอร์ดพฤติกรรมการเดินทาง
```

## 9.2 Description

```text
Analyze how tourists travel, who they travel with, transport choices, purposes, and overnight behavior.
```

Thai:

```text
วิเคราะห์รูปแบบการเดินทาง ผู้ร่วมเดินทาง วิธีการเดินทาง วัตถุประสงค์ และพฤติกรรมการพักค้างคืน
```

---

## 10. Global Filters

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
travel companion
overnight status
```

Date field:

```text
visits.visit_date
```

---

# KPI Cards

---

## 11. Required KPI Cards

```text
Answered Travel Behavior Records
Most Common Transport Mode
Most Common Travel Purpose
Most Common Travel Companion
Average Group Size
Overnight Stay Rate
Average Nights
```

---

## 12. KPI: Answered Travel Behavior Records

## 12.1 Metric Key

```text
travel_behavior_response_count
```

## 12.2 Meaning

Number of visits with at least one travel behavior field answered.

## 12.3 Calculation

```text
count(visits.visit_id)
where travel_companion_id is not null
   or group_size is not null
   or transport_mode_id is not null
   or travel_purpose_id is not null
   or overnight_status is not null
   or nights is not null
```

## 12.4 Display

```text
1,245 responses
```

## 12.5 Tooltip

```text
Visits with at least one travel behavior answer. Travel behavior questions are usually collected after the certificate step.
```

---

## 13. KPI: Most Common Transport Mode

## 13.1 Metric Key

```text
most_common_transport_mode
```

## 13.2 Meaning

Transport mode with the highest response count.

## 13.3 Calculation

```text
count(visits.visit_id)
group by transport_mode_id
order by count desc
limit 1
```

## 13.4 Empty State

```text
No transport data
```

## 13.5 Planning Use

Indicates possible access and infrastructure priorities.

---

## 14. KPI: Most Common Travel Purpose

## 14.1 Metric Key

```text
most_common_travel_purpose
```

## 14.2 Meaning

Most common purpose of travel among respondents.

## 14.3 Calculation

```text
count(visits.visit_id)
group by travel_purpose_id
order by count desc
limit 1
```

## 14.4 Planning Use

Helps shape marketing and experience design.

---

## 15. KPI: Most Common Travel Companion

## 15.1 Metric Key

```text
most_common_travel_companion
```

## 15.2 Meaning

Most common companion type.

Examples:

```text
alone
family
friends
couple
tour_group
school_group
company_group
other
```

## 15.3 Calculation

```text
count(visits.visit_id)
group by travel_companion_id
order by count desc
limit 1
```

---

## 16. KPI: Average Group Size

## 16.1 Metric Key

```text
average_group_size
```

## 16.2 Meaning

Average number of people in tourist groups where group size was answered.

## 16.3 Calculation

```sql
avg(visits.group_size)
where group_size is not null
```

## 16.4 Missing Data Rule

Do not treat null group size as 0.

## 16.5 Display

```text
3.4 people
```

---

## 17. KPI: Overnight Stay Rate

## 17.1 Metric Key

```text
overnight_stay_rate
```

## 17.2 Meaning

Percentage of answered visits that are overnight trips.

## 17.3 Calculation

```text
count(overnight_status = 'overnight') / count(overnight_status is not null)
```

## 17.4 Zero Denominator Rule

If no overnight status answers:

```text
return null
display No data
```

## 17.5 Planning Use

Helps evaluate whether attractions support longer stays and local economic benefit.

---

## 18. KPI: Average Nights

## 18.1 Metric Key

```text
average_nights
```

## 18.2 Meaning

Average number of nights stayed among answered overnight records.

## 18.3 Calculation

```sql
avg(visits.nights)
where nights is not null
```

## 18.4 Rule

Do not treat missing nights as 0.

Same-day visits may have nights = 0 or null depending on schema. The definition must be consistent.

---

# Main Analytics Sections

---

## 19. Travel Companion Distribution

## 19.1 Purpose

Understand who tourists travel with.

## 19.2 Chart

Recommended:

```text
bar chart
```

## 19.3 Source Tables

```text
visits
travel_companions
```

## 19.4 Calculation

```sql
count(visits.visit_id)
group by visits.travel_companion_id
```

## 19.5 Display Columns

```text
travel_companion
visit_count
percentage
```

## 19.6 Planning Use

Examples:

- Family travel suggests need for toilets, shaded seating, food areas, stroller access.
- Friend groups suggest social/photo activities.
- Tour groups suggest group management and bus parking.
- Solo travelers suggest information and safety signage.

## 19.7 Empty State

```text
No travel companion data for the selected filters.
```

---

## 20. Group Size Analysis

## 20.1 Purpose

Understand tourist group size.

## 20.2 Recommended Visuals

```text
average group size KPI
group size distribution histogram or range bar chart
group size by attraction table
```

## 20.3 Suggested Group Size Ranges

```text
1 person
2 people
3-5 people
6-10 people
11-20 people
21+ people
```

## 20.4 Calculation

Range bucket:

```text
case when group_size = 1 then '1'
     when group_size = 2 then '2'
     when group_size between 3 and 5 then '3-5'
     when group_size between 6 and 10 then '6-10'
     when group_size between 11 and 20 then '11-20'
     else '21+'
end
```

## 20.5 Missing Data Rule

Exclude null from average.

Show unknown count separately if needed.

---

## 21. Transport Mode Distribution

## 21.1 Purpose

Understand transportation choices.

## 21.2 Chart

Recommended:

```text
bar chart
ranked table
```

## 21.3 Source Tables

```text
visits
transport_modes
```

## 21.4 Calculation

```sql
count(visits.visit_id)
group by visits.transport_mode_id
```

## 21.5 Suggested Transport Modes

```text
private_car
motorcycle
van
tour_bus
public_bus
train
plane
boat
walking
bicycle
other
prefer_not_to_answer
```

Actual master data can be adjusted.

## 21.6 Planning Use

Examples:

- High private car usage: parking, road access, traffic flow.
- High motorcycle usage: safety, parking, weather shelter.
- High tour bus usage: group arrival management.
- Low public transport: access improvement opportunity.

---

## 22. Travel Purpose Distribution

## 22.1 Purpose

Understand why tourists visit.

## 22.2 Chart

Recommended:

```text
bar chart
```

## 22.3 Source Tables

```text
visits
travel_purposes
```

## 22.4 Calculation

```sql
count(visits.visit_id)
group by visits.travel_purpose_id
```

## 22.5 Suggested Travel Purposes

```text
leisure
nature
culture
religion
food
family_visit
education
business
event
photography
other
prefer_not_to_answer
```

## 22.6 Planning Use

Purpose data helps design:

```text
tour packages
event marketing
interpretive signage
cultural routes
nature routes
education programs
```

---

## 23. Same-Day vs Overnight Section

## 23.1 Purpose

Understand whether tourism creates longer stays.

## 23.2 Chart

Recommended:

```text
stacked bar chart
donut chart for simple overview
table by province/attraction
```

## 23.3 Source

```text
visits.overnight_status
```

## 23.4 Values

```text
same_day
overnight
unknown
prefer_not_to_answer
```

## 23.5 Calculation

```sql
count(visits.visit_id)
group by overnight_status
```

## 23.6 Planning Use

High same-day share may suggest:

```text
need for route packaging
overnight accommodation promotion
evening activities
multi-attraction itinerary design
```

High overnight share may suggest:

```text
local spending opportunity
hotel/homestay coordination
multi-day travel package potential
```

---

## 24. Average Nights Section

## 24.1 Purpose

Understand stay duration.

## 24.2 Metrics

```text
average nights
night distribution
average nights by province
average nights by attraction
```

## 24.3 Calculation

```sql
avg(nights)
where nights is not null
```

## 24.4 Suggested Night Buckets

```text
0 nights
1 night
2 nights
3 nights
4+ nights
```

## 24.5 Rule

Clearly define whether same-day visits are stored as 0 or null.

---

## 25. Attraction Behavior Comparison

## 25.1 Purpose

Compare travel behavior by attraction.

## 25.2 Recommended Table Columns

```text
attraction_name
province_name
visit_count
top_transport_mode
top_travel_purpose
average_group_size
overnight_rate
average_nights
```

## 25.3 Planning Use

Helps identify:

```text
attractions needing parking
attractions suitable for tour groups
attractions suitable for family packages
attractions with overnight potential
```

---

## 26. Province Behavior Comparison

## 26.1 Purpose

Compare behavior patterns across Yala, Pattani, and Narathiwat.

## 26.2 Recommended Table Columns

```text
province_name
visit_count
top_transport_mode
top_travel_purpose
average_group_size
overnight_rate
```

## 26.3 Planning Use

Helps provincial-level planning.

---

## 27. Insight Cards

## 27.1 Private Car Dependency

Condition:

```text
private_car share is high
```

Insight:

```text
High private car usage may indicate parking and road access should be reviewed.
```

## 27.2 Overnight Opportunity

Condition:

```text
same_day share high and satisfaction high
```

Insight:

```text
Visitors are satisfied but mostly same-day. Consider multi-attraction routes or overnight packages.
```

## 27.3 Group Travel Opportunity

Condition:

```text
large group/tour group share high
```

Insight:

```text
Group travel is visible. Consider bus parking, group check-in, and group-friendly services.
```

## 27.4 Family-Friendly Need

Condition:

```text
family companion share high
```

Insight:

```text
Family visitors are significant. Review toilets, seating, safety, food, and accessibility.
```

---

## 28. Backend Services

Recommended methods:

```ts
DashboardService.getTravelBehaviorMetrics(filters)
DashboardService.getTravelCompanionDistribution(filters)
DashboardService.getGroupSizeMetrics(filters)
DashboardService.getTransportModeDistribution(filters)
DashboardService.getTravelPurposeDistribution(filters)
DashboardService.getOvernightMetrics(filters)
DashboardService.getTravelBehaviorByAttraction(filters)
```

Possible combined method:

```ts
DashboardService.getTravelBehaviorDashboard(filters)
```

---

## 29. Response Type

Conceptual TypeScript:

```ts
type TravelBehaviorDashboardResponse = {
  kpis: {
    responseCount: number;
    mostCommonTransportMode?: string;
    mostCommonTravelPurpose?: string;
    mostCommonTravelCompanion?: string;
    averageGroupSize: number | null;
    overnightStayRate: number | null;
    averageNights: number | null;
  };
  travelCompanions: ChartPoint[];
  groupSizeDistribution: ChartPoint[];
  transportModes: ChartPoint[];
  travelPurposes: ChartPoint[];
  overnightStatus: ChartPoint[];
  nightsDistribution: ChartPoint[];
  byAttraction: Array<{
    attractionId: number;
    attractionName: string;
    provinceName: string;
    visitCount: number;
    topTransportMode?: string;
    topTravelPurpose?: string;
    averageGroupSize: number | null;
    overnightRate: number | null;
    averageNights: number | null;
  }>;
};
```

---

## 30. Empty States

Required empty states:

```text
No travel behavior data for the selected filters.
No transport mode data yet.
No travel purpose data yet.
No overnight data yet.
```

Do not show charts with fake zeros.

---

## 31. Loading States

Use:

```text
KPI skeletons
chart skeletons
table skeletons
```

---

## 32. Error States

Examples:

```text
Could not load travel behavior metrics.
Could not load transport mode distribution.
Could not load overnight analysis.
```

Use section-level errors when possible.

---

## 33. Export Requirements

Export option:

```text
Export Travel Behavior CSV
```

Default columns:

```text
visit_id
visit_date
province_name
attraction_name
travel_companion
group_size
transport_mode
travel_purpose
overnight_status
nights
```

Exclude:

```text
display_name
email
LINE user ID
device token
photo path
certificate path
```

---

## 34. Data Quality Considerations

Travel behavior is usually optional or post-certificate.

Therefore:

- response count must be visible.
- missing data must be shown honestly.
- percentages should use answered records as denominator unless stated otherwise.
- do not infer missing values.

Recommended data quality metrics:

```text
travel behavior response rate
transport mode answer rate
overnight status answer rate
group size answer rate
```

---

## 35. Planning Interpretation Examples

## 35.1 High Private Car Usage

```text
Private car is the most common transport mode. Attraction planning should consider parking capacity, road access, traffic flow, and signage.
```

## 35.2 High Same-Day Travel

```text
Most visitors are same-day travelers. Consider linking attractions into routes and promoting overnight stays.
```

## 35.3 High Family Travel

```text
Family travel is common. Facilities for children, seniors, toilets, food, shade, and safety should be reviewed.
```

## 35.4 High Nature Purpose

```text
Nature is a major travel purpose. Sustainable nature tourism management, carrying capacity, and environmental protection should be considered.
```

---

## 36. Testing Checklist

Test:

```text
no travel behavior data
only transport mode data
only overnight data
missing group size
group size outliers
same-day only
overnight only
mixed attractions
province filter
attraction filter
date filter
export permission
export output
```

---

## 37. MVP Acceptance Checklist

```text
[ ] Travel behavior dashboard section exists.
[ ] Travel companion distribution exists.
[ ] Transport mode distribution exists.
[ ] Travel purpose distribution exists.
[ ] Average group size ignores null.
[ ] Same-day vs overnight distribution exists.
[ ] Average nights ignores null.
[ ] Attraction comparison table exists or is planned.
[ ] Missing data is handled honestly.
[ ] No private identifiers are displayed.
[ ] Export is privacy-safe.
```

---

## 38. Do Not Do

Do not:

```text
Treat missing group size as 0.
Treat missing nights as 0 without definition.
Guess transport mode.
Show personal identity fields.
Use travel behavior percentages without denominator clarity.
Hide answer count.
Call optional survey data complete population data.
```

---

## 39. Future Enhancements

Possible enhancements:

```text
route development recommendations
transport accessibility score
map-based transport pattern visualization
overnight package opportunity score
group tour readiness score
seasonal travel behavior comparison
origin-to-attraction behavior matrix
```

---

## 40. Final Travel Behavior Dashboard Rule

Travel behavior data should support practical planning decisions.

It must show how tourists actually move, not just how many visits were recorded.
