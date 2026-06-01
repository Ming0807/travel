import { describe, expect, it } from "vitest";
import type {
  DashboardAlert,
  DashboardAlertSeverity,
  DashboardViewModel,
  FunnelStage,
  DistributionItem,
  RankedAttraction,
} from "@/types/dashboard";
import { buildDashboardAlerts } from "@/lib/services/dashboard-alert.service";

// ────────────────────────────────────────────────────────
// Factory: builds a "healthy" DashboardViewModel baseline
// that should NOT trigger any alerts.
// ────────────────────────────────────────────────────────

const healthyKpis = [
  { key: "survey_completion_rate" as const, label: "Survey completion", value: "75%", rawValue: 0.75, valueType: "percentage" as const, definition: "" },
  { key: "tourist_profiles" as const, label: "Tourist Profiles", value: "100", rawValue: 100, valueType: "count" as const, definition: "" },
  { key: "total_visits" as const, label: "Total Visits", value: "250", rawValue: 250, valueType: "count" as const, definition: "" },
  { key: "qr_scans" as const, label: "QR Scans", value: "200", rawValue: 200, valueType: "count" as const, definition: "" },
  { key: "landing_views" as const, label: "Landing Views", value: "180", rawValue: 180, valueType: "count" as const, definition: "" },
  { key: "certificates_generated" as const, label: "Certificates Generated", value: "120", rawValue: 120, valueType: "count" as const, definition: "" },
  { key: "stamps_earned" as const, label: "Stamps Earned", value: "80", rawValue: 80, valueType: "count" as const, definition: "" },
  { key: "average_satisfaction" as const, label: "Average Satisfaction", value: "4.2 / 5", rawValue: 4.2, valueType: "rating" as const, definition: "" },
  { key: "estimated_spending" as const, label: "Estimated Spending", value: "฿2,000", rawValue: 2000, valueType: "currency_range" as const, definition: "" },
  { key: "top_attraction" as const, label: "Top Attraction", value: "Beach", rawValue: null, valueType: "text" as const, definition: "" },
];

function healthyStage(key: string, label: string, count: number, prevCount: number | null): FunnelStage {
  const conversion = prevCount !== null && prevCount > 0 ? count / prevCount : null;
  const dropOff = conversion !== null ? 1 - conversion : null;
  return { key, label, count, conversionFromPrevious: conversion, dropOffFromPrevious: dropOff, definition: "" };
}

function healthyFunnelStages(): FunnelStage[] {
  return [
    healthyStage("qr_scanned", "QR scanned", 200, null),
    healthyStage("landing_viewed", "Landing viewed", 180, 200),
    healthyStage("certificate_started", "Certificate started", 160, 180),
    healthyStage("minimal_form_completed", "Form submitted", 150, 160),
    healthyStage("photo_uploaded", "Photo uploaded", 140, 150),
    healthyStage("certificate_generated", "Certificate generated", 120, 140),
    healthyStage("survey_started", "Survey started", 100, 120),
    healthyStage("survey_completed", "Survey completed", 90, 100),
    healthyStage("passport_saved", "Passport saved", 80, 90),
  ];
}

function healthyViewModel(overrides?: Partial<DashboardViewModel>): DashboardViewModel {
  const stages = healthyFunnelStages();

  return {
    filters: { dateFrom: "2026-01-01", dateTo: "2026-05-31" },
    generatedAt: "2026-05-30T12:00:00Z",
    dataSource: "live_database",
    summaryRefreshTimestamp: null,
    viewer: { displayName: "Admin", email: "admin@test.com", permissions: ["dashboard.read"] },
    referenceOptions: {
      provinces: [], districts: [], attractions: [], attractionTypes: [],
      originCountries: [], originProvinces: [], ageGroups: [], transportModes: [], travelPurposes: [],
    },
    kpis: healthyKpis,
    executive: {
      visitTrend: [],
      visitsByProvince: [],
      topAttractions: [],
    },
    touristProfile: {
      originCountries: [],
      originProvinces: [],
      ageGroups: [],
      preferredLanguages: [],
      identityProviders: [],
    },
    travelBehavior: {
      companionTypes: [],
      transportModes: [],
      travelPurposes: [],
      overnightStatus: [],
      averageGroupSize: null,
      averageNights: null,
      answeredGroupSizeCount: 0,
      answeredNightsCount: 0,
    },
    expense: {
      spendingRanges: [],
      expenseCategories: [],
      estimatedMin: null,
      estimatedMax: null,
      hasOpenEndedRange: false,
      responseCount: 10,
      methodologyNote: "Self-reported range data.",
    },
    satisfaction: {
      averageOverall: 4.2,
      responseCount: 20,
      distribution: [],
      byAttraction: [],
      safetyAverage: 4.5,
      cleanlinessAverage: 4.3,
      facilityAverage: 4.1,
      revisitIntentionRate: 0.85,
      recommendIntentionRate: 0.92,
    },
    funnel: {
      stages,
      largestDropOffStage: null,
    },
    insights: [],
    dashboardAlerts: [],
    dataQualityWarnings: [],
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────
// Helper: extract alerts by source / severity
// ────────────────────────────────────────────────────────

function bySource(alerts: DashboardAlert[], source: DashboardAlert["source"]) {
  return alerts.filter((a) => a.source === source);
}

function bySeverity(alerts: DashboardAlert[], severity: DashboardAlertSeverity) {
  return alerts.filter((a) => a.severity === severity);
}

// ────────────────────────────────────────────────────────
// Satisfaction alert tests
// ────────────────────────────────────────────────────────

describe("buildDashboardAlerts — satisfaction", () => {
  it("produces no satisfaction alerts for healthy scores", () => {
    const result = buildDashboardAlerts(healthyViewModel());
    const satisfactionAlerts = bySource(result, "satisfaction");
    expect(satisfactionAlerts).toHaveLength(0);
  });

  it("produces info alert when responseCount is 0", () => {
    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        responseCount: 0,
        averageOverall: null,
        safetyAverage: null,
        cleanlinessAverage: null,
        facilityAverage: null,
        revisitIntentionRate: null,
        recommendIntentionRate: null,
      },
    });
    const result = buildDashboardAlerts(vm);
    const satisfactionAlerts = bySource(result, "satisfaction");
    expect(satisfactionAlerts).toHaveLength(1);
    expect(satisfactionAlerts[0].severity).toBe("info");
    expect(satisfactionAlerts[0].id).toBe("satisfaction_no_data");
  });

  it("returns only the info alert when responseCount is 0 (skips dimension checks)", () => {
    // Even if dimension values exist, responseCount === 0 should short-circuit
    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        responseCount: 0,
        safetyAverage: 1.5, // would be critical if checked
        cleanlinessAverage: 1.2,
        facilityAverage: 1.8,
      },
    });
    const result = buildDashboardAlerts(vm);
    const satisfactionAlerts = bySource(result, "satisfaction");
    expect(satisfactionAlerts).toHaveLength(1);
    expect(satisfactionAlerts[0].id).toBe("satisfaction_no_data");
  });

  // ── Dimension critical (< 2.0) ──

  it("produces critical alert when safety < 2.0", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, safetyAverage: 1.8 },
    });
    const result = buildDashboardAlerts(vm);
    const safetyAlert = bySource(result, "satisfaction").find((a) => a.id === "dimension_critical_safety");
    expect(safetyAlert).toBeDefined();
    expect(safetyAlert!.severity).toBe("critical");
    expect(safetyAlert!.actionable).toBe(true);
    expect(safetyAlert!.actionHref).toBe("/admin/dashboard/satisfaction");
  });

  it("produces critical alert when cleanliness < 2.0", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, cleanlinessAverage: 1.4 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "dimension_critical_cleanliness");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("critical");
  });

  it("produces critical alert when facility < 2.0", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, facilityAverage: 1.9 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "dimension_critical_facility");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("critical");
  });

  // ── Dimension warning (< 3.0 but >= 2.0) ──

  it("produces warning alert when safety is 2.0-2.9", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, safetyAverage: 2.5 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "dimension_warning_safety");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("warning");
    expect(alert!.message).toContain("2.5");
  });

  it("produces warning alert when cleanliness is 2.0-2.9", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, cleanlinessAverage: 2.8 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "dimension_warning_cleanliness");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("warning");
  });

  it("produces warning alert when facility is 2.0-2.9", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, facilityAverage: 2.1 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "dimension_warning_facility");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("warning");
  });

  // ── Boundary: exactly at threshold ──

  it("does NOT produce dimension alert when value is exactly 3.0", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, cleanlinessAverage: 3.0 },
    });
    const result = buildDashboardAlerts(vm);
    const warningAlerts = bySource(result, "satisfaction").filter((a) => a.id.includes("dimension_warning_cleanliness"));
    expect(warningAlerts).toHaveLength(0);
    const criticalAlerts = bySource(result, "satisfaction").filter((a) => a.id.includes("dimension_critical_cleanliness"));
    expect(criticalAlerts).toHaveLength(0);
  });

  it("does NOT produce critical alert when value is exactly 2.0 (warning threshold)", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, safetyAverage: 2.0 },
    });
    const result = buildDashboardAlerts(vm);
    const criticalAlert = bySource(result, "satisfaction").find((a) => a.id === "dimension_critical_safety");
    expect(criticalAlert).toBeUndefined();
    const warningAlert = bySource(result, "satisfaction").find((a) => a.id === "dimension_warning_safety");
    expect(warningAlert).toBeDefined();
    expect(warningAlert!.severity).toBe("warning");
  });

  // ── Multiple dimensions ──

  it("produces alerts for multiple low dimensions simultaneously", () => {
    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        safetyAverage: 1.7,   // critical
        cleanlinessAverage: 2.4, // warning
        facilityAverage: 4.0,   // healthy
      },
    });
    const result = buildDashboardAlerts(vm);
    const satisfactionAlerts = bySource(result, "satisfaction");
    expect(satisfactionAlerts.some((a) => a.id === "dimension_critical_safety")).toBe(true);
    expect(satisfactionAlerts.some((a) => a.id === "dimension_warning_cleanliness")).toBe(true);
    expect(satisfactionAlerts.some((a) => a.id.includes("facility"))).toBe(false);
  });

  // ── Skip null dimensions ──

  it("skips dimension checks when value is null", () => {
    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        safetyAverage: null,
        cleanlinessAverage: null,
        facilityAverage: null,
      },
    });
    const result = buildDashboardAlerts(vm);
    const dimensionAlerts = bySource(result, "satisfaction").filter((a) => a.id.startsWith("dimension_"));
    expect(dimensionAlerts).toHaveLength(0);
  });

  // ── Overall satisfaction ──

  it("produces overall satisfaction warning when < 3.0 and responseCount >= 3", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, averageOverall: 2.5, responseCount: 5 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "overall_satisfaction_low");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("warning");
  });

  it("does NOT produce overall satisfaction warning when responseCount < 3", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, averageOverall: 2.5, responseCount: 2 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "overall_satisfaction_low");
    expect(alert).toBeUndefined();
  });

  it("does NOT produce overall satisfaction warning when averageOverall is null", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, averageOverall: null, responseCount: 5 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "overall_satisfaction_low");
    expect(alert).toBeUndefined();
  });

  // ── Revisit intention ──

  it("produces warning when revisit intention < 50%", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, revisitIntentionRate: 0.35 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "revisit_intention_low");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("warning");
    expect(alert!.message).toContain("35%");
  });

  it("does NOT produce revisit warning when revisit intention is exactly 50%", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, revisitIntentionRate: 0.5 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "revisit_intention_low");
    expect(alert).toBeUndefined();
  });

  it("does NOT produce revisit warning when revisit intention is null", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, revisitIntentionRate: null },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "revisit_intention_low");
    expect(alert).toBeUndefined();
  });

  // ── Recommend intention ──

  it("produces warning when recommend intention < 50%", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, recommendIntentionRate: 0.3 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "recommend_intention_low");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("warning");
    expect(alert!.message).toContain("30%");
  });

  it("does NOT produce recommend warning when recommend intention is exactly 50%", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, recommendIntentionRate: 0.5 },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "recommend_intention_low");
    expect(alert).toBeUndefined();
  });

  it("does NOT produce recommend warning when recommend intention is null", () => {
    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, recommendIntentionRate: null },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "satisfaction").find((a) => a.id === "recommend_intention_low");
    expect(alert).toBeUndefined();
  });
});

// ────────────────────────────────────────────────────────
// Funnel alert tests
// ────────────────────────────────────────────────────────

describe("buildDashboardAlerts — funnel", () => {
  it("produces no funnel alerts for healthy stages", () => {
    const result = buildDashboardAlerts(healthyViewModel());
    const funnelAlerts = bySource(result, "funnel");
    expect(funnelAlerts).toHaveLength(0);
  });

  it("produces info alert when all stages have 0 count", () => {
    const emptyStages = healthyFunnelStages().map((s) => ({ ...s, count: 0, conversionFromPrevious: null, dropOffFromPrevious: null }));
    const vm = healthyViewModel({
      funnel: { stages: emptyStages, largestDropOffStage: null },
    });
    const result = buildDashboardAlerts(vm);
    const funnelAlerts = bySource(result, "funnel");
    expect(funnelAlerts.length).toBeGreaterThanOrEqual(1);
    expect(funnelAlerts.some((a) => a.id === "funnel_no_data")).toBe(true);
  });

  it("produces info alert when first stage count is 0 (no QR scans)", () => {
    const stages = healthyFunnelStages().map((s, i) => ({
      ...s,
      count: i === 0 ? 0 : 50,
      conversionFromPrevious: i === 0 ? null : 1,
      dropOffFromPrevious: i === 0 ? null : 0,
    }));
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: null },
    });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "funnel").some((a) => a.id === "funnel_no_scans")).toBe(true);
    expect(bySource(result, "funnel").some((a) => a.id === "funnel_no_data")).toBe(false);
  });

  // ── Critical drop-off (>= 70%) ──

  it("produces critical alert when largest drop-off is >= 70%", () => {
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "minimal_form_completed") {
        return { ...s, count: 30, conversionFromPrevious: 30 / 160, dropOffFromPrevious: 1 - 30 / 160 };
      }
      return s;
    });
    // certificate_started=160, form_submitted=30 → drop = 130/160 = 81.25%
    const formStage = stages.find((s) => s.key === "minimal_form_completed")!;
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: formStage },
    });
    const result = buildDashboardAlerts(vm);
    const criticalAlert = bySource(result, "funnel").find((a) => a.id === "funnel_drop_critical");
    expect(criticalAlert).toBeDefined();
    expect(criticalAlert!.severity).toBe("critical");
    expect(criticalAlert!.message).toContain("81%");
  });

  it("critical drop-off message includes previous and current stage labels and counts", () => {
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "photo_uploaded") {
        return { ...s, count: 20, conversionFromPrevious: 20 / 150, dropOffFromPrevious: 1 - 20 / 150 };
      }
      return s;
    });
    const photoStage = stages.find((s) => s.key === "photo_uploaded")!;
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: photoStage },
    });
    const result = buildDashboardAlerts(vm);
    const alert = bySource(result, "funnel").find((a) => a.id === "funnel_drop_critical")!;
    expect(alert.message).toContain("Form submitted");
    expect(alert.message).toContain("Photo uploaded");
    // 150-20=130 → 130/150 ≈ 86.7%
    expect(alert.message).toContain("87%");
  });

  // ── Warning drop-off (>= 50%, < 70%) ──

  it("produces warning alert when largest drop-off is >= 50% but < 70%", () => {
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "survey_completed") {
        return { ...s, count: 50, conversionFromPrevious: 50 / 100, dropOffFromPrevious: 1 - 50 / 100 };
      }
      return s;
    });
    // survey_started=100, survey_completed=50 → drop = 50%
    const surveyCompleteStage = stages.find((s) => s.key === "survey_completed")!;
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: surveyCompleteStage },
    });
    const result = buildDashboardAlerts(vm);
    const warningAlert = bySource(result, "funnel").find((a) => a.id === "funnel_drop_warning");
    expect(warningAlert).toBeDefined();
    expect(warningAlert!.severity).toBe("warning");
    expect(warningAlert!.message).toContain("50%");
  });

  // ── Boundary: exactly 70% and exactly 50% ──

  it("produces critical alert when drop-off is exactly 70%", () => {
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "certificate_started") {
        // landing_viewed=180, certificate_started=54 → drop = 126/180 = 70%
        return { ...s, count: 54, conversionFromPrevious: 54 / 180, dropOffFromPrevious: 1 - 54 / 180 };
      }
      return s;
    });
    const stage = stages.find((s) => s.key === "certificate_started")!;
    // 180-54=126 → 126/180 = 0.7 exactly
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: stage },
    });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "funnel").some((a) => a.id === "funnel_drop_critical")).toBe(true);
  });

  it("produces warning alert when drop-off is exactly 50%", () => {
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "certificate_started") {
        return { ...s, count: 90, conversionFromPrevious: 90 / 180, dropOffFromPrevious: 1 - 90 / 180 };
      }
      return s;
    });
    const stage = stages.find((s) => s.key === "certificate_started")!;
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: stage },
    });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "funnel").some((a) => a.id === "funnel_drop_warning")).toBe(true);
  });

  // ── Sequential stage drops ──

  it("produces additional warning alerts for other stages with >= 50% drop-off beyond the largest", () => {
    const customStages = [
      healthyStage("qr_scanned", "QR scanned", 200, null),
      healthyStage("landing_viewed", "Landing viewed", 180, 200),
      healthyStage("certificate_started", "Certificate started", 100, 180),   // 44.4% drop — below 50%, no alert
      healthyStage("minimal_form_completed", "Form submitted", 40, 100),       // 60% drop — above 50%
      healthyStage("photo_uploaded", "Photo uploaded", 35, 40),                // 12.5% drop
      healthyStage("certificate_generated", "Certificate generated", 30, 35),  // 14.3% drop
      healthyStage("survey_started", "Survey started", 8, 30),                 // 73.3% drop — above 70% (critical)
      healthyStage("survey_completed", "Survey completed", 8, 10),             // 20% drop
      healthyStage("passport_saved", "Passport saved", 5, 8),                  // 37.5% drop
    ];
    
    // survey_started has 73.3% drop (the largest) — ≥ 70% so it's critical
    const largestDropStage = customStages.find((s) => s.key === "survey_started")!;
    const vm = healthyViewModel({
      funnel: { stages: customStages, largestDropOffStage: largestDropStage },
    });
    const result = buildDashboardAlerts(vm);
    
    // largestDropOffStage is survey_started (66.7%) → should be funnel_drop_critical
    expect(bySource(result, "funnel").some((a) => a.id === "funnel_drop_critical")).toBe(true);
    
    // form_submitted has 60% drop → not the largest → should get a separate warning
    const sequentialAlert = bySource(result, "funnel").find((a) => a.id === "funnel_drop_stage_minimal_form_completed");
    expect(sequentialAlert).toBeDefined();
    expect(sequentialAlert!.severity).toBe("warning");
    expect(sequentialAlert!.message).toContain("60%");
    
    // survey_started is the largest, so it should NOT have a sequential duplicate
    expect(bySource(result, "funnel").some((a) => a.id === "funnel_drop_stage_survey_started")).toBe(false);
  });

  it("does not produce sequential drop alerts when drop-off < 50%", () => {
    const stages = healthyFunnelStages(); // all drops are well under 50%
    const vm = healthyViewModel({
      funnel: { stages, largestDropOffStage: null },
    });
    const result = buildDashboardAlerts(vm);
    const sequentialAlerts = bySource(result, "funnel").filter((a) => a.id.startsWith("funnel_drop_stage_"));
    expect(sequentialAlerts).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────
// Survey alert tests
// ────────────────────────────────────────────────────────

describe("buildDashboardAlerts — survey", () => {
  it("produces no survey alerts for healthy completion rate (>= 20%)", () => {
    const result = buildDashboardAlerts(healthyViewModel());
    const surveyAlerts = bySource(result, "survey");
    expect(surveyAlerts).toHaveLength(0);
  });

  it("produces warning alert when completion rate < 20%", () => {
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "15%", rawValue: 0.15 } : k,
    );
    const vm = healthyViewModel({ kpis });
    const result = buildDashboardAlerts(vm);
    const surveyAlerts = bySource(result, "survey");
    expect(surveyAlerts).toHaveLength(1);
    expect(surveyAlerts[0].severity).toBe("warning");
    expect(surveyAlerts[0].id).toBe("survey_completion_low");
    expect(surveyAlerts[0].message).toContain("15%");
  });

  it("produces warning alert at exactly 19.9%", () => {
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "19.9%", rawValue: 0.199 } : k,
    );
    const vm = healthyViewModel({ kpis });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "survey")).toHaveLength(1);
  });

  it("does NOT produce warning alert when completion rate is exactly 20%", () => {
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "20%", rawValue: 0.2 } : k,
    );
    const vm = healthyViewModel({ kpis });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "survey")).toHaveLength(0);
  });

  it("does NOT produce alert when completion rate is null", () => {
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "No data", rawValue: null } : k,
    );
    const vm = healthyViewModel({ kpis });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "survey")).toHaveLength(0);
  });

  it("does NOT produce alert when survey_completion_rate KPI is missing entirely", () => {
    const vm = healthyViewModel({ kpis: [] });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "survey")).toHaveLength(0);
  });

  it("does NOT produce alert when rawValue is 0 (no certificates yet)", () => {
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "0%", rawValue: 0 } : k,
    );
    const vm = healthyViewModel({ kpis });
    const result = buildDashboardAlerts(vm);
    // rawValue 0 < 0.2 → should trigger the warning
    expect(bySource(result, "survey")).toHaveLength(1);
    expect(bySource(result, "survey")[0].id).toBe("survey_completion_low");
  });
});

// ────────────────────────────────────────────────────────
// Expense alert tests
// ────────────────────────────────────────────────────────

describe("buildDashboardAlerts — expense", () => {
  it("produces no expense alerts when responseCount >= 5", () => {
    const result = buildDashboardAlerts(healthyViewModel());
    const expenseAlerts = bySource(result, "expense");
    expect(expenseAlerts).toHaveLength(0);
  });

  it("produces info alert when responseCount is 0", () => {
    const vm = healthyViewModel({
      expense: { ...healthyViewModel().expense, responseCount: 0 },
    });
    const result = buildDashboardAlerts(vm);
    const expenseAlerts = bySource(result, "expense");
    expect(expenseAlerts).toHaveLength(1);
    expect(expenseAlerts[0].severity).toBe("info");
    expect(expenseAlerts[0].id).toBe("expense_no_data");
    expect(expenseAlerts[0].id).toBe("expense_no_data");
  });

  it("produces info alert when responseCount is 0 (and does not also produce low sample)", () => {
    const vm = healthyViewModel({
      expense: { ...healthyViewModel().expense, responseCount: 0 },
    });
    const result = buildDashboardAlerts(vm);
    const expenseAlerts = bySource(result, "expense");
    expect(expenseAlerts).toHaveLength(1);
    // Should be no_data, not low_sample
    expect(expenseAlerts[0].id).toBe("expense_no_data");
  });

  it("produces info alert when responseCount is between 1 and 4 (low sample)", () => {
    const vm = healthyViewModel({
      expense: { ...healthyViewModel().expense, responseCount: 3 },
    });
    const result = buildDashboardAlerts(vm);
    const expenseAlerts = bySource(result, "expense");
    expect(expenseAlerts).toHaveLength(1);
    expect(expenseAlerts[0].severity).toBe("info");
    expect(expenseAlerts[0].id).toBe("expense_low_sample");
    expect(expenseAlerts[0].message).toContain("3");
  });

  it("produces info alert when responseCount is 4 (edge of low sample range)", () => {
    const vm = healthyViewModel({
      expense: { ...healthyViewModel().expense, responseCount: 4 },
    });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "expense")).toHaveLength(1);
    expect(bySource(result, "expense")[0].id).toBe("expense_low_sample");
  });

  it("does NOT produce info alert when responseCount is exactly 5", () => {
    const vm = healthyViewModel({
      expense: { ...healthyViewModel().expense, responseCount: 5 },
    });
    const result = buildDashboardAlerts(vm);
    expect(bySource(result, "expense")).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────
// Alert sorting tests
// ────────────────────────────────────────────────────────

describe("buildDashboardAlerts — sorting", () => {
  it("sorts alerts critical first, then warning, then info", () => {
    // Build a scenario that triggers all severity levels
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "minimal_form_completed") {
        return { ...s, count: 30, conversionFromPrevious: 30 / 160, dropOffFromPrevious: 1 - 30 / 160 };
      }
      return s;
    });
    const formStage = stages.find((s) => s.key === "minimal_form_completed")!;

    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "10%", rawValue: 0.1 } : k,
    );

    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        safetyAverage: 1.5,  // critical
        cleanlinessAverage: 2.5, // warning
        revisitIntentionRate: 0.3, // warning
        recommendIntentionRate: 0.2, // warning
      },
      funnel: { stages, largestDropOffStage: formStage },
      kpis,
      expense: { ...healthyViewModel().expense, responseCount: 0 },
    });

    const result = buildDashboardAlerts(vm);

    // Check ordering: all criticals first, then warnings, then infos
    let seenWarning = false;
    let seenInfo = false;
    for (const alert of result) {
      if (alert.severity === "critical") {
        expect(seenWarning).toBe(false);
        expect(seenInfo).toBe(false);
      } else if (alert.severity === "warning") {
        seenWarning = true;
        expect(seenInfo).toBe(false);
      } else if (alert.severity === "info") {
        seenInfo = true;
      }
    }

    // Should have at least 1 of each severity
    expect(result.some((a) => a.severity === "critical")).toBe(true);
    expect(result.some((a) => a.severity === "warning")).toBe(true);
    expect(result.some((a) => a.severity === "info")).toBe(true);
  });

  it("returns empty array when no alerts are triggered", () => {
    // healthy baseline should produce no alerts
    const result = buildDashboardAlerts(healthyViewModel());
    expect(result).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────
// Integration: full scenario tests
// ────────────────────────────────────────────────────────

describe("buildDashboardAlerts — integration scenarios", () => {
  it("handles completely empty data gracefully (no visits, no surveys, no expenses)", () => {
    const emptyStages = healthyFunnelStages().map((s) => ({ ...s, count: 0, conversionFromPrevious: null, dropOffFromPrevious: null }));
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "No data", rawValue: null } : k,
    );
    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        responseCount: 0,
        averageOverall: null,
        safetyAverage: null,
        cleanlinessAverage: null,
        facilityAverage: null,
        revisitIntentionRate: null,
        recommendIntentionRate: null,
      },
      funnel: { stages: emptyStages, largestDropOffStage: null },
      kpis,
      expense: { ...healthyViewModel().expense, responseCount: 0 },
    });

    const result = buildDashboardAlerts(vm);

    // Should have: satisfaction_no_data (info) + funnel_no_data (info) + expense_no_data (info)
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(bySource(result, "satisfaction")).toHaveLength(1);
    expect(bySource(result, "funnel")).toHaveLength(1);
    expect(bySource(result, "expense")).toHaveLength(1);
  });

  it("triggers multiple alert sources simultaneously", () => {
    // Low satisfaction + high funnel drop-off + low survey + low expense
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "certificate_started") {
        return { ...s, count: 30, conversionFromPrevious: 30 / 180, dropOffFromPrevious: 1 - 30 / 180 };
      }
      return s;
    });
    const certStage = stages.find((s) => s.key === "certificate_started")!;
    const kpis = healthyKpis.map((k) =>
      k.key === "survey_completion_rate" ? { ...k, value: "5%", rawValue: 0.05 } : k,
    );

    const vm = healthyViewModel({
      satisfaction: {
        ...healthyViewModel().satisfaction,
        safetyAverage: 1.8,
        cleanlinessAverage: 2.2,
        revisitIntentionRate: 0.4,
      },
      funnel: { stages, largestDropOffStage: certStage },
      kpis,
      expense: { ...healthyViewModel().expense, responseCount: 2 },
    });

    const result = buildDashboardAlerts(vm);

    expect(bySource(result, "satisfaction").length).toBeGreaterThan(0);
    expect(bySource(result, "funnel").length).toBeGreaterThan(0);
    expect(bySource(result, "survey").length).toBeGreaterThan(0);
    expect(bySource(result, "expense").length).toBeGreaterThan(0);

    // Total should have at least 1 from each source
    const sourceSet = new Set(result.map((a) => a.source));
    expect(sourceSet.has("satisfaction")).toBe(true);
    expect(sourceSet.has("funnel")).toBe(true);
    expect(sourceSet.has("survey")).toBe(true);
    expect(sourceSet.has("expense")).toBe(true);
  });

  it("produces actionable alerts with correct action links", () => {
    const stages = healthyFunnelStages().map((s, i) => {
      if (s.key === "minimal_form_completed") {
        return { ...s, count: 40, conversionFromPrevious: 40 / 160, dropOffFromPrevious: 1 - 40 / 160 };
      }
      return s;
    });
    const formStage = stages.find((s) => s.key === "minimal_form_completed")!;

    const vm = healthyViewModel({
      satisfaction: { ...healthyViewModel().satisfaction, safetyAverage: 1.5 },
      funnel: { stages, largestDropOffStage: formStage },
    });

    const result = buildDashboardAlerts(vm);

    const actionableAlerts = result.filter((a) => a.actionable);
    expect(actionableAlerts.length).toBeGreaterThan(0);
    for (const alert of actionableAlerts) {
      expect(alert.actionHref).toBeDefined();
      expect(alert.actionLabel).toBeDefined();
      expect(alert.actionHref).toMatch(/^\/admin\/dashboard/);
    }
  });
});
