import { expect, test } from "@playwright/test";

test.describe("Public hospitality detail", () => {
  test("opens a real restaurant detail with truthful mobile actions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/restaurants");
    const detailHref = await page.locator('a[href^="/restaurants/"]').first().getAttribute("href");
    expect(detailHref).toBeTruthy();

    await page.goto(detailHref!);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "ข้อมูลร้านอาหาร" })).toBeVisible();
    await expect(page.getByRole("link", { name: /จอง/ })).toHaveCount(0);
    expect(await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

    const heroImage = page.locator("header img");
    if (await heroImage.count()) {
      await expect(heroImage).toHaveAttribute("sizes", "(max-width: 1023px) calc(100vw - 2rem), 1152px");
    } else {
      await expect(page.getByText("ยังไม่มีรูปภาพ")).toBeVisible();
    }
  });

  test("opens a real accommodation detail without a fake booking action", async ({ page }) => {
    await page.goto("/accommodations");
    const detailHref = await page.locator('a[href^="/accommodations/"]').first().getAttribute("href");
    expect(detailHref).toBeTruthy();

    await page.goto(detailHref!);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "ข้อมูลที่พัก" })).toBeVisible();
    await expect(page.getByRole("link", { name: /จอง/ })).toHaveCount(0);
    expect(await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  });

  test("shows a semantic missing state for an unknown restaurant", async ({ page }) => {
    await page.goto("/restaurants/not-a-real-yala-restaurant");

    await expect(page.getByText("ไม่พบร้านอาหารนี้")).toBeVisible();
    await expect(page.getByRole("link", { name: "กลับไปดูร้านอาหาร" })).toHaveAttribute("href", "/restaurants");
  });
});
