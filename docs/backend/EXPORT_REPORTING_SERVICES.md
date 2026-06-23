# EXPORT_REPORTING_SERVICES.md

## 1. Document Purpose

This document defines backend service requirements for report generation and data export in the **Southern Border Tourism Data & Intelligence Platform**.

Export and reporting services must allow authorized users to use collected tourism data for:

- academic reports
- planning documents
- dashboard analysis
- tourism development decisions
- data review
- future official comparisons

Exports must be privacy-safe and permission-controlled.

---

## 2. Export and Reporting Mission

The mission is:

```text
Provide useful tourism datasets and reports without exposing unnecessary personal data.
```

The export/reporting system must support:

```text
CSV export
dashboard summary export
visit record export
survey/satisfaction export
expense export
funnel export
future Excel/PDF reports
future academic report appendices
future official data comparison reports
```

---

## 3. Core Principle

Exports are sensitive operations.

Correct:

```text
permission check
validated filters
privacy-safe field selection
server-side generation
audit log
controlled download
```

Incorrect:

```text
send all database rows to frontend and let browser export everything
```

Reason:

- privacy risk
- performance risk
- inconsistent data
- no audit trail
- accidental personal data leakage

---

## 4. Related Documents

Export/reporting services must align with:

```text
docs/modules/MODULE_11_REPORT_EXPORT.md
docs/frontend/DASHBOARD_UI_SPEC.md
docs/backend/AUTHORIZATION_RBAC.md
docs/backend/VALIDATION_ERROR_HANDLING.md
docs/backend/DASHBOARD_SERVICES.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/database/DATA_RETENTION_POLICY.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

---

## 5. Required Services

Recommended file:

```text
server/services/export-service.ts
```

Recommended methods:

```ts
exportVisits(input: ExportRequest, actor: AdminActor): Promise<ServiceResult<ExportResult>>;
exportTouristSummary(input: ExportRequest, actor: AdminActor): Promise<ServiceResult<ExportResult>>;
exportExpenses(input: ExportRequest, actor: AdminActor): Promise<ServiceResult<ExportResult>>;
exportSatisfaction(input: ExportRequest, actor: AdminActor): Promise<ServiceResult<ExportResult>>;
exportFunnelSummary(input: ExportRequest, actor: AdminActor): Promise<ServiceResult<ExportResult>>;
exportDashboardSummary(input: ExportRequest, actor: AdminActor): Promise<ServiceResult<ExportResult>>;
generateAcademicReportData(input: ReportRequest, actor: AdminActor): Promise<ServiceResult<ReportData>>;
```

MVP can implement CSV exports first.

---

## 6. Export Types

Supported MVP export types:

```text
visits
tourist_summary
expenses
satisfaction
funnel_summary
dashboard_summary
```

Future export types:

```text
official_comparison
passport_stamps
certificates
audit_logs
academic_appendix
```

---

## 7. Export Format Types

MVP:

```text
csv
```

Future:

```text
xlsx
pdf
json
```

Rules:

- CSV is easiest for MVP.
- Excel is useful for staff.
- PDF is useful for executive/academic reports.
- JSON may be useful for technical integrations.

---

## 8. Export Request Type

Conceptual TypeScript:

```ts
type ExportRequest = {
  exportType:
    | "visits"
    | "tourist_summary"
    | "expenses"
    | "satisfaction"
    | "funnel_summary"
    | "dashboard_summary";
  format: "csv";
  filters: {
    startDate?: string;
    endDate?: string;
    provinceId?: number;
    attractionId?: number;
    completionStatus?: string;
    ageGroup?: string;
    originCountryId?: number;
    originProvinceId?: number;
  };
  privacyLevel?: "summary" | "internal" | "restricted";
};
```

---

## 9. Export Result Type

Conceptual TypeScript:

```ts
type ExportResult = {
  exportId?: number;
  fileName: string;
  contentType: string;
  rowCount: number;
  downloadUrl?: string;
  fileBuffer?: Uint8Array;
  generatedAt: string;
  expiresAt?: string;
  privacyLevel: "summary" | "internal" | "restricted";
};
```

MVP can stream file directly without storing it.

If stored, use private bucket and signed URL.

---

## 10. Permission Requirements

## 10.1 Summary Export

Permission:

```text
export.summary
```

or MVP:

```text
export.create
```

## 10.2 Visit Records Export

Permission:

```text
export.visit_records
```

or MVP:

```text
export.create
```

Visit exports must reuse the same validated filters as the admin visit list:

```text
search
attraction
province
completion status
date range
```

## 10.3 Survey/Satisfaction Export

Permission:

```text
export.survey_data
```

Comments require:

```text
export.comments
```

## 10.4 Personal Data Export

Permission:

```text
export.personal_data
```

MVP should avoid personal data export.

## 10.5 Export Action Rule

Every export method must call:

```text
requirePermission(...)
```

before generating data.

Frontend button hiding is not enough.

---

## 11. Privacy Levels

## 11.1 Summary

Aggregated data only.

Examples:

```text
visits by province
average satisfaction by attraction
spending range distribution
funnel counts
```

Direct identifiers:

```text
not included
```

## 11.2 Internal

Visit-level data without direct identifiers.

May include:

```text
visit_id
attraction
province
age_group
origin_country
travel_behavior
spending_range
satisfaction_score
```

Direct identifiers:

```text
not included
```

## 11.3 Restricted

May include sensitive fields only when explicitly permitted.

Examples:

```text
display_name
raw comments
contact fields
provider details
```

MVP recommendation:

```text
do not implement restricted export unless required
```

---

## 12. Safe Default Export Fields

Default exports must not include:

```text
email
LINE user ID
provider_user_id
device token
raw IP
raw user agent
uploaded photo path
private certificate path
service/internal IDs that expose identity relationships unnecessarily
```

Allowed safer fields:

```text
visit_id
anonymized_tourist_ref
province
attraction
age_group
origin_country
origin_province
travel behavior
spending range
satisfaction score
completion status
```

---

## 13. Anonymized Tourist Reference

For visit-level exports, use:

```text
anonymized_tourist_ref
```

instead of direct tourist identity.

Example generation:

```text
T-000001
T-000002
```

or hash:

```text
hash(tourist_id + export_salt)
```

Rules:

- stable within export if needed
- not reversible by normal users
- not based on email/LINE ID
- do not expose provider_user_id

---

## 14. Export Filters

Required or recommended filters:

```text
start_date
end_date
province_id
attraction_id
completion_status
```

Optional:

```text
origin_country_id
origin_province_id
age_group
transport_mode_id
travel_purpose_id
spending_range
overall_score_range
```

## 14.1 Date Range Requirement

For detailed exports, date range should be required once data grows.

MVP can allow no date range for small data, but service should be designed with limits.

Recommended rule:

```text
if export type is detailed and no date range, limit or reject when record count is high
```

---

## 15. Export Validation

Validate:

```text
export_type allowed
format allowed
date range valid
start_date <= end_date
province_id integer if provided
attraction_id integer if provided
attraction belongs to province if both provided
privacy_level allowed
actor has permission for export type and privacy level
```

If invalid:

```text
return VALIDATION_FAILED
```

---

## 16. CSV Generation Standards

## 16.1 Encoding

Use:

```text
UTF-8
```

For Excel compatibility with Thai text, consider:

```text
UTF-8 BOM
```

MVP can include BOM if target users open CSV in Excel on Windows.

## 16.2 Header Row

Every CSV must include header row.

Use snake_case:

```text
visit_id
visit_date
province_name
attraction_name
overall_score
```

Avoid:

```text
name
date
type
status
```

because they are ambiguous.

## 16.3 Escaping

CSV generator must correctly escape:

```text
commas
quotes
newlines
Thai text
```

Do not build CSV with unsafe string concatenation without escaping.

## 16.4 Missing Values

Use:

```text
blank
Not answered
Unknown
```

consistently.

Do not use 0 for missing score.

---

## 17. Visit Export Service

Method:

```ts
exportVisits(input, actor)
```

## 17.1 Purpose

Export visit-level operational and planning data.

## 17.2 Default Columns

```text
visit_id
visit_date
created_at
province_name
district_name
attraction_name
photo_spot_name
checkin_code
completion_status
origin_country_name
origin_province_name
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
spending_range
overall_score
revisit_intention
recommendation_intention
```

## 17.3 Excluded by Default

```text
display_name
email
LINE user ID
device token
uploaded photo path
private certificate URL
raw comments
```

Comments may be included only if permission allows.

---

## 18. Tourist Summary Export Service

Method:

```ts
exportTouristSummary(input, actor)
```

## 18.1 Purpose

Export profile-level summary without direct identifiers.

## 18.2 Default Columns

```text
anonymized_tourist_ref
created_at
origin_country_name
origin_province_name
age_group
preferred_language
identity_provider_summary
visit_count
stamp_count
first_visit_date
latest_visit_date
```

## 18.3 Identity Provider Summary

Safe values:

```text
guest_only
line_linked
email_linked
multiple
unknown
```

Do not include:

```text
provider_user_id
LINE ID
email address
device token
```

---

## 19. Expense Export Service

Method:

```ts
exportExpenses(input, actor)
```

## 19.1 Purpose

Export spending range data for economic impact analysis.

## 19.2 Default Columns

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
```

## 19.3 Required Labeling

Export metadata or README should state:

```text
Spending data is self-reported and range-based. It is an estimate, not verified revenue.
```

---

## 20. Satisfaction Export Service

Method:

```ts
exportSatisfaction(input, actor)
```

## 20.1 Purpose

Export satisfaction and feedback data.

## 20.2 Default Columns

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

## 20.3 Comment Column

Column:

```text
comment
```

Requires permission:

```text
export.comments
```

Reason:

Comments may contain personal data.

MVP may exclude comments from normal export.

Review exports should also exclude other free-text review fields, such as title, unless a restricted export explicitly requests them.

---

## 21. Funnel Summary Export Service

Method:

```ts
exportFunnelSummary(input, actor)
```

## 21.1 Purpose

Export QR-to-certificate-to-survey conversion metrics.

## 21.2 Default Columns

```text
event_date
province_name
attraction_name
photo_spot_name
event_name
event_count
```

Optional conversion output:

```text
stage_name
stage_count
conversion_from_previous
dropoff_from_previous
```

## 21.3 Rule

Funnel export should normally be aggregated.

Detailed session-level funnel export should be restricted.

---

## 22. Dashboard Summary Export Service

Method:

```ts
exportDashboardSummary(input, actor)
```

## 22.1 Purpose

Export high-level metrics for reports/presentations.

## 22.2 Default Columns

```text
metric_key
metric_name
metric_value
metric_unit
filter_start_date
filter_end_date
province_filter
attraction_filter
generated_at
notes
```

## 22.3 Source

Use DashboardService methods to avoid metric drift.

Do not recalculate dashboard metrics differently in export service.

---

## 23. Report Data Service

Future method:

```ts
generateAcademicReportData(input, actor)
```

## 23.1 Purpose

Provide structured data for academic report chapters and appendices.

## 23.2 Possible Sections

```text
project overview metrics
database summary
ERD/table counts
visit statistics
tourist profile summary
expense summary
satisfaction summary
dashboard insight summary
limitations
```

## 23.3 Rule

Reports should use the same metric definitions as dashboard.

---

## 24. PDF Report Future

Future PDF report may include:

```text
executive summary
KPI cards
charts
tables
methodology notes
data limitations
recommendations
```

PDF generation should be server-side.

Possible tools:

```text
Playwright
React PDF
server-side HTML to PDF
```

Not MVP unless required.

---

## 25. Excel Export Future

Excel export can include multiple sheets:

```text
Summary
Visits
Tourist Profiles
Expenses
Satisfaction
Funnel
Data Dictionary
Limitations
```

Excel must still follow privacy permissions.

---

## 26. Export Audit Logging

Every export must create audit log.

Audit action:

```text
data.export
```

Audit metadata:

```text
export_type
format
filters
row_count
privacy_level
actor_user_id
generated_at
file_name
stored_file_path optional
```

Do not log full exported data.

Do not log secrets.

---

## 27. Export File Storage

## 27.1 MVP Option

Direct streaming response:

```text
generate CSV in memory
return file response
do not store file
audit action
```

Best for small MVP datasets.

## 27.2 Production Option

Store file in private bucket:

```text
export-files
```

Path:

```text
exports/{year}/{month}/{export_id}.csv
```

Return signed URL.

Retention:

```text
24 hours to 7 days
```

---

## 28. Export File Naming

Recommended pattern:

```text
southern-border-tourism-{export_type}-{YYYYMMDD-HHmmss}.csv
```

Examples:

```text
southern-border-tourism-visits-20260518-213000.csv
southern-border-tourism-satisfaction-20260518-213000.csv
```

Avoid personal data in filename.

---

## 29. Export Row Limits

MVP should define safe limits.

Recommended:

```text
summary exports: no strict low limit
detailed exports: 10,000 rows default max
```

If more:

```text
ask user to narrow filters
```

Future:

```text
background export jobs
streaming CSV
queued export
```

---

## 30. Streaming CSV

For large exports, use streaming.

Benefits:

- lower memory usage
- handles larger datasets
- better production behavior

MVP can skip if datasets are small.

---

## 31. Background Export Jobs

Future feature.

Use for:

```text
large exports
PDF report generation
Excel workbook generation
official comparison reports
scheduled monthly reports
```

Requires:

```text
export_jobs table
job status
private file storage
notification or polling
```

Do not claim background processing exists unless implemented.

---

## 32. Export Job Table Future

Possible table:

```text
export_jobs
```

Fields:

```text
export_job_id
requested_by
export_type
format
filters_json
status
row_count
file_path
error_message
created_at
started_at
completed_at
expires_at
```

Status values:

```text
pending
processing
completed
failed
cancelled
expired
```

---

## 33. Data Dictionary Export

Future option:

```text
include_data_dictionary = true
```

For CSV, provide separate file or README.

For Excel, include `Data Dictionary` sheet.

Data dictionary should define:

```text
column_name
description
source_table
value_meaning
data_type
notes
```

---

## 34. Limitations Metadata

Exports should include or reference limitations.

Examples:

```text
Tourist profiles may not equal unique real individuals.
Local platform visits are QR/certificate participation records.
Spending is self-reported and range-based.
Missing satisfaction scores are excluded from averages.
```

For CSV, limitations can be:

- separate README file future
- metadata row avoided unless agreed
- dashboard report notes

MVP can document limitations in UI.

---

## 35. Export Security Rules

Export service must:

```text
check authentication
check permission
validate filters
sanitize output fields
avoid direct identifiers by default
audit action
avoid public file URLs
expire stored exports
```

Do not:

```text
export personal data by default
include LINE IDs
include device tokens
include private file paths
skip audit log
generate unlimited exports
```

---

## 36. Export Privacy Rules

## 36.1 Personal Data Exclusion

Default exports must exclude:

```text
email
LINE user ID
provider_user_id
device token
photo path
certificate private URL
raw IP
raw user agent
```

## 36.2 Comments

Comments may include personal data.

Export only if:

```text
actor has export.comments permission
purpose is valid
audit log records the action
```

## 36.3 Display Name

Display name may identify a person.

MVP normal exports should exclude or replace with anonymized reference.

---

## 37. Query Performance Requirements

Export queries must:

```text
use filters
use indexes
avoid N+1 queries
select only needed columns
limit rows where appropriate
stream for large data future
```

Do not run unbounded expensive joins for every export.

---

## 38. Error Handling

## 38.1 Unauthorized

```text
code: UNAUTHORIZED
message: Please sign in to continue.
```

## 38.2 Forbidden

```text
code: EXPORT_FORBIDDEN
message: You do not have permission to export this data.
```

## 38.3 No Data

```text
code: EXPORT_NO_DATA
message: No records found for the selected filters.
```

Option:

- return CSV with headers only
- or return clear no-data error

MVP recommendation:

```text
return CSV with headers only if user explicitly exports
```

or show UI warning before download.

## 38.4 Too Large

```text
code: EXPORT_TOO_LARGE
message: This export is too large. Please narrow the date range or filters.
```

## 38.5 Generation Failed

```text
code: EXPORT_GENERATION_FAILED
message: Could not generate export. Please try again.
```

---

## 39. Export API Endpoints

Recommended routes:

```text
POST /api/exports/visits
POST /api/exports/tourist-summary
POST /api/exports/expenses
POST /api/exports/satisfaction
POST /api/exports/funnel-summary
POST /api/exports/dashboard-summary
```

Alternative:

```text
POST /api/exports
```

with `exportType`.

For MVP, single `/api/exports` is acceptable if service structure is clean.

---

## 40. Content-Type Headers

CSV response headers:

```text
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="southern-border-tourism-visits-20260518-213000.csv"
```

If adding UTF-8 BOM, ensure correct output.

---

## 41. Export Service Workflow

Standard flow:

```text
Receive export request
    |
Authenticate admin
    |
Check permission
    |
Validate filters
    |
Estimate row count if needed
    |
Build privacy-safe query
    |
Generate rows
    |
Convert to CSV
    |
Create audit log
    |
Return file or signed URL
```

If storing file:

```text
Upload file to private export-files bucket
    |
Create export job/file record
    |
Return signed URL
```

---

## 42. Dashboard Summary Export Workflow

```text
Receive filters
    |
Check dashboard/export permission
    |
Call DashboardService
    |
Flatten metrics to rows
    |
Add notes/limitations
    |
Generate CSV
    |
Audit export
```

Important:

Do not duplicate metric calculations separately.

---

## 43. Academic Report Data Workflow

Future:

```text
Receive report filter/date range
    |
Check permission
    |
Call dashboard services
    |
Call database metadata service
    |
Build structured report data
    |
Return JSON or generate document/PDF
```

This can support:

```text
Chapter 4 implementation results
Chapter 5 conclusion
Dashboard report
Data dictionary report
```

---

## 44. Testing Requirements

Test:

```text
export with no permission
export with admin permission
export with viewer denied
export visits with filters
export no data
export Thai text
export comments without permission
export comments with permission
export row limit exceeded
export missing satisfaction
export estimated spending
export audit log created
CSV escaping commas/quotes/newlines
UTF-8 Excel compatibility
```

---

## 45. Unit Test Examples

## 45.1 Default Visit Export Excludes Personal Data

Given visit has:

```text
display_name
email
LINE ID
photo path
```

Expected export:

```text
does not include these fields
```

## 45.2 Satisfaction Export Missing Score

Given:

```text
overall_score = null
```

Expected:

```text
blank or Not answered
```

not:

```text
0
```

## 45.3 Export Audit Log

Given successful export:

Expected:

```text
audit_logs contains data.export action
```

with:

```text
export_type
row_count
actor_user_id
filters
```

---

## 46. MVP Acceptance Checklist

```text
[ ] ExportService exists.
[ ] Export request validation exists.
[ ] Export permission check exists.
[ ] Visit export can generate CSV.
[ ] Satisfaction export can generate CSV or is planned.
[ ] Expense export can generate CSV or is planned.
[ ] Dashboard summary export uses DashboardService or is planned.
[ ] CSV output supports Thai text.
[ ] Default exports exclude direct identifiers.
[ ] Export action creates audit log.
[ ] Export errors are user-friendly.
[ ] Large export risk is handled or documented.
```

---

## 47. Do Not Do

Do not:

```text
Export all database columns.
Export LINE user IDs by default.
Export device tokens.
Export raw photo paths.
Export private certificate paths.
Generate exports entirely in frontend from all raw data.
Skip permission checks.
Skip audit logs.
Call estimated spending revenue.
Convert missing satisfaction to 0.
Store export files forever.
Use public export URLs.
```

---

## 48. Future Enhancements

Possible future improvements:

```text
Excel workbook export
PDF executive report
scheduled monthly reports
background export jobs
export approval workflow
data dictionary attachment
official data comparison report
dashboard chart image export
research dataset anonymization
export expiration automation
```

---

## 49. Final Export Rule

Export services must be useful for planning but safe by default.

A system that exports too much private data is not production-ready, even if the dashboard looks good.
