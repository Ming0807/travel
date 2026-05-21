# Authorization Rules

## Purpose

This document defines backend authorization rules for admin and tourist-facing operations.

Authorization protects the five core data dimensions of the platform:

- Tourist.
- Travel behavior.
- Attractions visited.
- Expenses.
- Satisfaction.

The Phase 08 priority is the admin backoffice: attraction CMS, photo spot CMS, check-in code CMS, read-only visits, read-only surveys, audit logging, and privacy-safe table access.

## Architecture Boundary

The project uses a Next.js fullstack MVP architecture:

- Admin UI runs in Next.js App Router pages.
- Mutations run through server-side actions or route handlers.
- Server-side guards validate authentication, active admin status, and permissions.
- Services apply business rules.
- Repositories access Supabase PostgreSQL.
- Supabase RLS and storage policies remain part of the defense-in-depth model.

Authorization must be enforced on the server before any admin data mutation or sensitive read.

## Actor Types

| Actor | Description | Phase 08 Access |
|---|---|---|
| Public visitor | Anonymous browser viewing public pages | Published active attraction data only |
| Tourist/guest | Tourist participating through QR/certificate flow | Own visit/certificate/passport flow only |
| Viewer | Read-only admin role | Dashboard/read-only records only where permitted |
| Admin | Operational administrator | CMS management and read-only operational data |
| Super admin | Restricted system administrator | User, role, audit, and sensitive controls |
| System | Trusted scheduled or internal process | Explicitly scoped server-side operations |

## Core Authorization Rules

1. Public users may only read published and active public content.
2. Admin routes require authenticated admin identity.
3. Admin accounts must be active.
4. Permissions must be loaded server-side.
5. Mutations must check permissions server-side.
6. Read-only admin pages must still check read permissions.
7. Tourist ownership must be verified for tourist-owned visits, certificates, and passports.
8. Sensitive identifiers must be hidden unless a specific permission allows access.
9. Export and audit access must be more restrictive than normal admin reads.
10. UI hiding is helpful but never sufficient.

## Phase 08 Permission Set

The current implementation direction may use a compact permission set first:

| Permission | Purpose |
|---|---|
| `dashboard.read` | View privacy-safe dashboard entry pages or summaries |
| `attraction.read` | View attraction CMS records |
| `attraction.manage` | Create and update attraction records |
| `checkin_code.manage` | Manage QR/check-in codes |
| `export.summary` | Future privacy-safe summary exports |
| `export.detailed` | Future restricted detailed exports |
| `user.manage` | Manage admin users and roles |

More granular permissions such as `photo_spot.create`, `survey.comment_read`, and `audit.read` are recommended as the system matures.

## Admin CMS Rules

Attraction management requires:

- `attraction.read` for list/detail views.
- `attraction.manage` for create, update, publish, unpublish, or deactivate actions.
- Server-side validation of required fields and controlled values.
- Audit logging for important create/update/status changes.

Photo spot management should follow the attraction permission boundary unless a separate `photo_spot.manage` permission is introduced.

Check-in code management requires:

- `checkin_code.manage` for create, update, deactivate, reactivate, and QR generation actions.
- Validation that a photo spot belongs to the same attraction as the check-in code.
- Audit logging for creation and availability changes.

## Read-only Operational Records

Phase 08 may expose visits and surveys as read-only admin tables.

Rules:

- Visit records require an admin read permission such as `visit.read` or an approved compact equivalent.
- Survey records require `survey.read` or an approved compact equivalent.
- Raw survey comments are hidden by default.
- Tourist email, LINE identifiers, provider identifiers, guest tokens, and private storage paths are hidden by default.
- Editing visits and surveys is not part of the normal Phase 08 scope.

## Dashboard and Export Rules

Dashboard access requires `dashboard.read`, but Phase 09 owns full analytics implementation.

Export features should not be treated as complete in Phase 08. When implemented, exports must:

- Require explicit export permission.
- Use privacy-safe columns by default.
- Exclude provider identifiers and guest tokens.
- Audit every export attempt.
- Clearly distinguish estimated spending from revenue.

## Audit Authorization

Audit logs are sensitive.

Access should require a dedicated permission such as `audit.read`, normally limited to super admins or a future auditor role.

Creating audit logs is a server-side responsibility and should not be exposed as a public client operation.

## Unauthorized Responses

Use safe, consistent messages:

| Case | Message |
|---|---|
| Not signed in | Please sign in to continue. |
| Inactive admin | Your admin account is inactive. Please contact the system administrator. |
| Missing permission | You do not have permission to perform this action. |
| Resource not found or not allowed | The requested record is unavailable. |

Do not reveal whether a sensitive record exists when the actor is not authorized.

## Testing Requirements

Authorization tests should cover:

- Anonymous users cannot access admin pages.
- Inactive admins are blocked.
- Viewer cannot mutate attraction, photo spot, or check-in data.
- Admin can manage CMS records within assigned permissions.
- Admin cannot manage users unless explicitly permitted.
- Direct server calls enforce permissions.
- Sensitive fields are excluded from read-only visit and survey tables.
- Export and audit routes are denied without explicit permission.

## Related Documents

- `docs/security/ROLE_PERMISSION_MATRIX.md`
- `docs/security/AUDIT_LOGGING.md`
- `docs/security/PDPA_PRIVACY_DESIGN.md`
- `docs/modules/MODULE_09_ADMIN_ATTRACTION_CMS.md`
