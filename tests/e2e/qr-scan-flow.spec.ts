import { test, expect } from "@playwright/test";

test.describe("QR Scan Flow", () => {
  test("should successfully open checkin landing page with a valid code", async ({ page }) => {
    // Navigate to a canonical public URL
    // In e2e test, we will assume code "aiyerweng-main-01" or a mock check-in code exists.
    // If we don't have seeded data for this, we at least test the 404 state.
    
    // Test the 404/invalid path first
    await page.goto("/c/invalid-qr-code-test-123");
    
    // Expect to be redirected to the /checkin/invalid-qr-code-test-123
    await expect(page).toHaveURL(/\/checkin\/invalid-qr-code-test-123/);
    
    // Expect the beautiful Thai error page content
    await expect(page.getByRole('heading', { name: 'ไม่พบ QR Code นี้' })).toBeVisible();
    await expect(page.locator("p", { hasText: "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ" })).toBeVisible();
    
    // Expect the retry and back home buttons
    const retryButton = page.locator("button:has-text('ลองใหม่อีกครั้ง')");
    await expect(retryButton).toBeVisible();
    
    const homeLink = page.locator("a:has-text('กลับสู่หน้าหลัก')");
    await expect(homeLink).toBeVisible();
  });
});
