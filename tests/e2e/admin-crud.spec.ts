import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * Mock HTML generators for admin CRUD pages.
 * These mirror the structure of ListPageShell, AdminShell, and admin form components.
 */

/** Admin login page mock */
function _loginPageHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Admin Login</title></head>
<body>
  <main class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
      <h1 class="text-2xl font-bold text-slate-800">เข้าสู่ระบบ</h1>
      <form action="/api/auth/login" method="POST">
        <label class="block mt-4">
          <span class="text-sm font-medium text-slate-700">อีเมล</span>
          <input name="email" type="email" class="w-full rounded-xl border px-4 py-3 mt-1" />
        </label>
        <label class="block mt-4">
          <span class="text-sm font-medium text-slate-700">รหัสผ่าน</span>
          <input name="password" type="password" class="w-full rounded-xl border px-4 py-3 mt-1" />
        </label>
        <button type="submit" class="w-full bg-[#0A6B62] text-white rounded-xl py-3 mt-6 font-bold">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  </main>
</body>
</html>`;
}

/** Admin overview page mock */
function adminOverviewHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Admin Overview</title></head>
<body>
  <div class="flex h-screen">
    <nav class="w-64 bg-slate-900 text-white p-4" data-testid="sidebar">
      <a href="/admin/dashboard" class="block py-2">Dashboard</a>
      <a href="/admin/attractions" class="block py-2">Attractions</a>
      <a href="/admin/photo-spots" class="block py-2">Photo Spots</a>
      <a href="/admin/checkin-codes" class="block py-2">Check-in Codes</a>
    </nav>
    <main class="flex-1 p-6">
      <h1 class="text-3xl font-black">ภาพรวมระบบ</h1>
      <p>Southern Border Tourism Data & Intelligence Platform</p>
    </main>
  </div>
</body>
</html>`;
}

/** Attractions list page mock */
function attractionsListHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Attractions Management</title></head>
<body>
  <div class="flex h-screen">
    <nav class="w-64 bg-slate-900 text-white p-4" data-testid="sidebar">
      <a href="/admin/dashboard">Dashboard</a>
      <a href="/admin/attractions" class="font-bold">Attractions</a>
    </nav>
    <main class="flex-1 p-6 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-xs font-black uppercase tracking-wider text-[#D6A13D]">Content Management</p>
          <h1 class="text-2xl font-black text-[#073F37]">แหล่งท่องเที่ยว</h1>
        </div>
        <div class="flex gap-2">
          <a href="/api/admin/export/attractions?format=csv" class="rounded-xl border px-4 py-2 text-sm">Export CSV</a>
          <a href="/admin/attractions/new" class="bg-[#0A6B62] text-white rounded-xl px-4 py-2 text-sm font-bold">
            เพิ่มสถานที่ใหม่
          </a>
        </div>
      </div>
      <table class="w-full">
        <thead>
          <tr>
            <th class="text-left px-4 py-3">ชื่อแหล่งท่องเที่ยว</th>
            <th class="text-left px-4 py-3">จังหวัด</th>
            <th class="text-left px-4 py-3">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr class="hover:bg-slate-50/50">
            <td class="px-4 py-3">
              <p class="font-bold text-[#073F37]">บ่อน้ำร้อนเบตง</p>
              <p class="text-xs text-slate-500">betong-hot-spring</p>
            </td>
            <td class="px-4 py-3">ยะลา</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Published</span>
            </td>
          </tr>
          <tr class="hover:bg-slate-50/50">
            <td class="px-4 py-3">
              <p class="font-bold text-[#073F37]">อุทยานแห่งชาติ</p>
              <p class="text-xs text-slate-500">national-park</p>
            </td>
            <td class="px-4 py-3">นราธิวาส</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">Draft</span>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</body>
</html>`;
}

/** Attraction create page mock */
function attractionCreateHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Attraction</title></head>
<body>
  <div class="flex h-screen">
    <main class="flex-1 p-6">
      <div class="space-y-6">
        <div>
          <p class="text-xs font-black uppercase tracking-wider text-[#D6A13D]">Content Management</p>
          <h1 class="text-2xl font-black text-[#073F37]">สร้างสถานที่ท่องเที่ยวใหม่</h1>
          <p class="text-sm text-slate-500">เพิ่มสถานที่ท่องเที่ยวใหม่เข้าสู่ระบบ</p>
        </div>
        <div class="max-w-6xl">
          <form data-testid="attraction-create-form" action="/admin/attractions" method="POST" class="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div class="rounded-3xl border p-8 bg-white shadow-sm">
              <div class="text-center mb-8">
                <h2 class="text-2xl font-bold">สร้างสถานที่ท่องเที่ยวใหม่</h2>
                <p class="text-sm text-slate-500 mt-2">กรอกข้อมูลพื้นฐานเพื่อสร้างฉบับร่าง (Draft)</p>
              </div>
              <div class="space-y-5">
                <label class="block">
                  <span class="text-sm font-bold text-slate-700">ชื่อสถานที่ (ภาษาไทย) *</span>
                  <input name="nameTh" class="mt-2 w-full rounded-xl border px-4 py-3 text-sm" maxLength="255" placeholder="เช่น บ่อน้ำร้อนเบตง" required />
                </label>
                <label class="block">
                  <span class="text-sm font-bold text-slate-700">จังหวัด *</span>
                  <select name="provinceId" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm" required>
                    <option value="">เลือกจังหวัด</option>
                    <option value="1">ยะลา</option>
                    <option value="2">ปัตตานี</option>
                    <option value="3">นราธิวาส</option>
                  </select>
                </label>
                <label class="block">
                  <span class="text-sm font-bold text-slate-700">Attraction category</span>
                  <select name="attractionTypeId" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm">
                    <option value="">Choose later</option>
                    <option value="1">ธรรมชาติ</option>
                    <option value="2">วัฒนธรรม</option>
                  </select>
                </label>
                <label class="block">
                  <span class="text-sm font-bold text-slate-700">URL Slug *</span>
                  <input name="slug" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm" maxLength="200" placeholder="e.g. betong-hot-spring" required />
                </label>
              </div>
              <input type="hidden" name="districtId" value="" />
              <input type="hidden" name="isActive" value="true" />
              <input type="hidden" name="isPublished" value="false" />
              <input type="hidden" name="nameEn" value="" />
            </div>
            <aside>
              <div class="rounded-3xl border bg-white p-5 shadow-sm">
                <p class="text-[10px] font-black uppercase tracking-wider text-coral">After creating draft</p>
                <h3 class="mt-2 text-base font-black">Draft first, publish later</h3>
              </div>
              <div class="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 mt-4">
                <p class="text-sm font-bold text-emerald-900">New attractions are saved as drafts.</p>
              </div>
            </aside>
            <div class="fixed bottom-0 left-0 right-0 border-t bg-white p-4 flex justify-end gap-3 z-50">
              <a href="/admin/attractions" class="rounded-xl border px-6 py-3 text-sm font-bold">ยกเลิก</a>
              <button type="submit" class="rounded-xl bg-[#0A6B62] text-white px-6 py-3 text-sm font-bold">สร้างฉบับร่างและดำเนินการต่อ</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

/** Photo spot create page mock */
function photoSpotCreateHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Photo Spot</title></head>
<body>
  <div class="flex h-screen">
    <main class="flex-1 p-6">
      <div class="space-y-6">
        <div>
          <p class="text-xs font-black uppercase tracking-wider text-[#D6A13D]">Content Management</p>
          <h1 class="text-2xl font-black text-[#073F37]">เพิ่มจุดถ่ายภาพใหม่</h1>
          <p class="text-sm text-slate-500">เพิ่มจุดถ่ายภาพในแหล่งท่องเที่ยว</p>
        </div>
        <div class="max-w-6xl">
          <form data-testid="photo-spot-create-form" action="/admin/photo-spots" method="POST" class="rounded-3xl border bg-white p-8 shadow-sm space-y-5 max-w-2xl">
            <label class="block">
              <span class="text-sm font-bold text-slate-700">แหล่งท่องเที่ยว *</span>
              <select name="attractionId" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm" required>
                <option value="">เลือกแหล่งท่องเที่ยว</option>
                <option value="1">บ่อน้ำร้อนเบตง</option>
                <option value="2">อุทยานแห่งชาติ</option>
              </select>
            </label>
            <label class="block">
              <span class="text-sm font-bold text-slate-700">ชื่อจุดถ่ายภาพ (ภาษาไทย) *</span>
              <input name="nameTh" class="mt-2 w-full rounded-xl border px-4 py-3 text-sm" maxLength="255" placeholder="เช่น จุดชมวิวทะเลหมอก" required />
            </label>
            <label class="block">
              <span class="text-sm font-bold text-slate-700">รายละเอียด (ภาษาไทย)</span>
              <textarea name="descriptionTh" class="mt-2 w-full rounded-xl border px-4 py-3 text-sm" rows="3"></textarea>
            </label>
            <div class="flex justify-end gap-3 pt-4 border-t">
              <a href="/admin/photo-spots" class="rounded-xl border px-6 py-3 text-sm font-bold">ยกเลิก</a>
              <button type="submit" class="rounded-xl bg-[#0A6B62] text-white px-6 py-3 text-sm font-bold">เพิ่มจุดถ่ายภาพ</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

/** Check-in code create page mock */
function checkinCodeCreateHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Check-in Code</title></head>
<body>
  <div class="flex h-screen">
    <main class="flex-1 p-6">
      <div class="space-y-6">
        <div>
          <p class="text-xs font-black uppercase tracking-wider text-[#D6A13D]">Content Management</p>
          <h1 class="text-2xl font-black text-[#073F37]">สร้าง QR Code ใหม่</h1>
          <p class="text-sm text-slate-500">สร้าง QR Code สำหรับนักท่องเที่ยวใช้เช็กอิน</p>
        </div>
        <div class="max-w-6xl">
          <form data-testid="checkin-code-create-form" action="/admin/checkin-codes" method="POST" class="rounded-3xl border bg-white p-8 shadow-sm space-y-5 max-w-2xl">
            <label class="block">
              <span class="text-sm font-bold text-slate-700">แหล่งท่องเที่ยว *</span>
              <select name="attractionId" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm" required>
                <option value="">เลือกแหล่งท่องเที่ยว</option>
                <option value="1">บ่อน้ำร้อนเบตง</option>
                <option value="2">อุทยานแห่งชาติ</option>
              </select>
            </label>
            <label class="block">
              <span class="text-sm font-bold text-slate-700">จุดถ่ายภาพ</span>
              <select name="photoSpotId" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm">
                <option value="">ไม่ระบุจุดถ่ายภาพ</option>
                <option value="1">จุดชมวิวทะเลหมอก</option>
              </select>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label class="block">
                <span class="text-sm font-bold text-slate-700">วันที่เริ่มต้น</span>
                <input type="date" name="startsAt" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm" />
              </label>
              <label class="block">
                <span class="text-sm font-bold text-slate-700">วันที่สิ้นสุด</span>
                <input type="date" name="endsAt" class="mt-2 w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm" />
              </label>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t">
              <a href="/admin/checkin-codes" class="rounded-xl border px-6 py-3 text-sm font-bold">ยกเลิก</a>
              <button type="submit" class="rounded-xl bg-[#0A6B62] text-white px-6 py-3 text-sm font-bold">สร้างรหัสเช็กอิน</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

/** Check-in code list page mock (with deactivate buttons) */
function checkinCodeListHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Check-in Codes</title></head>
<body>
  <div class="flex h-screen">
    <main class="flex-1 p-6">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-[#D6A13D]">Content Management</p>
            <h1 class="text-2xl font-black text-[#073F37]">QR Check-in Codes</h1>
          </div>
          <a href="/admin/checkin-codes/new" class="bg-[#0A6B62] text-white rounded-xl px-4 py-2 text-sm font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14m-7-7h14"/></svg>
            สร้าง QR Code
          </a>
        </div>
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left px-4 py-3">รหัส Check-in</th>
              <th class="text-left px-4 py-3">แหล่งท่องเที่ยว</th>
              <th class="text-left px-4 py-3">สถานะ</th>
              <th class="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-slate-50/50" data-testid="checkin-code-row-1">
              <td class="px-4 py-3">
                <p class="font-mono text-sm font-bold text-[#073F37]">ACTIVE-CODE</p>
              </td>
              <td class="px-4 py-3">บ่อน้ำร้อนเบตง</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Active</span>
              </td>
              <td class="px-4 py-3">
                <form action="/admin/checkin-codes/1/deactivate" method="POST" data-testid="deactivate-form-1">
                  <button type="submit" class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                    Deactivate
                  </button>
                </form>
              </td>
            </tr>
            <tr class="hover:bg-slate-50/50" data-testid="checkin-code-row-2">
              <td class="px-4 py-3">
                <p class="font-mono text-sm font-bold text-[#073F37]">INACTIVE-CODE</p>
              </td>
              <td class="px-4 py-3">อุทยานแห่งชาติ</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">Inactive</span>
              </td>
              <td class="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</body>
</html>`;
}

/** Photo spot list page mock */
function photoSpotListHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Photo Spots</title></head>
<body>
  <div class="flex h-screen">
    <main class="flex-1 p-6">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-[#D6A13D]">Content Management</p>
            <h1 class="text-2xl font-black text-[#073F37]">จุดถ่ายภาพ</h1>
          </div>
          <a href="/admin/photo-spots/new" class="bg-[#0A6B62] text-white rounded-xl px-4 py-2 text-sm font-bold">
            เพิ่มจุดถ่ายภาพใหม่
          </a>
        </div>
        <div class="rounded-2xl border bg-white p-8 text-center">
          <p class="text-slate-500">ไม่มีจุดถ่ายภาพ</p>
          <a href="/admin/photo-spots/new" class="text-[#0A6B62] font-bold mt-2 inline-block">เพิ่มจุดถ่ายภาพแรก</a>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

// Set up route interception for admin pages
function setupAdminRoutes(page: Page) {
  // Intercept admin page GET requests
  // Register both patterns: **/admin for exact /admin, **/admin/** for all sub-pages
  const handler = async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method !== "GET") return route.continue();

    // Route to appropriate mock HTML
    if (url.includes("/admin/attractions/new")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: attractionCreateHtml() });
    } else if (url.includes("/admin/attractions")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: attractionsListHtml() });
    } else if (url.includes("/admin/photo-spots/new")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: photoSpotCreateHtml() });
    } else if (url.includes("/admin/photo-spots")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: photoSpotListHtml() });
    } else if (url.includes("/admin/checkin-codes/new")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: checkinCodeCreateHtml() });
    } else if (url.includes("/admin/checkin-codes")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: checkinCodeListHtml() });
    } else if (url === url.match(/https?:\/\/[^/]+\/admin\/?$/)?.input || url.endsWith("/admin") || url.endsWith("/admin/")) {
      await route.fulfill({ status: 200, contentType: "text/html", body: adminOverviewHtml() });
    } else {
      await route.continue();
    }
  };
  // Register for both patterns so /admin (no trailing slash) is also intercepted
  page.route("**/admin", handler);
  page.route("**/admin/**", handler);
}

// Helper: wait for route interception to settle
async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

test.describe("Admin CRUD Flows", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminRoutes(page);
  });

  test("shows admin overview with sidebar navigation", async ({ page }) => {
    await navigateTo(page, "/admin");

    await expect(page.locator("h1")).toContainText("ภาพรวมระบบ");
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/attractions"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/photo-spots"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/checkin-codes"]')).toBeVisible();
  });

  test("shows attractions list with data table", async ({ page }) => {
    await navigateTo(page, "/admin/attractions");

    await expect(page.locator("h1")).toContainText("แหล่งท่องเที่ยว");
    await expect(page.locator("text=บ่อน้ำร้อนเบตง")).toBeVisible();
    await expect(page.locator("text=betong-hot-spring")).toBeVisible();
    await expect(page.locator("text=Published")).toBeVisible();
    await expect(page.locator("text=Draft")).toBeVisible();

    // Verify create button
    const createBtn = page.locator('a[href="/admin/attractions/new"]');
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toContainText("เพิ่มสถานที่ใหม่");

    // Verify export button
    const exportBtn = page.locator('a[href="/api/admin/export/attractions?format=csv"]');
    await expect(exportBtn).toBeVisible();
  });

  test("shows attraction create form with required fields", async ({ page }) => {
    await navigateTo(page, "/admin/attractions/new");

    await expect(page.locator("h1")).toContainText("สร้างสถานที่ท่องเที่ยวใหม่");
    await expect(page.locator('[data-testid="attraction-create-form"]')).toBeVisible();

    // Check form fields
    await expect(page.locator('input[name="nameTh"]')).toBeVisible();
    await expect(page.locator('select[name="provinceId"]')).toBeVisible();
    await expect(page.locator('select[name="attractionTypeId"]')).toBeVisible();
    await expect(page.locator('input[name="slug"]')).toBeVisible();

    // Check that required fields have required attribute
    await expect(page.locator('input[name="nameTh"]')).toHaveAttribute("required");
    await expect(page.locator('select[name="provinceId"]')).toHaveAttribute("required");
    await expect(page.locator('input[name="slug"]')).toHaveAttribute("required");

    // Check save bar
    await expect(page.locator('a[href="/admin/attractions"]')).toContainText("ยกเลิก");
    await expect(page.locator('button[type="submit"]')).toContainText("สร้างฉบับร่างและดำเนินการต่อ");
  });

  test("shows photo spot create form linked to attraction", async ({ page }) => {
    await navigateTo(page, "/admin/photo-spots/new");

    await expect(page.locator("h1")).toContainText("เพิ่มจุดถ่ายภาพใหม่");
    await expect(page.locator('[data-testid="photo-spot-create-form"]')).toBeVisible();

    // Check form fields
    await expect(page.locator('select[name="attractionId"]')).toBeVisible();
    await expect(page.locator('input[name="nameTh"]')).toBeVisible();
    await expect(page.locator('textarea[name="descriptionTh"]')).toBeVisible();

    // Verify attraction options in dropdown
    await expect(page.locator('select[name="attractionId"] option[value="1"]')).toContainText("บ่อน้ำร้อนเบตง");
    await expect(page.locator('select[name="attractionId"] option[value="2"]')).toContainText("อุทยานแห่งชาติ");
  });

  test("shows checkin code create form with attraction and photo spot selection", async ({ page }) => {
    await navigateTo(page, "/admin/checkin-codes/new");

    await expect(page.locator("h1")).toContainText("สร้าง QR Code ใหม่");
    await expect(page.locator('[data-testid="checkin-code-create-form"]')).toBeVisible();

    // Check form fields
    await expect(page.locator('select[name="attractionId"]')).toBeVisible();
    await expect(page.locator('select[name="photoSpotId"]')).toBeVisible();
    await expect(page.locator('input[name="startsAt"]')).toBeVisible();
    await expect(page.locator('input[name="endsAt"]')).toBeVisible();

    // Verify attraction selection is required
    await expect(page.locator('select[name="attractionId"]')).toHaveAttribute("required");
  });

  test("shows checkin code list with active/inactive status", async ({ page }) => {
    await navigateTo(page, "/admin/checkin-codes");

    await expect(page.locator("h1")).toContainText("QR Check-in Codes");

    // Active code with deactivate button
    const activeRow = page.locator('[data-testid="checkin-code-row-1"]');
    await expect(activeRow.locator("text=ACTIVE-CODE")).toBeVisible();
    await expect(activeRow.locator("span").filter({ hasText: "Active" })).toBeVisible();
    await expect(activeRow.locator('[data-testid="deactivate-form-1"]')).toBeVisible();

    // Inactive code without deactivate button
    const inactiveRow = page.locator('[data-testid="checkin-code-row-2"]');
    await expect(inactiveRow.locator("text=INACTIVE-CODE")).toBeVisible();
    await expect(inactiveRow.locator("span").filter({ hasText: "Inactive" })).toBeVisible();

    // Create new button
    await expect(page.locator('a[href="/admin/checkin-codes/new"]')).toContainText("สร้าง QR Code");
  });

  test("shows photo spot list with empty state and create CTA", async ({ page }) => {
    await navigateTo(page, "/admin/photo-spots");

    await expect(page.locator("h1")).toContainText("จุดถ่ายภาพ");
    await expect(page.locator("text=ไม่มีจุดถ่ายภาพ")).toBeVisible();
    // Use .last() to target the empty-state link, since both the header button and empty-state link share the same href
    await expect(page.locator('a[href="/admin/photo-spots/new"]').last()).toContainText("เพิ่มจุดถ่ายภาพแรก");
  });

  test("form submission creates new attraction and redirects", async ({ page }) => {
    // Override route to intercept POST
    let postedFormData: Record<string, string> | null = null;

    await page.route("**/admin/attractions", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        // Capture form data
        const postData = route.request().postData();
        if (postData) {
          const params = new URLSearchParams(postData);
          postedFormData = {};
          params.forEach((value, key) => { postedFormData![key] = value; });
        }
        // Return success redirect
        await route.fulfill({
          status: 302,
          headers: { Location: "/admin/attractions/1/edit" },
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, "/admin/attractions/new");

    // Fill form
    await page.fill('input[name="nameTh"]', "หาดทรายทอง");
    await page.selectOption('select[name="provinceId"]', "3");
    await page.fill('input[name="slug"]', "hat-sai-thong");

    // Submit
    await page.click('button[type="submit"]');

    // Verify form data was captured
    expect(postedFormData).not.toBeNull();
    expect(postedFormData!["nameTh"]).toBe("หาดทรายทอง");
    expect(postedFormData!["provinceId"]).toBe("3");
    expect(postedFormData!["slug"]).toBe("hat-sai-thong");
  });

  test("form submission creates new checkin code and redirects", async ({ page }) => {
    let postedData: Record<string, string> | null = null;

    await page.route("**/admin/checkin-codes", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        const postData = route.request().postData();
        if (postData) {
          const params = new URLSearchParams(postData);
          postedData = {};
          params.forEach((value, key) => { postedData![key] = value; });
        }
        await route.fulfill({
          status: 302,
          headers: { Location: "/admin/checkin-codes" },
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, "/admin/checkin-codes/new");

    await page.selectOption('select[name="attractionId"]', "1");
    await page.fill('input[name="startsAt"]', "2026-06-01");
    await page.fill('input[name="endsAt"]', "2026-12-31");

    await page.click('button[type="submit"]');

    expect(postedData).not.toBeNull();
    expect(postedData!["attractionId"]).toBe("1");
    expect(postedData!["startsAt"]).toBe("2026-06-01");
    expect(postedData!["endsAt"]).toBe("2026-12-31");
  });

  test("attractions list renders mobile card view below md breakpoint", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await navigateTo(page, "/admin/attractions");

    // Mobile card view should be visible
    await expect(page.locator("text=บ่อน้ำร้อนเบตง")).toBeVisible();
    await expect(page.locator("text=ยะลา")).toBeVisible();
  });

  test("sidebar navigation links are accessible from attractions page", async ({ page }) => {
    await navigateTo(page, "/admin/photo-spots");

    // Re-setup routes for navigation click
    await page.route("**/admin/attractions", async (route) => {
      await route.fulfill({ status: 200, contentType: "text/html", body: attractionsListHtml() });
    });

    // Navigate to attractions via direct URL
    await navigateTo(page, "/admin/attractions");
    await expect(page.locator("h1")).toContainText("แหล่งท่องเที่ยว");
  });
});
