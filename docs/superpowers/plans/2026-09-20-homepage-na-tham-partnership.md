# Na Tham Homepage Partnership Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved Ban Na Tham working-group identity, blueprint document, Yala Rajabhat University credit, and official 360 destination to the homepage.

**Architecture:** Keep public document assets under `public/documents` and institutional marks under `public/partners`. Extend the existing server-rendered `HomepageHero` with static, accessible links and update the single external 360 constant used by the vista page.

**Tech Stack:** Next.js 16.3 App Router, React Server Components, TypeScript, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Preserve all existing homepage data and QR/check-in behavior.
- Use the approved Thai copy exactly.
- Do not add a dependency or a new client component.
- Do not modify unrelated research work in the current working tree.

---

### Task 1: Lock The Public Contract With Tests

**Files:**
- Modify: `tests/unit/homepage-hero.test.tsx`
- Create: `tests/unit/public-product-links.test.ts`

**Interfaces:**
- Consumes: `HomepageHero`, `VISTA_360_EXTERNAL_URL`
- Produces: regression coverage for the approved heading, PDF link, partner logo, and 360 URL

- [ ] Add expectations for the working-group heading, `/documents/na-tham-tourism-living-blueprint.pdf`, `/partners/yala-rajabhat-university.png`, and the two retained hero actions.
- [ ] Add a constant test expecting `https://yala360.yru.ac.th/Natham/`.
- [ ] Run the focused tests and confirm they fail before implementation.

### Task 2: Add Approved Public Assets

**Files:**
- Create: `public/documents/na-tham-tourism-living-blueprint.pdf`
- Create: `public/partners/yala-rajabhat-university.png`

**Interfaces:**
- Produces: stable same-origin URLs consumed by `HomepageHero`

- [ ] Copy the user-supplied PDF without recompression.
- [ ] Download the official university logo from the Yala Rajabhat University website.
- [ ] Inspect the logo and verify both files are non-empty.

### Task 3: Implement Hero And 360 Changes

**Files:**
- Modify: `components/homepage/sections/HomepageHero.tsx`
- Modify: `components/homepage/homepage.tsx`
- Modify: `constants/product.ts`

**Interfaces:**
- Consumes: the stable public asset paths from Task 2
- Produces: responsive working-group CTA and centralized official 360 destination

- [ ] Replace only the retired hero copy while preserving valid future CMS titles.
- [ ] Add the third PDF action and institutional credit below the action group.
- [ ] Update the homepage fallback title and `VISTA_360_EXTERNAL_URL`.
- [ ] Run focused tests until they pass.

### Task 4: Production Verification

**Files:**
- Verify all files from Tasks 1-3

**Interfaces:**
- Produces: release evidence

- [ ] Run ESLint on touched TypeScript/TSX files.
- [ ] Run `pnpm run typecheck`.
- [ ] Run the production build.
- [ ] Run `git diff --check` and inspect the final diff before committing.

