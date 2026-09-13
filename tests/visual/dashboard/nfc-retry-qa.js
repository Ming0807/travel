// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4180/nfc.html");
  await page.getByRole("button", { name: "โหลดรายการกู้คืน" }).click();
  await page.getByRole("button", { name: "จัดคิวตรวจซ้ำ", exact: true }).click();
  const form = page.getByRole("form", { name: "คำขอจัดคิวตรวจซ้ำ" });
  await form.getByRole("button", { name: "ยืนยันจัดคิวตรวจซ้ำ" }).click();
  await form.getByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" }).waitFor();
  const request = await form.getByText(/^เลขคำขอ/).textContent();
  await page.getByRole("button", { name: "รีเฟรชรายการกู้คืน" }).click();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await form.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Retry form overflow");
    await form.screenshot({ path: `.tmp/nfc-retry-${width}.png` });
  }
  if (request !== await form.getByText(/^เลขคำขอ/).textContent()) throw new Error("Request identity changed on refresh");
  await form.getByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" }).click();
  await form.getByText("จัดคิวตรวจซ้ำแล้ว ยังไม่ได้ยืนยันว่ากู้คืนไฟล์สำเร็จ").waitFor();
  await form.getByRole("button", { name: "ปิดคำขอ" }).click();
  if (errors.length) throw new Error(errors.join("\n"));
}
