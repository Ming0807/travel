# EXPENSE_DASHBOARD.md

## 1. Document Purpose

This document defines the Expense Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

The Expense Dashboard helps stakeholders understand self-reported tourist spending patterns in Yala, Pattani, and Narathiwat.

The dashboard must be careful: the system collects spending ranges, not verified transaction revenue.

---

## 2. Dashboard Mission

The mission of the Expense Dashboard is:

```text
Analyze tourist-reported spending patterns to support local economic planning and sustainable tourism development.
```

It should answer:

```text
What spending ranges do tourists report?
Which provinces or attractions show higher estimated spending?
What expense categories matter most?
How does spending relate to overnight behavior?
How does spending relate to satisfaction?
Where may local economic opportunities exist?
```

---

## 3. Important Interpretation Rule

Expense data in this system is:

```text
self-reported
range-based
optional
estimated
```

It is not:

```text
verified revenue
official tourism income
actual transaction data
tax data
business sales data
```

Therefore, always use labels such as:

```text
Estimated Spending
Tourist-Reported Spending Range
Self-Reported Spending
```

Never label it as:

```text
Revenue
Actual Income
Official Income
```

unless the system later integrates verified transaction data.

---

## 4. Dashboard Audience

Primary users:

```text
tourism planner
researcher
admin
local development planner
```

Secondary users:

```text
community tourism operators
local business support agencies
instructors/project evaluators
```

---

## 5. Route

Recommended future route:

```text
/admin/dashboard/expenses
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
export.expense_data
```

---

## 7. Data Privacy Principle

Expense dashboard should show aggregated data.

Do not show:

```text
tourist display name
email
LINE user ID
provider_user_id
device token
raw photo path
private certificate URL
```

Allowed:

```text
spending range
expense category
amount_min
amount_max
currency
province
attraction
visit date
travel behavior aggregates
satisfaction aggregates
```

---

## 8. Page Structure

Recommended structure:

```text
Page Header
Global Filter Bar
Expense KPI Cards
Spending Range Distribution
Estimated Spending by Province
Estimated Spending by Attraction
Expense Category Distribution
Expense vs Overnight Analysis
Expense vs Satisfaction Analysis
Planning Insight Cards
Data Limitation Note
Export Actions
```

---

## 9. Page Header

## 9.1 Title

```text
Expense Dashboard
```

Thai:

```text
แดชบอร์ดค่าใช้จ่ายนักท่องเที่ยว
```

## 9.2 Description

```text
Analyze self-reported tourist spending ranges and expense categories for planning and local economic insight.
```

Thai:

```text
วิเคราะห์ช่วงค่าใช้จ่ายและหมวดหมู่ค่าใช้จ่ายที่นักท่องเที่ยวรายงาน เพื่อสนับสนุนการวางแผนและเศรษฐกิจท้องถิ่น
```

## 9.3 Required Note

Show near top:

```text
Spending data is self-reported and range-based. It should be interpreted as an estimate, not verified revenue.
```

Thai:

```text
ข้อมูลค่าใช้จ่ายเป็นข้อมูลที่นักท่องเที่ยวรายงานเองในรูปแบบช่วงประมาณการ ไม่ใช่รายได้จริงที่ตรวจสอบแล้ว
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
spending range
expense category
origin country
origin province
age group
transport mode
travel purpose
overnight status
satisfaction score range
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
Expense Response Count
Estimated Spending Range
Most Common Spending Range
Top Expense Category
Average Spending Midpoint optional
Overnight Spending Share optional
```

---

## 12. KPI: Expense Response Count

## 12.1 Metric Key

```text
expense_response_count
```

## 12.2 Meaning

Number of visits with expense data submitted.

## 12.3 Source Tables

```text
visit_expenses
visits
```

## 12.4 Calculation

```sql
count(visit_expenses.expense_id)
```

## 12.5 Display

```text
845 responses
```

## 12.6 Tooltip

```text
Number of visits with self-reported expense information.
```

---

## 13. KPI: Estimated Spending Range

## 13.1 Metric Key

```text
estimated_spending_range
```

## 13.2 Meaning

Estimated total spending range from submitted expense ranges.

## 13.3 Source Tables

```text
visit_expenses
visits
```

## 13.4 Calculation

```text
sum(amount_min) to sum(amount_max)
```

For open-ended ranges:

```text
amount_max may be null
```

The service should return:

```text
estimated_min
estimated_max
has_open_ended_range
```

## 13.5 Display

```text
Estimated ฿120,000 - ฿250,000
```

If open-ended:

```text
Estimated ฿120,000+
```

## 13.6 Tooltip

```text
Estimated from tourist-selected spending ranges. This is not verified revenue.
```

---

## 14. KPI: Most Common Spending Range

## 14.1 Metric Key

```text
most_common_spending_range
```

## 14.2 Meaning

The most frequently selected spending range.

## 14.3 Calculation

```text
count(expense_id)
group by spending_range
order by count desc
limit 1
```

## 14.4 Display

Example:

```text
฿501 - ฿1,000
```

## 14.5 Planning Use

Helps understand typical visitor spending level.

---

## 15. KPI: Top Expense Category

## 15.1 Metric Key

```text
top_expense_category
```

## 15.2 Meaning

Most common main expense category.

## 15.3 Source Tables

```text
visit_expenses
expense_categories
```

## 15.4 Calculation

```text
count(expense_id)
group by expense_category_id
order by count desc
limit 1
```

## 15.5 Example Categories

```text
food_and_drink
transport
accommodation
souvenirs
entrance_fee
activities
other
```

---

## 16. KPI: Average Spending Midpoint

## 16.1 Metric Key

```text
average_spending_midpoint
```

## 16.2 Meaning

Average estimated spending midpoint from range answers.

## 16.3 Calculation

```text
avg((amount_min + amount_max) / 2)
```

Only for records with finite amount_max.

## 16.4 Limitation

This is an analytical approximation.

Must be labeled:

```text
Estimated average midpoint
```

Not:

```text
Average revenue
```

MVP can skip this KPI if concern about interpretation.

---

## 17. KPI: Overnight Spending Share

## 17.1 Metric Key

```text
overnight_spending_share
```

## 17.2 Meaning

Share of expense responses from overnight tourists.

## 17.3 Calculation

```text
expense responses where overnight_status = overnight / total expense responses
```

## 17.4 Planning Use

Helps assess whether overnight tourism contributes more to estimated spending.

---

# Main Analytics Sections

---

## 18. Spending Range Distribution

## 18.1 Purpose

Show how reported spending is distributed.

## 18.2 Chart

Recommended:

```text
bar chart
```

Avoid pie chart if many ranges.

## 18.3 Source Tables

```text
visit_expenses
visits
```

## 18.4 Calculation

```sql
count(expense_id)
group by spending_range
```

## 18.5 Recommended Spending Ranges

```text
0_500
501_1000
1001_2000
2001_5000
5001_plus
prefer_not_to_answer
```

## 18.6 Display Columns

```text
spending_range_label
response_count
percentage
estimated_min
estimated_max
```

## 18.7 Empty State

```text
No expense data for the selected filters.
```

---

## 19. Estimated Spending by Province

## 19.1 Purpose

Compare estimated spending across Yala, Pattani, and Narathiwat.

## 19.2 Chart

Recommended:

```text
bar chart
table
```

## 19.3 Source Tables

```text
visit_expenses
visits
attractions
provinces
```

## 19.4 Calculation

```text
sum(amount_min) and sum(amount_max)
group by province_id
```

## 19.5 Display Columns

```text
province_name
expense_response_count
estimated_min
estimated_max
has_open_ended_range
```

## 19.6 Planning Use

Helps identify where local economic opportunity may be higher.

## 19.7 Limitation

Province with more responses may show higher total estimate simply because of more platform participation.

Consider showing:

```text
estimated spending per response
```

as optional.

---

## 20. Estimated Spending by Attraction

## 20.1 Purpose

Identify attractions associated with higher estimated tourist spending.

## 20.2 Recommended UI

```text
ranked table
horizontal bar chart
```

## 20.3 Columns

```text
rank
attraction_name
province_name
expense_response_count
estimated_min
estimated_max
most_common_spending_range
top_expense_category
```

## 20.4 Planning Use

Helps identify:

```text
economic opportunity areas
attractions with high spending potential
locations for community product promotion
```

## 20.5 Caution

High estimated spending may reflect:

```text
more responses
overnight visitors
specific attraction type
sampling bias
```

Dashboard should not overstate causal interpretation.

---

## 21. Expense Category Distribution

## 21.1 Purpose

Show what tourists spend on.

## 21.2 Chart

Recommended:

```text
bar chart
```

## 21.3 Source Tables

```text
visit_expenses
expense_categories
visits
```

## 21.4 Calculation

```sql
count(expense_id)
group by expense_category_id
```

## 21.5 Suggested Categories

```text
food_and_drink
transport
accommodation
souvenirs
entrance_fee
activities
guide_service
other
prefer_not_to_answer
```

## 21.6 Planning Use

Examples:

- High food spending: local food promotion opportunity.
- High souvenir spending: community product opportunity.
- Low accommodation spending: weak overnight tourism.
- High transport spending: access cost issue.

---

## 22. Expense vs Overnight Analysis

## 22.1 Purpose

Understand whether overnight tourists report higher spending ranges.

## 22.2 Recommended Visuals

```text
stacked bar by overnight status and spending range
table comparing same-day vs overnight
```

## 22.3 Columns

```text
overnight_status
expense_response_count
most_common_spending_range
estimated_min
estimated_max
average_midpoint optional
```

## 22.4 Planning Use

Helps justify:

```text
multi-day route planning
homestay/hotel promotion
evening activities
cross-province tourism packages
```

---

## 23. Expense vs Satisfaction Analysis

## 23.1 Purpose

Understand relationship between spending and satisfaction.

## 23.2 MVP Status

Optional.

## 23.3 Recommended Visuals

```text
table by spending range with average satisfaction
scatter/box plot future
```

## 23.4 Columns

```text
spending_range
response_count
average_satisfaction
revisit_intention_rate
recommendation_intention_rate
```

## 23.5 Planning Use

Helps identify whether higher spending experiences also produce satisfaction.

## 23.6 Caution

Correlation is not causation.

---

## 24. Expense by Tourist Origin

## 24.1 MVP Status

Optional.

## 24.2 Purpose

Compare spending patterns by domestic/foreign origin or Thai province.

## 24.3 Recommended Columns

```text
origin_type
origin_country_or_province
expense_response_count
most_common_spending_range
estimated_min
estimated_max
```

## 24.4 Privacy Rule

Aggregate only.

Do not expose individual tourist data.

---

## 25. Planning Insight Cards

## 25.1 Food Economy Opportunity

Condition:

```text
food_and_drink is top expense category
```

Insight:

```text
Food and drink are major reported expenses. Local food promotion and community food routes may support local economic impact.
```

## 25.2 Souvenir/Product Opportunity

Condition:

```text
souvenirs category share is high
```

Insight:

```text
Souvenir spending is visible. Community products and local branding can be connected to tourist routes.
```

## 25.3 Overnight Economic Opportunity

Condition:

```text
overnight tourists show higher spending ranges
```

Insight:

```text
Overnight visitors report higher spending. Multi-day routes and accommodation partnerships may increase local benefit.
```

## 25.4 Low Spending Warning

Condition:

```text
most responses in low spending ranges
```

Insight:

```text
Reported spending is mostly low. Consider improving local products, activities, and longer-stay options.
```

---

## 26. Backend Services

Recommended methods:

```ts
DashboardService.getExpenseMetrics(filters)
DashboardService.getSpendingRangeDistribution(filters)
DashboardService.getEstimatedSpendingByProvince(filters)
DashboardService.getEstimatedSpendingByAttraction(filters)
DashboardService.getExpenseCategoryDistribution(filters)
DashboardService.getExpenseOvernightAnalysis(filters)
```

Possible combined method:

```ts
DashboardService.getExpenseDashboard(filters)
```

---

## 27. Response Type

Conceptual TypeScript:

```ts
type ExpenseDashboardResponse = {
  kpis: {
    expenseResponseCount: number;
    estimatedSpendingMin: number | null;
    estimatedSpendingMax: number | null;
    hasOpenEndedRange: boolean;
    mostCommonSpendingRange?: string;
    topExpenseCategory?: string;
    averageSpendingMidpoint?: number | null;
    overnightSpendingShare?: number | null;
  };
  spendingRanges: Array<{
    rangeKey: string;
    label: string;
    responseCount: number;
    percentage: number | null;
    amountMin: number | null;
    amountMax: number | null;
  }>;
  byProvince: Array<{
    provinceId: number;
    provinceName: string;
    responseCount: number;
    estimatedMin: number | null;
    estimatedMax: number | null;
    hasOpenEndedRange: boolean;
  }>;
  byAttraction: Array<{
    attractionId: number;
    attractionName: string;
    provinceName: string;
    responseCount: number;
    estimatedMin: number | null;
    estimatedMax: number | null;
    mostCommonSpendingRange?: string;
    topExpenseCategory?: string;
  }>;
  expenseCategories: ChartPoint[];
  overnightAnalysis: ChartPoint[];
  limitations: string[];
};
```

---

## 28. Empty States

Required empty states:

```text
No expense data for the selected filters.
No spending range responses yet.
No expense category responses yet.
No overnight spending data yet.
```

Do not show fake zero spending.

---

## 29. Loading States

Use:

```text
KPI skeletons
chart skeletons
table skeletons
export loading state
```

---

## 30. Error States

Examples:

```text
Could not load expense metrics.
Could not load spending distribution.
Could not load expense by attraction.
Could not generate expense export.
```

Use section-level errors where possible.

---

## 31. Export Requirements

Export option:

```text
Export Expense CSV
```

Default columns:

```text
visit_id
visit_date
province_name
attraction_name
spending_range
amount_min
amount_max
currency_code
main_expense_category
overnight_status
nights
overall_score optional
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
raw comments
```

---

## 32. Data Quality Requirements

Expense data is optional.

Dashboard should show:

```text
expense response count
expense response rate
unknown/not answered count
```

Recommended response rate:

```text
expense_response_count / certificate_count
```

If certificate count = 0:

```text
return null
```

---

## 33. Spending Range Master Data

Recommended seed values:

```text
0_500: amount_min=0, amount_max=500
501_1000: amount_min=501, amount_max=1000
1001_2000: amount_min=1001, amount_max=2000
2001_5000: amount_min=2001, amount_max=5000
5001_plus: amount_min=5001, amount_max=null
prefer_not_to_answer: amount_min=null, amount_max=null
```

Rules:

- dashboard calculations should ignore `prefer_not_to_answer` for estimated total.
- show `prefer_not_to_answer` in distribution if needed.
- open-ended range should not be forced into fake maximum.

---

## 34. Currency Rules

MVP default:

```text
THB
```

If future multi-currency support exists:

- collect currency code.
- convert only with clear exchange rate source.
- show conversion date.
- do not mix currencies without conversion.

MVP should not overcomplicate.

---

## 35. Planning Interpretation Examples

## 35.1 High Food Spending

```text
Food and drink are the top expense category. Local food routes, halal/local cuisine promotion, and community food vendors may benefit from tourism planning.
```

## 35.2 High Transport Spending

```text
Transport is a major expense category. Access cost and route convenience should be reviewed.
```

## 35.3 Overnight Visitors Spend More

```text
Overnight tourists report higher spending ranges. Developing multi-day routes may increase local economic benefit.
```

## 35.4 Low Spending Concentration

```text
Most tourists report low spending ranges. Consider adding paid experiences, local products, and longer-stay activities.
```

---

## 36. Testing Checklist

Test:

```text
no expense data
single spending range
multiple spending ranges
open-ended 5001_plus
prefer_not_to_answer
missing amount_max
province filter
attraction filter
date filter
overnight filter
expense category filter
export permission denied
export success
Thai CSV output
```

---

## 37. MVP Acceptance Checklist

```text
[ ] Expense dashboard section exists.
[ ] Expense response count exists.
[ ] Spending range distribution exists.
[ ] Estimated spending is labeled as estimated.
[ ] Estimated spending min/max calculation works.
[ ] Open-ended spending range is handled.
[ ] Expense category distribution exists.
[ ] Expense by province exists or is planned.
[ ] Expense by attraction exists or is planned.
[ ] Missing expense data is not shown as zero.
[ ] Export excludes direct identifiers.
[ ] Data limitation note is visible.
```

---

## 38. Do Not Do

Do not:

```text
Call estimated spending revenue.
Treat missing expense as zero.
Create fake max for open-ended range without explanation.
Expose personal identifiers.
Export raw comments by default.
Use spending data as official income.
Hide self-reported limitation.
Aggregate all expense rows in frontend.
```

---

## 39. Future Enhancements

Possible future improvements:

```text
spending by origin
spending by trip purpose
spending by route
spending by accommodation status
economic opportunity score
community product opportunity dashboard
official revenue comparison
multi-currency support
Excel report
```

---

## 40. Final Expense Dashboard Rule

Expense analytics must support economic planning without pretending to be verified revenue.

Use careful labels, clear limitations, and privacy-safe aggregation.
