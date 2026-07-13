import type { DashboardAlert, DashboardKpi, InsightCardData } from "@/types/dashboard";

const LABELS: Record<string, string> = {
  "Tourist Profiles": "โปรไฟล์นักท่องเที่ยว",
  "Total Visits": "การเข้าชมที่บันทึก",
  "QR Scans": "การสแกน QR",
  "Landing Views": "การเปิดหน้าเช็กอิน",
  "Certificates Generated": "ใบประกาศที่สร้าง",
  "Stamps Earned": "ตราประทับที่ได้รับ",
  "Survey Completion": "อัตราตอบแบบสำรวจ",
  "Survey Completion Rate": "อัตราตอบแบบสำรวจ",
  "Average Satisfaction": "ความพึงพอใจเฉลี่ย",
  "Estimated Spending": "ค่าใช้จ่ายโดยประมาณ",
  "Top Attraction": "สถานที่ที่มีการเข้าชมสูงสุด",
  "No data": "ยังไม่มีข้อมูล",
  Unknown: "ไม่ระบุ",
  Thailand: "ประเทศไทย",
  Thai: "ภาษาไทย",
  English: "ภาษาอังกฤษ",
  anonymous_device: "ใช้งานแบบผู้เยี่ยมชม",
  Alone: "เดินทางคนเดียว",
  Family: "ครอบครัว",
  Friends: "เพื่อน",
  Couple: "คู่รัก",
  "Same day": "ไม่ค้างคืน",
  Overnight: "ค้างคืน",
  under_18: "ต่ำกว่า 18 ปี",
  "0-15": "ต่ำกว่า 18 ปี (ข้อมูลเดิม)",
  "16-24": "16-24 ปี (ข้อมูลเดิม)",
  "18_24": "18-24 ปี",
  "25_34": "25-34 ปี",
  "25-34": "25-34 ปี (ข้อมูลเดิม)",
  "35_44": "35-44 ปี",
  "35-44": "35-44 ปี (ข้อมูลเดิม)",
  "45_54": "45-54 ปี",
  "45-54": "45-54 ปี (ข้อมูลเดิม)",
  "55_64": "55-64 ปี",
  "55-64": "55-64 ปี (ข้อมูลเดิม)",
  "65_plus": "65 ปีขึ้นไป",
  "65+": "65 ปีขึ้นไป (ข้อมูลเดิม)",
  prefer_not_to_answer: "ไม่ประสงค์ระบุ",
};

const METRIC_DEFINITIONS: Record<string, string> = {
  tourist_profiles: "จำนวนโปรไฟล์ในระบบที่มีรายการเข้าชม ไม่ใช่จำนวนบุคคลจริงที่ผ่านการยืนยันตัวตน",
  total_visits: "จำนวนรายการเข้าชมที่บันทึกสำเร็จ การสแกน QR เพียงอย่างเดียวยังไม่นับเป็นการเข้าชม",
  certificates_generated: "จำนวนใบประกาศดิจิทัลที่สร้างจากรายการเข้าชม",
  survey_completion_rate: "สัดส่วนผู้ที่ทำแบบสำรวจเสร็จจากฐานที่กำหนดในพจนานุกรมตัวชี้วัด",
  average_satisfaction: "คะแนนความพึงพอใจเฉลี่ยจากคำตอบที่มีข้อมูล ไม่รวมคำตอบที่เว้นว่าง",
  estimated_spending: "ผลรวมช่วงค่าใช้จ่ายที่ผู้ใช้รายงานด้วยตนเอง เป็นค่าประมาณ ไม่ใช่รายได้ที่ตรวจสอบแล้ว",
};

export function localizeDashboardLabel(label: string): string {
  return LABELS[label] ?? label;
}

export function localizeDashboardKpi(metric: DashboardKpi): DashboardKpi {
  return {
    ...metric,
    label: LABELS[metric.label] ?? metric.label,
    value: metric.value === "No data" ? "ยังไม่มีข้อมูล" : metric.value,
    definition: METRIC_DEFINITIONS[metric.key] ?? metric.definition,
  };
}

const DIMENSIONS: Record<string, string> = {
  safety: "ความปลอดภัย",
  cleanliness: "ความสะอาด",
  accessibility: "การเข้าถึง",
  information: "ข้อมูลและป้ายแนะนำ",
  value: "ความคุ้มค่า",
  facility: "สิ่งอำนวยความสะดวก (ข้อมูลเดิม)",
};

function firstNumber(text: string): string | null {
  return text.match(/\d+(?:\.\d+)?/)?.[0] ?? null;
}

function alertCopy(alert: DashboardAlert): { title: string; message: string } {
  if (alert.id === "satisfaction_no_data") {
    return { title: "ยังไม่มีคำตอบด้านความพึงพอใจ", message: "ช่วงข้อมูลที่เลือกยังไม่มีแบบสำรวจความพึงพอใจ จึงยังสรุปคะแนนเฉลี่ยไม่ได้" };
  }
  if (alert.id.startsWith("dimension_")) {
    const dimension = Object.keys(DIMENSIONS).find((key) => alert.id.endsWith(key));
    const score = firstNumber(alert.message);
    return {
      title: `${DIMENSIONS[dimension ?? ""] ?? "คะแนนประสบการณ์"}${alert.severity === "critical" ? "อยู่ในระดับต่ำมาก" : "ต่ำกว่าเป้าหมาย"}`,
      message: `${score ? `ค่าเฉลี่ย ${score} จาก 5 คะแนน ` : ""}ควรตรวจสอบสถานที่และข้อเสนอแนะที่เกี่ยวข้องก่อนกำหนดแนวทางปรับปรุง`,
    };
  }
  if (alert.id === "overall_satisfaction_low") {
    return { title: "ความพึงพอใจโดยรวมต่ำกว่าเป้าหมาย", message: `คะแนนเฉลี่ย${firstNumber(alert.message) ? ` ${firstNumber(alert.message)} จาก 5` : ""} ควรพิจารณาร่วมกับจำนวนผู้ตอบและรายสถานที่` };
  }
  if (alert.id === "revisit_intention_low" || alert.id === "recommend_intention_low") {
    return {
      title: alert.id === "revisit_intention_low" ? "ความตั้งใจกลับมาเที่ยวซ้ำยังต่ำ" : "ความตั้งใจแนะนำต่อยังต่ำ",
      message: `${firstNumber(alert.message) ? `มีผู้ตอบ ${firstNumber(alert.message)}% ` : ""}ควรตรวจสอบปัจจัยด้านประสบการณ์และข้อจำกัดของกลุ่มตัวอย่าง`,
    };
  }
  if (alert.id.startsWith("funnel_")) {
    const percent = alert.message.match(/\d+%/)?.[0];
    return {
      title: alert.id.includes("no_") ? "ยังไม่มีข้อมูลเส้นทางการใช้งาน" : "พบการออกจากขั้นตอนที่ควรตรวจสอบ",
      message: percent ? `มีผู้ใช้ออกจากขั้นตอนประมาณ ${percent} ควรตรวจสอบประสบการณ์ของขั้นตอนที่เกี่ยวข้อง` : "ช่วงข้อมูลที่เลือกยังไม่เพียงพอสำหรับวิเคราะห์เส้นทางตั้งแต่สแกน QR ถึงรับใบประกาศ",
    };
  }
  if (alert.id === "survey_completion_low") {
    return { title: "อัตราตอบแบบสำรวจยังต่ำ", message: `${firstNumber(alert.message) ? `มีผู้ทำแบบสำรวจเสร็จ ${firstNumber(alert.message)}% ` : ""}ผลวิเคราะห์อาจยังไม่เป็นตัวแทนของผู้เข้าชมทั้งหมด` };
  }
  if (alert.id.startsWith("expense_")) {
    return { title: alert.id === "expense_no_data" ? "ยังไม่มีข้อมูลค่าใช้จ่าย" : "ข้อมูลค่าใช้จ่ายยังมีจำนวนน้อย", message: "ค่าใช้จ่ายเป็นข้อมูลช่วงที่ผู้ใช้รายงานด้วยตนเอง ควรรอข้อมูลเพิ่มก่อนนำไปสรุปเชิงนโยบาย" };
  }
  return { title: alert.title, message: alert.message };
}

export function localizeDashboardAlert(alert: DashboardAlert): DashboardAlert {
  return { ...alert, ...alertCopy(alert), actionLabel: alert.actionable ? "ดูรายละเอียด" : undefined };
}

export function localizeDashboardInsight(insight: InsightCardData): InsightCardData {
  const subject = insight.description.split(" has ")[0].split(" currently")[0].split(" leads ")[0] || "สถานที่ที่พบ";
  const numbers = insight.evidence.match(/\d+(?:\.\d+)?/g) ?? [];
  const copy: Record<string, Pick<InsightCardData, "title" | "description" | "evidence" | "suggestedAction">> = {
    "Improvement priority": {
      title: "สถานที่ที่ควรให้ความสำคัญในการปรับปรุง",
      description: `${subject} มีการเข้าชมในระดับที่ควรติดตาม แต่คะแนนความพึงพอใจยังต่ำกว่าแห่งอื่น`,
      evidence: `${numbers[0] ?? "ไม่ระบุ"} รายการเข้าชม · ความพึงพอใจ ${numbers[1] ?? "ยังไม่มีข้อมูล"} จาก 5`,
      suggestedAction: "ตรวจสอบการเข้าถึง ความสะอาด ความปลอดภัย ข้อมูลหน้างาน และการไหลของผู้เข้าชมก่อนเพิ่มการประชาสัมพันธ์",
    },
    "Promotion opportunity": {
      title: "โอกาสในการส่งเสริมสถานที่",
      description: `${subject} ได้รับความพึงพอใจดี แต่ยังมีจำนวนการเข้าชมที่บันทึกไม่มาก`,
      evidence: `${numbers[0] ?? "ไม่ระบุ"} รายการเข้าชม · ความพึงพอใจ ${numbers[1] ?? "ยังไม่มีข้อมูล"} จาก 5`,
      suggestedAction: "พิจารณาเพิ่มในเส้นทางแนะนำ เนื้อหาหน้าแรก หรือกิจกรรมใบประกาศ โดยติดตามผลหลังดำเนินการ",
    },
    "Province concentration": {
      title: "การเข้าชมกระจุกตัวในบางจังหวัด",
      description: `${subject} มีสัดส่วนรายการเข้าชมที่บันทึกสูงที่สุดในช่วงที่เลือก`,
      evidence: `${numbers[0] ?? "ไม่ระบุ"} จาก ${numbers[1] ?? "ไม่ระบุ"} รายการ (${numbers[2] ?? "ไม่ระบุ"}%)`,
      suggestedAction: "เปรียบเทียบตำแหน่ง QR จำนวนสถานที่ที่เข้าร่วม และการประชาสัมพันธ์ของแต่ละจังหวัดก่อนตีความว่าเป็นความต้องการจริง",
    },
    "Top attraction signal": {
      title: "สัญญาณจากสถานที่อันดับสูงสุด",
      description: `${subject} มีรายการเข้าชมที่บันทึกสูงสุดในช่วงที่เลือก`,
      evidence: `${numbers[0] ?? "ไม่ระบุ"} รายการเข้าชม · ${numbers[1] ?? "ไม่ระบุ"} ใบประกาศ`,
      suggestedAction: "ใช้เป็นกรณีศึกษาเรื่องตำแหน่ง QR ความน่าสนใจของใบประกาศ และการออกแบบเส้นทางแนะนำ",
    },
    "Survey sample limitation": {
      title: "ข้อจำกัดของกลุ่มตัวอย่างแบบสำรวจ",
      description: "ข้อมูลความพึงพอใจและค่าใช้จ่ายมาจากผู้ที่เลือกตอบแบบสำรวจเท่านั้น",
      evidence: numbers.length > 0 ? `มีข้อมูลอ้างอิง ${numbers.join(" / ")} รายการตามตัวชี้วัดที่เกี่ยวข้อง` : "จำนวนคำตอบอาจยังไม่ครอบคลุมผู้เข้าชมทั้งหมด",
      suggestedAction: "รักษาแบบสำรวจให้สั้นและขอข้อมูลหลังผู้ใช้ได้รับใบประกาศแล้ว โดยไม่บังคับให้ตอบ",
    },
  };
  return copy[insight.title] ? { ...insight, ...copy[insight.title] } : insight;
}
