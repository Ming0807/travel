# Phase 23 Status Audit

Date: 2026-09-27. Scope: reconcile Phase 23 checklist claims to local code and
checked-in execution reports. This was a source/document review only; no tests,
build, database connection, schema inspection, or environment-flag inspection was
run for this audit. “Implemented” below means local code plus cited verification,
not deployed or human/device acceptance.

## Checklist Evidence Map

| Item | Reconciled status | Evidence and boundary |
|---|---|---|
| 23.1 ADR/threat model | Implemented locally | [ADR-010](../architecture/adr/ADR_010_NFC_CANONICAL_ENTRY.md) defines canonical URL, assignment lifecycle, trust limits and operational threats. Registry foundation report records focused verification. |
| 23.2 Data contract | Local implementation verified; deployment pending | Registry migration, immutable lifecycle/audit, repository and entry-session/Visit contract are present. [Foundation QA](PHASE_23_NFC_FOUNDATION_QA_2026-09-04.md): 6 files/75 tests and disposable PostgreSQL assertions; [entry-session report](../../tasks/PHASE_23_ENTRY_SESSION_IMPLEMENTATION.md): 24 SQL assertions initially, then 36 for pre-Visit scope. These do not establish current deployed schema. |
| 23.3 Canonical resolution | Default-off local integration implemented; full acceptance pending | `/c/[code]` imports the entry service, resolves registered NFC, separates QR event emission, binds flow to browser/code, and checks lifecycle in session RPCs. [Entry-session report](../../tasks/PHASE_23_ENTRY_SESSION_IMPLEMENTATION.md) records 8 focused files/85 tests, TypeScript, scoped lint/build; it explicitly leaves multi-tab/research correlation and release gates open. |
| 23.4 Admin provisioning | Core lifecycle UI implemented; installation evidence incomplete | [Admin operations](../backend/NFC_ADMIN_OPERATIONS.md) documents permission-guarded provision, payload, read-back verification, activation/deactivation/revocation, replacement and audit. It records a 25-test action/service/repository run; later completion notes record 31, 44 and 49 focused NFC-test checkpoints. Authenticated live-role QA remains open. |
| 23.5 Public verification UX | Partial | Valid entry displays attraction/location context, but failed NFC entry maps to a generic unavailable state; a complete NFC-specific official-domain and revoked/unknown recovery experience is not evidenced. |
| 23.6 Physical deployment | Operational guidance and report UI partial; physical/install acceptance pending | [Deployment guide](../backend/NFC_FIELD_DEPLOYMENT_GUIDE.md) covers official-domain labels, QR fallback, read-back, tamper response and replacement. [Field-check records](../backend/NFC_FIELD_CHECK_RECORDS.md) documents immutable staff reports and local PostgreSQL checks; installation-photo workflow, complete staging and physical acceptance remain open. |
| 23.7a Sessions/linkage | Implemented locally | Entry-session migration/service links immutable channel context to Visit creation and rewards; SQL harness evidence is recorded in the entry-session report. |
| 23.7b Distribution/trends | Partial | QR/NFC session and Visit-channel analytics are present, but direct/unknown/admin-import populations do not share a complete entry-session denominator. Do not report these views as full all-channel entry distributions. |
| 23.7c Conversion | Implemented locally; staging pending | Entry-start cohort aggregation uses shared as-of and evidence-scope rules with numerator/base and blocked-quality states. [Executive entry cohort report](../dashboard/EXECUTIVE_ENTRY_COHORT.md) records repository, aggregation/export and UI focused test runs, including 41 dashboard wrapper tests and 16 service/export/Visit-channel tests; Chromium fixture checks are synthetic, not production data. |
| 23.7d Channel UX | Implemented locally; production acceptance pending | Executive entry-cohort chart/table and attraction channel panel are wired. The same cohort report records 360/768/1440px fixture verification and a Node 22 production build at its integration checkpoint. |
| 23.7e Filter/export parity | Implemented in part; review pending | Local code/tests carry filter and export state, but full filter/peer-comparison parity is not signed off by this audit; parent review is separate. No claim of live-role or deployed parity. |
| 23.7f Analytics regressions | Automated local coverage exists | Focused analytics/session tests and reports exercise unknown/low-sample/suppressed states, cohort cutoff and retry behavior. This is not validation against production data or device behavior. |
| 23.8 Security/permission regressions | Local automated coverage executed; live authorization QA pending | Registry/action/session test suites and disposable PostgreSQL reports cover unsafe payload constraints, revoked/reassigned tags, retry/immutability, permission denial and audit behavior. [September 11 checkpoint](../../tasks/PHASE_23_24_COMPLETION_SEQUENCE.md) records 26 NFC/admin-NFC files and 287 tests passed. This does not replace authenticated full-schema role testing. |
| 23.9 Real-device QA | Pending | No evidence found of physical iPhone/Android NFC reads, mobile Safari/Chrome acceptance, weak-network tests, or on-device QR fallback. |
| 23.10 Controlled rollout | Pending | No evidence found of an approved pilot, monitored field outcomes/incidents, or human go/no-go authorization. |

## Executed-Test Record

- 2026-09-04 registry foundation: 6 focused files/75 tests; disposable PostgreSQL 29 assertions; typecheck, scoped ESLint and build passed. This is foundation-only evidence, not route/device acceptance.
- 2026-09-05 canonical/session integration: 8 focused files/85 tests; local PostgreSQL session/research-scope assertion runs recorded as 24 then 36; TypeScript, scoped ESLint and production build passed at that checkpoint. The report leaves explicit multi-tab/research review and release gates open.
- NFC admin/field follow-ups: [completion sequence](../../tasks/PHASE_23_24_COMPLETION_SEQUENCE.md) records focused runs and the 2026-09-11 26-file/287-test regression sweep. Field-check reports record minimal-schema PostgreSQL harnesses, not full Supabase staging.
- Channel analytics: [entry cohort evidence](../dashboard/EXECUTIVE_ENTRY_COHORT.md) records focused repository/aggregation/UI/export tests, responsive Chromium fixture runs and a Node 22 build at its UI checkpoint. Synthetic fixtures do not prove authenticated live database behavior.
- The interrupted full-suite attempt in [NFC recovery review](NFC_RECOVERY_REVIEW_20260910.md) is explicitly not a pass. No full suite or build was run for this audit.

## Residual Gates

1. Keep `CHECKIN_ENTRY_SESSIONS_ENABLED` and `NFC_CHECKIN_ENABLED` default-off. No current environment values were inspected or changed.
2. Treat production migration application and deployed schema as unverified. Historical user-reported application or REST object discovery is not a current full permission/function-body verification; obtain approved read-only staging/catalog evidence before activation. Do not rerun migrations as part of this audit.
3. Complete NFC-specific failed-entry recovery, installation record/photo workflow, full-schema and authenticated-role QA, and explicit multi-tab/research correlation acceptance.
4. Finish 23.7b channel population semantics and 23.7e filter/export parity review; preserve direct, unknown and admin-import distinctions and do not infer historical channels.
5. Run physical-device/mobile/network acceptance and obtain documented human pilot/go-no-go approval before any tag installation/activation or widened rollout.

No concrete new runtime bug was established during this source-only audit. The generic NFC failure state and incomplete installation evidence are tracked as scope gaps above, not classified as defects without stronger acceptance evidence.

## Read-Only Deployed-Schema Follow-up (2026-09-27)

This follow-up is separate from the source-only audit above. The configured
`SUPABASE_DATABASE_URL` targets the same project as the public Supabase REST
endpoint. `node scripts/verify-nfc-release-schema.mjs` attempted its `BEGIN READ
ONLY` catalog check but could not resolve the direct PostgreSQL hostname
(`ENOTFOUND`); it applied no SQL.

Using the configured service-role credential, the project's REST OpenAPI schema
responded HTTP 200 and exposed `nfc_tags`, `nfc_tag_events`,
`checkin_entry_sessions`, and the four expected RPC paths:
`begin_checkin_entry`, `read_checkin_entry`, `create_checkin_entry_visit`, and
`accept_entry_research_invitation`. Its `checkin_entry_sessions` definition
included `research_study_id_snapshot`, `research_frozen_at_snapshot`,
`evidence_scope_reason`, `entry_channel`, and `nfc_tag_id`. A HEAD request to
the entry-session table selecting only those five columns with `limit=0`
returned HTTP 200; no participant rows were requested or returned.

These checks establish object/column discovery through the deployed REST
schema. They do not prove trigger enablement, grants, live function bodies,
current rollout flags, or authenticated user journeys. The direct catalog
verifier still needs a reachable approved PostgreSQL connection before the
schema/permission gate can be signed off. No migration or configuration was
changed in this follow-up.
