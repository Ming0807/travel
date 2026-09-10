import { buildEntryChannelExportRows } from "@/lib/dashboard/channel-export";
import type { ExecutiveEntryAnalytics } from "@/lib/services/executive-entry.service";

export function buildExecutiveEntryExportRows(result: ExecutiveEntryAnalytics) {
  if (result.status === "ready" && result.data) return buildEntryChannelExportRows(result.data);
  return [
    { Section: "Entry channel metadata", Metric: "status", Value: result.status === "ready" ? "unavailable" : result.status, Denominator: "", Note: "No partial or zero-filled conversion metrics" },
    { Section: "Entry channel metadata", Metric: "as_of", Value: result.asOf ?? "UNAVAILABLE", Denominator: "", Note: "Entry-start cohort; not Visit-date coverage" },
    { Section: "Entry channel metadata", Metric: "unsupported_filters", Value: result.unsupportedFilters.join(","), Denominator: "", Note: "Field names only; no selected respondent values" },
  ];
}
