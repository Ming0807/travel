// Playwright CLI evaluates this function directly against synthetic endpoints.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  await page.goto("http://127.0.0.1:4180/nfc.html");
  const imagePath = "D:/project-next/fullstack-tourism/.tmp/nfc-evidence-qa.png";
  await page.route("https://evidence.example/qa.png", route => route.fulfill({ contentType: "image/png", path: imagePath }));
  await page.route("**/api/admin/nfc/evidence?**", route => route.fulfill({ json: route.request().method() === "POST"
    ? { success: true, data: { assetId: "33333333-3333-4333-8333-333333333333", width: 800, height: 600, sizeBytes: 4096 } }
    : { success: true, data: { url: "https://evidence.example/qa.png", expiresIn: 60 } } }));
  await page.getByText("บันทึกการตรวจครั้งใหม่", { exact: true }).click();
  await page.getByLabel("ตำแหน่งติดตั้ง", { exact: true }).fill("ป้ายทางเข้าหลักบริเวณจุดเช็กอิน");
  await page.getByLabel("อุปกรณ์และเบราว์เซอร์", { exact: true }).fill("Android Chrome");
  await page.getByLabel("ผลทดสอบ QR", { exact: true }).selectOption("passed");
  await page.getByLabel("เลือกรูปหลักฐาน", { exact: true }).setInputFiles(imagePath);
  await page.getByAltText("รูปหลักฐาน 1", { exact: true }).waitFor();
  await page.getByRole("button", { name: "บันทึกผลตรวจ", exact: true }).click();
  await page.getByText("บันทึกผลตรวจแล้ว สถานะแท็กยังไม่เปลี่ยน", { exact: true }).waitFor();
  await page.getByRole("button", { name: "ดูรูปหลักฐาน 1", exact: true }).click();
  const photo = page.getByAltText("รูปหลักฐานการตรวจ 1", { exact: true });
  await photo.waitFor();
  if (!await photo.evaluate(image => image.complete && image.naturalWidth > 0)) throw new Error("Evidence image did not load");
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const panel = page.getByRole("region", { name: "ตรวจหน้างาน NFC" });
    await panel.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Evidence layout overflow");
    await panel.screenshot({ path: `.tmp/nfc-evidence-${width}.png` });
  }
}
