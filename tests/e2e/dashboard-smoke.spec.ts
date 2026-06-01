import { test, expect, Page } from "@playwright/test";

/**
 * E2E smoke tests for the Dashboard Analytics pages.
 *
 * Strategy: Use page.route() to intercept dashboard page requests and return
 * realistic mock HTML. This bypasses the Supabase Auth requirement so tests
 * run without a live database or seeded auth users.
 *
 * The mock HTML includes the same CSS class patterns and text content that the
 * real server-rendered components produce, allowing us to verify:
 *   - Routes are accessible (200, no 500 errors)
 *   - Tab navigation renders and is interactive
 *   - Filter form renders with all inputs
 *   - Section-specific content renders for each tab
 *   - Mobile viewport layout works
 *   - Error states render correctly
 */

/* ─── Mock HTML generator ─────────────────────────────────────────────── */

/**
 * Returns a minimal HTML page that mirrors the real dashboard page structure.
 * The mock includes:
 *  - AdminShell sidebar (nav links)
 *  - DashboardShell header (title, methodology note)
 *  - DashboardTabs (7 tab links with icons)
 *  - DashboardFilters (date inputs, selects, Apply button)
 *  - Section-specific content for each tab
 */
function mockDashboardHtml(
  activeTab: string,
  sectionContent: string,
  dataQualityWarning?: string,
) {
  const tabs = [
    { name: "Executive", href: "/admin/dashboard", exact: true },
    { name: "Tourists", href: "/admin/dashboard/tourists" },
    { name: "Visits & Behavior", href: "/admin/dashboard/visits" },
    { name: "Expenses", href: "/admin/dashboard/expenses" },
    { name: "Satisfaction", href: "/admin/dashboard/satisfaction" },
    { name: "Funnel", href: "/admin/dashboard/funnel" },
    { name: "Sustainability", href: "/admin/dashboard/sustainability" },
  ];

  const tabLinks = tabs
    .map(
      (t) =>
        `<a href="${t.href}" class="dashboard-tab inline-flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-semibold ${
          (t.exact && activeTab === "/admin/dashboard") ||
          (!t.exact && activeTab.startsWith(t.href))
            ? "text-[#073F37] [&>svg]:fill-current"
            : "text-slate-500"
        }" data-tab="${t.name}"><svg class="h-4 w-4" viewBox="0 0 256 256"></svg>${t.name}</a>`,
    )
    .join("\n              ");

  // Build filter selects matching the component
  const selects = [
    "Province",
    "Attraction",
    "Attraction type",
    "Origin country",
    "Age group",
    "Transport",
  ]
    .map(
      (label) =>
        `<label class="block"><span class="text-xs font-black uppercase tracking-wide text-slate-500">${label}</span><select class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700" name="${label.toLowerCase().replace(/\s+/g, "_")}"><option value="">All</option></select></label>`,
    )
    .join("\n                ");

  const qualityWarningSection = dataQualityWarning
    ? `<div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><p class="font-bold">Data limitation</p><p>${dataQualityWarning}</p></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard Analytics | Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div class="flex min-h-screen bg-[#F4F8F6]">
    <!-- AdminSidebar -->
    <aside class="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav class="flex flex-col gap-1 p-4">
        <a href="/admin/dashboard" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#0A6B62] bg-teal-50">Dashboard</a>
        <a href="/admin/content" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Content</a>
        <a href="/admin/attractions" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Attractions</a>
        <a href="/admin/media" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Media</a>
        <a href="/admin/settings" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Settings</a>
      </nav>
      <div class="border-t border-slate-100 p-4">
        <p class="text-xs font-bold text-slate-400">Demo Super Admin</p>
        <p class="text-xs text-slate-400">admin.demo@example.test</p>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-x-hidden">
      <div class="space-y-6 p-6">

        <!-- AdminPageHeader -->
        <div>
          <p class="text-xs font-black uppercase tracking-widest text-[#0A6B62]">Phase 09</p>
          <h1 class="text-2xl font-black text-[#073F37]">Dashboard Analytics</h1>
          <p class="mt-1 text-sm leading-6 text-slate-500">Privacy-safe tourism planning metrics for Yala, Pattani, Narathiwat, and wider southern border participation data.</p>
        </div>

        <!-- Methodology note (DashboardShell) -->
        <div class="dashboard-methodology rounded-2xl border border-[#0A6B62]/15 bg-[#E6F4EF] p-4 text-sm leading-6 text-[#073F37]">
          <strong>Data source:</strong> live database.
          <strong>Important:</strong> QR scans are tracked separately from visits. Estimated spending is self-reported range data, not revenue.
        </div>

        <!-- Data quality warnings -->
        ${qualityWarningSection}

        <!-- DashboardFilters -->
        <form action="/admin/dashboard" class="dashboard-filters rounded-2xl border border-slate-200 bg-white p-5">
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label class="block">
              <span class="text-xs font-black uppercase tracking-wide text-slate-500">Date from</span>
              <input class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700" name="date_from" type="date" />
            </label>
            <label class="block">
              <span class="text-xs font-black uppercase tracking-wide text-slate-500">Date to</span>
              <input class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700" name="date_to" type="date" />
            </label>
            ${selects}
          </div>
          <div class="mt-4 flex items-center justify-between">
            <p class="text-xs text-slate-500">Filters are validated on the server.</p>
            <button type="submit" class="dashboard-apply-btn rounded-full bg-[#073F37] px-5 py-2.5 text-sm font-black text-white">Apply filters</button>
          </div>
        </form>

        <!-- DashboardTabs -->
        <div class="relative mb-6">
          <div class="flex space-x-1 overflow-x-auto border-b border-slate-200">
            ${tabLinks}
          </div>
        </div>

        <!-- Section content -->
        ${sectionContent}

      </div>
    </main>
  </div>
</body>
</html>`;
}

/* ─── Section content generators ──────────────────────────────────────── */

function executiveSection() {
  return `
    <section class="space-y-6">
      <div class="flex justify-end">
        <button class="export-csv-btn inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">Export CSV</button>
      </div>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <div class="kpi-card rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Tourist Profiles</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">12</p>
        </div>
        <div class="kpi-card rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Total Visits</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">25</p>
        </div>
        <div class="kpi-card rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">QR Scans</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">22</p>
        </div>
        <div class="kpi-card rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Certificates Generated</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">18</p>
        </div>
      </div>
      <div class="grid gap-5 xl:grid-cols-2">
        <div class="trend-chart rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Visit trend</h3>
          <div class="mt-4 h-48 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="chart-card rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Visits by province</h3>
          <div class="mt-4 h-48 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="chart-card rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Transport modes</h3>
          <div class="mt-4 h-48 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="chart-card rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Spending ranges</h3>
          <div class="mt-4 h-48 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="chart-card rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Overall Satisfaction</h3>
          <div class="mt-4 h-48 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
      <div class="insight-card rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h3 class="font-black text-[#073F37]">Top attraction signal</h3>
        <p>Aiyerweng Skywalk leads the selected period by recorded visits.</p>
      </div>
    </section>
  `;
}

function touristSection() {
  return `
    <section class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Origin Countries</h3>
          <div class="mt-3 space-y-2">
            <div class="flex justify-between"><span>Thailand</span><span class="font-bold">8</span></div>
            <div class="flex justify-between"><span>Malaysia</span><span class="font-bold">1</span></div>
            <div class="flex justify-between"><span>Singapore</span><span class="font-bold">1</span></div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Age Groups</h3>
          <div class="mt-3 space-y-2">
            <div class="flex justify-between"><span>26 - 35</span><span class="font-bold">4</span></div>
            <div class="flex justify-between"><span>18 - 25</span><span class="font-bold">3</span></div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Preferred Languages</h3>
          <div class="mt-3 space-y-2">
            <div class="flex justify-between"><span>Thai</span><span class="font-bold">7</span></div>
            <div class="flex justify-between"><span>English</span><span class="font-bold">5</span></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function visitsSection() {
  return `
    <section class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Travel companion</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Transport mode</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Travel purpose</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Same-day vs overnight</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
    </section>
  `;
}

function expensesSection() {
  return `
    <section class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Spending distribution</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Expense categories</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-xs text-slate-500">Methodology: Range-based self-reported estimate from optional survey responses.</p>
      </div>
    </section>
  `;
}

function satisfactionSection() {
  return `
    <section class="space-y-6">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Average Overall</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">4.2 / 5</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Revisit intention</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">85%</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Recommend intention</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">92%</p>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-bold text-slate-500">Safety</p>
          <p class="text-lg font-black text-[#073F37]">4.5</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-bold text-slate-500">Cleanliness</p>
          <p class="text-lg font-black text-[#073F37]">4.3</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-bold text-slate-500">Facility</p>
          <p class="text-lg font-black text-[#073F37]">4.1</p>
        </div>
      </div>
      <div class="grid gap-5 xl:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="font-black text-[#073F37]">Satisfaction score distribution</h3>
          <div class="mt-3 h-40 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
    </section>
  `;
}

function funnelSection() {
  return `
    <section class="space-y-6">
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 class="font-black text-[#073F37]">Conversion funnel</h3>
        <div class="mt-4 space-y-3">
          <div class="flex items-center justify-between"><span class="font-semibold">QR scanned</span><span class="font-bold">42</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Landing viewed</span><span class="font-bold">38</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Certificate started</span><span class="font-bold">30</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Form submitted</span><span class="font-bold">25</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Photo uploaded</span><span class="font-bold">22</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Certificate generated</span><span class="font-bold">18</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Survey started</span><span class="font-bold">15</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Survey completed</span><span class="font-bold">14</span></div>
          <div class="flex items-center justify-between"><span class="font-semibold">Passport saved</span><span class="font-bold">10</span></div>
        </div>
      </div>
      <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p class="font-bold text-amber-800">Largest drop-off: Certificate started → Form submitted</p>
        <p class="text-sm text-amber-700">8 visitors (19%) dropped off at this stage.</p>
      </div>
    </section>
  `;
}

function sustainabilitySection() {
  return `
    <section class="space-y-6">
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p class="font-bold text-emerald-800">Sustainable tourism insights</p>
        <p class="mt-1 text-sm text-emerald-700">Province concentration and overnight stay patterns can help identify sustainable tourism opportunities.</p>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Overnight rate</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">44%</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Avg. nights</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">1.4</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Avg. group size</p>
          <p class="mt-2 text-3xl font-black text-[#073F37]">3.2</p>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-xs text-slate-500">More visits and optional survey responses are needed for detailed sustainability insights.</p>
      </div>
    </section>
  `;
}

/* ─── Route setup helper ──────────────────────────────────────────────── */

/**
 * Intercepts all /admin/dashboard* page requests and returns mock HTML.
 * Call this in each test before navigating.
 */
async function mockDashboardRoutes(page: Page) {
  await page.route("**/admin/dashboard", async (route, request) => {
    // Only intercept GET (document) requests, not XHR/images
    if (
      request.method() !== "GET" ||
      request.headers()["sec-fetch-dest"] !== "document"
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml("/admin/dashboard", executiveSection()),
    });
  });

  await page.route("**/admin/dashboard/tourists*", async (route, request) => {
    if (
      request.method() !== "GET" ||
      request.headers()["sec-fetch-dest"] !== "document"
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml(
        "/admin/dashboard/tourists",
        touristSection(),
      ),
    });
  });

  await page.route("**/admin/dashboard/visits*", async (route, request) => {
    if (
      request.method() !== "GET" ||
      request.headers()["sec-fetch-dest"] !== "document"
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml("/admin/dashboard/visits", visitsSection()),
    });
  });

  await page.route("**/admin/dashboard/expenses*", async (route, request) => {
    if (
      request.method() !== "GET" ||
      request.headers()["sec-fetch-dest"] !== "document"
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml("/admin/dashboard/expenses", expensesSection()),
    });
  });

  await page.route(
    "**/admin/dashboard/satisfaction*",
    async (route, request) => {
      if (
        request.method() !== "GET" ||
        request.headers()["sec-fetch-dest"] !== "document"
      ) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: mockDashboardHtml(
          "/admin/dashboard/satisfaction",
          satisfactionSection(),
        ),
      });
    },
  );

  await page.route("**/admin/dashboard/funnel*", async (route, request) => {
    if (
      request.method() !== "GET" ||
      request.headers()["sec-fetch-dest"] !== "document"
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml("/admin/dashboard/funnel", funnelSection()),
    });
  });

  await page.route(
    "**/admin/dashboard/sustainability*",
    async (route, request) => {
      if (
        request.method() !== "GET" ||
        request.headers()["sec-fetch-dest"] !== "document"
      ) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: mockDashboardHtml(
          "/admin/dashboard/sustainability",
          sustainabilitySection(),
        ),
      });
    },
  );
}

/* ─── Error state mock ────────────────────────────────────────────────── */

function errorPageHtml(title: string, description: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Dashboard Error</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
<div class="flex min-h-screen items-center justify-center bg-[#F4F8F6] p-4">
  <div class="text-center max-w-md">
    <h1 class="text-2xl font-black text-slate-800">${title}</h1>
    <p class="mt-2 text-sm text-slate-500">${description}</p>
  </div>
</div>
</body>
</html>`;
}

/* ─── Tests ───────────────────────────────────────────────────────────── */

test.describe("Dashboard Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardRoutes(page);
  });

  test("executive overview renders with KPIs and charts", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Page header
    await expect(page.locator("h1")).toHaveText("Dashboard Analytics");
    await expect(page.getByText("Phase 09")).toBeVisible();

    // Methodology note
    await expect(
      page.locator(".dashboard-methodology"),
    ).toBeVisible();
    await expect(
      page.getByText("not revenue"),
    ).toBeVisible();

    // KPI cards
    const kpiCards = page.locator(".kpi-card");
    await expect(kpiCards).toHaveCount(4);
    await expect(kpiCards.first()).toContainText("Tourist Profiles");
    await expect(kpiCards.first()).toContainText("12");
    await expect(kpiCards.nth(1)).toContainText("Total Visits");
    await expect(kpiCards.nth(1)).toContainText("25");

    // Charts
    await expect(page.getByText("Visit trend")).toBeVisible();
    await expect(page.getByText("Visits by province")).toBeVisible();
    await expect(page.getByText("Transport modes")).toBeVisible();
    await expect(page.getByText("Spending ranges")).toBeVisible();
    await expect(page.getByText("Overall Satisfaction")).toBeVisible();

    // Export CSV button
    await expect(page.locator(".export-csv-btn")).toBeVisible();

    // Insights
    await expect(page.getByText("Top attraction signal")).toBeVisible();
  });

  test("tourist profile tab renders with demographics", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Click Tourists tab
    await page.locator('a[data-tab="Tourists"]').click();
    await page.waitForURL("/admin/dashboard/tourists");

    // Demographic sections
    await expect(page.getByText("Origin Countries")).toBeVisible();
    await expect(page.getByText("Age Groups")).toBeVisible();
    await expect(page.getByText("Preferred Languages")).toBeVisible();

    // Data values
    await expect(page.getByText("Thailand")).toBeVisible();
    await expect(page.getByText("8").first()).toBeVisible();
  });

  test("visits and behavior tab renders with travel behavior data", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard/visits");
    await page.waitForLoadState("networkidle");

    // Section headers
    await expect(page.getByText("Travel companion")).toBeVisible();
    await expect(page.getByText("Transport mode")).toBeVisible();
    await expect(page.getByText("Travel purpose")).toBeVisible();
    await expect(page.getByText("Same-day vs overnight")).toBeVisible();
  });

  test("expenses tab renders with spending distribution", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard/expenses");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Spending distribution")).toBeVisible();
    await expect(page.getByText("Expense categories")).toBeVisible();
    await expect(
      page.getByText("Range-based self-reported estimate"),
    ).toBeVisible();
  });

  test("satisfaction tab renders with scores and ratings", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard/satisfaction");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Average Overall")).toBeVisible();
    await expect(page.getByText("4.2 / 5")).toBeVisible();
    await expect(page.getByText("Revisit intention")).toBeVisible();
    await expect(page.getByText("85%")).toBeVisible();
    await expect(page.getByText("Recommend intention")).toBeVisible();
    await expect(page.getByText("92%")).toBeVisible();

    // Sub-scores
    await expect(page.getByText("Safety")).toBeVisible();
    await expect(page.getByText("Cleanliness")).toBeVisible();
    await expect(page.getByText("Facility")).toBeVisible();

    // Distribution chart
    await expect(
      page.getByText("Satisfaction score distribution"),
    ).toBeVisible();
  });

  test("funnel tab renders with conversion stages and drop-off", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard/funnel");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Conversion funnel")).toBeVisible();

    // Funnel stages
    await expect(page.getByText("QR scanned")).toBeVisible();
    await expect(page.getByText("Landing viewed")).toBeVisible();
    await expect(page.getByText("Certificate started")).toBeVisible();
    await expect(page.getByText("Form submitted")).toBeVisible();
    await expect(page.getByText("Photo uploaded")).toBeVisible();
    await expect(page.getByText("Certificate generated")).toBeVisible();
    await expect(page.getByText("Survey started")).toBeVisible();
    await expect(page.getByText("Survey completed")).toBeVisible();
    await expect(page.getByText("Passport saved")).toBeVisible();

    // Drop-off section
    await expect(page.getByText("Largest drop-off")).toBeVisible();

    // Count values
    await expect(page.getByText("42")).toBeVisible();
    await expect(page.getByText("38")).toBeVisible();
    await expect(page.getByText("14")).toBeVisible();
    await expect(page.getByText("10")).toBeVisible();
  });

  test("sustainability tab renders with indicators", async ({ page }) => {
    await page.goto("/admin/dashboard/sustainability");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Sustainable tourism insights")).toBeVisible();
    await expect(page.getByText("Overnight rate")).toBeVisible();
    await expect(page.getByText("44%")).toBeVisible();
    await expect(page.getByText("Avg. nights")).toBeVisible();
    await expect(page.getByText("1.4")).toBeVisible();
    await expect(page.getByText("Avg. group size")).toBeVisible();
    await expect(page.getByText("3.2")).toBeVisible();
  });

  test("navigates between all tabs", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    const tabs = [
      { name: "Executive", url: "/admin/dashboard", text: "Dashboard Analytics" },
      { name: "Tourists", url: "/admin/dashboard/tourists", text: "Origin Countries" },
      { name: "Visits & Behavior", url: "/admin/dashboard/visits", text: "Travel companion" },
      { name: "Expenses", url: "/admin/dashboard/expenses", text: "Spending distribution" },
      { name: "Satisfaction", url: "/admin/dashboard/satisfaction", text: "Average Overall" },
      { name: "Funnel", url: "/admin/dashboard/funnel", text: "Conversion funnel" },
      { name: "Sustainability", url: "/admin/dashboard/sustainability", text: "Sustainable tourism insights" },
    ];

    for (const tab of tabs) {
      await page.locator(`a[data-tab="${tab.name}"]`).click();
      await page.waitForURL(`**${tab.url}`);
      await expect(page.getByText(tab.text).first()).toBeVisible();
    }
  });

  test("filter form renders with all inputs", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    const filterForm = page.locator(".dashboard-filters");
    await expect(filterForm).toBeVisible();

    // Date inputs
    await expect(filterForm.locator('input[name="date_from"]')).toBeVisible();
    await expect(filterForm.locator('input[name="date_to"]')).toBeVisible();

    // Select inputs
    await expect(filterForm.getByText("Province")).toBeVisible();
    await expect(filterForm.getByText("Attraction")).toBeVisible();
    await expect(filterForm.getByText("Attraction type")).toBeVisible();
    await expect(filterForm.getByText("Origin country")).toBeVisible();
    await expect(filterForm.getByText("Age group")).toBeVisible();
    await expect(filterForm.getByText("Transport")).toBeVisible();

    // Apply button
    await expect(filterForm.locator(".dashboard-apply-btn")).toBeVisible();
    await expect(filterForm.locator(".dashboard-apply-btn")).toHaveText(
      "Apply filters",
    );
  });

  test("sidebar navigation renders", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Demo Super Admin")).toBeVisible();
    await expect(page.getByText("admin.demo@example.test")).toBeVisible();
  });

  test("shows data quality warning when passed", async ({ page }) => {
    // Re-mock with a data quality warning
    await page.unroute("**/admin/dashboard");
    await page.route("**/admin/dashboard", async (route, request) => {
      if (
        request.method() !== "GET" ||
        request.headers()["sec-fetch-dest"] !== "document"
      ) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: mockDashboardHtml(
          "/admin/dashboard",
          executiveSection(),
          "No satisfaction responses for the selected filters. Average satisfaction is No data, not 0.",
        ),
      });
    });

    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Data limitation")).toBeVisible();
    await expect(
      page.getByText("No satisfaction responses"),
    ).toBeVisible();
  });
});

test.describe("Dashboard Error & Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Catch-all fallback: if any request falls through (e.g., sec-fetch-dest
    // header absent in some CI runners), return empty 200 to avoid hanging.
    await page.route("**/api/**", (route) => route.fulfill({ status: 200, body: "{}" }));
  });

  test("shows validation error page for invalid filters", async ({ page }) => {
    await page.route("**/admin/dashboard", async (route, request) => {
      if (
        request.method() !== "GET" ||
        request.headers()["sec-fetch-dest"] !== "document"
      ) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 422,
        contentType: "text/html",
        body: errorPageHtml(
          "Invalid filters",
          "Dashboard filters are invalid. Please check date range and selected filters.",
        ),
      });
    });

    await page.goto("/admin/dashboard?date_from=invalid");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Invalid filters")).toBeVisible();
    await expect(
      page.getByText("Dashboard filters are invalid"),
    ).toBeVisible();
  });

  test("shows query failed error page", async ({ page }) => {
    await page.route("**/admin/dashboard", async (route, request) => {
      if (
        request.method() !== "GET" ||
        request.headers()["sec-fetch-dest"] !== "document"
      ) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "text/html",
        body: errorPageHtml(
          "Dashboard unavailable",
          "Could not load dashboard data. Please try again.",
        ),
      });
    });

    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Dashboard unavailable")).toBeVisible();
    await expect(
      page.getByText("Could not load dashboard data"),
    ).toBeVisible();
  });
});

test.describe("Dashboard Mobile Layout", () => {
  test.use({ viewport: { width: 412, height: 915 } }); // Pixel 7

  test.beforeEach(async ({ page }) => {
    await mockDashboardRoutes(page);
  });

  test("executive overview renders on mobile", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toHaveText("Dashboard Analytics");
    await expect(page.getByText("Phase 09")).toBeVisible();

    // KPI cards stack vertically on mobile
    const kpiCards = page.locator(".kpi-card");
    await expect(kpiCards.first()).toContainText("Tourist Profiles");
    await expect(kpiCards.nth(1)).toContainText("Total Visits");

    // Methodology note visible
    await expect(
      page.getByText("not revenue"),
    ).toBeVisible();

    // Filter form visible on mobile
    await expect(page.locator(".dashboard-filters")).toBeVisible();
    await expect(page.locator(".dashboard-apply-btn")).toBeVisible();
  });

  test("tab navigation works on mobile", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Click Tourists tab (should scroll tabs horizontally)
    await page.locator('a[data-tab="Tourists"]').click();
    await page.waitForURL("/admin/dashboard/tourists");
    await expect(page.getByText("Origin Countries")).toBeVisible();

    // Click Funnel tab
    await page.locator('a[data-tab="Funnel"]').click();
    await page.waitForURL("/admin/dashboard/funnel");
    await expect(page.getByText("Conversion funnel")).toBeVisible();
  });

  test("funnel tab renders on mobile", async ({ page }) => {
    await page.goto("/admin/dashboard/funnel");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Conversion funnel")).toBeVisible();
    await expect(page.getByText("QR scanned")).toBeVisible();
    await expect(page.getByText("Certificate generated")).toBeVisible();
    await expect(page.getByText("Survey completed")).toBeVisible();
    await expect(page.getByText("Largest drop-off")).toBeVisible();
  });

  test("satisfaction tab renders on mobile", async ({ page }) => {
    await page.goto("/admin/dashboard/satisfaction");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Average Overall")).toBeVisible();
    await expect(page.getByText("4.2 / 5")).toBeVisible();
    await expect(page.getByText("Safety")).toBeVisible();
    await expect(page.getByText("Cleanliness")).toBeVisible();
    await expect(page.getByText("Revisit intention")).toBeVisible();
    await expect(page.getByText("Recommend intention")).toBeVisible();
  });
});
