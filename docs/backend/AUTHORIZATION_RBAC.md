# AUTHORIZATION_RBAC.md

## 1. Document Purpose

This document defines the authorization and role-based access control strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The system handles public tourism content, tourist data, uploaded photos, certificates, survey responses, dashboard analytics, exports, and admin operations.

Authorization must be designed carefully to protect privacy and data integrity.

---

## 2. Authorization Mission

The authorization mission is:

```text
Allow the right users to do the right actions, while preventing unauthorized access to private data and administrative functions.
```

The system must protect:

- admin content management
- tourist profiles
- visit records
- uploaded photos
- certificate files
- survey responses
- dashboard metrics
- exports
- official data imports
- audit logs
- system settings

---

## 3. Authentication vs Authorization

## 3.1 Authentication

Authentication answers:

```text
Who are you?
```

Examples:

```text
admin login through Supabase Auth
tourist guest token
LINE identity optional
email identity future
```

## 3.2 Authorization

Authorization answers:

```text
What are you allowed to do?
```

Examples:

```text
Can this admin create attractions?
Can this user export data?
Can this tourist view this passport?
Can this staff member view all provinces?
```

---

## 4. User Categories

The platform has two major user categories:

```text
public/tourist users
admin/backoffice users
```

They must not be mixed.

---

## 5. Tourist Identity Model

Tourists do not need normal login.

Supported tourist identities:

```text
anonymous_device
line optional
email optional future
google optional future
```

Tourist identity is stored in:

```text
tourist_identities
```

Rules:

- tourist identity is not admin authentication.
- guest token does not grant admin access.
- LINE identity does not grant admin access.
- email identity does not grant admin access.
- tourist can only access own passport/visit flow data.

---

## 6. Admin Identity Model

Admin users authenticate through:

```text
Supabase Auth
```

or equivalent backend auth.

Admin users should have:

```text
user_id
email
display_name
role_id
is_active
created_at
updated_at
```

Admin users must be linked to roles and permissions.

---

## 7. Recommended Admin Roles

## 7.1 super_admin

Full access.

Can manage:

```text
users
roles
permissions
all attractions
all dashboard data
all exports
official data imports
audit logs
system settings
```

Use carefully.

## 7.2 admin

Operational administrator.

Can manage:

```text
attractions
photo spots
check-in codes
media
dashboard
visits
surveys
reports
exports without restricted personal fields
```

May not manage:

```text
roles
super admin users
critical system secrets
```

## 7.3 staff

Local tourism staff.

Can manage or view assigned data.

Possible access:

```text
assigned attractions
assigned photo spots
related check-in codes
related visits
related survey summaries
```

MVP may skip assigned-scope logic and use admin only.

## 7.4 researcher

Research and analysis role.

Can access:

```text
dashboard
aggregated analytics
privacy-safe exports
survey/visit datasets without direct identifiers
```

Should not manage:

```text
attractions
QR codes
users
roles
system settings
```

## 7.5 viewer

Read-only role.

Can access:

```text
dashboard summaries
non-sensitive reports
```

Cannot export detailed data unless explicitly permitted.

---

## 8. Permission-Based Design

Use permissions rather than hardcoding role names everywhere.

Roles should map to permissions.

Example:

```text
role: admin
permissions:
  attraction.read
  attraction.create
  attraction.update
  attraction.deactivate
  checkin_code.read
  checkin_code.create
  dashboard.read
  export.create
```

This allows future flexibility.

---

## 9. Recommended Permissions

## 9.1 Attraction Permissions

```text
attraction.read
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
attraction.delete
```

Note:

```text
attraction.delete
```

should usually not be granted because historical data should be preserved.

## 9.2 Photo Spot Permissions

```text
photo_spot.read
photo_spot.create
photo_spot.update
photo_spot.deactivate
photo_spot.delete
```

## 9.3 Check-in Code Permissions

```text
checkin_code.read
checkin_code.create
checkin_code.update
checkin_code.deactivate
checkin_code.delete
```

## 9.4 Media Permissions

```text
media.read
media.upload
media.update
media.deactivate
media.delete
```

## 9.5 Visit Permissions

```text
visit.read
visit.detail
visit.update
```

MVP should avoid allowing arbitrary visit edits unless necessary.

## 9.6 Tourist Permissions

```text
tourist.read
tourist.detail
tourist.anonymize
tourist.export_sensitive
```

Sensitive.

## 9.7 Survey Permissions

```text
survey.read
survey.detail
survey.comment_read
survey.export
```

Comments may contain personal data and should be permission-controlled.

## 9.8 Dashboard Permissions

```text
dashboard.read
dashboard.sensitive_view
```

## 9.9 Export Permissions

```text
export.summary
export.visit_records
export.survey_data
export.expense_data
export.funnel_data
export.personal_data
export.comments
```

MVP can simplify to:

```text
export.create
```

but detailed permissions should be planned.

## 9.10 Official Data Permissions

```text
official_data.read
official_data.import
official_data.update
official_data.link_attraction
official_data.delete
```

## 9.11 Audit Permissions

```text
audit.read
```

## 9.12 User and Role Permissions

```text
user.read
user.create
user.update
user.deactivate
role.read
role.create
role.update
permission.read
```

Only super_admin should manage roles/permissions.

---

## 10. MVP Role Recommendation

For MVP, use simplified roles:

```text
super_admin
admin
viewer
```

MVP permissions:

## super_admin

```text
all
```

## admin

```text
attraction.read
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
photo_spot.read
photo_spot.create
photo_spot.update
photo_spot.deactivate
checkin_code.read
checkin_code.create
checkin_code.update
checkin_code.deactivate
visit.read
survey.read
dashboard.read
export.create
```

## viewer

```text
dashboard.read
attraction.read
visit.read summary only
```

Later add:

```text
staff
researcher
```

---

## 11. Suggested Tables

Recommended tables:

```text
users
roles
permissions
role_permissions
user_roles
```

If using Supabase Auth, application user profile table can be:

```text
admin_users
```

Possible structure:

```text
admin_users
  admin_user_id
  auth_user_id
  display_name
  email
  is_active
  created_at
  updated_at

roles
  role_id
  role_key
  role_name
  description

permissions
  permission_id
  permission_key
  description

role_permissions
  role_id
  permission_id

admin_user_roles
  admin_user_id
  role_id
```

MVP can use one role column first, but permission tables are better for production.

---

## 12. Authorization Helper Functions

Recommended backend helpers:

```ts
getCurrentAdminUser()
requireAdmin()
requireActiveAdmin()
requireRole(roleKey)
requirePermission(permissionKey)
hasPermission(user, permissionKey)
requireTouristAccessToVisit(touristIdentity, visitId)
requireTouristAccessToPassport(touristIdentity, touristId)
```

Never trust frontend-only role state.

---

## 13. Route Protection Rules

## 13.1 Public Routes

Public:

```text
/
 /attractions
 /attractions/[slug]
 /c/[checkinCode]
```

No admin login required.

Return only public safe data.

## 13.2 Tourist Flow Routes

Tourist routes:

```text
/visit/*
/passport
/survey/*
```

Use:

```text
guest token
LINE identity
email identity future
session validation
```

Tourist can only access own data.

## 13.3 Admin Routes

Admin routes:

```text
/admin/*
```

Require:

```text
active admin authentication
role/permission checks
```

## 13.4 API Routes

Public APIs:

```text
GET /api/checkin/[code]
GET /api/public/attractions
```

Protected APIs:

```text
/api/admin/*
/api/dashboard/*
/api/exports/*
```

Tourist-protected APIs:

```text
/api/photos/upload
/api/certificates/generate
/api/passport
/api/surveys
```

---

## 14. Page-Level Authorization

Frontend can hide routes/actions for UX.

But backend must enforce permissions.

Example:

```text
Hide Export button for viewer.
Still check export.create permission on server.
```

Never rely only on hiding UI.

---

## 15. Action-Level Authorization

Every write action must check authorization.

Examples:

```text
create attraction -> attraction.create
publish attraction -> attraction.publish
deactivate QR -> checkin_code.deactivate
generate export -> export.create
import official data -> official_data.import
view audit logs -> audit.read
```

---

## 16. Field-Level Authorization

Some fields are more sensitive than others.

Examples:

```text
email
LINE user ID
device token
raw provider_user_id
photo path
private certificate URL
raw comments
```

Default admin tables should not show these.

Only specific permissions can view/export them.

---

## 17. Export Authorization

Export is high-risk.

## 17.1 Export Levels

### Summary Export

Permission:

```text
export.summary
```

Safe aggregated data.

### Visit Records Export

Permission:

```text
export.visit_records
```

Visit-level, no direct identifiers.

### Survey Export

Permission:

```text
export.survey_data
```

Comments may require:

```text
export.comments
```

### Personal Data Export

Permission:

```text
export.personal_data
```

Highly restricted.

MVP should avoid personal data export.

## 17.2 Export Audit

Every export must log:

```text
actor_user_id
export_type
filters
row_count
privacy_level
created_at
```

---

## 18. Dashboard Authorization

Dashboard should normally show aggregated data.

Permission:

```text
dashboard.read
```

Sensitive dashboard sections may require:

```text
dashboard.sensitive_view
```

Dashboard must not show direct identity fields by default.

---

## 19. Admin Content Authorization

Admin CMS actions:

```text
attraction.create
attraction.update
attraction.publish
attraction.deactivate
photo_spot.create
checkin_code.create
```

For staff assigned-scope future:

```text
staff can manage only assigned attraction_id list
```

MVP can skip assigned scope.

---

## 20. Tourist Access Rules

## 20.1 Guest Tourist

Guest token maps to:

```text
tourist_identities.provider = anonymous_device
```

Guest can access:

```text
own current flow
own passport on same device
own certificate link if stored in flow
```

Guest cannot access:

```text
other tourists
admin pages
exports
dashboard
```

## 20.2 LINE Tourist

LINE identity maps to:

```text
tourist_identities.provider = line
```

Can access:

```text
own passport
own certificates
own future profile
```

Cannot access admin pages.

## 20.3 Email Tourist

Future email identity maps to:

```text
tourist_identities.provider = email
```

Same access as own tourist only.

---

## 21. Object Ownership Checks

For tourist operations, backend must check ownership.

Examples:

```text
visit_id belongs to tourist_id
photo_id belongs to visit_id
certificate_id belongs to visit_id
survey visit_id belongs to tourist
passport tourist_id belongs to identity
```

Do not rely on client-provided tourist_id.

---

## 22. Supabase Row Level Security Strategy

If using Supabase direct client from browser, use RLS carefully.

## 22.1 Public Tables

Public read may be allowed for:

```text
published active attractions
public attraction images
public province/district data
```

## 22.2 Admin Tables

Admin writes should not be open to anon users.

Use:

```text
RLS policies
server-side service role only
admin auth checks
```

## 22.3 Tourist Tables

Tourist data access is complex.

Recommended:

```text
perform tourist mutations through server actions/API routes
do not expose broad direct table access
```

## 22.4 Storage RLS

Storage buckets:

```text
visit-photos
certificate-files
attraction-media
```

Rules:

- public attraction media can be public.
- tourist uploaded photos should not be broadly public by default.
- certificate files should use intentional public/signed URL strategy.
- admin uploads require permission.

---

## 23. Permission Matrix

## 23.1 MVP Permission Matrix

| Permission | super_admin | admin | viewer |
|---|---:|---:|---:|
| dashboard.read | yes | yes | yes |
| attraction.read | yes | yes | yes |
| attraction.create | yes | yes | no |
| attraction.update | yes | yes | no |
| attraction.publish | yes | yes | no |
| attraction.deactivate | yes | yes | no |
| photo_spot.read | yes | yes | yes |
| photo_spot.create | yes | yes | no |
| photo_spot.update | yes | yes | no |
| checkin_code.read | yes | yes | yes |
| checkin_code.create | yes | yes | no |
| checkin_code.update | yes | yes | no |
| visit.read | yes | yes | limited |
| survey.read | yes | yes | no/limited |
| export.create | yes | yes | no |
| user.manage | yes | no | no |
| audit.read | yes | no | no |

---

## 24. Unauthorized and Forbidden UX

## 24.1 Not Logged In

Message:

```text
Please sign in to continue.
```

Redirect:

```text
/admin/login
```

## 24.2 Logged In But No Permission

Message:

```text
You do not have permission to perform this action.
```

Do not reveal sensitive resource details.

## 24.3 Inactive Admin User

Message:

```text
Your admin account is inactive. Please contact the system administrator.
```

---

## 25. Backend Authorization Error Codes

Use:

```text
UNAUTHORIZED
FORBIDDEN
ACCOUNT_INACTIVE
PERMISSION_REQUIRED
RESOURCE_NOT_FOUND
OWNERSHIP_REQUIRED
```

Sometimes return `NOT_FOUND` instead of `FORBIDDEN` to avoid leaking existence of private resources.

---

## 26. Audit Logging for Authorization

Log important authorization-related events:

```text
admin login failure if available
permission denied
export attempted
role changed
user deactivated
sensitive data viewed if implemented
official data imported
```

Do not log secrets.

---

## 27. Security Anti-Patterns

Do not:

```text
Trust role from localStorage.
Trust tourist_id from localStorage.
Expose service role key to frontend.
Make admin route protection frontend-only.
Allow export without server permission check.
Allow direct public read of tourist identity table.
Store LINE user ID in normal dashboard response.
Use one shared admin account for everyone.
Give all users super_admin.
```

---

## 28. Data Privacy Anti-Patterns

Do not show by default:

```text
email
LINE user ID
device token
provider_user_id
raw uploaded photo path
private certificate URL
raw comments to all viewers
```

Do not export by default:

```text
direct identifiers
contact data
private storage paths
```

---

## 29. Role Seeding

Initial seed should create:

```text
super_admin role
admin role
viewer role
basic permissions
one initial super admin user if safe
```

Do not commit real passwords.

Use secure setup process for initial admin.

---

## 30. User Management Future

Future admin UI should support:

```text
invite admin user
assign role
deactivate user
view user activity
reset role
```

MVP may manage users manually in Supabase.

---

## 31. Testing Authorization

Test:

```text
anonymous cannot access /admin
viewer cannot create attraction
admin can create attraction
admin cannot manage users
super_admin can manage roles
tourist cannot access another tourist passport
guest cannot access admin APIs
export requires permission
direct API call without UI still blocked
inactive admin blocked
```

---

## 32. MVP Authorization Acceptance Checklist

```text
[ ] Admin routes require login.
[ ] Admin APIs require login.
[ ] Admin writes require permission.
[ ] Export requires permission.
[ ] Viewer cannot mutate data.
[ ] Tourist guest can access own flow.
[ ] Tourist cannot access other tourist data.
[ ] Service role key is server-only.
[ ] Frontend role hiding is not the only protection.
[ ] Sensitive fields are hidden by default.
[ ] Export audit logging exists or is planned.
[ ] Permission helpers exist.
```

---

## 33. Do Not Do

Do not:

```text
Use only frontend guards.
Put admin role in localStorage and trust it.
Let guest token access admin data.
Expose tourist_identities publicly.
Export personal data by default.
Give every admin super_admin.
Hardcode one admin email throughout code.
Skip permission checks because UI hides button.
```

---

## 34. Final Authorization Rule

Authorization must be enforced where the data is accessed or changed.

UI restrictions improve experience, but backend permission checks protect the system.
