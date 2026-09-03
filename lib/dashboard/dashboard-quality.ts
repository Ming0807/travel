import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import { buildDistributionEvidence, type DistributionEvidenceStrength } from "@/lib/dashboard/distribution-evidence";
import type {
  DashboardEvidenceScope,
  DashboardQuality,
  DashboardQualityPage,
} from "@/types/dashboard";

export const DASHBOARD_METRIC_VERSION = "dashboard-2026.09-v1";
export const DASHBOARD_EXPORT_MIN_SAMPLE = 10;

const SOURCE_CONTRACTS: Record<DashboardQualityPage, {
  sourceTables: string[];
  dateField: string;
  exclusions: string[];
}> = {
  executive: {
    sourceTables: ["visits", "certificates", "tourist_stamps", "satisfaction_surveys", "visit_expenses", "funnel_events"],
    dateField: "visits.visit_date / funnel_events.event_time",
    exclusions: ["QR scan ไม่ถูกนับเป็น Visit", "ข้อมูลที่ถอนหรือถูกคัดออกจากงานวิจัย", "ช่องว่างไม่ถูกแทนด้วยศูนย์"],
  },
  tourists: {
    sourceTables: ["visits", "tourists", "tourist_identities", "countries", "provinces"],
    dateField: "visits.visit_date",
    exclusions: ["โปรไฟล์ที่ไม่มี Visit ในช่วงที่เลือก", "ข้อมูลระบุตัวบุคคล", "ช่องว่างไม่ถูกแทนด้วยศูนย์"],
  },
  visits: {
    sourceTables: ["visits", "travel_companions", "transport_modes", "travel_purposes"],
    dateField: "visits.visit_date",
    exclusions: ["QR scan ที่ยังไม่สร้าง Visit", "ข้อมูลที่ถอนหรือถูกคัดออกจากงานวิจัย", "คำตอบว่างจากตัวหารรายมิติ"],
  },
  expenses: {
    sourceTables: ["satisfaction_surveys", "visit_expenses", "spending_ranges", "expense_categories"],
    dateField: "visits.visit_date",
    exclusions: ["ยอดรายบุคคลและข้อมูลระบุตัวบุคคล", "คำตอบว่างจากตัวหาร", "ไม่ตีความเป็นรายได้หรือผลกระทบเศรษฐกิจ"],
  },
  satisfaction: {
    sourceTables: ["satisfaction_surveys", "visits", "attractions"],
    dateField: "visits.visit_date",
    exclusions: ["ความคิดเห็นอิสระจากกราฟรวม", "คำตอบว่างจากค่าเฉลี่ย", "กลุ่มขนาดเล็กตามเกณฑ์ความเป็นส่วนตัว"],
  },
  funnel: {
    sourceTables: ["funnel_events", "checkin_codes", "visits"],
    dateField: "funnel_events.event_time",
    exclusions: ["เหตุการณ์ที่ไม่รองรับตัวกรองระดับโปรไฟล์", "event ไม่ถูกตีความเป็นบุคคล", "ขั้นที่เชื่อม Visit ไม่ได้จากข้อสรุป conversion"],
  },
  sustainability: {
    sourceTables: ["visits", "satisfaction_surveys", "visit_expenses", "attractions"],
    dateField: "visits.visit_date",
    exclusions: ["ข้อสรุปเชิงเหตุและผล", "ข้อมูลจำลองจากข้อสรุปภาคสนาม", "เซลล์ที่ต่ำกว่าเกณฑ์ความเป็นส่วนตัว"],
  },
};

const SCOPE_LABELS: Record<DashboardEvidenceScope, string> = {
  field_claim: "หลักฐานภาคสนาม (ไม่รวม Pilot/จำลอง)",
  all_records: "ทุกชุดข้อมูล (ต้องอ่านแยกบริบท)",
  pilot_only: "Pilot เท่านั้น",
  simulated_only: "สถานการณ์จำลองเท่านั้น",
};

function freshnessState(input: {
  dataSource: "live_database" | "pre_aggregated";
  generatedAt: string;
  summaryRefreshTimestamp: string | null;
}) {
  if (input.dataSource === "live_database") {
    return { state: "fresh" as const, label: "ข้อมูลสดจากฐานข้อมูล", stale: false };
  }
  const refreshedAt = input.summaryRefreshTimestamp ?? input.generatedAt;
  const ageHours = Math.max(0, (Date.now() - Date.parse(refreshedAt)) / 3_600_000);
  if (ageHours <= 24) return { state: "fresh" as const, label: "ข้อมูลสรุปอัปเดตภายใน 24 ชม.", stale: false };
  if (ageHours <= 72) return { state: "aging" as const, label: "ข้อมูลสรุปเกิน 24 ชม.", stale: false };
  return { state: "stale" as const, label: "ข้อมูลสรุปเกิน 72 ชม.", stale: true };
}

function gradeWithoutCoverage(sampleSize: number): DistributionEvidenceStrength {
  if (sampleSize <= 0) return "unavailable";
  if (sampleSize < DASHBOARD_EXPORT_MIN_SAMPLE) return "insufficient";
  if (sampleSize < DASHBOARD_MIN_SAMPLE_SIZE) return "limited";
  return "usable";
}

export function buildDashboardQuality(input: {
  activeTab: DashboardQualityPage;
  evidenceScope: DashboardEvidenceScope;
  generatedAt: string;
  dataSource: "live_database" | "pre_aggregated";
  summaryRefreshTimestamp: string | null;
  sampleSize: number;
  answeredCount: number | null;
  denominatorCount: number | null;
  suppressedCellCount: number;
  isTruncated: boolean;
  warnings: string[];
}): DashboardQuality {
  const sampleSize = Math.max(0, Math.trunc(input.sampleSize));
  const hasCoverage = input.answeredCount !== null && input.denominatorCount !== null;
  const evidence = hasCoverage
    ? buildDistributionEvidence({ answeredCount: input.answeredCount ?? 0, denominatorCount: input.denominatorCount ?? 0 })
    : null;
  const evidenceGrade = evidence?.strength ?? gradeWithoutCoverage(sampleSize);
  const freshness = freshnessState(input);
  const blockers: string[] = [];

  if (input.isTruncated) blockers.push("ข้อมูลถูกตัดที่ขีดจำกัดการอ่าน จึงอาจเป็นเพียงบางส่วนของขอบเขตที่เลือก");
  if (freshness.stale) blockers.push("ข้อมูลสรุปเก่าเกิน 72 ชั่วโมง");
  if (sampleSize < DASHBOARD_EXPORT_MIN_SAMPLE) blockers.push(`ฐานข้อมูลต่ำกว่า ${DASHBOARD_EXPORT_MIN_SAMPLE} รายการ`);
  if (evidence && evidence.coverage !== null && evidence.coverage < 0.2) blockers.push("ความครอบคลุมคำตอบต่ำกว่า 20%");

  const operationalTasks: DashboardQuality["operationalTasks"] = [];
  if (input.isTruncated) operationalTasks.push({ key: "narrow_scope", severity: "critical", title: "ลดขอบเขตการอ่าน", detail: "เลือกช่วงวันที่ สถานที่ หรือจังหวัดให้แคบลงก่อนส่งออกหรือสรุปผล" });
  if (sampleSize < DASHBOARD_MIN_SAMPLE_SIZE) operationalTasks.push({ key: "collect_sample", severity: sampleSize < 10 ? "critical" : "warning", title: "เก็บข้อมูลเพิ่ม", detail: `มีฐาน ${sampleSize.toLocaleString("th-TH")} รายการ เป้าหมายขั้นต่ำสำหรับการตีความเชิงพรรณนาคือ ${DASHBOARD_MIN_SAMPLE_SIZE}` });
  if (evidence && evidence.missingRate !== null && evidence.missingRate >= 0.3) operationalTasks.push({ key: "improve_coverage", severity: "warning", title: "ลดคำตอบเว้นว่าง", detail: `ข้อมูลมิติหลักขาด ${(evidence.missingRate * 100).toFixed(1)}% ควรตรวจ flow และจุดหลุดของแบบสำรวจ` });
  if (input.suppressedCellCount > 0) operationalTasks.push({ key: "suppressed_groups", severity: "info", title: "ติดตามกลุ่มที่ถูกปกปิด", detail: `มี ${input.suppressedCellCount.toLocaleString("th-TH")} กลุ่ม/เซลล์ที่ยังเล็กเกินเกณฑ์ความเป็นส่วนตัว` });
  if (input.evidenceScope === "all_records") operationalTasks.push({ key: "separate_scope", severity: "info", title: "แยกขอบเขตก่อนอ้างผล", detail: "มุมมองนี้รวมข้อมูลภาคสนาม Pilot และจำลอง ควรเปลี่ยนเป็นหลักฐานภาคสนามก่อนใช้รายงานภายนอก" });

  const status = blockers.length > 0 ? "blocked" : input.warnings.length > 0 || operationalTasks.length > 0 ? "caution" : "ready";
  const sourceContract = SOURCE_CONTRACTS[input.activeTab];
  return {
    status,
    evidenceGrade,
    scope: { code: input.evidenceScope, label: SCOPE_LABELS[input.evidenceScope] },
    sampleSize,
    coverage: evidence ? {
      answeredCount: evidence.answeredCount,
      denominatorCount: evidence.denominatorCount,
      rate: evidence.coverage,
      missingCount: evidence.missingCount,
      missingRate: evidence.missingRate,
    } : null,
    freshness: { state: freshness.state, label: freshness.label },
    suppressedCellCount: Math.max(0, Math.trunc(input.suppressedCellCount)),
    truncated: input.isTruncated,
    claimsAllowed: blockers.length === 0,
    exportAllowed: blockers.length === 0,
    blockers,
    warnings: input.warnings,
    operationalTasks,
    metadata: {
      sourceTables: sourceContract.sourceTables,
      metricVersion: DASHBOARD_METRIC_VERSION,
      dateField: sourceContract.dateField,
      refreshedAt: input.summaryRefreshTimestamp ?? input.generatedAt,
      exclusions: sourceContract.exclusions,
    },
  };
}

export function dashboardExportBlockReason(quality: Pick<DashboardQuality, "exportAllowed" | "blockers"> | undefined): string | null {
  if (!quality || quality.exportAllowed) return null;
  return quality.blockers[0] ?? "ชุดข้อมูลไม่ผ่านเกณฑ์คุณภาพสำหรับการส่งออก";
}
