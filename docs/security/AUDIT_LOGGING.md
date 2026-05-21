# Audit Logging

## Purpose

Audit logging provides an accountable record of sensitive administrative and system actions without becoming a second personal-data store.

For Phase 08, audit logging focuses on the Next.js fullstack admin backoffice:

- Attraction CMS changes.
- Photo spot changes.
- Check-in code changes.
- Sensitive permission denials.
- Future export actions.
- Future role/user changes.

Normal tourist page views, QR scans, and funnel behavior belong in operational tables such as `funnel_events`, not in audit logs.

## Phase 08 Status

The database design includes an `audit_logs` table. Phase 08 documentation treats audit logging as required for production alignment, especially for admin CMS mutations and availability changes.

Do not claim that an audit log viewer, export approval workflow, immutable log storage, or full incident dashboard is implemented unless those features are separately verified.

## Audit Log Mission

The audit log should answer:

- Who performed the action?
- What action was attempted?
- Which entity was affected?
- When did it happen?
- Did it succeed, fail, or get denied?
- What safe summary of the change is needed for review?

It should not store secrets, raw personal identifiers, raw photos, signed URLs, or full request bodies.

## Recommended Table

The current schema uses an `audit_logs` table with fields aligned to:

| Field | Purpose |
|---|---|
| `log_id` | Audit record identifier |
| `admin_id` | Admin actor when available |
| `action` | Stable action key |
| `entity_type` | Type of affected record |
| `entity_id` | Affected record identifier |
| `old_data` | Sanitized before-state summary |
| `new_data` | Sanitized after-state summary |
| `ip_address` | Optional security context; prefer minimization or hashing in production |
| `created_at` | Audit timestamp |

Future production hardening may add result status, request ID, actor type, redaction metadata, or hashed user-agent fields.

## Action Naming

Use stable dot notation:

| Area | Example Actions |
|---|---|
| Attractions | `attraction.create`, `attraction.update`, `attraction.publish`, `attraction.unpublish`, `attraction.deactivate` |
| Photo spots | `photo_spot.create`, `photo_spot.update`, `photo_spot.deactivate` |
| Check-in codes | `checkin_code.create`, `checkin_code.update`, `checkin_code.deactivate`, `checkin_code.reactivate` |
| Media | `media.upload`, `media.update`, `media.deactivate` |
| Permissions | `permission.denied`, `role.assign`, `user.deactivate` |
| Exports | `data.export`, `data.export_denied` |

Avoid vague actions such as `save`, `edit`, or `delete`.

## Phase 08 Actions to Audit

Phase 08 should audit:

- Attraction create/update/publish/unpublish/deactivate.
- Photo spot create/update/deactivate.
- Check-in code create/update/deactivate/reactivate.
- Admin media upload/deactivation where implemented.
- Denied attempts for sensitive admin actions.
- User/role changes if user management is implemented.

Visit and survey list views do not need audit logs by default. Sensitive reads such as raw comments or personal identifiers may require audit logging if exposed later.

## Export Audit Boundary

Full report/export implementation is Phase 10 unless separately verified.

When exports are implemented, every export attempt must be audited with:

- Export type.
- Format.
- Filter summary.
- Row count.
- Privacy level.
- Result status.

Never log exported rows, signed download URLs, guest tokens, provider identifiers, or raw comments in audit metadata.

## Sanitization Rules

Audit metadata must remove or redact:

- Passwords and authorization headers.
- Supabase service role keys.
- Database passwords.
- LINE tokens and raw LINE ID tokens.
- Raw guest tokens or device tokens.
- Raw provider user IDs.
- Signed storage URLs.
- Raw uploaded file content.
- Full request bodies.
- Long free-text comments.

Use summaries, hashes, or explicit redaction where context is needed.

## Personal Data Minimization

Audit logs support PDPA accountability, but they can also create risk. Therefore:

- Store only the fields required to explain the admin action.
- Prefer record IDs and field-level summaries over copied records.
- Avoid duplicating tourist profile data.
- Do not store raw survey comments unless there is a specific, restricted audit requirement.
- Restrict audit log access to super admin or a future auditor role.

## Failure Handling

For normal CMS updates, audit failure should be reported internally and investigated. For high-risk actions, the system should consider failing the action or using a retry mechanism.

High-risk actions include:

- Detailed export.
- Personal data export.
- Role or permission change.
- User deactivation.
- Tourist anonymization.
- Bulk delete or cleanup job.

## Access Control

Audit read access requires a dedicated permission such as `audit.read`.

Audit export, if implemented, should require `audit.export` and should itself be audited.

Normal admins and viewers should not see audit metadata by default.

## Testing Checklist

- Attraction status changes create sanitized audit records.
- Photo spot and check-in code changes create sanitized audit records.
- Denied sensitive actions are audited where required.
- Audit records do not include secrets, tokens, signed URLs, or raw request bodies.
- Viewer and normal admin roles cannot read audit logs unless explicitly permitted.
- Export attempts are audited once export features exist.

## Related Documents

- `docs/backend/AUTHORIZATION_RULES.md`
- `docs/security/ROLE_PERMISSION_MATRIX.md`
- `docs/security/PDPA_PRIVACY_DESIGN.md`
- `docs/modules/MODULE_09_ADMIN_ATTRACTION_CMS.md`
