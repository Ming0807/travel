import { expect, test } from "@playwright/test";

test.describe("public leaderboard", () => {
  test("shows privacy-first rolling periods without rank zero", async ({ page }) => {
    const response = await page.goto("/leaderboard");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: "กระดานผู้นำนักเดินทาง" })).toBeVisible();
    await expect(page.getByText(/แสดงเฉพาะผู้ที่เลือกเข้าร่วมแบบสาธารณะ/)).toBeVisible();
    await expect(page.getByRole("button", { name: "ทั้งหมด" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "7 วันล่าสุด" }).click();
    await expect(page.getByRole("button", { name: "7 วันล่าสุด" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("#0")).toHaveCount(0);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
