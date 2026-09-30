# Home motion, loading and route discovery

Home keeps the existing photographic editorial identity. A small progressive
enhancement uses native Web Animations and IntersectionObserver for the hero and
selected discovery/destination cards. Server content is visible without scripts.
Other sections remain steady. Pointer hover and touch press feedback use CSS;
reduced-motion removes travel and loading animation. No motion library is added.

## Loading and performance

`Homepage` begins lower-page queries concurrently but awaits only hero/media
settings before returning its first content. A nested Suspense boundary streams
the directory sections; public analytics have an independent boundary. The cafe
query chains directly from category resolution alongside other lists rather than
waiting for every list. Hero uses one responsive, preloaded image on desktop and
mobile, replacing the hidden duplicate. Remaining content images are lazy.

Home-scoped skeletons reserve hero/discovery geometry and announce actual pending
content. They introduce no delay, fabricated percentage or blocking overlay.
These changes reduce query dependencies and initial map/gallery work; production
LCP/INP and server latency still require deployed measurements.

## Route selection and map

Home first requests the CMS-selected routes through the existing public
repository. If selected entries are unavailable, it fills up to three slots from
a staged public route lookup (12 candidates, extending to 60 only when needed), retaining selected eligible order
and avoiding duplicates. Every route and stop must retain active/published/live
destination eligibility. Draft routes are never automatically published.

On 2026-09-30 the configured featured slugs referred to three disabled older
routes, while three Na Tham routes were active/published with eligible stops.
This explains the previous empty section. The fallback fixes the presentation
without modifying CMS choices or weakening release scope.

The section combines SSR route cards and itinerary metadata with an optional
map. Opening the map requests `GET /api/public/routes/[slug]/map`; until then
neither map data nor Leaflet are requested. A native route selector, detail link,
retry, request cancellation and a per-mounted-section cache support slow networks.
A local error boundary also isolates component-chunk failures and recreates the
lazy component on retry so a failed map cannot take down Home.
Leaflet draws ordered itinerary connections, not computed road directions. Use
the linked route page/navigation tools for road directions. Missing coordinates
remain explicitly unavailable.

The background veil only improves text contrast over photography. It does not
determine publishing or hide route records. The empty state now provides a useful
discovery action; loading failure provides a directory retry path.

## Acceptance checks

- Stale featured selections show eligible fallback routes; valid selections retain
  order without a second query when the section is full.
- Hero resolves while attraction data is pending; analytics cannot block Hero or
  directory content. No invented metric appears when the source is unavailable.
- One hero image; no map fetch before an explicit opening action.
- Map failure/retry, closing cancellation and route switching preserve correct
  data; hidden routes return 404 and failure returns sanitized 503.
- Keyboard, reduced motion, no-JS content and mobile overflow are checked in
  unit/browser fixtures. Live map tile availability and deployed vitals remain
  separate operational checks.
