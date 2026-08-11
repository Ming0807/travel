import { expect, test } from "@playwright/test";

const visitId = process.env.PHOTO_FLOW_VISIT_ID;

test.describe("mobile photo flow", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!visitId, "Set PHOTO_FLOW_VISIT_ID to a valid visit for live mobile photo-flow checks");
    await page.goto(`/visit/${visitId}/photo`);
    await expect(page.getByRole("heading", { name: /เพิ่มรูปในใบประกาศ/ })).toBeVisible();
  });

  test("keeps the optional photo step reachable at 360, 390, and 430px", async ({ page }) => {
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 800 });
      await page.reload();

      const skip = page.getByRole("link", { name: /ข้าม.*ใบประกาศ/ });
      await expect(skip).toBeVisible();
      const skipBox = await skip.boundingBox();
      expect(skipBox).not.toBeNull();
      expect(skipBox!.x).toBeGreaterThanOrEqual(0);
      expect(skipBox!.y + skipBox!.height).toBeLessThanOrEqual(800);

      const uploadButton = page.getByRole("button", { name: /เลือกจากคลังรูปหรือไฟล์/ });
      const cameraButton = page.getByRole("button", { name: "ถ่ายรูป" });
      for (const button of [uploadButton, cameraButton]) {
        const box = await button.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        expect(box!.y + box!.height).toBeLessThanOrEqual(800);
      }
    }
  });

  test("keeps the camera dialog controls inside the dynamic viewport and restores focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => ({ getTracks: () => [] }),
        },
      });
    });
    await page.reload();
    await page.getByRole("button", { name: "ถ่ายรูป" }).click();

    const dialog = page.getByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });
    await expect(dialog).toBeVisible();
    const close = page.getByRole("button", { name: "ปิดกล้อง" });
    await expect(close).toBeFocused();

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
    expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
    expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(390);
    expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(800);

    const footer = dialog.locator("footer");
    await expect(footer).toHaveClass(/safe-area-inset-bottom/);
    const footerBox = await footer.boundingBox();
    expect(footerBox).not.toBeNull();
    expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(800);

    await close.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "ถ่ายรูป" })).toBeFocused();
  });
});
