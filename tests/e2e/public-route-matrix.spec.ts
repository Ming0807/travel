import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/attractions",
  "/restaurants",
  "/accommodations",
  "/routes",
  "/360-vista",
  "/stories",
  "/stories/share",
  "/leaderboard",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/dashboard",
] as const;

const viewportWidths = [360, 390, 768, 1280, 1440] as const;

async function inspectRoute(page: Page, route: string, viewportWidth: number) {
  await page.setViewportSize({ width: viewportWidth, height: 900 });
  const consoleErrors: string[] = [];
  const onConsole = (message: import("@playwright/test").ConsoleMessage) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };
  page.on("console", onConsole);

  try {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} at ${viewportWidth}px should return a successful response`).toBeLessThan(400);
    await expect(page.locator("h1"), `${route} at ${viewportWidth}px should expose one page heading`).toHaveCount(1);
    await expect(page).toHaveTitle(/\S+/);
    await expect(page.locator('link[rel="canonical"]'), `${route} at ${viewportWidth}px should declare a canonical URL`).toHaveCount(1);

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth, `${route} at ${viewportWidth}px should not overflow horizontally`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    expect(consoleErrors, `${route} at ${viewportWidth}px should not emit console errors`).toEqual([]);
  } finally {
    page.off("console", onConsole);
  }
}

test.describe("public route release matrix", () => {
  test("static public routes expose truthful document structure", async ({ page }) => {
    test.setTimeout(300_000);
    for (const viewportWidth of viewportWidths) {
      for (const route of routes) {
        await test.step(`${route} · ${viewportWidth}px`, () => inspectRoute(page, route, viewportWidth));
      }
    }
  });
});
