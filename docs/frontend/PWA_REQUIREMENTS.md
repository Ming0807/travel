# PWA_REQUIREMENTS.md

## 1. Purpose

This document defines the product-level PWA requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The platform should use a responsive web/PWA approach for MVP because tourists should be able to scan a QR code and participate immediately without installing a native app.

Status:

| Requirement Area | MVP Status |
|---|---|
| Mobile responsive web app | MVP |
| QR route support | MVP |
| Guest identity on same browser/device | MVP |
| Installable PWA manifest | Optional MVP / Phase 2 |
| Offline-first certificate flow | Future |
| Mandatory native mobile app | Out of MVP |

---

## 2. Why Web/PWA Instead of Mandatory Native App

The platform depends on low-friction participation at real attractions. A mandatory native app would add too much friction for tourists who only want a quick travel memory.

Web/PWA is preferred for MVP because:

- QR codes open directly in mobile browsers.
- Thai and foreign tourists can participate without app store installation.
- Guest mode can work immediately on the same browser/device.
- The same route can support LINE browser, Chrome, Safari, and other mobile browsers.
- Public attraction pages can support SEO and project credibility.
- Admin and dashboard modules can share the same Next.js platform.
- Future PWA install prompts can improve returning use without blocking first use.

Native apps are out of MVP unless a future stakeholder requirement proves a clear need.

---

## 3. Core PWA Product Requirements

| Requirement | MVP Rule |
|---|---|
| QR route | `/c/[checkinCode]` opens in browser and resolves attraction/photo spot context. |
| Landing page | QR opens a location-specific landing page before any form. |
| Guest mode | Works without login using an anonymous browser/device ID. |
| Certificate flow | Certificate download is not blocked by survey, LINE, Google, email, or phone number. |
| Passport | Guest passport works on the same browser/device. |
| Account linking | Google and LINE linking are optional tourist recovery features. |
| Admin auth | Admin routes require real authentication and authorization. |
| Public site | Homepage, attraction pages, routes, stories, and 360 media support discovery and SEO. |
| Dashboard | Admin/dashboard UI uses aggregated data and does not expose private identifiers. |

---

## 4. Guest Identity Storage

Guest identity should use an anonymous guest ID stored in a first-party browser/device mechanism such as:

- signed cookie
- first-party cookie
- local storage token

Rules:

- Do not use IP address as the main tourist identity mechanism.
- Do not store personal data in the guest token.
- Do not expose the token in public UI, share URLs, dashboards, or default exports.
- Explain that guest passport recovery is limited to the same browser/device unless the tourist links Google or LINE.
- If a guest later links Google or LINE, link the existing Tourist Profile to the authenticated Tourist Identity.

IP address may be used only for security logs, abuse prevention, or aggregate system analytics.

---

## 5. Browser and Device Requirements

The tourist-facing experience should support:

- modern mobile Chrome
- modern mobile Safari
- common Android browsers
- LINE in-app browser where LINE LIFF is configured
- desktop browsers for public discovery and admin use

The UI should remain usable when:

- network is slow
- screen is small
- the user is outdoors
- the user switches language
- the user declines optional account linking

---

## 6. Offline and Caching Scope

MVP should not promise full offline completion because certificate generation, file upload, consent logging, and visit recording require server/storage access.

MVP may cache:

- static assets
- shell layout
- public attraction content where safe
- previously loaded passport summary on the same device

Do not cache:

- private photos
- private certificate files
- provider user IDs
- guest tokens in service worker caches
- admin dashboard responses

---

## 7. Install Prompt Strategy

PWA install prompts are optional and should appear only after the tourist receives value.

Good moments:

- after certificate download
- after stamp award
- on passport page

Bad moments:

- before QR landing context
- before minimal form
- before certificate generation
- as a blocker to survey or download

---

## 8. Acceptance Criteria

The PWA strategy is acceptable when:

- QR scanning opens the web route without requiring native app installation.
- Guest mode works first on the same browser/device.
- Google and LINE are optional linking features, not entry gates.
- Admin authentication remains separate from tourist guest mode.
- Certificate download is not blocked by install prompts, survey, or account linking.
- Public pages support SEO and discovery while the QR flow remains the main data collection entry point.
- Private data is not cached, exposed, or shared accidentally.

