import { expect, test, type Page } from "@playwright/test";

const adminUsername = process.env.E2E_ADMIN_USERNAME?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const hasCredentials = Boolean(adminUsername && adminPassword);

async function login(page: Page) {
  if (!adminUsername || !adminPassword) throw new Error("ADMIN_E2E_CREDENTIALS_MISSING");
  await page.goto("/admin/login");
  await page.locator("#admin-username").fill(adminUsername);
  await page.locator("#admin-password").fill(adminPassword);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname.startsWith("/admin") && url.pathname !== "/admin/login");
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("Admin story library", () => {
  test.skip(!hasCredentials, "Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD to run this flow.");

  test("separates editorial work from traveler submissions on desktop and mobile", async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await login(page);
    const response = await page.goto("/admin/stories", { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "คลังบทความ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "บทความทีมงาน" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "เรื่องเล่านักเดินทาง" })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole("link", { name: "เรื่องเล่านักเดินทาง" }).click();
    await page.waitForURL("**/admin/stories/submissions");
    await expect(page.getByRole("heading", { name: "เรื่องเล่าจากนักเดินทาง" })).toBeVisible();
    await expect(page.getByRole("link", { name: "เรื่องเล่านักเดินทาง" })).toHaveAttribute("aria-current", "page");

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/stories", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "คลังบทความ" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(runtimeErrors).toEqual([]);
  });
});
