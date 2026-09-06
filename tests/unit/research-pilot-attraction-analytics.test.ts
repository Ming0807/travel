import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildAttractionDistribution,
  buildAttractionChannelAnalytics,
  buildAttractionFunnel,
  buildAttractionPeerComparison,
  isOpenFeedbackIssue,
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
  it("excludes pre-Visit pilot and unknown entry cohorts from field claims without requiring research consent", () => {
    const visit = (evidence_scope: string) => ({ checkin_entry_sessions: [{ evidence_scope }] });
    expect(visitMatchesEvidenceScope(visit("pilot_internal"), "field_claim")).toBe(false);
    expect(visitMatchesEvidenceScope(visit("simulated_usability"), "field_claim")).toBe(false);
    expect(visitMatchesEvidenceScope(visit("unknown"), "field_claim")).toBe(false);
    expect(visitMatchesEvidenceScope(visit("field_observation"), "field_claim")).toBe(true);
    expect(visitMatchesEvidenceScope(visit("pilot_internal"), "pilot_only")).toBe(true);
    expect(visitMatchesEvidenceScope(visit("simulated_usability"), "simulated_only")).toBe(true);
    expect(visitMatchesEvidenceScope(visit("unknown"), "all_records")).toBe(true);
  });

  it("measures visit coverage independently from the entry-date cohort", () => {
    const visits = Array.from({ length: 30 }, (_, index) => ({
      visit_id: `visit-${index}`,
      checkin_entry_sessions: index < 20 ? [{
        entry_session_id: `entry-${index}`, entry_channel: "qr",
        evidence_scope: "unknown", created_at: "2026-08-31T16:59:00Z",
      }] : [],
    }));
    const result = buildAttractionChannelAnalytics([], visits, "all_records", true, "2026-09-03T00:00:00Z");
    expect(result.entries).toBe(0);
    expect(result.attributionLinkedVisits).toBe(20);
    expect(result.attributionVisitBase).toBe(30);
    expect(result.attributionCoverage).toBeCloseTo(66.67, 1);
    const smallRemainder = buildAttractionChannelAnalytics([], visits.slice(0, 25), "all_records", true, "2026-09-03T00:00:00Z");
    expect(smallRemainder.attributionCoverage).toBeNull();
    expect(smallRemainder.attributionLinkedVisits).toBeNull();
  });

  it("keeps cross-day outcomes in their entry cohort and excludes future outcomes", () => {
    const rows = Array.from({ length: 30 }, (_, index) => ({
      entry_session_id: `entry-${index}`, entry_channel: "qr", evidence_scope: "unknown",
      created_at: "2026-09-01T16:59:00Z", visit_id: `visit-${index}`,
      visits: { created_at: "2026-09-01T17:01:00Z",
        certificates: [{ generated_at: index < 15 ? "2026-09-02T01:00:00Z" : "2026-09-04T01:00:00Z" }],
        satisfaction_surveys: [],
      },
    }));
    const result = buildAttractionChannelAnalytics([...rows, rows[0]], [], "all_records", true, "2026-09-03T00:00:00Z");
    expect(result.channels[0]).toMatchObject({ entries: 30, linkedVisits: 30, certificates: 15, certificateConversion: 50 });
    expect(result.daily[0]).toMatchObject({ date: "2026-09-01", qr: 30 });
  });

  it("builds like-for-like QR/NFC entry cohorts without inventing physical tap counts", () => {
    const visits = Array.from({ length: 20 }, (_, index) => ({ visit_id: `v${index + 1}` }));
    const entries = [
      ...Array.from({ length: 12 }, (_, index) => ({
        entry_session_id: `q${index}`,
        entry_channel: "qr",
        evidence_scope: "operational_unclassified",
        created_at: `2026-09-${index < 6 ? "01" : "02"}T01:00:00Z`,
        visit_id: `v${index + 1}`,
        visits: { certificates: index < 9 ? [{}] : [], satisfaction_surveys: index < 6 ? [{}] : [] },
      })),
      ...Array.from({ length: 8 }, (_, index) => ({
        entry_session_id: `n${index}`,
        entry_channel: "nfc",
        evidence_scope: "operational_unclassified",
        created_at: "2026-09-01T02:00:00Z",
        visit_id: `v${index + 13}`,
        visits: { certificates: [{}], satisfaction_surveys: [] },
      })),
    ];

    const result = buildAttractionChannelAnalytics(entries, visits, "field_claim", true, "2026-09-03T00:00:00Z");

    expect(result.status).toBe("ready");
    expect(result.entries).toBeNull();
    expect(result.channels[0]).toMatchObject({ channel: "qr", entries: null, linkedVisits: null, visitConversion: null, suppressed: true });
    expect(result.channels[1]).toMatchObject({ channel: "nfc", entries: null, linkedVisits: null, visitConversion: null, suppressed: true });
    expect(result.daily.every((day) => day.nfc === null)).toBe(true);
    expect(result.note).toMatch(/ไม่ใช่จำนวนคน|ไม่ใช่.*ทางกายภาพ/);
  });

  it("separates disabled, unclassified and empty channel states", () => {
    const unknown = [{ entry_session_id: "x", entry_channel: "qr", evidence_scope: "unknown", created_at: "2026-09-01T00:00:00Z", visit_id: null }];
    expect(buildAttractionChannelAnalytics([], [], "field_claim", false).status).toBe("tracking_not_activated");
    expect(buildAttractionChannelAnalytics(unknown, [], "field_claim", true).status).toBe("unclassified_only");
    expect(buildAttractionChannelAnalytics([], [], "field_claim", true).status).toBe("no_entries");
    expect(buildAttractionChannelAnalytics(unknown, [], "all_records", true).status).toBe("ready");
  });

  it("does not count dismissed or closed feedback issues as open work", () => {
    expect(isOpenFeedbackIssue("open")).toBe(true);
    expect(isOpenFeedbackIssue("dismissed")).toBe(false);
    expect(isOpenFeedbackIssue("closed")).toBe(false);
  });

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
    expect(analyticsRepository).toMatch(/\.eq\("attractions\.province_id", selectedProvinceId\)/);
    expect(analyticsRepository).toMatch(/\.eq\("attractions\.attraction_type_id", selectedAttractionTypeId\)/);
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

  it("compares at most three privacy-eligible peers with the same province, type, dates, and evidence scope", () => {
    const visit = (attractionId: number, name: string, overrides: Record<string, unknown> = {}) => ({
      attraction_id: attractionId,
      attractions: { attraction_id: attractionId, name_th: name, province_id: 1, attraction_type_id: 7, is_active: true },
      satisfaction_surveys: [{ overall_score: 4, revisit_intention: "yes", recommend_intention: "yes" }],
      certificates: [{}],
      visit_photos: [{}],
      tourist_stamps: [{ status: "earned" }],
      visit_expenses: [{ spending_ranges: { range_label_th: "501-1,000 บาท" }, expense_categories: { name_th: "อาหาร" } }],
      ...overrides,
    });
    const rows = [
      ...Array.from({ length: 12 }, () => visit(1, "สถานที่หลัก")),
      ...Array.from({ length: 18 }, () => visit(2, "เพื่อน A")),
      ...Array.from({ length: 16 }, () => visit(3, "เพื่อน B")),
      ...Array.from({ length: 14 }, () => visit(4, "เพื่อน C")),
      ...Array.from({ length: 13 }, () => visit(5, "เพื่อน D")),
      ...Array.from({ length: 20 }, () => visit(6, "คนละประเภท", { attractions: { attraction_id: 6, name_th: "คนละประเภท", province_id: 1, attraction_type_id: 8, is_active: true } })),
      ...Array.from({ length: 9 }, () => visit(7, "ฐานต่ำกว่าเกณฑ์")),
    ];

    const result = buildAttractionPeerComparison(rows, {
      attractionId: 1,
      provinceId: 1,
      attractionTypeId: 7,
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      evidenceScope: "field_claim",
    });

    expect(result.status).toBe("ready");
    expect(result.peers.map((peer) => peer.nameTh)).toEqual(["เพื่อน A", "เพื่อน B", "เพื่อน C"]);
    expect(result.eligiblePeerCount).toBe(4);
    expect(result.rankDenominator).toBe(5);
    expect(result.dateAligned).toBe(true);
    expect(result.peers[0]).toMatchObject({
      visits: 18,
      surveyCoverage: 100,
      overallSatisfaction: { value: 4, sampleSize: 18, suppressed: false },
      certificateCompletion: 100,
      revisitRate: { value: 100, sampleSize: 18, suppressed: false },
      topExpenseCategory: { label: "อาหาร", sampleSize: 18, suppressed: false },
    });
  });

  it("withholds peer survey signals below the privacy threshold", () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({
      attraction_id: 2,
      attractions: { attraction_id: 2, name_th: "เพื่อน A", province_id: 1, attraction_type_id: 7, is_active: true },
      satisfaction_surveys: index < 6 ? [{ overall_score: 4, revisit_intention: "yes" }] : [],
      visit_expenses: index < 5 ? [{ expense_categories: { name_th: "อาหาร" } }] : [],
    }));

    const result = buildAttractionPeerComparison(rows, {
      attractionId: 1,
      provinceId: 1,
      attractionTypeId: 7,
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      evidenceScope: "field_claim",
    });

    expect(result.peers[0].overallSatisfaction).toEqual({ value: null, sampleSize: 6, suppressed: true });
    expect(result.peers[0].revisitRate).toEqual({ value: null, sampleSize: 6, suppressed: true });
    expect(result.peers[0].topExpenseCategory).toEqual({ label: null, sampleSize: 5, suppressed: true });
  });
});
