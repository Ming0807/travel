// Playwright CLI evaluates this function directly.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  await page.goto("http://127.0.0.1:4180/nfc.html");
  await page.getByText("บันทึกการตรวจครั้งใหม่", { exact: true }).click();
  await page.getByLabel("ตำแหน่งติดตั้ง", { exact: true }).fill("ป้ายทางเข้าหลักบริเวณจุดเช็กอิน");
  await page.getByLabel("อุปกรณ์และเบราว์เซอร์", { exact: true }).fill("Android Chrome");
  await page.getByLabel("ผลทดสอบ NFC", { exact: true }).selectOption("failed");
  await page.getByLabel("ผลทดสอบ QR", { exact: true }).selectOption("passed");
  await page.getByLabel("ปัญหาหรือหมายเหตุ", { exact: true }).fill("อ่านแท็กไม่สำเร็จ ต้องทดสอบใหม่");
  await page.getByRole("button", { name: "บันทึกผลตรวจ", exact: true }).click();
  await page.getByText("บันทึกผลตรวจแล้ว สถานะแท็กยังไม่เปลี่ยน", { exact: true }).waitFor();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("heading", { name: "ผลตรวจหน้างาน", exact: true }).scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("NFC field overflow");
    await page.screenshot({ path: `.tmp/nfc-field-${width}.png`, fullPage: true });
  }
}
