# Public Discovery and Account Surfaces Redesign

Date: 2026-08-12
Status: Approved visual direction, pending implementation plan
Reference mockup: `docs/assets/public-discovery-selected-mockup.png`

## 1. Purpose

Improve the public listing and account surfaces so they feel like the same product as the redesigned homepage while remaining fast, truthful, and usable on mobile devices with weak connectivity.

The selected direction combines:

- A clear search and filter command bar.
- One image-led featured result followed by stable, scalable result cards.
- A compact trip shortlist that works without forcing sign-in.
- Strong empty, error, privacy, and identity-recovery states.

The redesign must not change attraction or story detail-page layouts that already work well.

## 2. Scope

### 2.1 In scope

1. `/attractions` as the reference implementation for public directory pages.
2. Shared public directory primitives used by `/stories`, `/routes`, `/restaurants`, and `/accommodations` where their data supports the same interaction.
3. `/leaderboard`, including truthful privacy onboarding and useful empty states.
4. `/profile`, including guest identity explanation, account recovery, leaderboard preference, and profile states.
5. Responsive desktop and mobile behavior.
6. Real data, loading, missing-image, no-result, and backend-unavailable states.

### 2.2 Out of scope

- Redesigning `/attractions/[slug]`, `/stories/[id]`, or other detail pages.
- Generating a custom tourist route automatically.
- Adding a server-side favorites schema in this phase.
- Publishing existing tourist names to the leaderboard without explicit consent.
- Fabricating ratings, opening hours, availability, or CMS content.

## 3. Visual Direction

The homepage remains the visual anchor.

### 3.1 Tokens

- Canvas: white and cool neutral backgrounds already used by the public system.
- Ink: existing near-black navy.
- Primary action: existing coral orange.
- Utility and selected state: existing deep teal.
- Corners: 6-8px for panels, cards, controls, and images.
- Borders: thin neutral dividers; shadows only where elevation communicates interaction.
- Typography: existing Thai sans-serif family and current public type scale.

### 3.2 Composition

- Compact breadcrumb and page introduction, never a second homepage hero.
- Search and filters appear before results.
- The first eligible result may become a featured result.
- Remaining results use consistent cards or compact media rows based on content density.
- Avoid nested cards, repeated marketing blocks, and decorative metrics.

## 4. Attraction Directory

### 4.1 Header and filters

The page begins with:

1. Breadcrumb.
2. Heading: `สถานที่ท่องเที่ยวในจังหวัดยะลา`.
3. One supporting sentence.
4. Search and filter toolbar containing:
   - Search text.
   - Attraction type.
   - District when reliable district data is available.
   - Open-now only when opening-hours data is structurally reliable. Otherwise omit it.
   - Active-filter chips.
   - Result count.
   - Clear-filter action.

All filter controls must be at least 44px high on touch devices. Mobile uses a single filter trigger and a separate result count rather than compressing every control into one row.

### 4.2 Featured result

The first eligible attraction becomes featured only when it has an active managed image. It displays:

- Cover image and alt text from CMS.
- Name, district, province, and controlled attraction type.
- Opening status only when the source data is valid.
- Rating only when at least one approved review exists.
- Save-to-trip action.
- Real link to the attraction detail page.

If no eligible attraction has an image, the page starts with the standard results layout rather than creating a large placeholder.

### 4.3 Standard results

- Stable image ratio and card height.
- Missing images use a branded neutral placeholder with the place name, never a fake photograph.
- Descriptions are clamped consistently.
- Rating, status, and metadata disappear cleanly when absent.
- The whole card title/image area links to the detail page, with a separate accessible save control.
- Pagination and active filters preserve each other.

## 5. Trip Shortlist

The first production version is a browser-local shortlist.

- Store selected attraction slugs in versioned `localStorage`.
- No sign-in is required.
- Do not treat the shortlist as research consent or sync it to a tourist profile.
- Allow add, remove, clear, and inspect actions.
- Desktop uses one slim panel beside results when space permits.
- Mobile uses a collapsed bar above bottom navigation without covering content.
- The primary follow-up action is `ดูเส้นทางแนะนำ`, linking to the real `/routes` page.
- Do not label the action `สร้างเส้นทาง` until an actual route composer exists.
- Announce add/remove changes with an accessible live region.

## 6. Related Directory Pages

Shared design language does not mean forcing every content type into the same card.

### 6.1 Stories

- Keep search, author-type, and category filtering.
- Use one featured story when a published story has a managed cover image.
- Use editorial media rows for remaining stories.
- Preserve `เรื่องราวของฉัน` and `แบ่งปันเรื่องราว` as real actions.

### 6.2 Routes

- Emphasize duration, stops, and route geography.
- Do not use the attraction shortlist as if it were a generated route.
- Keep route detail links explicit.

### 6.3 Restaurants and accommodations

- Use the same header, toolbar, status, pagination, and missing-image language.
- Preserve domain-specific metadata such as food category or accommodation type.

## 7. Leaderboard

### 7.1 Data truth

The public leaderboard displays only tourists whose `leaderboard_visibility` is `alias` or `display_name`.

If the privacy migration is missing, the service continues to fail closed and the UI explains that public ranking is not available yet. It must not silently imply that no XP exists.

Existing and new profiles default to `private`. No profile is opted in automatically.

### 7.2 UX states

- Public entries exist: show ranking, time range, XP, stamps, and badges.
- Current tourist is private: explain that their XP remains private and link to `/profile#leaderboard-privacy`.
- No public entries: explain privacy opt-in and provide two real actions, `ตั้งค่าการแสดงอันดับ` and `ค้นหาสถานที่สะสมคะแนน`.
- Migration/backend unavailable: show a retryable service state, not the same empty-state copy.

Required migration:

`20260811000000_add_leaderboard_privacy_preferences.sql`

## 8. Profile and Identity Recovery

### 8.1 Identity behavior

Guest profiles are tied to the anonymous-device cookie in the browser where check-in occurred. LINE in-app browser, Chrome, Safari, and incognito sessions can therefore represent different guest identities until the tourist links an account.

### 8.2 Profile states

- Ready: show travel identity, XP, stamps, badges, account links, and leaderboard privacy.
- No identity: explain browser-scoped guest identity in plain Thai and provide:
  - `เข้าสู่ระบบเพื่อค้นหาโปรไฟล์ที่เชื่อมไว้`.
  - `เริ่มเช็กอินสถานที่`.
  - A short note that changing browser/device may require account linking.
- Recoverable authenticated identity: load the linked profile without creating a duplicate.
- Error: preserve data and provide retry/support actions.

Required migration for hardened linking:

`20260811001000_harden_tourist_identity_linking.sql`

## 9. Responsive and Accessibility Requirements

- No horizontal overflow at 320px, 375px, 390px, 768px, 1024px, and 1440px.
- Bottom shortlist bar must clear mobile bottom navigation and safe-area insets.
- All controls have visible keyboard focus and accessible names.
- Save controls expose selected state through `aria-pressed`.
- Filter drawer returns focus to its trigger when closed.
- Loading uses stable skeleton dimensions.
- Motion is limited to state feedback and respects reduced-motion preferences.
- Body text and controls meet WCAG AA contrast.

## 10. Performance and Data Rules

- Continue using Next Image with accurate `sizes`.
- Use thumbnail paths for cards only when the production migration and repository support are verified.
- Do not preload below-fold result images.
- Filter and pagination remain server-side for scalable directories.
- The local shortlist hydrates without changing server-rendered layout dimensions.
- Missing media, review, and schedule data must not cause extra failing requests.

## 11. Implementation Boundaries

Expected reusable units:

- `PublicDirectoryIntro`
- `PublicDirectoryToolbar`
- `PublicActiveFilters`
- `PublicResultCount`
- `PublicMissingImage`
- `AttractionFeaturedResult`
- `AttractionResultCard`
- `TripShortlistProvider`
- `TripShortlistPanel`
- `TripShortlistBar`

Components remain domain-specific when their metadata or actions differ. Shared abstractions must remove real duplication rather than forcing unrelated page behavior together.

## 12. Verification

### 12.1 Unit and component tests

- Filter parsing and URL preservation.
- Featured-result eligibility.
- Missing-image and missing-rating behavior.
- Shortlist add/remove/clear and storage versioning.
- Leaderboard private, empty, ready, and unavailable states.
- Profile no-identity and recovery actions.

### 12.2 Browser tests

- Desktop and mobile attraction discovery.
- Search, filtering, clear, pagination, and detail navigation.
- Shortlist persistence after reload.
- Mobile shortlist bar and bottom-nav non-overlap.
- Leaderboard privacy onboarding.
- Profile ready/no-identity flows.

### 12.3 Release gate

- `git diff --check`
- Changed-file ESLint.
- Typecheck.
- Targeted unit tests during each slice.
- Public-route E2E matrix and production build after the complete batch.
- Visual screenshots at desktop and mobile sizes.

## 13. Rollout Order

1. Apply and verify the two privacy/identity migrations.
2. Build shared directory primitives and attraction listing.
3. Add the browser-local trip shortlist.
4. Harden leaderboard states and privacy onboarding.
5. Harden profile identity and recovery states.
6. Adapt stories, routes, restaurants, and accommodations to the shared visual system.
7. Run the complete public release gate and deploy.

## 14. Acceptance Criteria

- `/attractions` matches the selected final visual direction without fabricating data.
- The listing remains useful when several attractions lack images or reviews.
- Search, filters, pagination, save, and detail links work on desktop and mobile.
- The shortlist works for guests and never claims to create a route.
- Leaderboard empty state distinguishes privacy, no public entries, and service unavailability.
- Profile explains browser-scoped identity and offers real recovery actions.
- Related listing pages use a consistent visual vocabulary without changing detail pages.
- No new personal data is collected for visual or shortlist behavior.
- Tests, accessibility checks, responsive screenshots, typecheck, lint, and build pass before release.
