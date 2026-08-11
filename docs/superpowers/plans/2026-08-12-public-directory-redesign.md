# Public Directory Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild public listing pages around the approved attraction-directory design while preserving real server-side filters, pagination, truthful metadata, and existing detail pages.

**Architecture:** Add a small set of shared public directory primitives, then keep attraction, story, route, restaurant, and accommodation cards domain-specific. Add a versioned browser-local trip shortlist for attraction slugs only; it never writes research or profile data and links to the real recommended-routes page rather than claiming to compose a route.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Supabase repositories, Vitest, Testing Library, Playwright.

## Global Constraints

- Keep the homepage header, color tokens, typography, 6-8px radii, and public bottom navigation unchanged.
- Do not redesign any `[slug]` or `[id]` detail page.
- Never fabricate ratings, opening hours, availability, images, route matches, or CMS content.
- Controls are at least 44px high and meet WCAG AA contrast.
- `/attractions`, hospitality pages, and stories keep server-side filtering and pagination.
- Long-running aggregate checks get one bounded attempt; targeted tests remain mandatory for every task.
- Do not add dependencies or a new database migration.

---

### Task 1: Shared Directory Primitives

**Files:**
- Create: `components/public/directory/PublicDirectoryIntro.tsx`
- Create: `components/public/directory/PublicDirectoryToolbar.tsx`
- Create: `components/public/directory/PublicMissingImage.tsx`
- Create: `components/public/directory/PublicResultSummary.tsx`
- Modify: `components/public/PublicPageFrame.tsx`
- Test: `tests/unit/public-directory-primitives.test.tsx`

**Interfaces:**
- Produces: `PublicDirectoryIntro`, `PublicDirectoryToolbar`, `PublicMissingImage`, and `PublicResultSummary` for later tasks.
- `PublicDirectoryToolbar` consumes a native `<form>` body through `children` and renders an optional mobile filter trigger without owning URL state.

- [ ] **Step 1: Write failing component tests**

```tsx
expect(render(<PublicMissingImage label="เขื่อนบางลาง" />).getByText("ยังไม่มีภาพของเขื่อนบางลาง")).toBeVisible();
expect(render(<PublicResultSummary count={11} noun="สถานที่" />).getByText("พบ 11 สถานที่")).toBeVisible();
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/public-directory-primitives.test.tsx`
Expected: FAIL because the directory components do not exist.

- [ ] **Step 3: Implement focused primitives**

```tsx
export function PublicResultSummary({ count, noun }: { count: number; noun: string }) {
  return <p aria-live="polite" className="text-sm font-semibold text-black/65">พบ {count.toLocaleString("th-TH")} {noun}</p>;
}
```

`PublicMissingImage` must use a neutral `aspect-[4/3]` surface, image icon, and the supplied label. `PublicDirectoryIntro` owns breadcrumb, title, description, and optional scope text. `PublicDirectoryToolbar` owns only layout and responsive disclosure affordances.

- [ ] **Step 4: Verify GREEN and accessibility**

Run: `npm test -- --run tests/unit/public-directory-primitives.test.tsx && npx eslint components/public/directory tests/unit/public-directory-primitives.test.tsx`
Expected: PASS with zero lint errors.

- [ ] **Step 5: Commit**

```bash
git add components/public/directory components/public/PublicPageFrame.tsx tests/unit/public-directory-primitives.test.tsx
git commit -m "feat: add public directory primitives"
```

### Task 2: Guest Trip Shortlist

**Files:**
- Create: `lib/trip-shortlist/storage.ts`
- Create: `components/trip-shortlist/TripShortlistProvider.tsx`
- Create: `components/trip-shortlist/TripShortlistButton.tsx`
- Create: `components/trip-shortlist/TripShortlistPanel.tsx`
- Create: `components/trip-shortlist/TripShortlistBar.tsx`
- Test: `tests/unit/trip-shortlist.test.tsx`

**Interfaces:**
- Produces: `useTripShortlist()`, `TripShortlistButton`, `TripShortlistPanel`, and `TripShortlistBar`.
- Stored value: `{ version: 1, slugs: string[] }` under `southern-border-trip-shortlist`.
- Maximum: 20 unique non-empty slugs; malformed storage returns an empty list.

- [ ] **Step 1: Write failing storage and interaction tests**

```ts
expect(parseTripShortlist('{"version":1,"slugs":["a","a","b"]}')).toEqual(["a", "b"]);
expect(parseTripShortlist('{"version":2,"slugs":["a"]}')).toEqual([]);
```

```tsx
await user.click(screen.getByRole("button", { name: "บันทึกสกายวอล์คอัยเยอร์เวง" }));
expect(screen.getByRole("button", { name: "นำสกายวอล์คอัยเยอร์เวงออกจากทริป" })).toHaveAttribute("aria-pressed", "true");
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/trip-shortlist.test.tsx`
Expected: FAIL because shortlist modules do not exist.

- [ ] **Step 3: Implement versioned storage and provider**

```ts
export const TRIP_SHORTLIST_KEY = "southern-border-trip-shortlist";
export const TRIP_SHORTLIST_LIMIT = 20;
export function parseTripShortlist(raw: string | null): string[];
export function serializeTripShortlist(slugs: string[]): string;
```

The provider hydrates after mount, keeps server and first-client layout stable, exposes `has`, `toggle`, `remove`, and `clear`, and announces changes through one `aria-live="polite"` region.

- [ ] **Step 4: Implement truthful UI**

`TripShortlistPanel` lists only attraction records passed by the page and links its primary action to `/routes` with label `ดูเส้นทางแนะนำ`. `TripShortlistBar` uses `env(safe-area-inset-bottom)` and clears the public bottom-navigation height on mobile.

- [ ] **Step 5: Verify GREEN**

Run: `npm test -- --run tests/unit/trip-shortlist.test.tsx && npx eslint lib/trip-shortlist components/trip-shortlist tests/unit/trip-shortlist.test.tsx`
Expected: PASS with zero lint errors.

- [ ] **Step 6: Commit**

```bash
git add lib/trip-shortlist components/trip-shortlist tests/unit/trip-shortlist.test.tsx
git commit -m "feat: add guest trip shortlist"
```

### Task 3: Attraction Repository and Featured Eligibility

**Files:**
- Modify: `lib/repositories/public-content.repository.ts`
- Create: `lib/attractions/featured-result.ts`
- Modify: `tests/unit/public-attractions-listing.test.ts`
- Create: `tests/unit/attraction-featured-result.test.ts`

**Interfaces:**
- Produces: `selectFeaturedAttraction(items: PublicAttractionCard[]): PublicAttractionCard | null`.
- Featured requires a non-empty managed image URL; no rating or opening-hours requirement.

- [ ] **Step 1: Write failing eligibility tests**

```ts
expect(selectFeaturedAttraction([withoutImage, withImage])).toEqual(withImage);
expect(selectFeaturedAttraction([withoutImage])).toBeNull();
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/attraction-featured-result.test.ts tests/unit/public-attractions-listing.test.ts`
Expected: FAIL because the selector does not exist.

- [ ] **Step 3: Implement selector and preserve repository truth**

The selector is pure. Repository mapping must continue returning `rating: null` and `reviewCount: 0` when no approved reviews exist. Do not add schedule fields unless already selected from a validated schedule model.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- --run tests/unit/attraction-featured-result.test.ts tests/unit/public-attractions-listing.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/repositories/public-content.repository.ts lib/attractions/featured-result.ts tests/unit/attraction-featured-result.test.ts tests/unit/public-attractions-listing.test.ts
git commit -m "refactor: define featured attraction eligibility"
```

### Task 4: Attraction Listing Redesign

**Files:**
- Modify: `app/(public)/attractions/page.tsx`
- Modify: `components/attractions/AttractionDiscoveryFilters.tsx`
- Modify: `components/attractions/AttractionDiscoveryCard.tsx`
- Create: `components/attractions/AttractionFeaturedResult.tsx`
- Create: `components/attractions/AttractionDirectoryClient.tsx`
- Modify: `tests/unit/attraction-discovery-ui.test.tsx`
- Modify: `tests/e2e/attractions-filters.spec.ts`
- Modify: `tests/e2e/public-attractions.spec.ts`

**Interfaces:**
- Consumes shared directory primitives, featured selector, and trip shortlist.
- `AttractionDirectoryClient` receives only serialized page items and selected featured slug; server filtering/pagination remains in the page.

- [ ] **Step 1: Add failing UI tests**

Assert that the result count, featured destination, missing-image copy, save controls, clear filters, and real detail links render. Assert no `สร้างเส้นทาง` copy exists.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/attraction-discovery-ui.test.tsx`
Expected: FAIL against the old listing composition.

- [ ] **Step 3: Implement the approved desktop composition**

Use `PublicDirectoryIntro`, one command toolbar, `AttractionFeaturedResult`, a three-column standard result grid, and one slim `TripShortlistPanel`. Do not render a large featured placeholder when no image is available.

- [ ] **Step 4: Implement mobile behavior**

Mobile uses one filter disclosure, one-column compact cards, 44px save buttons, and `TripShortlistBar` above bottom navigation. Text must not overlap at 320px.

- [ ] **Step 5: Verify component and browser behavior**

Run: `npm test -- --run tests/unit/attraction-discovery-ui.test.tsx tests/unit/public-attractions-listing.test.ts`
Run: `npx playwright test tests/e2e/attractions-filters.spec.ts tests/e2e/public-attractions.spec.ts --workers=1`
Expected: unit and E2E tests pass.

- [ ] **Step 6: Run visual detector and commit**

Run: `node .agents/skills/impeccable/scripts/detect.mjs app/(public)/attractions/page.tsx components/attractions/AttractionDiscoveryFilters.tsx components/attractions/AttractionDiscoveryCard.tsx components/attractions/AttractionFeaturedResult.tsx components/attractions/AttractionDirectoryClient.tsx`

```bash
git add app/(public)/attractions components/attractions tests/unit/attraction-discovery-ui.test.tsx tests/e2e/attractions-filters.spec.ts tests/e2e/public-attractions.spec.ts
git commit -m "feat: redesign public attraction discovery"
```

### Task 5: Story Listing Adaptation

**Files:**
- Modify: `app/(public)/stories/page.tsx`
- Modify: `components/stories/PublicStoryCard.tsx`
- Create: `components/stories/PublicFeaturedStory.tsx`
- Modify: `tests/unit/public-stories.test.tsx`
- Modify: `tests/unit/public-story-card.test.tsx`
- Modify: `tests/e2e/public-stories.spec.ts`

**Interfaces:**
- Consumes shared directory intro, toolbar, result summary, and missing-image components.
- Does not consume the attraction trip shortlist.

- [ ] **Step 1: Write failing tests for featured and no-cover states**

Featured selection requires a managed cover image. Preserve `เรื่องราวของฉัน` and `แบ่งปันเรื่องราว` links.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/public-stories.test.tsx tests/unit/public-story-card.test.tsx`
Expected: FAIL for the new composition.

- [ ] **Step 3: Implement editorial listing without changing detail rendering**

Use one featured story plus stable story cards/media rows. Keep current server query, author, topic, pagination, and empty/error semantics.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run tests/unit/public-stories.test.tsx tests/unit/public-story-card.test.tsx`
Run: `npx playwright test tests/e2e/public-stories.spec.ts --workers=1`

```bash
git add app/(public)/stories/page.tsx components/stories tests/unit/public-stories.test.tsx tests/unit/public-story-card.test.tsx tests/e2e/public-stories.spec.ts
git commit -m "feat: align public story discovery"
```

### Task 6: Routes and Hospitality Listing Adaptation

**Files:**
- Modify: `app/(public)/routes/page.tsx`
- Modify: `components/routes/PublicRouteCard.tsx`
- Modify: `app/(public)/restaurants/page.tsx`
- Modify: `app/(public)/accommodations/page.tsx`
- Modify: `components/hospitality/HospitalityDiscoveryCard.tsx`
- Modify: `tests/unit/public-routes-vista.test.tsx`
- Modify: `tests/unit/public-hospitality-ui.test.tsx`
- Modify: `tests/unit/public-hospitality-card.test.tsx`
- Modify: `tests/e2e/public-routes-vista.spec.ts`
- Modify: `tests/e2e/public-hospitality.spec.ts`

**Interfaces:**
- Consumes shared directory primitives.
- Preserves route days/stops, restaurant food type, and accommodation type rather than forcing attraction metadata.

- [ ] **Step 1: Write failing page-family consistency tests**

Assert the shared intro/summary vocabulary, truthful empty/error states, and real detail links across all three list types.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/public-routes-vista.test.tsx tests/unit/public-hospitality-ui.test.tsx tests/unit/public-hospitality-card.test.tsx`
Expected: FAIL for new shared primitives and hierarchy.

- [ ] **Step 3: Adapt each listing without changing detail pages**

Routes emphasize duration/stops. Restaurants retain food filters. Accommodations retain type filters. All use the same page rhythm, missing-image language, result summary, and pagination treatment.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run tests/unit/public-routes-vista.test.tsx tests/unit/public-hospitality-ui.test.tsx tests/unit/public-hospitality-card.test.tsx`
Run: `npx playwright test tests/e2e/public-routes-vista.spec.ts tests/e2e/public-hospitality.spec.ts --workers=1`

```bash
git add app/(public)/routes/page.tsx app/(public)/restaurants/page.tsx app/(public)/accommodations/page.tsx components/routes/PublicRouteCard.tsx components/hospitality/HospitalityDiscoveryCard.tsx tests
git commit -m "feat: align public directory pages"
```

### Task 7: Directory Release Gate

**Files:**
- Modify: `docs/frontend/ROUTES_STRUCTURE.md`
- Modify: `docs/modules/MODULE_01_PUBLIC_ATTRACTIONS.md`
- Modify: affected Playwright snapshots or assertions only when behavior intentionally changed.

- [ ] **Step 1: Update documentation**

Document shared directory primitives, browser-local shortlist behavior, no server sync, and unchanged detail routes.

- [ ] **Step 2: Run bounded release checks**

Run: `git diff --check`
Run: `npm run typecheck`
Run: changed-file ESLint.
Run: targeted unit files from Tasks 1-6.
Run once with a 5-minute bound: `npm test -- --run`
Run once: `npm run build`
Run: `npx playwright test tests/e2e/public-attractions.spec.ts tests/e2e/attractions-filters.spec.ts tests/e2e/public-stories.spec.ts tests/e2e/public-routes-vista.spec.ts tests/e2e/public-hospitality.spec.ts --workers=1`

If the aggregate unit command exceeds the bound without a reported failure, stop that command, record the timeout, and continue with build/E2E. Do not skip targeted tests.

- [ ] **Step 3: Capture visual evidence**

Capture 1440x1000 and 390x844 screenshots for `/attractions`, `/stories`, `/routes`, `/restaurants`, and `/accommodations`. Verify no overflow, content overlap, clipped controls, or bottom-nav collision.

- [ ] **Step 4: Commit documentation and gate fixes**

```bash
git add docs/frontend/ROUTES_STRUCTURE.md docs/modules/MODULE_01_PUBLIC_ATTRACTIONS.md tests
git commit -m "test: close public directory release gate"
```
