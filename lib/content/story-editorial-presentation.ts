import type {
  StoryReadinessKey,
  StoryReadinessResult,
} from "@/lib/content/story-readiness";

const readinessPresentation: Record<
  StoryReadinessKey,
  { label: string; help: string }
> = {
  title: { label: "ชื่อบทความ", help: "ระบุชื่อที่สื่อความหมายชัดเจน" },
  slug: { label: "ลิงก์บทความ", help: "ใช้ slug ภาษาอังกฤษที่ถูกต้อง" },
  excerpt: { label: "เกริ่นนำ", help: "สรุปเนื้อหาให้ผู้อ่านเข้าใจก่อนเปิดอ่าน" },
  content: { label: "เนื้อหาฉบับเต็ม", help: "เพิ่มเนื้อหาที่มีสาระอย่างน้อยหนึ่งส่วน" },
  cover: { label: "รูปภาพปก", help: "เลือกรูปจากคลังสื่อที่ผ่านการตรวจแล้ว" },
  cover_active: { label: "สถานะรูปปก", help: "รูปปกต้องยังเปิดใช้งานอยู่" },
  cover_alt: { label: "คำอธิบายรูปปก", help: "เพิ่ม alt text เพื่อการเข้าถึงและการค้นหา" },
  geography: { label: "พื้นที่ที่เกี่ยวข้อง", help: "เลือกจังหวัดหลักหรือระบุว่าเป็นเรื่องข้ามจังหวัด" },
  topic: { label: "หัวข้อเนื้อหา", help: "เลือกอย่างน้อยหนึ่งหัวข้อเพื่อใช้ค้นหาและแนะนำ" },
  seo: { label: "คำอธิบายสำหรับค้นหา", help: "เขียนคำอธิบาย SEO ที่สรุปบทความ" },
};

export function getStoryReadinessAdminItems(result: StoryReadinessResult) {
  return result.items.map((item) => ({
    key: item.key,
    label: readinessPresentation[item.key].label,
    help: readinessPresentation[item.key].help,
    complete: item.complete,
  }));
}

const revisionActionLabels: Record<string, string> = {
  save: "บันทึกการแก้ไข",
  submit_review: "ส่งตรวจ",
  approve: "อนุมัติ",
  schedule: "ตั้งเวลาเผยแพร่",
  publish: "เผยแพร่",
  unpublish: "นำออกจากการเผยแพร่",
  archive: "เก็บถาวร",
  moderate: "ตรวจสอบเนื้อหา",
};

export function getStoryRevisionActionLabel(sourceAction: string): string {
  return revisionActionLabels[sourceAction] ?? "อัปเดตบทความ";
}
