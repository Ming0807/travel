import { test, expect } from "@playwright/test";

test.describe("Admin Auth Redirect", () => {
  test("redirects unauthenticated users to /admin/login when accessing protected admin pages", async ({ page }) => {
    // Navigate directly to a protected admin page
    await page.goto("/admin/attractions");

    // Should redirect to login page
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from /admin/dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from /admin/media", async ({ page }) => {
    await page.goto("/admin/media");
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from /admin/stories", async ({ page }) => {
    await page.goto("/admin/stories");
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from /admin/routes", async ({ page }) => {
    await page.goto("/admin/routes");
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from /admin/checkin-codes", async ({ page }) => {
    await page.goto("/admin/checkin-codes");
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from /admin/settings", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForURL("**/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
  });

  test("allows unauthenticated access to /admin/login itself", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("text=Admin Portal")).toBeVisible({ timeout: 5000 });
    // Should not get redirected away from login
    expect(page.url()).toContain("/admin/login");
  });

  test("does not redirect public pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=ค้นพบ").first()).toBeVisible({ timeout: 10000 });
    // Should remain on the homepage
    expect(page.url()).not.toContain("/admin");
  });
});
