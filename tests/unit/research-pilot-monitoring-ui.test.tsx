import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResearchPilotMonitoring } from "@/components/admin/research/ResearchPilotMonitoring";
import type { ResearchAnalyticsViewModel } from "@/lib/services/admin-research.service";

const analytics = {
  instrumentControl: {
    freezeStatus: "frozen",
    freezeSnapshotId: "freeze-1",
    expectedVersions: ["tourist_evaluation v2 (tourist)"],
    observedVersions: ["tourist_evaluation v2 (tourist)", "tourist_evaluation v3 (tourist)"],
    mixedVersions: true,
    hasUnexpectedVersion: true,
    status: "mixed",
  },
  pilotReadiness: {
    decision: "not_ready",
    readyCount: 7,
    totalCount: 10,
    items: [{
      key: "instrument_alignment",
      label: "ใช้เครื่องมือรุ่นเดียวและตรงกับ Freeze",
      ready: false,
      evidenceLabel: "สถานะ mixed",
      evidenceHref: "#research-instrument-control",
    }],
  },
  researchSequence: {
    recruitment: { available: false, count: null, limitation: "ยังไม่มีตัวหาร invitation" },
    consented: 12,
    eligible: 12,
    evaluationStarted: 12,
    evaluationSubmitted: 10,
    operatorAttemptsCompleted: 0,
  },
  evaluationFlow: {
    started: 12,
    submitted: 10,
    completionRate: 83.3,
    medianSeconds: 210,
    durationSampleSize: 10,
    worstRequiredItemMissingness: 0,
    worstRequiredItemCode: "SQ1",
    thresholds: { completionRatePercent: 80, medianSeconds: 240, maximumRequiredItemMissingnessPercent: 5 },
    gates: { completion: "pass", duration: "pass", requiredItemMissingness: "pass" },
    stages: [
      { key: "evaluation_started", label: "เริ่มแบบประเมิน", count: 12, rateFromStarted: 100, dropoffFromPrevious: null, suppressed: false },
      { key: "information_quality", label: "คุณภาพข้อมูล", count: 10, rateFromStarted: 83.3, dropoffFromPrevious: 16.7, suppressed: false },
    ],
  },
  comparisons: {
    collectionModes: [{ key: "pilot_internal", suppressed: true, sampleSize: null, completionRate: null, medianSeconds: null, durationSampleSize: null }],
    participantTypes: [{ key: "tourist", suppressed: false, sampleSize: 10, completionRate: 100, medianSeconds: 210, durationSampleSize: 10 }],
    interpretation: "เปรียบเทียบเชิงพรรณนาภายในกลุ่มตัวอย่างเท่านั้น",
  },
} as unknown as ResearchAnalyticsViewModel;

describe("research pilot monitoring UI", () => {
  it("shows version risk, evidence links, burden gates, and suppressed comparisons", () => {
    render(<ResearchPilotMonitoring analytics={analytics} />);

    expect(screen.getByRole("region", { name: "การติดตาม Pilot" })).toBeInTheDocument();
    expect(screen.getByText("เครื่องมือปะปนหลายรุ่น")).toBeInTheDocument();
    expect(screen.getByText("ยังวัดไม่ได้")).toBeInTheDocument();
    expect(screen.getByText("16.7%")).toBeInTheDocument();
    expect(screen.getByText("ปกปิด n<10")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ตรวจหลักฐาน/ })).toHaveAttribute("href", "#research-instrument-control");
  });
});
