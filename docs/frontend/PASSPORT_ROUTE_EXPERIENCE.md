# Passport and route experience

## Passport

`/passport` remains dynamic and ownership-checked through
`getCurrentTouristPassport`. The page shows a shared heading/navigation shell,
with the data region inside Suspense. The route loading file uses the same shell.
The shell exposes no name, stamp count or identity before the service resolves.

`PassportCollection` is a server component: forest passport cover, stamp
collection, province progress and recent completed visits. The cream, copper and
forest palette follows Home. Links connect routes, attractions and leaderboard.
Stamp states include text/icons; a missing attraction slug creates no link.

Lifetime stamp count and active-target progress are different. The cover shows
the lifetime count; progress uses the sum of `provinceProgress.earnedCount` over
`totalStampTargets`. The existing service includes historical earned stamps in
`stampTargetsByProvince`. The UI renders these even when active targets are zero,
instead of returning early and hiding the collection. No reward/query changes.

No-identity visitors can inspect attractions, read `/checkin/try` instructions,
and use the existing optional LINE recovery panel. Ready guests retain optional
linking. Failed service access shows safe copy and a direct passport retry;
technical errors do not reach the UI. No login/survey/GPS requirement is added.

## Routes

The list retains publication gates, duration/search controls for more than three
routes, selected-trip error recovery, URL sanitization and real CMS hero settings.
Only the hero is eager; route cards below it use lazy images. Copy describes the
trip-planning task rather than content implementation details.

`/routes/[slug]` retains cached data/metadata and `notFound()`. Presentation lives
in `PublicRouteDetail`, with direct anchors to map and itinerary plus a passport
link. Mobile stops use 96px thumbnails beside the place name; larger layouts use
150px thumbnails and numbered rows. Directions and missing-coordinate messages
are unchanged. Leaflet still loads near the map viewport through its existing
IntersectionObserver. Dotted connectors represent stop order, not actual roads.

Hover feedback runs on fine-pointer devices. Reduced motion removes skeleton
pulses, transitions and arrow/image transforms. Loading states have status labels
and hide decorative placeholders from assistive technology. No dependency,
schema, consent or access-control changes.

## Verification

See `tasks/PHASE_17B_PASSPORT_ROUTE_EXPERIENCE.md` for final results. Synthetic
browser fixtures use actual UI components, anonymized test labels and intercepted
map tiles. Production smoke covers public, unauthenticated passport and published
route pages on the local production build. It does not issue certificates, write
visits, link accounts or alter the database. Fixture checks are layout/interaction
checks; they do not measure production LCP or weak-network performance.
