# Analytics Product Audit

Date: 3 September 2026

Scope: protected admin dashboards, attraction-level analytics, research analytics, and the public Yala evidence dashboard.

## Executive Finding

The repository already has a credible analytics foundation: server-side aggregation, typed view models, documented metrics, privacy suppression, Recharts visuals, accessible table alternatives, and a production improvement workflow. The remaining product gap is coherence. Users can read individual charts, but the complete system does not yet provide one consistent path from scope to comparison, evidence strength, investigation, action ownership, and follow-up.

Phase 24 should therefore consolidate and deepen the existing system instead of replacing its metric services or adding decorative charts.

## Current Route Inventory

| Route | Primary purpose | Current view/service | Permission or boundary | Main product gap |
|---|---|---|---|---|
| `/admin/dashboard` | Executive overview | `ExecutiveOverview`, `getDashboardViewModel` | `dashboard.read` | Needs period comparison and a tighter decision brief |
| `/admin/dashboard/tourists` | Audience profile | `TouristProfileSection`, shared dashboard service | `dashboard.read` | Needs coverage-first interpretation and segment comparison |
| `/admin/dashboard/visits` | Travel behavior | `TravelBehaviorSection`, shared dashboard service | `dashboard.read` | Needs clearer journey questions and privacy-safe drill-down |
| `/admin/dashboard/expenses` | Self-reported expense signals | `ExpenseSection`, shared dashboard service | `dashboard.read` | Needs coverage and comparison beside every economic claim |
| `/admin/dashboard/satisfaction` | Visitor experience | `SatisfactionSection`, shared dashboard service | `dashboard.read` | Needs issue/action handoff and peer/period context |
| `/admin/dashboard/funnel` | Product journey and drop-off | `FunnelSection`, shared dashboard service | `dashboard.read` | Needs channel/cohort comparison with unit labels kept explicit |
| `/admin/dashboard/attractions` | Single-attraction intelligence | `AttractionAnalyticsWorkspace`, `getAttractionAnalytics` | `dashboard.read`; aggregate export permission checked separately | Uses a separate dense filter contract and raw Campaign ID; needs peer comparison and integrated action creation |
| `/admin/dashboard/sustainability` | Rule-based planning insights | `SustainableTourismSection`, shared dashboard service | `dashboard.read` | Recommendations are readable but action ownership is not embedded |
| `/admin/research/[id]` | Study operations and research analytics | `ResearchAnalyticsWorkspace`, admin research service | research-management boundary | Needs pilot go/no-go sequence, burden/drop-off detail, and instrument freeze prominence |
| `/dashboard` | Public Yala evidence | `PublicEvidenceDashboard`, public dashboard service | public aggregate DTO; threshold `n < 5` suppressed | Must remain simpler than admin and avoid weak-sample trend language |

## What Is Already Strong

- Metric honesty distinguishes scans, visits, profiles, certificates, surveys, and rewards.
- Phase 22 provides attraction-level KPIs, funnel, audience, travel behavior, satisfaction, expense signals, coverage, export, and improvement counts.
- Public and protected views have separate DTO and privacy boundaries.
- Suppressed cells are excluded from plotted values rather than rendered as zero.
- Charts use Recharts and retain structured alternatives for accessibility.
- Sustainability insights are deterministic and state their evidence and confidence.
- Research analytics separates collection modes and avoids causal language for reward engagement.

## Product Gaps

### 1. Navigation and Mental Model

The dashboard is primarily organized by stored data dimensions. This is technically accurate but forces non-analyst users to decide which page contains the answer. Navigation should retain current URLs while grouping them by executive overview, audience, journey, experience, economic signals, attraction intelligence, sustainability/actions, and research quality.

### 2. Scope and Comparison

The shared dashboard has a compact primary filter plus advanced filters, while attraction and research analytics define separate filter forms. Names, query keys, selection controls, and reset behavior are not yet one reproducible scope contract. The attraction page also exposes raw `campaignId`, which is an implementation identifier rather than an operator-friendly choice.

### 3. Evidence Strength

Coverage and suppression are present, but they are distributed across pages. Freshness, sample size, missingness, evidence scope, truncation, and comparison eligibility should use one shared visual and semantic contract before any narrative is shown.

### 4. Comparison and Explanation

Most pages answer `what is the value now`. They do not consistently answer `what changed`, `compared with what`, or `is the difference usable`. Previous-period comparison and eligible-peer comparison should be added with transparent denominators and without significance or causal claims that the current design cannot support.

### 5. Insight to Action

Attraction analytics links to the improvement workspace, but chart findings cannot yet become a prefilled reviewed issue. Sustainability insights also stop at suggested text. A production decision-support system should carry metric key, scope, baseline, evidence date, and attraction into an issue draft, then show owner, due date, status, follow-up, and outcome.

### 6. Page-State Consistency

Dashboard routes repeat similar service error handling. Empty, filtered-to-zero, unavailable, permission-denied, incomplete, suppressed, stale, and truncated states need distinct typed presentation and recovery actions.

### 7. Responsive Reading Order

The current visual system is much stronger than the original dashboard, but dense workspaces still need a guaranteed mobile order: outcome, key chart, interpretation, action, then detail. Advanced filters should not consume the first screen on small devices.

### 8. Legacy Components and Documentation Drift

`ExecutiveAttractionRanking`, `ExecutiveExperienceSummary`, and `StackedDistributionCard` have no non-test consumers in the current source search. They should not be removed until focused tests confirm no runtime or snapshot dependency. Several older phase statuses also describe already implemented work, so the task ledger needs a dedicated reconciliation pass.

## Chart Decision Standard

| Question | Preferred visual | Avoid |
|---|---|---|
| How did a metric change over time? | Line or restrained area chart with a usable multi-point series | Inferring trend from one point |
| Which categories rank highest? | Sorted horizontal bar with count, denominator, and coverage | Donut charts with many categories |
| Where does an ordered flow lose users? | Funnel or step bars with count, conversion, and drop-off | Comparing raw event totals as unique people |
| Which attractions combine demand and experience? | Labelled scatter/quadrant with peer definition | Arbitrary ranking without eligibility rules |
| Is a metric near a documented target? | Bullet/progress visual with target source | Undocumented target lines |
| What proportion belongs to a small exclusive set? | Stacked bar; donut only when labels remain readable | Decorative pies or 3D charts |

## Recommended Delivery Order

1. Standardize page header, navigation, page states, and scope contract.
2. Add previous-period comparison and the shared quality/confidence strip.
3. Recompose the executive overview into a one-minute decision brief.
4. Add attraction peer comparison and direct issue/action handoff.
5. Refine audience, journey, experience, and economic modules.
6. Recompose research analytics around pilot readiness and burden.
7. Add saved aggregate views and reproducible report metadata.
8. Measure query plans, harden responsive/accessibility behavior, and run controlled production QA.

The detailed tasks and acceptance criteria are maintained in `tasks/PHASE_24_ANALYTICS_DECISION_INTELLIGENCE.md`.

