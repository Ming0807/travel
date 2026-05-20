# MODULE_13_OFFICIAL_DATA_IMPORT.md

## 1. Module Name

**Official Data Import Module**

---

## 2. Module Purpose

The Official Data Import Module supports future integration between the local tourism database and official tourism-related datasets.

This module is important because the project is not only a tourist-facing application. It is a tourism data platform for planning and academic use.

The local system should be designed so it can compare locally collected data with official tourism data when available.

---

## 3. Business Purpose

The platform collects local, attraction-level, and tourist-level data through QR, certificate, stamp, and survey flows.

Official data may provide broader context, such as:

- province-level tourism statistics
- official attraction registry data
- monthly or yearly visitor statistics
- official tourism revenue estimates
- tourism office reference data
- public attraction metadata

By connecting local and official data, the system becomes more credible and useful for:

- university project evaluation
- tourism planning
- provincial comparison
- sustainable tourism indicators
- data-driven policy recommendations
- future research

---

## 4. Core Design Decision

Official data should be stored separately from local operational data.

Correct:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Incorrect:

```text
overwrite local attraction and visit data directly with imported official data
```

Reason:

- official data and local data have different sources
- official data may be aggregated
- local data may be attraction-level or QR-level
- import errors must be traceable
- local records should not be destroyed by imports
- official data may be updated or revised later

---

## 5. Primary Users

## 5.1 Admin

Admins may import, review, and link official datasets.

## 5.2 Researcher

Researchers compare local collected data with official statistics.

## 5.3 Planner

Planners use official and local data together for decision-making.

## 5.4 Super Admin

Super admins control import permissions and audit logs.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP does not need full official data import implementation.

MVP should include:

- database design readiness
- documentation of official data integration
- optional placeholder tables
- clear separation between official and local data
- future import strategy
- dashboard design awareness

## 6.2 In Scope for Phase 2

Phase 2 may include:

- CSV import for official statistics
- manual upload import
- official attraction reference linking
- import validation
- import logs
- source metadata
- province/month/year mapping
- dashboard comparison
- official vs local metric comparison
- import error reporting

## 6.3 In Scope for Production

Production may include:

- scheduled import
- API-based import if official API exists
- versioned official data snapshots
- automated mapping suggestions
- data quality review workflow
- official data comparison dashboard
- import rollback or correction tools

## 6.4 Out of Scope for This Module

This module does not directly handle:

- public attraction page rendering
- tourist profile collection
- certificate generation
- survey submission
- QR code flow
- LINE integration

It provides external reference and comparison data.

---

## 7. Related Modules

This module connects to:

```text
MODULE_01_PUBLIC_ATTRACTIONS.md
MODULE_09_ADMIN_ATTRACTION_CMS.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_11_REPORT_EXPORT.md
```

It also depends heavily on:

```text
docs/database/DATA_QUALITY_RULES.md
docs/database/DATA_DICTIONARY.md
docs/database/ANALYTICS_TABLES.md
```

---

## 8. Required Data Tables

Recommended tables:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Optional future tables:

```text
official_data_sources
official_data_versions
official_import_errors
official_metric_mappings
```

---

## 9. Data Source Types

Possible official or semi-official sources:

```text
tourism statistics by province
tourism revenue statistics
visitor count statistics
attraction registry
province/district reference data
public tourism attraction lists
government open data
tourism campaign data
local tourism office datasets
```

Important:

All sources must be recorded with source name and import date.

---

## 10. Official Tourism Statistics

## 10.1 Purpose

Stores official aggregated tourism statistics.

Recommended table:

```text
official_tourism_stats
```

## 10.2 Suggested Columns

```text
official_stat_id
province_id
year
month
tourist_type
visitor_count
revenue_amount
currency_code
source_name
source_url
source_file_name
import_log_id
imported_at
```

## 10.3 Grain

Possible grains:

```text
province + year
province + year + month
province + tourist_type + year + month
```

## 10.4 Tourist Type Values

Suggested values:

```text
thai
foreign
total
unknown
```

## 10.5 Rules

- Do not mix annual and monthly data without clear fields.
- If month is null, treat as annual data.
- Store source metadata.
- Do not overwrite previous imports without logging.
- Use official data for comparison, not as local visit records.

---

## 11. Official Attraction References

## 11.1 Purpose

Links local attraction records to official attraction registry references.

Recommended table:

```text
official_attraction_refs
```

## 11.2 Suggested Columns

```text
official_ref_id
attraction_id
source_name
external_id
external_url
official_name_th
official_name_en
official_province_name
official_district_name
raw_data_json
linked_at
linked_by
```

## 11.3 Rules

- One local attraction may have multiple official references from different sources.
- Official names may differ from local names.
- Store raw imported metadata for traceability.
- Do not automatically overwrite local attraction content.
- Admin should review official-local matching.

---

## 12. Data Import Logs

## 12.1 Purpose

Tracks every import attempt.

Recommended table:

```text
data_import_logs
```

## 12.2 Suggested Columns

```text
import_log_id
source_name
source_url
source_file_name
import_type
status
records_processed
records_inserted
records_updated
records_failed
error_message
imported_by
imported_at
metadata_json
```

## 12.3 Import Status Values

```text
pending
processing
success
partial_success
failed
cancelled
```

## 12.4 Import Type Values

```text
tourism_stats
attraction_refs
province_master
district_master
other
```

---

## 13. Import Methods

## 13.1 Manual CSV Import

Recommended for Phase 2.

Flow:

```text
Admin uploads CSV
    |
System validates file format
    |
System previews parsed rows
    |
Admin confirms import
    |
System validates rows
    |
System inserts records
    |
System creates import log
    |
System shows result summary
```

## 13.2 Manual Data Entry

Useful for small official reference data.

Flow:

```text
Admin opens official reference form
    |
Admin enters source and official values
    |
Admin links to local attraction
```

## 13.3 API Import

Future production option.

Flow:

```text
Scheduled job or admin action calls API
    |
System fetches official data
    |
System validates response
    |
System maps fields
    |
System imports and logs results
```

## 13.4 File-Based Import

If official data is provided as Excel or CSV files.

Rules:

- store file name
- store source name
- store import timestamp
- validate column mapping
- keep import log

---

## 14. CSV Import Requirements

## 14.1 Required Validation

For official tourism stats CSV:

```text
province
year
visitor_count or revenue_amount
source_name
```

Recommended:

```text
month
tourist_type
currency_code
source_url
```

## 14.2 Data Type Validation

Rules:

- year must be integer.
- month must be 1-12 or null.
- visitor_count must be non-negative integer.
- revenue_amount must be non-negative numeric.
- province must map to existing province.
- tourist_type must be controlled value.
- source_name must not be empty.

## 14.3 Mapping Preview

Before final import, show:

```text
total rows
valid rows
invalid rows
province mapping
sample parsed data
detected columns
```

MVP may skip UI implementation but should plan it.

---

## 15. Province Mapping

Official data may use different province naming formats.

Examples:

```text
Yala
จังหวัดยะลา
YALA
ยะลา
```

The system must map these to:

```text
provinces.province_id
```

Rules:

- use exact mapping where possible.
- support manual correction.
- log unmapped provinces.
- do not import rows with unknown province unless stored as failed rows.

---

## 16. Attraction Matching

Official attraction names may differ from local names.

Example:

```text
Local: Aiyerweng Skywalk
Official: Skywalk Aiyerweng
Thai: สกายวอล์คอัยเยอร์เวง
```

Matching should be reviewed.

Possible matching signals:

```text
name similarity
province
district
coordinates
official external ID
admin confirmation
```

Rules:

- do not auto-link uncertain matches without review.
- store raw official data.
- allow admin to approve link.
- maintain local attraction data separately.

---

## 17. Data Quality Rules

## 17.1 Source Required

Every imported record must have source information.

Required:

```text
source_name
imported_at
import_log_id
```

Recommended:

```text
source_url
source_file_name
```

## 17.2 No Silent Overwrite

Do not silently overwrite previous official values.

Options:

- insert new version
- update with import log
- keep latest but preserve import history
- store raw data JSON

## 17.3 Validate Before Import

Do not import invalid rows.

Invalid rows should be:

- counted
- logged
- shown to admin
- downloadable as error report in future

## 17.4 Separate Local and Official Metrics

Local visits are collected by this platform.

Official visitor counts come from external sources.

Do not merge them into one metric without clear labeling.

---

## 18. Dashboard Integration

Official data can support these dashboard comparisons:

## 18.1 Local vs Official Visitor Trend

Compare:

```text
local visit_count
official visitor_count
```

By:

```text
province
month
year
```

Important label:

```text
Local platform visits are participation records, not full official arrivals.
```

## 18.2 Coverage Ratio

Possible metric:

```text
local_platform_visits / official_visitor_count
```

Use carefully.

Label:

```text
Platform coverage estimate
```

not exact market share.

## 18.3 Attraction Reference Coverage

Metric:

```text
number of local attractions linked to official references
```

## 18.4 Official Revenue vs Estimated Local Spending

Compare:

```text
official revenue amount
local estimated spending range
```

Important:

Local spending range is estimated and incomplete.

---

## 19. Report Integration

Official data can improve reports.

Possible report sections:

```text
official tourism context
local collected data comparison
province-level trend comparison
limitations of local sample
recommendations based on combined data
```

This is valuable for academic reporting.

---

## 20. Limitations and Warnings

The system must clearly state limitations.

Examples:

```text
Local platform data comes from tourists who scanned QR and participated.
It may not represent all tourists.
Official data may use different definitions and collection methods.
Expense data from the platform is estimated by ranges.
Comparisons should be interpreted carefully.
```

These warnings improve credibility.

---

## 21. Data Import Permissions

Recommended permissions:

```text
official_data.read
official_data.import
official_data.update
official_data.link_attraction
official_data.delete_or_archive
```

MVP can simplify to admin-only access.

Import actions should be logged.

---

## 22. Security Requirements

Rules:

- Only authorized users can import data.
- Validate uploaded files.
- Limit file size.
- Do not execute uploaded files.
- Store import files securely if retained.
- Do not expose internal import errors publicly.
- Do not store secrets in import logs.

---

## 23. Privacy Requirements

Official data should usually be aggregated and low-risk.

However:

- imported files must be reviewed before storage.
- do not import personal data unless approved.
- if official file includes personal data, stop and review policy.
- do not mix personal official data into tourism dashboard without legal basis.

---

## 24. File Upload Safety for Imports

Allowed MVP import formats:

```text
csv
```

Future:

```text
xlsx
json
```

Rules:

- validate file extension.
- validate MIME type where possible.
- limit size.
- parse safely.
- reject unexpected columns or map explicitly.
- do not execute macros.

---

## 25. Error Handling

## 25.1 Invalid File Type

Message:

```text
Please upload a CSV file.
```

## 25.2 Missing Required Columns

Message:

```text
The file is missing required columns.
```

## 25.3 Province Mapping Failed

Message:

```text
Some provinces could not be matched. Please review the mapping.
```

## 25.4 Import Failed

Message:

```text
Import failed. Please review the error report and try again.
```

## 25.5 Partial Success

Message:

```text
Some rows were imported, but some rows failed validation.
```

---

## 26. Import Audit Logging

Every import should create a log.

Audit action:

```text
official_data.import
```

Log metadata:

```text
source_name
source_file_name
import_type
status
records_processed
records_inserted
records_failed
imported_at
imported_by
```

Also create normal audit log if audit module exists.

---

## 27. API or Service Responsibilities

Recommended service functions:

```text
parseOfficialStatsCsv(file)
validateOfficialStatsRows(rows)
mapProvinceNames(rows)
previewImport(rows)
importOfficialTourismStats(rows, source)
createDataImportLog(input)
updateDataImportLogStatus(importLogId, status)
linkOfficialAttractionRef(attractionId, officialRefInput)
listOfficialStats(filters)
compareOfficialAndLocalStats(filters)
```

Do not put import logic directly in UI components.

---

## 28. Suggested CSV Columns for Official Stats

Recommended CSV columns:

```text
province_name
year
month
tourist_type
visitor_count
revenue_amount
currency_code
source_name
source_url
```

Example:

```text
province_name,year,month,tourist_type,visitor_count,revenue_amount,currency_code,source_name
Yala,2026,1,total,12000,35000000,THB,Example Official Source
```

---

## 29. Suggested CSV Columns for Attraction References

```text
official_name_th
official_name_en
province_name
district_name
external_id
external_url
source_name
latitude
longitude
attraction_type
```

Local attraction linking can happen after import.

---

## 30. MVP Acceptance Criteria

For MVP readiness, this module is acceptable when:

```text
[ ] Official data integration strategy is documented.
[ ] Database design includes or can add official data tables.
[ ] Local and official data are clearly separated.
[ ] Dashboard design can support future official comparison.
[ ] Report/export design can include official context later.
[ ] No code assumes local visits equal official tourist totals.
```

If implemented in MVP:

```text
[ ] Admin can upload CSV.
[ ] System validates required columns.
[ ] System maps province names.
[ ] Valid rows are imported.
[ ] Invalid rows are reported.
[ ] Import log is created.
[ ] Imported data can be viewed or exported.
```

---

## 31. Phase 2 Acceptance Criteria

```text
[ ] official_tourism_stats table exists.
[ ] official_attraction_refs table exists.
[ ] data_import_logs table exists.
[ ] CSV import works for tourism stats.
[ ] CSV import validates rows.
[ ] Province mapping works.
[ ] Import logs show success/failure.
[ ] Admin can link official attraction reference to local attraction.
[ ] Dashboard can compare official and local trends.
[ ] Export can include official comparison data.
```

---

## 32. Do Not Do

Do not:

```text
Overwrite local attraction data automatically.
Treat local QR visits as total official tourist arrivals.
Import data without source metadata.
Import invalid rows silently.
Ignore province mapping errors.
Mix annual and monthly data without clear fields.
Expose raw import errors to public users.
Import personal data from external files without review.
Let frontend parse and trust large official files without server validation.
```

---

## 33. Future Enhancements

Possible future features:

```text
official API integration
scheduled data sync
official data versioning
import rollback
attraction matching suggestions
official vs local dashboard
coverage ratio dashboard
PDF official comparison report
data source management UI
import error download
automated data quality checks
```

---

## 34. Example User Stories

## 34.1 Admin Imports Official Statistics

As an admin, I want to import official tourism statistics so that the dashboard can compare local collected data with official province-level data.

Acceptance:

```text
Given I have import permission
When I upload a valid CSV file
Then official_tourism_stats records are created
And an import log is saved
```

---

## 34.2 Admin Reviews Failed Rows

As an admin, I want to see rows that failed import validation.

Acceptance:

```text
Given some CSV rows are invalid
When import finishes
Then the system shows failed row count and error reasons
```

---

## 34.3 Researcher Compares Local and Official Data

As a researcher, I want to compare local platform visits with official visitor statistics.

Acceptance:

```text
Given official stats and local visits exist
When I open comparison dashboard
Then I see both values clearly labeled
And the dashboard explains that local visits are platform participation records
```

---

## 34.4 Admin Links Official Attraction Reference

As an admin, I want to link a local attraction to an official reference.

Acceptance:

```text
Given an official attraction reference exists
When I link it to a local attraction
Then official_attraction_refs stores the relationship
And local attraction data is not overwritten automatically
```

---

## 35. Definition of Done

For MVP planning, this module is done when:

```text
[ ] Official data strategy is documented.
[ ] Tables are planned.
[ ] Local and official data separation is clear.
[ ] Dashboard comparison direction is clear.
[ ] Import risks are documented.
```

For Phase 2 implementation, this module is done when:

```text
[ ] CSV import works.
[ ] Validation works.
[ ] Import logs work.
[ ] Province mapping works.
[ ] Official attraction linking works.
[ ] Dashboard comparison works.
[ ] Export integration works.
[ ] Documentation and tests are updated.
```

---

## 36. Final Rule

Official data should strengthen the platform's planning value.

It must not replace or corrupt local collected data.

Always label local platform data and official data clearly, because they may measure different things.
