import { describe, expect, it } from "vitest";
import {
  getStoryReadinessPresentation,
  getStoryStatusPresentation,
} from "@/lib/content/story-library";
import { adminStoryFiltersSchema } from "@/lib/validation/story";

describe("story library presentation", () => {
  it("uses Thai-first labels for every canonical workflow state", () => {
    expect(getStoryStatusPresentation("draft")).toEqual({ label: "ฉบับร่าง", tone: "gray" });
    expect(getStoryStatusPresentation("in_review")).toEqual({ label: "กำลังตรวจ", tone: "gold" });
    expect(getStoryStatusPresentation("scheduled")).toEqual({ label: "ตั้งเวลาแล้ว", tone: "teal" });
    expect(getStoryStatusPresentation("published")).toEqual({ label: "เผยแพร่แล้ว", tone: "green" });
    expect(getStoryStatusPresentation("rejected")).toEqual({ label: "ไม่อนุมัติ", tone: "red" });
  });

  it("describes content readiness without overstating incomplete scores", () => {
    expect(getStoryReadinessPresentation(null)).toEqual({ label: "ยังไม่ประเมิน", tone: "gray" });
    expect(getStoryReadinessPresentation(72)).toEqual({ label: "ควรตรวจเพิ่ม 72%", tone: "gold" });
    expect(getStoryReadinessPresentation(100)).toEqual({ label: "พร้อมเผยแพร่ 100%", tone: "green" });
  });
});

describe("story library filters", () => {
  it("accepts production filters and rejects invalid status or date ranges", () => {
    expect(
      adminStoryFiltersSchema.safeParse({
        page: "2",
        pageSize: "20",
        provinceId: "2",
        topicId: "4",
        status: "in_review",
        readiness: "needs_work",
        dateFrom: "2026-07-01",
        dateTo: "2026-07-17",
      }).success
    ).toBe(true);

    expect(adminStoryFiltersSchema.safeParse({ status: "unknown" }).success).toBe(false);
    expect(adminStoryFiltersSchema.safeParse({ dateFrom: "2026-02-31" }).success).toBe(false);
    expect(
      adminStoryFiltersSchema.safeParse({ dateFrom: "2026-07-20", dateTo: "2026-07-01" }).success
    ).toBe(false);
  });
});
