# ADR-007: Dashboard Summary Tables

## Status

Accepted

## Context

The dashboard needs to display aggregated metrics (total visits, average satisfaction, spending distribution, etc.) across potentially thousands of records.

Direct aggregation queries against raw tables may:

- Be slow for large datasets
- Cause high database load
- Result in slow dashboard loading times
- Block concurrent admin users

## Decision

Use **pre-aggregated summary tables** for dashboard queries instead of querying raw data tables directly.

### Summary Table Design

```text
daily_attraction_stats
    date, attraction_id, province_id,
    total_visits, total_certificates, total_stamps,
    avg_satisfaction, total_surveys, total_expenses,
    unique_tourists, new_tourists, returning_tourists

monthly_province_stats
    month, province_id,
    total_visits, total_certificates,
    avg_satisfaction, total_spending_estimated,
    unique_tourists, survey_completion_rate
```

### Refresh Strategy

**MVP:** Refresh on-demand when admin opens dashboard (with caching)

**Production:**
- Scheduled refresh via cron job (every hour or daily)
- Incremental updates for new data
- Cache invalidation on manual data changes

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Direct aggregation queries only | Slow for large datasets, high DB load |
| Materialized views | PostgreSQL materialized views require manual refresh, less flexible |
| External analytics service | Adds complexity and cost |
| Client-side aggregation | Fetches too much data to client |

## Consequences

**Positive:**
- Fast dashboard loading (pre-calculated)
- Reduced database load for concurrent dashboard users
- Predictable query performance regardless of data volume
- Can add more summary dimensions without affecting raw tables
- Compatible with future caching layer

**Negative:**
- Data may be slightly stale between refreshes
- Additional tables to maintain
- Refresh logic must be implemented and scheduled
- Must handle cases where summary and raw data temporarily disagree
