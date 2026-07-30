import { test, expect } from "@playwright/test";

test.describe("Public Story experience", () => {
  test("supports URL-backed filters without horizontal overflow", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const failedResponses: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/stories");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main h1")).not.toContainText("<br");

    await page
      .getByRole("searchbox", {
        name: "ค้นหาจากชื่อหรือเนื้อหาเรื่องราว",
      })
      .fill("เมืองเก่า");
    await page.getByLabel("เลือกจังหวัด").selectOption("Pattani");
    await page.getByRole("button", { name: "ค้นหาเรื่องราว" }).click();

    await expect(page).toHaveURL(/q=.*&province=Pattani/);
    await expect(page.getByText(/พบ .* เรื่อง/)).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    expect(failedResponses).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("renders a published story with Thai controls when one exists", async ({
    page,
  }) => {
    await page.goto("/stories");
    const storyLink = page.locator(
      'a[href^="/stories/"]:not([href="/stories/share"])'
    );
    const href = await storyLink.first().getAttribute("href");
    test.skip(!href || href === "/stories/share", "No published story fixture");

    await page.goto(href!);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "แชร์เรื่องนี้" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "กลับไปหน้ารวมเรื่องราว" })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
});
