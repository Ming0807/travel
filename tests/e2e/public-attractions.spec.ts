import { expect, test } from "@playwright/test";

test.describe("Public attractions navigation", () => {
  test("opens attraction discovery from the homepage", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /สำรวจทุกสถานที่|สำรวจสถานที่ทั้งหมด|ดูสถานที่ทั้งหมด/ }).first().click();

    await expect(page).toHaveURL(/\/attractions$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("สถานที่ท่องเที่ยว");
  });

  test("renders a truthful attraction detail with usable gallery controls", async ({ page }) => {
    await page.goto("/attractions/yala-beef-soup");

    await expect(page.getByRole("heading", { level: 1, name: "ซุปเนื้อยะลา สาขาดั้งเดิม" })).toBeVisible();
    await expect(page.getByText("Population")).toHaveCount(0);
    await expect(page.getByText("Currency")).toHaveCount(0);
    await expect(page.getByText("+18 Photos")).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/attractions\/yala-beef-soup$/);

    const galleryButton = page.getByRole("button", { name: "ดูรูปทั้งหมด 2 รูป" });
    await expect(galleryButton).toBeVisible();
    await galleryButton.click();
    await expect(page.getByRole("dialog", { name: /รูปภาพ ซุปเนื้อยะลา/ })).toBeVisible();
    await page.getByRole("button", { name: "ปิดรูปภาพ" }).click();
  });

  test("keeps the attraction detail within a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/attractions/yala-beef-soup");

    await expect(page.getByLabel("ไปยังส่วนของหน้านี้")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  });
});
