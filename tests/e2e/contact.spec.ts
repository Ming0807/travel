import { expect, test } from "@playwright/test";

async function fillContactForm(page: import("@playwright/test").Page) {
  await page.getByLabel("ชื่อสำหรับติดต่อ").fill("ผู้ทดสอบระบบ");
  await page.getByLabel("อีเมลสำหรับตอบกลับ").fill("tester@example.com");
  await page.getByLabel(/หัวเรื่อง/).fill("แจ้งปัญหา QR");
  await page.getByLabel("รายละเอียด").fill("สแกน QR แล้วไม่สามารถเปิดหน้าสร้างใบประกาศได้");
}

test.describe("Public contact", () => {
  test("submits a support message through the real page flow", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "ส่งข้อความเรียบร้อยแล้ว" }),
      });
    });

    await page.goto("/contact");
    await fillContactForm(page);

    const requestPromise = page.waitForRequest("**/api/contact");
    await page.getByRole("button", { name: "ส่งข้อความ" }).click();
    const request = await requestPromise;

    expect(request.method()).toBe("POST");
    expect(request.postDataJSON()).toMatchObject({
      name: "ผู้ทดสอบระบบ",
      email: "tester@example.com",
      subject: "แจ้งปัญหา QR",
    });
    await expect(page.getByRole("status")).toContainText("ส่งข้อความเรียบร้อยแล้ว");
    await expect(page.getByLabel("ชื่อสำหรับติดต่อ")).toHaveValue("");
  });

  test("preserves the message and supports retry after a server error", async ({ page }) => {
    let attempts = 0;
    await page.route("**/api/contact", async (route) => {
      attempts += 1;
      await route.fulfill({
        status: attempts === 1 ? 500 : 200,
        contentType: "application/json",
        body: JSON.stringify(attempts === 1
          ? { success: false, error: { code: "SAVE_FAILED", message: "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง" } }
          : { success: true, message: "ส่งข้อความเรียบร้อยแล้ว" }),
      });
    });

    await page.goto("/contact");
    await fillContactForm(page);
    await page.getByRole("button", { name: "ส่งข้อความ" }).click();

    await expect(page.locator('[role="alert"]').filter({ hasText: "ยังส่งข้อความไม่ได้" })).toBeVisible();
    await expect(page.getByLabel("รายละเอียด")).toHaveValue("สแกน QR แล้วไม่สามารถเปิดหน้าสร้างใบประกาศได้");

    await page.getByRole("button", { name: "ส่งข้อความ" }).click();
    await expect(page.getByRole("status")).toContainText("ส่งข้อความเรียบร้อยแล้ว");
    expect(attempts).toBe(2);
  });
});
