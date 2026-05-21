export const DASHBOARD_DATE_RANGE_MAX_DAYS = 366;
export const DASHBOARD_ROW_LIMIT = 10000;
export const DASHBOARD_TOP_ATTRACTION_LIMIT = 8;

export const DASHBOARD_METRIC_DEFINITIONS = {
  touristProfiles:
    "Tourist Profiles: จำนวนโปรไฟล์ที่มี visit ในตัวกรองนี้ ไม่ใช่จำนวนบุคคลที่ยืนยันตัวตนจริง",
  totalVisits:
    "Total Visits: จำนวน visit ที่ถูกสร้างหลังผู้ใช้กรอกข้อมูลขั้นต่ำและยินยอมแล้ว ไม่รวม QR scans",
  qrScans: "QR Scans: จำนวนครั้งที่มีการสแกน QR ไม่ใช่จำนวนการเข้าชมจริง",
  landingViews: "Landing Views: จำนวนครั้งที่เปิดหน้า QR landing ไม่ใช่ visit",
  certificatesGenerated: "Certificates Generated: จำนวนใบประกาศ/การ์ดความทรงจำที่สร้างสำเร็จ",
  stampsEarned: "Stamps Earned: จำนวนตราประทับดิจิทัลที่ได้รับ โดยปกติหนึ่ง attraction ต่อ tourist profile",
  surveyCompletionRate:
    "Survey Completion Rate: แบบสอบถามที่ส่งแล้วหารด้วยจำนวน certificate generated; ถ้าไม่มี certificate จะแสดง No data",
  averageSatisfaction: "Average Satisfaction: เฉลี่ยจากผู้ที่ตอบแบบสอบถามเท่านั้น ไม่รวมคำตอบที่ว่าง",
  estimatedSpending: "Estimated Spending: ค่าใช้จ่ายโดยประมาณจากช่วงค่าใช้จ่ายในแบบสอบถาม ไม่ใช่รายได้จริง",
  topAttraction: "Top Attraction: attraction ที่มีจำนวน visit สูงสุดในตัวกรองนี้"
} as const;

export const FUNNEL_STAGE_DEFINITIONS = [
  {
    key: "qr_scanned",
    label: "QR scanned",
    definition: "จำนวน QR scan events; ไม่ใช่ visits"
  },
  {
    key: "landing_viewed",
    label: "Landing viewed",
    definition: "จำนวนครั้งที่เปิดหน้า location-specific QR landing"
  },
  {
    key: "certificate_started",
    label: "Certificate started",
    definition: "จำนวนครั้งที่เริ่ม flow เพื่อรับ certificate"
  },
  {
    key: "minimal_form_completed",
    label: "Minimal form submitted",
    definition: "จำนวน event หลังกรอกข้อมูลขั้นต่ำและ consent"
  },
  {
    key: "photo_uploaded",
    label: "Photo uploaded",
    definition: "จำนวน event หลังอัปโหลดรูปสำเร็จ"
  },
  {
    key: "certificate_generated",
    label: "Certificate generated",
    definition: "จำนวน event หลังสร้าง certificate สำเร็จ"
  },
  {
    key: "survey_started",
    label: "Survey started",
    definition: "จำนวน event เปิด optional survey หลัง reward"
  },
  {
    key: "survey_completed",
    label: "Survey completed",
    definition: "จำนวน event ส่ง optional survey สำเร็จ"
  },
  {
    key: "passport_saved",
    label: "Passport saved",
    definition: "จำนวน event บันทึก/เชื่อม passport ในอนาคต ถ้ายังไม่มี event จะแสดง 0"
  }
] as const;
