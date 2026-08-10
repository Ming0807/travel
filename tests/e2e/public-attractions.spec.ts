import { expect, test } from "@playwright/test";

test.describe("Public attractions navigation", () => {
  test("opens attraction discovery from the homepage", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /สำรวจทุกสถานที่|สำรวจสถานที่ทั้งหมด|ดูสถานที่ทั้งหมด/ }).first().click();

    await expect(page).toHaveURL(/\/attractions$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("สถานที่ท่องเที่ยว");
  });
});
