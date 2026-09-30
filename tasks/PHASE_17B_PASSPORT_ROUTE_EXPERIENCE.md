# Passport and route experience

Continue the authorized public UI work using Home's cream, copper and forest
identity. Supports Tourist, Attractions Visited and Travel Behavior through
guest-friendly collection and route planning.

## Implementation

- Render the passport heading immediately and stream ownership-checked data
  through Suspense. Provide matching, accessible loading and recoverable errors.
- Make the passport cover, collection, province progress and recent visits read
  as one travel journal. Keep optional account recovery/linking available.
- Retain previously earned stamps outside the active target list, without
  duplicating active stamps or inventing collection progress.
- Improve route detail shortcuts and mobile stop layout, and reserve eager image
  loading for the hero. Use short hover/focus transitions and reduced motion.
- Preserve route publication gates, selected-trip URLs, map lazy loading, reward
  rules, ownership and privacy. No database or dependency changes.

## Acceptance

Ready, guest, linked, no-identity, error, loading and no-target passport states;
earned/unearned/historical stamps; routes with/without images/coordinates;
320–1920px layouts, keyboard, reduced motion, relevant unit/privacy tests,
lint, typecheck and production build. Update module/UI notes before commit/push.

## Verification — 2026-10-01

- Nine focused unit/privacy/publication test files, 39 cases passed.
- Scoped lint passed; TypeScript and production build passed.
- 70 synthetic state/viewport layouts (320–1920px), filter recovery, anchors,
  lazy card images, keyboard and reduced motion passed with no overflow/errors.
- Six local production layouts at 390/1440px passed for guest passport, published
  route directory and actual route details. No account/visit/certificate writes.
- Mobile/desktop passport and route screenshots reviewed in
  `output/playwright/journey`. External map tiles replaced with synthetic tiles.
- Fixed historical-only collection hiding and lifetime-stamp progress inflation.
  Passport ownership/privacy and route publication logic remain unchanged.
- No weak-network/LCP measurement or physical-presence policy change is claimed.
