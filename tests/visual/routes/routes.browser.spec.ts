import { expect, test, type Page } from "@playwright/test";

async function checkLayout(page: Page) {
  await expect.poll(() => page.evaluate(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0)), { timeout: 15_000 }).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("public itinerary map is deferred, numbered, and usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await expect(page.locator(".leaflet-marker-icon").first()).toHaveText("1");
  await expect(page.locator(".leaflet-marker-icon").last()).toHaveText("3");
  await expect(page.getByText(/มี 1 จุดที่ยังไม่มีพิกัด/)).toBeVisible();
  await expect.poll(() => page.locator(".leaflet-tile").evaluateAll((tiles) => tiles.length > 0 && tiles.every((tile) => tile instanceof HTMLImageElement && tile.complete && tile.naturalWidth > 0)), { timeout: 15_000 }).toBe(true);
  await page.locator(".leaflet-marker-icon").first().click();
  await expect(page.getByRole("link", { name: "1. สถานที่ทดสอบแรก", exact: true })).toHaveAttribute("href", "/attractions/fixture-first");
  await page.getByRole("button", { name: "ซ่อนแผนที่", exact: true }).click();
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await checkLayout(page);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `output/playwright/routes-public-final-${page.viewportSize()!.width}.png`, fullPage: true });
});

test("admin edits can be saved repeatedly and drawers can be cancelled", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?admin");
  const publish = page.getByRole("button", { name: "เผยแพร่เส้นทาง", exact: true });
  const note = page.getByRole("textbox", { name: "คำแนะนำภาษาไทย", exact: true }).first();
  const save = page.getByRole("button", { name: "บันทึกจุดแวะของเส้นทาง", exact: true });
  for (const value of ["แก้ไขครั้งแรก", "แก้ไขครั้งที่สอง"]) {
    await note.fill(value);
    await expect(publish).toBeDisabled();
    await save.click();
    await expect(publish).toBeEnabled();
    await expect(note).toHaveValue(value);
  }
  await page.getByRole("button", { name: "เพิ่มจุดแวะ", exact: true }).first().click();
  await expect(page.getByRole("searchbox", { name: "ค้นหาสถานที่ท่องเที่ยว" })).toBeFocused();
  await expect(page.getByText(/ถูกใช้ในวันที่/)).toHaveCount(0);
  await publish.click();
  await expect(page.getByRole("alert")).toContainText("QA fixture:");
  await page.getByRole("button", { name: "เปลี่ยนภาพปก", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "รูปภาพปกเส้นทาง" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "ยกเลิก", exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await page.getByRole("button", { name: "แก้ไขข้อมูลหลัก", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /ชื่อเส้นทาง \(TH\)/ })).toBeVisible();
  await checkLayout(page);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `output/playwright/routes-admin-final-${page.viewportSize()!.width}.png`, fullPage: true });
});

test("tile network failure leaves stop details and markers available", async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("ภาพแผนที่บางส่วนโหลดไม่สำเร็จ");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await expect(page.getByRole("link", { name: /สถานที่ทดสอบแรก/ }).first()).toHaveAttribute("href", "/attractions/fixture-first");
});
