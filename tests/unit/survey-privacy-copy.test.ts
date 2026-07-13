import { describe, expect, it } from "vitest";
import { SURVEY_PRIVACY_NOTICE } from "@/lib/content/survey-copy";

describe("optional survey privacy copy", () => {
  it("honestly explains record linkage without claiming the response is anonymous", () => {
    expect(SURVEY_PRIVACY_NOTICE).toContain("เชื่อมกับการเข้าชมครั้งนี้");
    expect(SURVEY_PRIVACY_NOTICE).toContain("ใช้วิเคราะห์ภาพรวม");
    expect(SURVEY_PRIVACY_NOTICE).not.toContain("ไม่มีการระบุตัวตน");
  });
});
