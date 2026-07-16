#!/usr/bin/env node

const baseUrlInput = process.env.RELEASE_BASE_URL?.trim();
const readinessSecret = process.env.HEALTH_CHECK_SECRET?.trim();
const timeoutMs = Number.parseInt(process.env.RELEASE_SMOKE_TIMEOUT_MS || "20000", 10);

if (!baseUrlInput) {
  console.error("RELEASE_BASE_URL is required (for example https://preview.example.com). ");
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(baseUrlInput);
} catch {
  console.error("RELEASE_BASE_URL must be a valid absolute URL.");
  process.exit(1);
}

const isLocal = ["localhost", "127.0.0.1", "::1"].includes(baseUrl.hostname);
if (baseUrl.protocol !== "https:" && !(isLocal && baseUrl.protocol === "http:")) {
  console.error("Release smoke requires HTTPS. HTTP is allowed only for localhost.");
  process.exit(1);
}

const checks = [];

function pass(name, detail) {
  checks.push({ name, detail, passed: true });
}

function fail(name, detail) {
  checks.push({ name, detail, passed: false });
}

async function request(path, init = {}) {
  const url = new URL(path, baseUrl);
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 20_000),
  });
}

async function checkDocument(path, name) {
  try {
    const response = await request(path);
    if (response.ok) pass(name, `${response.status} ${path}`);
    else fail(name, `${response.status} ${path}`);
  } catch (error) {
    fail(name, error instanceof Error ? error.message : "request failed");
  }
}

async function run() {
  let healthResponse;
  try {
    healthResponse = await request("/api/health");
    const health = await healthResponse.json();
    if (healthResponse.ok && health.status === "ok" && health.check === "liveness") {
      pass("Application liveness", `${healthResponse.status} release=${health.release || "unknown"}`);
    } else {
      fail("Application liveness", `${healthResponse.status} invalid health contract`);
    }
  } catch (error) {
    fail("Application liveness", error instanceof Error ? error.message : "request failed");
  }

  if (healthResponse) {
    const requiredHeaders = [
      "content-security-policy",
      "referrer-policy",
      "x-content-type-options",
      "x-frame-options",
    ];
    if (baseUrl.protocol === "https:") requiredHeaders.push("strict-transport-security");

    const missingHeaders = requiredHeaders.filter((header) => !healthResponse.headers.get(header));
    if (missingHeaders.length) fail("Security headers", `missing: ${missingHeaders.join(", ")}`);
    else pass("Security headers", `${requiredHeaders.length} required headers present`);
  }

  if (readinessSecret) {
    try {
      const response = await request("/api/health?mode=ready", {
        headers: { authorization: `Bearer ${readinessSecret}` },
      });
      const body = await response.json();
      if (response.ok && body.status === "ok" && body.check === "readiness") {
        pass("Dependency readiness", Object.entries(body.checks || {}).map(([key, value]) => `${key}=${value}`).join(" "));
      } else {
        fail("Dependency readiness", `${response.status} ${JSON.stringify(body.checks || {})}`);
      }
    } catch (error) {
      fail("Dependency readiness", error instanceof Error ? error.message : "request failed");
    }
  } else {
    pass("Dependency readiness", "skipped (HEALTH_CHECK_SECRET not supplied to smoke runner)");
  }

  await checkDocument("/", "Public homepage");
  await checkDocument("/attractions", "Public attractions");
  await checkDocument("/admin/login", "Admin login page");

  try {
    const response = await request("/admin", { redirect: "manual" });
    const location = response.headers.get("location") || "";
    if (response.status >= 300 && response.status < 400 && location.includes("/admin/login")) {
      pass("Anonymous admin guard", `${response.status} -> /admin/login`);
    } else {
      fail("Anonymous admin guard", `${response.status} location=${location || "missing"}`);
    }
  } catch (error) {
    fail("Anonymous admin guard", error instanceof Error ? error.message : "request failed");
  }

  for (const check of checks) {
    console.log(`${check.passed ? "PASS" : "FAIL"}  ${check.name} - ${check.detail}`);
  }

  const failed = checks.filter((check) => !check.passed);
  console.log(`\n${checks.length - failed.length}/${checks.length} release checks passed.`);
  if (failed.length) process.exitCode = 1;
}

await run();
