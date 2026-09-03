import type { FeedbackDimension, IssueCategory } from "@/lib/services/attraction-feedback.service";

export type AttractionIssueDraft = {
  source: "low_score" | "funnel_dropoff" | "trend_point";
  category: IssueCategory;
  note: string;
};

const SCORE_DRAFTS: Record<string, { dimension: FeedbackDimension; category: IssueCategory; label: string }> = {
  overall_score: { dimension: "overall", category: "service", label: "ภาพรวม" },
  facility_score: { dimension: "facility", category: "facilities", label: "สิ่งอำนวยความสะดวก" },
  cleanliness_score: { dimension: "cleanliness", category: "cleanliness", label: "ความสะอาด" },
  safety_score: { dimension: "safety", category: "safety", label: "ความปลอดภัย" },
  accessibility_score: { dimension: "accessibility", category: "accessibility", label: "การเข้าถึง" },
  information_score: { dimension: "information", category: "information_signage", label: "ข้อมูลและป้าย" },
  value_score: { dimension: "value", category: "value", label: "ความคุ้มค่า" },
};

const FUNNEL_LABELS: Record<string, string> = {
  entry: "เปิดจุดเช็กอิน",
  visit: "กรอกข้อมูลพื้นฐาน",
  photo: "อัปโหลดรูป",
  certificate: "สร้างใบประกาศ",
  stamp: "ได้รับตราประทับ",
  survey: "ตอบแบบสำรวจท่องเที่ยว",
  research: "ส่งแบบประเมินงานวิจัย",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAttractionIssueDraft(
  query: Record<string, string | string[] | undefined>,
  scope: { dateStart: string; dateEnd: string },
  dimension: FeedbackDimension,
): AttractionIssueDraft | undefined {
  const source = one(query.draftSource);
  const metric = one(query.draftMetric);
  const numericValue = Number(one(query.draftValue));
  if (!Number.isFinite(numericValue)) return undefined;

  if (
    source === "low_score"
    && metric
    && SCORE_DRAFTS[metric]?.dimension === dimension
    && numericValue >= 1
    && numericValue <= 3
  ) {
    const config = SCORE_DRAFTS[metric];
    return {
      source,
      category: config.category,
      note: `ร่างจากคะแนน${config.label}เฉลี่ย ${numericValue.toLocaleString("th-TH", { maximumFractionDigits: 2 })} / 5 ช่วง ${scope.dateStart} ถึง ${scope.dateEnd} (ข้อมูลรวมเท่านั้น) โปรดตรวจเกณฑ์และบริบทก่อนบันทึก`,
    };
  }

  if (
    source === "funnel_dropoff"
    && dimension === "overall"
    && metric
    && FUNNEL_LABELS[metric]
    && numericValue > 0
    && numericValue <= 100
  ) {
    return {
      source,
      category: "service",
      note: `ร่างจาก Funnel ขั้น ${FUNNEL_LABELS[metric]} มี Drop-off ${numericValue.toLocaleString("th-TH", { maximumFractionDigits: 1 })}% ช่วง ${scope.dateStart} ถึง ${scope.dateEnd} (ข้อมูลรวมเท่านั้น) โปรดตรวจสอบ Flow บนอุปกรณ์จริงก่อนบันทึก`,
    };
  }

  const draftDate = one(query.draftDate);
  if (
    source === "trend_point"
    && dimension === "overall"
    && metric === "visits"
    && draftDate
    && /^\d{4}-\d{2}-\d{2}$/.test(draftDate)
    && draftDate >= scope.dateStart
    && draftDate <= scope.dateEnd
    && Number.isSafeInteger(numericValue)
    && numericValue >= 0
  ) {
    return {
      source,
      category: "service",
      note: `ร่างจากแนวโน้มวันที่ ${draftDate} มีรายการเข้าชมที่ระบบบันทึก ${numericValue.toLocaleString("th-TH")} Visits (ไม่ใช่ยอดเปิดเว็บหรือจำนวนสแกน) โปรดตรวจบริบทก่อนบันทึก`,
    };
  }

  return undefined;
}
