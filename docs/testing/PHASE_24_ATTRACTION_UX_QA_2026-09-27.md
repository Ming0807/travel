# Phase 24 Attraction UX and Recovery QA

Date: 2026-09-27. This checkpoint implements bounded Phase 22/24 attraction
analytics hardening. It does not certify the entire dashboard, authenticated
production behavior, a research Pilot, or physical NFC acceptance.

## Changes

- The page permission gate precedes the option loader; both analytics services
  retain their independent guards. Later sign-in redirects/access failures still
  propagate instead of being presented as database failures.
- Five typed notices distinguish catalog failure, empty attraction catalog,
  invalid filters, unavailable selected attraction and analytics failure. Failed
  reads do not render zero metrics or substitute a different attraction.
- Analytics retry includes the resolved scope and default dates. Only supported
  query fields are serialized; repeated values use the existing first-value rule.
- The inclusive 90-day default and generation timestamp use Bangkok time.
- Campaign changes clear incompatible check-in codes and retain compatible ones.
  Clearing the campaign restores all available codes. Unavailable URL selections
  remain explicit with warning/replacement controls rather than looking like an
  unfiltered scope. Place changes still disable stale dependent controls.
- Mobile headline KPIs use a compact 2x2 grid and retain complete numbers. Peer
  comparison and metric-definition tables have named focusable scroll regions.
- Phase 23 status and the task index now distinguish local delivery from
  deployment/physical/human acceptance. The already-implemented eligible peer
  median was reconciled, not reimplemented.

No metric formula, privacy threshold, permission, export gate, migration, real
record, campaign definition or rollout flag changed.

## Executed Verification

| Check | Result | Boundary |
|---|---|---|
| Focused Vitest regression, one threads worker | 8 files / 80 tests passed | Page state/auth redirect, filter dependencies, workspace layout, peer comparison, service aggregation, export, decision links and shared page foundation |
| Scoped ESLint | Exit 0, no warnings/errors | Changed page/components/unit tests and dashboard fixture code |
| `pnpm run typecheck` | Exit 0 after a typed Date-context test fix | Local Node 26.1.0; production build independently ran TypeScript under Node 22 |
| `npx --yes --package node@22.23.3 node node_modules/next/dist/bin/next build` | Exit 0; 66/66 generated static pages | Local production build, not proof of Vercel deployment |
| Playwright CLI component matrix | 50 surface checks passed at 360/390/768/1024/1440 px; 15 keyboard-region checks; no page/console errors or page overflow | Synthetic real-component harness, no auth/database adapter |
| Screenshot review | Desktop/mobile summary, trend, notice, expanded peer/definition tables reviewed | Local artifacts under `.tmp/`, intentionally not committed |
| Local production-server smoke | Six executed release checks passed; readiness skipped; protected attraction page redirects anonymous users to sign-in (307) | Does not authenticate a staff role or verify database dependency readiness |

The component matrix covers five notice states, four workspace states
(normal/empty/low-sample/deliberately large counts), native filter submission,
campaign/code dependency, place-change disabling, preserved NFC/Pilot scope,
browser Back/Forward, nonblank trend charts and keyboard horizontal scrolling.
Large-count fixtures are overflow stress data, not a coherent research dataset.
The fixture uses documented Tahoma/Arial font fallbacks; exact Next.js Kanit/Noto
font and authenticated shell fidelity still require real-app acceptance.

The first page-state tests failed against the old behavior; additional default-
retry and unavailable-campaign tests failed before their fixes. Keyboard-region,
Bangkok-generation-time and two-column composition checks also failed before
implementation. Early browser runs exposed harness-only selector/sandbox errors,
which were fixed before the completed 50-check run. A full Vitest sweep was not
rerun for this bounded checkpoint.

## Remaining Gates

1. Authenticated current-build roles and real Supabase option/export/history
   parity, including sign-in expiry and permission changes.
2. Real iPhone/Android rendering and input behavior; the Chromium viewport matrix
   is not physical-device acceptance.
3. Phase 22 production query-plan evidence and database dependency readiness.
4. Phase 21 real approval, ethics, pretest, instrument freeze and Pilot evidence.
5. Phase 23 deployed schema, installation evidence, physical NFC QA and explicit
   human rollout approval. Do not enable flags or create synthetic acceptance.

Git push and a later release smoke establish only code delivery/liveness, not
authenticated dashboard acceptance or database readiness.
