# PHASE 10: Report & Export

## Status ✅ Implementation Complete

Phase 10 provides CSV and XLSX data export for all admin CRUD modules, a shared CSV utility with formula-injection protection, an Excel (.xlsx) generator with styled headers, and privacy regression tests that verify PII stripping.

## 2026-06 Privacy Hardening Update

- XLSX export now applies the same spreadsheet formula neutralization as CSV for text and JSON-string cells.
- Dashboard exports require both `dashboard.read` and an export-specific permission (`export.summary`, `export.expense_data`, `export.tourist_summary`, `export.visit_records`, or `export.survey_data`) and use the shared CSV/XLSX response helper for every type.
- Tourist export is now a privacy-safe tourist summary (`export.tourist_summary`) with anonymized profile references; it no longer exports `tourist_id`, display name, visit IDs, certificate IDs, or exact registration timestamp.
- Audit export no longer exports admin email or raw `old_data` / `new_data` JSON values; it exports field-name summaries and writes an audit log for the export itself.
- Media export no longer exports raw storage paths. It exports a storage reference category and whether a storage reference exists.
- Review export is treated as comment-sensitive and requires `export.comments`; it no longer exports tourist names or raw review IDs.
- Contact message and admin-user exports are restricted under `export.personal_data`; admin-user export also requires `user.manage`.
- Restaurant export now requires `export.restaurants`, enforces `EXPORT_MAX_ROWS + 1` overflow detection, escapes search wildcard characters, and writes audit logs through the shared audit service.
- Content-admin fallback permissions no longer grant detailed export capabilities such as visit, survey, expense, funnel, user, message, review, tourist, role, personal-data, or generic export-job permissions.

---

## Features Built

### 1. Shared CSV utility — `lib/utils/csv.ts`
- `generateCsv(data)` — Converts objects → CSV string with UTF-8 BOM
- `neutralizeFormulaValue(value)` — Prepends `'` to spreadsheet formula prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`) for cells containing string values
- Numbers are excluded from neutralization (fixes negative numbers like `-5` being corrupted)
- `escapeCsvField(val)` — Wraps every value in double quotes, escapes embedded quotes, handles commas and newlines
- `EXPORT_MAX_ROWS` constant exported from server-env

**Tests:** `tests/unit/csv.test.ts` — 36 tests covering:
- Basic CSV generation (header + rows)
- Empty/null/undefined data
- Special characters and UTF-8
- Formula injection protection (all 6 formula prefixes)
- Numbers and negative values
- Large datasets (1000 rows)
- Date values
- Quote and comma escaping

### 2. Excel (.xlsx) export utility — `lib/utils/excel.ts` (NEW)
- `generateXlsx(data)` — Creates a styled XLSX workbook Buffer using `exceljs`
- Brand teal header row (bold white text on `#0A6B62` background)
- Auto-fitted column widths (14–60 character range)
- Row heights: header 24px, data rows 20px
- Graceful empty-data handling: returns a valid minimal workbook (not a corrupt 0-byte file)
- Objects serialized to JSON in cells
- Server-only (`import "server-only"`)

### 3. Shared export response helper — `lib/utils/export-response.ts` (NEW)
- `createExportResponse(rows, baseFilename, format)` — Returns `NextResponse` with correct `Content-Type` and `Content-Disposition`
- `parseExportFormat(raw)` — Parses `format` query param (defaults to `csv`)
- `exportFilename(base, format)` — Builds filename with correct extension
- Supports `csv` (Content-Type: `text/csv; charset=utf-8`) and `xlsx` (Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

### 4. ExportButton component — `components/admin/ExportButton.tsx` (UPDATED)
- Split-button with format dropdown: left side = download link, right side = format toggle
- Supports CSV (.csv) and Excel (.xlsx) formats
- Appends `?format=csv|xlsx` query param to existing search params
- Outside-click dropdown close behavior
- Active format highlighted in brand teal
- Accessible with `aria-haspopup` and `aria-expanded`

### 5. Export API routes (10 entity routes + 2 consolidated)

| Route | Permission | Filters | Privacy Safe |
|-------|-----------|---------|-------------|
| `/api/admin/export/attractions` | `export.attractions` | None (content only) | ✓ No PII |
| `/api/admin/export/stories` | `export.stories` | None (content only) | ✓ No PII |
| `/api/admin/export/routes` | `export.routes` | None (content only) | ✓ No PII |
| `/api/admin/export/photo-spots` | `export.photo_spots` | None (content only) | ✓ No PII |
| `/api/admin/export/checkin-codes` | `export.checkin_codes` | None (content only) | ✓ No PII |
| `/api/admin/export/media` | `export.media` | None (content only) | ✓ No PII |
| `/api/admin/export/badges` | `export.badges` | None (content only) | ✓ No PII |
| `/api/admin/export/restaurants` | `restaurant.read` | search, isPublished | ✓ No PII |
| `/api/admin/export/visits` | `export.visit_records` | search, attractionId, completionStatus, dateFrom, dateTo | ✓ `toSafeVisitExportRows()` |
| `/api/admin/export/surveys` | `export.survey_data` | search, attractionId, provinceId, minScore, maxScore | ✓ `toSafeSurveyExportRows()` |

**Consolidated:**
- `/api/admin/dashboard/export` — Replaced `Papa.unparse()` with `generateCsv()`; supports `format=csv|xlsx` for `tourists`, `visits`, `surveys` types
- `/api/admin/audit/export` — Replaced inline CSV building with `generateCsv()` / `createExportResponse()`

### 6. Privacy-safe row transformers
- `AdminVisitExportRow` — Strips: `visit_id`, `tourist_id`, `tourist_display_name`, `created_at`. Preserves: visit date, attraction, province, completion status, certificate/stamp flags.
- `AdminSurveyExportRow` — Strips: `survey_id`, `visit_id`, `tourist_id`, `tourist_display_name`, `comments` (free text may contain PII). Preserves: scores, intentions, timestamps.
- Dashboard exports strip all identifiers, device tokens, guest tokens, storage paths, and free-text comments.
- Content-entity exports (attractions, stories, routes, etc.) contain no PII by nature.

### 7. Privacy regression tests — `tests/unit/export-privacy.test.ts` (NEW)
- `toSafeVisitExportRows` — Strips all PII (visit_id, tourist_id, display_name, created_at)
- `toSafeSurveyExportRows` — Strips all PII (survey_id, visit_id, tourist_id, display_name, comments)
- Dashboard export mappers — Verify no identifier fields leak into tourist/visit/survey export rows
- Content-entity export contracts — Verify 8 content-entity export row shapes have no PII-like field names
- Type contract tests — Verify `AdminVisitExportRow` and `AdminSurveyExportRow` types are correctly constrained

### 8. Audit logging
Every export API route logs the export action to `audit_logs` with:
- `actor_id` — authenticated admin user
- `action` — e.g., `export.attractions.{csv|xlsx}`, `export.visits.too_large`
- `entity_type` — e.g., `attraction_export`, `visit_export`
- `metadata` — row count, max rows limit, format

### 9. E2E tests — `tests/e2e/crud-export.spec.ts` (NEW)
Comprehensive Playwright E2E tests for export button flows across all 10 admin CRUD pages:
- Route interception with mock page HTML
- Export button presence and correct `/api/admin/export/*` href attributes
- CSV download initiation with proper headers
- Empty data edge case (413 / empty response)
- 500 error state
- Mobile viewport (Pixel 7)
- Sign-in redirect for unauthenticated access
- Visited pages list (Dashboard, each CRUD page)

---

## Design Decisions

### Why split-button for format selection?
A radio-button or dropdown on the page header would require a server round-trip before downloading. The split-button pattern lets the user switch formats and download immediately — the format is embedded as a URL query param, and the route `GET` is idempotent.

### Why CSV as default and XLSX as alternative?
- CSV is universal, opens in any text editor, and is streamable
- XLSX provides styled headers, auto-fitted columns, and better UX for non-technical admins
- The backend can add more formats (e.g., PDF, JSON) by extending `parseExportFormat()` and `createExportResponse()`

### Why inline row mappers for content entities?
Content-entity exports (attractions, stories, etc.) map rows directly in the route handler rather than through a `toSafe*ExportRows` function. This is intentional: these entities contain no tourist PII, so a dedicated safe-row-mapper is unnecessary. The privacy regression tests verify this contract.

### Why no shared export filter schema?
The seven content-entity routes fetch all data up to `EXPORT_MAX_ROWS`. This is appropriate because:
- Content entities are not high-cardinality (typically <1000 records)
- The `EXPORT_MAX_ROWS` limit prevents server overload
- Admin users need the ability to export all content for backup/offline editing
- Filter support is available at the admin list page level for targeted exports

### PII stripping strategy for visits/surveys
The repository layer uses `toSafeVisitExportRows()` and `toSafeSurveyExportRows()` to transform raw database rows into privacy-safe export rows. This is a two-step pattern:
1. The repository query fetches the raw row (with PII) for internal use
2. The `toSafe*ExportRows()` function maps to a strict type that excludes all PII

This pattern ensures that even if the export route's inline mapping is changed in the future, the type-level constraint prevents accidental PII leaks as long as the developer keeps the repository-layer transformer.

---

## Dependencies
- `exceljs` (added) — XLSX workbook generation
- `papaparse` (existing) — Used for CSV *parsing* in admin official-data import; NOT removed

---

## Removed / Consolidated
- Removed `Papa.unparse()` from dashboard export route (replaced with `generateCsv()`)
- Removed inline CSV building from audit export route (replaced with `generateCsv()` / `createExportResponse()`)
- Removed unused `generateCsv` import from restaurants export route
- Removed broken `EXPORT_MAX_ROWS` import from restaurants route (was importing from `csv.ts` instead of `server-env`)

---

## Related Files

| File | Purpose |
|------|---------|
| `lib/utils/csv.ts` | CSV generation with formula-injection protection |
| `lib/utils/excel.ts` | XLSX generation with styled headers |
| `lib/utils/export-response.ts` | Shared response builder for CSV/XLSX |
| `components/admin/ExportButton.tsx` | Split-button export component with format dropdown |
| `app/api/admin/export/*/route.ts` (10 routes) | Entity-specific export endpoints |
| `app/api/admin/dashboard/export/route.ts` | Dashboard export (multi-type) |
| `app/api/admin/audit/export/route.ts` | Audit log export |
| `lib/repositories/admin-visit.repository.ts` | Visit export with `toSafeVisitExportRows` |
| `lib/repositories/admin-survey.repository.ts` | Survey export with `toSafeSurveyExportRows` |
| `tests/unit/csv.test.ts` | 36 unit tests for CSV utility |
| `tests/unit/export-privacy.test.ts` | Privacy regression tests |
| `tests/e2e/crud-export.spec.ts` | Playwright E2E tests for export button flows |
