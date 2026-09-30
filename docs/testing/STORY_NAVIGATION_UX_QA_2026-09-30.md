# Story moderation, publishing and public navigation QA

Supports tourist engagement, travel behavior context and attraction discovery.

## Acceptance

- A tourist submission stays unpublished and explains that website admins review it.
- `/admin` includes submitted, reviewing and approved-but-unpublished traveler stories;
  its link, paginated library filter and export use the same actionable statuses.
- A team publisher can publish a ready draft or an existing in-review team article.
- Editors without publish rights see the team handoff; tourist moderation cannot be skipped.
- Missing publication requirements are visible before attempting publication.
- Edited metadata plus a workflow command is one version-checked revision and audit;
  content edits also require update permission. Network errors remain retryable.
- Existing Thai slugs do not block readiness; new submissions use unique neutral URLs.
- Team story creation generates a Thai/English link from the title; manual overrides
  remain editable and existing links are preserved when titles change.
- Empty search fields use title/excerpt defaults with a live preview, allow overrides
  and reset, and persist actual SEO values during approval/publication/scheduling.
- Library search applies on typing/Enter, retains moderation filters, resets pagination
  and cancels pending work when cleared or unmounted; IME composition is respected.
- Navbar handles guests, long authenticated names and avatars without overlapping links.
- Mobile account/discovery menus fit the viewport and support keyboard and pointer dismissal.

## Local evidence

`tests/visual/story-navigation/browser-qa.mjs` checked 33 header layouts (guest,
long name, avatar) across 320/360/390/480/700/768/1024/1240/1280/1440/1920px.
It checked the actual editor at 360/768/1440px, direct draft publication, moderation
start, restricted editor handoff, automatic search preview/default persistence and missing-cover blocking. No horizontal overflow,
header overlaps, offscreen account dropdowns or browser page errors were observed.
Screenshots are generated under `output/playwright/story-navigation`.

The browser fixture uses synthetic auth/data/action responses; it confirms UI
behavior, not a live Supabase transaction or real account sign-off. Service/action
unit tests cover readiness, moderation, publication permission denial, metadata
permission checks and transaction requests. No migration or production publication
was performed. See the fixture README for repeatable review commands.

The story-focused Vitest run passed 45 files / 230 tests, including creation-link and
search-default regression tests. Navigation, operations and export regressions passed
7 files / 51 tests; the final search-input run passed 3 tests (clear, Enter and IME/unmount).
Type checking passed.
The production build passed. Lint returned no errors, with one existing warning
in the unrelated `tests/visual/dashboard/research-browser-qa.js` fixture.
