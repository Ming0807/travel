# Research, Attraction Analytics, and Channel Readiness

Date: 2026-09-04. Implementation plan, not a declaration of production readiness.

## Status Audit

| Phase | Implemented foundation | Still required |
|---|---|---|
| 21 Research Pilot | Approval/ethics gates, versioned review evidence, immutable freeze, study-mode restrictions, Pilot review ledger, monitoring UI | Genuine approvals and review records, pretest, current mobile E2E, actual controlled Pilot, human go/no-go decision |
| 22 Attraction analytics | Place filters, typed aggregates, Recharts, expenses/satisfaction, comparison and improvement actions, privacy-safe exports | Production query plans, named/searchable controls, latest-build role/mobile verification, channel acquisition and conversion graphs after reliable tracking |
| 23 NFC | Registry/lifecycle migration, immutable assignment snapshots, read-only resolver, isolated tests | Applied migration, entry-session linkage, canonical-route integration, staff/public UI, graphs, hardware QA and controlled rollout |
| 24 Decision workspace | Shared visual system, quality disclosures, comparison contracts, resolved export scope and report metadata | Remaining authenticated/current-build accessibility, performance and release gates listed in Phase 24 |

Phase 22's historical QA records are not a substitute for testing the latest
shared UI and auth changes. A graph existing in the code is not proof that it
has reliable live input. Existing attraction filters include `entryChannel`,
but that alone does not provide trustworthy QR-vs-NFC conversion.

## Channel Metric Contract (Implement Before Charts)

Use server-recorded entry sessions with immutable channel, code/attraction and
entry time, correlated to visits/rewards. Reading a URL cannot prove the physical
scan/tap occurred; labels must say attributed entry, not verified physical tap.

| Metric | Unit and base | Interpretation |
|---|---|---|
| QR/NFC entry sessions | Distinct valid entry session IDs by server-resolved channel | Which entry links start the flow? Not people, HTTP requests, or visits |
| Channel share | Channel entry sessions / all included entry sessions | Include direct/unknown in the denominator; disclose unsupported attribution |
| Daily channel trend | Distinct entry sessions grouped by Bangkok entry date | Compare like-for-like periods, not mixed visit/event dates |
| Visit conversion | Distinct entry sessions with a linked successful visit / eligible entry sessions in the same cohort | One session counts once even after retries; not number of visits divided by requests |
| Certificate conversion | Distinct cohort sessions with a generated certificate / same eligible entry sessions | Show step conversion separately if its base is successful visits |
| Optional survey conversion | Distinct cohort sessions with a submitted survey / same cohort or explicitly labelled preceding step | Research is optional and must not gate tourist rewards |
| Attribution coverage | Visits with valid channel linkage / included visits | Unknown historical data stays unknown; do not infer QR from an old `qr_scanned` total |

Entry-cohort reports select sessions by their entry date and follow outcomes up
to one disclosed as-of timestamp. The cohort's evidence scope must be recorded
before Visit creation so sessions that abandon before a visit remain in the base.
Missing pre-visit field/pilot attribution is an explicit quality limitation, not
silently assumed field evidence. Report pending follow-up and linkage coverage.
Do not divide events in one date range by visits in another. Imported visits
are operational records, not direct entries or eligible acquisition sessions.

For phase 1 channel reporting, do not declare QR or NFC superior or causal.
Adoption at different places, time periods, devices, or participant modes can
explain differences. Suppress small groups and complementary totals that could
reveal them. No percentage when the base is zero or the read is incomplete.

## Chart and Layout Design

Keep the existing orange/white/black identity. Reuse chart tokens; give QR and
NFC stable distinct series colors plus labels/patterns, direct a third restrained
color, unknown neutral gray. Do not use color alone. No new chart dependency.

1. Executive overview: one compact horizontal channel bar with counts, share,
   coverage, and a link to detailed analysis. Keep the existing top-level outcome
   KPIs; do not add a row of redundant decorative cards.
2. Attraction workspace: `Summary / Channels / Experience / Improvement` in the
   existing information hierarchy. Channels uses a daily QR/NFC line chart and
   an aligned grouped-bar conversion comparison below it, not several donuts.
3. Each panel has full labels, a numerator/base and as-of timestamp, tooltip
   definitions, and a data table. Show one primary chart at a time on mobile;
   details are collapsible, with stable chart heights and no horizontal page scroll.
4. Filtering a place or channel preserves scope in drill-down/export. A single
   selected channel cannot masquerade as an all-channel comparison.
5. States: tracking not activated, no entries, unknown-only history, low sample,
   partial linkage, pending follow-up, stale/truncated read, and permission denied.
   These are different states and must not all render a flat zero chart.

## Phase 21 UX Tasks

- [ ] 21.9a: Put study, approved scope, version, readiness, and the next permitted
  action in the first viewport; use Thai primary labels with technical IDs in details.
- [ ] 21.9b: Guide evidence -> pretest -> freeze -> Pilot -> review -> final
  activation in a step sequence. Each blocked action names the missing evidence
  and links to its form. Never create approval evidence automatically.
- [ ] 21.9c: Reduce repeated configuration entry using existing study/instrument
  values. Display proposed versions for confirmation; do not silently freeze them.
- [ ] 21.9d: Show completion time, abandonment, missingness and instrument version
  before construct scores. Keep withdrawal/retry/decline paths easy on mobile.
- [ ] 21.9e: Validate real-device consent, resume, duplicate submit, and withdrawal;
  preserve guest reward flow when research is declined or fails.

## Phase 22 UX and Quality Tasks

- [ ] 22.11a: Searchable location/check-in controls and genuine campaign names;
  current campaign options are ID-derived (`campaignOptions`), not friendly names.
- [ ] 22.11b: Summary -> primary evidence -> interpretation -> next action;
  avoid exposing every distribution above the decision-making content.
- [ ] 22.11c: Integrate the channel panels above after entry correlation tests pass.
- [ ] 22.11d: Carry scope from a finding to the reviewed improvement issue, owner,
  due date and follow-up evidence; never imply causation from before/after alone.
- [ ] 22.11e: Verify selected-peer eligibility and implement median benchmarks only
  when the comparison population and minimum sample rules are explicit.
- [ ] 22.11f: Check current-build filter/history/export parity and role permissions;
  record real query plans before adding indexes or summary tables.

## Release Gates

Code and data correctness, privacy, accessibility, mobile usability, operational
readiness, and rollback are separate gates. All are required for a company-grade
release; passing a full test suite is one piece of evidence, not all of them.

- Automated: session/retry idempotency, revoked/reassigned tags, unknown history,
  field/pilot separation, denominator correctness, low-cell suppression, exports.
- Browser: 360/390/768/1024/1440 px, long Thai names, keyboard/focus, readable
  labels, real filter/reset/download actions, all recovery states.
- Device: iPhone/Android NFC URI read, Safari/Chrome flow, weak network, QR fallback.
- Operational: named tag custodian, installation/read-back evidence, incident and
  replacement procedure, real research approvals, reversible activation flag.
- Performance: production query plans/latency and current Node 22 build/runtime.

Do not delay the real research pretest waiting for every optional presentation
enhancement. Do not activate unverified NFC tags to make analytics look populated.
