# Phase 08: Admin Backoffice

## Goal

Build and align the production-oriented admin backoffice for maintaining the tourism data source records used by public pages, QR check-in, certificate/stamp incentives, read-only operational review, and later dashboard analytics.

The Phase 08 admin backoffice is a Next.js fullstack implementation area. Admin pages must be backed by server-side authentication, server-side permission checks, validated mutations, and privacy-safe data access.

## Phase Position

Phase 08 follows:

- Phase 04 public attraction pages.
- Phase 05 QR check-in flow.
- Phase 06 certificate generation.
- Phase 07 survey, expense, and satisfaction collection.

Phase 08 prepares data administration for:

- Phase 09 dashboard analytics.
- Phase 10 privacy-safe export/reporting.
- Phase 11 optional LINE LIFF integration.

## In Scope

### Admin Foundation

- Protected admin route structure.
- Admin navigation and page shell.
- Server-side admin authentication guard.
- Server-side permission checks.
- Safe forbidden and inactive-account states.

### Attraction CMS

- Attraction list with search, filters, pagination, status labels, and safe actions.
- Attraction create/edit workflow.
- Publish/unpublish workflow.
- Deactivate workflow instead of hard delete.
- Validation for required fields, slug uniqueness, controlled values, and coordinates.

### Photo Spot CMS

- Photo spot list by attraction.
- Photo spot create/edit workflow.
- Active/inactive status.
- Validation that photo spots belong to valid attractions.
- Deactivation instead of hard delete where historical data exists.

### Check-in Code CMS

- Check-in code list.
- Create/edit/deactivate workflow.
- Unique URL-safe code validation.
- Attraction and optional photo spot linkage.
- Copyable public URL using `/c/[checkinCode]`.
- Optional QR preview/download if implemented.

### Read-only Operational Records

- Read-only visits table.
- Read-only surveys table.
- Date, province, attraction, and status filters.
- Pagination.
- Sensitive fields hidden by default.

### Audit and Security

- Audit logging requirements for key admin changes.
- Permission-denied logging for sensitive actions where appropriate.
- Privacy-safe table fields.
- No service-role key exposure in frontend code.
- No raw guest tokens, provider IDs, LINE IDs, or signed URLs in normal admin tables.

## Out of Scope

Phase 08 does not complete:

- Full dashboard metric implementation.
- Report/export job workflows.
- LINE LIFF linking.
- Official data import automation.
- Certificate template designer.
- Stamp designer.
- Advanced media library.
- Public analytics portal.

## Required Documentation Updates

Update and align:

- `docs/frontend/ADMIN_SIDE_PAGES.md`
- `docs/backend/AUTHORIZATION_RULES.md`
- `docs/security/AUDIT_LOGGING.md`
- `docs/security/ROLE_PERMISSION_MATRIX.md`
- `docs/modules/MODULE_09_ADMIN_ATTRACTION_CMS.md`
- `CHANGELOG.md`

## Acceptance Criteria

- Admin route documentation clearly separates admin pages from tourist/public pages.
- Authorization documentation requires server-side auth and permission guards.
- Role/permission documentation matches the compact Phase 08 permission direction while allowing future granular permissions.
- Audit logging documentation covers attraction, photo spot, check-in code, and sensitive denied actions.
- Admin CMS documentation identifies attraction/photo spot/check-in management as the Phase 08 core.
- Visit and survey admin views are documented as read-only and privacy-safe by default.
- Documentation does not claim full analytics, export, LINE, official data import, or advanced media workflows are complete.
- Changelog records Phase 08 documentation and security alignment truthfully.

## Security and Privacy Notes

- Admin access must never rely on frontend-only checks.
- Viewer/read-only roles must not mutate CMS data.
- Export and audit access must be more restrictive than normal admin reads.
- Raw survey comments and direct identifiers require explicit permission if exposed.
- Hard delete should be avoided for records linked to historical visits.

## Phase 09 Handoff

Phase 09 should build dashboard analytics on top of the admin-maintained source data.

Before Phase 09 implementation, confirm:

- Attraction records have reliable province/district/type relationships.
- Photo spots and check-in codes are linked correctly.
- Visit and survey records can be filtered by date, province, and attraction.
- Dashboard definitions still distinguish QR scans from visits.
- Estimated spending is documented as self-reported estimated spending, not revenue.
