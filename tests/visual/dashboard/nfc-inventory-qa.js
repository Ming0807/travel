// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async page => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4180/nfc.html");
  const panel = page.getByRole("region", { name: "รายการหลักฐาน NFC", exact: true });
  await panel.getByRole("button", { name: "โหลดรายการหลักฐาน" }).click();
  await panel.getByText("ยังไม่ได้ตรวจยืนยันสถานะไฟล์ปัจจุบัน").waitFor();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await panel.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Inventory overflow");
    await panel.screenshot({ path: `.tmp/nfc-inventory-${width}.png` });
  }
  await panel.getByRole("button", { name: "หลักฐานหน้าถัดไป" }).click();
  await panel.getByText("แสดง 3 รายการ · หน้า 2").waitFor();
  await panel.getByText("40000000-0000-4000-8000-000000000004", { exact: true }).waitFor();
  if (await panel.getByText("40000000-0000-4000-8000-000000000001", { exact: true }).count()) throw new Error("Stale first page");
  await panel.getByRole("button", { name: "หลักฐานหน้าก่อนหน้า" }).click();
  await panel.getByText("แสดง 3 รายการ · หน้า 1").waitFor();
  if (errors.length) throw new Error(errors.join("\n"));
}
