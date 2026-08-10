# Public Frontend System Redesign

## Purpose

Extend the approved homepage visual and interaction system across every tourist-facing route without copying one page composition everywhere. The redesign must make the platform feel like one production product while preserving the distinct job of discovery, detail, editorial, reward, check-in, research, and legal pages.

## Product Scope

Current launch scope is **Yala only**. Public copy, metadata, filters, maps, statistics, legal wording, and empty states must not imply that Pattani or Narathiwat are active until destination scope is expanded deliberately.

The public product has six jobs:

1. Help tourists discover trustworthy places, food, accommodation, routes, and local stories.
2. Help tourists complete QR check-in and receive value with minimal friction.
3. Make certificates, stamps, Passport, and leaderboard useful incentives without making them the product's main objective.
4. Collect optional tourism data transparently after value is delivered.
5. Present aggregated evidence for tourism planning without overstating sample quality or economic impact.
6. Explain who operates the platform, what data is collected, and how users can contact or exercise privacy rights.

## Non-Negotiable Decisions

- **Photo remains optional.** A tourist may generate a valid certificate without uploading a personal image. Copy and documentation must agree.
- **Visit time is server recorded.** Do not ask the tourist to enter a visit date during QR flow; this protects data quality.
- **Leaderboard is privacy-first.** Public names require explicit opt-in. Until that contract exists, show an anonymized alias or initials and never infer public-display consent from the certificate name.
- **Certificate sharing is file-first.** Share the generated image/file through the device share sheet when supported. Do not share a private success URL as if it were public. A public share-token system remains a separate consented feature.
- **Guest-first stays the default.** LINE, Google, and email are optional retention/recovery methods, not prerequisites for certificate creation.
- **Survey is progressive and optional.** The short form must match its stated completion time. Additional research evaluation stays separate and consented.
- **No unsupported feature claims.** Remove fake booking, newsletter, redemption, map, response-time, organization, scale, or live-data claims unless a real source and workflow exist.

## Frozen Visual System

### Palette

- Ink `#17212B`: primary text and high-contrast surfaces.
- Coral `#E77455`: primary actions and active directional emphasis.
- Teal `#0A6B62`: place context, Passport, maps, and positive support actions.
- Gold `#D6A13D`: ratings, rank, and rare reward emphasis.
- Canvas `#F8FAFC` and white: page and content surfaces.
- Semantic success, warning, and danger colors must be tokenized and used for states only.

### Typography

- `Noto Sans Thai`: body, forms, navigation, tables, legal copy, and operational UI.
- `Kanit`: headings and selected display moments only.
- Certificate artwork may use template-specific fonts independently.
- Remove global `Prompt`/`Sarabun` fallbacks that are not actually loaded.
- Body text defaults to at least 16px on tourist forms and long-form reading pages.

### Shape And Depth

- Controls: 6px radius.
- Panels/cards: 8px radius; 12px only for an exceptional media surface.
- Pills: filters, segmented state, compact status only.
- Shadows: search, dialogs, floating mobile controls, and genuinely elevated media only.
- Remove decorative blobs, glass panels, bounce motion, gradient text, and nested-card layouts.

### Responsive Contract

- Validate at 360, 375, 390, 430, 768, 1280, and 1440px.
- Minimum interactive target is 44px.
- No page-level horizontal overflow.
- Every tourist route must reserve mobile bottom-navigation safe space unless the route uses focused-flow mode.
- Check-in, visit, auth, account-linking, and research task routes use focused-flow mode and hide global discovery navigation.

## Shared Public Primitives

Create a small public UI vocabulary, not a universal page template:

- `PublicPageFrame`: `listing`, `detail`, `reading`, and `legal` width variants.
- `PublicPageIntro`: breadcrumb, literal title, description, optional verified media.
- `PublicButton` and `PublicIconButton`: primary, secondary, quiet, danger.
- `PublicField`, `PublicSearchField`, `PublicSelect`, and `PublicFilterBar` with visible labels.
- `PublicMediaFrame`: aspect ratio, CMS fallback, `alt`, `sizes`, and priority policy.
- `PublicEmptyState`, `PublicErrorState`, `PublicLoadingState`, and `PublicNoDataState`.
- `PublicDialog`, `PublicDisclosure`, and `PublicTabs` with keyboard/focus contracts.
- `PublicPagination`, `RatingSummary`, `MetricDefinition`, and `SampleWarning`.

Do not abstract one-off compositions until at least two routes demonstrate real duplication.

## Page Family Designs

### 1. Discovery Listings

Routes: `/attractions`, `/restaurants`, `/accommodations`, `/routes`, `/360-vista`.

Layout:

1. Compact page intro with Yala context.
2. URL-driven search and visible filters.
3. Honest result count and active-filter summary.
4. Scan-friendly result grid/list with decision-useful fields.
5. Server-side pagination or bounded results with truthful total.
6. Relevant cross-navigation only.

Rules:

- Restaurants and accommodations must not filter only a previously limited client-side subset.
- No full-page `window.location.href` navigation for routine filtering.
- `/routes` removes the decorative map button until route geometry exists.
- `/360-vista` uses CMS-backed imagery/content or states clearly that the experience opens an external provider. No CSS mock preview.

### 2. Place And Route Details

Routes: attraction, restaurant, accommodation, and route details.

Distinct composition:

- **Attraction:** media → location/actions → overview → activities/food/tips/getting there → reviews → related content → check-in/certificate.
- **Restaurant:** media → cuisine/hours/address/contact/map actions → nearby attractions → reviews.
- **Accommodation:** media → type/price/address/contact/map actions → nearby attractions. No booking action without booking contract.
- **Route:** summary → day timeline → stop cards → optional real map only when coordinates exist.

Rules:

- Remove hardcoded facts such as population, unspecified best time, or future languages.
- Gallery thumbnails must be real buttons/lightbox actions or plain images without fake affordance.
- Mobile retains 360/check-in actions when the underlying data exists.
- Add route-specific metadata and useful not-found/loading states.

### 3. Editorial

Routes: `/stories`, `/stories/[id]`, `/stories/share`.

- Stories hub uses a compact newsroom composition: intent/search → truly featured or clearly latest story → topic filters → feed → contribution CTA.
- Story detail uses a 70ch reading canvas, clear author type, source/update information, desktop TOC and mobile disclosure, related stories, and destination CTA.
- Story submission explains why sign-in is required, content/photo rights, moderation outcomes, and privacy before the form.
- Success wording says “ส่งให้ทีมตรวจสอบแล้ว”; it must not promise publication.
- Legacy HTML rendering remains behind a documented sanitization boundary.

### 4. Reward And Identity

Routes: `/passport`, `/leaderboard`, `/profile`, public auth and account linking.

- Passport is the personal travel record: progress, earned stamps, missing stamps, recent visits, and optional account recovery.
- Leaderboard uses anonymized identities by default, semantic rank rows, meaningful period controls, and “ยังไม่ติด Top 100” instead of `#0`.
- Profile separates public display preferences, certificate name, origin profile, connected identities, consent, and privacy actions.
- LINE recovery/linking requires explicit purpose-specific consent; never submit `hasConsented: true` automatically.
- Remove bounce/gradient-text decoration and use gold sparingly for rank.

### 5. Focused QR And Visit Funnel

Routes: `/c/[code]`, `/checkin/*`, `/visit/*`, research invitation/evaluation routes.

- Use a dedicated focused-flow shell with progress: `ข้อมูลสั้น ๆ → รูป/ใบประกาศ → รับรางวัล → แบบสำรวจ (ไม่บังคับ)`.
- Hide global header and bottom navigation during the funnel.
- Landing explains benefit, duration, optionality, and privacy before the primary action.
- Camera/gallery remains two explicit actions; camera dialog gets focus trap/return and mobile viewport checks.
- Certificate success centers the actual generated certificate preview, then download/file share, Passport, and optional survey.
- Survey has pending state, duplicate protection, accurate duration, progress, skip, retry, and low/high rating anchors.
- Research evaluation remains a separate study-layer action, not silently appended to ordinary tourism data.

### 6. Trust, Legal, And Public Evidence

Routes: `/about`, `/contact`, `/privacy`, `/terms`, `/dashboard`.

- About is evidence-led: Yala pilot scope, problem, data-to-planning model, verified operator/team/partners only, privacy principles, and live sourced coverage metrics only.
- Contact is a real support task hub. Form must call `/api/contact`; fields have names/labels; loading, error, success, and retry are explicit.
- Privacy starts with a plain-language summary, then purpose/field/retention/optionality table, consent/withdrawal/deletion, cookies actually used, contact, version, and effective date.
- Terms starts with a plain-language summary and accurately covers service scope, UGC moderation, ownership, rewards, availability, external links, changes, and jurisdiction.
- Public dashboard is an evidence report: Yala scope, data-as-of, KPI definitions, sample sizes, accessible chart/table pairs, no-data rather than zero-fill, limitations, privacy note, and metric dictionary link.

## Correctness-First Production Fixes

These are included in the redesign and occur before visual polish of their page:

1. Wire the contact form to the existing API.
2. Remove fake route-map, FAQ, social, newsletter, redemption, and contact actions.
3. Remove or source hardcoded team, organization, contact, scale, and reward claims.
4. Correct public dashboard no-data/sample/definition behavior.
5. Correct certificate sharing and success preview.
6. Add leaderboard public-display consent/anonymization.
7. Correct automatic LINE recovery consent.
8. Review auth callback `next` against an internal-route allowlist.

## Accessibility Contract

- One `h1` per page and sequential headings.
- Visible labels; placeholders are examples, not labels.
- Menus support click, keyboard, Escape, focus movement, and `aria-expanded`.
- Dialogs use `role="dialog"`, `aria-modal`, focus trap, Escape, and focus restoration.
- Tabs/segmented controls expose selected state.
- Progress bars expose `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- Charts have textual/table equivalents.
- Motion respects `prefers-reduced-motion`.
- Thai visible copy is primary; English remains only for product names where useful.

## Performance Contract

- One priority image per route; hidden responsive branches must not both preload.
- Remove `unoptimized` unless the source is unsupported and documented.
- Every fill image has an accurate `sizes` value.
- Use thumbnail paths for cards and full assets for detail media.
- Add loading states without client-side data fetching where server rendering already works.
- Replace unnecessary `force-dynamic` with deliberate cache/revalidation only after checking user-specific data boundaries.

## Test Strategy

Per task:

- Failing targeted test first where behavior changes.
- ESLint only changed TS/TSX files.
- Targeted unit/integration tests.
- Typecheck after each coherent task batch, not each tiny edit.

Per batch checkpoint:

- Playwright for affected routes at desktop/mobile.
- Impeccable detection on changed UI files.
- `git diff --check`.

Before merge/push:

- Full Vitest suite once.
- Production build once.
- Cross-route Playwright smoke once.
- Restore generated artifacts.

## Delivery Order And One-Week Target

1. Foundation and truthful shared shell.
2. Attractions list/detail.
3. Restaurants, accommodations, routes, and 360.
4. Stories hub/detail/submission.
5. Passport, leaderboard, profile, and identity.
6. QR/check-in/photo/certificate/survey flow.
7. About, contact, privacy, terms, public dashboard, and final QA.

A focused one-week delivery is feasible for UI/UX and the listed correctness fixes if public share tokens, booking, payments, AI recommendations, multilingual infrastructure, and new analytics formulas remain out of scope.

## Acceptance Criteria

- Every public route belongs to a clear page family and uses the shared visual vocabulary.
- All visible controls perform a real action or are removed.
- Yala-only scope is consistent across UI, metadata, and legal/trust copy.
- No fake statistics, team members, operators, rewards, contact details, map previews, or publication promises remain.
- QR and certificate flow remains guest-first, mobile-first, and privacy-aware.
- Listings use complete server-side filtering and truthful result counts.
- Public evidence explains sample size, source, date, definition, and limitations.
- Desktop/tablet/mobile screenshots show no overlap or horizontal overflow.
- Targeted gates pass per task; full suite/build/E2E run once at the batch checkpoint.

## Out Of Scope

- Booking or payment.
- Newsletter subscription.
- Public certificate share-token infrastructure.
- AI recommendations.
- Reopening Pattani or Narathiwat.
- Native mobile application.
- Redefining analytics formulas without a separate metric review.
