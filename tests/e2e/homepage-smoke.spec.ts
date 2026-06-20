import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const SCREENSHOT_DIR = path.resolve(__dirname, "screenshots");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

test.describe("Homepage Smoke Test", () => {
  test("homepage renders correctly at desktop and mobile viewports", async ({ page }) => {
    // ─── Desktop (1440 px) ───────────────────────────────────────────────
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify the page loaded — the hero heading is in Thai ("ค้นพบ...")
    const heroHeading = page.locator("text=ค้นพบ").first();
    await expect(heroHeading).toBeVisible({ timeout: 10_000 });

    // Full-page desktop screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "homepage-desktop.png"),
      fullPage: true,
    });

    // ─── Mobile (375 px — iPhone SE) ────────────────────────────────────
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Verify the hero image is visible and has actually loaded (non-zero natural height)
    const heroImg = page.locator("img").first();
    await expect(heroImg).toBeVisible();
    const naturalHeight = await heroImg.evaluate(
      (el: HTMLImageElement) => el.naturalHeight,
    );
    expect(naturalHeight).toBeGreaterThan(0);

    // Verify no horizontal scroll on mobile
    const fitsWithinViewport = await page.evaluate(() => {
      const { documentElement: html } = document;
      return (
        html.scrollWidth <= window.innerWidth &&
        html.scrollWidth <= 375
      );
    });
    expect(fitsWithinViewport).toBe(true);

    // Full-page mobile screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "homepage-mobile.png"),
      fullPage: true,
    });
  });
  test("homepage 'ดูสถานที่ทั้งหมด' link navigates to /attractions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const allAttractionsLink = page.locator("a:has-text('ดูสถานที่ทั้งหมด')").first();
    await expect(allAttractionsLink).toBeVisible();
    await allAttractionsLink.click();

    await expect(page).toHaveURL(/\/attractions/);
    const attractionsHeading = page.locator("h1:has-text('สถานที่ท่องเที่ยว')").first();
    await expect(attractionsHeading).toBeVisible({ timeout: 10_000 });
  });
});
