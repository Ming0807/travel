import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DashboardViewModel, DistributionItem, RankedAttraction } from "@/types/dashboard";
import type {
  PublicDashboardEvidence,
  PublicEvidenceAttraction,
  PublicEvidenceDistributionGroup,
  PublicEvidenceDistributionItem,
  PublicEvidenceKpi,
  PublicEvidenceOpportunity,
  PublicEvidenceSatisfaction,
  PublicEvidenceStatus,
  PublicEvidenceTrendPoint,
} from "@/types/public-dashboard";

export const PUBLIC_DASHBOARD_CELL_MINIMUM = 5;

const countFormatter = new Intl.NumberFormat("th-TH");

function countState(value: number | null | undefined) {
  if (!value || value <= 0) {
    return { displayValue: "ยังไม่มีข้อมูล", status: "no_data" as const, sampleSize: null };
  }
  if (value < PUBLIC_DASHBOARD_CELL_MINIMUM) {
    return { displayValue: "น้อยกว่า 5", status: "suppressed" as const, sampleSize: null };
  }
  return { displayValue: countFormatter.format(value), status: "available" as const, sampleSize: value };
}

function responseSampleSize(value: number) {
  return value >= PUBLIC_DASHBOARD_CELL_MINIMUM ? value : null;
}

function getKpiValue(model: DashboardViewModel, key: string) {
  return model.kpis.find((item) => item.key === key)?.rawValue ?? null;
}

function countKpi(
  model: DashboardViewModel,
  key: PublicEvidenceKpi["key"],
  label: string,
  definition: string,
  source: string,
  limitation: string,
): PublicEvidenceKpi {
  const state = countState(getKpiValue(model, key));
  return { key, label, definition, source, limitation, ...state };
}

function satisfactionKpi(model: DashboardViewModel): PublicEvidenceKpi {
  const responseCount = model.satisfaction.responseCount;
  const average = model.satisfaction.averageOverall;
  let displayValue = "ยังไม่มีข้อมูล";
  let status: PublicEvidenceStatus = "no_data";

  if (responseCount > 0 && responseCount < DASHBOARD_MIN_SAMPLE_SIZE) {
    displayValue = "ข้อมูลยังไม่พอ";
    status = "small_sample";
  } else if (responseCount >= DASHBOARD_MIN_SAMPLE_SIZE && average !== null) {
    displayValue = `${average.toFixed(1)} / 5`;
    status = "available";
  }

  return {
    key: "average_satisfaction",
    label: "ความพึงพอใจเฉลี่ย",
    displayValue,
    status,
    sampleSize: responseSampleSize(responseCount),
    definition: "ค่าเฉลี่ยคะแนนภาพรวม 1-5 จากผู้ตอบแบบสำรวจหลังได้รับใบประกาศ",
    source: "satisfaction_surveys.overall_score",
    limitation: `แปลผลเมื่อมีคำตอบอย่างน้อย ${DASHBOARD_MIN_SAMPLE_SIZE} รายการ และไม่แทนผู้เดินทางทั้งหมด`,
  };
}

function trendPoint(label: string, value: number): PublicEvidenceTrendPoint {
  const state = countState(value);
  const date = new Date(`${label}T00:00:00.000Z`);
  return {
    isoDate: label,
    label: Number.isNaN(date.getTime())
      ? label
      : new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }).format(date),
    value: state.status === "available" ? value : null,
    displayValue: state.displayValue,
    status: state.status,
  };
}

function distributionItems(items: DistributionItem[]): PublicEvidenceDistributionItem[] {
  const visible: PublicEvidenceDistributionItem[] = items
    .filter((item) => item.value >= PUBLIC_DASHBOARD_CELL_MINIMUM)
    .map((item) => ({
      label: item.label,
      value: item.value,
      displayValue: countFormatter.format(item.value),
      percent: item.percent,
      status: "available" as const,
    }));

  if (items.some((item) => item.value > 0 && item.value < PUBLIC_DASHBOARD_CELL_MINIMUM)) {
    visible.push({
      label: "กลุ่มข้อมูลขนาดเล็กที่ปกปิด",
      value: null,
      displayValue: "น้อยกว่า 5 ต่อกลุ่ม",
      percent: null,
      status: "suppressed",
    });
  }

  return visible;
}

function distributionGroup(
  key: string,
  label: string,
  definition: string,
  source: string,
  items: DistributionItem[],
): PublicEvidenceDistributionGroup | null {
  const publicItems = distributionItems(items);
  return publicItems.length > 0 ? { key, label, definition, source, items: publicItems } : null;
}

function publicAttraction(row: RankedAttraction): PublicEvidenceAttraction | null {
  if (row.visitCount < PUBLIC_DASHBOARD_CELL_MINIMUM) return null;
  const certificateState = countState(row.certificateCount);
  const satisfactionIsAvailable =
    row.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE && row.averageSatisfaction !== null;

  return {
    label: row.attractionName,
    visitValue: row.visitCount,
    visitDisplayValue: countFormatter.format(row.visitCount),
    certificateDisplayValue: certificateState.displayValue,
    satisfactionDisplayValue: satisfactionIsAvailable
      ? `${row.averageSatisfaction!.toFixed(1)} / 5`
      : row.surveyResponseCount > 0
        ? "ข้อมูลยังไม่พอ"
        : "ยังไม่มีข้อมูล",
    satisfactionSampleSize: responseSampleSize(row.surveyResponseCount),
  };
}

function satisfactionDimension(
  key: string,
  label: string,
  value: number | null,
  responseCount: number,
): PublicEvidenceSatisfaction {
  if (responseCount === 0 || value === null) {
    return { key, label, displayValue: "ยังไม่มีข้อมูล", value: null, status: "no_data", sampleSize: null };
  }
  if (responseCount < DASHBOARD_MIN_SAMPLE_SIZE) {
    return {
      key,
      label,
      displayValue: "ข้อมูลยังไม่พอ",
      value: null,
      status: "small_sample",
      sampleSize: responseSampleSize(responseCount),
    };
  }
  return {
    key,
    label,
    displayValue: `${value.toFixed(1)} / 5`,
    value,
    status: "available",
    sampleSize: responseCount,
  };
}

function opportunities(rows: RankedAttraction[]): PublicEvidenceOpportunity[] {
  const eligible = rows.filter(
    (row) =>
      row.visitCount >= PUBLIC_DASHBOARD_CELL_MINIMUM &&
      row.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE &&
      row.averageSatisfaction !== null,
  );
  const result: PublicEvidenceOpportunity[] = [];
  const improvement = eligible.find((row) => (row.averageSatisfaction ?? 5) < 3.5);
  const promotion = [...eligible].reverse().find((row) => (row.averageSatisfaction ?? 0) >= 4);

  if (improvement) {
    result.push({
      kind: "improvement",
      title: "ประเด็นที่ควรตรวจสอบก่อนส่งเสริมเพิ่ม",
      finding: `${improvement.attractionName} มีรายการเข้าชมในระบบ แต่คะแนนความพึงพอใจอยู่ต่ำกว่าเกณฑ์วิเคราะห์`,
      evidence: `${countFormatter.format(improvement.visitCount)} รายการเข้าชม, ความพึงพอใจ ${improvement.averageSatisfaction!.toFixed(1)} / 5 จาก ${countFormatter.format(improvement.surveyResponseCount)} คำตอบ`,
      suggestedAction: "ตรวจข้อมูลด้านความสะอาด ความปลอดภัย การเข้าถึง และป้ายข้อมูลร่วมกับผู้ดูแลสถานที่ก่อนกำหนดแผนปรับปรุง",
      confidenceLabel: improvement.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE * 2 ? "หลักฐานระดับค่อนข้างมั่นคง" : "หลักฐานเบื้องต้น",
    });
  }

  if (promotion && promotion.attractionName !== improvement?.attractionName) {
    result.push({
      kind: "promotion",
      title: "โอกาสสำหรับการประชาสัมพันธ์",
      finding: `${promotion.attractionName} มีคะแนนความพึงพอใจสูงในกลุ่มผู้ตอบแบบสำรวจ`,
      evidence: `${countFormatter.format(promotion.visitCount)} รายการเข้าชม, ความพึงพอใจ ${promotion.averageSatisfaction!.toFixed(1)} / 5 จาก ${countFormatter.format(promotion.surveyResponseCount)} คำตอบ`,
      suggestedAction: "พิจารณาทดลองนำไปอยู่ในเส้นทางแนะนำ แล้วติดตามจำนวนรายการเข้าชมและคำตอบหลังการประชาสัมพันธ์",
      confidenceLabel: promotion.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE * 2 ? "หลักฐานระดับค่อนข้างมั่นคง" : "หลักฐานเบื้องต้น",
    });
  }

  return result;
}

export function buildPublicDashboardEvidence(
  model: DashboardViewModel,
  provinceName: string,
): PublicDashboardEvidence {
  const visitorProfile = [
    distributionGroup("age_groups", "ช่วงอายุ", "สัดส่วนช่วงอายุจากโปรไฟล์ที่มีรายการเข้าชม", "tourists.age_group", model.touristProfile.ageGroups),
    distributionGroup("origin_provinces", "จังหวัดต้นทาง", "จังหวัดต้นทางที่ผู้ใช้ระบุด้วยตนเอง", "tourists.origin_province_id", model.touristProfile.originProvinces),
  ].filter((group): group is PublicEvidenceDistributionGroup => group !== null);

  const travelBehavior = [
    distributionGroup("transport_modes", "รูปแบบการเดินทาง", "วิธีเดินทางจากแบบสำรวจโดยสมัครใจ", "visits.transport_mode_id", model.travelBehavior.transportModes),
    distributionGroup("companion_types", "ผู้ร่วมเดินทาง", "ลักษณะกลุ่มผู้ร่วมเดินทางจากแบบสำรวจโดยสมัครใจ", "visits.travel_companion_id", model.travelBehavior.companionTypes),
    distributionGroup("overnight_status", "การค้างคืน", "สถานะไป-กลับหรือค้างคืนจากแบบสำรวจโดยสมัครใจ", "visits.overnight_status", model.travelBehavior.overnightStatus),
  ].filter((group): group is PublicEvidenceDistributionGroup => group !== null);

  return {
    scope: {
      provinceName,
      dateFrom: model.filters.dateFrom,
      dateTo: model.filters.dateTo,
      dataAsOf: model.generatedAt,
      sourceLabel: "ฐานข้อมูลการมีส่วนร่วมของแพลตฟอร์ม",
    },
    thresholds: {
      publicCellMinimum: PUBLIC_DASHBOARD_CELL_MINIMUM,
      interpretationMinimum: DASHBOARD_MIN_SAMPLE_SIZE,
    },
    kpis: [
      countKpi(model, "tourist_profiles", "โปรไฟล์นักท่องเที่ยวที่มีรายการเข้าชม", "จำนวนโปรไฟล์ที่เชื่อมกับรายการเข้าชมในช่วงที่แสดง", "visits.tourist_id", "ไม่ใช่จำนวนบุคคลที่ผ่านการยืนยันตัวตน"),
      countKpi(model, "total_visits", "รายการเข้าชมที่บันทึก", "จำนวน visit หลังผู้ใช้กรอกข้อมูลขั้นต่ำและยินยอม", "visits", "ไม่ใช่ยอดเปิดหน้าเว็บหรือจำนวน QR scan"),
      countKpi(model, "certificates_generated", "ใบประกาศที่สร้างสำเร็จ", "จำนวนใบประกาศดิจิทัลที่ระบบสร้างสำเร็จ", "certificates", "หนึ่งโปรไฟล์อาจสร้างใบประกาศจากหลายการเดินทาง"),
      satisfactionKpi(model),
    ],
    trend: model.executive.visitTrend.map((point) => trendPoint(point.label, point.value)),
    visitorProfile,
    travelBehavior,
    topAttractions: model.executive.topAttractions
      .map(publicAttraction)
      .filter((row): row is PublicEvidenceAttraction => row !== null),
    satisfaction: [
      satisfactionDimension("overall", "ภาพรวม", model.satisfaction.averageOverall, model.satisfaction.responseCount),
      satisfactionDimension("safety", "ความปลอดภัย", model.satisfaction.safetyAverage, model.satisfaction.safetyResponseCount),
      satisfactionDimension("cleanliness", "ความสะอาด", model.satisfaction.cleanlinessAverage, model.satisfaction.cleanlinessResponseCount),
      satisfactionDimension("accessibility", "การเข้าถึง", model.satisfaction.accessibilityAverage, model.satisfaction.accessibilityResponseCount),
      satisfactionDimension("information", "ข้อมูลและป้าย", model.satisfaction.informationAverage, model.satisfaction.informationResponseCount),
      satisfactionDimension("value", "ความคุ้มค่า", model.satisfaction.valueAverage, model.satisfaction.valueResponseCount),
    ],
    opportunities: opportunities(model.executive.topAttractions),
    limitations: [
      "ข้อมูลมาจากผู้ที่เลือกใช้ QR Check-in ของระบบนำร่องเท่านั้น จึงไม่แทนนักท่องเที่ยวทั้งหมดในจังหวัด",
      `กลุ่มข้อมูลที่มีน้อยกว่า ${PUBLIC_DASHBOARD_CELL_MINIMUM} รายการถูกปกปิด และคะแนนเชิงวิเคราะห์ใช้เมื่อมีอย่างน้อย ${DASHBOARD_MIN_SAMPLE_SIZE} คำตอบ`,
      "ข้อมูลค่าใช้จ่ายและความพึงพอใจเป็นข้อมูลที่ผู้ตอบรายงานด้วยตนเอง ไม่ใช่รายได้หรือผลกระทบทางเศรษฐกิจอย่างเป็นทางการ",
      "ข้อมูลนี้ไม่ใช่สถิตินักท่องเที่ยวทางการของจังหวัดยะลา และไม่ควรใช้ตัดสินใจเพียงแหล่งเดียว",
    ],
  };
}
