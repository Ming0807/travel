# TOURIST_PROFILE_DASHBOARD.md

## 1. Document Purpose

This document defines the Tourist Profile Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

This dashboard helps stakeholders understand the profile of tourists participating in the QR/certificate/passport system.

It must support tourism planning while protecting personal privacy.

---

## 2. Dashboard Mission

The Tourist Profile Dashboard mission is:

```text
Understand who participates in southern border tourism flows without exposing unnecessary personal identity data.
```

It should answer:

```text
Where do tourists come from?
Are they domestic or foreign?
Which Thai provinces are represented?
Which age groups participate?
Which language do they prefer?
Are users staying as guests or saving passport identity?
Do returning tourists exist?
```

---

## 3. Dashboard Audience

Primary users:

```text
tourism planner
researcher
admin
instructor/project evaluator
```

Secondary users:

```text
tourism staff
marketing team
local government staff
```

---

## 4. Route

Recommended future route:

```text
/admin/dashboard/tourists
```

MVP can include this as a section inside:

```text
/admin/dashboard
```

---

## 5. Required Permission

Required permission:

```text
dashboard.read
```

Detailed profile exports require:

```text
export.visit_records
export.personal_data
```

MVP should not expose personal data.

---

## 6. Privacy Principle

The Tourist Profile Dashboard must show aggregated profile data only.

Do not show:

```text
email
LINE user ID
provider_user_id
device token
raw guest token
uploaded photo
private certificate URL
full address
national ID
phone number
```

Allowed aggregated fields:

```text
origin country
origin province
age group
preferred language
identity provider type
visit count
stamp count
returning status
```

---

## 7. Page Structure

Recommended structure:

```text
Page Header
Global Filter Bar
Profile KPI Cards
Domestic vs Foreign Section
Origin Country Distribution
Thai Origin Province Distribution
Age Group Distribution
Preferred Language Distribution
Identity Provider Distribution
Returning Tourist Summary
Profile Quality / Missing Data Section
Export Action
```

---

## 8. Page Header

## 8.1 Title

```text
Tourist Profile Dashboard
```

Thai:

```text
แดชบอร์ดโปรไฟล์นักท่องเที่ยว
```

## 8.2 Description

```text
Analyze tourist origin, age group, language preference, and identity linking patterns from platform participation data.
```

Thai:

```text
วิเคราะห์ถิ่นที่มาของนักท่องเที่ยว กลุ่มอายุ ภาษา และรูปแบบการบันทึกตัวตนจากข้อมูลการใช้งานระบบ
```

---

## 9. Global Filters

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
preferred language
identity provider
returning status
```

Date filter uses:

```text
visits.visit_date
```

Reason:

The dashboard should show profiles associated with visits in the selected period, not all profiles ever created.

---

# KPI Cards

---

## 10. Required Profile KPI Cards

```text
Tourist Profiles
Domestic Tourist Profiles
Foreign Tourist Profiles
Top Origin Province
Top Origin Country
Most Common Age Group
Preferred Language
LINE/Email Save Rate optional
```

---

## 11. KPI: Tourist Profiles

## 11.1 Metric Key

```text
tourist_profile_count
```

## 11.2 Calculation

```sql
count(distinct visits.tourist_id)
```

## 11.3 Tooltip

```text
Number of tourist profiles linked to recorded visits in the selected filters. This may not equal unique real-world people.
```

## 11.4 Display Rule

Do not label as:

```text
Unique Tourists
```

---

## 12. KPI: Domestic Tourist Profiles

## 12.1 Metric Key

```text
domestic_tourist_profile_count
```

## 12.2 Meaning

Number of participating tourist profiles whose origin is Thailand.

## 12.3 Calculation

```text
count(distinct tourist_id)
where origin_country = Thailand
or origin_province_id is not null
```

Exact rule depends on country/province schema.

## 12.4 Tooltip

```text
Profiles identified as domestic based on selected country or Thai origin province.
```

---

## 13. KPI: Foreign Tourist Profiles

## 13.1 Metric Key

```text
foreign_tourist_profile_count
```

## 13.2 Meaning

Number of participating tourist profiles whose origin country is not Thailand.

## 13.3 Calculation

```text
count(distinct tourist_id)
where origin_country != Thailand
```

## 13.4 Tooltip

```text
Profiles identified as foreign based on selected origin country.
```

---

## 14. KPI: Top Origin Province

## 14.1 Metric Key

```text
top_origin_province
```

## 14.2 Meaning

Thai province with the highest number of participating domestic tourist profiles.

## 14.3 Calculation

```text
count(distinct visits.tourist_id)
group by tourists.origin_province_id
order by count desc
limit 1
```

## 14.4 Empty State

```text
No domestic origin data
```

---

## 15. KPI: Top Origin Country

## 15.1 Metric Key

```text
top_origin_country
```

## 15.2 Meaning

Country with the highest number of participating tourist profiles.

## 15.3 Calculation

```text
count(distinct visits.tourist_id)
group by tourists.origin_country_id
order by count desc
limit 1
```

## 15.4 Empty State

```text
No country data
```

---

## 16. KPI: Most Common Age Group

## 16.1 Metric Key

```text
most_common_age_group
```

## 16.2 Calculation

```text
count(distinct visits.tourist_id)
group by tourists.age_group
order by count desc
limit 1
```

## 16.3 Display

Example:

```text
25-34
```

## 16.4 Rule

Show `Prefer not to answer` as its own category.

---

## 17. KPI: Preferred Language

## 17.1 Metric Key

```text
preferred_language_distribution
```

## 17.2 Meaning

Most common UI/content language selected by tourists.

## 17.3 Calculation

```text
count(distinct visits.tourist_id)
group by tourists.preferred_language
```

## 17.4 Planning Use

Helps prioritize:

```text
Thai content
English content
future Malay/Chinese content if needed
```

---

# Main Analytics Sections

---

## 18. Domestic vs Foreign Section

## 18.1 Purpose

Understand the broad origin mix of tourists.

## 18.2 Chart

Recommended:

```text
bar chart
donut chart if only two or three categories
```

## 18.3 Categories

```text
Domestic
Foreign
Unknown / Not answered
```

## 18.4 Calculation

```text
count distinct tourist_id through visits
group by origin_type
```

## 18.5 Planning Use

Helps answer:

```text
Should public content prioritize Thai, English, or other languages?
Are attractions reaching international tourists?
```

---

## 19. Origin Country Distribution

## 19.1 Purpose

Understand international and domestic origin by country.

## 19.2 Chart

Recommended:

```text
ranked bar chart
table
```

## 19.3 Columns

```text
country_name
tourist_profile_count
percentage
```

## 19.4 Default Limit

```text
Top 10 countries
```

## 19.5 Handling Thailand

Thailand should appear as a country if selected.

Domestic province detail should be shown separately.

## 19.6 Empty State

```text
No country origin data for the selected filters.
```

---

## 20. Thai Origin Province Distribution

## 20.1 Purpose

Understand where Thai domestic tourists come from.

## 20.2 Chart

Recommended:

```text
ranked bar chart
map future
table
```

## 20.3 Columns

```text
province_name
tourist_profile_count
percentage
```

## 20.4 Default Limit

```text
Top 10 provinces
```

## 20.5 Planning Use

Helps answer:

```text
Which domestic markets are already visiting?
Which provinces should be targeted for promotion?
Are local/southern tourists the primary audience?
```

---

## 21. Age Group Distribution

## 21.1 Purpose

Understand age composition.

## 21.2 Chart

Recommended:

```text
bar chart
```

Avoid pie chart if many categories.

## 21.3 Categories

```text
under_18
18_24
25_34
35_44
45_54
55_64
65_plus
prefer_not_to_answer
unknown
```

## 21.4 Calculation

```text
count distinct tourist_id through visits by age_group
```

## 21.5 Planning Use

Helps answer:

```text
Should campaigns focus on youth, families, adults, or seniors?
Are digital certificate/passport incentives working for expected age groups?
```

---

## 22. Preferred Language Distribution

## 22.1 Purpose

Understand language preference.

## 22.2 Chart

Recommended:

```text
bar chart
```

## 22.3 Categories

MVP:

```text
Thai
English
```

Future:

```text
Malay
Chinese
Other
```

## 22.4 Calculation

```text
count distinct tourist_id through visits by preferred_language
```

## 22.5 Planning Use

Helps decide:

```text
public content language priority
signage translation
tourist communication strategy
```

---

## 23. Identity Provider Distribution

## 23.1 Purpose

Understand how tourists save or identify themselves in the system.

## 23.2 Categories

```text
Guest only
LINE-linked
Email-linked future
Multiple identities
Unknown
```

## 23.3 Source Table

```text
tourist_identities
```

## 23.4 Calculation

Count tourist profiles by identity provider summary.

Example:

```text
guest_only: tourist has anonymous_device only
line_linked: tourist has line identity
email_linked: tourist has email identity
multiple: tourist has more than one non-guest identity
```

## 23.5 Privacy Rule

Do not show:

```text
provider_user_id
LINE user ID
email address
guest token
```

## 23.6 Planning Use

Helps answer:

```text
Is LINE linking useful?
How many users remain guest only?
Should email recovery be added?
```

---

## 24. Returning Tourist Summary

## 24.1 Purpose

Identify repeat engagement.

## 24.2 Metrics

```text
profiles with 1 visit
profiles with 2+ visits
average visits per profile
profiles with multiple stamps
returning profile rate
```

## 24.3 Calculation

```text
visit_count per tourist_id
```

Returning profile:

```text
visit_count >= 2
```

## 24.4 Limitations

Guest profiles may be device-specific.

A real person using different devices may appear as multiple profiles.

## 24.5 Planning Use

Helps answer:

```text
Are tourists returning to collect more stamps?
Is the digital passport encouraging repeat visits?
```

---

## 25. Profile Data Quality Section

## 25.1 Purpose

Show whether collected profile data is complete enough for analytics.

## 25.2 Metrics

```text
origin country completion rate
origin province completion rate for Thai tourists
age group completion rate
preferred language completion rate
identity save rate
```

## 25.3 Calculation

Example:

```text
profiles_with_age_group / total_profiles
```

## 25.4 Planning Use

Helps improve UX forms.

If age group completion is low, the form may need better design.

---

## 26. Suggested Insight Cards

## 26.1 Local Market Strength

Condition:

```text
high share of domestic/local province tourists
```

Insight:

```text
Domestic tourists are the main participating group. Consider campaigns and route planning for nearby provinces.
```

## 26.2 Foreign Tourist Opportunity

Condition:

```text
foreign tourist share increasing
```

Insight:

```text
Foreign participation is visible. English content and non-LINE access should remain strong.
```

## 26.3 Guest Recovery Risk

Condition:

```text
high guest_only share
```

Insight:

```text
Most tourists remain guest users. Encourage optional Google/LINE save after certificate generation, while keeping email as a future recovery option.
```

## 26.4 Youth Engagement

Condition:

```text
18-24 or 25-34 is dominant
```

Insight:

```text
Digital certificate and passport incentives may be effective for younger travelers.
```

---

## 27. Backend Services

Recommended services:

```text
DashboardService.getTouristOriginDistribution
DashboardService.getAgeGroupDistribution
DashboardService.getTouristIdentityMetrics
DashboardService.getReturningTouristMetrics
DashboardService.getProfileDataQualityMetrics
```

Possible combined service:

```text
DashboardService.getTouristProfileDashboard(filters)
```

---

## 28. Data Types

## 28.1 TouristProfileDashboardResponse

Conceptual TypeScript:

```ts
type TouristProfileDashboardResponse = {
  kpis: {
    touristProfileCount: number;
    domesticProfileCount: number;
    foreignProfileCount: number;
    topOriginProvince?: string;
    topOriginCountry?: string;
    mostCommonAgeGroup?: string;
    mostCommonLanguage?: string;
  };
  domesticForeignDistribution: ChartPoint[];
  originCountries: ChartPoint[];
  originThaiProvinces: ChartPoint[];
  ageGroups: ChartPoint[];
  preferredLanguages: ChartPoint[];
  identityProviders: ChartPoint[];
  returningSummary: {
    oneVisitProfiles: number;
    returningProfiles: number;
    returningProfileRate: number | null;
    averageVisitsPerProfile: number | null;
  };
  dataQuality: {
    originCompletionRate: number | null;
    ageGroupCompletionRate: number | null;
    languageCompletionRate: number | null;
    identitySaveRate: number | null;
  };
};
```

---

## 29. Empty States

## 29.1 No Profile Data

```text
No tourist profile data available for the selected filters.
```

## 29.2 No Origin Country Data

```text
No country origin data available.
```

## 29.3 No Thai Province Data

```text
No Thai origin province data available.
```

## 29.4 No Identity Data

```text
No identity provider data available.
```

---

## 30. Loading States

Use:

```text
KPI skeletons
chart skeletons
table skeletons
```

Do not show blank charts.

---

## 31. Error States

Section-level errors:

```text
Could not load origin distribution.
Could not load age group distribution.
Could not load identity provider metrics.
```

Page-level error only if entire dashboard fails.

---

## 32. Export Requirements

Export options:

```text
Export Tourist Summary CSV
Export Origin Distribution CSV
Export Profile Dashboard Summary CSV
```

Default export must exclude:

```text
display_name
email
LINE user ID
device token
provider_user_id
raw guest token
```

Use:

```text
anonymized_tourist_ref
```

for profile-level exports if needed.

---

## 33. Privacy and PDPA Considerations

Tourist profile data may be personal data.

Dashboard must:

- aggregate data by default
- avoid direct identifiers
- avoid small-group exposure in public reports
- explain data use
- keep exports permission-controlled

Do not expose raw identity mappings.

---

## 34. Data Quality Rules

## 34.1 Unknown Values

Use:

```text
Unknown
Not answered
Prefer not to answer
```

distinctly when possible.

## 34.2 Thai vs Foreign Origin

If origin is incomplete, classify as:

```text
Unknown
```

Do not guess.

## 34.3 Date-Filtered Profiles

When date filter is applied, count tourists through visits.

Do not count all profiles ever created.

---

## 35. Planning Interpretation Examples

## 35.1 Mostly Domestic Visitors

Interpretation:

```text
The platform is mainly reaching Thai domestic tourists. Promotion can focus on domestic travel routes and Thai-language content.
```

## 35.2 High Foreign Share

Interpretation:

```text
Foreign participation is significant. English content, non-LINE access, and clear guest flow remain important.
```

## 35.3 High Guest-Only Share

Interpretation:

```text
Most users do not save passport identity. Consider improving the post-certificate save prompt.
```

## 35.4 Age Group Concentration

Interpretation:

```text
A dominant age group may indicate which segment responds well to digital certificate/passport incentives.
```

---

## 36. Testing Checklist

Test:

```text
no tourist data
domestic tourists only
foreign tourists only
mixed origins
missing age group
prefer not to answer age group
guest only identities
LINE-linked identities
returning tourists
multiple visits per tourist
date filter
province filter
attraction filter
export without permission
export with permission
```

---

## 37. MVP Acceptance Checklist

```text
[ ] Tourist profile dashboard section exists.
[ ] Tourist profile count uses visits in selected date range.
[ ] Domestic vs foreign distribution exists.
[ ] Origin country distribution exists.
[ ] Thai origin province distribution exists.
[ ] Age group distribution exists.
[ ] Preferred language distribution exists.
[ ] Identity provider distribution exists or is planned.
[ ] Returning profile summary exists or is planned.
[ ] Profile data quality metrics exist or are planned.
[ ] No direct identifiers are displayed.
[ ] Missing values are shown clearly.
[ ] Loading states exist.
[ ] Empty states exist.
[ ] Error states exist.
```

---

## 38. Do Not Do

Do not:

```text
Call tourist profiles unique people.
Show LINE user ID.
Show email.
Show device token.
Show raw provider_user_id.
Guess missing origin.
Count all tourists ever created when date filter is applied.
Treat unknown as foreign.
Use profile dashboard for personal tracking.
Export personal identifiers by default.
```

---

## 39. Future Enhancements

Possible future improvements:

```text
origin map visualization
tourist segmentation
returning visitor cohort analysis
language-based content recommendation
campaign source tracking
visitor persona generation
public-safe profile summary report
official market comparison
```

---

## 40. Final Tourist Profile Dashboard Rule

This dashboard must help understand visitor groups without turning the system into personal surveillance.

Use aggregated, planning-safe profile data by default.
# TOURIST_PROFILE_DASHBOARD.md
