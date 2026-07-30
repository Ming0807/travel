import { describe, expect, it } from "vitest";
import { plainTextFromLegacyHtml } from "@/lib/content/plain-text";

describe("plainTextFromLegacyHtml", () => {
  it("turns legacy formatting tags into readable plain text", () => {
    expect(
      plainTextFromLegacyHtml(
        'เรื่องราวและแรงบันดาลใจ <br class="hidden lg:block"/>สำหรับ <strong>ทุกการเดินทาง</strong>'
      )
    ).toBe("เรื่องราวและแรงบันดาลใจ สำหรับ ทุกการเดินทาง");
  });

  it("decodes common entities before removing markup", () => {
    expect(plainTextFromLegacyHtml("อาหาร &amp; วิถีชุมชน")).toBe(
      "อาหาร & วิถีชุมชน"
    );
  });
});
