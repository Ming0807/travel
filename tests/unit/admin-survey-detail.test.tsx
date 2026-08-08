import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SurveyDetailView } from "@/components/admin/surveys/SurveyDetailView";
import type { AdminSurveyDetail } from "@/lib/repositories/admin-survey.repository";

const survey: AdminSurveyDetail = {
  surveyId: "11111111-1111-4111-8111-111111111111",
  visitId: "22222222-2222-4222-8222-222222222222",
  submittedAt: "2026-07-13T10:00:00.000Z",
  completedAt: "2026-07-13T10:01:00.000Z",
  respondent: {
    touristId: "33333333-3333-4333-8333-333333333333",
    reference: "T-33333333",
    displayName: "สมชาย",
    countryName: "ไทย",
    provinceName: "ปัตตานี",
    ageGroup: "25-34",
    preferredLanguage: "th",
  },
  visit: {
    visitDate: "2026-07-13",
    visitedAt: "2026-07-13T09:00:00.000Z",
    createdAt: "2026-07-13T08:55:00.000Z",
    completionStatus: "survey_completed",
    attractionName: "ทะเลหมอกอัยเยอร์เวง",
    attractionProvince: "ยะลา",
    photoSpotName: "จุดชมวิว",
    checkinLabel: "ทางเข้าหลัก",
  },
  travelBehavior: {
    companion: "ครอบครัว",
    groupSize: 4,
    transportMode: "รถยนต์ส่วนตัว",
    travelPurpose: "พักผ่อน",
    overnightStatus: "overnight",
    nights: 2,
  },
  expense: {
    category: "อาหาร",
    spendingRange: "1,001-2,000 บาท",
    estimatedAmount: null,
    minimum: 1001,
    maximum: 2000,
  },
  satisfaction: {
    overallScore: 5,
    facilityScore: null,
    cleanlinessScore: 4,
    safetyScore: 5,
    accessibilityScore: 4,
    informationScore: 3,
    valueScore: 5,
    revisitIntention: "yes",
    recommendIntention: "yes",
    comment: "ประทับใจมาก",
  },
  answerSummary: {
    hasTravelBehavior: true,
    hasExpense: true,
    hasSatisfaction: true,
    hasComment: true,
    answeredFieldCount: 15,
  },
};

describe("admin survey detail route", () => {
  it("provides a dedicated route and presentational view", () => {
    expect(existsSync(resolve("app/(admin)/admin/surveys/[surveyId]/page.tsx"))).toBe(true);
    expect(existsSync(resolve("components/admin/surveys/SurveyDetailView.tsx"))).toBe(true);
  });

  it("shows respondent, visit, voluntary-data sections, and a profile link", () => {
    render(<SurveyDetailView survey={survey} canReadComments canReadTourist />);

    expect(screen.getByText(/Facility/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "รายละเอียดคำตอบแบบสมัครใจ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "พฤติกรรมการเดินทาง" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ค่าใช้จ่ายโดยประมาณ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ความพึงพอใจ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /สมชาย/ })).toHaveAttribute(
      "href",
      "/admin/tourists/33333333-3333-4333-8333-333333333333"
    );
    expect(screen.getByText("ประทับใจมาก")).toBeInTheDocument();
  });

  it("does not reveal the optional comment without comment permission", () => {
    render(<SurveyDetailView survey={survey} canReadComments={false} canReadTourist />);

    expect(screen.queryByText("ประทับใจมาก")).not.toBeInTheDocument();
    expect(screen.getByText(/ไม่มีสิทธิ์ดูความคิดเห็น/)).toBeInTheDocument();
  });

  it("does not link to the tourist profile without tourist detail permission", () => {
    render(<SurveyDetailView survey={survey} canReadComments={false} canReadTourist={false} />);

    expect(screen.queryByRole("link", { name: /สมชาย/ })).not.toBeInTheDocument();
    expect(screen.getByText(/สมชาย/)).toBeInTheDocument();
  });
});
