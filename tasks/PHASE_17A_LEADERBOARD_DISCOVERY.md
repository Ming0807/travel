# Leaderboard discovery and visual consistency

The existing ranking, XP, privacy opt-in, three rolling periods and database code
remain present. The active editorial Home removed its older leaderboard CTA,
leaving the route difficult to find.

## Authorized implementation

- Put the primary discovery beside passport/account progress: account menu and
  profile XP section. Add lightweight secondary links beside Home's passport CTA
  and in the footer. Preserve the original primary navbar structure.
- Restyle `/leaderboard` using Home's ink, copper, forest and editorial heading;
  keep rankings as readable rows rather than a decorative trophy podium.
- Show rank numbers, public display name, level, XP, stamps and badges. Handle
  long names, mobile, empty periods, unavailable service and private participation.
- Use a scoped skeleton and short hover/focus transitions with reduced motion.
- Retain all publishing/privacy behavior and existing queries; no Home ranking
  query, image dependency, library, schema or consent changes.

Supports the Tourist and Attractions Visited dimensions through optional
engagement. Ranking is a supporting incentive, not a tourism planning metric.

## Acceptance

Account, Home, profile and footer links reach `/leaderboard`; privacy settings
remain at `/profile#leaderboard-privacy`. Period controls preserve 7/30-day rolling
semantics. Empty and failure states stay distinct. Top-100 absence never becomes
rank zero. Mobile/desktop, keyboard and reduced-motion layouts pass browser QA;
relevant privacy/UI tests, typecheck, lint and build pass before commit/push.

## Verification — 2026-09-30

- 10 focused privacy/navigation/UI test files, 61 cases passed.
- Production build with TypeScript validation passed; scoped lint passed.
- 28 browser state/viewport combinations (320–1920px), period selection,
  keyboard and reduced motion passed with no overflow or page errors.
- Reviewed mobile/desktop screenshots in `output/playwright/leaderboard`.
- No ranking query, XP formula, database, consent or dependency changes.
