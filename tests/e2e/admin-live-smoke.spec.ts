import { expect, test, type Page } from "@playwright/test";

const adminUsername = process.env.E2E_ADMIN_USERNAME?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const hasCredentials = Boolean(adminUsername && adminPassword);

const analyticsRoutes = [
  "/admin/dashboard",
  "/admin/dashboard/tourists",
  "/admin/dashboard/visits",
  "/admin/dashboard/attractions",
  "/admin/dashboard/expenses",
  "/admin/dashboard/satisfaction",
  "/admin/dashboard/funnel",
  "/admin/dashboard/sustainability",
] as const;

const desktopRoutes = [
  "/admin",
  ...analyticsRoutes,
  "/admin/attractions",
  "/admin/checkin-codes",
  "/admin/tourists",
  "/admin/surveys",
  "/admin/certificate-templates",
  "/admin/media",
  "/admin/roles",
  "/admin/settings",
] as const;

const ignoredConsolePatterns = [
  /Download the React DevTools/i,
];

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!ignoredConsolePatterns.some((pattern) => pattern.test(text))) errors.push(text);
  });
  page.on("pageerror", (error) => errors.push(error.message));

  return errors;
}

async function loginAsAdmin(page: Page) {
  if (!adminUsername || !adminPassword) throw new Error("ADMIN_E2E_CREDENTIALS_MISSING");

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.locator("#admin-username").fill(adminUsername);
  await page.locator("#admin-password").fill(adminPassword);
  await page.getByRole("button", { name: /เข้าสู่ระบบหลังบ้าน/ }).click();
  await page.waitForURL(/\/admin(?:\/|$)/);
  await expect(page.getByRole("button", { name: "เปิดเมนูบัญชีผู้ดูแลระบบ" })).toBeVisible();
}

async function expectHealthyAdminPage(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });

  expect(response, `No document response for ${route}`).not.toBeNull();
  expect(response?.status(), `${route} returned an HTTP error`).toBeLessThan(400);
  await expect(page).toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[?#].*)?$`));
  const adminMain = page.locator("#admin-main-content");
  await expect(adminMain, `${route} did not settle to one admin shell`).toHaveCount(1);
  await expect(adminMain).toBeVisible();
  await expect(page.getByText("Admin Section Error", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Application error", { exact: false })).toHaveCount(0);

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow, `${route} has horizontal overflow`).toBeLessThanOrEqual(1);
}

test.describe("Authenticated admin production smoke", () => {
  test.skip(!hasCredentials, "Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD to run live admin smoke tests.");

  test("completes a non-destructive desktop and mobile admin journey", async ({ page }) => {
    const runtimeErrors = collectRuntimeErrors(page);
    await loginAsAdmin(page);

    for (const route of desktopRoutes) {
      await expectHealthyAdminPage(page, route);
    }

    await page.setViewportSize({ width: 375, height: 812 });
    for (const route of analyticsRoutes) {
      await expectHealthyAdminPage(page, route);
    }

    await expectHealthyAdminPage(page, "/admin/tourists");
    const menuButton = page.getByRole("button", { name: "เปิดเมนูผู้ดูแลระบบ" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileMenu = page.getByRole("dialog", { name: "เมนูผู้ดูแลระบบ" });
    await expect(mobileMenu).toBeVisible();
    await mobileMenu.getByRole("button", { name: "ปิดเมนูผู้ดูแลระบบ" }).click();
    await expect(mobileMenu).toBeHidden();

    await expectHealthyAdminPage(page, "/admin/certificate-templates");
    await expect(page.getByRole("link", { name: "เพิ่มเทมเพลต" })).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 720 });

    await page.getByRole("button", { name: "เปิดเมนูบัญชีผู้ดูแลระบบ" }).click();
    const accountMenu = page.getByRole("menu", { name: "เมนูบัญชีผู้ดูแลระบบ" });
    await expect(accountMenu).toBeVisible();
    await accountMenu.getByRole("menuitem", { name: "ออกจากระบบ" }).click();
    await page.waitForURL(/\/admin\/login(?:[?#].*)?$/);
    await expect(page.locator("#admin-username")).toBeVisible();

    expect(runtimeErrors, "Browser runtime errors were reported").toEqual([]);
  });
});
