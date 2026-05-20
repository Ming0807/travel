# AUDIT_LOGGING.md

## 1. Document Purpose

This document defines audit logging requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Audit logging is required because the system handles:

- tourist data
- uploaded photos
- certificate files
- dashboard metrics
- survey responses
- exports
- admin actions
- role/permission changes
- official data imports
- security-sensitive operations

Audit logs help answer:

```text
Who did what?
When did it happen?
What record was affected?
What changed?
Was data exported?
Was a sensitive action attempted?
```

---

## 2. Audit Logging Mission

The audit logging mission is:

```text
Provide a trustworthy trail of important system and admin actions without storing unnecessary personal data or secrets.
```

Audit logs should support:

```text
security review
data governance
PDPA/privacy accountability
admin accountability
debugging important actions
export tracking
incident investigation
production readiness
```

Audit logs are not for normal analytics.

---

## 3. Audit Logging Principles

## 3.1 Log Important Actions

Audit logs should record actions that affect:

```text
data integrity
privacy
security
exports
admin permissions
public content
QR/check-in availability
official data
system operations
```

## 3.2 Do Not Log Everything

Do not log every normal read or every tourist page view into audit logs.

For normal behavior analytics, use:

```text
funnel_events
dashboard summary tables
application logs
```

## 3.3 Do Not Log Secrets

Never log:

```text
Supabase service role key
database password
LINE channel secret
LINE access token
raw LINE ID token
CRON_SECRET
raw uploaded file content
private signed URLs
```

## 3.4 Avoid Excessive Personal Data

Audit logs should not become a second personal-data database.

Avoid logging:

```text
full tourist profile data
raw uploaded photos
raw survey comments
raw guest tokens
raw provider_user_id
full request body
```

## 3.5 Be Useful for Investigation

Audit logs should include enough context to understand the action.

Examples:

```text
actor
action
entity type
entity id
old values summary
new values summary
timestamp
result
metadata
```

---

## 4. Related Documents

Audit logging must align with:

```text
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/backend/AUTHORIZATION_RBAC.md
docs/backend/EXPORT_REPORTING_SERVICES.md
docs/backend/VALIDATION_ERROR_HANDLING.md
docs/backend/BACKGROUND_JOBS.md
```

---

## 5. Audit Log Table

Recommended table:

```text
audit_logs
```

Suggested columns:

```text
audit_log_id
actor_user_id
actor_type
action
entity_type
entity_id
result
old_values_json
new_values_json
metadata_json
ip_hash
user_agent_hash
request_id
created_at
```

---

## 6. Column Definitions

## 6.1 audit_log_id

Primary key.

Type:

```text
bigint / uuid
```

## 6.2 actor_user_id

Admin user who performed the action.

Nullable for:

```text
system jobs
public/tourist actions if audited
```

## 6.3 actor_type

Allowed values:

```text
admin
system
tourist
anonymous
```

MVP primarily uses:

```text
admin
system
```

## 6.4 action

Stable action key.

Examples:

```text
attraction.create
checkin_code.deactivate
data.export
role.assign
permission.denied
```

## 6.5 entity_type

Type of affected entity.

Examples:

```text
attraction
photo_spot
checkin_code
visit
survey
export
user
role
official_data_import
storage_file
system_job
```

## 6.6 entity_id

ID of affected entity.

Should be string-compatible because some IDs may be UUID.

## 6.7 result

Allowed values:

```text
success
failed
denied
partial_success
```

## 6.8 old_values_json

Before values for important updates.

Must be sanitized.

## 6.9 new_values_json

After values for important updates.

Must be sanitized.

## 6.10 metadata_json

Additional safe context.

Examples:

```text
filters used for export
row count
privacy level
reason
status
error code
```

Do not dump raw request body.

## 6.11 ip_hash / user_agent_hash

Optional.

Use only if needed for security investigation.

Prefer hashed or truncated values.

## 6.12 request_id

Useful for connecting audit logs to server logs.

## 6.13 created_at

Timestamp of audit record.

---

## 7. Audit Action Naming Convention

Use:

```text
resource.action
```

Examples:

```text
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
photo_spot.create
checkin_code.deactivate
data.export
user.deactivate
role.assign
permission.denied
```

Do not use vague names:

```text
save
edit
delete
do_action
```

---

# Actions to Audit

---

## 8. Authentication and Admin Account Events

Audit:

```text
admin.login_success optional
admin.login_failed optional
admin.logout optional
admin.account_deactivated
admin.account_reactivated
admin.password_reset_requested optional
```

MVP may rely on auth provider logs for login events.

Application should definitely audit:

```text
admin.account_deactivated
role changes
permission changes
```

---

## 9. Role and Permission Events

Audit:

```text
role.create
role.update
role.delete
role.assign
role.remove
permission.create
permission.update
permission.assign
permission.remove
user.role_update
```

These are high-risk actions.

Normally:

```text
super_admin only
```

---

## 10. Attraction Content Events

Audit:

```text
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
attraction.delete_attempt
```

Important changed fields:

```text
slug
name_th
name_en
province_id
district_id
is_published
is_active
latitude
longitude
```

Avoid logging huge description bodies unless needed.

Use summary/diff instead.

---

## 11. Photo Spot Events

Audit:

```text
photo_spot.create
photo_spot.update
photo_spot.deactivate
photo_spot.delete_attempt
```

Important because photo spots may be linked to QR/certificate flow.

---

## 12. Check-in Code Events

Audit:

```text
checkin_code.create
checkin_code.update
checkin_code.deactivate
checkin_code.reactivate
checkin_code.download_qr
```

Check-in codes are public entry points.

Important metadata:

```text
code
attraction_id
photo_spot_id
is_active
starts_at
ends_at
```

Avoid logging secrets. The check-in code itself is public-ish, but still treat admin metadata carefully.

---

## 13. Media and Storage Events

Audit:

```text
media.upload
media.update
media.deactivate
media.delete
storage.file_delete
storage.cleanup
```

For tourist photos, log only admin/system access or cleanup, not every normal tourist upload unless needed.

Metadata:

```text
bucket
storage_path hash or safe path summary
entity_type
entity_id
file_size_bytes
mime_type
```

Do not log signed URLs.

---

## 14. Visit and Tourist Data Events

MVP should avoid unnecessary audit logging for normal tourist flow to reduce personal-data risk.

Audit only sensitive admin actions:

```text
visit.view_sensitive optional
visit.update
tourist.view_sensitive optional
tourist.anonymize
tourist.delete_request_processed
tourist.identity_unlink
```

If implemented, sensitive reads should be audited.

Do not log every dashboard query.

---

## 15. Certificate and Stamp Events

Audit admin/system actions:

```text
certificate.revoke
certificate.regenerate
certificate.delete_file
stamp.revoke
stamp.manual_award
stamp.definition_create
stamp.definition_update
```

Normal tourist certificate generation is better recorded in operational tables and funnel events.

If certificate generation failures need debugging, use application logs.

---

## 16. Survey Events

Audit:

```text
survey.comment_view optional
survey.comment_export
survey.delete
survey.update
survey.anonymize
```

Raw comments may contain personal data.

Viewing or exporting raw comments can be sensitive.

---

## 17. Export Events

Every export must be audited.

Audit action:

```text
data.export
```

Required metadata:

```text
export_type
format
filters
row_count
privacy_level
file_name
stored_file_path optional
expires_at optional
```

Do not log:

```text
actual exported rows
personal identifiers
signed download URL
```

Export result values:

```text
success
failed
denied
partial_success
```

Denied export attempts should also be logged for sensitive export types.

---

## 18. Dashboard Events

Normal dashboard viewing does not need audit logs.

Audit only:

```text
dashboard.sensitive_view optional
dashboard.export
dashboard.admin_override future
```

Use application analytics if needed for dashboard usage.

---

## 19. Official Data Import Events

Audit:

```text
official_data.import_preview
official_data.import_confirm
official_data.import_failed
official_data.import_rollback future
official_data.attraction_link
```

Required metadata:

```text
source_name
source_period
row_count
valid_rows
invalid_rows
import_status
file_name
```

Do not log full uploaded file content.

---

## 20. Background Job Events

Audit or job log:

```text
system.job_run
system.job_success
system.job_failed
system.cleanup_files
system.refresh_dashboard_summary
system.expire_exports
```

Some job events may go to:

```text
background_job_runs
```

rather than audit_logs.

Critical jobs affecting data should have audit trail.

---

## 21. Permission Denied Events

Audit denied attempts for sensitive actions:

```text
export.personal_data denied
audit.read denied
user.manage denied
role.update denied
official_data.import denied
system.job_run denied
```

Do not audit every normal 403 if it creates too much noise.

Focus on high-risk actions.

---

# Sanitization

---

## 22. Audit Data Sanitization

Before writing audit logs, remove:

```text
passwords
tokens
service keys
LINE tokens
raw provider_user_id
raw guest token
signed URLs
large free text
raw uploaded file content
full request body
```

Sensitive values should be:

```text
omitted
redacted
hashed
summarized
```

---

## 23. Redaction Rules

Use:

```text
[REDACTED]
```

for secret fields.

Secret field names:

```text
password
token
secret
service_role_key
authorization
line_id_token
provider_user_id
guest_token
device_token
signed_url
```

---

## 24. Old/New Values Strategy

For updates, log meaningful changes.

Example:

```json
{
  "is_active": {
    "old": true,
    "new": false
  },
  "label": {
    "old": "Old sign",
    "new": "New sign"
  }
}
```

Avoid logging entire records if fields are large or sensitive.

---

## 25. Export Filters Sanitization

Export filters are useful to log.

Allowed:

```text
start_date
end_date
province_id
attraction_id
export_type
format
privacy_level
```

Avoid:

```text
raw search text if it contains personal data
raw SQL
raw comments
```

---

# Audit Service

---

## 26. AuditService

Recommended file:

```text
server/services/audit-service.ts
```

Recommended methods:

```ts
logAction(input: AuditLogInput): Promise<ServiceResult<void>>;
logSuccess(input: AuditLogInput): Promise<ServiceResult<void>>;
logFailure(input: AuditLogInput): Promise<ServiceResult<void>>;
logDenied(input: AuditLogInput): Promise<ServiceResult<void>>;
logExport(input: ExportAuditInput): Promise<ServiceResult<void>>;
logAdminChange(input: AdminChangeAuditInput): Promise<ServiceResult<void>>;
```

---

## 27. AuditLogInput Type

Conceptual TypeScript:

```ts
type AuditLogInput = {
  actorUserId?: string | number;
  actorType: "admin" | "system" | "tourist" | "anonymous";
  action: string;
  entityType?: string;
  entityId?: string | number;
  result: "success" | "failed" | "denied" | "partial_success";
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requestId?: string;
};
```

---

## 28. Audit Failure Handling

Audit logging should not normally break user-facing workflow unless the action is highly sensitive.

Examples:

- If attraction update succeeds but audit log fails, report/alert internally.
- If export succeeds but audit log fails, this is serious. Consider failing export or retrying audit log.
- If role change succeeds but audit fails, alert immediately.

Recommended:

```text
critical sensitive action should require audit success
normal content action may log error and continue
```

MVP can log and continue, but export audit should be prioritized.

---

## 29. Critical Audit Actions

Actions where audit failure should be treated seriously:

```text
data.export
export.personal_data
role.assign
role.remove
user.deactivate
permission.update
tourist.anonymize
official_data.import_confirm
system.job_run for deletion/anonymization
```

For these, consider transaction or retry strategy.

---

## 30. Audit Log Retention

Audit logs should be kept longer than temporary operational files.

Suggested:

```text
1-3 years
```

or according to institution policy.

Do not delete audit logs too quickly.

Do not keep sensitive metadata unnecessarily.

---

## 31. Audit Log Access Control

Audit logs are sensitive.

Required permission:

```text
audit.read
```

Normally:

```text
super_admin only
```

Future:

```text
auditor role
```

Audit export requires:

```text
audit.export
```

---

## 32. Audit Log UI

Future route:

```text
/admin/audit-logs
```

Required filters:

```text
date range
actor
action
entity_type
result
```

Columns:

```text
timestamp
actor
action
entity_type
entity_id
result
summary
```

Do not show full metadata by default.

---

## 33. Audit Log Export

Audit export is sensitive.

Requires:

```text
audit.export
```

Export should be limited and filtered.

Do not include secrets or raw sensitive metadata.

---

## 34. Audit and Incident Response

Audit logs should help answer:

```text
Who exported data?
Who deactivated a QR code?
Who changed a role?
Who imported official data?
Who accessed raw comments?
When did a sensitive action fail or get denied?
```

---

## 35. Audit and PDPA

Audit logs support accountability but can also contain personal data.

Therefore:

- minimize personal data in audit logs.
- restrict access.
- define retention.
- never store secrets.
- sanitize metadata.

---

## 36. Testing Checklist

Test:

```text
attraction create creates audit log
attraction update creates sanitized diff
attraction deactivate creates audit log
check-in code create/deactivate creates audit log
export creates audit log
export denied creates audit log for sensitive export
role assignment creates audit log
permission denied for role update creates audit log
audit metadata redacts tokens
audit logs not visible to normal admin/viewer
audit log read requires audit.read
```

---

## 37. MVP Acceptance Checklist

```text
[ ] audit_logs table exists or is planned.
[ ] AuditService exists or is planned.
[ ] Attraction publish/deactivate is audited.
[ ] Check-in code create/deactivate is audited.
[ ] Export action is audited.
[ ] Role/user changes are audited or super_admin-only planned.
[ ] Audit logs do not store secrets.
[ ] Audit logs sanitize metadata.
[ ] Audit logs require audit.read permission.
[ ] Export audit includes filters and row count.
```

---

## 38. Do Not Do

Do not:

```text
Log passwords.
Log service role key.
Log LINE tokens.
Log signed URLs.
Log raw uploaded file content.
Dump full request body into audit log.
Store raw guest token/provider_user_id.
Make audit logs public.
Allow normal viewer to read audit logs.
Use audit logs as general analytics events.
```

---

## 39. Future Enhancements

Possible future improvements:

```text
audit log viewer UI
audit export
suspicious activity alerts
export approval workflow
sensitive read auditing
immutable audit log storage
admin session tracking
role change notification
incident response dashboard
```

---

## 40. Final Audit Logging Rule

Audit logs should make sensitive actions accountable without becoming a new privacy risk.

Log what matters, sanitize aggressively, and restrict access.
