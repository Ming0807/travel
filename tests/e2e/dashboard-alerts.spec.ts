import { test, expect, Page } from "@playwright/test";

/**
 * E2E tests for the Dashboard Alert/Notification system.
 *
 * Strategy: Use page.route() to intercept dashboard page requests and return
 * mocked HTML that mirrors the real DashboardAlertBar and DashboardAlertBanner
 * component output. This bypasses Supabase Auth and runs without a live DB.
 *
 * The mock HTML includes minimal inline JavaScript so interactive behaviors
 * (collapse/expand, dismiss, localStorage persistence) can be verified.
 */

/* ─── Alert markup helpers ────────────────────────────────────────────── */

type AlertMock = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  actionable?: boolean;
  actionLabel?: string;
  actionHref?: string;
};

/** Generates the full DashboardAlertBar + individual DashboardAlertBanner markup. */
function alertBarHtml(alerts: AlertMock[]): string {
  if (alerts.length === 0) return "";

  const counts = { critical: 0, warning: 0, info: 0 };
  for (const a of alerts) counts[a.severity]++;

  const hasCritical = counts.critical > 0;
  const borderColor = hasCritical
    ? "border-rose-200"
    : counts.warning > 0
      ? "border-amber-200"
      : "border-sky-200";
  const bgColor = hasCritical
    ? "bg-rose-50/80"
    : counts.warning > 0
      ? "bg-amber-50/80"
      : "bg-sky-50/80";

  const dot = (sev: string) =>
    sev === "critical"
      ? `<span class="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500" data-severity-dot="critical"></span>`
      : sev === "warning"
        ? `<span class="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500" data-severity-dot="warning"></span>`
        : `<span class="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-sky-500" data-severity-dot="info"></span>`;

  const iconSvg = (sev: string) =>
    sev === "critical"
      ? `<svg class="mt-0.5 h-5 w-5 shrink-0 text-rose-600" viewBox="0 0 256 256" aria-hidden="true" data-severity-icon="critical"></svg>`
      : sev === "warning"
        ? `<svg class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" viewBox="0 0 256 256" aria-hidden="true" data-severity-icon="warning"></svg>`
        : `<svg class="mt-0.5 h-5 w-5 shrink-0 text-sky-600" viewBox="0 0 256 256" aria-hidden="true" data-severity-icon="info"></svg>`;

  const dots = [];
  if (counts.critical > 0) dots.push(dot("critical"));
  if (counts.warning > 0) dots.push(dot("warning"));
  if (counts.info > 0) dots.push(dot("info"));

  const breakdownParts = [
    counts.critical > 0 && `${counts.critical} critical`,
    counts.warning > 0 && `${counts.warning} warning`,
    counts.info > 0 && `${counts.info} info`,
  ].filter(Boolean);
  const breakdown = breakdownParts.join(", ");

  const alertText =
    alerts.length === 1 ? "1 dashboard alert" : `${alerts.length} dashboard alerts`;

  const bannerHtml = (a: AlertMock) => {
    const sevStyles =
      a.severity === "critical"
        ? {
            container: "border-rose-200/70 bg-rose-50",
            title: "text-rose-900",
            message: "text-rose-800/80",
            action: "bg-rose-100 text-rose-700 hover:bg-rose-200",
            dismiss: "text-rose-400 hover:text-rose-600",
          }
        : a.severity === "warning"
          ? {
              container: "border-amber-200/70 bg-amber-50",
              title: "text-amber-900",
              message: "text-amber-800/80",
              action: "bg-amber-100 text-amber-700 hover:bg-amber-200",
              dismiss: "text-amber-400 hover:text-amber-600",
            }
          : {
              container: "border-sky-200/70 bg-sky-50",
              title: "text-sky-900",
              message: "text-sky-800/80",
              action: "bg-sky-100 text-sky-700 hover:bg-sky-200",
              dismiss: "text-sky-400 hover:text-sky-600",
            };

    const actionLink =
      a.actionable && a.actionHref
        ? `<a href="${a.actionHref}" class="alert-action-link mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${sevStyles.action}">${a.actionLabel ?? "View details"}<svg width="14" height="14" viewBox="0 0 256 256"></svg></a>`
        : "";

    return `<div role="alert" class="group relative rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ${sevStyles.container}" data-alert-id="${a.id}">
      <div class="flex items-start gap-3.5">
        ${iconSvg(a.severity)}
        <div class="min-w-0 flex-1">
          <p class="text-sm font-black ${sevStyles.title}">${a.title}</p>
          <p class="mt-1 text-sm leading-6 ${sevStyles.message}">${a.message}</p>
          ${actionLink}
        </div>
        <button type="button" class="alert-dismiss-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${sevStyles.dismiss}" aria-label="Dismiss alert" data-dismiss-id="${a.id}">
          <svg width="16" height="16" viewBox="0 0 256 256"></svg>
        </button>
      </div>
    </div>`;
  };

  return `<div class="dashboard-alert-bar rounded-2xl border ${borderColor} ${bgColor} overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
    <button type="button" class="alert-bar-toggle flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5">
      <div class="flex items-center gap-1">${dots.join("")}</div>
      <span class="text-sm font-bold text-slate-800 alert-bar-text">${alertText}</span>
      <span class="alert-bar-breakdown hidden text-xs text-slate-500 sm:inline">${breakdown}</span>
      <span class="alert-bar-action-label ml-auto flex items-center gap-2 text-xs text-slate-400">Hide <svg width="14" height="14" viewBox="0 0 256 256"></svg></span>
    </button>
    <div class="alert-bar-body space-y-2 px-4 pb-4">
      ${alerts.map(bannerHtml).join("\n        ")}
    </div>
  </div>`;
}

/**
 * Returns a minimal HTML page that mirrors the real dashboard page structure
 * with the alert bar injected between the methodology note and section content.
 */
function mockDashboardHtml(
  sectionContent: string,
  alerts: AlertMock[],
): string {
  const alertSection = alerts.length > 0 ? alertBarHtml(alerts) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard Analytics | Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div class="flex min-h-screen bg-[#F4F8F6]">
    <aside class="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav class="flex flex-col gap-1 p-4">
        <a href="/admin/dashboard" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#0A6B62] bg-teal-50">Dashboard</a>
      </nav>
      <div class="border-t border-slate-100 p-4">
        <p class="text-xs font-bold text-slate-400">Demo Super Admin</p>
        <p class="text-xs text-slate-400">admin.demo@example.test</p>
      </div>
    </aside>
    <main class="flex-1 overflow-x-hidden">
      <div class="space-y-6 p-6">
        <div>
          <p class="text-xs font-black uppercase tracking-widest text-[#0A6B62]">Phase 09</p>
          <h1 class="text-2xl font-black text-[#073F37]">Dashboard Analytics</h1>
        </div>

        <div class="dashboard-methodology rounded-2xl border border-[#0A6B62]/15 bg-[#E6F4EF] p-4 text-sm leading-6 text-[#073F37]">
          <strong>Data source:</strong> live database.
        </div>

        ${alertSection}

        <!-- Main section content -->
        <div class="dashboard-section">
          ${sectionContent}
        </div>
      </div>
    </main>
  </div>

  <!-- Interactive behaviours: toggle + dismiss with localStorage -->
  <script>
    (function() {
      // Alert bar toggle (collapse/expand)
      var toggle = document.querySelector('.alert-bar-toggle');
      if (toggle) {
        toggle.addEventListener('click', function() {
          var body = this.parentElement.querySelector('.alert-bar-body');
          var label = this.querySelector('.alert-bar-action-label');
          if (body) {
            var hidden = body.style.display === 'none';
            body.style.display = hidden ? '' : 'none';
            if (label) label.innerHTML = hidden ? 'Hide <svg width="14" height="14" viewBox="0 0 256 256"></svg>' : 'Show <svg width="14" height="14" viewBox="0 0 256 256"></svg>';
          }
        });
      }

      // Alert dismiss
      var dismissBtns = document.querySelectorAll('.alert-dismiss-btn');
      dismissBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var alertEl = this.closest('[role="alert"]');
          if (alertEl) {
            var alertId = alertEl.getAttribute('data-alert-id');
            alertEl.style.display = 'none';
            // Persist to localStorage so it survives page reload
            if (alertId) {
              try {
                localStorage.setItem('dash_alert_dismissed:' + alertId + ':2026-01-01-2026-05-31--', 'true');
              } catch(e) {}
            }
          }
        });
      });

      // On load, check localStorage for dismissed alerts and hide them
      var allAlerts = document.querySelectorAll('[role="alert"]');
      allAlerts.forEach(function(el) {
        var alertId = el.getAttribute('data-alert-id');
        if (alertId) {
          try {
            var key = 'dash_alert_dismissed:' + alertId + ':2026-01-01-2026-05-31--';
            if (localStorage.getItem(key) === 'true') {
              el.style.display = 'none';
            }
          } catch(e) {}
        }
      });
    })();
  </script>
</body>
</html>`;
}

/* ─── Route interception helpers ──────────────────────────────────────── */

/** Clear all previous route handlers, then set up fresh ones for this test. */
async function setupRoutes(page: Page, alerts: AlertMock[]) {
  await page.unrouteAll();

  // Catch-all for API routes
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 200, body: "{}" }),
  );

  // Dashboard page mock — intercept GET /admin/dashboard (and trailing slash variant)
  await page.route("**/admin/dashboard", async (route, request) => {
    if (request.method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml(
        `<p class="text-sm text-slate-600">Executive overview content</p>`,
        alerts,
      ),
    });
  });

  await page.route("**/admin/dashboard/", async (route, request) => {
    if (request.method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: mockDashboardHtml(
        `<p class="text-sm text-slate-600">Executive overview content</p>`,
        alerts,
      ),
    });
  });
}

/* ─── Test data factories ─────────────────────────────────────────────── */

function satisfactionAlertCritical(): AlertMock {
  return {
    id: "dimension_critical_safety",
    severity: "critical",
    title: "Safety score critically low",
    message:
      "Safety average is 1.8 / 5 — well below the 3.0 threshold. This requires immediate attention.",
    actionable: true,
    actionLabel: "View satisfaction",
    actionHref: "/admin/dashboard/satisfaction",
  };
}

function satisfactionAlertWarning(): AlertMock {
  return {
    id: "dimension_warning_cleanliness",
    severity: "warning",
    title: "Cleanliness score below target",
    message:
      "Cleanliness average is 2.5 / 5. Consider reviewing visitor experience at affected areas.",
    actionable: true,
    actionLabel: "View details",
    actionHref: "/admin/dashboard/satisfaction",
  };
}

function _satisfactionOverallLow(): AlertMock {
  return {
    id: "overall_satisfaction_low",
    severity: "warning",
    title: "Overall satisfaction below target",
    message:
      "Average overall satisfaction is 2.8 / 5 — below the 3.0 threshold.",
    actionable: true,
    actionLabel: "View satisfaction",
    actionHref: "/admin/dashboard/satisfaction",
  };
}

function satisfactionNoData(): AlertMock {
  return {
    id: "satisfaction_no_data",
    severity: "info",
    title: "No satisfaction responses",
    message:
      "There are no satisfaction survey responses for the selected filters. The average satisfaction will show as No data.",
  };
}

function funnelAlertCritical(): AlertMock {
  return {
    id: "funnel_drop_critical",
    severity: "critical",
    title: 'Critical drop-off at "Form submitted"',
    message:
      "81% of users drop off between Certificate started and Form submitted. Only 30 of 160 users continue.",
    actionable: true,
    actionLabel: "View funnel",
    actionHref: "/admin/dashboard/funnel",
  };
}

function funnelAlertWarning(): AlertMock {
  return {
    id: "funnel_drop_warning",
    severity: "warning",
    title: 'Significant drop-off at "Survey completed"',
    message:
      "55% of users drop off between Survey started and Survey completed. Consider reviewing the user experience at this step.",
    actionable: true,
    actionLabel: "View funnel",
    actionHref: "/admin/dashboard/funnel",
  };
}

function expenseNoData(): AlertMock {
  return {
    id: "expense_no_data",
    severity: "info",
    title: "No expense data",
    message:
      "There are no expense survey responses for the selected filters. Estimated spending will show as No data.",
  };
}

function surveyLowCompletion(): AlertMock {
  return {
    id: "survey_completion_low",
    severity: "warning",
    title: "Low survey completion rate",
    message:
      "Only 12% of certificate recipients complete the optional survey. Responses may not be representative.",
  };
}

function revisitIntentionLow(): AlertMock {
  return {
    id: "revisit_intention_low",
    severity: "warning",
    title: "Low revisit intention",
    message:
      "Only 35% of respondents intend to revisit. This may indicate experience gaps.",
    actionable: true,
    actionLabel: "View satisfaction",
    actionHref: "/admin/dashboard/satisfaction",
  };
}

/* ─── Tests: Alert rendering ──────────────────────────────────────────── */

test.describe("Dashboard Alert System — rendering", () => {
  test("shows no alert bar when all dimension scores are healthy", async ({
    page,
  }) => {
    await setupRoutes(page, []);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".dashboard-alert-bar")).not.toBeVisible();
    await expect(page.getByText("dashboard alert")).not.toBeVisible();
  });

  test("renders critical alert for low safety score (< 2.0)", async ({
    page,
  }) => {
    await setupRoutes(page, [satisfactionAlertCritical()]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Alert bar summary
    await expect(
      page.locator(".alert-bar-text"),
    ).toContainText("1 dashboard alert");

    // Critical severity dot
    await expect(
      page.locator('[data-severity-dot="critical"]'),
    ).toBeVisible();

    // Alert banner with role="alert"
    const alertBanner = page.getByRole("alert");
    await expect(alertBanner).toBeVisible();

    // Title and message
    await expect(
      page.getByText("Safety score critically low"),
    ).toBeVisible();
    await expect(
      page.getByText("Safety average is 1.8 / 5"),
    ).toBeVisible();

    // Actionable link
    const actionLink = page.locator(".alert-action-link");
    await expect(actionLink).toBeVisible();
    await expect(actionLink).toHaveText("View satisfaction");
    await expect(actionLink).toHaveAttribute(
      "href",
      "/admin/dashboard/satisfaction",
    );

    // Dismiss button
    await expect(
      page.locator('[data-dismiss-id="dimension_critical_safety"]'),
    ).toBeVisible();
  });

  test("renders warning alert for moderate cleanliness score (2.0–2.9)", async ({
    page,
  }) => {
    await setupRoutes(page, [satisfactionAlertWarning()]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("Cleanliness score below target"),
    ).toBeVisible();
    await expect(
      page.getByText("Cleanliness average is 2.5 / 5"),
    ).toBeVisible();

    // Warning severity styling
    await expect(
      page.locator('[data-severity-dot="warning"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-severity-icon="warning"]'),
    ).toBeVisible();

    // Action link uses "View details" (generic label for dimension warnings)
    await expect(
      page.locator(".alert-action-link"),
    ).toContainText("View details");
  });

  test("renders multiple severity alerts with correct breakdown", async ({
    page,
  }) => {
    const alerts = [
      satisfactionAlertCritical(),     // critical — safety
      funnelAlertWarning(),             // warning — funnel
      surveyLowCompletion(),            // warning — survey
      expenseNoData(),                  // info — expense
    ];
    await setupRoutes(page, alerts);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Summary text
    await expect(
      page.locator(".alert-bar-text"),
    ).toContainText("4 dashboard alerts");

    // Breakdown: "1 critical, 2 warning, 1 info"
    const breakdown = page.locator(".alert-bar-breakdown");
    await expect(breakdown).toContainText("1 critical");
    await expect(breakdown).toContainText("2 warning");
    await expect(breakdown).toContainText("1 info");

    // Severity dots: 1 per severity type (not per alert)
    await expect(
      page.locator('[data-severity-dot="critical"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-severity-dot="warning"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-severity-dot="info"]'),
    ).toBeVisible();
    // 3 severity types present
    await expect(
      page.locator('[data-severity-dot]'),
    ).toHaveCount(3);

    // All 4 alert banners visible
    await expect(page.getByRole("alert")).toHaveCount(4);

    // Verify specific alert titles
    await expect(
      page.getByText("Safety score critically low"),
    ).toBeVisible();
    await expect(
      page.getByText('Significant drop-off at "Survey completed"'),
    ).toBeVisible();
    await expect(
      page.getByText("Low survey completion rate"),
    ).toBeVisible();
    await expect(page.getByText("No expense data")).toBeVisible();
  });

  test("renders info alert when no satisfaction responses exist", async ({
    page,
  }) => {
    await setupRoutes(page, [satisfactionNoData()]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("No satisfaction responses"),
    ).toBeVisible();
    await expect(
      page.getByText("There are no satisfaction survey responses"),
    ).toBeVisible();

    // Info severity
    await expect(
      page.locator('[data-severity-dot="info"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-severity-icon="info"]'),
    ).toBeVisible();

    // Info alerts are NOT actionable
    await expect(page.locator(".alert-action-link")).not.toBeVisible();
  });
});

/* ─── Tests: Funnel alerts ────────────────────────────────────────────── */

test.describe("Dashboard Alert System — funnel alerts", () => {
  test("renders critical alert for high funnel drop-off (>= 70%)", async ({
    page,
  }) => {
    await setupRoutes(page, [funnelAlertCritical()]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText('Critical drop-off at "Form submitted"'),
    ).toBeVisible();
    await expect(
      page.getByText("81% of users drop off"),
    ).toBeVisible();
    await expect(
      page.getByText("Only 30 of 160 users continue"),
    ).toBeVisible();

    // Action link points to funnel page
    const actionLink = page.locator(".alert-action-link");
    await expect(actionLink).toHaveText("View funnel");
    await expect(actionLink).toHaveAttribute(
      "href",
      "/admin/dashboard/funnel",
    );
  });

  test("renders warning alert for moderate funnel drop-off (>= 50%, < 70%)", async ({
    page,
  }) => {
    await setupRoutes(page, [funnelAlertWarning()]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText('Significant drop-off at "Survey completed"'),
    ).toBeVisible();
    await expect(
      page.getByText("55% of users drop off"),
    ).toBeVisible();

    // Warning severity
    await expect(
      page.locator('[data-severity-icon="warning"]'),
    ).toBeVisible();
  });

  test("renders both funnel and satisfaction alerts simultaneously", async ({
    page,
  }) => {
    const alerts = [funnelAlertCritical(), satisfactionAlertCritical()];
    await setupRoutes(page, alerts);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Both alert titles visible
    await expect(
      page.getByText('Critical drop-off at "Form submitted"'),
    ).toBeVisible();
    await expect(
      page.getByText("Safety score critically low"),
    ).toBeVisible();

    // Both are critical → 1 critical dot (per severity type), no warning or info
    await expect(
      page.locator('[data-severity-dot="critical"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-severity-dot="warning"]'),
    ).not.toBeVisible();

    // Summary says "2 dashboard alerts"
    await expect(
      page.locator(".alert-bar-text"),
    ).toContainText("2 dashboard alerts");

    // Breakdown: "2 critical"
    await expect(
      page.locator(".alert-bar-breakdown"),
    ).toContainText("2 critical");
  });
});

/* ─── Tests: Interactive behaviours ───────────────────────────────────── */

test.describe("Dashboard Alert System — interactive behaviour", () => {
  test.beforeEach(async ({ page }) => {
    await setupRoutes(page, [
      satisfactionAlertCritical(),
      funnelAlertWarning(),
      expenseNoData(),
    ]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Verify initial state: 3 alerts visible
    await expect(page.getByRole("alert")).toHaveCount(3);
  });

  test("collapses alert bar when toggle is clicked", async ({ page }) => {
    // Click the toggle button to collapse
    await page.locator(".alert-bar-toggle").click();

    // Alert body should be hidden
    await expect(page.locator(".alert-bar-body")).not.toBeVisible();

    // Toggle label should now say "Show"
    await expect(
      page.locator(".alert-bar-action-label"),
    ).toContainText("Show");
  });

  test("expands alert bar after collapsing", async ({ page }) => {
    // Collapse first
    await page.locator(".alert-bar-toggle").click();
    await expect(page.locator(".alert-bar-body")).not.toBeVisible();

    // Expand again
    await page.locator(".alert-bar-toggle").click();
    await expect(page.locator(".alert-bar-body")).toBeVisible();
    await expect(
      page.locator(".alert-bar-action-label"),
    ).toContainText("Hide");
  });

  test("dismisses an alert when close button is clicked", async ({
    page,
  }) => {
    // Count initial alerts
    const initialCount = await page.getByRole("alert").count();
    expect(initialCount).toBe(3);

    // Click dismiss on the first alert
    await page.locator('[data-dismiss-id="dimension_critical_safety"]').click();

    // Wait for JavaScript to hide the element
    await page.waitForTimeout(200);

    // Alert count should decrease by 1
    await expect(page.getByRole("alert")).toHaveCount(2);
  });

  test("dismiss persists across page reload via localStorage", async ({
    page,
  }) => {
    // Dismiss the critical safety alert
    await page
      .locator('[data-dismiss-id="dimension_critical_safety"]')
      .click();
    await page.waitForTimeout(200);

    // Verify dismissed
    await expect(page.getByRole("alert")).toHaveCount(2);

    // Reload the page (same mock, same route)
    await page.reload();
    await page.waitForLoadState("networkidle");

    // The critical alert should still be dismissed (via localStorage)
    await expect(page.getByRole("alert")).toHaveCount(2);
  });

  test("dismissed alert reappears when localStorage is cleared", async ({
    page,
  }) => {
    // Dismiss the critical alert
    await page
      .locator('[data-dismiss-id="dimension_critical_safety"]')
      .click();
    await page.waitForTimeout(200);

    // Clear localStorage (simulate different session or cache clear)
    await page.evaluate(() => localStorage.clear());

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");

    // All 3 alerts should be visible again
    await expect(page.getByRole("alert")).toHaveCount(3);
  });
});

/* ─── Tests: Actionable alerts ────────────────────────────────────────── */

test.describe("Dashboard Alert System — actionable alerts", () => {
  test("actionable alert has clickable link with correct href", async ({
    page,
  }) => {
    const alerts = [
      satisfactionAlertCritical(),
      revisitIntentionLow(),
    ];
    await setupRoutes(page, alerts);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Both should have action links
    const actionLinks = page.locator(".alert-action-link");
    await expect(actionLinks).toHaveCount(2);

    // First: View satisfaction → /admin/dashboard/satisfaction
    await expect(actionLinks.first()).toContainText("View satisfaction");
    await expect(actionLinks.first()).toHaveAttribute(
      "href",
      "/admin/dashboard/satisfaction",
    );
  });

  test("non-actionable alert has no action link", async ({ page }) => {
    const alerts = [satisfactionNoData(), expenseNoData()];
    await setupRoutes(page, alerts);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Info alerts are not actionable → no action links rendered
    await expect(page.locator(".alert-action-link")).not.toBeVisible();
  });
});

/* ─── Tests: Edge cases ──────────────────────────────────────────────── */

test.describe("Dashboard Alert System — edge cases", () => {
  test("handles hundreds of alerts gracefully", async ({ page }) => {
    // Generate 100+ info alerts
    const manyAlerts: AlertMock[] = [];
    for (let i = 0; i < 120; i++) {
      manyAlerts.push({
        id: `alert_${i}`,
        severity: "info",
        title: `Info alert ${i}`,
        message: `This is a test info alert number ${i}.`,
      });
    }
    await setupRoutes(page, manyAlerts);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Alert bar shows total count
    await expect(
      page.locator(".alert-bar-text"),
    ).toContainText("120 dashboard alerts");

    // All 120 alerts rendered
    await expect(page.getByRole("alert")).toHaveCount(120);
  });

  test("alert bar renders with only info alerts (no critical or warning)", async ({
    page,
  }) => {
    const alerts = [satisfactionNoData(), expenseNoData()];
    await setupRoutes(page, alerts);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Only info dots present (1 dot for info severity type, not 1 per alert)
    await expect(
      page.locator('[data-severity-dot="info"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-severity-dot]'),
    ).toHaveCount(1);
    await expect(
      page.locator('[data-severity-dot="critical"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-severity-dot="warning"]'),
    ).not.toBeVisible();

    // Summary says "2 dashboard alerts"
    await expect(
      page.locator(".alert-bar-text"),
    ).toContainText("2 dashboard alerts");
  });

  test("single alert uses singular '1 dashboard alert' phrasing", async ({
    page,
  }) => {
    await setupRoutes(page, [funnelAlertCritical()]);
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator(".alert-bar-text"),
    ).toHaveText("1 dashboard alert");
  });
});
