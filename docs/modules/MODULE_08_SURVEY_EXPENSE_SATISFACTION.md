# MODULE_08_SURVEY_EXPENSE_SATISFACTION.md

## 1. Module Name

**Survey, Expense, and Satisfaction Module**

---

## 2. Module Purpose

The Survey, Expense, and Satisfaction Module collects additional planning data after the tourist receives value from the system.

This module is critical because the original project requirement includes:

```text
Tourist
Travel Behavior
Attractions Visited
Expenses
Satisfaction
```

The earlier modules collect tourist and visit data. This module collects the deeper planning data needed for dashboard analysis and sustainable tourism planning.

---

## 3. Business Purpose

The platform must help tourism planners understand:

- how tourists travel
- who they travel with
- whether they stay overnight
- how much they spend
- what they spend on
- how satisfied they are
- whether they want to revisit
- whether they would recommend the place
- what should be improved

This module turns the system from a certificate/check-in app into a serious tourism intelligence platform.

---

## 4. Core UX Decision

Do not ask long survey questions before the tourist receives value.

Recommended flow:

```text
Minimal form
    |
Photo upload
    |
Certificate generated
    |
Stamp earned
    |
Optional short survey
```

Reason:

Tourists are more likely to answer after receiving a certificate and stamp.

---

## 5. Primary Users

## 5.1 Tourist

Tourists answer short optional questions.

## 5.2 Foreign Tourist

Foreign tourists should see English questions and should not need LINE.

## 5.3 Admin

Admins view submitted survey and planning data.

## 5.4 Researcher or Planner

Researchers and planners use this data for dashboard analysis.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Optional short survey after certificate generation
- Travel companion
- Group size
- Transport mode
- Travel purpose
- Overnight status
- Spending range
- Main expense category if feasible
- Overall satisfaction score
- Revisit intention
- Recommendation intention
- Optional comment
- Survey completion tracking
- Data linked to visit
- Dashboard-ready structured values

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Category-level satisfaction scores
- Dynamic survey question management
- Conditional questions
- Multilingual survey management
- Campaign-specific surveys
- Problem category selection
- Community benefit questions
- More detailed expense breakdown
- Survey A/B testing
- Text analysis for comments

## 6.3 Out of Scope

This module does not directly handle:

- QR resolution
- Tourist profile creation
- Photo upload
- Certificate rendering
- Stamp assignment
- Admin attraction CMS

It depends on those modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_11_REPORT_EXPORT.md
```

---

## 8. Required Data Tables

This module uses:

```text
visits
travel_companions
transport_modes
travel_purposes
expense_categories
visit_expenses
satisfaction_surveys
survey_questions
survey_answers
funnel_events
```

MVP required:

```text
travel_companions
transport_modes
travel_purposes
expense_categories
visit_expenses
satisfaction_surveys
```

Optional/flexible survey:

```text
survey_questions
survey_answers
```

---

## 9. Survey Timing

Recommended timing:

```text
After certificate generation and stamp assignment
```

Do not block certificate download behind survey.

Survey must also not block optional sharing, stamp award, guest passport access, Google linking, or LINE linking.

The survey should be presented as:

```text
Help improve tourism in this area by answering a few quick questions.
```

Thai:

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ ด้วยการตอบคำถามสั้น ๆ
```

---

## 10. Survey UX Principles

## 10.1 Keep It Short

MVP survey should take:

```text
30 to 90 seconds
```

## 10.2 Use Quick Inputs

Use:

- buttons
- chips
- rating stars
- sliders
- dropdowns
- yes/no buttons

Avoid:

- long text fields
- many required questions
- complex tables
- personal questions

## 10.3 Allow Skip

Tourist should be able to skip optional survey.

Skipping survey should not remove:

- visit record
- certificate
- stamp
- passport progress
- downloaded or downloadable certificate

## 10.4 Show Progress

Use simple progress indicator.

Example:

```text
Step 1 of 3
```

or:

```text
3 quick questions left
```

## 10.5 Explain Purpose

Make it clear that answers help improve tourism.

---

## 11. Recommended MVP Survey Structure

## 11.1 Section 1: Travel Behavior

Questions:

```text
Who are you traveling with?
How many people are in your group?
How did you travel here?
What is your main travel purpose?
Are you staying overnight?
```

## 11.2 Section 2: Expense

Questions:

```text
About how much did you spend on this trip?
What did you spend most on?
```

## 11.3 Section 3: Satisfaction

Questions:

```text
Overall, how satisfied are you?
Would you like to visit again?
Would you recommend this place to others?
Any suggestions?
```

MVP can reduce to fewer questions if UX is too heavy.

---

## 12. Travel Behavior Data

## 12.1 Travel Companion

Table:

```text
travel_companions
```

Field in visits:

```text
travel_companion_id
```

Recommended options:

```text
alone
family
friends
partner
tour_group
school_group
work_group
other
prefer_not
```

## 12.2 Group Size

Field:

```text
visits.group_size
```

Rules:

- optional
- integer
- >= 1
- recommended max 100 for tourist form

## 12.3 Transport Mode

Table:

```text
transport_modes
```

Field in visits:

```text
transport_mode_id
```

Recommended options:

```text
private_car
motorcycle
van
bus
train
airplane
taxi
tour_vehicle
walking
other
prefer_not
```

## 12.4 Travel Purpose

Table:

```text
travel_purposes
```

Field in visits:

```text
travel_purpose_id
```

Recommended options:

```text
leisure
nature
cultural
religious
historical
food
family_visit
education
work
event
other
prefer_not
```

## 12.5 Overnight Status

Field:

```text
visits.overnight_status
```

Allowed values:

```text
same_day
overnight
unknown
prefer_not_to_answer
```

Field:

```text
visits.nights
```

Rules:

- if overnight, nights can be asked.
- nights must be >= 0.
- do not require if user skips.

---

## 13. Expense Data

## 13.1 Expense Purpose

Expense data helps estimate tourism economic value and spending distribution.

Important:

Expense data is approximate.

Dashboard must not label it as exact revenue.

Use:

```text
Estimated spending
```

not:

```text
Actual revenue
```

---

## 13.2 Spending Range

Table:

```text
visit_expenses
```

Field:

```text
spending_range
```

Recommended values:

```text
0_500
501_1000
1001_2000
2001_5000
5001_plus
prefer_not_to_answer
```

Display labels:

```text
0 - 500 THB
501 - 1,000 THB
1,001 - 2,000 THB
2,001 - 5,000 THB
More than 5,000 THB
Prefer not to answer
```

## 13.3 Amount Min and Max

Fields:

```text
amount_min
amount_max
currency_code
```

Rules:

- amount_min and amount_max may be used for estimated range calculations.
- for open-ended range, amount_max can be null.
- default currency_code = THB.

---

## 13.4 Expense Category

Table:

```text
expense_categories
```

Question:

```text
What did you spend most on?
```

Recommended options:

```text
food
accommodation
transport
shopping
souvenir
activity
guide
entrance_fee
other
```

For MVP, one main category is enough.

Future versions can collect category-level spending.

---

## 14. Satisfaction Data

## 14.1 Satisfaction Purpose

Satisfaction data helps identify:

- strengths
- weaknesses
- improvement priorities
- safety concerns
- accessibility issues
- service quality
- revisit potential
- recommendation potential

---

## 14.2 Overall Satisfaction

Table:

```text
satisfaction_surveys
```

Field:

```text
overall_score
```

Allowed values:

```text
1 to 5
```

Display:

```text
1 = Very dissatisfied
5 = Very satisfied
```

Thai:

```text
1 = ไม่พึงพอใจมาก
5 = พึงพอใจมาก
```

---

## 14.3 Category Scores

Optional in MVP, recommended for Phase 2:

```text
safety_score
cleanliness_score
transport_score
information_score
service_score
value_for_money_score
```

All scores:

```text
1 to 5
```

MVP can include only overall score to reduce friction.

---

## 14.4 Revisit Intention

Field:

```text
revisit_intention
```

Question:

```text
Would you like to visit again?
```

Options:

```text
yes
no
not_sure
```

Database can use boolean for MVP, but `not_sure` requires controlled text.

Recommended MVP:

```text
boolean + optional null
```

Where:

```text
true = yes
false = no
null = not answered
```

If not_sure is needed, use text enum.

---

## 14.5 Recommendation Intention

Field:

```text
recommendation_intention
```

Question:

```text
Would you recommend this place to others?
```

Same rules as revisit intention.

---

## 14.6 Comment

Field:

```text
comment
```

Rules:

- optional
- max length recommended 1000 characters
- do not require
- do not use as only satisfaction data
- consider moderation before public use

---

## 15. Data Linking Rules

All survey, expense, and satisfaction data must link to:

```text
visit_id
```

Satisfaction should also link to:

```text
attraction_id
```

for dashboard convenience.

Do not store survey data only by tourist_id.

Reason:

A tourist may visit multiple attractions and have different satisfaction for each.

---

## 16. Survey Completion Status

When survey is completed:

Update visit:

```text
completion_status = survey_completed
```

Record funnel event:

```text
survey_completed
```

If survey is started:

```text
survey_started
```

If survey is skipped:

- keep visit status as certificate_generated
- optionally record survey_skipped if added later

---

## 17. Funnel Events

Required events:

```text
survey_started
survey_completed
```

Optional future event:

```text
survey_skipped
```

Event data should include:

```text
session_id
tourist_id
visit_id
attraction_id
photo_spot_id
checkin_code_id
event_time
```

---

## 18. Survey Data Storage Options

## 18.1 Structured MVP Tables

For MVP, store common values directly in:

```text
visits
visit_expenses
satisfaction_surveys
```

This makes dashboard queries easier.

## 18.2 Flexible Survey Tables

For future survey changes, use:

```text
survey_questions
survey_answers
```

Recommended approach:

```text
Use structured tables for core dashboard metrics.
Use survey_questions/survey_answers for extra configurable questions.
```

---

## 19. Validation Rules

## 19.1 Travel Companion

Rules:

- must be from master data if submitted.
- optional.
- inactive options should not be selectable.

## 19.2 Group Size

Rules:

```text
integer
>= 1
<= 100 for normal tourist form
```

## 19.3 Transport Mode

Rules:

- must be from master data if submitted.
- optional.

## 19.4 Travel Purpose

Rules:

- must be from master data if submitted.
- optional.

## 19.5 Overnight Status

Allowed:

```text
same_day
overnight
unknown
prefer_not_to_answer
```

## 19.6 Nights

Rules:

```text
integer
>= 0
```

If overnight_status = same_day:

```text
nights should be 0 or null
```

## 19.7 Spending Range

Rules:

- must be allowed value.
- optional or prefer_not_to_answer.
- amount_min and amount_max must match range if used.

## 19.8 Satisfaction Scores

Rules:

```text
integer
between 1 and 5
```

Null allowed for optional score.

## 19.9 Comment

Rules:

```text
optional
max 1000 characters
trim whitespace
```

---

## 20. Recommended Survey UI

## 20.1 Screen 1: Travel

Fields:

```text
travel companion chips
group size small input
transport mode chips
overnight yes/no
```

## 20.2 Screen 2: Spending

Fields:

```text
spending range buttons
main spending category chips
```

## 20.3 Screen 3: Satisfaction

Fields:

```text
overall rating
revisit yes/no
recommend yes/no
optional comment
```

MVP may combine into one page if it remains short.

---

## 21. UX Copy

## 21.1 Survey Intro

English:

```text
Help improve tourism in this area. Answer a few quick questions.
```

Thai:

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ ด้วยการตอบคำถามสั้น ๆ
```

## 21.2 Skip Text

English:

```text
Skip for now
```

Thai:

```text
ข้ามไปก่อน
```

## 21.3 Completion Message

English:

```text
Thank you. Your feedback helps improve sustainable tourism in the southern border area.
```

Thai:

```text
ขอบคุณสำหรับความคิดเห็น ข้อมูลของคุณช่วยพัฒนาการท่องเที่ยวชายแดนใต้อย่างยั่งยืน
```

---

## 22. API or Service Responsibilities

Recommended functions:

```text
getSurveyOptions()
startSurvey(visitId)
submitTravelBehavior(visitId, input)
submitExpenseData(visitId, input)
submitSatisfactionSurvey(visitId, input)
submitFullPostCertificateSurvey(visitId, input)
skipSurvey(visitId)
getSurveyByVisit(visitId)
listSurveyResponses(filters)
```

---

## 23. Suggested Validation Schema

Conceptual TypeScript/Zod schema:

```ts
const postCertificateSurveySchema = z.object({
  travelCompanionId: z.number().optional(),
  groupSize: z.number().int().min(1).max(100).optional(),
  transportModeId: z.number().optional(),
  travelPurposeId: z.number().optional(),
  overnightStatus: z.enum([
    "same_day",
    "overnight",
    "unknown",
    "prefer_not_to_answer"
  ]).optional(),
  nights: z.number().int().min(0).optional(),
  spendingRange: z.enum([
    "0_500",
    "501_1000",
    "1001_2000",
    "2001_5000",
    "5001_plus",
    "prefer_not_to_answer"
  ]).optional(),
  mainExpenseCategoryId: z.number().optional(),
  overallScore: z.number().int().min(1).max(5).optional(),
  revisitIntention: z.boolean().optional(),
  recommendationIntention: z.boolean().optional(),
  comment: z.string().trim().max(1000).optional()
});
```

---

## 24. Error Handling

## 24.1 Visit Not Found

Message:

```text
We could not find your visit record.
```

## 24.2 Invalid Score

Message:

```text
Please select a rating from 1 to 5.
```

## 24.3 Invalid Group Size

Message:

```text
Please enter a valid group size.
```

## 24.4 Submit Failed

Message:

```text
We could not save your answers. Please try again.
```

## 24.5 Skip

Skip should not show error.

It should continue to passport/certificate success page.

---

## 25. Security and Privacy

## 25.1 Avoid Sensitive Questions

Do not ask:

```text
income
religion
ethnicity
political opinions
health status
full address
national ID
```

## 25.2 Comments

Comments may accidentally contain personal data.

Rules:

- optional
- length-limited
- not shown publicly without review
- export with caution

## 25.3 Dashboard

Dashboard should aggregate survey data.

Do not show individual answers to unauthorized users.

---

## 26. Dashboard Impact

This module supports these dashboard pages:

```text
Travel Behavior Dashboard
Expense Dashboard
Satisfaction Dashboard
Sustainable Tourism Dashboard
Executive Dashboard
```

## 26.1 Travel Behavior Metrics

```text
travel companion distribution
average group size
transport mode distribution
travel purpose distribution
overnight stay ratio
average nights
```

## 26.2 Expense Metrics

```text
spending range distribution
main expense category distribution
estimated spending range
spending by province
spending by attraction
```

## 26.3 Satisfaction Metrics

```text
average overall satisfaction
satisfaction by attraction
low satisfaction attractions
revisit intention rate
recommendation intention rate
comment themes future
```

---

## 27. Sustainable Tourism Impact

This module helps identify:

```text
high-visit low-satisfaction attractions
low-visit high-satisfaction attractions
transport accessibility issues
overnight stay opportunities
local spending patterns
attractions needing cleanliness or safety improvement
tourism routes with economic potential
```

---

## 28. Export Rules

Exports may include:

```text
visit_id
attraction
province
travel companion
group size
transport mode
travel purpose
overnight status
spending range
expense category
satisfaction score
revisit intention
recommendation intention
comment
```

Do not include unnecessary identity fields.

Comments may need review before sharing externally.

---

## 29. Performance Requirements

Indexes needed:

```text
visits(travel_companion_id)
visits(transport_mode_id)
visits(travel_purpose_id)
visits(overnight_status)
visit_expenses(visit_id)
visit_expenses(expense_category_id)
visit_expenses(spending_range)
satisfaction_surveys(visit_id)
satisfaction_surveys(attraction_id)
satisfaction_surveys(completed_at)
satisfaction_surveys(overall_score)
```

For dashboard, summary tables may be added later.

---

## 30. Edge Cases

## 30.1 Tourist Skips Survey

Allowed.

No error.

## 30.2 Tourist Partially Completes Survey

MVP options:

- save only on final submit
- or save section by section

Recommended MVP:

```text
save full survey on submit
```

Phase 2 can save section progress.

## 30.3 Tourist Answers Prefer Not to Answer

Store controlled value.

Do not convert to null if distinction matters.

## 30.4 Tourist Gives Low Satisfaction

Store honestly.

Do not hide low scores.

## 30.5 Comment Contains Sensitive Data

Do not show publicly.

Admin/research export should handle carefully.

## 30.6 Duplicate Survey Submission

Recommended:

```text
one satisfaction_surveys row per visit
```

Use:

```text
unique(visit_id)
```

Allow update if tourist resubmits within flow.

---

## 31. Example User Stories

## 31.1 Tourist Answers Optional Survey

As a tourist, I want to answer a short survey after receiving my certificate.

Acceptance:

```text
Given I generated a certificate
When I answer the short survey
Then my answers are saved and linked to my visit
```

---

## 31.2 Tourist Skips Survey

As a tourist, I want to skip the survey.

Acceptance:

```text
Given I generated a certificate
When I click skip
Then I can still access my certificate and stamp
```

---

## 31.3 Planner Views Expense Data

As a tourism planner, I want to see spending distribution.

Acceptance:

```text
Given expense responses exist
When dashboard loads
Then it shows spending range distribution by attraction or province
```

---

## 31.4 Planner Views Low Satisfaction Attractions

As a planner, I want to identify attractions needing improvement.

Acceptance:

```text
Given satisfaction responses exist
When dashboard loads
Then attractions with low average scores can be identified
```

---

## 32. MVP Acceptance Checklist

```text
[ ] Survey appears after certificate generation.
[ ] Survey can be skipped.
[ ] Travel companion can be submitted.
[ ] Group size can be submitted.
[ ] Transport mode can be submitted.
[ ] Travel purpose can be submitted.
[ ] Overnight status can be submitted.
[ ] Spending range can be submitted.
[ ] Expense category can be submitted if implemented.
[ ] Overall satisfaction score can be submitted.
[ ] Revisit intention can be submitted.
[ ] Recommendation intention can be submitted.
[ ] Optional comment can be submitted.
[ ] Data links to visit_id.
[ ] Satisfaction links to attraction_id.
[ ] survey_started event is recorded.
[ ] survey_completed event is recorded.
[ ] Visit status updates to survey_completed.
[ ] Dashboard can use submitted data.
```

---

## 33. Do Not Do

Do not:

```text
Ask long survey before certificate.
Require survey to download certificate.
Store survey only by tourist_id.
Use free-text for transport mode.
Use free-text for spending range.
Treat missing satisfaction as zero.
Ask for exact income.
Ask for full address.
Ask sensitive demographic questions.
Show individual survey answers publicly.
Build dashboard charts without metric definitions.
Treat missing satisfaction as zero.
Treat estimated spending as revenue.
Treat QR scans as visits.
```

---

## 34. Future Enhancements

Possible future features:

```text
dynamic survey builder
conditional questions
campaign-specific surveys
problem category selection
comment text analysis
multi-language survey editor
survey completion rewards
advanced sustainable tourism indicators
official data comparison
sentiment analysis
```

---

## 35. Definition of Done

This module is done when:

```text
[ ] Post-certificate survey works.
[ ] Survey is optional.
[ ] Travel behavior data is structured.
[ ] Expense data is structured.
[ ] Satisfaction data is structured.
[ ] Data links to visit.
[ ] Dashboard can use the data.
[ ] Missing data is handled correctly.
[ ] Privacy rules are followed.
[ ] Validation works.
[ ] Documentation and tests are updated.
```
