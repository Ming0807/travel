import { expect, test } from "@playwright/test";

test.describe("Public dashboard evidence report", () => {
  test("explains scope, source, thresholds, and metric meaning", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { level: 1, name: "ข้อมูลการท่องเที่ยวที่ระบบบันทึกได้" }),
    ).toBeVisible();
    await expect(page.getByText(/รายงานหลักฐานสาธารณะ · จังหวัดยะลา/)).toBeVisible();
    await expect(page.getByText("ฐานข้อมูลการมีส่วนร่วมของแพลตฟอร์ม")).toBeVisible();
    await expect(page.getByText(/^ข้อมูล ณ \d/)).toBeVisible();
    await expect(page.getByText("ไม่ใช่ยอดเปิดหน้าเว็บหรือจำนวน QR scan")).toBeVisible();
    await expect(page.getByText(/น้อยกว่า 5 รายการถูกปกปิด/)).toBeVisible();
    await expect(page.getByText(/ไม่ใช่สถิตินักท่องเที่ยวทางการของจังหวัดยะลา/)).toBeVisible();
    await expect(page.getByText("ยังไม่สามารถโหลดรายงานสาธารณะได้")).toHaveCount(0);

    const trendTable = page.getByRole("table", { name: "แนวโน้มรายการเข้าชมที่บันทึก" });
    if (await trendTable.count()) {
      await expect(trendTable.getByRole("columnheader", { name: "วันที่" })).toBeVisible();
      await expect(trendTable.getByRole("columnheader", { name: "รายการเข้าชม" })).toBeVisible();
    } else {
      await expect(page.getByText("ยังไม่มีรายการเข้าชมในช่วงข้อมูลนี้")).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test("fits the viewport without horizontal page overflow", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
