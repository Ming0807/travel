# ROLE_PERMISSION_MATRIX.md

## 1. Document Purpose

This document defines the role and permission matrix for the **Southern Border Tourism Data & Intelligence Platform**.

The system includes public tourist features, admin CMS, QR/check-in management, visit records, uploaded photos, digital certificates, survey data, dashboards, exports, official data import, and audit logs.

A clear role and permission model is required to protect data, prevent misuse, and support production-level administration.

---

## 2. Authorization Mission

The authorization mission is:

```text
Allow each user to access only the functions and data required for their responsibility.
```

The system must prevent:

```text
unauthorized admin access
uncontrolled export
personal data exposure
accidental content deletion
unauthorized role changes
raw survey/comment exposure
storage path exposure
dashboard misuse
```

---

## 3. Related Documents

This file must align with:

```text
docs/backend/AUTHORIZATION_RBAC.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/backend/API_DESIGN.md
docs/backend/SERVICE_LAYER.md
docs/backend/EXPORT_REPORTING_SERVICES.md
docs/security/AUDIT_LOGGING.md
```

---

## 4. Role Design Principle

Use **permissions** as the source of truth.

Roles are bundles of permissions.

Good:

```text
role -> permissions -> actions
```

Bad:

```text
hardcode role checks everywhere
```

Example:

```ts
requirePermission("attraction.update")
```

is better than:

```ts
if (user.role === "admin")
```

Reason:

- easier to add staff/researcher roles later
- easier to restrict export features
- easier to audit
- easier to test

---

## 5. MVP Roles

MVP should support these roles:

```text
super_admin
admin
viewer
```

Recommended later roles:

```text
staff
researcher
content_editor
data_exporter
auditor
```

---

## 6. Role Definitions

## 6.1 super_admin

Highest-level system administrator.

Can manage:

```text
all content
all settings
all users
all roles
all permissions
all exports
all audit logs
official data imports
system-level maintenance
```

Use carefully.

Production should avoid giving everyone this role.

---

## 6.2 admin

Operational administrator.

Can manage:

```text
attractions
photo spots
check-in codes
media
visits
surveys
dashboard
reports/exports
```

Cannot normally manage:

```text
roles
permissions
super admin users
security settings
system secrets
```

---

## 6.3 viewer

Read-only dashboard/content viewer.

Can view:

```text
dashboard summaries
attraction lists
non-sensitive visit summaries
```

Cannot:

```text
create/update/delete content
export detailed data
view raw identifiers
view audit logs
manage users
```

---

## 6.4 staff Future

Local tourism staff or attraction-level staff.

Possible scope:

```text
assigned attractions
assigned photo spots
assigned check-in codes
related visits
related dashboard summaries
```

Staff scope requires assignment tables.

MVP can skip scoped staff logic.

---

## 6.5 researcher Future

Researcher or academic evaluator.

Can view/export:

```text
aggregated analytics
anonymized datasets
survey metrics
dashboard reports
```

Cannot normally manage:

```text
public content
check-in codes
users
roles
raw identifiers
```

---

## 6.6 content_editor Future

Can manage public tourism content but not sensitive data.

Can manage:

```text
attraction text
images
360 media references
public content status if allowed
```

Cannot access:

```text
tourist identities
exports
raw survey comments
audit logs
user management
```

---

## 6.7 auditor Future

Can view:

```text
audit logs
export logs
admin action history
```

Cannot mutate normal content unless assigned another role.

---

## 7. Permission Naming Convention

Use lowercase dot notation:

```text
resource.action
```

Examples:

```text
attraction.read
attraction.create
dashboard.read
export.visit_records
user.manage
```

Avoid vague names:

```text
admin
full_access
can_do_things
```

Exception:

```text
system.all
```

may be used internally for super_admin, but explicit permissions are easier to audit.

---

## 8. Permission Groups

Recommended permission groups:

```text
dashboard
attraction
photo_spot
checkin_code
media
visit
tourist
survey
certificate
stamp
export
official_data
audit
user
role
system
```

---

# Permission Definitions

---

## 9. Dashboard Permissions

```text
dashboard.read
dashboard.sensitive_view
dashboard.system_metrics
```

## 9.1 dashboard.read

Can view normal aggregated dashboard metrics.

Allowed data:

```text
visit counts
province/attraction metrics
satisfaction summaries
expense summaries
funnel summaries
```

Not allowed:

```text
personal identifiers
raw comments
private file paths
```

## 9.2 dashboard.sensitive_view

Can view more detailed/sensitive dashboard sections.

Examples:

```text
small group breakdowns
comment summary
detailed operational metrics
```

MVP may not use this.

## 9.3 dashboard.system_metrics

Future.

Can view system health, job failures, storage stats.

---

## 10. Attraction Permissions

```text
attraction.read
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
attraction.delete
```

Recommended:

- MVP should avoid `attraction.delete`.
- Use deactivate instead of hard delete.

---

## 11. Photo Spot Permissions

```text
photo_spot.read
photo_spot.create
photo_spot.update
photo_spot.deactivate
photo_spot.delete
```

Recommended:

- Avoid hard delete if visits exist.
- Staff may manage only assigned attractions in future.

---

## 12. Check-in Code Permissions

```text
checkin_code.read
checkin_code.create
checkin_code.update
checkin_code.deactivate
checkin_code.delete
checkin_code.download_qr
```

Important:

- QR/check-in codes are public entry points.
- Only authorized admins should create or deactivate them.
- Hard delete should normally be avoided.

---

## 13. Media Permissions

```text
media.read
media.upload
media.update
media.deactivate
media.delete
```

Media includes:

```text
attraction images
360 media references
stamp assets
certificate template assets
```

Tourist photo access is separate and more sensitive.

---

## 14. Visit Permissions

```text
visit.read
visit.detail
visit.update
visit.sensitive_view
```

## 14.1 visit.read

Can view non-sensitive visit list/summary.

## 14.2 visit.detail

Can view detailed visit information, still without raw identifiers unless additional permission.

## 14.3 visit.update

Reserved for trusted admins.

MVP should avoid arbitrary visit editing.

## 14.4 visit.sensitive_view

Can view more sensitive visit-linked fields if required.

Use sparingly.

---

## 15. Tourist Permissions

```text
tourist.read
tourist.detail
tourist.sensitive_view
tourist.anonymize
tourist.delete
tourist.identity_read
```

MVP should minimize tourist management UI.

Direct identity fields should be highly restricted.

---

## 16. Survey Permissions

```text
survey.read
survey.detail
survey.comment_read
survey.export
survey.delete
```

## 16.1 survey.read

Can view aggregated survey metrics.

## 16.2 survey.detail

Can view survey detail without direct identity.

## 16.3 survey.comment_read

Can view raw comments.

Raw comments may contain personal data.

Grant carefully.

---

## 17. Certificate Permissions

```text
certificate.read
certificate.detail
certificate.revoke
certificate.regenerate
certificate.template_manage
```

MVP:

```text
certificate.read
```

may be enough.

Do not expose certificate image publicly by default.

---

## 18. Stamp Permissions

```text
stamp.read
stamp.definition_manage
stamp.revoke
stamp.award_manual
```

MVP should avoid manual award/revoke unless required.

---

## 19. Export Permissions

```text
export.summary
export.visit_records
export.tourist_summary
export.expense_data
export.survey_data
export.funnel_data
export.dashboard_summary
export.comments
export.personal_data
```

MVP simplified permission:

```text
export.create
```

may be used first.

Production should split export permissions.

---

## 20. Official Data Permissions

```text
official_data.read
official_data.import
official_data.update
official_data.delete
official_data.link_attraction
```

Official data import should be restricted.

---

## 21. Audit Permissions

```text
audit.read
audit.export
```

Audit logs are sensitive.

Normally:

```text
super_admin only
```

or auditor role future.

---

## 22. User and Role Permissions

```text
user.read
user.create
user.update
user.deactivate
user.manage_roles
role.read
role.create
role.update
role.delete
permission.read
permission.manage
```

Normally:

```text
super_admin only
```

---

## 23. System Permissions

```text
system.settings_read
system.settings_update
system.job_run
system.job_read
system.maintenance
```

Use carefully.

Cron/background jobs should not rely on normal user permissions.

---

# MVP Permission Matrix

---

## 24. MVP Matrix

| Permission | super_admin | admin | viewer |
|---|---:|---:|---:|
| dashboard.read | yes | yes | yes |
| dashboard.sensitive_view | yes | optional | no |
| attraction.read | yes | yes | yes |
| attraction.create | yes | yes | no |
| attraction.update | yes | yes | no |
| attraction.publish | yes | yes | no |
| attraction.unpublish | yes | yes | no |
| attraction.deactivate | yes | yes | no |
| attraction.delete | no/prefer no | no | no |
| photo_spot.read | yes | yes | yes |
| photo_spot.create | yes | yes | no |
| photo_spot.update | yes | yes | no |
| photo_spot.deactivate | yes | yes | no |
| checkin_code.read | yes | yes | yes |
| checkin_code.create | yes | yes | no |
| checkin_code.update | yes | yes | no |
| checkin_code.deactivate | yes | yes | no |
| checkin_code.download_qr | yes | yes | no |
| media.read | yes | yes | yes |
| media.upload | yes | yes | no |
| media.update | yes | yes | no |
| media.deactivate | yes | yes | no |
| visit.read | yes | yes | limited |
| visit.detail | yes | yes | no/limited |
| visit.update | yes | no/optional | no |
| tourist.read | yes | optional | no |
| tourist.detail | yes | no/optional | no |
| tourist.sensitive_view | yes | no | no |
| survey.read | yes | yes | limited |
| survey.detail | yes | yes | no |
| survey.comment_read | yes | optional | no |
| certificate.read | yes | yes | no/limited |
| stamp.read | yes | yes | yes/limited |
| export.summary | yes | yes | no |
| export.visit_records | yes | yes | no |
| export.expense_data | yes | yes | no |
| export.survey_data | yes | yes | no |
| export.funnel_data | yes | yes | no |
| export.comments | yes | optional | no |
| export.personal_data | yes/restricted | no | no |
| official_data.read | yes | yes | yes/limited |
| official_data.import | yes | no/optional | no |
| audit.read | yes | no | no |
| user.read | yes | no | no |
| user.create | yes | no | no |
| user.update | yes | no | no |
| user.deactivate | yes | no | no |
| role.read | yes | no | no |
| role.update | yes | no | no |
| system.settings_update | yes | no | no |
| system.job_run | yes | no | no |

---

## 25. Simplified MVP Permission Set

If the first implementation needs simpler scope, create:

```text
super_admin: all permissions
admin: content + dashboard + export
viewer: dashboard + read-only content
```

But keep the permission model extensible.

---

# Data Access Matrix

---

## 26. Data Category Access Matrix

| Data Category | Public | Tourist Owner | Viewer | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|
| Published attractions | yes | yes | yes | yes | yes |
| Draft attractions | no | no | optional | yes | yes |
| Check-in code public resolve | yes | yes | yes | yes | yes |
| Check-in code admin list | no | no | yes/read | yes | yes |
| Tourist own passport | no | yes | no | limited | yes |
| Tourist identity provider_user_id | no | own only hidden | no | no/default | restricted |
| Visit aggregate metrics | no/public future | no | yes | yes | yes |
| Visit detail | no | own only | no/limited | yes | yes |
| Uploaded tourist photo | no | own | no | restricted | yes |
| Certificate file | share/own only | own | no | restricted | yes |
| Survey aggregate | no/public future | no | yes | yes | yes |
| Raw survey comment | no | own if implemented | no | permission only | yes |
| Dashboard | no | no | yes | yes | yes |
| Export files | no | no | no | permission | yes |
| Audit logs | no | no | no | no/default | yes |

---

## 27. Action Access Matrix

| Action | Public | Tourist | Viewer | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|
| View public attraction | yes | yes | yes | yes | yes |
| Scan QR/check-in | yes | yes | yes | yes | yes |
| Submit tourist profile | yes | yes | no | no | no |
| Upload visit photo | yes/own flow | yes/own | no | no | no |
| Generate own certificate | yes/own flow | yes/own | no | no | no |
| Submit own survey | yes/own flow | yes/own | no | no | no |
| View own passport | own only | yes | no | no/default | no/default |
| Create attraction | no | no | no | yes | yes |
| Publish attraction | no | no | no | yes | yes |
| Deactivate QR code | no | no | no | yes | yes |
| View dashboard | no | no | yes | yes | yes |
| Export visit records | no | no | no | yes | yes |
| Export personal data | no | no | no | no/default | restricted |
| Manage users | no | no | no | no | yes |
| View audit logs | no | no | no | no/default | yes |

---

# Route Permission Mapping

---

## 28. Admin Routes

| Route | Required Permission |
|---|---|
| /admin | dashboard.read |
| /admin/dashboard | dashboard.read |
| /admin/attractions | attraction.read |
| /admin/attractions/new | attraction.create |
| /admin/attractions/[id]/edit | attraction.update |
| /admin/photo-spots | photo_spot.read |
| /admin/checkin-codes | checkin_code.read |
| /admin/visits | visit.read |
| /admin/surveys | survey.read |
| /admin/reports | export.summary or export.create |
| /admin/official-data | official_data.read |
| /admin/audit-logs | audit.read |
| /admin/users | user.read |
| /admin/settings | system.settings_read |

---

## 29. API Route Permission Mapping

| API Route | Required Permission / Access |
|---|---|
| GET /api/public/attractions | public |
| GET /api/public/attractions/[slug] | public |
| GET /api/checkin/[code] | public safe |
| POST /api/tourists/profile | tourist flow consent |
| POST /api/photos/upload | tourist owns visit/session |
| POST /api/certificates/generate | tourist owns visit/session |
| GET /api/passport | tourist identity owner |
| POST /api/surveys | tourist owns visit/session |
| GET /api/admin/attractions | attraction.read |
| POST /api/admin/attractions | attraction.create |
| PATCH /api/admin/attractions/[id] | attraction.update |
| POST /api/admin/attractions/[id]/publish | attraction.publish |
| POST /api/admin/checkin-codes | checkin_code.create |
| PATCH /api/admin/checkin-codes/[id] | checkin_code.update |
| GET /api/admin/visits | visit.read |
| GET /api/dashboard/* | dashboard.read |
| POST /api/exports/* | export permission |
| GET /api/admin/audit-logs | audit.read |

---

# Sensitive Field Access

---

## 30. Sensitive Fields

Sensitive fields include:

```text
tourist display name
email
provider_user_id
LINE user ID
guest token
device token
raw IP
raw user agent
uploaded photo storage path
certificate private path
raw survey comments
admin email
audit log metadata
```

---

## 31. Sensitive Field Default Visibility

| Field | Default Dashboard | Admin List | Admin Detail | Export |
|---|---:|---:|---:|---:|
| display_name | no | optional/no | permission | no/default |
| email | no | no | restricted | no/default |
| LINE user ID/provider_user_id | no | no | restricted | no/default |
| guest token | no | no | no | no |
| raw photo path | no | no | restricted | no |
| certificate private path | no | no | restricted | no |
| survey comment | no | no | permission | permission only |
| raw IP/user agent | no | no | no/default | no |
| admin email | no | yes internal | yes | audit only |

---

## 32. Export Permission Rules

## 32.1 Summary Export

Permission:

```text
export.summary
```

Includes:

```text
aggregated counts
percentages
averages
summary tables
```

Excludes:

```text
row-level personal identifiers
```

## 32.2 Visit Records Export

Permission:

```text
export.visit_records
```

Includes:

```text
visit_id
visit_date
attraction
province
origin group
age group
travel behavior
expense range
satisfaction score
```

Excludes by default:

```text
display_name
email
LINE ID
provider_user_id
photo path
certificate path
raw comment
```

## 32.3 Comments Export

Permission:

```text
export.comments
```

Requires:

```text
clear purpose
audit log
restricted role
```

## 32.4 Personal Data Export

Permission:

```text
export.personal_data
```

Normally:

```text
super_admin only
```

or disabled until legal/privacy workflow exists.

---

# Implementation Requirements

---

## 33. Recommended Tables

```text
admin_users
roles
permissions
role_permissions
admin_user_roles
```

## 33.1 admin_users

Fields:

```text
admin_user_id
auth_user_id
email
display_name
is_active
created_at
updated_at
```

## 33.2 roles

Fields:

```text
role_id
role_key
role_name
description
is_system
created_at
updated_at
```

## 33.3 permissions

Fields:

```text
permission_id
permission_key
description
created_at
updated_at
```

## 33.4 role_permissions

Fields:

```text
role_id
permission_id
created_at
```

## 33.5 admin_user_roles

Fields:

```text
admin_user_id
role_id
created_at
assigned_by
```

---

## 34. Permission Helper Functions

Recommended server helpers:

```ts
getCurrentAdminUser()
requireAdmin()
requireActiveAdmin()
getUserPermissions(userId)
hasPermission(userId, permissionKey)
requirePermission(permissionKey)
requireAnyPermission(permissionKeys)
requireAllPermissions(permissionKeys)
```

Tourist helpers:

```ts
getTouristByGuestToken()
requireTouristAccessToVisit()
requireTouristAccessToPassport()
requireTouristAccessToCertificate()
```

---

## 35. Permission Check Pattern

Recommended service pattern:

```ts
await requirePermission(actor, "attraction.update");

const result = await attractionService.updateAttraction(input, actor);
```

Never rely only on frontend button visibility.

---

## 36. Frontend Permission UX

Frontend may hide buttons when permission is missing.

Examples:

```text
hide Create Attraction button for viewer
hide Export button for viewer
hide User Management for admin
```

But backend must still enforce permission.

---

## 37. Unauthorized / Forbidden Messages

## 37.1 Not Logged In

```text
Please sign in to continue.
```

## 37.2 Permission Missing

```text
You do not have permission to perform this action.
```

## 37.3 Inactive Admin

```text
Your admin account is inactive. Please contact the system administrator.
```

Do not reveal sensitive resource details.

---

## 38. Audit Requirements

Audit these actions:

```text
role assigned
role removed
permission changed
user deactivated
export generated
personal data export attempted
raw comments exported
attraction published/deactivated
check-in code deactivated
official data imported
permission denied on sensitive action
```

---

## 39. Testing Checklist

Test:

```text
anonymous cannot access admin route
viewer can view dashboard
viewer cannot create attraction
viewer cannot export
admin can create attraction
admin can export allowed datasets
admin cannot manage users
super_admin can manage users
inactive admin blocked
tourist cannot access admin
tourist cannot access another tourist visit
export.personal_data restricted
survey.comment_read restricted
API direct call respects permission
frontend hidden button is not only control
```

---

## 40. MVP Acceptance Checklist

```text
[ ] super_admin role exists.
[ ] admin role exists.
[ ] viewer role exists.
[ ] Permission keys are defined.
[ ] Admin routes require authentication.
[ ] Admin APIs check permission server-side.
[ ] Export actions check permission server-side.
[ ] Viewer is read-only.
[ ] Sensitive fields are hidden by default.
[ ] Raw comments require special permission or are hidden.
[ ] User/role management is super_admin only.
[ ] Permission helpers exist or are planned.
[ ] Audit logs for export and role changes exist or are planned.
```

---

## 41. Do Not Do

Do not:

```text
Trust role from localStorage.
Use only frontend guards.
Give every admin super_admin.
Export personal data by default.
Show LINE user IDs in admin tables.
Show raw comments to all admins.
Allow viewer to export detailed data.
Allow hard delete of historical data by default.
Skip permission checks in API routes.
Use one shared admin account.
```

---

## 42. Future Enhancements

Possible future improvements:

```text
scoped staff roles by attraction
researcher anonymized export role
export approval workflow
temporary elevated access
audit review dashboard
user invitation workflow
role editor UI
permission diff audit
two-factor authentication for super_admin
```

---

## 43. Final Role Permission Rule

Roles make the admin UI convenient.

Permissions make the system safe.

Every sensitive action must be protected by server-side permission checks.
