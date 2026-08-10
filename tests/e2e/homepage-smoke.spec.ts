import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = path.resolve(__dirname, "screenshots");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-375", width: 375, height: 812 },
] as const;

test.describe("Homepage", () => {
  for (const viewport of VIEWPORTS) {
    test(`renders the full discovery flow at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("#homepage-search")).toBeVisible();
      await expect(page.getByRole("heading", { name: /วางแผนเที่ยวในยะลา/ })).toBeVisible();
      await expect(page.getByRole("heading", { name: /ภาพรวมการท่องเที่ยวที่บันทึกแล้ว/ })).toBeVisible();
      await expect(page.getByRole("link", { name: "ดูสถานที่ทั้งหมด" })).toHaveAttribute("href", "/attractions");

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);

      if (viewport.name === "desktop" || viewport.name === "mobile-390") {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `homepage-${viewport.name}.png`),
          fullPage: true,
        });
      }
    });
  }

  test("search sends the query to the selected public directory", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("ค้นหาสถานที่ ร้านอาหาร ที่พัก หรือเรื่องราว").fill("กาแฟ");
    await page.getByLabel("ประเภทเนื้อหา").selectOption("restaurants");
    await page.getByRole("button", { name: "ค้นหา" }).click();

    await expect(page).toHaveURL(/\/restaurants\?q=%E0%B8%81%E0%B8%B2%E0%B9%81%E0%B8%9F$/);
  });
});
