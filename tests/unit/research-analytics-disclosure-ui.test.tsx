import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const charts = vi.hoisted(() => ({ funnel: vi.fn(), constructs: vi.fn() }));

vi.mock("@/components/admin/research/ResearchAnalyticsCharts", () => ({
  ResearchFunnelGraphic: (props: unknown) => { charts.funnel(props); return null; },
  ResearchConstructScoreChart: (props: unknown) => { charts.constructs(props); return null; },
}));

import { ResearchAnalyticsWorkspace } from "@/components/admin/research/ResearchAnalyticsWorkspace";
import type { ResearchAnalyticsViewModel } from "@/lib/services/admin-research.service";

const analytics = {
  scope: {
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
    collectionModes: ["field_observation"],
    participantType: "tourist",
    studyKind: "final_collection",
    smallCellThreshold: 10,
    instrumentVersions: ["tourist_evaluation v1 (tourist)"],
  },
  kpis: {
    consented: 12,
    eligible: 12,
    completed: 10,
    completionRate: 83.3,
    withdrawn: 0,
    excluded: 0,
    medianEvaluationSeconds: 210,
    evaluationDurationCount: 10,
    requiredAnswerCompleteness: 100,
    requiredAnswersExpected: 100,
    requiredAnswersPresent: 100,
    requiredResponseCount: 10,
  },
  incentives: {
    certificateRecipients: 12,
    tourismSurveyCompleters: 2,
    evaluationCompleters: 10,
    passportSavers: 0,
    suppressed: false,
  },
  funnel: [
    { key: "consented", label: "ยินยอม", count: 12, rate: 100 },
    { key: "evaluation_submitted", label: "ส่งสำเร็จ", count: 10, rate: 83.3 },
  ],
  constructs: [{ constructKey: "system_quality", sampleSize: 2, suppressed: true, mean: null }],
  operator: {
    completedAttempts: 2,
    assessedAttempts: 2,
    passedAttempts: 1,
    successSuppressed: true,
    durationSuppressed: true,
    confidenceSuppressed: true,
    medianSeconds: null,
    meanConfidence: null,
  },
  truncated: false,
  interpretation: "ผลเชิงพรรณนา",
} as unknown as ResearchAnalyticsViewModel;

describe("research analytics disclosure UI", () => {
  it("does not reveal small or complementary cells in text or client chart props", () => {
    vi.clearAllMocks();
    render(<ResearchAnalyticsWorkspace analytics={analytics} />);

    expect(screen.queryByText("n = 2")).not.toBeInTheDocument();
    expect(screen.queryByText("2 sessions")).not.toBeInTheDocument();
    expect(screen.queryByText("83.3 %")).not.toBeInTheDocument();
    expect(screen.queryByText("3.5 นาที")).not.toBeInTheDocument();
    expect(charts.funnel).not.toHaveBeenCalled();
    expect(charts.constructs).toHaveBeenCalledWith({ constructs: [] });
  });

  it("does not reveal a hidden eligible cohort through downstream certificate metrics", () => {
    vi.clearAllMocks();
    const limited = {
      ...analytics,
      kpis: { ...analytics.kpis, consented: 14, eligible: 12, completed: 12, withdrawn: 2 },
      incentives: { ...analytics.incentives, certificateRecipients: 12, evaluationCompleters: 12 },
    } as ResearchAnalyticsViewModel;
    render(<ResearchAnalyticsWorkspace analytics={limited} />);

    expect(screen.queryByText("12 sessions")).not.toBeInTheDocument();
    expect(charts.funnel).not.toHaveBeenCalled();
  });

  it("hides a single missing required answer even when enough responses were submitted", () => {
    const completeCohort = {
      ...analytics,
      kpis: {
        ...analytics.kpis,
        consented: 20,
        eligible: 20,
        completed: 10,
        requiredResponseCount: 10,
        requiredAnswersExpected: 100,
        requiredAnswersPresent: 99,
      },
    } as ResearchAnalyticsViewModel;
    render(<ResearchAnalyticsWorkspace analytics={completeCohort} />);

    const metric = screen.getByText("ความครบถ้วนข้อบังคับ").parentElement;
    expect(metric).not.toBeNull();
    expect(within(metric as HTMLElement).getByText("ปกปิด")).toBeInTheDocument();
  });
});
