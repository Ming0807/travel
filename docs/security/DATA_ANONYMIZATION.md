# DATA_ANONYMIZATION.md

## 1. Document Purpose

This document defines data anonymization and deletion strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The platform collects tourist-related data for certificate generation, digital passport/stamp collection, dashboard analytics, and sustainable tourism planning.

The system should preserve useful aggregated planning data while reducing or removing personal data when it is no longer needed or when a valid privacy request is processed.

---

## 2. Anonymization Mission

The mission is:

```text
Protect tourist privacy while preserving non-identifying tourism planning value where appropriate.
```

Anonymization should help the system:

```text
respond to data deletion/anonymization requests
reduce privacy risk over time
enforce retention policy
preserve dashboard trends
support academic reporting safely
avoid unnecessary long-term identity storage
```

---

## 3. Important Definitions

## 3.1 Personal Data

Data that can identify or relate to a person.

Examples:

```text
display name
LINE user ID
Google subject
email
guest token
uploaded photo
certificate with photo/name
visit history linked to identity
survey comment
```

## 3.2 Pseudonymized Data

Data where direct identifiers are removed but records may still be linkable through a pseudonymous key.

Example:

```text
tourist_id remains but identity provider data is removed
```

This is safer than raw personal data but may still be personal data.

## 3.3 Anonymized Data

Data that can no longer reasonably identify a person.

Example:

```text
aggregated province-level visit counts
age group distribution without direct identifiers
```

## 3.4 Deletion

Permanent removal of data or files.

Examples:

```text
delete uploaded photo file
delete certificate file
delete identity provider record
```

## 3.5 Redaction

Replacing sensitive values with safe placeholders.

Example:

```text
display_name = "[anonymized]"
comment = null
```

---

## 4. Anonymization Principles

## 4.1 Preserve Planning Value When Safe

The project needs tourism planning analytics.

Anonymization should preserve:

```text
visit date
province
attraction
travel behavior category
spending range
satisfaction score
age group
origin region/country
```

when safe and allowed.

## 4.2 Remove Direct Identifiers

Remove or redact:

```text
display name
email
LINE provider_user_id
Google provider_user_id
guest token
uploaded photo
certificate file
raw comments
device token
raw IP/user agent
```

## 4.3 Avoid Re-Identification

Even without direct identifiers, combinations may identify people in small datasets.

Use caution with:

```text
rare origin country
small attraction/date range
unique comments
exact timestamps
small groups
```

## 4.4 Do Not Break Database Integrity

Use safe anonymization rather than destructive deletion where foreign key relationships are required for analytics.

## 4.5 Log Sensitive Actions

Anonymization/deletion actions must be audit logged.

---

## 5. Related Documents

This document aligns with:

```text
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/AUDIT_LOGGING.md
docs/database/DATA_RETENTION_POLICY.md
docs/backend/BACKGROUND_JOBS.md
```

---

## 6. Data Categories and Anonymization Actions

## 6.1 Tourist Profile

Table:

```text
tourists
```

Personal fields:

```text
display_name
preferred_language optional
origin_country_id optional
origin_province_id optional
age_group optional
```

Anonymization options:

```text
display_name -> "Anonymized Tourist"
preferred_language -> keep if needed for aggregate
origin_country_id -> keep or generalize depending on risk
origin_province_id -> keep or null/generalize
age_group -> keep or null/generalize
```

Recommended:

```text
remove display_name
keep broad planning fields if allowed
mark anonymized_at
```

---

## 6.2 Tourist Identities

Table:

```text
tourist_identities
```

Sensitive fields:

```text
provider
provider_user_id
linked_at
```

Anonymization action:

```text
delete identity records
or replace provider_user_id with irreversible hash only if needed
```

Recommended for privacy deletion:

```text
delete tourist_identities for the tourist
```

This removes Google/LINE/email/guest linkage.

---

## 6.3 Visit Records

Table:

```text
visits
```

Fields:

```text
tourist_id
attraction_id
photo_spot_id
visit_date
travel behavior fields
completion_status
```

Anonymization options:

```text
keep visit record for aggregate analytics
unlink tourist_id or link to anonymized tourist
reduce timestamp precision if needed
keep attraction/province/date for planning
```

Recommended MVP:

```text
keep visit record linked to anonymized tourist profile
remove direct identity records
```

Future stronger anonymization:

```text
set tourist_id to null if schema allows
or move to aggregate summary and delete row
```

---

## 6.4 Uploaded Tourist Photos

Table:

```text
visit_photos
```

Storage:

```text
visit-photos bucket
```

Sensitive:

```text
photo file
storage path
original filename
metadata
```

Anonymization/deletion action:

```text
delete storage file
set storage_path = null or mark deleted
set approval_status = deleted/anonymized
set deleted_at
```

Recommended:

```text
delete photo file on valid deletion/anonymization request
```

Photo files are high-risk.

---

## 6.5 Certificate Files

Table:

```text
certificates
```

Storage:

```text
certificate-files bucket
```

Sensitive:

```text
certificate image containing photo and display name
```

Action:

```text
delete certificate file
set certificate_path = null or mark revoked/deleted
set status = anonymized or deleted
set deleted_at
```

If certificate access must be preserved, user consent is required.

For privacy deletion:

```text
delete certificate file
```

---

## 6.6 Survey Responses

Tables:

```text
satisfaction_surveys
visit_expenses
survey_answers optional
```

Planning fields:

```text
scores
spending range
travel behavior
revisit/recommendation
```

Sensitive/high-risk field:

```text
comment
```

Recommended anonymization:

```text
keep structured scores/ranges for aggregate analytics
delete or redact raw comment
remove direct tourist linkage via visit/tourist anonymization
```

If comment contains personal data, remove it.

---

## 6.7 Funnel Events

Table:

```text
funnel_events
```

Potential identifiers:

```text
session_id
tourist_id
visit_id
metadata_json
```

Anonymization options:

```text
remove tourist_id
remove visit_id
hash or null session_id
keep event_name, event_date, attraction_id, photo_spot_id
```

Recommended:

```text
preserve aggregated funnel usefulness
remove direct link to tourist when anonymizing tourist
```

---

## 6.8 Consent Records

Table:

```text
consent_records
```

Consent records are accountability evidence.

Options:

```text
keep record but link to anonymized tourist
remove unnecessary metadata
preserve consent_version/purpose/timestamp
```

Do not delete consent records casually if they are needed for compliance evidence.

If full deletion is required, follow policy/legal guidance.

---

## 6.9 Audit Logs

Table:

```text
audit_logs
```

Audit logs should not contain personal data where possible.

If audit logs include personal data, anonymization may require:

```text
redact old_values_json/new_values_json
redact metadata_json
keep action/entity/timestamp
```

Audit logs should usually be retained for accountability.

---

## 6.10 Export Files

Storage:

```text
export-files bucket
```

Action:

```text
delete expired exports
delete exports containing deleted/anonymized personal data if needed
```

Export files should have short retention.

Recommended:

```text
24 hours to 7 days
```

---

# Anonymization Strategies

---

## 7. Soft Anonymization

Soft anonymization keeps database rows but removes identifiers.

Actions:

```text
display_name = "Anonymized Tourist"
delete identities
delete photo/certificate files
redact comments
mark anonymized_at
```

Benefits:

```text
preserves analytics
less risk of FK breakage
supports audit trail
```

Limitations:

```text
may still be pseudonymous if detailed visit patterns remain
```

---

## 8. Hard Deletion

Hard deletion removes records.

Use carefully because it can break relationships.

Suitable for:

```text
tourist identity records
uploaded photo files
certificate files
temporary files
expired exports
```

Less suitable for:

```text
visit records used for aggregate planning
audit logs
official data
```

unless policy requires.

---

## 9. Aggregation-Only Retention

For long-term retention, detailed personal rows may be replaced by aggregate summaries.

Example:

```text
daily_attraction_stats
monthly_province_stats
dashboard summary tables
```

After summary refresh and retention period, detailed personal records may be anonymized or deleted.

This is a strong privacy-preserving strategy.

---

## 10. Generalization

Generalize values to reduce re-identification risk.

Examples:

```text
exact visit timestamp -> visit date only
specific foreign country with tiny count -> Other
specific origin province -> region
age group remains broad
```

Use for public reports or small datasets.

---

## 11. Small Group Suppression

For public or external reporting, hide categories with very small counts.

Example rule:

```text
if count < 5, display "Suppressed"
```

MVP admin dashboard may not need this, but public dashboards should.

---

# Recommended Anonymization Workflow

---

## 12. User-Initiated Anonymization Request

Future workflow:

```text
Receive request
    |
Verify identity/ownership
    |
Identify linked tourist profile
    |
Show affected data summary
    |
Confirm action
    |
Run anonymization service
    |
Delete files where required
    |
Redact identifiers/comments
    |
Unlink identities
    |
Audit action
    |
Confirm completion
```

---

## 13. Admin-Initiated Anonymization

Admin may process a request.

Required permission:

```text
tourist.anonymize
```

Audit action:

```text
tourist.anonymize
```

Require confirmation:

```text
This action will remove personal identifiers and may delete photos/certificates.
```

---

## 14. Retention-Based Anonymization

Background job future:

```text
anonymize_old_personal_data
```

Trigger:

```text
records older than retention period
```

Actions:

```text
delete old photos
delete old certificate files if policy says so
remove identities after defined period if not needed
preserve aggregates
```

Must be carefully tested.

---

## 15. Anonymization Service

Recommended file:

```text
server/services/anonymization-service.ts
```

Recommended methods:

```ts
anonymizeTourist(touristId: number, actor: AdminActor): Promise<ServiceResult<AnonymizationResult>>;
deleteTouristFiles(touristId: number): Promise<ServiceResult<FileDeletionResult>>;
unlinkTouristIdentities(touristId: number): Promise<ServiceResult<void>>;
redactTouristComments(touristId: number): Promise<ServiceResult<void>>;
anonymizeOldRecords(input: RetentionAnonymizationInput): Promise<ServiceResult<RetentionJobResult>>;
previewAnonymization(touristId: number): Promise<ServiceResult<AnonymizationPreview>>;
```

---

## 16. Anonymization Preview

Before anonymization, show:

```text
tourist profile found
number of visits
number of photos
number of certificates
number of survey comments
identity providers linked
estimated files to delete
```

Do not show excessive personal data.

---

## 17. Anonymization Result Type

Conceptual TypeScript:

```ts
type AnonymizationResult = {
  touristId: number;
  identitiesRemoved: number;
  photosDeleted: number;
  certificatesDeleted: number;
  commentsRedacted: number;
  visitsPreserved: number;
  anonymizedAt: string;
};
```

---

# Suggested Database Fields

---

## 18. Add Anonymization Fields

Recommended fields on sensitive tables:

```text
anonymized_at
anonymized_by
deleted_at
deleted_by
deletion_reason
```

For tourists:

```text
is_anonymized
anonymized_at
```

For files:

```text
deleted_at
deletion_status
```

---

## 19. Tourist Table Fields

Recommended:

```text
is_anonymized boolean default false
anonymized_at timestamptz null
anonymization_reason text null
```

---

## 20. Visit Photo Fields

Recommended:

```text
deleted_at timestamptz null
deletion_reason text null
storage_path nullable
```

If storage_path cannot be null, use:

```text
storage_path = "[deleted]"
```

but nullable is cleaner.

---

## 21. Certificate Fields

Recommended:

```text
status text
deleted_at timestamptz null
revoked_at timestamptz null
certificate_path nullable
```

Status values:

```text
generated
revoked
deleted
anonymized
```

---

# Field-Level Anonymization Guide

---

## 22. Tourist Fields

| Field | Action |
|---|---|
| display_name | replace with "Anonymized Tourist" |
| origin_country_id | keep if safe, else null/generalize |
| origin_province_id | keep if safe, else null/generalize |
| age_group | keep if safe |
| preferred_language | keep if safe |
| created_at | keep |
| updated_at | update |
| is_anonymized | true |
| anonymized_at | set timestamp |

---

## 23. Tourist Identity Fields

| Field | Action |
|---|---|
| provider | delete row or keep summary only |
| provider_user_id | delete/redact |
| linked_at | delete row or keep non-identifying summary |
| metadata_json | delete/redact |

Recommended:

```text
delete identity rows
```

---

## 24. Visit Fields

| Field | Action |
|---|---|
| tourist_id | keep linked to anonymized tourist or null if schema supports |
| attraction_id | keep |
| photo_spot_id | keep |
| checkin_code_id | keep |
| visit_date | keep or reduce precision |
| completion_status | keep |
| travel behavior | keep if non-identifying |
| group_size | keep if not too rare |
| metadata_json | sanitize |

---

## 25. Survey Fields

| Field | Action |
|---|---|
| scores | keep |
| revisit_intention | keep |
| recommendation_intention | keep |
| comment | delete/redact |
| completed_at | keep or reduce precision |
| metadata_json | sanitize |

---

## 26. Funnel Event Fields

| Field | Action |
|---|---|
| session_id | hash/null |
| tourist_id | null or anonymized link |
| visit_id | keep only if not identifying or null |
| event_name | keep |
| event_time | keep or date-only |
| attraction_id | keep |
| photo_spot_id | keep |
| metadata_json | sanitize |

---

# File Deletion Rules

---

## 27. Tourist Photo Files

For valid anonymization/deletion request:

```text
delete from storage
set visit_photos.storage_path = null
set deleted_at
```

If deletion fails:

```text
log failure
retry or flag for cleanup
do not report full success until resolved or documented
```

---

## 28. Certificate Files

For valid anonymization/deletion request:

```text
delete certificate file
set certificates.certificate_path = null
set status = deleted/anonymized
set deleted_at
```

If user only wants to unlink identity but keep certificate, require clear policy/consent.

---

## 29. Export Files

Expired export files should be deleted automatically.

If an export contains data from a now-deleted/anonymized tourist, consider whether export retention period is short enough.

Recommended:

```text
short export retention
```

reduces this issue.

---

# Data Retention Integration

---

## 30. Retention-Based Rules

Possible retention strategy:

```text
temp uploads: 24 hours
export files: 24 hours to 7 days
orphan files: 7 days
tourist photos: 6-12 months or as policy defines
certificate files: keep while certificate/passport access is active
funnel events: aggregate after 12-24 months
survey comments: redact after defined period if not needed
```

Exact policy should be defined in:

```text
docs/database/DATA_RETENTION_POLICY.md
```

---

## 31. Summary Table Preservation

Before deleting/anonymizing detailed rows, ensure summary metrics are preserved if needed.

Summary tables:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
```

These should not contain direct identifiers.

---

## 32. Official Data

Official aggregate data is not tourist personal data unless imported files contain personal data.

Official tourism stats should generally be retained.

Import files should be controlled and may be deleted after validation if not needed.

---

# Security and Permission Requirements

---

## 33. Permissions

Required permissions:

```text
tourist.anonymize
tourist.delete
system.job_run for retention jobs
audit.read for review
```

Normal admins should not casually anonymize/delete personal data unless assigned.

---

## 34. Audit Logging

Every anonymization/deletion must audit:

```text
tourist.anonymize
tourist.identity_unlink
tourist.photo_delete
certificate.delete
survey.comment_redact
retention.anonymize_old_records
```

Audit metadata:

```text
actor
reason
tourist_id
counts of affected records
timestamp
result
```

Do not log deleted personal values.

---

## 35. Confirmation UX

Admin confirmation should say:

```text
This action removes personal identifiers and may delete photos/certificates. Aggregated planning data may be preserved.
```

Require explicit confirmation.

For high-risk deletion, consider requiring typing:

```text
ANONYMIZE
```

or super_admin approval.

---

# Edge Cases

---

## 36. Tourist Has Multiple Identities

Example:

```text
anonymous_device + Google + LINE
```

Anonymization should remove all identity records linked to tourist.

---

## 37. Tourist Has Multiple Visits

Keep visits for planning if policy allows.

Remove direct identifiers and files.

---

## 38. Tourist Has Shared Certificate

If public sharing exists in future:

```text
disable share link
delete or revoke share token
delete certificate file if requested
```

---

## 39. Survey Comment Contains Personal Data

Raw comment should be redacted.

Possible action:

```text
comment = null
comment_redacted_at = now
```

---

## 40. Audit Log Contains Personal Data

If an old audit log accidentally contains personal data:

```text
redact metadata_json/old_values_json/new_values_json
keep action/timestamp/entity summary
```

---

## 41. Foreign Key Constraints

If schema requires `tourist_id` on visits, do not delete tourist row.

Instead:

```text
anonymize tourist row
delete identities
```

This preserves FK integrity.

---

# Testing

---

## 42. Anonymization Testing Checklist

Test:

```text
tourist with one guest identity
tourist with Google identity
tourist with LINE identity
tourist with multiple identities
tourist with visits
tourist with uploaded photos
tourist with certificate files
tourist with survey comments
tourist with expense/satisfaction data
file deletion success
file deletion failure
audit log creation
dashboard still works after anonymization
exports exclude deleted identifiers
passport no longer accessible after identity removal
```

---

## 43. Retention Job Testing Checklist

Test:

```text
temp upload cleanup
orphan file cleanup
expired export cleanup
old photo deletion dry run
old funnel event aggregation
small batch processing
retry after failure
audit/job log created
```

---

## 44. MVP Acceptance Checklist

```text
[ ] Anonymization strategy is documented.
[ ] Direct identifiers to remove are identified.
[ ] Photo deletion strategy is defined.
[ ] Certificate deletion/revocation strategy is defined.
[ ] Survey comment redaction strategy is defined.
[ ] Tourist identity unlink/delete strategy is defined.
[ ] Visit analytics preservation strategy is defined.
[ ] Anonymization requires permission.
[ ] Anonymization is audit logged.
[ ] Export files have short retention.
[ ] Data retention policy references anonymization.
```

---

## 45. Do Not Do

Do not:

```text
Delete tourist row if it breaks visit FK relationships without plan.
Keep LINE user ID after deletion/anonymization request.
Keep Google subject or provider_user_id after deletion/anonymization request.
Keep guest token after anonymization.
Keep uploaded photo files unnecessarily.
Keep certificate file with photo/name after deletion request.
Leave raw comments containing personal data.
Log deleted personal values in audit log.
Claim data is anonymous if tourist_id still links to identity.
Use anonymized data for personal tracking.
```

---

## 46. Future Enhancements

Possible future improvements:

```text
self-service delete request
admin anonymization UI
anonymization preview screen
data export for tourist request
automatic retention jobs
small-group suppression for public reports
privacy-safe researcher dataset generator
certificate share revocation
identity unlink page
```

---

## 47. Final Anonymization Rule

Anonymization should remove the ability to identify a tourist while preserving responsible aggregate planning value when appropriate.

If data still links back to a person, call it pseudonymized, not anonymous.
