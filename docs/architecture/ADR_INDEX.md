# ADR_INDEX.md

## Architecture Decision Records

This index lists all Architecture Decision Records (ADRs) for the Southern Border Tourism Data & Intelligence Platform.

ADRs document significant architectural decisions, the context that led to them, and the consequences of each decision.

---

## ADR List

| ADR | Title | Status | Date |
|---|---|---|---|
| [ADR-001](adr/ADR_001_TECH_STACK.md) | Technology Stack Selection | Accepted | 2025-01 |
| [ADR-002](adr/ADR_002_NEXTJS_PWA_AS_CORE.md) | Next.js PWA as Core Platform | Accepted | 2025-01 |
| [ADR-003](adr/ADR_003_SUPABASE_POSTGRESQL.md) | Supabase PostgreSQL as Database | Accepted | 2025-01 |
| [ADR-004](adr/ADR_004_IDENTITY_STRATEGY.md) | Multi-Identity Strategy | Accepted | 2025-01 |
| [ADR-005](adr/ADR_005_QR_SINGLE_ENTRY_FLOW.md) | Single QR Entry Flow | Accepted | 2025-01 |
| [ADR-006](adr/ADR_006_CERTIFICATE_AS_INCENTIVE.md) | Certificate as Data Collection Incentive | Accepted | 2025-01 |
| [ADR-007](adr/ADR_007_DASHBOARD_SUMMARY_TABLES.md) | Dashboard Summary Tables | Accepted | 2025-02 |
| [ADR-008](adr/ADR_008_PRIVACY_BY_DESIGN.md) | Privacy by Design | Accepted | 2025-01 |
| [ADR-009](adr/ADR_009_STORAGE_PROVIDER_STRATEGY.md) | Storage Provider Strategy | Accepted | 2026-05 |
| [ADR-010](adr/ADR_010_NFC_CANONICAL_ENTRY.md) | NFC Canonical Entry and Revocable Registry | Accepted; rollout gated | 2026-09-04 |

---

## Latest Strategy Notes

These ADRs should be read with the latest product strategy:

- QR check-in is the main data collection entry point.
- QR opens a location-specific landing page before any form.
- Guest mode uses an anonymous browser/device ID, not IP address.
- Google and LINE are optional tourist account-linking features.
- Google/Gmail-style authentication is appropriate for admin login where configured.
- Certificate download is not blocked by survey, sharing, LINE, Google, email, or phone number.
- Dashboards use aggregated data and do not expose private identifiers.
- Cloudinary is the current storage provider for development and Vercel deployment; storage access must remain behind a server-side adapter so university-hosted storage can replace it later.

---

## ADR Template

New ADRs should follow this format:

```markdown
# ADR-NNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue or question?

## Decision
What is the chosen approach?

## Alternatives Considered
What other options were evaluated?

## Consequences
What are the results of this decision?
```
