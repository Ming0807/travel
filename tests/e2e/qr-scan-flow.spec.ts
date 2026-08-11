import { test, expect } from "@playwright/test";

test.describe("QR Scan Flow", () => {
  test("redirects canonical /c/[code] links to /checkin/[code]", async ({ page }) => {
    await page.goto("/c/demo-valid-qr");

    await expect(page).toHaveURL(/\/checkin\/demo-valid-qr/);
    const cookies = await page.context().cookies();
    expect(cookies.some((cookie) => cookie.name === "sbtp_checkin_session" && cookie.httpOnly)).toBe(true);
  });

  test("renders the real demo QR landing contract with a start CTA", async ({ page }) => {
    await page.goto("/checkin/try");

    await expect(page).toHaveURL(/\/checkin\/(?!try)[^/]+$/);
    await expect(page.getByRole("heading", { name: "รับใบประกาศและตราประทับดิจิทัล" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "ขั้นตอนการรับใบประกาศ" })).toBeVisible();
    await expect(page.getByText("รูปภาพไม่บังคับ")).toBeVisible();
    await expect(page.getByText("แบบสำรวจไม่บังคับ")).toBeVisible();

    const startLink = page.getByRole("link", { name: "สร้างใบประกาศของฉัน" });
    await expect(startLink).toHaveAttribute("href", /\/checkin\/[^/]+\/start$/);
  });

  test("keeps the check-in entry readable without horizontal overflow", async ({ page }) => {
    await page.goto("/checkin/try");
    await expect(page).toHaveURL(/\/checkin\/(?!try)[^/]+$/);

    for (const viewport of [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await expect(page.getByRole("link", { name: "สร้างใบประกาศของฉัน" })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "ขั้นตอนการรับใบประกาศ" })).toBeVisible();
    }
  });

  test("shows a Thai-first unavailable state for an invalid QR code", async ({ page }) => {
    await page.goto("/c/invalid-qr-code-test-123");

    await expect(page).toHaveURL(/\/checkin\/invalid-qr-code-test-123/);
    await expect(page.getByRole("heading", { name: "ไม่พบ QR Code นี้" })).toBeVisible();
    await expect(page.locator("p", { hasText: "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ" })).toBeVisible();

    await expect(page.getByRole("button", { name: "ตรวจสอบ QR อีกครั้ง" })).toBeVisible();
    await expect(page.getByRole("link", { name: "กลับหน้าหลัก" })).toBeVisible();
    await expect(page.getByRole("link", { name: "แจ้งปัญหา QR" })).toBeVisible();
  });

  test("admin leaderboard route does not return a 404 during QR admin navigation", async ({ page }) => {
    const response = await page.goto("/admin/leaderboard");

    expect(response?.status()).not.toBe(404);
    await expect(page).not.toHaveURL(/404/);
  });
});
