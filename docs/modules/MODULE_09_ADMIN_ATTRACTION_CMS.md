# Module 09: Admin Attraction CMS

## Module Purpose

The Admin Attraction CMS lets authorized administrators maintain the source data that powers public attraction pages, QR check-in, certificate generation, stamp earning, visit records, and future dashboard analytics.

This module is operational infrastructure. It is not the dashboard engine, export engine, certificate renderer, or LINE LIFF integration.

## Phase 08 Implementation Alignment

Phase 08 aligns the admin CMS with the Next.js fullstack MVP architecture:

- Admin pages in the Next.js App Router.
- Server-side authentication and permission guards.
- Server-side validation for CMS mutations.
- Supabase PostgreSQL tables for attractions, photo spots, check-in codes, admin users, roles, permissions, and audit logs.
- Audit logging for important admin changes.
- Read-only access patterns for visits and surveys.

Full dashboard analytics remain Phase 09. Privacy-safe report/export workflows remain Phase 10 unless separately implemented and verified. LINE LIFF remains optional and outside this module.

## Core Data Dimensions Supported

| Dimension | How This Module Supports It |
|---|---|
| Tourist | Protects privacy by limiting admin exposure of tourist identifiers |
| Travel Behavior | Provides read-only access to collected visit/survey context |
| Attractions Visited | Maintains attraction, photo spot, and check-in source data |
| Expenses | Provides read-only survey/expense visibility where collected |
| Satisfaction | Provides read-only satisfaction visibility where collected |

## Primary Users

| User | Responsibility |
|---|---|
| Super admin | Manages high-trust settings, users, roles, and audit access where implemented |
| Admin | Maintains attractions, photo spots, check-in codes, and operational records |
| Viewer | Reads permitted summaries and records without mutation |
| Future staff role | May manage assigned province or attraction scope after scoped permissions exist |

## In Scope for Phase 08

- Protected admin shell.
- Attraction CMS documentation and route structure.
- Attraction create/edit/publish/unpublish/deactivate workflow alignment.
- Photo spot management under attraction context.
- Check-in code management for `/c/[checkinCode]`.
- Read-only visit records table.
- Read-only survey records table.
- Pagination, search, filters, and status labels for admin lists.
- Server-side auth and permission guard requirements.
- Audit logging requirements for important admin actions.
- Privacy-safe field visibility rules.

## Out of Scope for Phase 08

- Full dashboard metric calculation.
- Full report/export job workflow.
- LINE LIFF identity linking.
- Official data import automation.
- Certificate template designer.
- Stamp designer.
- Advanced media library.
- Public analytics portal.
- User invitation workflow unless separately implemented.

## Required Tables

Phase 08 primarily manages or depends on:

- `attractions`
- `attraction_types`
- `attraction_media`
- `photo_spots`
- `checkin_codes`
- `provinces`
- `districts`
- `admin_users`
- `roles`
- `permissions`
- `role_permissions`
- `admin_user_roles`
- `audit_logs`

It may read, without broad mutation:

- `visits`
- `visit_photos`
- `certificates`
- `tourist_stamps`
- `satisfaction_surveys`
- `visit_expenses`

## Admin Routes

| Route | Purpose |
|---|---|
| `/admin` | Admin entry and operational overview |
| `/admin/attractions` | Attraction list |
| `/admin/attractions/new` | Create attraction |
| `/admin/attractions/[attractionId]/edit` | Edit attraction |
| `/admin/photo-spots` | Photo spot list and management |
| `/admin/checkin-codes` | Check-in code list and management |
| `/admin/visits` | Read-only visit records |
| `/admin/surveys` | Read-only survey records |
| `/admin/dashboard` | Dashboard entry; full analytics in Phase 09 |

Routes may be nested differently in implementation, but they must preserve these responsibilities.

## Attraction Management

Attraction list pages should support:

- Search by Thai or English name.
- Province and district filters.
- Attraction type filter.
- Published and active status filters.
- Pagination.
- Updated timestamp.
- Safe actions based on permission.

Attraction forms should support:

- Province.
- District.
- Attraction type.
- Slug.
- Thai and English names.
- Short description.
- Full description.
- History.
- Coordinates where available.
- Address text.
- Opening hours.
- Published status.
- Active status.

Publishing should require enough public content for a useful tourist page. The MVP may warn rather than block incomplete content, but production should use stricter checks.

## Photo Spot Management

Photo spots must belong to an attraction.

Photo spot management should support:

- Attraction linkage.
- Thai and English names.
- Optional description.
- Optional sample image path.
- Optional coordinates.
- Display order.
- Active status.

Inactive photo spots should not be offered in public QR/certificate flows. Historical records should remain intact.

## Check-in Code Management

Check-in codes generate public QR entry URLs.

Rules:

- Each code must be unique.
- Each code must be URL-safe.
- Each code must link to an attraction.
- Optional photo spot must belong to the same attraction.
- Inactive or expired codes should not start the normal tourist flow.
- Printed QR codes should be deactivated, not deleted, when retired.

The public URL pattern remains:

```text
/c/[checkinCode]
```

## Visit and Survey Records

Phase 08 admin visits and surveys are read-only by default.

Visit tables should prioritize:

- Visit date.
- Province.
- Attraction.
- Photo spot.
- Completion status.
- Certificate status.
- Survey status.
- Created timestamp.

Survey tables should prioritize:

- Visit reference.
- Attraction and province.
- Satisfaction score.
- Spending range/category where available.
- Completion timestamp.

Sensitive fields such as guest tokens, provider identifiers, private storage paths, and raw comments must be hidden by default.

## Audit Logging

Audit important admin actions:

- `attraction.create`
- `attraction.update`
- `attraction.publish`
- `attraction.unpublish`
- `attraction.deactivate`
- `photo_spot.create`
- `photo_spot.update`
- `photo_spot.deactivate`
- `checkin_code.create`
- `checkin_code.update`
- `checkin_code.deactivate`
- `permission.denied` for sensitive actions

Audit records must store sanitized summaries only. Do not log secrets, guest tokens, provider IDs, signed URLs, raw photos, or full request bodies.

## Authorization

Phase 08 uses server-side permissions.

Minimum permission expectations:

- `attraction.read` for attraction CMS reads.
- `attraction.manage` for attraction mutations.
- `checkin_code.manage` for check-in code mutations.
- Equivalent compact or future granular permissions for photo spots.
- `dashboard.read` for dashboard entry pages.
- Restricted permission for audit log reads.

Backend checks are mandatory even when the frontend hides buttons.

## Privacy Requirements

Admin CMS must follow privacy by design:

- Do not expose unnecessary tourist identifiers.
- Do not show guest tokens, provider IDs, LINE IDs, or raw storage paths by default.
- Treat raw survey comments as sensitive.
- Prefer aggregated or operational summaries.
- Use deactivation over deletion for records linked to historical visits.

## Performance Requirements

Admin lists must use:

- Pagination.
- Search.
- Filters.
- Stable sort.
- Database indexes on common filters.

Do not load all visits, surveys, attractions, or check-in codes into the browser.

## Acceptance Criteria

- Admin routes require server-side authentication.
- Admin mutations require server-side permission checks.
- Attraction CMS supports list, create, edit, publish/unpublish, and deactivate workflows.
- Photo spot management is linked to attraction records.
- Check-in code management supports `/c/[checkinCode]` source data.
- Visits and surveys are read-only by default.
- Sensitive fields are hidden by default.
- Lists are paginated and filterable.
- Important admin actions are audit logged or clearly marked as required before production release.
- Documentation does not claim Phase 09 dashboard, Phase 10 export, or LINE LIFF features are complete.

## Future Enhancements

- Granular scoped roles by province or attraction.
- Certificate template editor.
- Stamp definition editor.
- Advanced media library.
- QR sheet/PDF generation.
- Audit log viewer.
- Approval workflow for public content.
- Official attraction data linking.

## Related Documents

- `docs/frontend/ADMIN_SIDE_PAGES.md`
- `docs/backend/AUTHORIZATION_RULES.md`
- `docs/security/ROLE_PERMISSION_MATRIX.md`
- `docs/security/AUDIT_LOGGING.md`
- `tasks/PHASE_08_ADMIN_BACKOFFICE.md`
