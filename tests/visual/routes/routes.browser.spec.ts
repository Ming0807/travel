import { expect, test, type Page } from "@playwright/test";

async function checkLayout(page: Page) {
  await expect.poll(() => page.evaluate(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0)), { timeout: 15_000 }).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("public itinerary map is deferred, numbered, and usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const timeline = page.getByRole("region", { name: "ลำดับจุดแวะทดสอบ" });
  const aside = page.locator("aside");
  const timelineBox = await timeline.boundingBox();
  const asideBox = await aside.boundingBox();
  expect(timelineBox).not.toBeNull();
  expect(asideBox).not.toBeNull();
  await expect(aside.getByText(/ไม่ใช่ทางเข้าหรือที่จอดรถ/)).toBeVisible();
  const mobileMapJump = timeline.getByRole("link", { name: "ดูตำแหน่งจุดแวะบนแผนที่" });
  if (page.viewportSize()!.width >= 1024) {
    expect(asideBox!.x).toBeGreaterThan(timelineBox!.x + timelineBox!.width);
    await expect(aside).toHaveCSS("position", "sticky");
    await expect(mobileMapJump).toBeHidden();
  } else {
    expect(asideBox!.y).toBeGreaterThan(timelineBox!.y + timelineBox!.height);
    await expect(mobileMapJump).toBeVisible();
    await expect(mobileMapJump).toHaveAttribute("href", "#route-map-heading");
  }
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await expect(page.locator(".leaflet-marker-icon").first()).toHaveText("1");
  await expect(page.locator(".leaflet-marker-icon").last()).toHaveText("3");
  await expect(page.getByText(/มี 1 จุดที่ยังไม่มีพิกัด/)).toBeVisible();
  await expect.poll(() => page.locator(".leaflet-tile").evaluateAll((tiles) => tiles.length > 0 && tiles.every((tile) => tile instanceof HTMLImageElement && tile.complete && tile.naturalWidth > 0)), { timeout: 15_000 }).toBe(true);
  await page.locator(".leaflet-marker-icon").first().click();
  const popup = page.locator(".leaflet-popup-content");
  await expect(popup.getByRole("link", { name: "1. สถานที่ทดสอบแรก", exact: true })).toHaveAttribute("href", "#route-stop-1");
  await expect(popup.getByRole("link", { name: "ดูข้อมูลสถานที่", exact: true })).toHaveAttribute("href", "/attractions/fixture-first");
  await popup.getByRole("link", { name: "1. สถานที่ทดสอบแรก", exact: true }).click();
  await expect(page).toHaveURL(/#route-stop-1$/);
  await expect(page.locator("#route-stop-1")).toBeInViewport();
  await page.getByRole("button", { name: "ซ่อนแผนที่", exact: true }).click();
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await checkLayout(page);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `output/playwright/routes-public-final-${page.viewportSize()!.width}.png`, fullPage: true });
});

test("embedded route explorer stays visible and coordinates map selection with the stop list", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?explore");
  const explorer = page.getByRole("region", { name: "สำรวจเส้นทางบนแผนที่" });
  await explorer.scrollIntoViewIfNeeded();
  await expect(explorer.getByRole("heading", { name: "สำรวจเส้นทางบนแผนที่" })).toBeVisible();
  await expect(explorer.getByRole("button", { name: "ดูแผนที่", exact: true })).toHaveCount(0);
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(3);
  await expect(page.locator(".leaflet-overlay-pane path")).toHaveCount(1);
  await expect(explorer.getByText(/ไม่ใช่ถนนหรือทางเดินจริง/)).toBeVisible();
  await explorer.getByRole("button", { name: /02.*สถานที่ทดสอบที่ไม่มีพิกัด/ }).click();
  await expect(explorer.getByRole("button", { name: /02.*สถานที่ทดสอบที่ไม่มีพิกัด/ })).toHaveAttribute("aria-pressed", "true");
  await expect(explorer.getByText("จุดที่ 2")).toBeVisible();
  await page.locator(".leaflet-marker-icon").last().click();
  await expect(explorer.getByRole("button", { name: /03.*สถานที่ทดสอบชื่อยาว/ })).toHaveAttribute("aria-pressed", "true");
  await explorer.getByRole("button", { name: "ดูทุกจุด" }).click();
  await page.locator(".leaflet-popup-close-button").click();
  await expect.poll(async () => {
    const control = (await explorer.getByRole("button", { name: "ดูทุกจุด" }).boundingBox())!;
    const pins = await page.locator(".leaflet-marker-icon").all();
    for (const pin of pins) {
      const box = (await pin.boundingBox())!;
      if (box.x < control.x + control.width && box.x + box.width > control.x && box.y < control.y + control.height && box.y + box.height > control.y) return false;
    }
    return true;
  }).toBe(true);
  const firstMarker = explorer.getByRole("button", { name: "จุดที่ 1 สถานที่ทดสอบแรก", exact: true });
  await firstMarker.focus();
  await firstMarker.press("Enter");
  await expect(explorer.getByRole("button", { name: /01.*สถานที่ทดสอบแรก/ })).toHaveAttribute("aria-pressed", "true");
  const lastMarker = page.locator(".leaflet-marker-icon").last();
  await lastMarker.focus();
  await lastMarker.press("Space");
  await expect(explorer.getByRole("button", { name: /03.*สถานที่ทดสอบชื่อยาว/ })).toHaveAttribute("aria-pressed", "true");
  await expect(lastMarker).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".leaflet-popup-close-button")).toHaveCount(1);
  await page.locator(".leaflet-popup-close-button").click();
  const map = explorer.locator(".leaflet-container");
  await map.scrollIntoViewIfNeeded();
  const markerDistance = async () => {
    const frame = await map.boundingBox();
    const pin = await lastMarker.boundingBox();
    if (!frame || !pin) return Infinity;
    return Math.hypot(pin.x + pin.width / 2 - frame.x - frame.width / 2, pin.y + pin.height / 2 - frame.y - frame.height / 2);
  };
  await expect.poll(markerDistance).toBeLessThan(3);
  const mapBox = (await map.boundingBox())!;
  await page.mouse.move(mapBox.x + 70, mapBox.y + 180);
  await page.mouse.down();
  await page.mouse.move(mapBox.x + 170, mapBox.y + 180, { steps: 10 });
  await page.mouse.up();
  await expect.poll(markerDistance).toBeGreaterThan(50);
  await explorer.getByRole("button", { name: /03.*สถานที่ทดสอบชื่อยาว/ }).click();
  await expect.poll(markerDistance).toBeLessThan(3);
  await expect(explorer.getByRole("link", { name: /เปิดนำทางทั้งเส้นทาง/ })).toHaveAttribute("href", "https://www.google.com/maps/dir/?api=1");
  await checkLayout(page);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `output/playwright/routes-explorer-${page.viewportSize()!.width}.png`, fullPage: true });
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
  await page.getByRole("button", { name: "เปลี่ยนภาพปก", exact: true }).click();
  await drawer.getByRole("button", { name: "เอาออก", exact: true }).click();
  await expect(drawer.getByRole("status")).toContainText("ยังไม่ได้บันทึก");
  await drawer.getByRole("button", { name: "บันทึกรูปภาพ", exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.getByRole("button", { name: "เลือกรูปภาพปก", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "เลือกรูปภาพปก", exact: true }).click();
  await expect(drawer.getByText("ยังไม่ได้เลือกรูปภาพ", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("button", { name: "บันทึกรูปภาพ", exact: true })).toBeDisabled();
  await drawer.getByRole("button", { name: "ยกเลิก", exact: true }).click();
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
  await expect(page.getByRole("link", { name: "ดูพิกัดจุดที่ 1 ใน Google Maps" })).toHaveAttribute("href", "https://www.google.com/maps/search/?api=1&query=6.541%2C101.281");
});
