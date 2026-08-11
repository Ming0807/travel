import { expect, test } from "@playwright/test";

test.describe("Public routes and 360", () => {
  test("shows truthful route discovery and a real stop timeline on mobile", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/routes");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /ดูเส้นทางบนแผนที่/ })).toHaveCount(0);
    expect(await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

    const firstRoute = page.locator('a[href^="/routes/"]').first();
    if (await firstRoute.count()) {
      const href = await firstRoute.getAttribute("href");
      expect(href).toBeTruthy();
      await page.goto(href!);

      await expect(page.getByRole("heading", { level: 2, name: "ลำดับการเดินทาง" })).toBeVisible();
      await expect(page.locator('a[href^="/attractions/"]').first()).toBeVisible();
      await expect(page.locator('[class*="linear-gradient"]')).toHaveCount(0);

      const mapLink = page.getByRole("link", { name: /เปิดเส้นทางใน Google Maps/ });
      if (await mapLink.count()) {
        await expect(mapLink).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/dir\//);
      } else {
        await expect(page.getByText(/ยังไม่มีพิกัดครบทุกจุด/)).toBeVisible();
      }
    } else {
      await expect(page.getByText("กำลังเตรียมเส้นทางแนะนำ")).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test("uses CMS 360 data or an honest external-provider state", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/360-vista");

    await expect(page.getByRole("heading", { level: 1, name: /ทัวร์เสมือนจริง 360°/ })).toBeVisible();
    await expect(page.getByText("มัสยิดกลางยะลา")).toHaveCount(0);
    await expect(page.locator('[class*="linear-gradient"]')).toHaveCount(0);
    expect(await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

    const tourLinks = page.getByRole("link", { name: /เปิด(มุมมอง|บริการ).*360°/ });
    await expect(tourLinks.first()).toBeVisible();
    await expect(tourLinks.first()).toHaveAttribute("href", /^https:\/\//);
    await expect(tourLinks.first()).toHaveAttribute("target", "_blank");

    const images = page.locator("main img, article img");
    for (let index = 0; index < await images.count(); index += 1) {
      expect(await images.nth(index).evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 1)).toBe(true);
    }
    expect(consoleErrors).toEqual([]);
  });
});
