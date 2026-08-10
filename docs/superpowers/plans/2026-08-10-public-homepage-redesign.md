# Public Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved production homepage for Yala with real search, compact discovery, CMS-selected content, unchanged public statistics, and intentional desktop/mobile layouts.

**Architecture:** Keep homepage data fetching in the async server component and isolate only search/filter interaction in small client components. Replace the current sequence of oversized independent sections with one discovery workspace, then retain focused server-rendered journey, stories, statistics, Passport CTA, and footer sections. Reuse existing repositories, settings, media helpers, routes, and dashboard analytics.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase repositories, Phosphor icons, Vitest/Testing Library, Playwright.

## Global Constraints

- Preserve `#17212B`, `#E77455`, `#0A6B62`, `#D6A13D`, white, and `#F8FAFC` color roles.
- Preserve existing public dashboard metric formulas and data sources.
- Use real database and CMS content only.
- Show only Yala destination context during the current launch scope.
- Use `6-8px` content corners; reserve pills for filters and status.
- Keep a 44px minimum interactive target and visible keyboard focus.
- Prohibit page-level horizontal overflow at 375px.
- Use one priority/LCP image and accurate responsive `sizes`.
- Do not add a new UI, map, animation, or data-fetching dependency.
- Do not stage or modify `.tmp/`.

---

## File Structure

### Create

- `components/homepage/HomepageSearch.tsx`: typed search category mapping, form interaction, and category selector.
- `components/homepage/HomepageQuickActions.tsx`: five real public discovery links.
- `components/homepage/sections/HomepageDiscoveryWorkspace.tsx`: attraction filters/cards, planning rail, real route links, and coordinate-aware map panel.
- `tests/unit/homepage-search.test.tsx`: search URL and form behavior.
- `tests/unit/homepage-discovery.test.tsx`: Yala filtering, rating/no-data, route, and map fallback behavior.

### Modify

- `types/tourism.ts`: optional attraction coordinates for truthful map behavior.
- `lib/repositories/public-content.repository.ts`: select/map coordinates without changing listing filters.
- `components/homepage/sections/HomepageHero.tsx`: approved one-image hero and real search composition.
- `components/homepage/sections/HomepageHowItWorks.tsx`: compact three-step reward journey.
- `components/homepage/sections/HomepageStories.tsx`: editorial primary/supporting story layout.
- `components/homepage/sections/HomepageDashboardPreview.tsx`: compact presentation using unchanged analytics.
- `components/homepage/sections/HomepageCertificateCta.tsx`: Passport and leaderboard CTA, no fake newsletter.
- `components/homepage/homepage.tsx`: new section order and removal of duplicate highlight/separate-route rendering.
- `components/layout/site-header.tsx`: compact public header and functional search entry.
- `components/layout/mobile-bottom-nav.tsx`: stable compact mobile navigation and focus behavior.
- `components/layout/SiteFooter.tsx`: Yala-first public footer without admin shortcuts.
- `tests/e2e/homepage-smoke.spec.ts`: desktop/mobile task and overflow assertions.
- `docs/frontend/ROUTES_STRUCTURE.md`: homepage section and navigation behavior.
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`: clarify which homepage content remains CMS controlled.

### Remove From Homepage Composition

- `HomepageAttractionsFeed`: superseded by `HomepageDiscoveryWorkspace`.
- `HomepageSuggestedRoutes`: route cards move into the discovery workspace.
- `HomepageHighlights`: duplicate/unverified testimonial content is not rendered.
- `RevealOnScroll` wrappers: homepage content remains visible without observer-triggered opacity.

---

### Task 1: Typed Homepage Search

**Files:**
- Create: `components/homepage/HomepageSearch.tsx`
- Create: `tests/unit/homepage-search.test.tsx`

**Interfaces:**
- Produces: `HomepageSearch({ className?: string })`.
- Produces: `buildHomepageSearchHref(category: HomepageSearchCategory, query: string): string`.
- Categories: `attractions | restaurants | accommodations | stories`.

- [ ] **Step 1: Write failing URL tests**

```tsx
expect(buildHomepageSearchHref("attractions", "น้ำตก")).toBe("/attractions?q=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%95%E0%B8%81");
expect(buildHomepageSearchHref("restaurants", "โรตี")).toBe("/restaurants?q=%E0%B9%82%E0%B8%A3%E0%B8%95%E0%B8%B5");
expect(buildHomepageSearchHref("accommodations", "เบตง")).toBe("/accommodations?q=%E0%B9%80%E0%B8%9A%E0%B8%95%E0%B8%87");
expect(buildHomepageSearchHref("stories", "ชุมชน")).toBe("/stories?search=%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%8A%E0%B8%99");
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run tests/unit/homepage-search.test.tsx`

Expected: module or export missing.

- [ ] **Step 3: Implement the typed helper and accessible form**

```tsx
export type HomepageSearchCategory = "attractions" | "restaurants" | "accommodations" | "stories";

const destinations: Record<HomepageSearchCategory, { pathname: string; parameter: "q" | "search" }> = {
  attractions: { pathname: "/attractions", parameter: "q" },
  restaurants: { pathname: "/restaurants", parameter: "q" },
  accommodations: { pathname: "/accommodations", parameter: "q" },
  stories: { pathname: "/stories", parameter: "search" },
};

export function buildHomepageSearchHref(category: HomepageSearchCategory, query: string) {
  const destination = destinations[category];
  const params = new URLSearchParams();
  const normalized = query.trim();
  if (normalized) params.set(destination.parameter, normalized);
  const search = params.toString();
  return `${destination.pathname}${search ? `?${search}` : ""}`;
}
```

The form uses `useRouter().push()`, a visible Thai label, 44px controls, a real select, and a submit button with a search icon.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npx vitest run tests/unit/homepage-search.test.tsx`

Expected: all URL and submit tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/homepage/HomepageSearch.tsx tests/unit/homepage-search.test.tsx
git commit -m "feat: add functional homepage search"
```

### Task 2: Hero And Quick Discovery

**Files:**
- Create: `components/homepage/HomepageQuickActions.tsx`
- Modify: `components/homepage/sections/HomepageHero.tsx`
- Modify: `components/homepage/homepage.tsx`

**Interfaces:**
- Consumes: `HomepageSearch` from Task 1.
- Produces: one-image `HomepageHero` retaining the existing settings prop shape.
- Produces: `HomepageQuickActions()` with real route links.

- [ ] **Step 1: Add hero/quick-action assertions to the search test**

Assert one `h1`, search landmark visibility, and links to `/attractions`, `/restaurants`, `/accommodations`, `/routes`, and `/stories`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run tests/unit/homepage-search.test.tsx`

Expected: quick actions and new heading are absent.

- [ ] **Step 3: Implement the approved composition**

Use one responsive image, `priority` only on that image, literal heading `เที่ยวยะลาให้ลึกกว่าเดิม`, real actions, and the Task 1 search form. Remove the collage, animated dot, three-province row, decorative SVG background, and `dangerouslySetInnerHTML` heading.

Quick actions are static real links with Phosphor icons:

```tsx
const actions = [
  ["/attractions", "สถานที่"],
  ["/restaurants", "ร้านอาหาร"],
  ["/accommodations", "ที่พัก"],
  ["/routes", "เส้นทาง"],
  ["/stories", "เรื่องราว"],
] as const;
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npx vitest run tests/unit/homepage-search.test.tsx && npm run typecheck`

Expected: pass with no type errors.

- [ ] **Step 5: Commit**

```bash
git add components/homepage/HomepageQuickActions.tsx components/homepage/sections/HomepageHero.tsx components/homepage/homepage.tsx tests/unit/homepage-search.test.tsx
git commit -m "feat: redesign homepage hero and discovery entry"
```

### Task 3: Real Discovery Workspace

**Files:**
- Create: `components/homepage/sections/HomepageDiscoveryWorkspace.tsx`
- Create: `tests/unit/homepage-discovery.test.tsx`
- Modify: `types/tourism.ts`
- Modify: `lib/repositories/public-content.repository.ts`
- Modify: `components/homepage/homepage.tsx`

**Interfaces:**
- Extends `AttractionCard` with `latitude?: number | null` and `longitude?: number | null`.
- Produces: `HomepageDiscoveryWorkspace({ attractions, routes })`.
- Consumes: `PublicRouteCard[]` and CMS-ordered `AttractionCard[]`.

- [ ] **Step 1: Write failing behavior tests**

Cover category filtering, six-card maximum, rating shown only with a positive review count, Thai missing-image state, route links, coordinate-aware Google Maps link, and `/attractions` fallback when coordinates are missing.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npx vitest run tests/unit/homepage-discovery.test.tsx`

Expected: component missing.

- [ ] **Step 3: Extend the public card mapping**

Add `latitude, longitude` to the public listing select and map finite values to optional card fields. Do not change publication, live-province, search, featured-order, thumbnail, or review-summary behavior.

- [ ] **Step 4: Implement the workspace**

Desktop grid: `240px minmax(0,1fr) 280px`. Mobile stacks attraction grid, Passport band, routes, and map context. Use category filters derived from returned cards rather than hardcoded province tabs. Planning links point to `/attractions`, `/routes`, `/passport`, and `/leaderboard`. A lazy Google Maps embed or external map link is rendered only from real finite coordinates; otherwise show a clear `/attractions` fallback.

- [ ] **Step 5: Run focused tests and typecheck**

Run: `npx vitest run tests/unit/homepage-discovery.test.tsx tests/unit/public-dto.test.ts && npm run typecheck`

Expected: pass; repository DTO tests confirm coordinates and existing rating behavior.

- [ ] **Step 6: Commit**

```bash
git add components/homepage/sections/HomepageDiscoveryWorkspace.tsx components/homepage/homepage.tsx lib/repositories/public-content.repository.ts types/tourism.ts tests/unit/homepage-discovery.test.tsx tests/unit/public-dto.test.ts
git commit -m "feat: add homepage discovery workspace"
```

### Task 4: Journey And Unchanged Statistics

**Files:**
- Modify: `components/homepage/sections/HomepageHowItWorks.tsx`
- Modify: `components/homepage/sections/HomepageDashboardPreview.tsx`
- Modify: `components/homepage/homepage.tsx`

**Interfaces:**
- Preserves existing `HomepageHowItWorks` settings props.
- Preserves `getPublicDashboardAnalytics({})` and KPI key lookups.

- [ ] **Step 1: Add E2E assertions for the three-step journey and statistics labels**

Assert the Thai labels for find/plan, check-in/stamp, certificate/reward, tourist profiles, visits, certificates, and satisfaction.

- [ ] **Step 2: Run the homepage E2E test and verify RED for the new journey copy**

Run: `npx playwright test tests/e2e/homepage-smoke.spec.ts --project=chromium --grep "journey"`

Expected: new journey copy absent.

- [ ] **Step 3: Implement compact sections**

Render three numbered steps in one responsive band and four analytics cells with the existing values. Replace `Live Data` and unsupported growth language with a Thai source/context note. Keep the `/dashboard` link and explicit no-data values.

- [ ] **Step 4: Run typecheck and focused browser test**

Run: `npm run typecheck && npx playwright test tests/e2e/homepage-smoke.spec.ts --project=chromium`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add components/homepage/sections/HomepageHowItWorks.tsx components/homepage/sections/HomepageDashboardPreview.tsx components/homepage/homepage.tsx tests/e2e/homepage-smoke.spec.ts
git commit -m "feat: refine homepage journey and statistics"
```

### Task 5: Stories And Passport Ending

**Files:**
- Modify: `components/homepage/sections/HomepageStories.tsx`
- Modify: `components/homepage/sections/HomepageCertificateCta.tsx`
- Modify: `components/homepage/homepage.tsx`

**Interfaces:**
- Preserves CMS story title/subtitle/button/limit.
- Preserves CMS CTA title/subtitle/description/background image where truthful.
- Replaces newsletter submit behavior with `/passport` and `/leaderboard` links.

- [ ] **Step 1: Add unit/E2E assertions**

Assert published story links, Thai empty state, Passport action, leaderboard action, and absence of an email/newsletter input.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npx playwright test tests/e2e/homepage-smoke.spec.ts --project=chromium --grep "Passport"`

Expected: current newsletter form violates the assertion.

- [ ] **Step 3: Implement editorial stories and truthful CTA**

Use one primary story plus compact supporting stories on desktop and one ordered feed on mobile. Render dates and reading time already supplied by the DTO. Remove the unverified highlights section from homepage composition. Build the final CTA from real Passport and leaderboard routes without a submit form.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm run typecheck && npx playwright test tests/e2e/homepage-smoke.spec.ts --project=chromium`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add components/homepage/sections/HomepageStories.tsx components/homepage/sections/HomepageCertificateCta.tsx components/homepage/homepage.tsx tests/e2e/homepage-smoke.spec.ts
git commit -m "feat: complete homepage stories and Passport CTA"
```

### Task 6: Public Navigation And Footer Consistency

**Files:**
- Modify: `components/layout/site-header.tsx`
- Modify: `components/layout/mobile-bottom-nav.tsx`
- Modify: `components/layout/SiteFooter.tsx`
- Modify: `tests/unit/mobile-bottom-nav.test.tsx`

**Interfaces:**
- Header search points to `/#homepage-search`.
- Footer includes only public tourist routes and Yala launch context.
- Mobile navigation keeps current route semantics and stable hook order.

- [ ] **Step 1: Extend navigation tests**

Assert five links, active-state semantics, admin suppression, and stable hook order. Add browser assertions that the fixed bottom navigation does not cover the last interactive footer item.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npx vitest run tests/unit/mobile-bottom-nav.test.tsx`

Expected: new semantic assertions fail.

- [ ] **Step 3: Implement compact navigation/footer**

Make the desktop search icon a real link, retain the certificate entry action, tighten mobile header controls, remove Pattani/Narathiwat and admin shortcuts from the public footer, add Passport/leaderboard links, and preserve safe-area padding.

- [ ] **Step 4: Run focused tests and accessibility smoke**

Run: `npx vitest run tests/unit/mobile-bottom-nav.test.tsx && npm run typecheck`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add components/layout/site-header.tsx components/layout/mobile-bottom-nav.tsx components/layout/SiteFooter.tsx tests/unit/mobile-bottom-nav.test.tsx
git commit -m "feat: align public navigation with homepage redesign"
```

### Task 7: Composition, Documentation, And Production Verification

**Files:**
- Modify: `components/homepage/homepage.tsx`
- Modify: `tests/e2e/homepage-smoke.spec.ts`
- Modify: `docs/frontend/ROUTES_STRUCTURE.md`
- Modify: `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`

**Interfaces:**
- Final order: hero/search, quick actions, discovery workspace, journey, stories, statistics, Passport CTA, footer.
- All content is visible without IntersectionObserver activation.

- [ ] **Step 1: Finalize E2E coverage**

Test 1440x1000, 768x1024, 390x844, and 375x844. Assert one `h1`, functional search navigation, real quick links, attraction navigation, zero horizontal overflow, loaded hero image, visible final CTA, and no `Image not added` or newsletter input.

- [ ] **Step 2: Update documentation**

Document final section order, search parameter mapping, CMS-controlled fields, featured attraction/route/story behavior, Yala launch scope, and unchanged statistics contract.

- [ ] **Step 3: Run static and unit checks**

Run:

```bash
git diff --check
npx eslint <all changed TS/TSX files>
npm run typecheck
npm test -- --run
```

Expected: zero errors and zero failed tests.

- [ ] **Step 4: Run production and UI verification**

Run:

```bash
npm run build
npx playwright test tests/e2e/homepage-smoke.spec.ts --project=chromium
node .agents/skills/impeccable/scripts/detect.mjs components/homepage components/layout/site-header.tsx components/layout/mobile-bottom-nav.tsx components/layout/SiteFooter.tsx
```

Expected: build and E2E pass; Impeccable reports no unresolved warnings in changed public UI files.

- [ ] **Step 5: Inspect screenshots and layout pixels**

Review desktop/tablet/mobile screenshots for text fit, stable image dimensions, real content, first-viewport hierarchy, bottom-nav clearance, and no blank observer sections. Correct visual defects before completion.

- [ ] **Step 6: Restore generated build artifacts and verify status**

Ensure `next-env.d.ts` matches the pre-build version and `.tmp/` remains untracked/untouched.

- [ ] **Step 7: Commit**

```bash
git add components/homepage components/layout/site-header.tsx components/layout/mobile-bottom-nav.tsx components/layout/SiteFooter.tsx tests/e2e/homepage-smoke.spec.ts docs/frontend/ROUTES_STRUCTURE.md docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md
git commit -m "feat: deliver production public homepage redesign"
```

---

## Self-Review Result

- Spec coverage: hero, search, quick actions, discovery, real map behavior, rewards, unchanged statistics, stories, Passport CTA, footer, CMS, empty states, responsiveness, accessibility, performance, and follow-on documentation are assigned to tasks.
- Placeholder scan: no deferred implementation markers remain in this plan.
- Type consistency: search category names, attraction coordinate fields, discovery props, and repository DTO names match across tasks.
- Scope control: other public pages are documented as follow-on work and are not redesigned in this implementation.
