# PHASE_12_TESTING_HARDENING.md

## Status

In progress.

## Objective

Ensure the platform is stable, secure, and performant before production deployment.

## Test Coverage Summary

### Unit Tests (39 tests passing)

| Test File | Tests | Description |
|---|---|---|
| `env.test.ts` | 5 | Environment variable parsing, Cloudinary conditional validation |
| `dashboard-math.test.ts` | 4 | Safe division, null averages, zero denominators |
| `dashboard-filters.test.ts` | 3 | Filter schema validation and defaults |
| `line-verify.test.ts` | 4 | LINE token verification logic |
| `public-dto.test.ts` | 3 | Public-safe DTO fallback with no private data leaking |
| `storage-safety.test.ts` | 9 | Path traversal prevention, Cloudinary ref encode/decode |
| `upload-validation.test.ts` | 11 | MIME type parsing, file size limits, extension mapping |

### Validation Rules Tested

- [x] Server environment configuration validation with Zod
- [x] Cloudinary secrets required only when `STORAGE_PROVIDER=cloudinary`
- [x] Path traversal protection in storage paths
- [x] MIME type whitelist for tourist uploads
- [x] File size limit enforcement
- [x] Dashboard safe division (no divide by zero)
- [x] Dashboard null average handling
- [x] Public DTO contains no internal DB fields (id, created_at, is_published)
- [x] Cloudinary reference encoding is deterministic and reversible

## Security Hardening Checklist

- [x] Service role key is server-only (not prefixed `NEXT_PUBLIC_`)
- [x] API routes use rate limiting
- [x] Admin routes require `requirePermission()` guard
- [x] Tourist photo upload validates file type and size
- [x] Storage paths reject traversal patterns (`..`, absolute, URLs)
- [x] Cloudinary API secret never reaches browser
- [x] Dashboard exports exclude private identifiers
- [x] Admin audit logging on mutations
- [x] Certificate download works without login requirement

## Performance Considerations

- [x] Admin tables use pagination
- [x] Public content queries are limited with `.limit()`
- [x] Homepage uses `Promise.all` for parallel data fetching
- [x] Images use `next/image` with lazy loading
- [x] Server Components for data-heavy pages

## Completed in This Session

### Load Testing for API Routes ✅

[k6](https://k6.io) load test scenarios added to `load-testing/load-test.js`:

| Scenario | Endpoint | Description |
|---|---|---|
| `public_attractions` | `GET /api/public/attractions` | Baseline: reads public attraction data |
| `checkin_resolve` | `POST /api/checkin/resolve` | Core flow: resolves QR check-in codes |
| `admin_media_list` | `GET /api/admin/media` | Admin: lists media assets with filters |
| `admin_media_upload` | `POST /api/admin/media/upload` | Admin: simulates file upload (10KB jpeg) |
| `admin_media_archive` | `DELETE /api/admin/media/[id]` | Admin: archives a media asset |
| `admin_dashboard` | `GET /api/admin/dashboard` | Admin: dashboard analytics |
| `admin_export_visits` | `GET /api/admin/export/visits` | Admin: CSV export of visit records |
| `admin_settings_get` | `GET /api/admin/settings` | Admin: reads site settings |
| `admin_checkin_codes` | `GET /api/admin/checkin-codes` | Admin: paginated check-in code list |
| `public_stories` | `GET /api/public/stories` | Public: lists travel stories |

### Accessibility Audit ✅

| Component | Changes |
|---|---|
| **MediaLibrary** | `aria-label` on search input; `role="radiogroup"` with `aria-checked` for category filters; `aria-pressed` on archive toggle; `role="list"`/`role="listitem"` on stats; `role="alert"`/`aria-live="polite"` on errors; `role="status"` on loading; keyboard nav (`tabIndex`, `onKeyDown`) for pick mode; `loading="lazy"` on images; `role="dialog"`/`aria-modal`/`aria-label` + focus trap on archive dialog |
| **MediaManager** | `aria-describedby` linking media type select to help text; `<fieldset>` + `<legend>` grouping for checkboxes |
| **ConfirmDialog** | `aria-labelledby` + `aria-describedby` with proper element IDs; focus trap (Tab/Shift+Tab cycling) |
| **LoadingState** | Existing `role="status"`/`aria-label`/`sr-only` ✅ |
| **ErrorState** | Existing `role="alert"`/`<details>`/`<summary>` ✅ |

### Error Boundary Components ✅

Created `components/ErrorBoundary.tsx` — class-based React ErrorBoundary with:
- Graceful fallback UI: icon, title, description, retry button
- Developer mode technical details via `<details>`/`<summary>` (hidden in production)
- Custom fallback, `onError` callback, `fallbackTitle`/`fallbackDescription` props
- Applied to: `app/(admin)/admin/media/page.tsx` (MediaLibrary) and `app/(admin)/admin/dashboard/page.tsx` (ExecutiveOverview)

## Still Needed (Future - Out of Phase 12 Scope)

- [x] Write basic Playwright E2E test for the QR Check-in flow (tourist perspective)
- [x] Run `next build` and verify there are no TS errors or Next.js build errors
- [x] Add Content Security Policy (CSP) headers to `next.config.ts`
- [x] Test production build locally using `next start` (verified build success)
- [x] Load testing for API routes
- [x] Accessibility audit
- [x] Error boundary components for graceful failures
- [ ] Full E2E test coverage for admin CRUD flows (Phase 13+)
- [ ] Visual regression testing for responsive UI
- [ ] Performance budget enforcement with Lighthouse CI
