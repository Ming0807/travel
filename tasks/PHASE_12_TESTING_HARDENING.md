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

## Still Needed (Future)

- [x] Write basic Playwright E2E test for the QR Check-in flow (tourist perspective) (done, handled headless limitations via mocks)
- [x] Run `next build` and verify there are no TS errors or Next.js build errors
- [x] Add Content Security Policy (CSP) headers to `next.config.ts`
- [x] Test production build locally using `next start` (verified build success) for graceful failures
- [ ] Load testing for API routes
- [ ] Accessibility audit
- [ ] Error boundary components for graceful failures
