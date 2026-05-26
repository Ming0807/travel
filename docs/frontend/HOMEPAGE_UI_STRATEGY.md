# HOMEPAGE_UI_STRATEGY.md

## 1. Purpose

This document defines the planned homepage strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The homepage is not the main data collection entry point. The main data collection entry point is the location-specific QR check-in flow. The homepage supports the platform by building trust, improving discoverability, showing travel value, and helping tourists understand the certificate, stamp, and passport concept before or after they encounter a QR code.

Status:

| Area | Status |
|---|---|
| Homepage strategy | Planned |
| QR certificate entry | MVP priority |
| Full travel content portal | Phase 2 / Future |
| Public dashboard preview | Optional MVP / Phase 2 |

---

## 2. Product Role

The homepage should support these goals:

- Present Yala, Pattani, and Narathiwat as a connected smart tourism area.
- Make the platform credible for tourists, university reviewers, tourism staff, and local agencies.
- Encourage attraction discovery through an app-like feed.
- Explain that tourists can create a digital certificate and collect stamps by scanning QR codes at real locations.
- Provide entry points to attractions, suggested routes, travel stories, passport, and trust/privacy information.
- Preview how collected participation data supports dashboard insight and sustainable tourism planning.

The homepage should not:

- Replace the QR check-in landing page.
- Ask for a long form.
- Require login.
- Claim features are implemented before they are built.
- Expose tourist data, private identifiers, or private certificate files.

---

## 3. Visual Direction

The latest homepage design direction is:

```text
native-app-like responsive web design
premium smart tourism platform
Pinterest-style masonry discovery feed
modern mobile bottom navigation
warm, trustworthy, tourism-oriented interface
```

The interface should avoid:

- old government-style layouts
- dense corporate sections
- generic template hero blocks
- heavy statistics before value is clear
- mandatory login framing
- overly playful gamification that weakens academic credibility

---

## 4. Color and Atmosphere

Recommended visual theme:

| Token | Direction | Usage |
|---|---|---|
| Premium dark emerald | Primary brand depth | Hero, navigation, primary CTA |
| Soft mist background | Page background | Main canvas and section bands |
| White cards | Content surfaces | Feed cards, route cards, passport card |
| Warm gold accent | Reward and certificate cues | Certificate, stamp, highlight states |
| Subtle coral accent | Secondary energy | Story tags, friendly highlights |

The page should feel spacious, premium, and calm. Use soft shadows, rounded cards, readable type, and clear hierarchy. Do not make the whole page a single-hue green theme; use white surfaces, warm reward accents, and content imagery to keep it lively.

Earlier standalone homepage mockup HTML files were removed from the active repository surface to avoid CMS confusion. The current homepage direction should be validated against the real Next.js pages and seeded database content.

---

## 5. First-Viewport Strategy

The first viewport should immediately communicate:

- Southern Border tourism discovery.
- Three-province focus: Yala, Pattani, Narathiwat.
- Certificate/stamp reward concept.
- Search and province filtering.
- A visible hint of the discovery feed or next section.

Recommended first-viewport elements:

| Element | Requirement |
|---|---|
| Hero title | Use a literal platform/category headline such as Southern Border Travel Passport or Southern Border Discovery. |
| Supporting copy | Explain travel discovery and QR-based certificate rewards in one or two short sentences. |
| Search | Prominent search bar for attractions, routes, or provinces. |
| Province chips | Yala, Pattani, Narathiwat filter chips. |
| QR certificate card | Small but visible card explaining "Scan QR at attractions to create your certificate." |
| Passport card | Shows stamp progress concept, especially on mobile. |

---

## 6. Recommended Page Sections

| Section | MVP Status | Purpose |
|---|---|---|
| Hero discovery | MVP | Establish place, value, and immediate search/filter actions. |
| Masonry discovery feed | MVP / Phase 2 | Show attraction cards, travel stories, and media-rich discovery content. |
| QR certificate card | MVP | Explain the reward-first flow without opening a form. |
| My Passport / stamp progress card | MVP / Phase 2 | Let returning guests view same-device progress; account-linked recovery later. |
| How it works | MVP | Explain scan QR, create certificate, earn stamp, optional survey. |
| Suggested routes | Phase 2 | Promote cross-province and community-based routes. |
| Privacy & Trust | MVP | Explain display name, optional account linking, and aggregated dashboard use. |
| Dashboard preview | Optional MVP / Phase 2 | Show high-level planning insight without exposing private data. |
| Travel stories / SEO content | Phase 2 | Build search visibility and project credibility. |
| Minimal footer | MVP | Provide basic links, project identity, contact, privacy, admin access. |

---

## 7. Mobile Navigation

Mobile should feel like a native app while remaining a web/PWA experience.

Recommended bottom navigation:

| Item | Purpose |
|---|---|
| Discover | Homepage and discovery feed |
| Routes | Suggested routes and itineraries |
| QR / Certificate | Entry explanation or camera/QR guidance if supported |
| Passport | Stamps, progress, certificates |
| More | About, privacy, language, admin link if appropriate |

Rules:

- Bottom navigation is for mobile public/tourist pages only.
- Admin pages should use an admin-appropriate sidebar/topbar, not the tourist bottom navigation.
- The QR item must not imply that login is required.
- The Passport item must work for guests on the same browser/device and explain cross-device recovery through optional Google or LINE linking when available.

---

## 8. Masonry Discovery Feed

The discovery feed should combine:

- attraction cards
- province highlights
- suggested routes
- travel story cards
- 360 media entry cards
- QR certificate prompts
- community-based attraction cards

Card guidance:

| Card Type | Required Content |
|---|---|
| Attraction | Image, name, province, short category or mood, CTA to details |
| Route | Route name, provinces covered, estimated duration, key stops |
| Story | Title, image, province, short excerpt |
| Certificate prompt | Certificate preview image or card, CTA to learn how QR check-in works |
| Passport prompt | Stamp progress visual, CTA to open passport |

Cards must not include private tourist photos or individual tourist data unless the user explicitly shared a public artifact in a future sharing feature.

---

## 9. QR and Certificate Messaging

Homepage copy should describe the flow as:

```text
Scan a QR code at a real attraction, create a travel memory certificate, earn a digital stamp, and optionally answer a short survey to support tourism planning.
```

Do not frame the primary action as:

```text
Fill survey
Submit database record
Register account
Login with LINE
Login with Google
```

The homepage may link to public explanation pages, but actual visit/certificate creation should normally begin from `/c/[checkinCode]` so the platform knows the attraction and photo spot context.

---

## 10. Privacy and Trust Messaging

The homepage should clearly state:

- Guest mode works first.
- Certificate download is not blocked by survey, LINE, Google, email, or phone number.
- The required pre-certificate form is short.
- Display name can be a nickname, alias, traveller name, or real name.
- The platform uses aggregated data for dashboards.
- Private identifiers are not shown in public UI, dashboards, or default exports.
- Tourist photos and certificates are private unless the tourist explicitly chooses to share.

---

## 11. Dashboard Preview

The dashboard preview should be educational, not a live private dashboard.

Allowed preview content:

- aggregate visit trends
- attraction distribution examples
- province-level participation examples
- funnel concept from QR landing to certificate to optional survey
- sample sustainable tourism indicators

Do not show:

- tourist names
- uploaded tourist photos
- provider IDs
- guest tokens
- raw visit IDs
- private storage paths
- exact individual-level behavior

---

## 12. Acceptance Criteria

The homepage strategy is acceptable when:

- It clearly separates public discovery from QR-based data collection.
- It reflects the premium smart tourism platform direction.
- It includes search, province filters, mobile bottom navigation, certificate prompt, passport prompt, privacy/trust, dashboard preview, and travel content strategy.
- It avoids government-style, dense corporate, or old web portal layouts.
- It explains reward-first participation without forcing login.
- It supports Thai tourists, foreign tourists, LINE users, Google-linked users, and guests.
- It does not expose sensitive tourist data or unsupported implementation claims.
