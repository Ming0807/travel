# Restaurant Market Street Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved concept B restaurant directory with truthful controlled categories, compact result rows, and responsive desktop/mobile layouts.

**Architecture:** Keep the page and repository server-driven. Add one pure grouping module and restaurant-specific presentation components so accommodation cards remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Do not change restaurant detail routes or database schema.
- Do not fabricate ratings, hours, amenities, category totals, districts, or images.
- Preserve server-side query, exact food-type filter, province validation, pagination, empty states, and unavailable states.
- Keep 44px touch targets and Thai-first copy.

---

### Task 1: Directory Domain Model

**Files:**
- Create: `lib/hospitality/restaurant-directory.ts`
- Test: `tests/unit/restaurant-directory.test.ts`

- [ ] Write tests proving known food types enter the correct editorial band, unknown values remain visible, and source order is stable.
- [ ] Implement `groupRestaurantsForDirectory(items)` and controlled band metadata.
- [ ] Run the focused test and ESLint.

### Task 2: Restaurant Presentation Components

**Files:**
- Create: `components/restaurants/RestaurantCategoryNav.tsx`
- Create: `components/restaurants/RestaurantDirectoryItem.tsx`
- Test: `tests/unit/restaurant-directory-ui.test.tsx`

- [ ] Test active category semantics, real detail links, managed media, missing-media labels, and the absence of fake decision fields.
- [ ] Implement the horizontal category navigator and compact result row.
- [ ] Run focused tests and ESLint.

### Task 3: Page Composition

**Files:**
- Modify: `app/(public)/restaurants/page.tsx`
- Modify: `components/restaurants/RestaurantFilterBar.tsx`
- Modify: `tests/unit/public-hospitality-discovery.test.tsx`

- [ ] Replace the featured-plus-card-grid composition with category navigation, desktop category rail, grouped result bands, pagination, and the existing CTA.
- [ ] Keep mobile filter disclosure and make the desktop filter row compact.
- [ ] Run the restaurant and hospitality test set.

### Task 4: Visual Release Gate

**Files:**
- Modify: `docs/frontend/ROUTES_STRUCTURE.md`
- Modify: `docs/frontend/UI_UX_PRINCIPLES.md`

- [ ] Run `git diff --check`, changed-file ESLint, `npm run typecheck`, targeted Vitest, and Impeccable detection.
- [ ] Start the local app and capture desktop/mobile screenshots.
- [ ] Fix visual overflow or hierarchy regressions found in the screenshots.
- [ ] Run a production build if shared public components or routing changed.
