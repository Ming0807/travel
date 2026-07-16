# Role Permission Matrix

## Purpose

This document defines role and permission expectations for the admin backoffice.

The matrix protects:

- Public attraction content quality.
- QR/check-in availability.
- Visit and survey privacy.
- Admin user safety.
- Future dashboard and export governance.

Phase 08 focuses on admin CMS alignment. Full analytics, export workflows, LINE LIFF, and official import operations are not claimed as complete here.

## Principle

Permissions are the source of truth. Roles are bundles of permissions.

Use server-side permission checks for every protected page, mutation, sensitive read, and export action. Frontend button visibility is only a usability aid.

## Phase 08 Roles

| Role | Purpose | Phase 08 Notes |
|---|---|---|
| `super_admin` | Highest trust administrator | Can manage users, roles, and sensitive settings when those screens exist |
| `admin` or operational admin equivalent | Runs day-to-day CMS operations | Can manage attractions, photo spots, and check-in codes |
| `viewer` | Read-only admin user | Can view permitted dashboard/read-only records only |

The seed data may include more operational names such as `province_admin` or `attraction_manager`. Those roles should still resolve to explicit permissions and may later support scoped access by province or attraction.

## Future Roles

| Role | Status | Purpose |
|---|---|---|
| `researcher` | Future | Aggregated analytics and anonymized datasets |
| `content_editor` | Future | Public content only, no sensitive tourist data |
| `data_exporter` | Future | Restricted export workflows |
| `auditor` | Future | Audit log review without normal content mutation |
| `staff` | Future | Scoped attraction or province operations |

## Phase 08 Permission Set

The compact permission set currently aligned with the implementation direction is:

| Permission | Meaning |
|---|---|
| `dashboard.read` | View privacy-safe dashboard entry or summaries |
| `attraction.read` | View attraction CMS records |
| `attraction.manage` | Create, edit, publish, unpublish, or deactivate attractions |
| `checkin_code.manage` | Manage check-in codes and QR entry records |
| `export.summary` | Future privacy-safe summary export |
| `export.detailed` | Future restricted detailed export |
| `user.manage` | Manage admin users and roles |

Recommended future permissions:

- `photo_spot.read`
- `photo_spot.manage`
- `visit.read`
- `survey.read`
- `survey.comment_read`
- `audit.read`
- `role.manage`
- `media.manage`

## MVP Matrix

| Permission | Super Admin | Admin | Viewer |
|---|---:|---:|---:|
| `dashboard.read` | Yes | Yes | Yes |
| `attraction.read` | Yes | Yes | Yes |
| `attraction.manage` | Yes | Yes | No |
| `photo_spot.manage` | Yes | Yes | No |
| `checkin_code.manage` | Yes | Yes | No |
| `visit.read` | Yes | Yes | Limited/optional |
| `survey.read` | Yes | Yes | Limited/optional |
| `survey.comment_read` | Yes | Optional/restricted | No |
| `export.summary` | Yes | Optional | No |
| `export.detailed` | Restricted | No by default | No |
| `audit.read` | Yes | No by default | No |
| `user.manage` | Yes | No by default | No |
| `role.manage` | Yes | No by default | No |

If a granular permission is not implemented yet, the server must use an approved compact permission and document the temporary mapping.

## Data Access Matrix

| Data Category | Public | Tourist Owner | Viewer | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|
| Published active attractions | Yes | Yes | Yes | Yes | Yes |
| Draft or inactive attractions | No | No | Optional | Yes | Yes |
| Check-in code public resolve | Safe context only | Safe context only | Yes | Yes | Yes |
| Check-in code admin list | No | No | Optional | Yes | Yes |
| Visit summary | No | Own only where implemented | Limited | Yes | Yes |
| Visit detail | No | Own only | No by default | Restricted | Yes |
| Survey summary | No | Own only where implemented | Limited | Yes | Yes |
| Raw survey comment | No | Own only where implemented | No | Restricted | Yes |
| Tourist identity provider IDs | No | Hidden | No | No by default | Restricted |
| Uploaded photo private path | No | Own access only | No | Restricted | Yes |
| Audit logs | No | No | No | No by default | Yes |
| Export files | No | No | No | Permission only | Restricted |

## Route Permission Mapping

| Route | Required Permission |
|---|---|
| `/admin` | Active admin session |
| `/admin/dashboard` | `dashboard.read` |
| `/admin/attractions` | `attraction.read` |
| `/admin/attractions/new` | `attraction.manage` |
| `/admin/attractions/[attractionId]/edit` | `attraction.manage` |
| `/admin/photo-spots` | `photo_spot.manage` or compact CMS permission |
| `/admin/checkin-codes` | `checkin_code.manage` |
| `/admin/visits` | `visit.read` or compact operational read permission |
| `/admin/surveys` | `survey.read` or compact operational read permission |
| `/admin/audit` | `audit.read` |
| `/admin/users` | `user.read`; mutations require granular user permissions |
| `/admin/roles` | `role.read`; create/update/delete require their matching granular permission |
| `/admin/certificate-templates` | `certificate.template_manage` |

## Sensitive Fields

Sensitive fields include:

- Tourist display name.
- Email or contact details.
- Guest token.
- Device token.
- Provider user ID.
- LINE user ID.
- Uploaded photo storage path.
- Certificate private path.
- Raw survey comment.
- Raw IP address and user agent.
- Audit metadata.

Default admin tables should not expose these fields unless there is a clear operational purpose and a specific permission.

## Export Rules

Export functionality is not a Phase 08 completion claim.

When implemented:

- Summary export should use aggregated or anonymized data.
- Detailed export should exclude private identifiers by default.
- Raw comments require a separate permission.
- Personal data export should be disabled or super-admin restricted until a privacy workflow exists.
- Every export attempt must be audit logged.

## Contact Message Permissions

Contact messages contain names and contact details, so they are not part of general viewer access.

| Permission | Meaning | Default roles |
|---|---|---|
| `message.read` | Read contact messages | `super_admin`, `admin` |
| `message.update` | Change read, archived, and replied status | `super_admin`, `admin` |
| `message.delete` | Delete contact messages | `super_admin`, `admin` |
| `export.messages` | Request a contact-message export | `super_admin`, `admin` |

Message export also requires `export.personal_data`. The page must hide unavailable commands, while every server action and export route still enforces permissions independently.

## Role And Certificate Template Operations

- Role list access requires `role.read`.
- Role creation, update, and deletion require `role.create`, `role.update`, and `role.delete` respectively.
- Role export requires both `role.read` and `export.roles`.
- Certificate template list and mutations require `certificate.template_manage`.
- Certificate template export additionally requires `export.certificate_templates` and never includes private background storage paths.
- Certificate template mutations use the service-role client only after the server permission guard succeeds because the table's public RLS policy is read-only.

## Authorization Tests

Test coverage should verify:

- Anonymous users cannot access admin routes.
- Viewer cannot mutate CMS records.
- Admin can manage attraction/photo spot/check-in CMS records.
- Admin cannot manage users or roles by default.
- Sensitive fields are hidden in visit and survey tables.
- Direct server calls enforce permissions.
- Audit logs are restricted.
- Export permissions are denied unless explicitly granted.

## Do Not Do

Do not:

- Trust role or permission values from local storage.
- Protect actions only with hidden buttons.
- Give every admin super admin privileges.
- Export personal data by default.
- Show guest tokens, provider IDs, or LINE IDs in normal tables.
- Allow hard delete of historical tourism records by default.
- Treat dashboard/export/LINE features as implemented before verification.

## Related Documents

- `docs/backend/AUTHORIZATION_RULES.md`
- `docs/security/AUDIT_LOGGING.md`
- `docs/security/PDPA_PRIVACY_DESIGN.md`
- `docs/frontend/ADMIN_SIDE_PAGES.md`
