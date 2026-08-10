# Public Homepage Redesign

## Purpose

Redesign the public homepage as a production tourism discovery experience for the current Yala pilot. The approved direction is the generated desktop and mobile concept from 10 August 2026, informed by `smart-tourism-homepage-original-colors.html` but adapted to the project's real content, data, CMS, navigation, and brand system.

The redesign changes layout, visual hierarchy, responsive behavior, and interaction clarity. It does not replace existing tourism statistics, invent content, or turn the homepage into a generic promotional landing page.

## Product Priority

The homepage must help a tourist answer these questions in order:

1. What can I discover in Yala?
2. How can I find a place, route, restaurant, accommodation, or story?
3. What should I visit next?
4. How do Digital Passport, check-in, certificates, stamps, and leaderboard rewards support the trip?
5. What useful tourism information does the platform collect and present?

Tourism discovery is the primary job. Digital rewards support engagement. Statistics demonstrate the platform's information-system value without dominating the first viewport.

## Approved Visual Direction

- Compact, editorial, task-oriented composition inspired by the supplied mockup.
- One bright, inspectable Yala destination image in the hero instead of a decorative collage.
- Search and quick discovery actions visible immediately after the hero.
- Dense but readable discovery workspace with attractions, planning utilities, routes, and map context.
- Existing statistics presented as a calm evidence band, not replaced with unrelated content.
- Desktop and mobile are intentionally composed, not scaled copies of each other.
- Real database and CMS content only. No visual mock data, fake controls, or dead links in production.

## Brand And Color Roles

The existing public brand palette remains unchanged:

- Ink `#17212B`: headings, navigation, high-contrast text, and quiet secondary actions.
- Coral `#E77455`: primary calls to action, active discovery state, and important directional emphasis.
- Teal `#0A6B62`: Digital Passport, map, place categories, positive state, and supporting navigation.
- Gold `#D6A13D`: ratings and rare reward emphasis only.
- Cream/canvas `#F8FAFC` and white: page canvas and surfaces.

Teal is intentional, not an accidental new theme. Coral remains the primary action color. Neither accent may dominate entire page sections.

## Visual Language

- Product register: welcoming, credible, locally grounded, and production ready.
- Corners: `6-8px` for content panels and cards; fully rounded shapes only for compact filters or status chips.
- Borders: one-pixel neutral separators.
- Shadows: subtle and limited to elevated search, hero, and interactive cards.
- Typography: Thai-first sans family with a compact, predictable hierarchy.
- Hero-scale type is reserved for the hero and must fit without viewport-based font scaling.
- No decorative blobs, glassmorphism, large gradients, nested cards, or oversized empty bands.
- No text overlap, page-level horizontal scrolling, or UI hidden behind the mobile bottom navigation.

## Homepage Information Architecture

### 1. Public Header

- Desktop height remains compact and sticky.
- Brand appears on the left, primary discovery navigation in the center, and search/profile/certificate actions on the right.
- Mobile uses a compact brand lockup and one familiar menu icon.
- Search is a real route or form. It must not remain a decorative icon.
- Active navigation state uses coral without changing the control size.

### 2. Hero And Primary Search

- Use one wide hero container with a single Yala destination image.
- Desktop splits copy and image within one coherent composition.
- Mobile uses a shallow image-led hero with a restrained readability scrim where necessary.
- Literal heading direction: `เที่ยวยะลาให้ลึกกว่าเดิม`.
- Supporting copy explains that the platform connects places, local food, routes, and local stories.
- Primary action: find attractions.
- Secondary desktop action: view suggested routes.
- A real search form overlaps or directly follows the lower hero edge.
- Search supports a text query and a content category, then routes to the correct public listing.
- The hero must not show Pattani or Narathiwat during the Yala pilot.

### 3. Quick Discovery Actions

Provide five direct destinations:

1. Attractions
2. Restaurants
3. Accommodations
4. Suggested routes
5. Stories

Use familiar icons and concise Thai labels. Desktop uses an evenly divided action row. Mobile uses a compact horizontal row that remains usable at 375px without shrinking labels into unreadable text.

### 4. Yala Discovery Workspace

Desktop uses a structured three-column layout:

- Left utility rail: trip planning links, favorites/saved content where supported, and Digital Passport entry.
- Main column: six featured attraction cards selected through the existing homepage CMS.
- Right rail: map context and selected suggested routes.

Mobile order becomes:

1. Section title and horizontal filters.
2. Attraction grid.
3. Digital Passport utility band.
4. Suggested routes.
5. Map link or preview.

Attraction cards show the real image, Thai name, location, and a rating only when the rating has a valid source. Missing images use a branded Thai empty state, never `Image not added`.

Filters must be truthful to the current Yala dataset. Province tabs are removed from this homepage phase and replaced with useful content/type filters or a single Yala context.

### 5. Reward Journey

Present a compact three-step sequence:

1. Find and plan.
2. Check in and collect stamps.
3. Receive a certificate and unlock rewards.

This section connects discovery to the existing QR, certificate, stamp, passport, and leaderboard flow. It must not imply that QR or rewards are the platform's main objective.

### 6. Tourism Statistics

- Preserve the existing metric purpose, formulas, data source, privacy boundaries, and no-data behavior.
- Do not replace the statistics section with testimonials, promotional copy, or invented trends.
- Redesign only the presentation: compact metric cells, clear Thai labels, source/context note, and a route to the existing public dashboard where appropriate.
- Never use generated numbers, fabricated growth percentages, or values copied from the approved concept image.
- Statistics remain below discovery and reward context so tourists first understand the service.

### 7. Suggested Routes And Local Stories

- Suggested routes use real CMS-selected routes with image, duration, concise stops, and a clear detail action.
- Stories use real published content and retain the existing configurable title, subtitle, button label, and limit.
- Use a scan-friendly editorial layout: one primary story and compact supporting stories on desktop; a simple ordered feed on mobile.
- Merge or remove duplicated highlight/testimonial content when it does not come from a reliable production source.
- Do not keep a decorative video button unless a working media destination exists.

### 8. Digital Passport Call To Action

- Replace the newsletter-style ending with a concise Passport and leaderboard call to action that matches the platform's real value.
- Explain the reward in one short sentence.
- Provide a primary Passport action and a secondary leaderboard action.
- Newsletter collection stays out of scope unless a real subscription backend and consent flow exist.

### 9. Footer

- Use a compact, structured footer with discovery, planning, Passport, platform, privacy, and contact links.
- Link labels remain Thai-first.
- Avoid repeating navigation that has no public route.
- Mobile footer content keeps sufficient bottom padding above the fixed navigation.

## CMS And Data Contracts

- Preserve existing homepage settings and featured attraction/route/story selection.
- Continue using `SettingsService` and the public content repository as the server-side data sources.
- Do not introduce hardcoded attraction, route, story, image, KPI, or rating values.
- Reuse the existing media path helpers and Next.js image optimization.
- New display configuration is added only when an administrator has a real reason to control it.
- Search/category behavior should reuse existing public list query parameters where possible.
- Empty states remain useful even when fewer than six attractions or no routes/stories are published.

## Responsive Requirements

- Desktop targets: 1280px and 1440px.
- Tablet target: 768px.
- Mobile targets: 375x844 and 390x844.
- Minimum interactive target: 44px.
- No page-level horizontal overflow.
- Mobile heading stays at or below an intentional 32px class and must wrap by phrase.
- Content receives enough bottom padding for the fixed mobile navigation and safe-area inset.
- The map and route rail stack instead of compressing into narrow columns.
- Filter tabs may scroll inside their own row while the page itself remains fixed-width.

## Accessibility

- Semantic heading order from one `h1` through section `h2` headings.
- Search uses a labeled form, input, category selector, and submit action.
- Icon-only controls have Thai accessible names.
- Keyboard focus remains visible on all links, filters, and cards.
- Active filters expose state programmatically.
- Images use content-specific Thai alternative text; decorative imagery uses empty alt text.
- Contrast meets WCAG AA.
- Motion respects reduced-motion preferences.

## Performance

- The hero has one priority/LCP image only.
- All responsive images define accurate `sizes`.
- Below-fold images remain lazy loaded.
- Avoid adding a new client data-fetching or animation dependency.
- Keep homepage data fetching server-side and parallel where possible.
- Avoid layout shifts by reserving stable hero, card, map, and statistics dimensions.
- Reveal animation must not create giant blank screenshots, inaccessible content, or content that never appears when JavaScript is delayed.

## Loading, Error, And Empty States

- Public sections must remain understandable when optional data is empty.
- Empty content uses Thai guidance and a valid fallback route.
- A failed optional section must not break the entire homepage.
- Search validation errors are concise and remain near the search control.
- No raw repository, Supabase, storage, or configuration error reaches the tourist UI.

## Acceptance Criteria

- The desktop homepage visibly follows the approved compact discovery composition.
- The mobile homepage fixes the current oversized image, overflowing headline, and bottom-navigation overlap.
- Search, quick actions, attraction filters, cards, routes, map links, Passport actions, leaderboard actions, and story links navigate to real destinations.
- Existing tourism statistics retain their current meaning and real values.
- Featured attractions, routes, stories, hero content, and images continue to respect CMS settings.
- No English placeholder copy or fake content appears in tourist-facing states.
- Screenshots at 1440x1000, 768x1024, 390x844, and 375x844 show intentional layouts.
- Focused unit tests, lint, typecheck, full tests, production build, Impeccable detection, and Playwright browser smoke pass.

## Follow-On Public Experience Roadmap

After the homepage is implemented and visually accepted, apply the same visual system in this order:

1. `/attractions` and `/attractions/[slug]`
2. `/routes` and route details
3. `/stories` and full Blog/Story CMS output
4. `/restaurants`, `/accommodations`, and their detail pages
5. `/passport` and `/leaderboard`
6. `/about`, `/contact`, global search, header, footer, and mobile navigation consistency
7. Cross-page responsive, accessibility, localization, image performance, and navigation QA

Each route keeps its own task hierarchy. The homepage composition must not be copied blindly onto operational pages or content detail pages.

## Out Of Scope

- Changing dashboard metric formulas or database schema.
- Adding unsupported booking, payment, newsletter, or favorite behavior.
- Reintroducing Pattani or Narathiwat before the product scope is expanded.
- Predictive AI recommendations.
- Rebuilding the admin CMS during the homepage phase.
