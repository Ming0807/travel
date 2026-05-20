# BACKGROUND_JOBS.md

## 1. Document Purpose

This document defines background job requirements for the **Southern Border Tourism Data & Intelligence Platform**.

MVP can run without many background jobs, but production readiness requires planning for scheduled tasks, cleanup, summaries, exports, and maintenance.

This document defines which jobs are required now, which can wait, and how they should be designed.

---

## 2. Background Jobs Mission

The mission is:

```text
Move heavy, repeated, delayed, or cleanup work out of user-facing requests.
```

Background jobs should improve:

- performance
- reliability
- storage hygiene
- dashboard speed
- export scalability
- data retention compliance
- operational monitoring

---

## 3. MVP vs Production

## 3.1 MVP

MVP should avoid unnecessary infrastructure complexity.

MVP can perform most work synchronously:

```text
photo upload
certificate generation record
stamp award
survey submit
dashboard live queries
small CSV export
```

MVP should still document future jobs.

## 3.2 Production

Production should add jobs for:

```text
orphan file cleanup
temporary file cleanup
export expiration
dashboard summary refresh
materialized view refresh
large export generation
official data import processing
data retention/anonymization
scheduled reports
monitoring alerts
```

---

## 4. Recommended Job Types

Background jobs can be grouped into:

```text
cleanup jobs
analytics jobs
export/report jobs
storage processing jobs
import jobs
notification jobs
maintenance jobs
```

---

## 5. Recommended Job Infrastructure

## 5.1 MVP

No complex queue required.

Options:

```text
manual admin actions
database scheduled functions if available
server cron if deployment supports it
Vercel Cron if using Vercel
Supabase Edge Functions scheduled tasks future
```

## 5.2 Production

Possible tools:

```text
Vercel Cron Jobs
Supabase Scheduled Edge Functions
pg_cron
BullMQ + Redis
Cloudflare Queues
GitHub Actions scheduled workflow for maintenance
```

Choose based on deployment stack.

---

## 6. Job Design Principles

## 6.1 Idempotent

Jobs should be safe to run multiple times.

Example:

```text
cleanup temp files older than 24 hours
```

Running twice should not break data.

## 6.2 Observable

Jobs should log:

```text
start time
end time
status
records processed
records failed
error message
```

## 6.3 Bounded

Jobs should process data in batches.

Avoid:

```text
one job scans millions of records without limit
```

## 6.4 Permission-Safe

Jobs must not bypass privacy/security rules unnecessarily.

If using service role, limit logic carefully.

## 6.5 Recoverable

If job fails halfway, rerun should continue safely.

---

## 7. Job Logging Table

Recommended future table:

```text
background_job_runs
```

Suggested fields:

```text
job_run_id
job_name
status
started_at
finished_at
records_processed
records_succeeded
records_failed
error_message
metadata_json
created_at
```

Status values:

```text
running
success
partial_success
failed
cancelled
```

MVP can use server logs first, but table is better for production.

---

## 8. Cleanup Jobs

## 8.1 Orphan File Cleanup

Purpose:

Remove storage files that were uploaded but not linked to database records.

Causes:

```text
upload succeeded but database insert failed
certificate generation interrupted
admin media upload cancelled
temp upload not finalized
```

Job name:

```text
cleanup_orphan_files
```

Frequency:

```text
daily
```

Rules:

- only delete files older than safe threshold
- never delete files referenced by database
- log deleted count
- dry-run option recommended

Safe threshold:

```text
24 hours or 7 days depending on file type
```

## 8.2 Temporary File Cleanup

Purpose:

Remove temp files.

Job name:

```text
cleanup_temp_uploads
```

Frequency:

```text
daily
```

Rule:

```text
delete temp uploads older than 24 hours
```

## 8.3 Expired Export Cleanup

Purpose:

Remove generated export files after expiration.

Job name:

```text
cleanup_expired_exports
```

Frequency:

```text
daily
```

Rules:

- delete export file if `expires_at < now`
- mark export job/file expired
- keep audit log
- do not delete audit logs

## 8.4 Expired Share Link Cleanup

Future.

Purpose:

Disable expired public certificate/passport share links.

Frequency:

```text
daily
```

---

## 9. Data Retention Jobs

## 9.1 Tourist Photo Retention

Purpose:

Apply retention policy to tourist uploaded photos.

Possible policy:

```text
delete or archive visit photos after 6-12 months unless needed
```

MVP:

```text
document only
```

Production:

```text
anonymize/delete according to policy
```

## 9.2 Personal Data Anonymization

Purpose:

Support privacy requests or retention rules.

Job name:

```text
anonymize_old_personal_data
```

Rules:

- preserve aggregate analytics
- remove direct identifiers
- keep non-identifying visit statistics
- log action
- do not break dashboard relationships

## 9.3 Consent Version Review

Future job:

```text
find profiles with outdated consent version
```

May prompt users on next visit.

---

## 10. Analytics Summary Jobs

## 10.1 Daily Attraction Stats Refresh

Purpose:

Precompute daily attraction metrics.

Table:

```text
daily_attraction_stats
```

Job name:

```text
refresh_daily_attraction_stats
```

Frequency:

```text
hourly or daily
```

Metrics:

```text
visit_count
certificate_count
stamp_count
survey_completed_count
average_satisfaction
estimated_spending_min
estimated_spending_max
```

## 10.2 Monthly Province Stats Refresh

Table:

```text
monthly_province_stats
```

Frequency:

```text
daily or monthly
```

Metrics:

```text
visit_count
tourist_profile_count
certificate_count
survey_completion_rate
average_satisfaction
estimated_spending
```

## 10.3 Funnel Summary Refresh

Table:

```text
daily_funnel_stats
```

Frequency:

```text
hourly or daily
```

Metrics:

```text
event_name
event_count
province_id
attraction_id
photo_spot_id
date
```

## 10.4 Satisfaction Summary Refresh

Table:

```text
daily_satisfaction_stats
```

Frequency:

```text
daily
```

Metrics:

```text
average_score
response_count
low_score_count
revisit_intention_rate
recommendation_intention_rate
```

---

## 11. Materialized View Refresh Jobs

If using PostgreSQL materialized views:

Job names:

```text
refresh_dashboard_materialized_views
refresh_official_comparison_views
```

Frequency:

```text
hourly or daily
```

Rules:

- use concurrent refresh if available
- log refresh duration
- avoid locking dashboard for long time
- fallback to raw query if refresh fails

---

## 12. Export Jobs

## 12.1 Large Export Generation

Purpose:

Generate large CSV/Excel/PDF exports without blocking request.

Job name:

```text
generate_export_file
```

Triggered by:

```text
admin export request
```

Flow:

```text
create export_jobs record
    |
queue job
    |
generate file
    |
store in private export-files bucket
    |
mark completed
    |
return status/download URL
```

MVP:

```text
direct CSV response for small exports
```

Production:

```text
background export jobs
```

## 12.2 Scheduled Reports

Future.

Job name:

```text
generate_scheduled_report
```

Frequency:

```text
monthly
```

Outputs:

```text
PDF report
CSV summary
Excel workbook
```

---

## 13. Certificate Jobs

## 13.1 Server-Side Certificate Rendering

Future job if server-side rendering is added.

Job name:

```text
render_certificate
```

Triggered by:

```text
certificate generation request
```

Flow:

```text
create certificate job
render image/PDF
upload to storage
create/update certificate record
award stamp
notify frontend by polling or return status
```

MVP uses frontend-rendered PNG, so this job is not required.

## 13.2 Certificate Thumbnail Generation

Future job:

```text
generate_certificate_thumbnail
```

Useful for admin/passport views.

---

## 14. Image Processing Jobs

Future jobs:

```text
process_visit_photo
generate_photo_thumbnail
strip_photo_exif
optimize_attraction_image
generate_attraction_thumbnails
```

MVP can skip.

Production should consider:

- EXIF stripping
- thumbnail generation
- compression
- moderation workflow

---

## 15. Official Data Import Jobs

Future official data import may be asynchronous.

Job name:

```text
process_official_data_import
```

Triggered by:

```text
admin uploads official CSV/Excel
```

Flow:

```text
upload file
create data_import_logs record
parse file
validate rows
map provinces
insert valid rows
record failed rows
mark import status
```

MVP can implement preview/confirm synchronously if files are small.

---

## 16. Notification Jobs

Notifications are optional and should require consent.

Possible future jobs:

```text
send_certificate_line_message
send_passport_reminder
send_campaign_notification
send_survey_reminder
```

Rules:

- consent required
- opt-out required
- avoid spam
- log message
- do not send sensitive data unnecessarily

MVP should not implement automated notifications.

---

## 17. Passport Jobs

Future jobs:

```text
calculate_passport_progress
award_badges
expire_campaign_progress
refresh_passport_summary
```

MVP can compute passport live.

---

## 18. Job Status Tables

## 18.1 export_jobs

Future table:

```text
export_job_id
requested_by
export_type
format
filters_json
privacy_level
status
row_count
file_path
error_message
created_at
started_at
completed_at
expires_at
```

## 18.2 certificate_jobs

Future table:

```text
certificate_job_id
visit_id
status
input_json
output_certificate_id
error_message
created_at
started_at
completed_at
```

## 18.3 import_jobs or data_import_logs

Already planned:

```text
data_import_logs
```

Can serve as job log for imports.

---

## 19. Job Status Values

Use consistent status values:

```text
pending
processing
success
partial_success
failed
cancelled
expired
```

Avoid too many custom statuses.

---

## 20. Job Retry Strategy

Retries are useful for:

```text
temporary storage failure
network failure
temporary API failure
export generation transient failure
materialized view refresh failure
```

Retries are not useful for:

```text
invalid input file
permission denied
invalid export filter
missing required data
```

Recommended retry:

```text
3 attempts
exponential backoff
log final failure
```

MVP can skip automated retry and rely on manual retry.

---

## 21. Job Idempotency

Jobs must be idempotent.

Examples:

## 21.1 Cleanup Job

If file already deleted:

```text
skip and continue
```

## 21.2 Summary Refresh Job

Use upsert by:

```text
date + attraction_id
date + province_id
date + event_name
```

## 21.3 Export Job

If job already completed:

```text
do not regenerate unless requested
```

## 21.4 Certificate Job

If certificate already exists for visit:

```text
return existing certificate or mark job completed
```

---

## 22. Job Batching

Large jobs should process in batches.

Example:

```text
1000 rows per batch
```

Benefits:

- avoids timeout
- easier retry
- less memory
- progress tracking

---

## 23. Job Timeouts

Define safe timeouts.

Examples:

```text
cleanup job: 5 minutes
summary refresh: 10 minutes
export generation: depends on size
image processing: per file limit
```

If using serverless environment, respect platform limits.

---

## 24. Job Monitoring

Production should monitor:

```text
failed job count
long-running jobs
last successful summary refresh
export failures
storage cleanup errors
official import failures
```

MVP can use logs.

Future admin page:

```text
/admin/system/jobs
```

---

## 25. Job Error Handling

Job errors should be logged safely.

Store:

```text
job_name
status
error_message
records_processed
records_failed
metadata_json
```

Do not store:

```text
service role key
raw LINE token
raw uploaded file content
unnecessary personal data
```

---

## 26. Scheduling Recommendations

Suggested production schedule:

```text
cleanup_temp_uploads: daily
cleanup_orphan_files: daily
cleanup_expired_exports: daily
refresh_daily_attraction_stats: hourly or daily
refresh_monthly_province_stats: daily
refresh_funnel_stats: hourly or daily
refresh_satisfaction_stats: daily
official_data_import: manual or scheduled if API exists
scheduled_reports: monthly
```

MVP:

```text
none required except manual cleanup if needed
```

---

## 27. Supabase Options

If using Supabase:

Possible options:

```text
Supabase Edge Functions scheduled
pg_cron if available
database functions
manual admin trigger
```

Use service role only in secure server-side environment.

Do not expose service role key to frontend.

---

## 28. Vercel Options

If deploying on Vercel:

Possible options:

```text
Vercel Cron Jobs
API route as scheduled endpoint
protected cron secret
```

Rules:

- cron endpoint must be protected
- use CRON_SECRET
- do not allow public users to run maintenance jobs

---

## 29. Cron Endpoint Security

If using cron endpoints:

```text
GET /api/cron/cleanup
GET /api/cron/refresh-dashboard
```

Require header:

```text
Authorization: Bearer ${CRON_SECRET}
```

or platform-native cron protection.

Do not leave cron routes public.

---

## 30. Manual Admin Jobs

Some jobs can be manually triggered by super admin:

```text
refresh dashboard summaries
cleanup expired exports
retry failed import
regenerate report
```

Manual job actions require permission:

```text
system.job_run
```

MVP can skip UI.

---

## 31. Background Job Permissions

Only trusted system/server code should execute jobs.

Admin-triggered jobs require:

```text
super_admin
```

or specific permission:

```text
system.job_run
```

Jobs should not depend on frontend role state.

---

## 32. Data Retention and Privacy

Background jobs may delete/anonymize data.

These jobs are sensitive.

Requirements:

- clear policy
- admin approval where needed
- audit logs
- dry-run mode recommended
- never delete historical analytics accidentally
- preserve aggregate planning data if policy allows

See:

```text
docs/database/DATA_RETENTION_POLICY.md
docs/security/DATA_ANONYMIZATION.md
```

---

## 33. MVP Background Job Acceptance

MVP does not require all jobs.

MVP should have:

```text
[ ] Background job strategy documented.
[ ] Cleanup risks documented.
[ ] Export expiration planned.
[ ] Dashboard summary table refresh planned.
[ ] Certificate rendering job future path documented.
[ ] Cron endpoint security rules documented.
```

Optional MVP implementation:

```text
[ ] manual cleanup script
[ ] simple daily cleanup cron
[ ] simple dashboard summary refresh
```

---

## 34. Production Acceptance Checklist

```text
[ ] Job run logging table exists.
[ ] Cron/job runner is configured.
[ ] Cleanup temp uploads works.
[ ] Cleanup orphan files works.
[ ] Expired export cleanup works.
[ ] Dashboard summary refresh works.
[ ] Failed jobs are logged.
[ ] Cron endpoints are protected.
[ ] Jobs are idempotent.
[ ] Jobs process in batches.
[ ] Job failures do not expose secrets.
[ ] Data retention jobs follow policy.
```

---

## 35. Do Not Do

Do not:

```text
Run heavy exports synchronously forever.
Leave export files stored forever.
Leave temp uploads forever.
Create public cron endpoints.
Use frontend to trigger privileged jobs without backend permission.
Delete files without checking database references.
Build cleanup job with no dry-run/testing.
Refresh heavy dashboard data on every page load forever.
Send LINE notifications without consent.
Expose service role key in job code shipped to browser.
```

---

## 36. Future Enhancements

Possible future improvements:

```text
job dashboard
job retry queue
email/LINE notification after export ready
scheduled monthly PDF report
image processing pipeline
EXIF stripping
dashboard materialized view refresh
official API sync
privacy/anonymization workflows
export approval workflow
```

---

## 37. Final Background Job Rule

Background jobs should make the production system healthier, not more fragile.

Every job must be safe to retry, safe to fail, logged, and protected from unauthorized execution.
