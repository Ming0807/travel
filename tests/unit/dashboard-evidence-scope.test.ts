import { describe, expect, it } from "vitest";

import { visitMatchesDashboardEvidenceScope } from "@/lib/dashboard/evidence-scope";

const visit = (collectionMode?: string, studyKind?: string) => ({
  research_sessions: collectionMode ? [{
    collection_mode: collectionMode,
    status: "completed",
    inclusion_status: "included",
    research_studies: { study_kind: studyKind },
  }] : [],
});

describe("dashboard evidence scope", () => {
  it("keeps unlinked operational visits in field claims and excludes pilot/simulated visits", () => {
    expect(visitMatchesDashboardEvidenceScope(visit(), "field_claim")).toBe(true);
    expect(visitMatchesDashboardEvidenceScope(visit("field_observation", "final_collection"), "field_claim")).toBe(true);
    expect(visitMatchesDashboardEvidenceScope(visit("pilot_internal", "pilot"), "field_claim")).toBe(false);
    expect(visitMatchesDashboardEvidenceScope(visit("simulated_usability", "pilot"), "field_claim")).toBe(false);
  });

  it("selects pilot and simulated evidence explicitly", () => {
    expect(visitMatchesDashboardEvidenceScope(visit("pilot_internal", "pilot"), "pilot_only")).toBe(true);
    expect(visitMatchesDashboardEvidenceScope(visit("simulated_usability", "pilot"), "simulated_only")).toBe(true);
    expect(visitMatchesDashboardEvidenceScope(visit(), "all_records")).toBe(true);
  });
});
