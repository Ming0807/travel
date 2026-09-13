// Playwright CLI evaluates this function directly against synthetic fixtures.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4180/nfc.html");
  const panel = page.getByRole("region", { name: "กู้คืนรูปหลักฐาน NFC" });
  await panel.getByRole("button", { name: "โหลดรายการกู้คืน" }).click();
  await panel.getByText("ต้องตรวจสอบ", { exact: true }).waitFor();
  await panel.getByRole("button", { name: "ดูประวัติการกู้คืน" }).first().click();
  await panel.getByText("ส่งให้ผู้ดูแลตรวจสอบ", { exact: false }).first().waitFor();
  await panel.getByRole("button", { name: "ประวัติก่อนหน้า" }).click();
  await panel.getByRole("button", { name: "ประวัติก่อนหน้า" }).waitFor({ state: "hidden" });
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await panel.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Recovery viewport overflow");
    await panel.screenshot({ path: `.tmp/nfc-recovery-${width}.png` });
  }
  await panel.getByRole("button", { name: "รายการกู้คืนหน้าถัดไป" }).click();
  await panel.getByText("ยังไม่มีรายการกู้คืนของแท็กนี้").waitFor();
  await panel.getByRole("button", { name: "รายการกู้คืนหน้าก่อนหน้า" }).click();
  await panel.getByText("ต้องตรวจสอบ", { exact: true }).waitFor();
  if (errors.length) throw new Error(errors.join("\n"));
}
