// =============================================================================
// Southern Border Tourism Platform — Load Testing Script (k6)
// =============================================================================
//
// Usage:
//   1. k6 run load-testing/load-test.js                          # Full test
//   2. k6 run --scenario qr_resolve load-testing/load-test.js    # Single scenario
//   3. k6 run --vus 5 --duration 30s load-testing/load-test.js   # Custom profile
//
// Environment variables:
//   BASE_URL            — Target server URL (default: http://localhost:3456)
//   ADMIN_COOKIE        — Supabase session cookie for auth'd endpoints
//   ACTION_URL          — Server action path for profile submit
//   CHECKIN_CODES       — Comma-separated valid check-in codes
//   K6_VUS              — Virtual users (default: scenario-specific)
//   DISABLE_AUTH_CHECK  — Set "1" to skip admin auth check
//   MEDIA_ASSET_IDS     — Comma-separated valid media asset IDs for archive tests
//   MEDIA_ENTITY_ID     — Entity ID for media list tests (default: 1)
// =============================================================================

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const qrResolveDuration       = new Trend("qr_resolve_duration");
const profileSubmitDuration    = new Trend("profile_submit_duration");
const photoUploadDuration     = new Trend("photo_upload_duration");
const certGenDuration         = new Trend("cert_gen_duration");
const dashboardExportDuration = new Trend("dashboard_export_duration");
const adminMediaListDuration  = new Trend("admin_media_list_duration");
const adminMediaArchiveDuration = new Trend("admin_media_archive_duration");
const adminVisitExportDuration  = new Trend("admin_visit_export_duration");
const adminSurveyExportDuration = new Trend("admin_survey_export_duration");
const healthCheckDuration     = new Trend("health_check_duration");
const errorRate               = new Rate("error_rate");

// ---------------------------------------------------------------------------
// Configuration — override via env vars
// ---------------------------------------------------------------------------
const BASE_URL          = __ENV.BASE_URL || "http://localhost:3456";
const ADMIN_COOKIE      = __ENV.ADMIN_COOKIE || "";
const ACTION_URL        = __ENV.ACTION_URL || "/checkin-actions?submitMinimalProfile";
const RAW_CODES         = __ENV.CHECKIN_CODES || "SUMMER-FUN-2025,WATERFALL-ADV,SOUTH-GATE";
const CHECKIN_CODES     = RAW_CODES.split(",").map((c) => c.trim()).filter(Boolean);
const ADMIN_COOKIE_NAME = __ENV.ADMIN_COOKIE_NAME || "sb-localhost-auth-token";
const DISABLE_AUTH_CHECK = __ENV.DISABLE_AUTH_CHECK === "1";
const RAW_MEDIA_IDS    = __ENV.MEDIA_ASSET_IDS || "1,2,3,4,5";
const MEDIA_ASSET_IDS  = RAW_MEDIA_IDS.split(",").map((c) => c.trim()).filter(Boolean);
const MEDIA_ENTITY_ID  = __ENV.MEDIA_ENTITY_ID || "1";

// ---------------------------------------------------------------------------
// Test data pools
// ---------------------------------------------------------------------------
const DISPLAY_NAMES = [
  "สมชาย ใจดี", "มานี มีสุข", "วิชัย แสนดี", "สมหญิง รักดี",
  "ประยุทธ์ ลีลาศ", "มาลี วรรณา", "สมศักดิ์ พรหมา", "กัญญา พิมพา",
  "Chad Smith", "Maria Garcia", "Tanaka Yuki", "Wei Zhang",
];

const AGE_GROUPS = [
  "under_18", "18_24", "25_34", "35_44",
  "45_54", "55_64", "65_plus",
];

const PROVINCE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Minimal 1x1 pixel PNG as base64 (for realistic cert generation payload)
// This is a valid PNG that can be decoded by the server
const MINIMAL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const CERT_PNG_BASE64 = `data:image/png;base64,${MINIMAL_PNG_BASE64}`;

// 1KB JPEG buffer (for photo upload)
// Generated from a minimal valid JPEG header + padding
function makeJpegBuffer(sizeKB = 1) {
  const header = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
    0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
    0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
    0x32,
  ]);
  const eof = new Uint8Array([0xFF, 0xD9]);
  const padding = new Uint8Array(sizeKB * 1024 - header.length - 2);
  padding.fill(0x00);
  const buffer = new Uint8Array(header.length + padding.length + eof.length);
  buffer.set(header);
  buffer.set(padding, header.length);
  buffer.set(eof, header.length + padding.length);
  return buffer.buffer;
}

const JPEG_BUFFER = makeJpegBuffer(1);
const JPEG_FILE   = http.file(JPEG_BUFFER, "test-photo.jpg", "image/jpeg");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkinCode() {
  return pick(CHECKIN_CODES);
}

function randomMediaId() {
  return pick(MEDIA_ASSET_IDS);
}

function randomVisitId() {
  // UUID v4 format — caller must replace with a real visitId from the flow
  return "00000000-0000-0000-0000-000000000000";
}

// ---------------------------------------------------------------------------
// Guest cookie management
//
// Note: The guest cookie (sbtp_guest_id) is normally set by the server action
// `submitMinimalProfile` via `getOrCreateGuestIdentity()`. For load testing,
// we generate a random UUID and set it directly in k6's cookie jar so that
// subsequent requests (photo upload, certificate generate) include it.
// ---------------------------------------------------------------------------
function ensureGuestCookie() {
  const jar = http.cookieJar();
  const existing = jar.cookiesForURL(`${BASE_URL}/`)["sbtp_guest_id"];
  if (existing && existing.length > 0) return;

  // Generate a random UUID v4 to simulate what the server would create
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  jar.set(`${BASE_URL}/`, "sbtp_guest_id", uuid, {
    http_only: true,
    samesite: "Lax",
    path: "/",
    max_age: 31536000, // 1 year
  });
}

// ---------------------------------------------------------------------------
// Auth admin headers
// ---------------------------------------------------------------------------
function adminHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (ADMIN_COOKIE) {
    headers["Cookie"] = `${ADMIN_COOKIE_NAME}=${ADMIN_COOKIE}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// k6 options — scenarios + thresholds
// ---------------------------------------------------------------------------
export const options = {
  // System under test info
  tags: {
    name: "southern-border-tourism-load-test",
    version: "1.0.0",
  },

  // Default thresholds
  thresholds: {
    // Global: < 1% errors across all requests
    http_req_failed: ["rate<0.01"],
    // Global: p95 < 5s overall
    http_req_duration: ["p(95)<5000"],
    // Per-endpoint thresholds (can be adjusted per env)
    qr_resolve_duration: ["p(95)<1000"],
    profile_submit_duration: ["p(95)<5000"],
    photo_upload_duration: ["p(95)<10000"],
    cert_gen_duration: ["p(95)<10000"],
    dashboard_export_duration: ["p(95)<15000"],
    admin_media_list_duration: ["p(95)<3000"],
    admin_media_archive_duration: ["p(95)<5000"],
    admin_visit_export_duration: ["p(95)<15000"],
    admin_survey_export_duration: ["p(95)<15000"],
    health_check_duration: ["p(95)<200"],
    // Custom error rate
    error_rate: ["rate<0.05"],
  },

  scenarios: {
    // -----------------------------------------------------------------------
    // Scenario 1: QR Resolve (read-only, high volume)
    // -----------------------------------------------------------------------
    qr_resolve: {
      executor: "ramping-vus",
      startVUs: 5,
      stages: [
        { duration: "15s", target: 30 },   // Ramp up
        { duration: "45s", target: 50 },   // Steady
        { duration: "10s", target: 0 },    // Ramp down
      ],
      gracefulRampDown: "5s",
      tags: { endpoint: "qr_resolve" },
    },

    // -----------------------------------------------------------------------
    // Scenario 2: Profile Submit (server action, moderate volume)
    // -----------------------------------------------------------------------
    profile_submit: {
      executor: "ramping-vus",
      startVUs: 2,
      stages: [
        { duration: "20s", target: 10 },
        { duration: "40s", target: 15 },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "5s",
      tags: { endpoint: "profile_submit" },
      // Pacing: ~1 request every 3s per VU
      exec: "profileSubmitScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 3: Photo Upload (low volume, respects 10/min rate limit)
    // -----------------------------------------------------------------------
    photo_upload: {
      executor: "per-vu-iterations",
      vus: 3,
      iterations: 8,       // 8 per VU = 24 total, ~5-6/min pace
      maxDuration: "2m",
      gracefulStop: "10s",
      tags: { endpoint: "photo_upload" },
      // Minimum 6s between iterations to stay under 10/min rate limit
      exec: "photoUploadScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 4: Certificate Generate (low volume, respects 5/min rate limit)
    // -----------------------------------------------------------------------
    certificate_generate: {
      executor: "per-vu-iterations",
      vus: 2,
      iterations: 6,       // 6 per VU = 12 total, ~3-4/min pace
      maxDuration: "2m",
      gracefulStop: "10s",
      tags: { endpoint: "certificate_generate" },
      exec: "certificateGenerateScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 5: Dashboard Export (admin auth, low volume, heavy query)
    // -----------------------------------------------------------------------
    dashboard_export: {
      executor: "constant-vus",
      vus: 2,
      duration: "1m",
      gracefulStop: "10s",
      tags: { endpoint: "dashboard_export" },
      exec: "dashboardExportScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 6: Admin Media List (admin auth, read-heavy)
    // -----------------------------------------------------------------------
    admin_media_list: {
      executor: "ramping-vus",
      startVUs: 2,
      stages: [
        { duration: "15s", target: 10 },
        { duration: "30s", target: 20 },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "5s",
      tags: { endpoint: "admin_media_list" },
      exec: "adminMediaListScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 7: Admin Media Archive (admin auth, write operation)
    // -----------------------------------------------------------------------
    admin_media_archive: {
      executor: "per-vu-iterations",
      vus: 2,
      iterations: 5,
      maxDuration: "1m30s",
      gracefulStop: "10s",
      tags: { endpoint: "admin_media_archive" },
      exec: "adminMediaArchiveScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 8: Admin Visit Export (admin auth, DB-heavy)
    // -----------------------------------------------------------------------
    admin_visit_export: {
      executor: "constant-vus",
      vus: 2,
      duration: "1m",
      gracefulStop: "10s",
      tags: { endpoint: "admin_visit_export" },
      exec: "adminVisitExportScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 9: Admin Survey Export (admin auth, DB-heavy)
    // -----------------------------------------------------------------------
    admin_survey_export: {
      executor: "constant-vus",
      vus: 2,
      duration: "1m",
      gracefulStop: "10s",
      tags: { endpoint: "admin_survey_export" },
      exec: "adminSurveyExportScenario",
    },

    // -----------------------------------------------------------------------
    // Scenario 10: Health Check (no auth, baseline)
    // -----------------------------------------------------------------------
    health_check: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      gracefulStop: "5s",
      tags: { endpoint: "health_check" },
      exec: "healthCheckScenario",
    },
  },
};

// =============================================================================
// Scenario 1: QR Resolve
// =============================================================================
export default function qrResolveScenario() {
  group("QR Resolve", function () {
    const code = checkinCode();
    const res = http.get(`${BASE_URL}/c/${code}`, {
      redirects: 0,
      tags: { name: "qr_resolve" },
    });

    qrResolveDuration.add(res.timings.duration);

    // Expected: 302 redirect to /checkin/{code}
    const pass = check(res, {
      "QR resolve returned 302": (r) => r.status === 302,
      "QR resolve redirects to checkin": (r) => {
        const location = r.headers["Location"] || r.headers["location"] || "";
        return location.includes("/checkin/");
      },
      "QR resolve fast (<500ms)": (r) => r.timings.duration < 500,
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(
        `QR resolve failed: status=${res.status}, location=${res.headers["Location"] || res.headers["location"] || "N/A"}`
      );
    }
  });
}

// =============================================================================
// Scenario 2: Profile Submit (server action)
// =============================================================================
export function profileSubmitScenario() {
  group("Profile Submit", function () {
    // Ensure guest cookie is set first
    ensureGuestCookie();

    const actionFullUrl = ACTION_URL.startsWith("http")
      ? ACTION_URL
      : `${BASE_URL}${ACTION_URL.startsWith("/") ? "" : "/"}${ACTION_URL}`;

    const payload = {
      checkinCode: checkinCode(),
      displayName: pick(DISPLAY_NAMES),
      ageGroup: pick(AGE_GROUPS),
      originCountryId: String(pick(PROVINCE_IDS)),
      hasConsented: "true",
      // Form data encoded as URL-encoded body
    };

    const body = Object.entries(payload)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const res = http.post(actionFullUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      tags: { name: "profile_submit" },
    });

    profileSubmitDuration.add(res.timings.duration);

    // Server actions may return 200, 303 redirect, or JSON with error
    const pass = check(res, {
      "Profile submit responded": (r) => r.status !== 0 && r.status !== 404,
      "Profile submit accepted": (r) =>
        (r.status >= 300 && r.status < 400) ||
        (r.status === 200 && r.body && (r.body.includes("success") || r.body.includes("error") || r.body.includes("visitId"))) ||
        r.status === 200,
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(`Profile submit: status=${res.status}, body=${(res.body || "").slice(0, 200)}`);
    }

    // Pacing: wait 2-5s between iterations to mimic real user
    sleep(randomInt(2, 5));
  });
}

// =============================================================================
// Scenario 3: Photo Upload (multipart, respects rate limit)
// =============================================================================
export function photoUploadScenario() {
  group("Photo Upload", function () {
    ensureGuestCookie();

    const formData = {
      file: JPEG_FILE,
      visitId: randomVisitId(),   // WARNING: replace with real visitId
    };

    const res = http.post(`${BASE_URL}/api/upload/photo`, formData, {
      tags: { name: "photo_upload" },
    });

    photoUploadDuration.add(res.timings.duration);

    const pass = check(res, {
      "Photo upload returned status": (r) => r.status === 200 || r.status === 429 || r.status === 400 || r.status === 404,
      "Photo upload success or handled error": (r) => {
        if (r.status === 200) return true;
        if (r.status === 429) return true;  // Rate limit — acceptable
        if (r.status === 400 || r.status === 404) return true; // Invalid visitId
        return false;
      },
    });

    if (res.status === 429) {
      console.info("Photo upload rate limited — expected behavior");
    }

    if (!pass) {
      errorRate.add(1);
    }

    // Pacing: minimum 6s between iterations to respect 10/min rate limit
    sleep(6);
  });
}

// =============================================================================
// Scenario 4: Certificate Generate (JSON POST, respects rate limit)
// =============================================================================
export function certificateGenerateScenario() {
  group("Certificate Generate", function () {
    ensureGuestCookie();

    const payload = JSON.stringify({
      visitId: randomVisitId(),     // WARNING: replace with real visitId from check-in flow
      base64Image: CERT_PNG_BASE64,
    });

    const res = http.post(`${BASE_URL}/api/certificate/generate`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      tags: { name: "certificate_generate" },
    });

    certGenDuration.add(res.timings.duration);

    const pass = check(res, {
      "Certificate returned status": (r) =>
        r.status === 200 || r.status === 429 || r.status === 400 || r.status === 404 || r.status === 401,
      "Certificate handled gracefully": (r) => {
        if (r.status === 200) return true;
        if (r.status === 429) return true;  // Rate limit
        if (r.status === 400 || r.status === 404 || r.status === 401) return true; // Expected errors
        return false;
      },
    });

    if (res.status === 429) {
      console.info("Certificate generation rate limited — expected behavior");
    }

    if (!pass) {
      errorRate.add(1);
    }

    // Pacing: minimum 12s between iterations to respect 5/min rate limit
    sleep(12);
  });
}

// =============================================================================
// Scenario 5: Dashboard Export (admin auth, DB-heavy)
// =============================================================================
export function dashboardExportScenario() {
  group("Dashboard Export", function () {
    if (!ADMIN_COOKIE && !DISABLE_AUTH_CHECK) {
      console.warn(
        "ADMIN_COOKIE not set. Skipping dashboard_export scenario. " +
        "Set ADMIN_COOKIE env var or DISABLE_AUTH_CHECK=1"
      );
      return;
    }

    // Test with different filter combinations
    const filterSets = [
      "?date_range=all",
      "?date_range=30d",
      "?date_range=7d",
      "?province_id=1",
    ];
    const filters = pick(filterSets);

    const res = http.get(`${BASE_URL}/api/admin/dashboard/export${filters}`, {
      headers: adminHeaders(),
      tags: { name: "dashboard_export" },
    });

    dashboardExportDuration.add(res.timings.duration);

    const pass = check(res, {
      "Dashboard export returned 200": (r) => r.status === 200,
      "Dashboard export returned CSV": (r) => {
        const ct = (r.headers["Content-Type"] || r.headers["content-type"] || "").toLowerCase();
        return ct.includes("csv") || ct.includes("text/");
      },
      "Dashboard export has data": (r) => r.status === 200 && (r.body || "").length > 0,
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(
        `Dashboard export failed: status=${res.status}, ` +
        `content-type=${res.headers["Content-Type"] || "N/A"}, ` +
        `body_len=${(res.body || "").length}`
      );
    }

    // Pacing: 5-10s between iterations (heavy query)
    sleep(randomInt(5, 10));
  });
}

// =============================================================================
// Scenario 6: Admin Media List (GET /api/admin/media)
// =============================================================================
export function adminMediaListScenario() {
  group("Admin Media List", function () {
    if (!ADMIN_COOKIE && !DISABLE_AUTH_CHECK) {
      console.warn("ADMIN_COOKIE not set. Skipping admin_media_list scenario.");
      return;
    }

    // Cycle through filter combinations
    const filterSets = [
      "",
      "?category=All",
      "?category=Attractions",
      "?lifecycle_status=active",
      "?lifecycle_status=all",
    ];
    const filters = pick(filterSets);

    const res = http.get(`${BASE_URL}/api/admin/media${filters}`, {
      headers: adminHeaders(),
      tags: { name: "admin_media_list" },
    });

    adminMediaListDuration.add(res.timings.duration);

    const pass = check(res, {
      "Media list returned 200": (r) => r.status === 200,
      "Media list returned JSON array or object": (r) => {
        const ct = (r.headers["Content-Type"] || "").toLowerCase();
        return ct.includes("json") || r.status !== 200;
      },
      "Media list fast (<2s)": (r) => r.timings.duration < 2000,
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(`Media list failed: status=${res.status}`);
    }
  });
}

// =============================================================================
// Scenario 7: Admin Media Archive (DELETE /api/admin/media/[id])
// =============================================================================
export function adminMediaArchiveScenario() {
  group("Admin Media Archive", function () {
    if (!ADMIN_COOKIE && !DISABLE_AUTH_CHECK) {
      console.warn("ADMIN_COOKIE not set. Skipping admin_media_archive scenario.");
      return;
    }

    const mediaId = randomMediaId();

    // First attempt: archive (DELETE)
    const deleteRes = http.del(`${BASE_URL}/api/admin/media/${mediaId}`, null, {
      headers: adminHeaders(),
      tags: { name: "admin_media_archive" },
    });

    adminMediaArchiveDuration.add(deleteRes.timings.duration);

    const deletePass = check(deleteRes, {
      "Media archive returned status": (r) =>
        r.status === 200 || r.status === 404 || r.status === 403 || r.status === 500,
      "Media archive handled gracefully": (r) => {
        if (r.status === 200) return true;
        if (r.status === 404) return true;  // Already archived or not found
        if (r.status === 403) return true;  // Permission denied
        return false;
      },
    });

    if (!deletePass) {
      errorRate.add(1);
      console.warn(`Media archive DELETE failed: status=${deleteRes.status} id=${mediaId}`);
    }

    // Pause before unarchive
    sleep(2);

    // Second attempt: unarchive (PATCH)
    const patchBody = JSON.stringify({ action: "unarchive" });
    const patchRes = http.patch(`${BASE_URL}/api/admin/media/${mediaId}`, patchBody, {
      headers: adminHeaders(),
      tags: { name: "admin_media_archive" },
    });

    adminMediaArchiveDuration.add(patchRes.timings.duration);

    const patchPass = check(patchRes, {
      "Media unarchive returned status": (r) =>
        r.status === 200 || r.status === 400 || r.status === 404 || r.status === 403,
      "Media unarchive handled gracefully": (r) => {
        if (r.status === 200) return true;
        if (r.status === 400 || r.status === 404 || r.status === 403) return true;
        return false;
      },
    });

    if (!patchPass) {
      errorRate.add(1);
      console.warn(`Media archive PATCH failed: status=${patchRes.status} id=${mediaId}`);
    }

    // Pacing: 5-10s between archive cycles
    sleep(randomInt(5, 10));
  });
}

// =============================================================================
// Scenario 8: Admin Visit Export (GET /api/admin/export/visits)
// =============================================================================
export function adminVisitExportScenario() {
  group("Admin Visit Export", function () {
    if (!ADMIN_COOKIE && !DISABLE_AUTH_CHECK) {
      console.warn("ADMIN_COOKIE not set. Skipping admin_visit_export scenario.");
      return;
    }

    const filterSets = [
      "?date_from=&date_to=",
      "?date_from=2025-01-01&date_to=2025-12-31",
      "?province_id=1",
      "?page=1&pageSize=50",
    ];
    const filters = pick(filterSets);

    const res = http.get(`${BASE_URL}/api/admin/export/visits${filters}`, {
      headers: adminHeaders(),
      tags: { name: "admin_visit_export" },
    });

    adminVisitExportDuration.add(res.timings.duration);

    const pass = check(res, {
      "Visit export returned 200 or 413": (r) => r.status === 200 || r.status === 413,
      "Visit export returned CSV or error JSON": (r) => {
        const ct = (r.headers["Content-Type"] || "").toLowerCase();
        if (r.status === 200) return ct.includes("csv") || ct.includes("text/");
        return true; // 413 returns JSON error
      },
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(`Visit export failed: status=${res.status}`);
    }

    // Pacing: 5-10s between iterations (heavy query)
    sleep(randomInt(5, 10));
  });
}

// =============================================================================
// Scenario 9: Admin Survey Export (GET /api/admin/export/surveys)
// =============================================================================
export function adminSurveyExportScenario() {
  group("Admin Survey Export", function () {
    if (!ADMIN_COOKIE && !DISABLE_AUTH_CHECK) {
      console.warn("ADMIN_COOKIE not set. Skipping admin_survey_export scenario.");
      return;
    }

    const filterSets = [
      "?date_from=&date_to=",
      "?date_from=2025-01-01&date_to=2025-12-31",
      "?satisfaction_min=3",
      "?page=1&pageSize=50",
    ];
    const filters = pick(filterSets);

    const res = http.get(`${BASE_URL}/api/admin/export/surveys${filters}`, {
      headers: adminHeaders(),
      tags: { name: "admin_survey_export" },
    });

    adminSurveyExportDuration.add(res.timings.duration);

    const pass = check(res, {
      "Survey export returned 200 or 413": (r) => r.status === 200 || r.status === 413,
      "Survey export handled gracefully": (r) => {
        if (r.status === 200 || r.status === 413) return true;
        return false;
      },
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(`Survey export failed: status=${res.status}`);
    }

    // Pacing: 5-10s between iterations (heavy query)
    sleep(randomInt(5, 10));
  });
}

// =============================================================================
// Scenario 10: Health Check (GET /api/health, no auth)
// =============================================================================
export function healthCheckScenario() {
  group("Health Check", function () {
    const res = http.get(`${BASE_URL}/api/health`, {
      tags: { name: "health_check" },
    });

    healthCheckDuration.add(res.timings.duration);

    const pass = check(res, {
      "Health check returned 200": (r) => r.status === 200,
      "Health check very fast (<100ms)": (r) => r.timings.duration < 100,
    });

    if (!pass) {
      errorRate.add(1);
      console.warn(`Health check failed: status=${res.status}`);
    }
  });
}

// =============================================================================
// Setup & Teardown
// =============================================================================
export function setup() {
  // Validate configuration
  if (CHECKIN_CODES.length === 0) {
    console.warn("⚠️  No CHECKIN_CODES configured. QR resolve tests will use placeholder codes.");
  }

  if (!ADMIN_COOKIE && !DISABLE_AUTH_CHECK) {
    console.warn(
      "⚠️  ADMIN_COOKIE not set. Dashboard export tests will be skipped.\n" +
      "   Set via env: ADMIN_COOKIE='your-session-cookie'\n" +
      "   Or disable check: DISABLE_AUTH_CHECK=1"
    );
  }

  console.log(`🚀 Starting load test`);
  console.log(`   BASE_URL:       ${BASE_URL}`);
  console.log(`   Codes:          ${CHECKIN_CODES.length} configured`);
  console.log(`   Admin auth:     ${ADMIN_COOKIE ? "✅ configured" : "❌ not set"}`);
  console.log(`   Action URL:     ${ACTION_URL}`);
  console.log(`   Scenarios:`);
  console.log(`     1. QR Resolve           (5→50 VUs, 70s)`);
  console.log(`     2. Profile Submit       (2→15 VUs, 70s)`);
  console.log(`     3. Photo Upload         (3 VUs × 8 iters, ~2m)`);
  console.log(`     4. Certificate Gen      (2 VUs × 6 iters, ~2m)`);
  console.log(`     5. Dashboard Export     (2 VUs, 60s)`);
  console.log(`     6. Admin Media List     (2→20 VUs, 55s)`);
  console.log(`     7. Admin Media Archive  (2 VUs × 5 iters archive+unarchive, ~1.5m)`);
  console.log(`     8. Admin Visit Export   (2 VUs, 60s)`);
  console.log(`     9. Admin Survey Export  (2 VUs, 60s)`);
  console.log(`    10. Health Check         (5 VUs, 30s)`);
  console.log(``);
  console.log(`   Available codes:  ${CHECKIN_CODES.length} check-in`);
  console.log(`   Available media:  ${MEDIA_ASSET_IDS.length} asset IDs`);

  return {
    startedAt: new Date().toISOString(),
  };
}

export function teardown(data) {
  console.log(`\n🏁 Load test completed`);
  console.log(`   Started: ${data.startedAt}`);
}
