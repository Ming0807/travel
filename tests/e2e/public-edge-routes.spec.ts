import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test.describe("public edge routes", () => {
  test("global 404 is Thai-first and recoverable", async ({ page }) => {
    const response = await page.goto("/__route-that-does-not-exist__", { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "ไม่พบหน้าที่คุณกำลังมองหา" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
    await expect(page.getByRole("link", { name: "กลับหน้าแรก" })).toHaveAttribute("href", "/");
    await expectNoHorizontalOverflow(page);
  });

  test("admin login preserves a protected destination and remains usable on mobile", async ({ page }) => {
    await page.goto("/admin/settings", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/admin\/login\?redirect=%2Fadmin%2Fsettings/);
    await expect(page.getByRole("heading", { level: 1, name: "เข้าสู่ระบบหลังบ้าน" })).toBeVisible();
    await expect(page.getByLabel("ชื่อผู้ใช้หรืออีเมล")).toBeVisible();
    await expect(page.getByLabel("รหัสผ่าน")).toBeVisible();
    await expect(page.getByRole("button", { name: "เข้าสู่ระบบหลังบ้าน" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("tourist login explains optional identity and has one primary heading", async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ใช้งานต่อโดยไม่เข้าสู่ระบบ" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
