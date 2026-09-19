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
  it("uses immutable entry scope before optional research participation", () => {
    for (const evidence_scope of ["unknown", "pilot_internal", "simulated_usability"]) {
      expect(visitMatchesDashboardEvidenceScope({ checkin_entry_sessions: [{ evidence_scope }] }, "field_claim")).toBe(false);
    }
    expect(visitMatchesDashboardEvidenceScope({ checkin_entry_sessions: [{ evidence_scope: "field_observation" }] }, "field_claim")).toBe(true);
  });
  it("requires explicit field evidence and excludes unclassified, pilot, and simulated visits", () => {
    expect(visitMatchesDashboardEvidenceScope(visit(), "field_claim")).toBe(false);
    expect(visitMatchesDashboardEvidenceScope({ checkin_entry_sessions: [{ evidence_scope: "operational_unclassified" }] }, "field_claim")).toBe(false);
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
