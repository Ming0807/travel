# Public Frontend System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved homepage design into a truthful, accessible, mobile-first Yala tourism product across every public and tourist route.

**Architecture:** Preserve App Router server rendering and existing repositories. Add a small public design vocabulary, then migrate page families in vertical slices so each batch produces usable routes rather than a disconnected component library. Correct data/action/privacy contracts before visual polish on the affected surface.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase PostgreSQL/Storage, Zod, Vitest, Testing Library, Playwright, Impeccable.

## Global Constraints

- Launch scope is Yala only; do not imply Pattani or Narathiwat are currently active.
- Palette is ink `#17212B`, coral `#E77455`, teal `#0A6B62`, gold `#D6A13D`, canvas `#F8FAFC`, and white.
- Typography is `Noto Sans Thai` for operational/body copy and `Kanit` for headings only.
- Controls use 6px radius, cards/panels use 8px, and pills are reserved for filters/status.
- Tourist interactions are at least 44px and body/form text is at least 16px.
- Photo is optional; visit time is server-recorded; guest-first and reward-before-survey remain intact.
- Public leaderboard identities are anonymized until explicit public-display consent exists.
- Certificate sharing is file-first; do not share a private success URL.
- Every visible control must work or be removed.
- No fake statistics, contacts, operators, map previews, reward promises, publication promises, or no-data-as-zero.
- Use targeted lint/tests per task. Run full Vitest/build/cross-route Playwright only at batch checkpoints.
- Never modify or delete the user-owned root `.tmp/` directory.

## Agent Assignment Policy

| Work type | Model | Reasoning | Controller gate |
| --- | --- | --- | --- |
| Copy inventory, metadata, route fixtures, bounded snapshots | Luna | `low` or `medium` | Targeted diff review |
| Isolated visual component and focused unit tests | Luna | `medium` | Component contract + screenshot review |
| Listing/detail route, server filters, responsive behavior | Luna | `high` | Repository/query review + browser QA |
| Identity, consent, privacy, certificate ownership, data contracts | Luna | `xhigh` | Controller implements or performs full line-level review |
| Cross-route architecture and final integration | Controller | `high` or `xhigh` | Full checkpoint gates |

Do not use Terra. Parallel agents may only receive non-overlapping ownership.

---

## Batch 0: Foundation And Truthful Shared Shell

### Task 1: Freeze public tokens, typography, and motion

**Reasoning:** Luna `medium`; controller reviews global blast radius.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Test: `tests/unit/public-design-system.test.tsx`

**Interfaces:**
- Produces CSS tokens `--public-ink`, `--public-coral`, `--public-teal`, `--public-gold`, `--public-canvas`, `--public-radius-control`, and `--public-radius-panel`.
- Produces font variables used by all later public primitives.

- [ ] Add a failing test that renders a public heading/body specimen and asserts Kanit is heading-only while body copy uses Noto Sans Thai.
- [ ] Run `npx vitest run tests/unit/public-design-system.test.tsx` and confirm the new assertions fail.
- [ ] Replace unloaded Prompt/Sarabun drift with the frozen font variables and add a `prefers-reduced-motion: reduce` rule that removes non-essential transitions and scroll animation.
- [ ] Run the targeted test and `npx eslint -- app/layout.tsx tests/unit/public-design-system.test.tsx`.
- [ ] Run `node .agents/skills/impeccable/scripts/detect.mjs app/layout.tsx app/globals.css` and resolve all warnings introduced by this task.
- [ ] Commit as `refactor: freeze public design tokens and typography`.

### Task 2: Build shared public primitives from real duplication

**Reasoning:** Luna `high` because the API affects every route family.

**Files:**
- Create: `components/public/PublicPageFrame.tsx`
- Create: `components/public/PublicButton.tsx`
- Create: `components/public/PublicFields.tsx`
- Create: `components/public/PublicMediaFrame.tsx`
- Create: `components/public/PublicStates.tsx`
- Create: `components/public/PublicPagination.tsx`
- Test: `tests/unit/public-ui-primitives.test.tsx`

**Interfaces:**
- `PublicPageFrame({ variant: "listing" | "detail" | "reading" | "legal", children })`.
- `PublicButton({ variant: "primary" | "secondary" | "quiet" | "danger", href?, type?, disabled? })`.
- `PublicMediaFrame({ src?, alt, aspect, sizes, priority?, fallbackLabel })`.
- State components accept `title`, optional `description`, and an optional real retry/back action.
- `PublicPagination` receives `page`, `pageCount`, and `createHref(page)`; it must use links, not client-side mutation.

- [ ] Write failing tests for semantic links/buttons, 44px targets, visible labels, media fallback, disabled state, current-page semantics, and no nested interactive elements.
- [ ] Run `npx vitest run tests/unit/public-ui-primitives.test.tsx` and confirm failure.
- [ ] Implement only the listed primitives; do not add generic cards, dialogs, or tabs until a real page consumes them twice.
- [ ] Run targeted tests and ESLint on the created files.
- [ ] Commit as `feat: add public interface primitives`.

### Task 3: Make the global public shell keyboard-safe and focus-aware

**Reasoning:** Luna `high`; controller performs browser focus review.

**Files:**
- Modify: `components/layout/site-header.tsx`
- Modify: `components/layout/mobile-bottom-nav.tsx`
- Modify: `components/layout/page-shell.tsx`
- Modify: `components/layout/SiteFooter.tsx`
- Test: `tests/unit/public-navigation.test.tsx`
- Test: `tests/e2e/public-navigation.spec.ts`

**Interfaces:**
- Header menus expose `aria-expanded`, open by click/keyboard, close on Escape/outside click, and restore focus.
- Focused funnel routes render no discovery header or bottom navigation.
- Footer becomes shell-owned where route groups permit it, avoiding page-by-page duplication.

- [ ] Write failing unit tests for menu keyboard behavior and focused-flow shell selection.
- [ ] Implement explicit menu state and focus restoration without hover-only dependency.
- [ ] Add Playwright coverage at 390px and 1280px for open, keyboard navigation, Escape, and no overlap.
- [ ] Run targeted unit/E2E, changed-file ESLint, typecheck, Impeccable, and `git diff --check`.
- [ ] Commit as `fix: harden public navigation and focused flows`.

### Batch 0 Checkpoint

- [ ] Run `npm run typecheck`.
- [ ] Run `npx vitest run tests/unit/public-design-system.test.tsx tests/unit/public-ui-primitives.test.tsx tests/unit/public-navigation.test.tsx`.
- [ ] Run `npx playwright test tests/e2e/public-navigation.spec.ts`.
- [ ] Inspect screenshots at 360, 390, 768, and 1440px.

---

## Batch 1: Attractions Discovery And Detail

### Task 4: Define truthful attraction listing contracts

**Reasoning:** Luna `high`; controller reviews query completeness and indexes.

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `app/(public)/attractions/page.tsx`
- Modify: `app/(public)/attractions/loading.tsx`
- Test: `tests/unit/public-attractions-listing.test.ts`

**Interfaces:**
- Listing input: `{ query?: string; province?: "Yala"; type?: string; page: number; pageSize: number }`.
- Listing output: `{ items: PublicAttractionCard[]; total: number; page: number; pageCount: number }`.
- Missing image, rating, or review count remains `null`; it is never invented or converted to zero.

- [ ] Write failing repository tests for combined filters, escaped wildcard input, total count, page boundaries, published/active scope, and thumbnail-first media.
- [ ] Implement one server-side filtered query path and map only public DTO fields.
- [ ] Add a route-level no-result and invalid-page contract.
- [ ] Run targeted repository tests, ESLint, and typecheck.
- [ ] Commit as `fix: make attraction discovery results truthful`.

### Task 5: Redesign `/attractions` as the primary discovery workspace

**Reasoning:** Luna `high`; controller performs visual review.

**Files:**
- Modify: `app/(public)/attractions/page.tsx`
- Create: `components/attractions/AttractionDiscoveryFilters.tsx`
- Create: `components/attractions/AttractionDiscoveryCard.tsx`
- Test: `tests/unit/attraction-discovery-ui.test.tsx`
- Modify: `tests/e2e/attractions-filters.spec.ts`

**Interfaces:**
- Filters submit URL search parameters and preserve unrelated valid parameters.
- Cards expose name, district/location, attraction type, real rating/review state, image, and detail link.
- Clear filters returns to `/attractions`; all routine navigation uses Next links/forms.

- [ ] Write failing component tests for labels, URL parameter behavior, clear action, no-results state, and null-rating copy.
- [ ] Implement compact intro, filter workspace, active-filter summary, truthful count, scan-friendly cards, and pagination.
- [ ] Add browser tests for search, type, clear, pagination, keyboard use, and mobile overflow.
- [ ] Run targeted tests, changed-file ESLint, Impeccable, and screenshots at 390/768/1440px.
- [ ] Commit as `feat: redesign public attraction discovery`.

### Task 6: Redesign attraction detail around the tourist decision journey

**Reasoning:** Luna `high`; controller reviews every action and data source.

**Files:**
- Modify: `app/(public)/attractions/[slug]/page.tsx`
- Modify: `components/attractions/attraction-header.tsx`
- Modify: `components/attractions/attraction-gallery.tsx`
- Modify: `components/attractions/attraction-tabs.tsx`
- Modify: `components/attractions/attraction-info-sidebar.tsx`
- Modify: `components/attractions/attraction-tips.tsx`
- Modify: `components/attractions/attraction-reviews.tsx`
- Modify: `components/attractions/attraction-cta.tsx`
- Test: `tests/unit/attraction-detail-ui.test.tsx`
- Test: `tests/e2e/public-attractions.spec.ts`

**Interfaces:**
- Detail sections render only when CMS data exists.
- Gallery thumbnails are buttons opening a keyboard-safe viewer; otherwise render static media without click styling.
- 360 and check-in actions remain available on mobile only when real URLs/codes exist.
- Review summary displays database-backed count/sample and links to real review behavior.

- [ ] Write failing tests for conditional sections, gallery semantics, mobile action availability, Thai-first labels, and removal of unsupported facts.
- [ ] Recompose media, overview, things to do, food, tips, access, reviews, related content, and check-in CTA with stable section anchors.
- [ ] Implement a focus-safe gallery dialog only if the page has multiple images.
- [ ] Add metadata, loading/not-found behavior, image priority/sizes, and no-data states.
- [ ] Run targeted unit/E2E, ESLint, typecheck, Impeccable, and desktop/mobile screenshot review.
- [ ] Commit as `feat: redesign public attraction detail`.

### Batch 1 Checkpoint

- [ ] Run all attraction unit tests and `tests/e2e/attractions-filters.spec.ts tests/e2e/public-attractions.spec.ts`.
- [ ] Verify database filters with a result, no result, and missing optional fields.
- [ ] Check Lighthouse-style image/network behavior manually in Playwright traces.

---

## Batch 2: Food, Stay, Routes, And 360

### Task 7: Move restaurant and accommodation filtering to the server

**Reasoning:** Luna `high`; controller reviews repository parity.

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `app/(public)/restaurants/page.tsx`
- Modify: `components/restaurants/RestaurantFilterBar.tsx`
- Modify: `app/(public)/accommodations/page.tsx`
- Modify: `components/accommodations/AccommodationFilterBar.tsx`
- Test: `tests/unit/public-hospitality-listing.test.ts`
- Test: `tests/e2e/public-hospitality.spec.ts`

- [x] Write failing tests proving filters operate over the full published dataset rather than the first 50 rows.
- [x] Implement paginated repository contracts with truthful totals and URL-driven filters.
- [x] Migrate both pages to the shared listing primitives while retaining distinct food/stay decision fields.
- [x] Run targeted unit/E2E and commit as `feat: harden food and stay discovery`.

### Task 8: Recompose restaurant and accommodation details

**Reasoning:** Luna `medium` for bounded UI; controller verifies actions.

**Files:**
- Modify: `app/(public)/restaurants/[slug]/page.tsx`
- Modify: `app/(public)/accommodations/[slug]/page.tsx`
- Test: `tests/unit/public-hospitality-detail.test.tsx`

- [x] Add failing tests for conditional phone/map/site links, no fake booking action, nearby attraction links, and media fallbacks.
- [x] Implement distinct food/stay detail layouts using shared media/action/state primitives.
- [x] Add metadata, loading/not-found behavior, and responsive image policy.
- [x] Run targeted tests, Impeccable, and screenshots; commit as `feat: redesign hospitality details`.

### Task 9: Make routes and 360 experiences truthful

**Reasoning:** Luna `high`; controller checks content/data origin.

**Files:**
- Modify: `app/(public)/routes/page.tsx`
- Modify: `app/(public)/routes/[slug]/page.tsx`
- Modify: `app/(public)/360-vista/page.tsx`
- Modify: `lib/repositories/public-content.repository.ts`
- Test: `tests/unit/public-routes-vista.test.tsx`
- Test: `tests/e2e/public-routes-vista.spec.ts`

- [x] Write failing tests that reject a non-functional map action and hardcoded CSS panorama preview.
- [x] Render route day/stop timelines from stored route data and show maps only when real coordinate geometry exists.
- [x] Render 360 content from published media/CMS data or an honest empty/external-provider state.
- [x] Run targeted gates and commit as `fix: make routes and 360 content truthful`.

---

## Batch 3: Stories And Community Content

### Task 10: Build a real stories newsroom and reading experience

**Reasoning:** Luna `high`; controller reviews sanitization and authorship contracts.

**Files:**
- Modify: `app/(public)/stories/page.tsx`
- Modify: `app/(public)/stories/[id]/page.tsx`
- Modify: `components/stories/PublicStoryCard.tsx`
- Modify: `components/stories/StoryDocumentRenderer.tsx`
- Test: `tests/unit/public-stories.test.tsx`
- Test: `tests/e2e/public-stories.spec.ts`

- [x] Write failing tests for true featured/latest semantics, filters, author type, update/source information, sanitization boundary, and 70ch reading width.
- [x] Implement newsroom and reading layouts with real related-content/destination links.
- [x] Add desktop TOC and mobile disclosure only when headings exist.
- [ ] Run targeted gates and commit as `feat: redesign public story discovery and reading`.

### Task 11: Make story contribution expectations and moderation explicit

**Reasoning:** Luna `xhigh` because UGC rights, privacy, identity, and moderation intersect.

**Files:**
- Modify: `app/(public)/stories/share/page.tsx`
- Modify: `components/stories/ShareStoryForm.tsx`
- Modify: `app/actions/tourist-story-actions.ts`
- Test: `tests/unit/tourist-story-action.test.ts`
- Test: `tests/e2e/story-submission.spec.ts`

- [x] Add failing tests for sign-in explanation, content/photo rights, draft/submitted outcome, duplicate pending state, and safe errors.
- [x] Preserve resolve-only tourist identity and plain-text UGC storage.
- [x] Change success copy to “ส่งให้ทีมตรวจสอบแล้ว” and never promise publication.
- [x] Run targeted security/UI gates; controller reviews line-by-line; commit as `fix: clarify story contribution and moderation`.

---

## Batch 4: Passport, Leaderboard, Profile, And Identity

### Task 12: Redesign Passport as a personal travel record

**Reasoning:** Luna `high`; controller verifies ownership and guest behavior.

**Files:**
- Modify: `app/(tourist)/passport/page.tsx`
- Modify: `components/passport/PassportSummary.tsx`
- Modify: `components/passport/ProvinceProgress.tsx`
- Modify: `components/passport/StampGrid.tsx`
- Modify: `components/passport/StampCard.tsx`
- Test: `tests/unit/passport-page.test.tsx`

- [ ] Write failing tests for earned/missing states, recent visits, empty Passport, account recovery CTA, and removal of gradient text.
- [ ] Implement accessible progress and responsive stamp layout without invented percentages.
- [ ] Run targeted gates and commit as `feat: redesign tourist passport`.

### Task 13: Enforce privacy-first leaderboard identities

**Reasoning:** Luna `xhigh`; controller owns schema/privacy decision and migration review.

**Files:**
- Modify: `app/(public)/leaderboard/page.tsx`
- Modify: `app/(tourist)/profile/page.tsx`
- Modify: relevant tourist/leaderboard repository and validation modules discovered during implementation
- Create or modify: one timestamped Supabase migration only if explicit public-display preference is absent
- Test: `tests/unit/leaderboard-privacy.test.ts`
- Test: `tests/e2e/leaderboard.spec.ts`

- [ ] Prove with failing tests that certificate/display name is never public without explicit opt-in.
- [ ] Add or use a purpose-specific public leaderboard preference and anonymized alias fallback.
- [ ] Replace `#0` with “ยังไม่ติด Top 100”; add accessible period controls and semantic ranking rows.
- [ ] Document migration/privacy effects and run targeted tests plus migration verification.
- [ ] Controller performs line-level privacy review; commit as `fix: make public leaderboard privacy-first`.

### Task 14: Recompose profile, login, and account linking

**Reasoning:** Luna `xhigh` due identity and consent.

**Files:**
- Modify: `app/(tourist)/profile/page.tsx`
- Modify: `app/(public)/auth/login/page.tsx`
- Modify: `app/(tourist)/account/link-line/page.tsx`
- Modify: auth callback/identity action modules discovered during implementation
- Test: `tests/unit/tourist-auth.test.tsx`
- Test: `tests/unit/identity-linking.test.ts`

- [ ] Write failing tests for guest-first copy, connected identity state, consent separation, safe internal `next`, and no automatic `hasConsented: true`.
- [ ] Separate profile groups: certificate name, origin, public display, connected accounts, consent/privacy actions.
- [ ] Allowlist post-auth destinations to internal routes and reject protocol-relative/external values.
- [ ] Run targeted auth/privacy gates; controller reviews line-by-line; commit as `fix: harden tourist identity and profile UX`.

---

## Batch 5: QR, Photo, Certificate, Survey, And Research

### Task 15: Apply the focused funnel shell and truthful progress

**Reasoning:** Luna `high`; controller checks analytics event semantics.

**Files:**
- Modify: `app/(tourist)/checkin/[code]/page.tsx`
- Modify: `app/(tourist)/checkin/[code]/start/page.tsx`
- Modify: `components/checkin/CheckinLanding.tsx`
- Modify: `components/checkin/MinimalForm.tsx`
- Modify: `components/checkin/MinimalProfileForm.tsx`
- Test: `tests/unit/checkin-funnel-ui.test.tsx`
- Test: `tests/e2e/qr-scan-flow.spec.ts`

- [ ] Write failing tests for benefit/duration/optionality/privacy copy, returning-tourist prefill/edit, server-recorded time, and focused shell.
- [ ] Implement progress labels `ข้อมูลสั้น ๆ`, `รูป/ใบประกาศ`, `รับรางวัล`, `แบบสำรวจ (ไม่บังคับ)` without claiming uncompleted steps.
- [ ] Preserve event distinction: scan, landing, visit, upload, certificate, and survey.
- [ ] Run targeted gates and commit as `feat: clarify the QR check-in funnel`.

### Task 16: Harden camera/gallery and mobile photo UX

**Reasoning:** Luna `high`; controller runs real-device-compatible browser checks.

**Files:**
- Modify: `components/checkin/CameraCaptureDialog.tsx`
- Modify: `components/checkin/PhotoUploadClient.tsx`
- Modify: `app/(tourist)/visit/[visitId]/photo/page.tsx`
- Test: `tests/unit/photo-upload-ui.test.tsx`
- Test: `tests/e2e/mobile-photo-flow.spec.ts`

- [ ] Write failing tests for two distinct actions, `capture="environment"`, permission denial, focus trap/restore, stream cleanup, retake, skip, HEIC, compression errors, and fixed footer visibility.
- [ ] Keep camera permission request behind the camera action only; gallery must not request camera permission.
- [ ] Use dynamic viewport/safe-area layout so controls remain reachable after camera open.
- [ ] Run targeted tests and 360/390/430px browser screenshots; commit as `fix: harden mobile camera and gallery UX`.

### Task 17: Make certificate preview, generation, and sharing consistent

**Reasoning:** Luna `xhigh`; controller owns certificate/storage/ownership review.

**Files:**
- Modify: `app/(tourist)/visit/[visitId]/certificate/preview/page.tsx`
- Modify: `app/(tourist)/visit/[visitId]/certificate/success/page.tsx`
- Modify: `components/certificate/CertificatePreview.tsx`
- Modify: `components/certificate/CertificateSuccessActions.tsx`
- Modify: certificate API/service modules discovered during implementation
- Test: targeted certificate rendering/ownership tests
- Test: `tests/e2e/certificate-flow.spec.ts`

- [ ] Write failing tests for no-photo certificate generation, actual generated preview, ownership guard, idempotency, download, file sharing, and fallback instructions.
- [ ] Remove private success URL sharing and pass a generated file to `navigator.share` only when supported.
- [ ] Verify templates preserve custom placement and backgrounds without relying on a baked circular opening.
- [ ] Run certificate regression, storage/privacy, and mobile browser gates; commit as `fix: align certificate preview and sharing`.

### Task 18: Shorten survey burden and preserve research separation

**Reasoning:** Luna `xhigh` because production data, research consent, and analytics contracts intersect.

**Files:**
- Modify: `app/(tourist)/visit/[visitId]/survey/page.tsx`
- Modify: survey form/service/repository modules discovered during implementation
- Modify: `app/(tourist)/visit/[visitId]/evaluation/page.tsx`
- Modify: `components/research/ResearchEvaluationForm.tsx`
- Test: survey/research unit and E2E suites

- [ ] Write failing tests for optional skip, accurate duration, pending/double-submit, retry, facility score parity, browser-language capture, and production/research dataset separation.
- [ ] Keep tourism survey progressive; keep 19 core research items, three incentive items, and optional comment only inside consented research mode.
- [ ] Add low/high anchors to rating questions and retain nullable missing answers.
- [ ] Run targeted data/privacy/UI gates; controller reviews line-by-line; commit as `fix: reduce survey burden and separate research data`.

---

## Batch 6: Trust, Legal, Contact, And Public Evidence

### Task 19: Replace unsupported About and contact claims with real data/actions

**Reasoning:** Luna `high`; controller verifies every source and API path.

**Files:**
- Modify: `app/(public)/about/page.tsx`
- Modify: `app/(public)/contact/page.tsx`
- Modify: `components/contact/ContactPageClient.tsx`
- Modify or remove: `lib/data/about.ts`
- Test: `tests/unit/public-trust-pages.test.tsx`
- Test: `tests/e2e/contact.spec.ts`

- [ ] Write failing tests proving contact calls `/api/contact` and reports pending/error/success/retry.
- [ ] Remove fake team, operator, scale, social, FAQ, newsletter, redemption, contact, hours, and response-time claims.
- [ ] Build an evidence-led Yala pilot About page and a real support task page.
- [ ] Run targeted gates and commit as `fix: make public trust pages evidence-based`.

### Task 20: Rewrite privacy and terms as accurate service contracts

**Reasoning:** Luna `xhigh`; controller and privacy skill review every claim.

**Files:**
- Modify: `app/(public)/privacy/page.tsx`
- Modify: `app/(public)/terms/page.tsx`
- Modify: relevant privacy/security documentation
- Test: `tests/unit/public-legal-copy.test.tsx`

- [ ] Inventory actual fields, purposes, optionality, storage, retention, cookies, providers, UGC, rewards, and withdrawal paths.
- [ ] Add failing tests against known false claims such as unconfigured Google Analytics or unsupported operator identity.
- [ ] Implement plain-language summaries followed by complete, versioned Thai-first detail.
- [ ] Run targeted privacy review and commit as `docs: align public privacy and terms with production`.

### Task 21: Turn `/dashboard` into an honest public evidence report

**Reasoning:** Luna `xhigh`; controller owns metric semantics and privacy review.

**Files:**
- Modify: `app/(public)/dashboard/page.tsx`
- Reuse/adapt: `components/dashboard/*` only where public-safe
- Modify: dashboard DTO/repository modules discovered during implementation
- Test: `tests/unit/public-dashboard-evidence.test.tsx`
- Test: `tests/e2e/public-dashboard.spec.ts`

- [ ] Write failing tests for no-data, sample size, data-as-of, metric definition/source, small-sample warning, limitations, and accessible table alternatives.
- [ ] Remove zero-filled missing data and prevent private/small-cell disclosure.
- [ ] Present Yala KPIs, trend, visitor profile, travel behavior, attraction feedback, and improvement opportunities only when supported by existing approved formulas.
- [ ] Run targeted metric/privacy/UI gates and commit as `feat: rebuild public dashboard as evidence report`.

---

## Batch 7: Cross-Route Production QA

### Task 22: Metadata, loading, localization, and performance sweep

**Reasoning:** Luna `high`; controller handles integration.

**Files:**
- Modify: affected `app/(public)/**/page.tsx`, `loading.tsx`, `not-found.tsx`, and shared public components
- Test: `tests/e2e/public-route-matrix.spec.ts`

- [ ] Verify one literal `h1`, Thai-first title/description, canonical metadata, and honest Yala scope per route.
- [ ] Verify one priority image, accurate `sizes`, thumbnail/full-image policy, no undocumented `unoptimized`, and deliberate revalidation.
- [ ] Add no-data/loading/error/not-found behavior without client-side fetching where server rendering suffices.
- [ ] Run cross-route Playwright at 360, 390, 768, 1280, and 1440px with overflow, focus, image, and console-error assertions.
- [ ] Commit as `test: harden the public route matrix`.

### Task 23: Final release checkpoint

**Reasoning:** Controller `xhigh`; no delegated acceptance decision.

- [ ] Run `git diff --check`.
- [ ] Run ESLint on every changed TS/TSX file since the batch base.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test -- --run` once.
- [ ] Run `npm run build` once and restore `next-env.d.ts` if generated content changes it.
- [ ] Run the public cross-route Playwright matrix once.
- [ ] Run Impeccable detection on every changed public UI file.
- [ ] Verify SQL migration list and documentation if Batch 4 or 5 introduced schema changes.
- [ ] Review screenshots and keyboard flows; do not approve on automated checks alone.
- [ ] Push once with a short timeout. If the Git account chooser blocks, record the local commit and continue without retrying.

## Completion Definition

The redesign is complete only when all public and tourist routes belong to a deliberate page family, all controls are real, Yala scope and privacy claims are accurate, QR-to-certificate remains low-friction, public analytics are interpretable, and desktop/mobile browser QA passes without overlap, console errors, inaccessible focus, or misleading no-data states.
