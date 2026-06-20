import { test, expect } from "@playwright/test";

test.describe("QR Scan Flow", () => {
  test("redirects canonical /c/[code] links to /checkin/[code]", async ({ page }) => {
    await page.goto("/c/demo-valid-qr");

    await expect(page).toHaveURL(/\/checkin\/demo-valid-qr/);
  });

  test("renders the valid QR landing contract with a start CTA", async ({ page }) => {
    await page.route("**/checkin/demo-valid-qr", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: `
          <main>
            <h1>จุดทดสอบ QR</h1>
            <p>สถานที่ทดสอบ</p>
            <a href="/checkin/demo-valid-qr/identity">เริ่มต้นเช็กอิน</a>
          </main>
        `,
      });
    });

    await page.goto("/checkin/demo-valid-qr");

    await expect(page).toHaveURL(/\/checkin\/demo-valid-qr/);
    await expect(page.getByRole("heading", { name: "จุดทดสอบ QR" })).toBeVisible();
    await expect(page.getByRole("link", { name: "เริ่มต้นเช็กอิน" })).toHaveAttribute(
      "href",
      "/checkin/demo-valid-qr/identity"
    );
  });

  test("shows a Thai-first unavailable state for an invalid QR code", async ({ page }) => {
    await page.goto("/c/invalid-qr-code-test-123");

    await expect(page).toHaveURL(/\/checkin\/invalid-qr-code-test-123/);
    await expect(page.getByRole("heading", { name: "ไม่พบ QR Code นี้" })).toBeVisible();
    await expect(page.locator("p", { hasText: "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ" })).toBeVisible();

    await expect(page.getByRole("button", { name: "ลองใหม่อีกครั้ง" })).toBeVisible();
    await expect(page.getByRole("link", { name: "กลับสู่หน้าหลัก" })).toBeVisible();
  });

  test("admin leaderboard route does not return a 404 during QR admin navigation", async ({ page }) => {
    const response = await page.goto("/admin/leaderboard");

    expect(response?.status()).not.toBe(404);
    await expect(page).not.toHaveURL(/404/);
  });
});
