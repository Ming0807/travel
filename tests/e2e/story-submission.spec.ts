import { expect, test } from "@playwright/test";

test.describe("Public story contribution", () => {
  test("explains identity and moderation before an unauthenticated visitor contributes", async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedResponses: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });

    await page.goto("/stories/share");

    await expect(page.getByRole("heading", { name: "แบ่งปันสิ่งที่คุณพบในยะลา" })).toBeVisible();
    await expect(page.getByText("เข้าสู่ระบบเพื่อป้องกันสแปม")).toBeVisible();
    await expect(page.getByText("ทีมงานตรวจสอบก่อนเผยแพร่")).toBeVisible();
    await expect(page.getByRole("heading", { name: "เข้าสู่ระบบก่อนส่งเรื่องราว" })).toBeVisible();
    await expect(page.getByText(/ไม่เปิดเผยชื่อบัญชีต่อผู้อ่าน/)).toBeVisible();
    await expect(page.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "เข้าสู่ระบบด้วย LINE" })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(failedResponses).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
