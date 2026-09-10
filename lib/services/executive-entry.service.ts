import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { readExecutiveEntryCohort } from "@/lib/repositories/executive-entry.repository";
import { buildAttractionChannelAnalytics } from "@/lib/services/attraction-analytics.service";
import { dashboardFiltersSchema } from "@/lib/validation/dashboard-filters";
import type { EntryChannelExportData } from "@/lib/dashboard/channel-export";
import type { PostEntryFilterKey } from "@/lib/dashboard/entry-cohort-filter-support";

export type ExecutiveEntryAnalytics = {
  status: "ready" | "disabled" | "unsupported_filters" | "incomplete" | "unavailable";
  asOf: string | null;
  unsupportedFilters: PostEntryFilterKey[];
  data: EntryChannelExportData | null;
};

export async function getExecutiveEntryAnalytics(input: unknown): Promise<ExecutiveEntryAnalytics> {
  await requirePermission("dashboard.read", { unauthenticated: "throw" });
  const filters = dashboardFiltersSchema.parse(input);
  let cohort;
  try {
    cohort = await readExecutiveEntryCohort(filters);
  } catch {
    return { status: "unavailable", asOf: null, unsupportedFilters: [], data: null };
  }
  if (cohort.status !== "ready") return { status: cohort.status, asOf: cohort.asOf, unsupportedFilters: cohort.unsupportedFilters, data: null };
  const aggregate = buildAttractionChannelAnalytics(cohort.rows, [], filters.evidenceScope, true, cohort.asOf);
  // Select only entry-cohort metrics; a Visit-date coverage denominator is absent.
  const data: EntryChannelExportData = {
    status: aggregate.status, asOf: aggregate.asOf, entries: aggregate.entries,
    channels: aggregate.channels, daily: aggregate.daily,
    note: "นับรอบเริ่มเข้าใช้งานตามวันเริ่ม และติดตามผลถึงเวลาที่ระบุ ไม่ใช่จำนวนคนหรือหลักฐานการแตะแท็กจริง",
  };
  return { status: "ready", asOf: cohort.asOf, unsupportedFilters: [], data };
}
