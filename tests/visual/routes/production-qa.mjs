import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const baseUrl = process.env.ROUTE_QA_BASE_URL || "http://127.0.0.1:3100";
const slug = process.env.ROUTE_QA_SLUG || "na-tham-kampan-cave-learning";
const output = "output/playwright/routes-production";
const browser = await chromium.launch({ headless: true });
const results = [];
await mkdir(output, { recursive: true });

try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseUrl}/routes/${encodeURIComponent(slug)}`, { waitUntil: "domcontentloaded" });
    assert.equal(response?.status(), 200, "Published route must respond successfully");
    const title = await page.getByRole("heading", { level: 1 }).innerText();
    const timeline = page.locator('[id^="route-stop-"]');
    const stopCount = await timeline.count();
    assert.ok(stopCount >= 2, "A published route needs at least two stops");
    const stops = [];
    for (let index = 0; index < stopCount; index++) {
      const stop = timeline.nth(index);
      const name = await stop.getByRole("heading", { level: 4 }).innerText();
      const directions = await stop.getByRole("link", { name: `นำทางจากตำแหน่งปัจจุบันไปจุดที่ ${index + 1} ใน Google Maps`, exact: true }).getAttribute("href");
      assert.ok(directions, `Stop ${index + 1} must have directions`);
      const url = new URL(directions);
      assert.equal(url.origin, "https://www.google.com");
      assert.equal(url.searchParams.get("api"), "1");
      assert.equal(url.searchParams.has("origin"), false);
      const coordinate = url.searchParams.get("destination");
      const [latitude, longitude] = coordinate?.split(",").map(Number) || [];
      assert.ok(Number.isFinite(latitude) && Math.abs(latitude) <= 90);
      assert.ok(Number.isFinite(longitude) && Math.abs(longitude) <= 180);
      stops.push({ name, coordinate, directions });
    }

    await page.getByRole("link", { name: "ดูแผนที่เส้นทาง", exact: true }).click();
    const explorer = page.getByRole("region", { name: "สำรวจเส้นทางบนแผนที่" });
    const map = explorer.locator(".leaflet-container");
    const markers = map.locator(".leaflet-marker-icon");
    await expect(markers).toHaveCount(new Set(stops.map((stop) => stop.coordinate)).size);
    await expect.poll(() => map.locator(".leaflet-tile").evaluateAll((tiles) => tiles.length > 0 && tiles.every((tile) => tile.complete && tile.naturalWidth > 0)), { timeout: 30_000 }).toBe(true);
    const reset = explorer.getByRole("button", { name: "ดูทุกจุด", exact: true });
    const controlBox = await reset.boundingBox();
    assert.ok(controlBox);
    for (const marker of await markers.all()) {
      const pinBox = await marker.boundingBox();
      assert.ok(pinBox);
      assert.equal(pinBox.x < controlBox.x + controlBox.width && pinBox.x + pinBox.width > controlBox.x && pinBox.y < controlBox.y + controlBox.height && pinBox.y + pinBox.height > controlBox.y, false, "Map control must not obscure a stop marker");
    }
    for (let index = 0; index < stops.length; index++) {
      const button = explorer.getByRole("list").getByRole("button").nth(index);
      await expect(button).toContainText(stops[index].name);
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(explorer.getByRole("link", { name: "นำทางไปจุดนี้", exact: true })).toHaveAttribute("href", stops[index].directions);
      await expect.poll(() => explorer.locator("img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), { timeout: 30_000 }).toBe(true);
    }

    const routeDirections = explorer.getByRole("link", { name: "เปิดนำทางทั้งเส้นทาง", exact: true });
    if (stops.length <= 4) {
      const href = await routeDirections.getAttribute("href");
      assert.ok(href);
      const url = new URL(href);
      assert.equal(url.searchParams.has("origin"), false);
      assert.equal(url.searchParams.get("destination"), stops.at(-1).coordinate);
      assert.deepEqual(url.searchParams.get("waypoints")?.split("|"), stops.slice(0, -1).map((stop) => stop.coordinate));
    } else {
      await expect(routeDirections).toHaveCount(0);
      await expect(page.getByText("จากจุดแรก เปิดเส้นทางต่อทีละช่วงเพื่อไม่ให้จุดใดหายไปบนมือถือ")).toBeVisible();
    }
    await reset.click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal page overflow");
    assert.deepEqual(errors, [], "No uncaught browser errors");
    await explorer.screenshot({ path: `${output}/${slug}-${width}.png` });
    results.push({ width, title, stopCount, coordinates: stops.map((stop) => stop.coordinate), actualTiles: "loaded", directions: "match timeline", errors });
    await context.close();
  }
  await writeFile(`${output}/report.json`, JSON.stringify({ baseUrl, slug, checkedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify({ baseUrl, slug, viewports: results.length, results }));
} finally {
  await browser.close();
}
