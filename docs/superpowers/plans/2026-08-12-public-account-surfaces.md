# Public Account Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make leaderboard and profile states truthful, privacy-safe, recoverable, and visually consistent with the selected public design.

**Architecture:** Preserve fail-closed leaderboard access and browser-scoped guest identity. Add explicit service result states so the UI can distinguish no public participants from missing schema/service failure, then rebuild account empty/recovery surfaces around real actions.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase service-role repositories, Zod, Vitest, Testing Library, Playwright.

## Global Constraints

- Never publish a tourist name without `leaderboard_visibility` opt-in.
- Existing and new tourists remain `private` by default.
- Do not create a new tourist profile from a read-only profile or leaderboard request.
- Do not merge guest and authenticated identities without the existing confirmation flow.
- Keep Thai-first copy and 44px controls.
- Required migrations remain explicit; UI must be safe before they are applied.
- Detail/content pages are out of scope.

---

### Task 1: Leaderboard Result States

**Files:**
- Modify: `lib/services/xp.service.ts`
- Create: `lib/services/leaderboard.service.ts`
- Modify: `tests/unit/leaderboard-privacy.test.ts`
- Create: `tests/unit/leaderboard-service-state.test.ts`

**Interfaces:**
- Produces `getPublicLeaderboard(period, limit, currentTouristId): Promise<{ kind: "ready"; entries: LeaderboardEntry[] } | { kind: "schema_unavailable" } | { kind: "error" }>`.
- `ready` with an empty array means the schema exists but nobody has opted in.

- [ ] **Step 1: Write failing state tests**

```ts
expect(await getPublicLeaderboard("all_time", 100)).toEqual({ kind: "schema_unavailable" });
expect(await getPublicLeaderboard("all_time", 100)).toEqual({ kind: "ready", entries: [] });
```

Use separate mocked Supabase responses for missing-column and successful-empty cases.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/leaderboard-service-state.test.ts tests/unit/leaderboard-privacy.test.ts`
Expected: FAIL because result states do not exist.

- [ ] **Step 3: Implement explicit states**

Keep aggregation in `xp.service.ts`; the wrapper maps only known missing-schema errors to `schema_unavailable`, successful results to `ready`, and unexpected failures to `error` without exposing database messages.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run tests/unit/leaderboard-service-state.test.ts tests/unit/leaderboard-privacy.test.ts`

```bash
git add lib/services/xp.service.ts lib/services/leaderboard.service.ts tests/unit/leaderboard-service-state.test.ts tests/unit/leaderboard-privacy.test.ts
git commit -m "fix: distinguish leaderboard data states"
```

### Task 2: Leaderboard UX

**Files:**
- Modify: `app/(public)/leaderboard/page.tsx`
- Modify: `components/badges/LeaderboardContent.tsx`
- Modify: `components/badges/LeaderboardTable.tsx`
- Modify: `tests/unit/leaderboard-ui.test.tsx`
- Modify: `tests/e2e/leaderboard.spec.ts`

**Interfaces:**
- Consumes leaderboard result states and current privacy preference.

- [ ] **Step 1: Write failing state-copy tests**

Assert separate Thai copy and actions for `schema_unavailable`, `ready` empty, private current tourist, and populated results. `schema_unavailable` must not say nobody has points.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/leaderboard-ui.test.tsx`
Expected: FAIL against the single current empty state.

- [ ] **Step 3: Implement the selected public visual language**

Use compact intro, one privacy explanation, time-range tabs, table/list, and contextual actions. Empty-ready actions are `ตั้งค่าการแสดงอันดับ` and `ค้นหาสถานที่สะสมคะแนน`. Schema-unavailable action is retry plus a concise service notice.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run tests/unit/leaderboard-ui.test.tsx`
Run: `npx playwright test tests/e2e/leaderboard.spec.ts --workers=1`

```bash
git add app/(public)/leaderboard/page.tsx components/badges tests/unit/leaderboard-ui.test.tsx tests/e2e/leaderboard.spec.ts
git commit -m "feat: rebuild public leaderboard states"
```

### Task 3: Profile Identity State Model

**Files:**
- Create: `lib/services/profile-page.service.ts`
- Modify: `lib/services/profile.service.ts`
- Modify: `app/(tourist)/profile/page.tsx`
- Create: `tests/unit/profile-page-state.test.ts`

**Interfaces:**
- Produces `loadProfilePage(): Promise<ProfilePageResult>` where result is `ready`, `no_identity`, or `error`.
- The loader resolves only; it never creates a profile.

- [ ] **Step 1: Write failing tests**

Cover anonymous cookie identity, authenticated linked identity, missing identity, and unexpected repository error. Assert no create/link repository method is called.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/profile-page-state.test.ts`
Expected: FAIL because the page state service does not exist.

- [ ] **Step 3: Extract and implement the loader**

Move page orchestration into the service while preserving `TouristAccessError("TOURIST_IDENTITY_NOT_FOUND")` mapping. Keep badge-definition loading read-only.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run tests/unit/profile-page-state.test.ts`

```bash
git add lib/services/profile-page.service.ts lib/services/profile.service.ts app/(tourist)/profile/page.tsx tests/unit/profile-page-state.test.ts
git commit -m "refactor: model tourist profile page states"
```

### Task 4: Profile Recovery and Privacy UX

**Files:**
- Modify: `app/(tourist)/profile/page.tsx`
- Modify: `components/profile/TouristProfileView.tsx`
- Modify: `components/profile/LeaderboardPrivacyForm.tsx`
- Create: `components/profile/ProfileNoIdentity.tsx`
- Modify: `tests/unit/tourist-profile-view.test.tsx`
- Modify: `tests/e2e/public-route-matrix.spec.ts`

**Interfaces:**
- Consumes `ProfilePageResult` and existing auth/link routes.

- [ ] **Step 1: Write failing UX tests**

Assert no-identity copy explains browser/device scope and renders real links to `/auth/login?next=%2Fprofile` and `/attractions`. Assert leaderboard privacy options remain private/alias/display name and alias input appears only for alias.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run tests/unit/tourist-profile-view.test.tsx`
Expected: FAIL for the new recovery copy and component.

- [ ] **Step 3: Implement profile states**

Use the selected public panel geometry and typography. Keep the ready profile information architecture, but improve section rhythm, leaderboard onboarding, account-link explanation, and mobile ordering. Do not show fake passport content.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run tests/unit/tourist-profile-view.test.tsx tests/unit/profile-page-state.test.ts`
Run: `npx playwright test tests/e2e/public-route-matrix.spec.ts --grep "profile" --workers=1`

```bash
git add app/(tourist)/profile/page.tsx components/profile tests/unit/tourist-profile-view.test.tsx tests/e2e/public-route-matrix.spec.ts
git commit -m "feat: improve tourist profile recovery"
```

### Task 5: Account Release Gate and Migration Guidance

**Files:**
- Modify: `docs/database/SUPABASE_SCHEMA_CHECKLIST.md`
- Modify: `docs/frontend/ROUTES_STRUCTURE.md`
- Modify: related tests only when intentional behavior changed.

- [ ] **Step 1: Document production prerequisites**

Document both migrations and verification behavior:

- `20260811000000_add_leaderboard_privacy_preferences.sql`
- `20260811001000_harden_tourist_identity_linking.sql`

State that migration one defaults all profiles to private and therefore does not automatically populate the public leaderboard.

- [ ] **Step 2: Run targeted and bounded checks**

Run: `git diff --check`
Run: `npm run typecheck`
Run: changed-file ESLint.
Run: leaderboard and profile unit tests.
Run: `npx playwright test tests/e2e/leaderboard.spec.ts tests/e2e/public-route-matrix.spec.ts --workers=1`
Run once: `npm run build`.

- [ ] **Step 3: Capture visual evidence**

Capture desktop/mobile leaderboard plus profile ready/no-identity states. Verify privacy copy, focus order, no overflow, and mobile bottom-navigation clearance.

- [ ] **Step 4: Commit**

```bash
git add docs/database/SUPABASE_SCHEMA_CHECKLIST.md docs/frontend/ROUTES_STRUCTURE.md tests
git commit -m "docs: close public account release gate"
```
