# ADR-002: Next.js PWA as Core Platform

## Status

Accepted

## Context

Tourists will primarily access the system via mobile phones after scanning QR codes. The platform needs to:

- Work immediately on any mobile browser without app store installation
- Load fast on potentially slow mobile connections
- Support offline or degraded connectivity
- Be installable on home screen for repeat visitors
- Provide native-app-like experience
- Support QR-to-certificate participation without forcing native app installation
- Support public SEO/discovery pages and admin/dashboard pages in one platform

## Decision

Use **Next.js as a Progressive Web App (PWA)** for the tourist-facing interface.

PWA features:

- Service Worker for offline caching of static assets
- Web App Manifest for home screen installation
- Responsive design for all screen sizes
- App-like navigation without page reloads

Next.js provides SSR for fast first load and SEO, while client-side navigation provides app-like transitions.

The PWA route `/c/[checkinCode]` is the primary field data collection entry point. It must open a location-specific landing page before any form and must allow guest completion before optional Google or LINE linking.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Native mobile app (React Native) | Requires app store distribution, slower iteration |
| Separate mobile app + web admin | Two codebases to maintain |
| Static site (Gatsby) | Cannot handle dynamic tourist flow |
| SPA only (Vite + React) | No SSR, poor SEO for attraction pages |
| Mandatory native app for QR users | Too much friction for tourists who only want a quick certificate |

## Consequences

**Positive:**
- Single codebase for tourist + admin interfaces
- No app store approval needed
- Instant access via QR scan → browser
- SSR provides fast first contentful paint
- PWA can work offline for cached attraction content
- Home screen installation for returning tourists
- Guest mode can work immediately in browser on the same device
- Optional Google/LINE linking can be added without blocking first use

**Negative:**
- PWA capabilities vary by browser (Safari has limitations)
- Push notifications require service worker setup
- Offline-first data sync adds complexity (not required for MVP)
- Browser storage for guest identity must be privacy-safe and cannot be treated as verified identity
