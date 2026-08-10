import { expect, test } from "@playwright/test";

test.describe("public navigation shell", () => {
  test("mobile menu supports keyboard focus restoration at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const trigger = page.locator("#public-mobile-menu-trigger");
    await trigger.click();
    await expect(page.locator("#public-mobile-menu a").first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(page.locator("#public-mobile-menu")).toHaveCount(0);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("desktop menu opens from ArrowDown and restores focus at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const trigger = page.locator('button[aria-haspopup="menu"]').first();
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[role="menu"] a').first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("focused check-in flow has no discovery chrome", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/checkin/demo-code");

    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("#public-mobile-menu-trigger")).toHaveCount(0);
    await expect(page.locator("nav[aria-label='เมนูนำทางมือถือ']")).toHaveCount(0);
  });
});
