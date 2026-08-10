import { expect, test } from "@playwright/test";

test.describe("Public attraction discovery", () => {
  test("searches, filters by type, and clears without exposing a province selector", async ({ page }) => {
    await page.goto("/attractions");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("สถานที่ท่องเที่ยว");
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText("3 จังหวัด");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByLabel("ค้นหาสถานที่")).toBeVisible();
    await expect(page.getByLabel("ประเภทสถานที่")).toBeVisible();
    await expect(page.locator('select[name="province"]')).toHaveCount(0);

    await page.getByLabel("ค้นหาสถานที่").fill("ยะลา");
    const typeSelect = page.getByLabel("ประเภทสถานที่");
    const optionCount = await typeSelect.locator("option").count();
    expect(optionCount).toBeGreaterThan(1);
    const selectedType = await typeSelect.locator("option").nth(1).getAttribute("value");
    expect(selectedType).toBeTruthy();
    await typeSelect.selectOption({ index: 1 });

    await page.getByRole("button", { name: "ค้นหาสถานที่" }).click();
    await expect(page).toHaveURL(/\/attractions\?q=/);
    expect(new URL(page.url()).searchParams.get("type")).toBe(selectedType);
    await expect(page.getByRole("status")).toContainText("ตัวกรองที่ใช้");
    await expect(page.getByRole("link", { name: "ล้างตัวกรอง" }).first()).toBeVisible();

    await page.getByRole("link", { name: "ล้างตัวกรอง" }).first().click();
    await expect(page).toHaveURL(/\/attractions$/);
  });

  test("canonicalizes stale province parameters to the Yala-only discovery URL", async ({ page }) => {
    await page.goto("/attractions?province=Pattani");

    await expect(page).toHaveURL(/\/attractions$/);
    await expect(page.getByText("พื้นที่ให้บริการ: จังหวัดยะลา")).toBeVisible();
  });

  test("canonicalizes an out-of-range page while preserving valid filters", async ({ page }) => {
    await page.goto("/attractions?q=ยะลา&page=999999");

    await expect(page).toHaveURL(/\/attractions\?q=/);
    await expect(page).not.toHaveURL(/page=999999/);
    await expect(page.getByLabel("ค้นหาสถานที่")).toHaveValue("ยะลา");
  });

  test("keeps the discovery workspace inside a 390px mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/attractions");

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));

    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (await page.getByLabel("ค้นหาสถานที่").evaluate((element) => element === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(page.getByLabel("ค้นหาสถานที่")).toBeFocused();
  });
});
