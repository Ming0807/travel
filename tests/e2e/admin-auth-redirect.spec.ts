import { test, expect } from "@playwright/test";

test.describe("Admin Auth Redirect", () => {
  const protectedRoutes = [
    "/admin/attractions",
    "/admin/dashboard",
    "/admin/media",
    "/admin/stories",
    "/admin/routes",
    "/admin/checkin-codes",
    "/admin/settings",
  ] as const;

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated users from ${route}`, async ({ page }) => {
      await page.goto(route);

      const expectedRedirect = encodeURIComponent(route);
      await expect(page).toHaveURL(new RegExp(`/admin/login\\?redirect=${expectedRedirect}$`));
      await expect(page.getByRole("heading", { name: "เข้าสู่ระบบหลังบ้าน" })).toBeVisible();
    });
  }

  test("allows unauthenticated access to /admin/login itself", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "เข้าสู่ระบบหลังบ้าน" })).toBeVisible({ timeout: 5000 });
    // Should not get redirected away from login
    expect(page.url()).toContain("/admin/login");
  });

  test("does not redirect public pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    // Should remain on the homepage
    expect(page.url()).not.toContain("/admin");
  });
});
