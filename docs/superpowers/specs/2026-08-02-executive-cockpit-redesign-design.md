# Executive Cockpit Redesign

## Purpose

Redesign `/admin/dashboard` so an administrator can understand current tourism participation, data-collection performance, attraction demand, and experience quality within one desktop viewport. The composition follows the density and hierarchy of the supplied reference without copying its brand, content, or decorative treatment.

## Approved Direction

Use an **Executive Cockpit** layout:

1. Compact page header with Yala rollout context and export action.
2. A single-line data context and collapsed filter control before the analytics.
3. Four primary KPI cells: tourist profiles, recorded visits, certificates generated, and survey completion.
4. A dominant visit trend chart paired with a QR-to-certificate funnel completion ring.
5. A top-attractions ranking paired with an experience-quality panel.
6. Existing detailed dashboard tabs remain available for deeper analysis.

## Visual Language

- Use near-black, white, neutral gray, and the existing brand orange `#B94727`.
- Use mostly square geometry with `4-6px` corner radius.
- Use restrained shadows with no more than `8px` blur on dashboard panels.
- Do not use gradients, glassmorphism, nested cards, oversized headings, or decorative animation.
- Use orange only for active navigation, primary progress, and the most important action.
- Keep semantic amber, rose, blue, green, and teal for warnings and analytical categories.

## Information Architecture

### Header and Filters

The header communicates that Yala is the current rollout. Data freshness, date range, source, and sample size remain visible in one compact strip. The full filter form is collapsed behind a clearly labelled control because the date range is already visible and filters are adjusted less often than metrics are read.

### KPI Band

Show exactly four primary KPIs. Satisfaction moves to the experience panel where its response count and intent metrics provide the necessary interpretation. Only the recorded-visits KPI may use the visit trend sparkline.

### Main Analytics

The visit trend occupies two-thirds of the main row. The funnel ring occupies one-third and reports:

- QR scans
- certificates generated
- completed surveys
- QR-to-certificate completion rate
- certificate-to-survey completion rate

Zero denominators display `ยังคำนวณไม่ได้`; they never display a misleading `0%`.

### Secondary Analytics

The attraction ranking occupies two-thirds of the lower row. The experience panel occupies one-third and reports:

- average satisfaction or `ยังไม่มีข้อมูล`
- satisfaction response count
- revisit intention rate
- recommendation intention rate
- score distribution

The province comparison chart is removed from the executive page because the current rollout is Yala-only. Province comparison remains appropriate when multiple destination provinces are activated.

## Data and Privacy Rules

- Use the existing `DashboardViewModel`; do not add database queries or migrations.
- QR scans remain funnel events, not visits.
- Tourist profiles remain profiles, not verified unique people.
- Satisfaction averages exclude missing answers.
- Dashboard output remains aggregated and does not expose personal identifiers.
- All new chart summaries include semantic text or table equivalents.

## Responsive Behavior

- Desktop: KPI band and two asymmetric analysis rows should fit near the first viewport at `1280px` width.
- Tablet: panels become two columns where space permits.
- Mobile: all panels stack, tabs scroll horizontally, the filter form expands in normal document flow, and the page has no horizontal overflow at `375px`.
- Touch controls have a minimum height of `44px`.

## Testing

- Unit-test funnel percentage handling, including zero denominators.
- Unit-test satisfaction no-data and response-count behavior.
- Preserve the existing accessible table for visit trends and attraction rankings.
- Run dashboard unit tests, full lint, typecheck, full test suite, production build, Impeccable detection, and browser checks across all dashboard routes.

## Out of Scope

- New analytics SQL, summary tables, or metric definitions.
- Changes to detailed tourist, expense, satisfaction, or sustainability formulas.
- Province data deletion or Yala-only database migration.
- Animated or real-time charts.
