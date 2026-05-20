# MODULE_11_REPORT_EXPORT.md

## 1. Module Name

**Report and Export Module**

---

## 2. Module Purpose

The Report and Export Module allows authorized users to export tourism data and generate reports for academic, administrative, and planning purposes.

This module turns collected data into usable evidence.

It supports:

- university project reporting
- tourism planning reports
- dashboard data export
- CSV/Excel analysis
- future PDF report generation
- controlled data sharing

---

## 3. Business Purpose

The project is a database project for tourism planning, not only a web app.

The collected data must be usable outside the system by:

- university instructors
- researchers
- local tourism offices
- administrators
- planners
- project evaluators

Exports and reports must be accurate, permission-controlled, and privacy-aware.

---

## 4. Core Design Decision

Exports must be safe by default.

Correct:

```text
export aggregated or planning-safe data by default
```

Incorrect:

```text
export all raw personal data to everyone
```

Reason:

The system may contain personal or potentially identifiable data:

- display name
- uploaded photo
- certificate file
- email
- LINE user ID
- device token
- comments

Only authorized users should access detailed records.

---

## 5. Primary Users

## 5.1 Admin

Exports operational data and dashboard summaries.

## 5.2 Researcher

Exports approved research data for analysis.

## 5.3 Planner

Exports aggregated data for planning and policy.

## 5.4 Super Admin

Controls export permissions and audit logs.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- CSV export
- Visit record export
- Survey/satisfaction export
- Expense export
- Dashboard summary export
- Filtered export by date/province/attraction
- Permission check before export
- Export action audit log
- Privacy-safe default fields
- No photo/certificate file export by default

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Excel export
- PDF report generation
- Scheduled reports
- Dashboard chart image export
- Academic report appendix export
- Export templates
- Aggregated anonymized research dataset
- Export approval workflow
- Data dictionary attached to export
- Official data comparison report

## 6.3 Out of Scope

This module does not directly handle:

- dashboard chart rendering
- attraction content editing
- tourist form submission
- certificate rendering
- official data import

It consumes data from those modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_09_ADMIN_ATTRACTION_CMS.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_13_OFFICIAL_DATA_IMPORT.md
```

---

## 8. Required Data Tables

This module reads from:

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
visit_expenses
expense_categories
satisfaction_surveys
travel_companions
transport_modes
travel_purposes
funnel_events
```

This module writes to:

```text
audit_logs
```

Future optional tables:

```text
export_jobs
export_files
report_templates
scheduled_reports
```

---

## 9. Export Types

## 9.1 Visit Records Export

Purpose:

Analyze attraction visits and travel behavior.

Default fields:

```text
visit_id
visit_date
created_at
province
district
attraction_name
photo_spot_name
checkin_code
completion_status
origin_country
origin_province
age_group
preferred_language
travel_companion
group_size
transport_mode
travel_purpose
overnight_status
nights
certificate_generated
stamp_earned
survey_completed
```

Do not include by default:

```text
email
LINE user ID
device token
uploaded photo path
certificate private URL
```

---

## 9.2 Tourist Profile Summary Export

Purpose:

Analyze visitor demographics.

Default fields:

```text
tourist_id or anonymized_tourist_ref
created_at
origin_country
origin_province
age_group
preferred_language
identity_provider_summary
visit_count
first_visit_date
latest_visit_date
```

Privacy rule:

Use anonymized tourist reference when possible.

---

## 9.3 Expense Export

Purpose:

Analyze spending patterns.

Default fields:

```text
visit_id
visit_date
province
attraction_name
expense_category
spending_range
amount_min
amount_max
currency_code
```

Important label:

```text
Estimated spending range
```

Do not label as actual revenue.

---

## 9.4 Satisfaction Export

Purpose:

Analyze tourism quality and improvement needs.

Default fields:

```text
visit_id
visit_date
province
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
comment
completed_at
```

Privacy note:

Comments may contain personal data. Export comments only for authorized users.

---

## 9.5 Funnel Export

Purpose:

Analyze QR/certificate/survey drop-off.

Default fields:

```text
event_date
event_name
province
attraction_name
photo_spot_name
event_count
```

For detailed debug export:

```text
session_id
event_time
event_name
attraction
photo_spot
```

Detailed session export should be restricted.

---

## 9.6 Dashboard Summary Export

Purpose:

Export high-level metrics.

Default fields:

```text
metric_name
metric_value
filter_start_date
filter_end_date
province_filter
attraction_filter
generated_at
```

Examples:

```text
total_visits
total_tourist_profiles
certificates_generated
stamps_earned
average_satisfaction
survey_completion_rate
estimated_spending_min
estimated_spending_max
```

---

## 10. Export Formats

## 10.1 CSV

MVP required.

Pros:

- simple
- works with Excel
- easy to generate
- easy to import into analysis tools

Rules:

- UTF-8 encoding
- include header row
- escape commas and quotes correctly
- use ISO date format where possible
- avoid raw JSON columns in basic export

## 10.2 Excel

Phase 2.

Pros:

- easier for non-technical users
- multiple sheets
- formatted headers

Possible sheets:

```text
Summary
Visits
Expenses
Satisfaction
Funnel
Data Dictionary
```

## 10.3 PDF

Phase 2 or final academic reporting.

Use for:

- executive summary
- dashboard report
- monthly report
- academic appendix

---

## 11. Export Filters

Export should support filters.

MVP filters:

```text
date range
province
attraction
completion_status
```

Recommended additional filters:

```text
origin country
origin province
age group
transport mode
travel purpose
spending range
satisfaction score range
identity provider
```

Export must use the same filter definitions as dashboard where possible.

---

## 12. Permission Model

Export is sensitive.

Recommended permissions:

```text
export.summary
export.visit_records
export.survey_data
export.expense_data
export.satisfaction_data
export.funnel_data
export.personal_data
export.comments
```

MVP can simplify to:

```text
export.create
```

but production should separate detailed exports from summary exports.

---

## 13. Privacy Levels

## 13.1 Level 1: Public or Low-Risk Export

Aggregated, non-identifying data.

Examples:

```text
visits by province
average satisfaction by attraction
spending range distribution
```

Allowed for:

```text
viewer
researcher
admin
super_admin
```

depending on policy.

## 13.2 Level 2: Internal Planning Export

Visit-level but without direct identity.

Examples:

```text
visit_id
attraction
province
age_group
origin_country
spending_range
satisfaction_score
```

Allowed for:

```text
researcher
admin
super_admin
```

## 13.3 Level 3: Restricted Personal Data Export

Includes direct or potentially identifiable data.

Examples:

```text
display_name
email
LINE ID
photo path
certificate URL
raw comments
```

Allowed only for:

```text
super_admin
authorized admin
```

MVP should avoid Level 3 exports unless absolutely necessary.

---

## 14. Export Audit Logging

Every export action should create audit log.

Audit fields:

```text
actor_user_id
action = data.export
entity_type = export
entity_id optional
old_values_json null
new_values_json export metadata
created_at
```

Export metadata should include:

```text
export_type
filters
row_count
format
privacy_level
generated_at
```

Do not store file contents in audit log.

Do not store secrets in audit log.

---

## 15. Export File Retention

Export files may contain sensitive data.

Rules:

- Temporary export files should expire.
- Do not keep exports forever.
- Export links should be signed or protected.
- Exports should not be publicly accessible.

Recommended retention:

```text
24 hours to 7 days
```

For MVP, direct download without storing file may be simplest.

---

## 16. Data Dictionary Attachment

For academic and research use, exports should be understandable.

Phase 2 can include a data dictionary sheet or companion file.

It should define:

```text
field name
description
source table
value meaning
data type
notes
```

---

## 17. CSV Field Naming

Use clear snake_case column headers.

Examples:

```text
visit_id
visit_date
province_name
attraction_name
origin_country
age_group
transport_mode
spending_range
overall_score
```

Avoid ambiguous headers:

```text
name
date
type
status
```

---

## 18. Date and Time Formatting

Recommended:

```text
YYYY-MM-DD
YYYY-MM-DD HH:mm:ss
```

Use timezone consistently.

For Thailand deployment:

```text
Asia/Bangkok
```

Store database timestamps as `timestamptz`.

Format for export intentionally.

---

## 19. Missing Data Handling

Export should show clear missing values.

Recommended:

```text
blank for truly null
Not answered
Unknown
No data
```

Use consistent labels.

Do not convert missing satisfaction score to 0.

---

## 20. Report Types

## 20.1 Executive Report

Includes:

```text
total visits
total tourist profiles
certificates generated
average satisfaction
top attractions
province comparison
estimated spending range
recommendation highlights
```

## 20.2 Attraction Performance Report

Includes:

```text
visit count by attraction
photo spot performance
certificate count
stamp count
average satisfaction
survey completion rate
issues/comments
```

## 20.3 Sustainable Tourism Report

Includes:

```text
under-visited attractions
high-satisfaction attractions
low-satisfaction attractions
overnight ratio
spending distribution
transport issues
planning recommendations
```

## 20.4 Academic Data Appendix

Includes:

```text
ERD summary
data dictionary
cleaned dataset
metric definitions
methodology notes
limitations
```

---

## 21. Export API or Service Responsibilities

Recommended service functions:

```text
exportVisits(filters, options)
exportTouristSummary(filters, options)
exportExpenses(filters, options)
exportSatisfaction(filters, options)
exportFunnelSummary(filters, options)
exportDashboardSummary(filters, options)
createExportAuditLog(input)
buildCsvFile(rows, columns)
sanitizeExportRows(rows, privacyLevel)
```

Do not put export query logic directly in UI components.

---

## 22. Export Query Rules

## 22.1 Use Server-Side Export

Exports should be generated server-side.

Do not send all raw data to frontend and export there for large datasets.

## 22.2 Use Filters

Require date range for large exports.

## 22.3 Use Pagination or Streaming

For large exports, use streaming or background jobs.

MVP can export small filtered datasets directly.

## 22.4 Avoid N+1 Queries

Use joins or optimized queries.

---

## 23. Example Visit Export Columns

Recommended MVP CSV columns:

```text
visit_id
visit_date
created_at
province_name_en
district_name_en
attraction_name_en
photo_spot_name_en
completion_status
origin_country_name_en
origin_province_name_en
age_group
preferred_language
travel_companion_name_en
group_size
transport_mode_name_en
travel_purpose_name_en
overnight_status
nights
certificate_generated
stamp_earned
spending_range
overall_score
revisit_intention
recommendation_intention
```

---

## 24. Example Satisfaction Export Columns

```text
satisfaction_id
visit_id
visit_date
province_name_en
attraction_name_en
overall_score
safety_score
cleanliness_score
transport_score
information_score
service_score
value_for_money_score
revisit_intention
recommendation_intention
comment
completed_at
```

Comment export should be permission-controlled.

---

## 25. Error Handling

## 25.1 Unauthorized Export

Message:

```text
You do not have permission to export this data.
```

## 25.2 No Data

Message:

```text
No records found for the selected filters.
```

## 25.3 Export Too Large

Message:

```text
This export is too large. Please narrow the date range or filters.
```

## 25.4 Export Failed

Message:

```text
Could not generate export. Please try again.
```

Do not expose raw SQL errors.

---

## 26. Security Requirements

Rules:

- Check permission server-side.
- Do not trust frontend role state.
- Log export actions.
- Avoid exporting contact data by default.
- Avoid public export URLs.
- Use signed URLs if files are stored.
- Expire export files.
- Do not include secrets in export.

---

## 27. Privacy Requirements

Default export should exclude:

```text
email
LINE user ID
provider_user_id
device token
raw IP
raw user agent
photo path
private certificate path
```

Default export may include:

```text
anonymized tourist reference
origin country/province
age group
visit behavior
spending range
satisfaction score
```

---

## 28. Performance Requirements

For MVP:

- export limited datasets
- require filters if data grows
- use indexed columns
- avoid frontend-only large exports

For production:

- background export jobs
- streaming CSV
- temporary file storage
- progress status
- email notification if needed

---

## 29. Edge Cases

## 29.1 Empty Dataset

Return clear message or CSV with headers only.

## 29.2 Missing Satisfaction

Leave score blank or use `Not answered`.

Do not use 0.

## 29.3 Missing Expense

Leave blank or use `Not answered`.

## 29.4 Long Comments

Escape correctly in CSV.

## 29.5 Thai Text

Ensure UTF-8 encoding.

Excel may need UTF-8 BOM depending on target users.

## 29.6 Large Dataset

Ask user to filter or use background job in production.

---

## 30. Example User Stories

## 30.1 Admin Exports Visit Data

As an admin, I want to export visit records for a selected date range.

Acceptance:

```text
Given I have export permission
When I select date range and click export
Then I receive a CSV file with filtered visit records
And an audit log is created
```

## 30.2 Researcher Exports Satisfaction Data

As a researcher, I want satisfaction scores for analysis.

Acceptance:

```text
Given satisfaction records exist
When I export satisfaction data
Then the CSV includes scores by attraction and visit date
And excludes unnecessary identity data
```

## 30.3 Planner Exports Summary

As a planner, I want a summary report by province.

Acceptance:

```text
Given dashboard data exists
When I export summary
Then I receive aggregated metrics by province
```

---

## 31. MVP Acceptance Checklist

```text
[ ] CSV export exists.
[ ] Visit export works.
[ ] Satisfaction export works.
[ ] Expense export works.
[ ] Dashboard summary export works or is planned.
[ ] Date filter applies to export.
[ ] Province/attraction filters apply where available.
[ ] Export permission is checked server-side.
[ ] Export action is audit logged.
[ ] Export excludes email/LINE/device token by default.
[ ] Thai text exports correctly.
[ ] Missing data is handled correctly.
[ ] Errors are user-friendly.
```

---

## 32. Do Not Do

Do not:

```text
Export all personal data by default.
Export LINE user IDs in normal reports.
Export device tokens.
Export raw photo/certificate private URLs.
Generate huge exports in frontend.
Skip permission check.
Skip audit logging.
Call estimated spending actual revenue.
Convert missing scores to 0.
Store export files forever.
```

---

## 33. Future Enhancements

Possible future additions:

```text
Excel workbook export
PDF executive report
scheduled monthly report
background export jobs
export approval workflow
data dictionary sheet
official data comparison report
dashboard chart image export
report template builder
anonymized research dataset generator
```

---

## 34. Definition of Done

This module is done when:

```text
[ ] Authorized users can export safe data.
[ ] Export filters work.
[ ] Export output is readable.
[ ] Privacy defaults are safe.
[ ] Export action is logged.
[ ] Large export risks are handled.
[ ] Data definitions are clear.
[ ] Documentation and tests are updated.
```
