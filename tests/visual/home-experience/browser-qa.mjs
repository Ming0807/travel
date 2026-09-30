import { chromium, expect as baseExpect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const origin = "http://127.0.0.1:4192";
const expect = baseExpect.configure({ timeout: 30000 });
const output = "output/playwright/home-experience";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(60000);
const errors = [];
const mapRequests = [];
const mapModules = [];
const tiles = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (/\/api\/public\/routes\/.+\/map/.test(request.url())) mapRequests.push(request.url());
  if (/RouteStopsMap\.tsx/.test(request.url())) mapModules.push(request.url());
  if (/tile\.openstreetmap\.org/.test(request.url())) tiles.push(request.url());
});
// No external tile request leaves the fixture. The live map still renders real Leaflet.
await page.route("https://tile.openstreetmap.org/**", (route) => route.fulfill({
  contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e6eee6"/><path d="M0 80L256 180M90 0L170 256" fill="none" stroke="#ffffff" stroke-width="8"/></svg>',
}));

async function noOverflow(label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `${label} has ${overflow}px overflow at ${page.viewportSize().width}`);
}
async function go(path = "/") {
  mapRequests.length = 0; mapModules.length = 0; tiles.length = 0;
  await page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
}
let layouts = 0;
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await go();
    await expect(page.locator(".ed-route-cards > a")).toHaveCount(3);
    await expect(page.locator(".ed-hero-visual img")).toHaveCount(1);
    await expect(page.locator(".ed-hero-visual img")).toHaveAttribute("loading", "eager");
    await expect(page.locator(".ed-hero-visual img")).toHaveAttribute("fetchpriority", "high");
    await noOverflow("home");
    assert.equal(mapRequests.length, 0, "Map data must wait for an explicit open");
    assert.equal(mapModules.length, 0, "Map bundle must wait for an explicit open");
    assert.equal(tiles.length, 0, "Map tiles must wait for an explicit open");
    for (const selector of [".ed-hero", "#journeys", "#plan"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await noOverflow(selector);
    }
    if ([390, 1440].includes(width)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator(".ed-hero").screenshot({ path: `${output}/hero-${width}.png` });
      await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: true });
    }
    await page.getByRole("button", { name: "ดูเส้นทางบนแผนที่" }).click();
    await expect(page.getByLabel("เลือกเส้นทาง")).toBeVisible();
    await page.getByLabel("แผนที่ตำแหน่งจุดแวะ", { exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "ดูทุกจุด" })).toBeVisible();
    assert.equal(mapRequests.length, 1);
    await noOverflow("opened map");
    await page.getByLabel("เลือกเส้นทาง").selectOption("fixture-route-2");
    await expect(page.getByRole("button", { name: /01 ถ้ำตัวอย่าง 2/ })).toBeVisible();
    await expect(page.locator(".ed-route-map-toolbar a")).toHaveAttribute("href", "/routes/fixture-route-2");
    assert.equal(mapRequests.length, 2);
    await page.getByLabel("เลือกเส้นทาง").selectOption("fixture-route-1");
    await expect(page.getByRole("button", { name: /01 ถ้ำตัวอย่าง 1/ })).toBeVisible();
    assert.equal(mapRequests.length, 2, "Returning to a route reuses its page-session cache");
    if ([390, 1440].includes(width)) {
      await page.locator("#journeys").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/map-${width}.png` });
    }
    await page.getByRole("button", { name: "ปิดแผนที่เส้นทาง" }).click();
    assert.equal(await page.locator("#home-route-map").count(), 0);
    layouts++;
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await go();
  const routeCard = page.locator(".ed-route-card").first();
  await routeCard.hover();
  await expect(routeCard).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -3)");
  await expect(routeCard.locator("img")).toHaveCSS("transform", "matrix(1.035, 0, 0, 1.035, 0, 0)");
  const heroAction = page.locator(".ed-hero-actions a").first();
  await heroAction.focus();
  assert.notEqual(await heroAction.evaluate((element) => getComputedStyle(element).outlineStyle), "none");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await go();
  await routeCard.hover();
  await expect(routeCard).toHaveCSS("transform", "none");
  assert.ok(await routeCard.evaluate((element) => getComputedStyle(element).transitionDuration.split(",").every((duration) => parseFloat(duration) <= .00001)), "Reduced motion must make transitions effectively instant");
  assert.equal(await page.evaluate(() => document.querySelector("main").getAnimations({ subtree: true }).length), 0);
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await go("/?loading");
    await expect(page.getByRole("status", { name: "กำลังเตรียมข้อมูลท่องเที่ยว" })).toBeVisible();
    await noOverflow("loading skeleton");
    await expect(page.locator(".ed-loading-title").first()).toHaveCSS("animation-name", "none");
  }

  let failFirst = true;
  await page.route("**/api/public/routes/fixture-route-1/map", async (route) => {
    if (failFirst) { failFirst = false; await route.fulfill({ status: 503, contentType: "application/json", body: '{"success":false}' }); }
    else await route.continue();
  });
  await go();
  await page.getByRole("button", { name: "ดูเส้นทางบนแผนที่" }).click();
  await expect(page.getByRole("alert")).toContainText("ยังโหลดแผนที่ไม่ได้");
  await page.getByRole("button", { name: "ลองอีกครั้ง", exact: true }).click();
  await page.getByLabel("แผนที่ตำแหน่งจุดแวะ", { exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "ดูทุกจุด" })).toBeVisible();
  assert.equal(mapRequests.length, 2, "Retry requests only the failed route");

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const serverPage = await noJs.newPage();
  await serverPage.goto(`${origin}/ssr.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await expect(serverPage.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(serverPage.getByRole("link", { name: /ดูสถานที่ทั้งหมด/ }).first()).toBeVisible();
  await expect(serverPage.locator(".ed-route-cards a")).toHaveCount(3);
  await expect(serverPage.locator(".ed-hero-visual img")).toHaveCount(1);
  assert.ok((await serverPage.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1);
  await serverPage.screenshot({ path: `${output}/home-no-javascript-390.png`, fullPage: true });
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ homeLayouts: layouts, skeletonLayouts: 6, hover: "passed", reducedMotion: "passed", deferredMap: "passed", routeCache: "passed", errorRetry: "passed", noJavaScriptSSR: "passed", pageErrors: errors, screenshots: output }));
} finally { await browser.close(); }
