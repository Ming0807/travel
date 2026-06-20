import { test, expect } from "@playwright/test";

test.describe("Attractions Filters Smoke Test", () => {
  test("can search, filter by province and type, and clear filters", async ({ page }) => {
    await page.goto("/attractions");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1:has-text('สถานที่ท่องเที่ยว')").first();
    await expect(heading).toBeVisible();

    // 2. Search
    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("ยะลา");

    // 3. Filter by Province
    const provinceSelect = page.locator('select[name="province"]');
    await provinceSelect.selectOption({ value: "Pattani" });

    // Filter by Type
    const typeSelect = page.locator('select[name="type"]');
    // Select the first valid option (index 1, skipping the default "ทั้งหมด" option)
    await typeSelect.selectOption({ index: 1 });

    const submitButton = page.locator('button[type="submit"]:has-text("ค้นหา")');
    await submitButton.click();

    // 4. Wait for URL
    await page.waitForURL(/province=Pattani/);

    // 5. Clear filters
    const clearButton = page.locator('a:has-text("ล้างตัวกรอง")').first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await page.waitForURL(/\/attractions(?!\?.*q=)/);
  });
});
