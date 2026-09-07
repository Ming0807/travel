# Summary Evidence Scope Audit

Date: September 7, 2026. Application code audit, not production SQL verification.

## Active Read Path

The public dashboard route calls `getPublicDashboardEvidence`, which resolves
Yala and calls `getPublicDashboardAnalytics`. That service shares the live
repository and calculation path with the admin dashboard. Repository Visits
are filtered through the shared evidence predicate. With entry tracking enabled,
entry snapshots take precedence over optional research participation.

The public evidence wrapper now pins both accepted parameter aliases to
`field_claim`. A caller cannot relabel simulation/all-record evidence as public
field statistics by supplying an alternate scope. Current public route does not
forward search parameters, but the guard protects future callers too.

## Legacy Daily Summary

`dashboard_daily_summary` and `refresh_dashboard_summary` predate the research
scope model. Their SQL aggregates do not have an evidence dimension. Searches of
current application callers found no active use of the five legacy summary
readers; the refresh action remains an operational maintenance endpoint.

The common summary query builder now rejects implicit/default field scope,
explicit field/pilot/simulation scopes and unsupported filters. Only explicit
`all_records` with date range and optional attraction ID may use this diagnostic
read path. Rejection throws `DASHBOARD_SUMMARY_SCOPE_UNSUPPORTED`; it does not
return a misleading zero or empty result for an unsupported question.

Do not reintroduce these readers as a field-data fallback. A future scoped read
model needs an explicit evidence dimension, correct unique-tourist aggregation,
multi-category parity, freshness metadata and measured query-plan evidence.

## Boundaries

No SQL or rollout flags changed. Existing SQL views/RPC grants, direct anonymous
access and complete staging behavior still require database-level review. The
legacy refresh procedure has not been rewritten or certified for field claims.
