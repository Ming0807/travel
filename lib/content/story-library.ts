import type { StatusBadgeTone } from "@/components/admin/StatusBadge";

type StoryStatusPresentation = { label: string; tone: StatusBadgeTone };
export type StoryLibraryMode = "editorial" | "submissions";

const statusPresentations: Record<string, StoryStatusPresentation> = {
  draft: { label: "ฉบับร่าง", tone: "gray" },
  submitted: { label: "รอตรวจ", tone: "gold" },
  pending: { label: "รอตรวจ", tone: "gold" },
  in_review: { label: "กำลังตรวจ", tone: "gold" },
  changes_requested: { label: "ขอข้อมูลเพิ่ม", tone: "gold" },
  approved: { label: "อนุมัติแล้ว", tone: "teal" },
  scheduled: { label: "ตั้งเวลาแล้ว", tone: "teal" },
  published: { label: "เผยแพร่แล้ว", tone: "green" },
  rejected: { label: "ไม่อนุมัติ", tone: "red" },
  archived: { label: "เก็บถาวร", tone: "gray" },
};

export function getStoryStatusPresentation(status: string): StoryStatusPresentation {
  return statusPresentations[status] ?? { label: "ไม่ทราบสถานะ", tone: "gray" };
}

export function getStoryReadinessPresentation(score: number | null): StoryStatusPresentation {
  if (score === null) return { label: "ยังไม่ประเมิน", tone: "gray" };
  const bounded = Math.min(100, Math.max(0, Math.round(score)));
  if (bounded >= 100) return { label: `พร้อมเผยแพร่ ${bounded}%`, tone: "green" };
  if (bounded >= 70) return { label: `ควรตรวจเพิ่ม ${bounded}%`, tone: "gold" };
  return { label: `ยังไม่พร้อม ${bounded}%`, tone: "gray" };
}
