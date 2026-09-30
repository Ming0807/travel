# Public attraction interaction and loading

Updated: 2026-09-30

This change supports attraction discovery and visit planning. Published content, geographic scope, pagination, filters, review privacy and check-in authorization remain enforced by the existing repositories and services.

## Interaction

- Search remains visible on mobile. Only the additional type/district controls collapse. Tablet search uses two columns rather than squeezing all fields into one row.
- The search form retains a native GET action for progressive enhancement. After hydration it uses an App Router transition, preserving the shared site shell, announcing pending work and opening the result heading. Form controls reset from the new URL values after navigation.
- Category chips and shortlist actions remain available. Touch controls in cards are at least 44px tall. Long names use two lines.
- Card and gallery hover use small transforms only on devices with a fine pointer. Dialog entry takes 180ms. Reduced motion removes transforms, transitions and loading pulses. There are no artificial loading delays or hidden content awaiting animation.
- Detail category tags, facts panel and gallery use the existing public palette and 12px corners. Section navigation identifies the current section to assistive technology and has explicit focus treatment.

## Loading and assets

- `/attractions/loading.tsx` uses a skeleton reflecting the hero, search area, card grid and desktop sidebar.
- `/attractions/[slug]/loading.tsx` provides a distinct detail skeleton and accessible status. It does not briefly show a results-list layout while opening a place.
- Listing images stay lazy rather than competing with the hero preload. Their `sizes` reflect one-column mobile, two-column tablet, two-column desktop with sidebar, and three-column wide desktop.
- Card images fill the actual 16:10 frame rather than rendering a taller 4:3 image inside a cropped wrapper.
- Gallery full-size dialog images and thumbnails mount only when the dialog opens and unmount after closing. Eight photos require three image elements before opening instead of twelve. The primary detail image uses the Next 16 `preload` property. With one usable photo, the gallery uses full width rather than reserving an empty side column.
- Panorama and Google Maps remain user-initiated links. No map library or 360 viewer is added to the initial attraction bundle.

## Acceptance checks

1. Search and filters preserve `q`, `type`, `district`, and reset pagination on a new search; results still use real published data.
2. Directory and detail have no horizontal overflow at 320, 390, 640, 768, 1024, 1240, 1440 and 1920px.
3. Gallery image count is truthful after failed images are removed; native dialog Escape closes and releases its image DOM.
4. Loading status is announced once; placeholder elements are hidden from assistive technology.
5. Reduced motion disables pulse, hover transforms and dialog entry while all content and actions remain available.

`tests/visual/attractions` uses real UI components and synthetic data with image/router adapters. It validates layout, interactions and deferred mounting, not production transfer sizes, database response times or Web Vitals. Measure real LCP/INP/CLS and slow-network performance after deployment; no numeric speed gain is claimed from fixture timings.
