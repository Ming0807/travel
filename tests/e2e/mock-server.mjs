/**
 * Minimal HTTP mock server for Playwright E2E tests.
 *
 * Serves mock admin HTML pages and mock CSV export responses so tests
 * can run without a live Next.js dev server or Supabase backend.
 *
 * Usage:
 *   node tests/e2e/mock-server.mjs
 *   # Then run tests with PLAYWRIGHT_BASE_URL=http://127.0.0.1:3567
 */

import http from "node:http";

const PORT = 3568;

const MOCK_CSV = '\uFEFF"name","status"\n"Demo Record 1","Published"\n"Demo Record 2","Draft"';
const MOCK_DASHBOARD_CSV = '\uFEFF"metric","value"\n"Visits","25"\n"Tourists","12"';
const MOCK_AUDIT_CSV = '\uFEFF"Timestamp","Admin Name","Action","Entity Type"\n"2026-05-28 10:00:00","Admin User","export.attractions.csv","attraction_export"\n"2026-05-28 09:30:00","System","login.success","session"';

function htmlPage(title, exportEndpoint, hasExportBtn = true) {
  const exportBtnHtml = hasExportBtn
    ? `<a href="${exportEndpoint}" download class="export-btn inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"><svg class="h-4 w-4" viewBox="0 0 256 256"><polyline points="72 96 128 152 184 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="128" y1="8" x2="128" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg> Export CSV</a>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} | Admin</title></head>
<body>
  <div class="flex min-h-screen bg-[#F4F8F6]">
    <aside class="w-64 shrink-0 border-r border-slate-200 bg-white">
      <nav class="flex flex-col gap-1 p-4">
        <a href="/admin/dashboard" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#0A6B62] bg-teal-50">Dashboard</a>
        <a href="/admin/attractions" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Attractions</a>
      </nav>
      <div class="border-t border-slate-100 p-4">
        <p class="text-xs font-bold text-slate-400">Demo Admin</p>
        <p class="text-xs text-slate-400">admin@example.test</p>
      </div>
    </aside>
    <main class="flex-1 overflow-x-hidden p-6">
      <div class="space-y-6">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.18em] text-[#F3704C]">Content Management</p>
            <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-800">${title}</h1>
            <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Manage CRUD records</p>
          </div>
          <div class="flex items-center gap-2">${exportBtnHtml}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="min-w-[220px] flex-1"><input class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Search..." /></div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

function mediaLibraryPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Media Library | Admin</title></head>
<body>
  <div class="flex min-h-screen bg-[#F4F8F6]">
    <aside class="w-64 shrink-0 border-r border-slate-200 bg-white">
      <nav class="flex flex-col gap-1 p-4">
        <a href="/admin/media" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#0A6B62] bg-teal-50">Media</a>
      </nav>
    </aside>
    <main class="flex flex-col h-[calc(100vh-120px)] flex-1 p-6">
      <div class="mb-6 shrink-0">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.18em] text-[#F3704C]">Content Assets</p>
            <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-800">Media Library</h1>
            <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Search, upload, pick, and govern official public media assets.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="/api/admin/export/media" download class="export-btn inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
              <svg class="h-4 w-4" viewBox="0 0 256 256"><polyline points="72 96 128 152 184 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="128" y1="8" x2="128" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
              Export CSV
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

function auditPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>System Audit Logs | Admin</title></head>
<body>
  <div class="flex min-h-screen bg-[#F4F8F6]">
    <aside class="w-64 shrink-0 border-r border-slate-200 bg-white">
      <nav class="flex flex-col gap-1 p-4">
        <a href="/admin/audit" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#0A6B62] bg-teal-50">Audit Logs</a>
      </nav>
    </aside>
    <main class="flex-1 overflow-x-hidden p-6">
      <div class="space-y-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative max-w-sm w-full"><input class="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-3 text-sm" placeholder="Search action or entity..." /></div>
          <div class="flex items-center gap-2">
            <button id="export-audit-btn" class="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 export-btn-audit" onclick="window.location.href='/api/admin/audit/export'">
              <svg class="h-4 w-4" viewBox="0 0 256 256"><polyline points="72 96 128 152 184 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="128" y1="8" x2="128" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
              Export CSV
            </button>
          </div>
        </div>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <p class="text-sm text-slate-500">No audit logs match your filters.</p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

function dashboardPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard | Admin</title></head>
<body>
  <div class="flex min-h-screen bg-[#F4F8F6] p-6">
    <div class="flex justify-end w-full">
      <a href="/api/admin/dashboard/export?type=tourists" download class="export-csv-btn inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">Export CSV</a>
    </div>
  </div>
</body>
</html>`;
}

const pageRoutes = {
  "/admin/attractions": () => htmlPage("Attractions", "/api/admin/export/attractions"),
  "/admin/stories": () => htmlPage("Travel Stories", "/api/admin/export/stories"),
  "/admin/routes": () => htmlPage("Routes", "/api/admin/export/routes"),
  "/admin/photo-spots": () => htmlPage("Photo Spots", "/api/admin/export/photo-spots"),
  "/admin/badges": () => htmlPage("Badges", "/api/admin/export/badges"),
  "/admin/checkin-codes": () => htmlPage("Check-in Codes", "/api/admin/export/checkin-codes"),
  "/admin/media": mediaLibraryPage,
  "/admin/restaurants": () => htmlPage("Restaurants", "/api/admin/export/restaurants"),
  "/admin/visits": () => htmlPage("Visits", "/api/admin/export/visits"),
  "/admin/surveys": () => htmlPage("Surveys", "/api/admin/export/surveys"),
  "/admin/accommodations": () => htmlPage("Accommodations", "/api/admin/export/accommodations"),
  "/admin/certificate-templates": () => htmlPage("Certificate Templates", "/api/admin/export/certificate-templates"),
  "/admin/messages": () => htmlPage("Messages", "/api/admin/export/messages"),
  "/admin/reviews": () => htmlPage("Reviews", "/api/admin/export/reviews"),
  "/admin/tourists": () => htmlPage("Tourists", "/api/admin/export/tourists"),
  "/admin/users": () => htmlPage("Admin Users", "/api/admin/export/users"),
  "/admin/roles": () => htmlPage("Roles & Permissions", "/api/admin/export/roles"),
  "/admin/audit": auditPage,
  "/admin/dashboard": dashboardPage,
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // Handle export API routes
  if (pathname.startsWith("/api/admin/export") || pathname.startsWith("/api/admin/dashboard/export") || pathname.startsWith("/api/admin/audit/export")) {
    if (req.method === "GET") {
      const isDashboard = pathname === "/api/admin/dashboard/export";
      const isAudit = pathname === "/api/admin/audit/export";
      const csv = isDashboard ? MOCK_DASHBOARD_CSV : isAudit ? MOCK_AUDIT_CSV : MOCK_CSV;
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${isDashboard ? "dashboard" : isAudit ? "audit_logs" : "export"}.csv"`,
        "Access-Control-Allow-Origin": "*",
      });
      res.end(csv);
      return;
    }
  }

  // Handle page routes
  const pageHandler = pageRoutes[pathname];
  if (pageHandler && req.method === "GET") {
    const accept = req.headers["accept"] || "";
    if (accept.includes("text/html") || req.url?.includes("wait_for") || true) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(pageHandler());
      return;
    }
  }

  // Fallback
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<!DOCTYPE html><html><body><p>Mock server: ${pathname}</p></body></html>`);
});

server.listen(PORT, () => {
  console.log(`[mock-server] Listening on http://127.0.0.1:${PORT}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
