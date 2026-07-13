# Admin Side Pages

## Purpose

This document defines the Phase 08 admin backoffice page structure for the Southern Border Tourism Data & Intelligence Platform.

The admin area exists to maintain reliable source data for public attraction pages, QR check-in flows, certificates, stamps, visit records, optional survey records, and later dashboard analytics. It must feel like an operational system, not a marketing site.

## Phase 08 Status

Phase 08 aligns the admin backoffice around a Next.js fullstack architecture:

- Next.js App Router admin pages.
- Server-side authentication and permission guards before protected data access.
- Service/repository boundaries for admin workflows.
- Supabase PostgreSQL as the system of record.
- Audit logging for important administrative changes.

Phase 08 does not claim that full dashboard analytics, report export jobs, LINE LIFF linking, or official data import automation are complete. These remain later phases unless separately implemented and verified.

## Admin Route Groups

| Route | Purpose | Phase 08 Scope |
|---|---|---|
| `/admin` | Admin overview and navigation entry | Protected shell and operational status |
| `/admin/content` | Admin content command center | Workflow guidance for homepage content, attraction content, media, stories, routes, photo spots, and QR dependencies |
| `/admin/dashboard` | Privacy-safe dashboard entry | Placeholder/summary route; full analytics is Phase 09 |
| `/admin/attractions` | Attraction CMS list | Search, filters, pagination, status, safe actions |
| `/admin/attractions/new` | Create attraction | Server-validated create form |
| `/admin/attractions/[attractionId]/edit` | Edit attraction | Server-validated edit form |
| `/admin/photo-spots` | Photo spot management | Manage photo spots linked to attractions |
| `/admin/checkin-codes` | QR/check-in code management | Manage public QR entry codes |
| `/admin/visits` | Visit records | Read-only operational table |
| `/admin/surveys` | Survey records | Read-only operational table with privacy controls |
| `/admin/tourists` | Tourist profile summaries | Server-side search, filters, sort, and pagination |
| `/admin/tourists/[touristId]` | Restricted tourist detail | Visit, certificate, stamp, and survey history without private identity values or storage paths |
| `/admin/audit-logs` | Audit history | Restricted; may be planned if UI is not implemented |
| `/admin/settings` | Admin settings | Restricted; user/role management may be deferred |

## Page Standards

Admin pages should use a quiet, dense, work-focused layout:

- Sidebar or persistent admin navigation.
- Page title and short operational description.
- Search, filters, sort, and pagination on list pages.
- Status labels for active, inactive, published, draft, completed, and unavailable records.
- Clear empty, loading, error, and forbidden states.
- Confirmation for destructive or availability-changing actions.
- No hard deletion for historical records by default.

Admin pages must not use tourist-facing certificate, passport, or discovery layouts.

## Security Boundary

Every admin page must be protected by server-side checks:

1. Require an authenticated admin session.
2. Confirm the admin user is active.
3. Load permissions from server-side role/permission data.
4. Enforce page and action permissions on the server.
5. Hide unauthorized UI actions as a convenience only.

Frontend visibility is not a security control. Direct server actions, route handlers, and data access paths must enforce permissions.

## Attraction CMS Pages

The attraction CMS manages source data for public content and analytics dimensions.

Core fields include:

- Province and district.
- Attraction type.
- Thai and English names.
- Slug.
- Short and long descriptions.
- History text.
- Coordinates where available.
- Public visibility status.
- Operational active status.

The CMS should protect data quality because dashboard metrics will depend on attraction, province, district, and category relationships.

## Content Hub Page

Route:

```text
/admin/content
```

Purpose:

The Content Hub is a workflow-first command center for admins who need to understand where public content is edited. It should explain how homepage popular destinations, attraction detail pages, media, stories, routes, photo spots, and QR landing pages connect.

The page should not duplicate CRUD functionality. It should guide admins to the correct module and reduce confusion about where to update public-facing content.

Required guidance:

- Change popular destination image through the attraction/media workflow.
- Edit attraction detail text through the attraction edit page.
- Manage story content through the story module.
- Manage route content through the route module.
- Manage QR landing context through photo spots and check-in codes.
- Treat attraction records as the source of truth for public destination content.

## Photo Spot Pages

Photo spots identify the physical or curated points where tourists scan QR codes and create certificates.

Photo spot pages should support:

- List by attraction, province, and active status.
- Create/edit linked to one attraction.
- Optional coordinates and sample image reference.
- Display order.
- Deactivation instead of hard delete where historical visits exist.

## Check-in Code Pages

Check-in codes are public entry points for `/c/[checkinCode]`.

Check-in code pages should support:

- Unique URL-safe code.
- Attraction link.
- Optional photo spot link.
- Active/inactive status.
- Optional start and end validity dates.
- Copyable public URL.
- QR preview or download if implemented.
- Filters for attraction, photo spot, stored active state, and effective schedule state.
- Schedule editing in Bangkok local time while storing UTC timestamps.
- Permission-aware create, edit, activate/deactivate, download, and export controls.

Only authorized admins should create, update, or deactivate check-in codes.

The list and export must apply the same validated filters. Stored active state and
schedule state are separate: an active code can still be upcoming or expired.

Photo spot pages support search, attraction, and active-state filters. Active QR
codes cannot be saved against an inactive photo spot. Create and update actions
must use the audited server-action path.

## Visits and Surveys

Phase 08 admin visits and surveys are read-only operational records. They support monitoring data collection quality without turning the admin system into an unrestricted personal-data browser.

Visit lists should show planning-safe fields by default:

- Visit date.
- Province and attraction.
- Photo spot.
- Completion status.
- Certificate status.
- Survey status.
- Created timestamp.

Survey lists should show:

- Visit reference.
- Attraction and province.
- Satisfaction score where available.
- Spending range/category where available.
- Completion timestamp.

Raw comments and direct identifiers should be hidden by default and require explicit permission if exposed later.

## Tourist Records

The tourist list is an operational, privacy-aware view of profiles created through the check-in flow.

- The list requires `tourist.read` and performs pagination, search, origin filters, identity-provider filtering, and sorting on the server.
- Search accepts a display name or an exact full tourist UUID. Partial UUID searching is intentionally unsupported.
- List rows show only a masked profile reference, display name, origin summary, identity-provider category, and engagement counts.
- Opening `/admin/tourists/[touristId]` requires the separate `tourist.detail` permission.
- Detail history is read-only and shows at most the 50 latest visits and stamps, while retaining exact total counts.
- Guest/device tokens, provider user IDs, passwords, raw survey comments, photo paths, certificate paths, and signed URLs are not selected or returned by the admin tourist repository.
- The admin detail page must not be treated as an unrestricted customer profile editor. Any future correction workflow requires explicit permissions and audit logging.

## Dashboard and Export Boundaries

The admin area may link to dashboard and reporting pages, but Phase 08 should not claim full analytics or export implementation.

- Full dashboard metric implementation belongs to Phase 09.
- Privacy-safe report/export implementation belongs to Phase 10 unless already verified.
- Dashboard values must distinguish QR scans from visits.
- Estimated spending must not be described as revenue.
- Tourist profiles must not be described as verified unique people.

## Acceptance Criteria

- Admin routes require server-side authentication and permission checks.
- Attraction, photo spot, and check-in CMS pages are documented as the Phase 08 core.
- Visit and survey pages are read-only by default.
- Lists require pagination and filters.
- Sensitive identifiers are hidden by default.
- Important admin changes are audit logged or explicitly planned for audit logging.
- Full analytics, export, and LINE features are not presented as complete Phase 08 work.

## Related Documents

- `docs/backend/AUTHORIZATION_RULES.md`
- `docs/security/ROLE_PERMISSION_MATRIX.md`
- `docs/security/AUDIT_LOGGING.md`
- `docs/modules/MODULE_09_ADMIN_ATTRACTION_CMS.md`
- `tasks/PHASE_08_ADMIN_BACKOFFICE.md`
