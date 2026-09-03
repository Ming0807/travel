import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildAttractionDistribution,
  buildAttractionFunnel,
  visitMatchesEvidenceScope,
} from "@/lib/services/attraction-analytics.service";
import {
  adminResearchActivationEvidenceSchema,
  adminResearchFreezeSnapshotSchema,
  adminResearchPilotReviewSchema,
} from "@/lib/validation/admin-research";
import { attractionAnalyticsFiltersSchema } from "@/lib/validation/attraction-analytics";

const studyId = "11111111-1111-4111-8111-111111111111";
const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260901000000_activate_research_pilot_and_attraction_analytics.sql"), "utf8");
const analyticsRepository = readFileSync(resolve(process.cwd(), "lib/repositories/attraction-analytics.repository.ts"), "utf8");
const analyticsWorkspace = readFileSync(resolve(process.cwd(), "components/dashboard/AttractionAnalyticsWorkspace.tsx"), "utf8");
const distributionChart = readFileSync(resolve(process.cwd(), "components/dashboard/AttractionDistributionChart.tsx"), "utf8");
const analyticsExportRoute = readFileSync(resolve(process.cwd(), "app/api/admin/dashboard/attractions/export/route.ts"), "utf8");
const analyticsService = readFileSync(resolve(process.cwd(), "lib/services/attraction-analytics.service.ts"), "utf8");

function researchVisit(studyKind: "pilot" | "final_collection", collectionMode: "field_observation" | "simulated_usability" | "pilot_internal") {
  return {
    research_sessions: [{
      status: "completed",
      inclusion_status: "included",
      collection_mode: collectionMode,
      research_studies: { study_kind: studyKind },
    }],
  };
}

describe("Phase 21 research activation", () => {
  it("creates immutable freeze, pilot review, and database activation gates without seed data", () => {
    for (const table of ["research_activation_evidence", "research_freeze_snapshots", "research_pilot_reviews"]) {
      expect(migration).toMatch(new RegExp(`create table public\\.${table}`, "i"));
      expect(migration).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    }
    expect(migration).toContain("RESEARCH_FREEZE_SNAPSHOT_REQUIRED");
    expect(migration).toContain("RESEARCH_APPROVED_SCOPE_REQUIRED");
    expect(migration).toContain("PILOT_FIELD_DEPLOYMENT_NOT_ALLOWED");
    expect(migration).toContain("FINAL_COLLECTION_PILOT_DECISION_REQUIRED");
    expect(migration).toMatch(/before update or delete on public\.research_freeze_snapshots/i);
    expect(migration).toMatch(/before update or delete on public\.research_activation_evidence/i);
    expect(migration).toMatch(/before update or delete on public\.research_pilot_reviews/i);
    expect(migration).toContain("POST_FREEZE_RESEARCH_CONFIGURATION_IMMUTABLE");
    expect(migration).toContain("POST_FREEZE_RESEARCH_PROTOCOL_IMMUTABLE");
    expect(migration).toMatch(/order by evidence\.version_number desc, evidence\.recorded_at desc/i);
    expect(migration).toMatch(/order by review\.reviewed_at desc\s+limit 1/i);
    expect(migration).not.toMatch(/insert\s+into\s+public\.research_(?:studies|activation_evidence|pilot_reviews)/i);
  });

  it("validates traceable evidence, immutable freeze confirmation, and bounded pilot metrics", () => {
    expect(adminResearchActivationEvidenceSchema.safeParse({
      studyId,
      evidenceType: "cognitive_pretest",
      versionNumber: 1,
      status: "passed",
      evidenceDate: "2026-09-01",
      reference: "PRETEST-01",
      summary: "ตรวจความเข้าใจและภาระผู้เข้าร่วมแล้ว",
      participantCount: 8,
      medianCompletionSeconds: 220,
      abandonmentRate: 4.5,
      missingnessRate: 1.2,
    }).success).toBe(true);
    expect(adminResearchActivationEvidenceSchema.safeParse({
      studyId,
      evidenceType: "cognitive_pretest",
      versionNumber: 1,
      status: "passed",
      evidenceDate: "2026-09-01",
      reference: "PRETEST-01",
      summary: "ผลตรวจ",
      abandonmentRate: 120,
    }).success).toBe(false);
    expect(adminResearchFreezeSnapshotSchema.safeParse({
      studyId,
      scoringVersion: "score-1",
      retentionVersion: "retention-1",
      withdrawalVersion: "withdrawal-1",
      languageVersion: "language-1",
      inclusionVersion: "inclusion-1",
      applicationRevision: "abc1234",
      databaseRevision: "20260901000000",
      confirmImmutable: false,
    }).success).toBe(false);
    expect(adminResearchPilotReviewSchema.safeParse({
      studyId,
      decision: "ready_for_field",
      reviewedSessionCount: 12,
      medianCompletionSeconds: 220,
      abandonmentRate: 4.5,
      missingnessRate: 1.2,
      reliabilityNote: "พร้อมรายงาน descriptive pilot reliability",
      decisionRationale: "เวลาทำแบบประเมินและ missingness อยู่ในเกณฑ์",
    }).success).toBe(true);
    expect(adminResearchPilotReviewSchema.safeParse({
      studyId,
      decision: "ready_for_field",
      reviewedSessionCount: 12,
      reliabilityNote: "ยังไม่มีค่าสรุป",
      decisionRationale: "ยังสรุปไม่ได้",
    }).success).toBe(false);
  });
});

describe("Phase 22 attraction evidence scope", () => {
  it("excludes pilot and simulated records from default field claims", () => {
    expect(visitMatchesEvidenceScope({}, "field_claim")).toBe(true);
    expect(visitMatchesEvidenceScope(researchVisit("pilot", "field_observation"), "field_claim")).toBe(false);
    expect(visitMatchesEvidenceScope(researchVisit("final_collection", "simulated_usability"), "field_claim")).toBe(false);
    expect(visitMatchesEvidenceScope(researchVisit("final_collection", "field_observation"), "field_claim")).toBe(true);
  });

  it("supports explicit QA scopes without silently mixing collection modes", () => {
    const pilot = researchVisit("pilot", "pilot_internal");
    const simulated = researchVisit("final_collection", "simulated_usability");
    expect(visitMatchesEvidenceScope(pilot, "pilot_only")).toBe(true);
    expect(visitMatchesEvidenceScope(pilot, "simulated_only")).toBe(false);
    expect(visitMatchesEvidenceScope(simulated, "simulated_only")).toBe(true);
    expect(visitMatchesEvidenceScope(simulated, "all_records")).toBe(true);
  });

  it("requires one attraction and limits analytical ranges to two years", () => {
    expect(attractionAnalyticsFiltersSchema.safeParse({
      attractionId: "4",
      dateFrom: "2026-06-01",
      dateTo: "2026-09-01",
      evidenceScope: "field_claim",
    }).success).toBe(true);
    expect(attractionAnalyticsFiltersSchema.safeParse({
      attractionId: "4",
      dateFrom: "2024-01-01",
      dateTo: "2026-09-01",
      evidenceScope: "field_claim",
    }).success).toBe(false);
  });

  it("limits attraction options and peer comparisons to the active destination boundary", () => {
    expect(analyticsRepository).toContain("listLiveDestinationProvinceIds");
    expect(analyticsRepository).toMatch(/\.in\("province_id", liveProvinceIds\)/);
    expect(analyticsRepository).toMatch(/\.in\("attractions\.province_id", liveProvinceIds\)/);
  });

  it("blocks aggregate export when bounded live reads are incomplete", () => {
    expect(analyticsWorkspace).toContain("!data.quality.truncated");
    expect(analyticsExportRoute).toMatch(/data\.quality\.truncated[\s\S]*status:\s*409/);
  });

  it("uses Recharts for attraction distributions and never plots privacy-suppressed cells", () => {
    expect(analyticsWorkspace).toContain("<AttractionDistributionChart");
    expect(analyticsWorkspace).toContain("<AttractionFunnelChart");
    expect(analyticsWorkspace).toContain("<AttractionScoreChart");
    expect(distributionChart).toContain('data-chart-engine="recharts"');
    expect(distributionChart).toMatch(/rows\.filter\(\(row\) => !row\.suppressed/);
    expect(distributionChart).not.toContain('row.suppressed ? "20%"');
  });

  it("defines each satisfaction dimension once", () => {
    const satisfactionBlock = analyticsService.match(/const satisfaction = \[([\s\S]*?)\n  \];/)?.[1] ?? "";
    expect(satisfactionBlock.match(/scoreMetric\(/g)).toHaveLength(7);
    expect(satisfactionBlock.match(/"value_score"/g)).toHaveLength(1);
  });

  it("uses answered records as each distribution denominator and suppresses small cells", () => {
    const rows = [
      ...Array.from({ length: 12 }, () => ({ answer: "ยะลา" })),
      ...Array.from({ length: 4 }, () => ({ answer: "ปัตตานี" })),
      { answer: null },
    ];
    const distribution = buildAttractionDistribution(rows, (row) => typeof row.answer === "string" ? row.answer : null);

    expect(distribution[0]).toMatchObject({ label: "ยะลา", count: 12, denominator: 16, percent: 75, suppressed: false });
    expect(distribution[1]).toMatchObject({ label: "กลุ่มขนาดเล็ก (ปกปิด)", count: null, sampleSize: 4, denominator: 16, suppressed: true });
  });

  it("builds a monotonic visit-safe reward funnel and withholds incomplete entry conversion", () => {
    const visits = [
      { visit_id: "v1", visit_photos: [{}], certificates: [{}], tourist_stamps: [{ status: "earned" }], satisfaction_surveys: [{}], research_sessions: [{ status: "completed", inclusion_status: "included", research_responses: [{ status: "submitted" }] }] },
      { visit_id: "v2", visit_photos: [{}], certificates: [{}], tourist_stamps: [{ status: "earned" }], satisfaction_surveys: [] },
      { visit_id: "v3", visit_photos: [], certificates: [], tourist_stamps: [], satisfaction_surveys: [] },
    ];
    const funnel = buildAttractionFunnel(visits, [{ event_type: "qr_scanned", visit_id: "v1" }]);

    expect(funnel[0]).toMatchObject({ key: "entry", available: false, conversionFromPrevious: null });
    expect(funnel.map((stage) => stage.count)).toEqual([1, 3, 2, 2, 2, 1, 1]);
    expect(funnel.slice(2).every((stage, index, stages) => index === 0 || stage.count <= stages[index - 1].count)).toBe(true);
  });
});
