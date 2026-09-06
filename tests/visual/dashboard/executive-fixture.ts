import type { DashboardViewModel, DashboardKpi } from "@/types/dashboard";
import { buildDashboardVisitChannels } from "@/lib/dashboard/visit-channels";

// Synthetic component evidence only; never import this dataset into app routes.
export function executiveFixture(state: string | null): DashboardViewModel {
  const empty = state === "empty" || state === "no-records";
  const low = state === "low";
  const count = empty ? 0 : low ? 2 : 180;
  const score = empty ? null : 4.35;
  const metric = (key: string, label: string, value: number | null, valueType: DashboardKpi["valueType"] = "count"): DashboardKpi => ({
    key, label, rawValue: value, value: value === null ? "No data" : valueType === "percentage" ? `${(value * 100).toFixed(0)}%` : value.toLocaleString("th-TH"), valueType,
    definition: "ข้อมูลจำลองสำหรับตรวจการแสดงผลเท่านั้น", evidence: { level: empty ? "unavailable" : low ? "limited" : "decision_ready", sampleSize: count, denominator: count, unit: "รายการ" },
  });
  return {
    filters: state === "no-records"
      ? { dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "field_claim" }
      : { dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only", satisfactionMin: 3.2 },
    generatedAt: "2026-09-04T00:00:00.000Z", dataSource: "live_database", summaryRefreshTimestamp: null,
    viewer: { displayName: "QA", email: "qa@example.invalid", permissions: ["dashboard.read"] },
    referenceOptions: { provinces: [], districts: [], attractions: [], attractionTypes: [], originCountries: [], originProvinces: [], ageGroups: [], transportModes: [], travelPurposes: [] },
    kpis: [
      metric("tourist_profiles", "Tourist Profiles", empty ? 0 : low ? 2 : 428),
      metric("total_visits", "Total Visits", empty ? 0 : low ? 2 : 640),
      metric("certificates_generated", "Certificates Generated", empty ? 0 : low ? 2 : 420),
      metric("survey_completion_rate", "Survey Completion Rate", empty ? null : 0.43, "percentage"),
      metric("average_satisfaction", "Average Satisfaction", score, "rating"),
      { ...metric("estimated_spending", "Estimated Spending", null, "currency_range"), value: empty ? "No data" : "90,000 - 180,000 บาท", note: "ประมาณจากช่วงค่าใช้จ่ายที่ผู้ตอบรายงาน ไม่ใช่รายได้ธุรกิจ" },
      metric("stamps_earned", "Stamps Earned", empty ? 0 : 360),
      { ...metric("top_attraction", "Top Attraction", null, "text"), value: empty ? "No data" : "วัดคูหาภิมุข (วัดหน้าถ้ำ)" },
    ],
    executive: {
      visitChannels: buildDashboardVisitChannels(empty ? [] : Array.from({ length: low ? 2 : 180 }, (_, index) => ({
        visit_id: `fixture-${index}`, checkin_entry_sessions: [{ entry_channel: index < 100 ? "qr" : index < 150 ? "nfc" : "unknown" }],
      })), state !== "channels-disabled", state === "channels-incomplete"),
      visitTrend: empty ? [] : low ? [{ label: "2026-08-01", value: 2 }] : Array.from({ length: 16 }, (_, index) => ({ label: `2026-08-${String(index + 1).padStart(2, "0")}`, value: [18, 24, 23, 36, 40, 68, 76, 45, 28, 32, 42, 35, 40, 47, 22, 64][index] })),
      visitsByProvince: [],
      topAttractions: empty ? [] : [
        { rank: 1, attractionName: "วัดคูหาภิมุข (วัดหน้าถ้ำ)", provinceName: "ยะลา", visitCount: 240, certificateCount: 160, averageSatisfaction: score, surveyResponseCount: low ? 2 : 80 },
        { rank: 2, attractionName: "สกายวอล์คอัยเยอร์เวง", provinceName: "ยะลา", visitCount: 180, certificateCount: 120, averageSatisfaction: 4.7, surveyResponseCount: low ? 2 : 60 },
        { rank: 3, attractionName: "ชุมชนท่องเที่ยวและศูนย์เรียนรู้วิถีชีวิตท้องถิ่น", provinceName: "ยะลา", visitCount: 100, certificateCount: 65, averageSatisfaction: 3.7, surveyResponseCount: low ? 2 : 40 },
        { rank: 4, attractionName: "สถานที่ที่ยังรอคำตอบ", provinceName: "ยะลา", visitCount: 120, certificateCount: 75, averageSatisfaction: null, surveyResponseCount: 0 },
      ],
    },
    touristProfile: { originCountries: [], originProvinces: [], ageGroups: [], preferredLanguages: [], identityProviders: [] },
    travelBehavior: { companionTypes: [], transportModes: [], travelPurposes: [], overnightStatus: [], averageGroupSize: null, averageNights: null, answeredGroupSizeCount: 0, answeredNightsCount: 0 },
    expense: { spendingRanges: [], expenseCategories: [], estimatedMin: null, estimatedMax: null, hasOpenEndedRange: false, responseCount: 0, spendingRangeResponseCount: 0, expenseCategoryResponseCount: 0, methodologyNote: "ข้อมูลจำลอง" },
    satisfaction: {
      averageOverall: score, responseCount: count, distribution: empty ? [] : [{ label: "4 / 5", value: low ? 1 : 117, percent: 0.65 }, { label: "5 / 5", value: low ? 1 : 63, percent: 0.35 }], byAttraction: [],
      safetyAverage: score, safetyResponseCount: count, cleanlinessAverage: empty ? null : 4.1, cleanlinessResponseCount: count,
      accessibilityAverage: empty ? null : 3.8, accessibilityResponseCount: count, informationAverage: empty ? null : 4.0, informationResponseCount: count,
      valueAverage: empty ? null : 4.6, valueResponseCount: count, facilityAverage: null, facilityResponseCount: 0,
      revisitIntentionRate: empty ? null : 0.8, revisitAnsweredCount: count, recommendIntentionRate: empty ? null : 0.9, recommendAnsweredCount: count,
    },
    funnel: { stages: empty ? [] : ["qr_scanned", "landing_viewed", "minimal_form_completed", "photo_uploaded", "certificate_generated", "survey_completed"].map((key, index) => ({ key, label: key, count: low ? 2 : [920, 860, 640, 500, 420, 180][index], conversionFromPrevious: null, dropOffFromPrevious: null, definition: "จำนวนเหตุการณ์จำลอง" })), largestDropOffStage: null },
    insights: empty ? [] : low ? [{ title: "เก็บฐานคำตอบเพิ่มเติม", category: "data_quality", confidence: "low", description: "", evidence: "มีคำตอบจำลอง 2 รายการ", suggestedAction: "เก็บคำตอบเพิ่มก่อนใช้จัดลำดับความสำคัญ" }] : [
      { title: "ติดตามความสะดวกในการเข้าถึง", category: "improvement", confidence: "medium", description: "", evidence: "คะแนนด้านการเข้าถึง 3.8 / 5 จากคำตอบจำลอง 180 รายการ", suggestedAction: "ตรวจคะแนนรายสถานที่ก่อนกำหนดแผนปรับปรุง" },
      { title: "ตรวจจุดส่งต่อไปยังแบบสำรวจ", category: "opportunity", confidence: "medium", description: "", evidence: "เหตุการณ์ใบประกาศ 420 และแบบสำรวจ 180", suggestedAction: "ตรวจเส้นทางผู้ใช้และความสะดวกในการตอบ" },
    ],
    dashboardAlerts: [], dataQualityWarnings: low ? ["ข้อมูลจำลองมีฐานคำตอบน้อย ใช้ทดสอบการแสดงผลเท่านั้น"] : [],
  };
}
