import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("About Page should load and display correctly", async ({ page }) => {
    await page.goto("/about");
    
    // Check if the title exists and is visible
    await expect(page.locator("h1", { hasText: /เกี่ยวกับ .*ท่องเที่ยวชายแดนใต้/ })).toBeVisible();
    
    // Check if key sections exist
    await expect(page.locator("h2", { hasText: "พันธกิจของเรา" })).toBeVisible();
    await expect(page.locator("h2", { hasText: "วิสัยทัศน์ของเรา" })).toBeVisible();
    await expect(page.locator("h2", { hasText: "เรื่องราวของเรา" })).toBeVisible();
    await expect(page.locator("h2", { hasText: "ทีมงานของเรา" })).toBeVisible();
    await expect(page.locator("h2", { hasText: "คุณค่าของเรา" })).toBeVisible();
    
    // Ensure the CTA button works (navigation or link exists)
    const ctaButton = page.locator("a", { hasText: "เริ่มต้นการสำรวจ" }).first();
    await expect(ctaButton).toHaveAttribute("href", "/attractions");
  });

  test("Public Dashboard should load and display correctly", async ({ page }) => {
    await page.goto("/dashboard");

    // Check if the title exists
    await expect(page.getByRole("heading", { name: "สถิติการท่องเที่ยวสาธารณะ" }).first()).toBeVisible();
    
    // Look for key metrics or charts
    await expect(page.locator("text=นักท่องเที่ยวที่ลงทะเบียน")).toBeVisible();
    await expect(page.locator("text=จำนวนการเช็คอินทั้งหมด")).toBeVisible();
    await expect(page.locator("text=แนวโน้มการเช็คอินล่าสุด")).toBeVisible();
    await expect(page.locator("text=จังหวัดยอดนิยม")).toBeVisible();
  });
});
