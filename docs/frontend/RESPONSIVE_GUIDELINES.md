# RESPONSIVE_GUIDELINES.md

## 1. Document Purpose

This document defines responsive design guidelines for the **Southern Border Tourism Data & Intelligence Platform**.

Most tourists will use mobile phones at attractions. Tourist-facing pages must be designed mobile-first, with desktop support for public discovery, admin, dashboard, and academic review.

---

## 2. Mobile-First Requirements

Tourist-facing pages must:

- load quickly on mobile networks
- keep primary actions visible
- use large tap targets
- avoid dense text blocks
- avoid long forms
- support Thai and English text length
- show clear loading and error states
- keep certificate and upload interactions usable on small screens

The QR landing page should communicate the benefit within five seconds.

---

## 3. Homepage Responsive Strategy

The homepage should follow the premium app-like direction:

- bottom navigation on mobile
- search bar near the first viewport
- province filter chips
- masonry discovery feed that becomes stacked on mobile
- QR certificate card
- passport progress card
- spacious route/story sections
- minimal footer

Desktop can use wider grids and dashboard previews, but mobile should remain the primary design target.

---

## 4. QR and Certificate Flow

Required responsive behavior:

- QR landing CTA fits on small screens.
- Certificate preview scales without cutting text.
- Photo upload controls remain reachable with one hand.
- Form fields avoid horizontal scrolling.
- Survey controls wrap cleanly.
- Share bottom sheet is usable on mobile.
- Passport stamp grid uses stable tile dimensions.

Do not use layouts that require landscape orientation.

---

## 5. Dashboard and Admin

Admin and dashboard pages may use desktop-first layouts, but must remain usable on tablets and narrow screens.

Guidelines:

- tables need pagination
- filters should collapse into drawers or stacked groups on narrow screens
- KPI cards should wrap without changing meaning
- charts should show labels and `No data` states clearly
- private identifiers must not appear just because screen space is limited

---

## 6. Acceptance Criteria

Responsive design is acceptable when:

- Tourist QR-to-certificate flow works on common mobile widths.
- Certificate download and sharing actions are reachable on mobile.
- Guest mode, survey skip, and optional account linking are visually clear.
- The homepage does not become overly dense on mobile.
- Dashboard metrics remain readable and privacy-safe on smaller screens.
