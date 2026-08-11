import { expect, test } from "@playwright/test";

const visitId = process.env.CERTIFICATE_FLOW_VISIT_ID?.trim();
const forbiddenVisitId = process.env.CERTIFICATE_FLOW_FORBIDDEN_VISIT_ID?.trim();

test.describe("QR-to-certificate production contracts", () => {
  test("renders a no-photo certificate preview without exposing private storage URLs", async ({ page }) => {
    test.skip(!visitId, "Set CERTIFICATE_FLOW_VISIT_ID to a visit owned by the test browser identity");

    await page.goto(`/visit/${visitId}/certificate/preview`);
    await expect(page.getByText("ยังไม่มีรูปภาพ")).toBeVisible();
    await expect(page.getByRole("button", { name: "สร้างใบประกาศดิจิทัล" })).toBeVisible();
    expect(page.url()).not.toContain("supabase.co");
    await expect(page.locator('img[src*="supabase.co/storage/v1/object/sign"]')).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toContain("signed.example");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("rejects a certificate preview for a visit owned by another tourist", async ({ page }) => {
    test.skip(!forbiddenVisitId, "Set CERTIFICATE_FLOW_FORBIDDEN_VISIT_ID to an inaccessible visit");

    const response = await page.goto(`/visit/${forbiddenVisitId}/certificate/preview`);
    expect(response?.status()).not.toBe(200);
    expect(page.url()).not.toContain("supabase.co");
  });
});
