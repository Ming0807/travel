# Phase 20: Public Homepage Visual Fidelity

Status: Ready for delegated visual implementation

Priority: P1 public experience

## Goal

Redesign the public homepage to follow the approved warm-white, coral-orange, Thai cultural-tourism composition while preserving all production data, navigation, CMS settings, accessibility, and QR/check-in behavior.

## Reference Direction

- Clean white canvas with coral-orange emphasis and near-black text
- Compact white navigation with a clear check-in action
- Full-width photographic hero with readable left-aligned content
- Curved hero-to-content transition
- Four benefit/workflow entry points
- Split project-purpose and evidence/statistics band
- Horizontal journey explanation
- Real attraction discovery cards
- Strong final check-in call to action and structured footer

The reference is a layout and visual-hierarchy target only. Do not copy its brand, temple names, province, contact information, statistics, or claims.

## Invariants

- No database, migration, API, repository, auth, QR, certificate, survey, or analytics logic changes.
- Keep current CMS-driven homepage settings and real repository data.
- Do not add fake attractions, fake statistics, fake testimonials, or sample links.
- Preserve the existing `PublicCheckinEntryLink` behavior.
- Retain Thai-first copy and existing Yala project identity.
- Use current design tokens; coral/orange is the primary action color. Teal may remain only where it already carries semantic meaning.
- Desktop, tablet, and mobile must remain usable and WCAG AA.

## Work Items

### Task 20.1: Baseline and Visual Contract

- [ ] Inventory current homepage sections, settings props, links, tests, and dynamic data ownership.
- [ ] Capture baseline screenshots at 390x844 and 1440x1100.
- [ ] Write visual-contract tests that protect production links and dynamic section composition.

### Task 20.2: Public Header

- [ ] Reshape the public header to match the compact reference rhythm.
- [ ] Preserve every existing destination, dropdown, global search, account state, mobile menu, and check-in action.

### Task 20.3: Hero Composition

- [ ] Recompose the hero using existing CMS settings and media.
- [ ] Provide robust text contrast, responsive crop, primary check-in action, secondary discovery action, and an accessible media fallback.

### Task 20.4: Value and Quick Actions

- [ ] Restyle existing quick actions into a four-item value band.
- [ ] Use real destinations and current product benefits; do not add controls that only look clickable.

### Task 20.5: Project Purpose and Evidence

- [ ] Recompose existing project-purpose and real evidence/metric content into the reference split layout.
- [ ] Keep unavailable metrics honest and never replace them with reference-image numbers.

### Task 20.6: Journey Explanation

- [ ] Restyle the existing journey as a clear horizontal desktop sequence and readable mobile vertical sequence.
- [ ] Keep the production QR/check-in flow at its current number of steps and current behavior.

### Task 20.7: Discovery Content

- [ ] Restyle real attraction, route, story, and discovery content with the approved image-forward visual language.
- [ ] Preserve repository ordering, CMS limits, links, and empty/error states.

### Task 20.8: Final CTA and Footer

- [ ] Restyle the final certificate/check-in CTA and footer in the same visual system.
- [ ] Preserve settings-driven contact/social data and legal links.

### Task 20.9: Responsive, Accessibility, and Visual QA

- [ ] Verify 360, 390, 768, 1024, and 1440px without overlap or horizontal scrolling.
- [ ] Verify focus order, keyboard use, reduced motion, contrast, heading order, labels, and touch targets.
- [ ] Capture final screenshots and compare composition against the reference.

### Task 20.10: Release Evidence

- [ ] Run focused homepage tests, changed-file ESLint, typecheck, and production build.
- [ ] Commit locally with no push and provide Base/New commits/checks/screenshots/risks/inspection files.

## Acceptance Criteria

- The first viewport clearly communicates tourism discovery and check-in value.
- All visible actions work exactly as before.
- No content depends on hardcoded reference-image data.
- No overlap, clipped Thai text, horizontal scroll, fake control, or inaccessible contrast.
- Existing public homepage unit tests, typecheck, lint, and production build pass.
- No SQL or environment change is required.
