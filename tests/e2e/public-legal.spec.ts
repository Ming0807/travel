import { expect, test } from "@playwright/test";

test.describe("Public legal documents", () => {
  test("privacy notice exposes the real data choices without unsupported contacts", async ({ page }) => {
    await page.goto("/privacy");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "นโยบายความเป็นส่วนตัวสำหรับระบบนำร่อง",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "ส่งคำขอเกี่ยวกับข้อมูล" })).toHaveAttribute(
      "href",
      "/contact",
    );
    await expect(
      page.getByText("ไม่มีนโยบายลบอัตโนมัติแบบระยะเวลาเดียว", { exact: false }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText("dpo@southernborder.tourism.go.th");
    await expect(page.locator("body")).not.toContainText("Google Analytics");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("terms preserve the content-rights anchor and public service boundaries", async ({ page }) => {
    await page.goto("/terms#content-rights");

    await expect(
      page.getByRole("heading", { level: 1, name: "เงื่อนไขการใช้บริการ" }),
    ).toBeVisible();
    await expect(page.locator("#content-rights")).toBeVisible();
    await expect(page.locator("#content-rights")).toContainText(
      "คุณยังคงเป็นเจ้าของเนื้อหาที่ส่ง",
    );
    await expect(page.getByRole("link", { name: "อ่านนโยบายความเป็นส่วนตัว" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(page.locator("body")).toContainText("ไม่ใช่หลักฐานราชการ");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
