import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("https://tile.openstreetmap.org/**", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e6eee6"/></svg>' }));
await mkdir("output/playwright/journey", { recursive: true });
let layouts = 0;
try {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:3100/passport", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "พาสปอร์ตการเดินทางของฉัน" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "เริ่มสะสมความทรงจำจากยะลา" })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole("link", { name: "วิธีสะสมตราประทับ" })).toHaveAttribute("href", "/checkin/try");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1);
    await page.screenshot({ path: `output/playwright/journey/production-passport-${width}.png`, fullPage: true });
    layouts++;
    await page.goto("http://127.0.0.1:3100/routes", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const route = page.getByRole("link", { name: /ดูแผนการเดินทาง/ }).first();
    await expect(route).toBeVisible({ timeout: 30000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1);
    for (const image of await page.locator(".route-directory__image img").all()) await expect(image).toHaveAttribute("loading", "lazy");
    layouts++;
    await route.click();
    await expect(page.getByRole("navigation", { name: "ส่วนต่าง ๆ ของเส้นทาง" })).toBeVisible();
    await page.getByRole("link", { name: "ลำดับจุดแวะ", exact: true }).click();
    await expect(page.getByRole("heading", { name: "ลำดับการเดินทาง", exact: true })).toBeInViewport();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1);
    await page.screenshot({ path: `output/playwright/journey/production-route-${width}.png`, fullPage: true });
    layouts++;
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ productionLayouts: layouts, passportGuest: "passed", routeDiscovery: "passed", routeNavigation: "passed", pageErrors: errors }));
} finally { await browser.close(); }
