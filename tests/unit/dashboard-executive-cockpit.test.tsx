import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveExperienceSummary } from "@/components/dashboard/ExecutiveExperienceSummary";
import { ExecutiveFunnelSummary } from "@/components/dashboard/ExecutiveFunnelSummary";
import { ExecutiveAttractionRanking } from "@/components/dashboard/ExecutiveAttractionRanking";
import { ExecutiveDecisionSummary } from "@/components/dashboard/ExecutiveDecisionSummary";
import { ExecutiveAttractionMatrix } from "@/components/dashboard/ExecutiveAttractionMatrix";
import { ExecutiveQualityStrip } from "@/components/dashboard/ExecutiveQualityStrip";
import type { DashboardViewModel, FunnelStage } from "@/types/dashboard";

function stage(key: string, count: number): FunnelStage {
  return {
    key,
    label: key,
    count,
    conversionFromPrevious: null,
    dropOffFromPrevious: null,
    definition: key,
  };
}

const satisfaction: DashboardViewModel["satisfaction"] = {
  averageOverall: 4.5,
  responseCount: 40,
  distribution: [
    { label: "4 / 5", value: 10, percent: 0.25 },
    { label: "5 / 5", value: 30, percent: 0.75 },
  ],
  byAttraction: [],
  safetyAverage: 4.4,
  safetyResponseCount: 40,
  cleanlinessAverage: 4.2,
  cleanlinessResponseCount: 40,
  accessibilityAverage: 4.1,
  accessibilityResponseCount: 40,
  informationAverage: 4.0,
  informationResponseCount: 40,
  valueAverage: 4.3,
  valueResponseCount: 40,
  facilityAverage: null,
  facilityResponseCount: 0,
  revisitIntentionRate: 0.8,
  revisitAnsweredCount: 40,
  recommendIntentionRate: 0.9,
  recommendAnsweredCount: 40,
};

describe("Executive analytics cockpit", () => {
  it("สรุปคุณภาพและความครอบคลุมข้อมูลเป็นแถบกะทัดรัด", () => {
    render(
      <ExecutiveQualityStrip
        expense={{ responseCount: 20, spendingRangeResponseCount: 15 }}
        generatedAt="2026-09-03T10:20:00.000Z"
        satisfaction={satisfaction}
        surveyCompletionRate={0.625}
      />,
    );

    expect(screen.getByRole("region", { name: "คุณภาพและความครอบคลุมข้อมูล" })).toBeInTheDocument();
    expect(screen.getByText("ความครอบคลุมแบบสำรวจ")).toBeInTheDocument();
    expect(screen.getByText("63%")).toBeInTheDocument();
    expect(screen.getByText("ความครบถ้วนข้อมูลค่าใช้จ่าย")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("แสดงผลงานรายสถานที่เป็น matrix จากจำนวนเข้าชมและคะแนนจริง", () => {
    render(
      <ExecutiveAttractionMatrix
        attractions={[{
          rank: 1,
          attractionName: "สกายวอล์คอัยเยอร์เวง",
          provinceName: "ยะลา",
          visitCount: 120,
          certificateCount: 84,
          averageSatisfaction: 4.7,
          surveyResponseCount: 42,
        }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "ผลงานรายสถานที่" })).toBeInTheDocument();
    expect(screen.getByText("รายการเยี่ยมชมที่บันทึก")).toBeInTheDocument();
    expect(screen.getByText("คะแนนความพึงพอใจ")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ข้อมูลผลงานรายสถานที่" })).toBeInTheDocument();
  });

  it("สรุปหลักฐานและขั้นถัดไปจาก insight เดิมโดยไม่สร้างตัวเลขใหม่", () => {
    render(
      <ExecutiveDecisionSummary
        insights={[{
          title: "ควรติดตามคุณภาพข้อมูล",
          category: "data_quality",
          description: "คำตอบแบบสำรวจยังมีจำนวนน้อย",
          evidence: "มีคำตอบ 12 รายการจากการเข้าชมที่บันทึก",
          suggestedAction: "เก็บข้อมูลเพิ่มก่อนสรุปผล",
          confidence: "low",
        }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "ประเด็นเพื่อการตัดสินใจ" })).toBeInTheDocument();
    expect(screen.getByText("มีคำตอบ 12 รายการจากการเข้าชมที่บันทึก")).toBeInTheDocument();
    expect(screen.getByText("เก็บข้อมูลเพิ่มก่อนสรุปผล")).toBeInTheDocument();
    expect(screen.getByText("ความเชื่อมั่นต่ำ")).toBeInTheDocument();
  });

  it("แปล insight จาก service เป็นข้อความไทยก่อนแสดงบนหน้าภาพรวม", () => {
    render(
      <ExecutiveDecisionSummary
        insights={[{
          title: "Improvement priority",
          category: "improvement",
          description: "Attraction A has high visits and low satisfaction",
          evidence: "120 visits and 3.2 satisfaction",
          suggestedAction: "Review service quality",
          confidence: "medium",
        }]}
      />,
    );

    expect(screen.getByText("สถานที่ที่ควรให้ความสำคัญในการปรับปรุง")).toBeInTheDocument();
    expect(screen.queryByText("Improvement priority")).not.toBeInTheDocument();
  });

  it("สรุปการเปลี่ยนแปลงที่เด่นที่สุดพร้อมความหมายและขั้นถัดไปโดยไม่อ้างเหตุผล", () => {
    render(
      <ExecutiveDecisionSummary
        comparison={{
          mode: "previous_period",
          dateFrom: "2026-07-01",
          dateTo: "2026-07-31",
          status: "ready",
          unavailableReason: null,
          metrics: {
            total_visits: { currentValue: 120, previousValue: 100, absoluteChange: 20, percentChange: 20, direction: "up" },
          },
        }}
        insights={[]}
        kpis={[{
          key: "total_visits",
          label: "Total Visits",
          value: "120",
          rawValue: 120,
          valueType: "count",
          definition: "Recorded visits",
        }]}
      />,
    );

    expect(screen.getByText("สิ่งที่เปลี่ยนจากช่วงก่อน")).toBeInTheDocument();
    expect(screen.getByText(/การเข้าชมที่บันทึกเพิ่มขึ้น 20%/)).toBeInTheDocument();
    expect(screen.getByText(/ไม่ได้ยืนยันว่าเกิดจากมาตรการใด/)).toBeInTheDocument();
    expect(screen.getByText(/เปิดดูพฤติกรรมการเดินทางและรายสถานที่/)).toBeInTheDocument();
  });

  it("แสดงตารางจัดอันดับสถานที่พร้อมตัวชี้วัดที่ตรวจสอบย้อนกลับได้", () => {
    render(
      <ExecutiveAttractionRanking
        attractions={[
          {
            rank: 1,
            attractionName: "สกายวอล์คอัยเยอร์เวง",
            provinceName: "ยะลา",
            visitCount: 120,
            certificateCount: 84,
            averageSatisfaction: 4.7,
            surveyResponseCount: 42,
          },
          {
            rank: 2,
            attractionName: "บ่อน้ำร้อนเบตง",
            provinceName: "ยะลา",
            visitCount: 80,
            certificateCount: 50,
            averageSatisfaction: null,
            surveyResponseCount: 0,
          },
        ]}
      />,
    );

    const table = screen.getByRole("table", { name: "อันดับสถานที่ท่องเที่ยวตามรายการเข้าชม" });
    expect(table).toBeInTheDocument();
    expect(screen.getByText("สกายวอล์คอัยเยอร์เวง")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
    expect(screen.getByText("4.7")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูล")).toBeInTheDocument();
  });

  it("สรุป conversion จาก QR ไปใบประกาศและแบบสำรวจ", () => {
    render(
      <ExecutiveFunnelSummary
        stages={[
          stage("qr_scanned", 100),
          stage("certificate_generated", 60),
          stage("survey_completed", 30),
        ]}
      />,
    );

    const summary = screen.getByLabelText("อัตราสรุปเส้นทาง");
    expect(within(summary).getByText("60%")).toBeInTheDocument();
    expect(within(summary).getByText("50%")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ข้อมูลประสิทธิภาพเส้นทางผู้ใช้" })).toBeInTheDocument();
  });

  it("แสดงขั้นหลักของ funnel เป็นลำดับที่อ่านได้ทั้งจอใหญ่และมือถือ", () => {
    render(
      <ExecutiveFunnelSummary
        stages={[
          stage("qr_scanned", 100),
          stage("landing_viewed", 90),
          stage("minimal_form_completed", 70),
          stage("photo_uploaded", 65),
          stage("certificate_generated", 60),
          stage("survey_completed", 30),
        ]}
      />,
    );

    const stageList = screen.getByRole("list", { name: "ลำดับขั้นของเส้นทางผู้ใช้" });
    expect(within(stageList).getByText("สแกน QR")).toBeInTheDocument();
    expect(within(stageList).getByText("เปิดหน้าเช็กอิน")).toBeInTheDocument();
    expect(within(stageList).getByText("ส่งข้อมูลขั้นต่ำ")).toBeInTheDocument();
    expect(within(stageList).getByText("อัปโหลดรูปสำเร็จ")).toBeInTheDocument();
    expect(within(stageList).getByText("สร้างใบประกาศสำเร็จ")).toBeInTheDocument();
    expect(within(stageList).getByText("ส่งแบบสำรวจสำเร็จ")).toBeInTheDocument();
  });

  it("ไม่แสดงอัตราหลอกเมื่อ funnel ไม่มีฐานคำนวณ", () => {
    render(<ExecutiveFunnelSummary stages={[]} />);
    expect(screen.getAllByText("ยังคำนวณไม่ได้").length).toBeGreaterThanOrEqual(2);
  });

  it("ไม่บีบอัตราที่ข้อมูลผิดลำดับให้กลายเป็น 100%", () => {
    render(
      <ExecutiveFunnelSummary
        stages={[
          stage("qr_scanned", 10),
          stage("certificate_generated", 12),
          stage("survey_completed", 3),
        ]}
      />,
    );

    expect(screen.getAllByText("ยังคำนวณไม่ได้").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("100%")).not.toBeInTheDocument();
  });

  it("สรุปคุณภาพประสบการณ์พร้อมฐานคำตอบ", () => {
    render(<ExecutiveExperienceSummary satisfaction={satisfaction} />);
    expect(screen.getByText("4.5 / 5")).toBeInTheDocument();
    expect(screen.getAllByText("40 คำตอบ").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "การกระจายคะแนนความพึงพอใจ" })).toBeInTheDocument();
  });

  it("แสดงคะแนนประสบการณ์ทั้งห้ามิติพร้อมฐานคำตอบ", () => {
    render(<ExecutiveExperienceSummary satisfaction={satisfaction} />);

    const dimensions = screen.getByLabelText("แผนภูมิคะแนนประสบการณ์รายมิติ");
    expect(within(dimensions).getByText("ความปลอดภัย")).toBeInTheDocument();
    expect(within(dimensions).getByText("ความสะอาด")).toBeInTheDocument();
    expect(within(dimensions).getByText("การเข้าถึง")).toBeInTheDocument();
    expect(within(dimensions).getByText("ข้อมูลและป้าย")).toBeInTheDocument();
    expect(within(dimensions).getByText("ความคุ้มค่า")).toBeInTheDocument();
    expect(within(dimensions).getAllByText("40 คำตอบ")).toHaveLength(5);
    expect(within(dimensions).queryByText(/n=/)).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "คะแนนประสบการณ์รายมิติ" })).toBeInTheDocument();
  });

  it("แยกสถานะไม่มีข้อมูลความพึงพอใจออกจากคะแนนศูนย์", () => {
    render(
      <ExecutiveExperienceSummary
        satisfaction={{
          ...satisfaction,
          averageOverall: 0,
          responseCount: 0,
          distribution: [],
          revisitIntentionRate: null,
          revisitAnsweredCount: 0,
          recommendIntentionRate: null,
          recommendAnsweredCount: 0,
        }}
      />,
    );
    expect(screen.getAllByText("ยังไม่มีข้อมูล").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole("img", { name: "ยังไม่มีคะแนนเฉลี่ย" })).toBeInTheDocument();
    expect(screen.queryByText("0.0 / 5")).not.toBeInTheDocument();
  });
});
