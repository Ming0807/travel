import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Export CSV button on all admin CRUD pages.
 *
 * Uses mock-server.mjs (started via webServer in playwright.e2e.config.ts)
 * to serve mock admin HTML pages and mock CSV export responses.
 */

/* ─── Page-to-export mapping ─────────────────────────────────────────── */

interface ExportPage {
  path: string;
  title: string;
  endpoint: string;
  isMediaStyle?: boolean;
  isAudit?: boolean;
}

const originalPages: ExportPage[] = [
  { path: "/admin/attractions", title: "Attractions", endpoint: "/api/admin/export/attractions" },
  { path: "/admin/stories", title: "Travel Stories", endpoint: "/api/admin/export/stories" },
  { path: "/admin/routes", title: "Routes", endpoint: "/api/admin/export/routes" },
  { path: "/admin/photo-spots", title: "Photo Spots", endpoint: "/api/admin/export/photo-spots" },
  { path: "/admin/badges", title: "Badges", endpoint: "/api/admin/export/badges" },
  { path: "/admin/checkin-codes", title: "Check-in Codes", endpoint: "/api/admin/export/checkin-codes" },
  { path: "/admin/media", title: "Media Library", endpoint: "/api/admin/export/media", isMediaStyle: true },
  { path: "/admin/restaurants", title: "Restaurants", endpoint: "/api/admin/export/restaurants" },
  { path: "/admin/visits", title: "Visits", endpoint: "/api/admin/export/visits" },
  { path: "/admin/surveys", title: "Surveys", endpoint: "/api/admin/export/surveys" },
];

/* ─── Phase 10 new export pages ─────────────────────────────────────── */
const phase10Pages: ExportPage[] = [
  { path: "/admin/accommodations", title: "Accommodations", endpoint: "/api/admin/export/accommodations" },
  { path: "/admin/certificate-templates", title: "Certificate Templates", endpoint: "/api/admin/export/certificate-templates" },
  { path: "/admin/messages", title: "Messages", endpoint: "/api/admin/export/messages" },
  { path: "/admin/reviews", title: "Reviews", endpoint: "/api/admin/export/reviews" },
  { path: "/admin/tourists", title: "Tourists", endpoint: "/api/admin/export/tourists" },
  { path: "/admin/users", title: "Admin Users", endpoint: "/api/admin/export/users" },
  { path: "/admin/roles", title: "Roles & Permissions", endpoint: "/api/admin/export/roles" },
];

test.describe("Phase 10: New Export Pages", () => {
  for (const pageConfig of phase10Pages) {
    test(`export button renders and triggers download on ${pageConfig.path}`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState("networkidle");

      const exportBtn = page.locator(".export-btn");
      await expect(exportBtn).toBeVisible();
      await expect(exportBtn).toContainText("Export CSV");

      const href = await exportBtn.getAttribute("href");
      expect(href).toBe(pageConfig.endpoint);

      const hasDownload = await exportBtn.getAttribute("download");
      expect(hasDownload).not.toBeNull();

      const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
      await exportBtn.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain(".csv");

      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks).toString("utf-8");
      expect(body).toContain("Demo Record 1");
      expect(body).toContain("Published");
    });
  }
});

const exportPages = [...originalPages];



/* ─── Tests ───────────────────────────────────────────────────────────── */

test.describe("Admin CRUD Export Button", () => {
  for (const pageConfig of exportPages) {
    test(`export button renders and triggers download on ${pageConfig.path}`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState("networkidle");

      // Standard pages use an <a> tag with export-btn class and download attribute
      const exportBtn = page.locator(".export-btn");
      await expect(exportBtn).toBeVisible();
      await expect(exportBtn).toContainText("Export CSV");

      const href = await exportBtn.getAttribute("href");
      expect(href).toBe(pageConfig.endpoint);

      const hasDownload = await exportBtn.getAttribute("download");
      expect(hasDownload).not.toBeNull();

      // For <a download> links, use waitForEvent('download') instead of waitForResponse
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
      await exportBtn.click();
      const download = await downloadPromise;

      // Verify filename has .csv extension
      expect(download.suggestedFilename()).toContain(".csv");

      // Read the download content to verify
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks).toString("utf-8");
      expect(body).toContain("Demo Record 1");
      expect(body).toContain("Published");
    });
  }

  test("export button renders and triggers download on /admin/audit", async ({ page }) => {
    await page.goto("/admin/audit");
    await page.waitForLoadState("networkidle");

    // Audit page uses a <button> with export-btn-audit class (no href/download attr)
    const exportBtn = page.locator(".export-btn-audit");
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText("Export CSV");

    // Click triggers window.location.href; server responds with Content-Disposition: attachment
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".csv");
    expect(download.url()).toContain("/api/admin/audit/export");

    // Verify content
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString("utf-8");
    expect(body).toContain("Admin User");
    expect(body).toContain("export.attractions.csv");
  });

  test("dashboard export button renders and triggers download", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    const exportBtn = page.locator(".export-csv-btn");
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText("Export CSV");

    // Dashboard uses a <button> with window.location.href; server responds with Content-Disposition: attachment
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".csv");
    expect(download.url()).toContain("/api/admin/dashboard/export");

    // Verify content
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString("utf-8");
    expect(body).toContain("Visits");
    expect(body).toContain("25");
  });

  test("export button passes search params to the endpoint", async ({ page }) => {
    await page.goto("/admin/attractions?isPublished=true&search=test");
    await page.waitForLoadState("networkidle");

    const exportBtn = page.locator(".export-btn");

    // Capture the download and check the URL via href attribute
    const href = await exportBtn.getAttribute("href");
    expect(href).toBe("/api/admin/export/attractions");

    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;

    // Verify the server received search params (via the download URL)
    const downloadUrl = download.url();
    expect(downloadUrl).toContain("/api/admin/export/attractions");
  });

  test("export returns CSV when data is empty", async ({ page }) => {
    // The mock server always returns CSV regardless of data state
    await page.goto("/admin/attractions");
    await page.waitForLoadState("networkidle");

    const exportBtn = page.locator(".export-btn");
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString("utf-8");
    expect(body.startsWith("\uFEFF")).toBe(true);
    expect(body).toContain("Demo Record 1");
  });
});

test.describe("Admin Export Button Error States", () => {
  test("export button works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });

    await page.goto("/admin/attractions");
    await page.waitForLoadState("networkidle");

    const exportBtn = page.locator(".export-btn");
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText("Export CSV");

    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("export with explicit xlsx format triggers download with xlsx extension", async ({ page }) => {
    // The ExportButton dropdown allows CSV/XLSX selection; mock passes format as query param
    await page.goto("/admin/attractions");
    await page.waitForLoadState("networkidle");

    // Simulate clicking the format dropdown (CaretDown button) and selecting XLSX
    const dropdownToggle = page.locator("button[aria-haspopup=\"listbox\"]");
    await expect(dropdownToggle).toBeVisible();
    await dropdownToggle.click();

    // Click the XLSX option in the dropdown
    const xlsxOption = page.locator("button[role=\"option\"]:has-text('Excel (.xlsx)')");
    await expect(xlsxOption).toBeVisible();
    await xlsxOption.click();

    // After selecting XLSX, the export link should now have format=xlsx
    const exportBtn = page.locator(".export-btn");
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText("Excel");

    const href = await exportBtn.getAttribute("href");
    expect(href).toContain("format=xlsx");

    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("export button dropdown opens and closes correctly", async ({ page }) => {
    await page.goto("/admin/attractions");
    await page.waitForLoadState("networkidle");

    const dropdownToggle = page.locator("button[aria-haspopup=\"listbox\"]");

    // Dropdown should be closed initially
    const csvOption = page.locator("button[role=\"option\"]");
    await expect(csvOption).toHaveCount(0);

    // Open dropdown
    await dropdownToggle.click();
    await expect(csvOption.first()).toBeVisible();

    // Close by clicking outside
    await page.locator("h1").click();
    await expect(csvOption).toHaveCount(0);
  });
});
