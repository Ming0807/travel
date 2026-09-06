import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";

type DistributionRow = AttractionAnalyticsViewModel["audience"]["ageGroups"][number];
type FunnelStage = AttractionAnalyticsViewModel["funnel"][number];
type SatisfactionMetric = AttractionAnalyticsViewModel["satisfaction"][number];
type PeerComparison = AttractionAnalyticsViewModel["peerComparison"];
type PeerSummary = NonNullable<PeerComparison["selected"]>;
type PrivateMetric = PeerSummary["overallSatisfaction"];
type Kpis = AttractionAnalyticsViewModel["kpis"];
type Audience = AttractionAnalyticsViewModel["audience"];
type Intentions = AttractionAnalyticsViewModel["intentions"];
type Improvements = AttractionAnalyticsViewModel["improvements"];
type Insight = AttractionAnalyticsViewModel["insights"][number];

const attraction: AttractionAnalyticsViewModel["attraction"] = {
  attractionId: 701,
  nameTh: "แหล่งเรียนรู้สังเคราะห์ A",
  districtNameTh: "อำเภอจำลอง",
  provinceId: 701,
  attractionTypeId: 701,
  attractionTypeNameTh: "แหล่งเรียนรู้",
};

const filters: AttractionAnalyticsViewModel["filters"] = {
  attractionId: attraction.attractionId,
  dateFrom: "2026-08-01",
  dateTo: "2026-08-31",
  evidenceScope: "field_claim",
};

const shared: Pick<AttractionAnalyticsViewModel, "channels" | "attraction" | "filters" | "generatedAt" | "referenceOptions" | "metricContract" | "viewer" | "interpretation"> = {
  channels: {
    status: "tracking_not_activated", asOf: "2026-09-04T00:00:00.000Z",
    entries: 0, unclassifiedEntries: 0, channels: [], daily: [],
    attributionCoverage: null, attributionLinkedVisits: null, attributionVisitBase: 0,
    coverageSuppressed: false, note: "Channel tracking is disabled in this visual fixture.",
  },
  attraction,
  filters,
  generatedAt: "2026-09-04T00:00:00.000Z",
  referenceOptions: {
    attractions: [
      { value: attraction.attractionId, label: attraction.nameTh },
      { value: 702, label: "แหล่งเรียนรู้สังเคราะห์ B" },
      { value: 703, label: "แหล่งเรียนรู้สังเคราะห์ C" },
    ],
    checkinCodes: [
      { checkinCodeId: 70101, code: "SYNTH-A-01", label: "จุดถ่ายภาพสังเคราะห์", campaignId: null },
    ],
  },
  metricContract: [
    { key: "visits", label: "รายการเข้าชม", unit: "Visit records", denominator: "ไม่มี", dateField: "visits.visit_date", source: "visits", missingRule: "ไม่นับแถวที่ไม่อยู่ใน scope", decisionUse: "ดูปริมาณกิจกรรมที่ระบบบันทึก" },
    { key: "unique_tourists", label: "โปรไฟล์นักท่องเที่ยวไม่ซ้ำ", unit: "tourist profile", denominator: "ไม่มี", dateField: "visits.visit_date", source: "visits.tourist_id", missingRule: "ไม่ตีความเป็นบุคคลจริงแบบยืนยันตัวตน", decisionUse: "ประมาณฐานผู้ใช้งานไม่ซ้ำในระบบ" },
    { key: "survey_rate", label: "อัตราตอบแบบสำรวจ", unit: "%", denominator: "Visits ใน scope", dateField: "visits.visit_date", source: "satisfaction_surveys / visits", missingRule: "เป็น null เมื่อไม่มี Visit", decisionUse: "ประเมิน coverage ของเสียงตอบรับ" },
    { key: "satisfaction", label: "คะแนนความพึงพอใจ", unit: "1-5", denominator: "คำตอบที่ไม่เป็น null ของแต่ละมิติ", dateField: "visits.visit_date", source: "satisfaction_surveys", missingRule: "ปกปิดค่าเมื่อ n < 10", decisionUse: "ระบุมิติที่ควรตรวจสอบและปรับปรุง" },
    { key: "expense", label: "ช่วงค่าใช้จ่ายที่รายงานเอง", unit: "category/range", denominator: "คำตอบค่าใช้จ่าย", dateField: "visits.visit_date", source: "visit_expenses", missingRule: "ไม่นำช่องว่างมาคำนวณ", decisionUse: "ดูรูปแบบการใช้จ่ายโดยไม่อ้างเป็นรายได้" },
  ],
  viewer: { displayName: "ผู้ดูแลสังเคราะห์", permissions: ["dashboard.read", "export.summary"] },
  interpretation: "ข้อมูลชุดนี้เป็นสถิติสังเคราะห์สำหรับตรวจการแสดงผล ไม่ใช่หลักฐานการท่องเที่ยวจริง",
};

function distribution(label: string, count: number | null, sampleSize: number, denominator: number, percent: number | null, suppressed = false): DistributionRow {
  return { label, count, sampleSize, denominator, percent, suppressed };
}

function funnelStage(key: string, label: string, count: number, available: boolean, conversionFromPrevious: number | null, dropOffFromPrevious: number | null, note: string): FunnelStage {
  return { key, label, count, available, conversionFromPrevious, dropOffFromPrevious, note };
}

function score(key: string, label: string, value: number | null, sampleSize: number, suppressed = false): SatisfactionMetric {
  return { key, label, value, sampleSize, suppressed };
}

function privateMetric(value: number | null, sampleSize: number, suppressed = false): PrivateMetric {
  return { value, sampleSize, suppressed };
}

function peerSummary(attractionId: number, nameTh: string, visits: number, surveyResponses: number, satisfactionValue: number | null, satisfactionSampleSize: number, suppressed = false): PeerSummary {
  return {
    attractionId,
    nameTh,
    visits,
    surveyResponses,
    surveyCoverage: visits > 0 ? Math.round((surveyResponses / visits) * 100) : null,
    overallSatisfaction: privateMetric(satisfactionValue, satisfactionSampleSize, suppressed),
    satisfaction: [
      { key: "safety_score", label: "ความปลอดภัย", ...privateMetric(suppressed ? null : satisfactionValue === null ? null : satisfactionValue + 0.1, satisfactionSampleSize, suppressed) },
      { key: "cleanliness_score", label: "ความสะอาด", ...privateMetric(suppressed ? null : satisfactionValue === null ? null : satisfactionValue + 0.2, satisfactionSampleSize, suppressed) },
      { key: "accessibility_score", label: "การเข้าถึง", ...privateMetric(suppressed ? null : satisfactionValue === null ? null : satisfactionValue - 0.1, satisfactionSampleSize, suppressed) },
    ],
    revisitRate: privateMetric(suppressed ? null : 78, satisfactionSampleSize, suppressed),
    recommendRate: privateMetric(suppressed ? null : 82, satisfactionSampleSize, suppressed),
    photoCompletion: visits > 0 ? 74 : null,
    certificateCompletion: visits > 0 ? 62 : null,
    stampCompletion: visits > 0 ? 58 : null,
    surveyCompletion: visits > 0 ? Math.round((surveyResponses / visits) * 100) : null,
    researchCompletion: visits > 0 ? 22 : null,
    topExpenseRange: { label: suppressed ? null : "501-1,000 บาท", sampleSize: surveyResponses, suppressed },
    topExpenseCategory: { label: suppressed ? null : "อาหาร", sampleSize: surveyResponses, suppressed },
  };
}

const normalKpis: Kpis = {
  uniqueTourists: 148,
  visits: 216,
  repeatVisits: 68,
  certificateVisits: 162,
  stampVisits: 151,
  surveyResponses: 126,
  surveyRate: 58.3,
  researchEvaluations: 44,
};

const normalAudience: Audience = {
  originProvinces: [distribution("จังหวัดสังเคราะห์ 1", 68, 68, 148, 45.9), distribution("จังหวัดสังเคราะห์ 2", 44, 44, 148, 29.7), distribution("จังหวัดสังเคราะห์ 3", 36, 36, 148, 24.3)],
  originCountries: [distribution("ประเทศสังเคราะห์ 1", 92, 92, 148, 62.2), distribution("ประเทศสังเคราะห์ 2", 56, 56, 148, 37.8)],
  ageGroups: [distribution("18-24", 36, 36, 148, 24.3), distribution("25-34", 58, 58, 148, 39.2), distribution("35-44", 54, 54, 148, 36.5)],
  languages: [distribution("ไทย", 108, 108, 148, 73), distribution("English", 40, 40, 148, 27)],
  companions: [distribution("ครอบครัว", 82, 82, 162, 50.6), distribution("เพื่อน", 54, 54, 162, 33.3), distribution("มาคนเดียว", 26, 26, 162, 16)],
  transports: [distribution("รถยนต์ส่วนตัว", 104, 104, 172, 60.5), distribution("รถโดยสาร", 42, 42, 172, 24.4), distribution("รถเช่า", 26, 26, 172, 15.1)],
  overnight: [distribution("ค้างคืน", 74, 74, 152, 48.7), distribution("ไปเช้าเย็นกลับ", 78, 78, 152, 51.3)],
  purposes: [distribution("พักผ่อน", 96, 96, 180, 53.3), distribution("เรียนรู้", 52, 52, 180, 28.9), distribution("กิจกรรมชุมชน", 32, 32, 180, 17.8)],
};

const emptyAudience: Audience = {
  originProvinces: [], originCountries: [], ageGroups: [], languages: [], companions: [], transports: [], overnight: [], purposes: [],
};

const normalSatisfaction: SatisfactionMetric[] = [
  score("overall_score", "ภาพรวม", 4.18, 126),
  score("safety_score", "ความปลอดภัย", 4.32, 126),
  score("cleanliness_score", "ความสะอาด", 3.86, 121),
  score("facility_score", "สิ่งอำนวยความสะดวก", 3.74, 114),
  score("accessibility_score", "การเข้าถึง", 3.42, 119),
  score("information_score", "ข้อมูลและป้าย", 3.95, 120),
  score("value_score", "ความคุ้มค่า", 4.05, 122),
];

const lowSatisfaction: SatisfactionMetric[] = normalSatisfaction.map((metric) => score(metric.key, metric.label, null, 2, true));
const emptySatisfaction: SatisfactionMetric[] = normalSatisfaction.map((metric) => score(metric.key, metric.label, null, 0));

const normalFunnel: FunnelStage[] = [
  funnelStage("entry", "เปิดจุดเช็กอิน", 248, true, null, null, "Entry event เชื่อมกับ Visit ได้ครบ"),
  funnelStage("visit", "กรอกข้อมูลพื้นฐาน", 216, true, 87.1, 12.9, "ฐานเริ่มต้นของ Visit"),
  funnelStage("photo", "อัปโหลดรูป", 184, true, 85.2, 14.8, "หลังกรอกข้อมูลพื้นฐาน"),
  funnelStage("certificate", "สร้างใบประกาศ", 162, true, 88, 12, "หลังอัปโหลดรูปสำเร็จ"),
  funnelStage("stamp", "ได้รับตราประทับ", 151, true, 93.2, 6.8, "หลังสร้างใบประกาศ"),
  funnelStage("survey", "ตอบแบบสำรวจท่องเที่ยว", 126, true, 83.4, 16.6, "คำตอบแบบสำรวจที่ส่งสำเร็จ"),
  funnelStage("research", "ส่งแบบประเมินงานวิจัย", 44, true, 34.9, 65.1, "คำตอบวิจัยที่ส่งสมบูรณ์"),
];

const lowFunnel: FunnelStage[] = [
  funnelStage("entry", "เปิดจุดเช็กอิน", 2, true, null, null, "ข้อมูลสังเคราะห์ฐานต่ำ"),
  funnelStage("visit", "กรอกข้อมูลพื้นฐาน", 2, true, 100, 0, "ข้อมูลสังเคราะห์ฐานต่ำ"),
  funnelStage("photo", "อัปโหลดรูป", 1, true, 50, 50, "ข้อมูลสังเคราะห์ฐานต่ำ"),
  funnelStage("certificate", "สร้างใบประกาศ", 1, true, 100, 0, "ข้อมูลสังเคราะห์ฐานต่ำ"),
  funnelStage("stamp", "ได้รับตราประทับ", 1, true, 100, 0, "ข้อมูลสังเคราะห์ฐานต่ำ"),
  funnelStage("survey", "ตอบแบบสำรวจท่องเที่ยว", 1, true, 100, 0, "ข้อมูลสังเคราะห์ฐานต่ำ"),
  funnelStage("research", "ส่งแบบประเมินงานวิจัย", 1, true, 100, 0, "ข้อมูลสังเคราะห์ฐานต่ำ"),
];

const emptyFunnel: FunnelStage[] = [
  funnelStage("entry", "เปิดจุดเช็กอิน", 0, false, null, null, "ยังไม่มี Visit สำหรับเชื่อม Entry event"),
  funnelStage("visit", "กรอกข้อมูลพื้นฐาน", 0, true, null, null, "ยังไม่มีรายการเข้าชม"),
  funnelStage("photo", "อัปโหลดรูป", 0, true, null, null, "ยังไม่มีรายการเข้าชม"),
  funnelStage("certificate", "สร้างใบประกาศ", 0, true, null, null, "ยังไม่มีรายการเข้าชม"),
  funnelStage("stamp", "ได้รับตราประทับ", 0, true, null, null, "ยังไม่มีรายการเข้าชม"),
  funnelStage("survey", "ตอบแบบสำรวจท่องเที่ยว", 0, true, null, null, "ยังไม่มีรายการเข้าชม"),
  funnelStage("research", "ส่งแบบประเมินงานวิจัย", 0, true, null, null, "ยังไม่มีรายการเข้าชม"),
];

const normalIntentions: Intentions = {
  revisit: [distribution("ตั้งใจกลับมา", 96, 96, 126, 76.2), distribution("ยังไม่แน่ใจ", 22, 22, 126, 17.5), distribution("ไม่ตั้งใจกลับมา", 8, 8, 126, 6.3)],
  recommend: [distribution("ตั้งใจแนะนำ", 104, 104, 126, 82.5), distribution("ยังไม่แน่ใจ", 16, 16, 126, 12.7), distribution("ไม่ตั้งใจแนะนำ", 6, 6, 126, 4.8)],
  commentCount: 37,
};

const emptyIntentions: Intentions = { revisit: [], recommend: [], commentCount: 0 };
const lowIntentions: Intentions = {
  revisit: [distribution("กลุ่มคำตอบขนาดเล็ก (ปกปิด)", null, 2, 2, null, true)],
  recommend: [distribution("กลุ่มคำตอบขนาดเล็ก (ปกปิด)", null, 2, 2, null, true)],
  commentCount: 0,
};

const normalImprovements: Improvements = {
  issueCount: 3,
  openIssueCount: 2,
  actionCount: 1,
  overdueActionCount: 1,
  recentIssues: [{ id: "synthetic-issue-701", dimension: "accessibility", category: "facilities", status: "open", responseCount: 24, currentScore: 3.42 }],
  recentActions: [{ id: "synthetic-action-701", title: "ทบทวนป้ายสังเคราะห์", status: "in_progress", dueDate: "2026-08-20", priority: "medium" }],
};

const emptyImprovements: Improvements = { issueCount: 0, openIssueCount: 0, actionCount: 0, overdueActionCount: 0, recentIssues: [], recentActions: [] };

const normalInsights: Insight[] = [
  { tone: "improvement", title: "ควรทบทวนการเข้าถึง", evidence: "คะแนนการเข้าถึง 3.42 / 5 จาก n=119", action: "เปิดประเด็นที่ผ่านการทบทวนและกำหนดผู้รับผิดชอบ" },
  { tone: "funnel", title: "จุดหลุดสูงสุด: ส่งแบบประเมินงานวิจัย", evidence: "Drop-off 65.1% จากขั้นก่อนหน้า", action: "ตรวจ flow บนอุปกรณ์จริงและข้อความช่วยเหลือ" },
];

const lowInsights: Insight[] = [
  { tone: "data_quality", title: "ฐานคำตอบยังน้อย", evidence: "1 แบบสำรวจจาก 2 Visits", action: "เพิ่มการเชิญตอบแบบสำรวจโดยไม่บังคับ" },
];

function quality(truncated: boolean, profileCoverage: number | null, surveyCoverage: number | null, expenseCoverage: number | null, scopeNote: string): AttractionAnalyticsViewModel["quality"] {
  return { truncated, profileCoverage, surveyCoverage, expenseCoverage, smallCellThreshold: 10, scopeNote };
}

const normalScenario: Omit<AttractionAnalyticsViewModel, keyof typeof shared> = {
  kpis: normalKpis,
  trend: [18, 24, 23, 36, 40, 68, 76, 45, 28, 32, 42, 35, 40, 47, 22, 64].map((value, index) => ({ label: `2026-08-${String(index + 1).padStart(2, "0")}`, value })),
  funnel: normalFunnel,
  audience: normalAudience,
  expenses: {
    ranges: [distribution("0-500 บาท", 34, 34, 126, 27), distribution("501-1,000 บาท", 56, 56, 126, 44.4), distribution("1,001-2,000 บาท", 36, 36, 126, 28.6)],
    categories: [distribution("อาหาร", 62, 62, 126, 49.2), distribution("เดินทาง", 38, 38, 126, 30.2), distribution("กิจกรรม", 26, 26, 126, 20.6)],
    responseCount: 126,
    note: "ช่วงและหมวดค่าใช้จ่ายเป็นข้อมูลสังเคราะห์ที่ผู้ตอบรายงานเอง ไม่ใช่รายได้ของธุรกิจ",
  },
  satisfaction: normalSatisfaction,
  intentions: normalIntentions,
  quality: quality(false, 91.2, 58.3, 58.3, "รวมข้อมูลสังเคราะห์ภาคสนามเพื่อทดสอบการแสดงผล"),
  peerComparison: {
    status: "ready",
    unavailableReason: null,
    eligibilityNote: "จังหวัดสังเคราะห์เดียวกัน ประเภทหลักเดียวกัน และมีอย่างน้อย 10 Visits",
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    dateAligned: true,
    eligiblePeerCount: 2,
    rankDenominator: 3,
    selectedRank: 2,
    selected: peerSummary(attraction.attractionId, attraction.nameTh, 216, 126, 4.18, 126),
    peers: [peerSummary(702, "แหล่งเรียนรู้สังเคราะห์ B", 252, 148, 4.36, 148), peerSummary(703, "แหล่งเรียนรู้สังเคราะห์ C", 180, 98, 3.88, 98)],
  },
  improvements: normalImprovements,
  insights: normalInsights,
};

const emptyScenario: Omit<AttractionAnalyticsViewModel, keyof typeof shared> = {
  kpis: { uniqueTourists: 0, visits: 0, repeatVisits: 0, certificateVisits: 0, stampVisits: 0, surveyResponses: 0, surveyRate: null, researchEvaluations: 0 },
  trend: [],
  funnel: emptyFunnel,
  audience: emptyAudience,
  expenses: { ranges: [], categories: [], responseCount: 0, note: "ยังไม่มีข้อมูลค่าใช้จ่ายในช่วงที่เลือก" },
  satisfaction: emptySatisfaction,
  intentions: emptyIntentions,
  quality: quality(false, null, null, null, "ยังไม่มีข้อมูลในขอบเขตที่เลือก"),
  peerComparison: { status: "unavailable", unavailableReason: "ยังไม่มีข้อมูลของสถานที่ที่เลือกในช่วงเวลานี้", eligibilityNote: "เปรียบเทียบเฉพาะสถานที่ที่เข้าเกณฑ์เดียวกัน", dateFrom: filters.dateFrom, dateTo: filters.dateTo, dateAligned: true, eligiblePeerCount: 0, rankDenominator: 0, selectedRank: null, selected: null, peers: [] },
  improvements: emptyImprovements,
  insights: [],
};

const lowScenario: Omit<AttractionAnalyticsViewModel, keyof typeof shared> = {
  kpis: { uniqueTourists: 2, visits: 2, repeatVisits: 0, certificateVisits: 1, stampVisits: 1, surveyResponses: 1, surveyRate: 50, researchEvaluations: 1 },
  trend: [{ label: "2026-08-14", value: 2 }],
  funnel: lowFunnel,
  audience: {
    originProvinces: [distribution("กลุ่มขนาดเล็ก (ปกปิด)", null, 2, 2, null, true)],
    originCountries: [distribution("กลุ่มขนาดเล็ก (ปกปิด)", null, 2, 2, null, true)],
    ageGroups: [distribution("กลุ่มขนาดเล็ก (ปกปิด)", null, 2, 2, null, true)],
    languages: [], companions: [], transports: [], overnight: [], purposes: [],
  },
  expenses: { ranges: [distribution("กลุ่มขนาดเล็ก (ปกปิด)", null, 1, 1, null, true)], categories: [], responseCount: 1, note: "ข้อมูลค่าใช้จ่ายมีฐานต่ำและถูกปกปิดเพื่อความเป็นส่วนตัว" },
  satisfaction: lowSatisfaction,
  intentions: lowIntentions,
  quality: quality(false, 100, 50, 50, "ฐานข้อมูลสังเคราะห์มีขนาดต่ำ ควรใช้ตรวจสถานะการแสดงผลเท่านั้น"),
  peerComparison: { status: "insufficient_peers", unavailableReason: null, eligibilityNote: "ยังมีเพื่อนเทียบไม่เพียงพอสำหรับสรุปภาพรวม", dateFrom: filters.dateFrom, dateTo: filters.dateTo, dateAligned: true, eligiblePeerCount: 0, rankDenominator: 1, selectedRank: 1, selected: peerSummary(attraction.attractionId, attraction.nameTh, 2, 1, null, 1, true), peers: [] },
  improvements: emptyImprovements,
  insights: lowInsights,
};

function buildFixture(scenario: Omit<AttractionAnalyticsViewModel, keyof typeof shared>): AttractionAnalyticsViewModel {
  const result = { ...shared, ...scenario };
  if (scenario === normalScenario) {
    result.channels = {
      ...shared.channels, status: "ready", entries: 240,
      note: "ข้อมูลสังเคราะห์สำหรับตรวจหน้าจอ · จำนวนรอบเข้าใช้งาน ไม่ใช่จำนวนบุคคล",
      channels: (["qr", "nfc"] as const).map((channel) => ({
        channel, entries: 120, share: 50, linkedVisits: 100, visitConversion: 83.3,
        certificates: channel === "qr" ? 80 : 90, certificateConversion: channel === "qr" ? 66.7 : 75,
        surveys: 60, surveyConversion: 50, suppressed: false,
      })),
      daily: Array.from({ length: 6 }, (_, index) => ({ date: `2026-08-0${index + 1}`, qr: [15, 20, 25, 20, 15, 25][index], nfc: [20, 15, 20, 30, 20, 15][index] })),
    };
  }
  return result;
}

export function attractionFixture(state: string | null): AttractionAnalyticsViewModel {
  if (state === "empty") return buildFixture(emptyScenario);
  if (state === "low") return buildFixture(lowScenario);
  return buildFixture(normalScenario);
}
