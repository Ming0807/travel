import { expect, test } from "@playwright/test";

test.describe("Public hospitality discovery", () => {
  test("keeps restaurant search and type filters together in the URL", async ({ page }) => {
    await page.goto("/restaurants?foodType=Halal");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("ยะลา");
    const restaurantFilterTrigger = page.getByRole("button", { name: "เปิดตัวกรองร้านอาหาร" });
    if (await restaurantFilterTrigger.isVisible()) await restaurantFilterTrigger.click();
    await expect(page.getByRole("combobox", { name: "ประเภทอาหาร" })).toHaveValue("Halal");
    await page.getByRole("searchbox", { name: "ค้นหาร้านอาหาร" }).fill("ยะลา");
    await page.getByRole("button", { name: "ค้นหาร้านอาหาร" }).click();

    await expect(page).toHaveURL(/\/restaurants\?(?=.*q=)(?=.*foodType=Halal)/);
    await expect(page.getByText(/พบทั้งหมด/)).toBeVisible();
  });

  test("filters accommodations on the server and remains usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/accommodations?accommodationType=Hotel");

    await page.getByRole("button", { name: "เปิดตัวกรองที่พัก" }).click();
    await expect(page.getByRole("combobox", { name: "ประเภทที่พัก" })).toHaveValue("Hotel");
    await expect(page.getByText("โรงแรม", { exact: true }).last()).toBeVisible();
    await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
  });

  test("does not request stale third-party stock images", async ({ page }) => {
    const staleImageRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("images.unsplash.com")) staleImageRequests.push(request.url());
    });

    await page.goto("/restaurants");
    await expect(page.getByRole("heading", { level: 2, name: "ร้านอาหารที่ค้นพบ" })).toBeVisible();
    expect(staleImageRequests).toEqual([]);
  });
});
