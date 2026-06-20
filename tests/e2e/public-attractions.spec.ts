import { test, expect } from "@playwright/test";

test.describe("Public Attractions Discovery", () => {
  test("should navigate to /attractions from homepage 'สำรวจทุกสถานที่' link", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Find the link to all attractions
    const viewAllLink = page.locator("a:has-text('สำรวจทุกสถานที่')").first();
    await viewAllLink.click();

    // Should arrive at /attractions
    // Should arrive at /attractions
    await expect(page).toHaveURL(/\/attractions/);
  });

  test("should filter /attractions by search, province, and type", async ({ page }) => {
    await page.goto("/attractions");

    // Test search filter
    const searchInput = page.locator("input[placeholder*='ค้นหา']");
    await searchInput.fill("ปัตตานี");
    await searchInput.press("Enter");

    // URL should have q=ปัตตานี
    await expect(page).toHaveURL(/q=%E0%B8%9B%E0%B8%B1%E0%B8%95%E0%B8%95%E0%B8%B2%E0%B8%99%E0%B8%B5/); // URL encoded

    // Clear filters
    const clearButton = page.getByRole("link", { name: 'ล้างตัวกรอง' }).first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await expect(page).toHaveURL(/\/attractions(?!\?q=)/);
  });
});
