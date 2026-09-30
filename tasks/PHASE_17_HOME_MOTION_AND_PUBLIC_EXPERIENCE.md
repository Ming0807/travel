# Home motion and public experience

Authorized scope: implement Home first, keep the existing navbar design, improve
account and attraction UX in parallel, and audit scan/certificate eligibility.

## Home design

Keep the photographic cream/copper/forest identity. Use the reference site's
clear timing and responsive feedback rather than copying its artwork.

1. Hero: a short, interruptible text entrance; imagery settles once. Content is
   visible before JavaScript and interaction never waits for animation.
2. Discovery and destination cards: once-only, bounded stagger on entering the
   viewport; pointer hover reveals depth and arrow direction. No perpetual loop.
3. Loading: stream the hero before lower-page queries finish; reserve real layout
   geometry with a quiet skeleton. No artificial delays or full-page overlay.
4. Routes: prioritize eligible CMS selections and fill missing slots with other
   published, active routes in live destinations. Show real route cards, itinerary
   metadata, and an optional map for a selected route. Load map data and Leaflet
   only when requested. Keep a link to all routes.
5. Accessibility: reduced motion disables entrances and hover travel; controls
   work with keyboard and touch. Missing images, empty routes and network errors
   remain readable and actionable.

## Performance and data constraints

- No animation dependency, canvas, scroll listener, forced GPS or extra personal data.
- Keep public publishing and destination gates; never publish a draft to fill UI.
- Cache public map response briefly; return only public itinerary fields.
- Cap Home cards at three; bound fallback query to the public directory limit.
- Defer public analytics separately so it cannot block primary content.
- Verify data failures, reduced motion, no-JS content, mobile overflow, on-demand
  map loading, typing/build and relevant regressions before commit/push.

## Next phases

Apply the same motion tokens to public listing/detail pages after Home validation.
Use actual navigation/data pending states, optimize galleries and lazy maps, then
measure production Core Web Vitals before adding further decorative motion.

## Core dimensions

Home route discovery and attraction pages support Attractions Visited and Travel
Behavior. Secure check-in improves visit data quality; account journeys reconnect
the Tourist with existing visits, stamps and certificates.

## Delivery verification — 2026-09-30

- Home, profile/account and attraction UX implemented; original navbar shell kept.
- Combined focused regression: 42 files / 287 cases passed. Final changed Home
  regression: 3 files / 10 cases passed (overlapping coverage, not additive).
- Production build and typecheck passed. ESLint has zero errors and one existing
  warning in the unrelated dashboard browser fixture.
- Browser fixtures: header 42 layouts, profile 12, attractions 40, Home 6 plus
  6 skeleton layouts. Home hover/focus, reduced motion, deferred map, route cache,
  retry and JavaScript-disabled SSR passed with no page errors.
- No dependency, schema or production setting changes. Deployed vitals and live
  venue presence verification remain separate operational work. Demo reward and
  enabled-session bypass guards are implemented; copied real QR URLs still do not
  prove attendance. See `docs/security/CHECKIN_PRESENCE_POLICY.md`.
