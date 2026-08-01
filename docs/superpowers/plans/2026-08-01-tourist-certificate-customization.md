# Tourist Certificate Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add managed template selection and bounded photo crop controls to the tourist certificate preview, then replace the fixed-placeholder background with full-bleed Yala artwork.

**Architecture:** Extend the existing certificate template service with a single-query selection contract. Keep layout authority in `layout_config_json`, apply tourist customization only inside `CertificateArtwork`, and continue uploading the captured PNG through the existing authenticated generation API.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase, html-to-image, Vitest, Testing Library, Sharp.

## Global Constraints

- Thai-first and mobile-first.
- No fixed photo placeholder in background artwork.
- No new database migration.
- No raw private storage path sent to the client.
- User customization is bounded to template choice and photo zoom/pan/reset.
- Admin layout controls remain authoritative.

---

### Task 1: Template Selection Contract

**Files:**
- Modify: `lib/services/certificate-template.service.ts`
- Modify: `app/(tourist)/visit/[visitId]/certificate/preview/page.tsx`
- Test: `tests/unit/certificate-template-selection.test.ts`

**Interfaces:**
- Produces: `getCertificateTemplateSelection(params): Promise<{ selected; options }>`
- Guarantees: one repository read, deterministic ordering, eligible attraction/global templates only.

- [ ] Write failing tests for default selection, attraction precedence, language fallback, requested eligibility, and option ordering.
- [ ] Run `npx vitest run tests/unit/certificate-template-selection.test.ts --maxWorkers=1` and confirm the new contract is missing.
- [ ] Implement `getCertificateTemplateSelection` and reuse it from `resolveCertificateTemplate`.
- [ ] Pass visit-scoped template option DTOs to the preview client.
- [ ] Run the focused tests and typecheck.

### Task 2: Bounded Photo Adjustment And Premium Frame

**Files:**
- Modify: `components/certificate/CertificateArtwork.tsx`
- Create: `components/certificate/CertificateCustomizer.tsx`
- Modify: `components/certificate/CertificatePreview.tsx`
- Test: `tests/unit/certificate-preview-template.test.tsx`

**Interfaces:**
- Produces: `PhotoAdjustment = { zoom: number; x: number; y: number }`.
- Consumes: selected template option with layout and private proxy URL.

- [ ] Write failing tests for template switching, zoom/pan styles, reset, clamping, and selected template generation payload.
- [ ] Run the focused test and verify failures come from missing controls/props.
- [ ] Add adjustment normalization and render a separate premium frame around the photo.
- [ ] Add Thai template choices and inline mobile-safe controls with range inputs.
- [ ] Capture the selected template and adjustment in the exact DOM sent to `toPng`.
- [ ] Run tests, ESLint, typecheck, and Impeccable detection.

### Task 3: Full-Bleed Yala Background And Managed Default

**Files:**
- Create: `public/certificate-templates/yala-mist-heritage-v2.webp`
- Modify: `docs/modules/MODULE_06_CERTIFICATE_GENERATION.md`

**Interfaces:**
- Produces: 2000x1414 WebP source asset without fixed photo placeholder.

- [ ] Convert the approved generated source to optimized WebP and verify dimensions/size with Sharp.
- [ ] Upload it through `/admin/certificate-templates/new` as a managed global Thai template.
- [ ] Set the new record as default and deactivate the placeholder-based predecessor.
- [ ] Verify the Studio image proxy and tourist preview return no 4xx/5xx responses.

### Task 4: Production Verification

**Files:**
- Modify: `docs/backend/CERTIFICATE_RENDERING_FLOW.md`
- Modify: `docs/modules/MODULE_06_CERTIFICATE_GENERATION.md`

**Interfaces:**
- Confirms: stored PNG matches the selected template and customized crop.

- [ ] Run focused unit tests, changed-file ESLint, typecheck, and `npm run build`.
- [ ] Restore `next-env.d.ts` after build.
- [ ] Smoke test desktop and 390x844 mobile with no overflow or console errors.
- [ ] Run `git diff --check`, commit focused changes, and push `main`.
