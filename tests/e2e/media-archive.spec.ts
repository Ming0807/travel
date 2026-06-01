import { test, expect, Page } from "@playwright/test";

/** Returns a fresh copy of mock assets to avoid cross-test mutation. */
function createMockAssets() {
  return [
    {
      id: "asset-1",
      file_name: "hero-beach.jpg",
      storage_path: "attractions/beach/hero-beach.jpg",
      mime_type: "image/jpeg",
      size_bytes: 512_000,
      category: "Attractions",
      created_at: "2026-05-01T10:00:00Z",
      url: "https://test.supabase.co/storage/v1/object/public/site-media/attractions/beach/hero-beach.jpg",
      lifecycle_status: "active",
      is_active: true,
    },
    {
      id: "asset-2",
      file_name: "header-mountain.png",
      storage_path: "homepage/header-mountain.png",
      mime_type: "image/png",
      size_bytes: 1_200_000,
      category: "Homepage",
      created_at: "2026-05-10T10:00:00Z",
      url: "https://test.supabase.co/storage/v1/object/public/site-media/homepage/header-mountain.png",
      lifecycle_status: "active",
      is_active: true,
    },
  ];
}

/** Stats card helper — nth(0) = Active assets, nth(1) = Archived, etc. */
function statsCard(page: Page, index: number) {
  return page.locator('.rounded-lg.border.border-slate-200.bg-slate-50').nth(index);
}

/**
 * Set up route interception to mock all Media Library API endpoints.
 * Accepts a mutable assets array so the handler can update lifecycle status in place.
 */
async function setupMediaMocks(page: Page, assets: ReturnType<typeof createMockAssets>) {
  // Unified handler for /api/admin/media/asset-1 (DELETE + PATCH)
  await page.route("**/api/admin/media/asset-1", async (route) => {
    const method = route.request().method();
    if (method === "DELETE") {
      const asset = assets.find((a) => a.id === "asset-1");
      if (asset) {
        asset.lifecycle_status = "archived";
        asset.is_active = false;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, references: [] }),
      });
    } else if (method === "PATCH") {
      const body = JSON.parse(route.request().postData() || "{}");
      if (body.action === "unarchive") {
        const asset = assets.find((a) => a.id === "asset-1");
        if (asset) {
          asset.lifecycle_status = "active";
          asset.is_active = true;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "Unknown action" }),
        });
      }
    } else {
      await route.fallback();
    }
  });

  // GET /api/admin/media — respects lifecycle_status and category query params
  await page.route("**/api/admin/media?*", async (route) => {
    const url = new URL(route.request().url());
    const lifecycleStatus = url.searchParams.get("lifecycle_status") ?? "active";
    const category = url.searchParams.get("category") ?? "All";

    let filtered = [...assets];

    if (lifecycleStatus === "active") {
      filtered = filtered.filter((a) => a.lifecycle_status !== "archived");
    }

    if (category !== "All") {
      filtered = filtered.filter((a) => a.category === category);
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(filtered),
    });
  });
}

test.describe("Media Library Archive Flow", () => {
  test("completes the full archive → archived view → restore cycle", async ({ page }) => {
    test.setTimeout(60_000);

    page.on("pageerror", (err) =>
      console.error(`[E2E PageError] ${err.message}`)
    );
    page.on("requestfailed", (req) =>
      console.error(`[E2E RequestFailed] ${req.url()} ${req.failure()?.errorText}`)
    );

    const assets = createMockAssets();
    await setupMediaMocks(page, assets);

    // ── 1. Navigate to Media Library ────────────────────────────────────
    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    // Stats panel — Active assets card shows "2"
    await expect(statsCard(page, 0)).toContainText("Active assets");
    await expect(statsCard(page, 0).locator(".text-xl")).toHaveText("2");

    // Both filenames visible
    await expect(page.getByText("hero-beach.jpg")).toBeVisible();
    await expect(page.getByText("header-mountain.png")).toBeVisible();

    // ── 2. Archive the first asset ──────────────────────────────────────
    const beachCard = page.locator("article").filter({ hasText: "hero-beach.jpg" });
    await expect(beachCard).toBeVisible();

    // Hover to reveal the archive overlay
    await beachCard.hover();

    // Archive button appears in the hover overlay
    const archiveButton = beachCard.getByRole("button", { name: "Archive" });
    await expect(archiveButton).toBeVisible();
    await archiveButton.click();

    // ── 3. Confirm archive dialog ─────────────────────────────────────
    const dialog = page.getByText("Archive this asset?");
    await expect(dialog).toBeVisible();

    // Storage path shown in dialog
    await expect(page.getByText("attractions/beach/hero-beach.jpg")).toBeVisible();

    // Click "Archive asset" confirm button
    await page.getByRole("button", { name: "Archive asset" }).click();

    // With no references, dialog closes automatically
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // ── 4. Asset disappears from active view ────────────────────────────
    await expect(page.getByText("hero-beach.jpg")).not.toBeVisible({ timeout: 5000 });

    // Stats now show 1 active asset
    await expect(statsCard(page, 0).locator(".text-xl")).toHaveText("1");
    // Archived stats card shows 1
    await expect(statsCard(page, 1).locator(".text-xl")).toHaveText("1");

    // ── 5. Toggle "Archived" view ──────────────────────────────────────
    const archivedToggle = page.getByRole("button", { name: /Archived/ });
    await expect(archivedToggle).toBeVisible();
    await archivedToggle.click();

    // Toggle should have amber-600 background when active
    await expect(archivedToggle).toHaveClass(/bg-amber-600/);

    // Archived asset appears
    await expect(page.getByText("hero-beach.jpg")).toBeVisible({ timeout: 5000 });

    // Archived badge visible on the card
    const archivedCard = page.locator("article").filter({ hasText: "hero-beach.jpg" });
    await expect(archivedCard.getByText("Archived")).toBeVisible();

    // Card has archived visual styling
    await expect(archivedCard).toHaveClass(/opacity-60/);
    await expect(archivedCard).toHaveClass(/saturate-0/);

    // ── 6. Restore the asset ───────────────────────────────────────────
    await archivedCard.hover();

    // Restore button appears in hover overlay (archived cards show Restore, not Archive)
    const restoreButton = archivedCard.getByRole("button", { name: "Restore" });
    await expect(restoreButton).toBeVisible();
    await restoreButton.click();

    // Wait for fetchMedia refresh
    await page.waitForTimeout(500);

    // ── 7. Verify restored ────────────────────────────────────────────
    // Archived badge should be gone
    await expect(archivedCard.getByText("Archived")).not.toBeVisible();

    // Archived styling should be gone
    await expect(archivedCard).not.toHaveClass(/opacity-60/);

    // Restore button gone, Archive button back
    await archivedCard.hover();
    await expect(archivedCard.getByRole("button", { name: "Restore" })).not.toBeVisible();
    await expect(archivedCard.getByRole("button", { name: "Archive" })).toBeVisible();

    // Archived count in stats should be 0
    await expect(statsCard(page, 1).locator(".text-xl")).toHaveText("0");
  });

  test("shows used-in references in the archive confirmation dialog", async ({ page }) => {
    test.setTimeout(60_000);

    page.on("pageerror", (err) =>
      console.error(`[E2E PageError] ${err.message}`)
    );

    const assets = createMockAssets();

    // GET returns assets
    await page.route("**/api/admin/media?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(assets),
      });
    });

    // DELETE returns references (no archive)
    await page.route("**/api/admin/media/asset-1", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            references: [
              { entityType: "attraction", entityId: 42, name: "หาดทรายขาว" },
              { entityType: "restaurant", entityId: 7, name: "ครัวบ้านสวน" },
            ],
          }),
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    // Hover and click Archive
    const card = page.locator("article").filter({ hasText: "hero-beach.jpg" });
    await card.hover();
    await card.getByRole("button", { name: "Archive" }).click();

    // Archive dialog
    await expect(page.getByText("Archive this asset?")).toBeVisible();

    // References section visible
    await expect(page.getByText("Used in these content records:")).toBeVisible();

    // Reference names visible
    await expect(page.getByText("หาดทรายขาว")).toBeVisible();
    await expect(page.getByText("ครัวบ้านสวน")).toBeVisible();

    // Entity type labels
    await expect(page.getByText("Attraction")).toBeVisible();
    await expect(page.getByText("Restaurant")).toBeVisible();

    // With references present, dialog shows "Close" instead of "Archive asset"
    await expect(page.getByRole("button", { name: "Archive asset" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  });

  test("shows error message when archive API fails", async ({ page }) => {
    test.setTimeout(60_000);

    page.on("pageerror", (err) =>
      console.error(`[E2E PageError] ${err.message}`)
    );

    const assets = createMockAssets();

    // GET returns assets
    await page.route("**/api/admin/media?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(assets),
      });
    });

    // DELETE returns 500
    await page.route("**/api/admin/media/*", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Archive failed. Please try again." }),
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");

    // Hover and click Archive
    const card = page.locator("article").filter({ hasText: "hero-beach.jpg" });
    await card.hover();
    await card.getByRole("button", { name: "Archive" }).click();

    // Archive dialog shown
    await expect(page.getByText("Archive this asset?")).toBeVisible();

    // Click confirm
    await page.getByRole("button", { name: "Archive asset" }).click();

    // Error message appears
    await expect(page.getByText("Archive failed. Please try again.")).toBeVisible({ timeout: 5000 });
  });
});
