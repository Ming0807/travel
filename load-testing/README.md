# Load Testing — Southern Border Tourism Platform

## 📋 Overview

Load testing script for 5 main API routes using [k6](https://k6.io/).

### Tested Endpoints

| # | Endpoint | Method | Type | Auth | Rate Limit |
|---|----------|--------|------|------|------------|
| 1 | `/c/{code}` | GET | QR resolve (redirect) | None | No |
| 2 | `/api/upload/photo` | POST | Photo upload (multipart) | Guest cookie | 10/min/IP |
| 3 | `/api/certificate/generate` | POST | Certificate generation (JSON) | Guest cookie | 5/min/IP |
| 4 | Server Action `submitMinimalProfile` | POST | Profile submit (FormData) | Guest cookie | No |
| 5 | `/api/admin/dashboard/export` | GET | Dashboard CSV export | Admin session | No |

### Architecture

```
k6 Runner
  ├── Scenario 1: QR Resolve       [10–50 VUs, simple GET]
  ├── Scenario 2: Profile Submit    [5–20 VUs, FormData POST]
  ├── Scenario 3: Photo Upload      [3–10 VUs, multipart POST, respects 10/min limit]
  ├── Scenario 4: Certificate Gen   [2–5 VUs, JSON POST, respects 5/min limit]
  └── Scenario 5: Dashboard Export  [1–5 VUs, GET with admin auth]
```

---

## 🚀 Quick Start

### 1. Install k6

**Windows (recommended):**
```powershell
winget install k6
# or download from: https://grafana.com/docs/k6/latest/set-up/install-windows/
```

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo apt install k6
# or: https://grafana.com/docs/k6/latest/set-up/install-linux/
```

Verify:
```bash
k6 version
```

### 2. Configure Environment

Copy and fill in the configuration variables at the top of `load-test.js`:

```javascript
const BASE_URL          = "http://localhost:3456";      // Your dev/prod URL
const ADMIN_COOKIE      = "";                           // Session cookie value
const ADMIN_COOKIE_NAME = "sb-localhost-auth-token";    // Supabase auth cookie name
const ACTION_URL        = "/checkin-actions?submitMinimalProfile";  // Server action URL
const CHECKIN_CODES     = ["SUMMER-FUN-2025"];          // Valid check-in codes
```

> **How to find the action URL for `submitMinimalProfile`:**
> 1. Start the dev server
> 2. Open browser DevTools → Network tab
> 3. Complete a check-in flow (fill profile form, submit)
> 4. Look for the POST request after form submission — the URL path is the action URL
> 5. Copy that path (e.g., `/checkin-actions?submitMinimalProfile`)

> **How to get the admin session cookie:**
> 1. Log into `/admin/login` in your browser
> 2. Open DevTools → Application → Cookies → Find the `sb-{project-ref}-auth-token` cookie
> 3. Copy the cookie value into `ADMIN_COOKIE` and the cookie name into `ADMIN_COOKIE_NAME`
> 4. Default name for local Supabase is `sb-localhost-auth-token`

### 3. Run Load Test

**Dry-run (1 iteration, validate config):**
```bash
k6 run --vus 1 --iterations 1 load-testing/load-test.js
```

**Full test (default profile):**
```bash
k6 run load-testing/load-test.js
```

**Custom VUs and duration:**
```bash
k6 run --vus 20 --duration 2m load-testing/load-test.js
```

**Quiet mode (summary only):**
```bash
k6 run --quiet load-testing/load-test.js
```

**Output to JSON (for analysis):**
```bash
k6 run --summary-export results.json load-testing/load-test.js
```

---

## 📊 Understanding Results

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_duration{...}` | Endpoint response time | p95 < 2s |
| `qr_resolve_duration` | QR resolve latency | p95 < 500ms |
| `profile_submit_duration` | Profile form submit latency | p95 < 3s |
| `photo_upload_duration` | Photo upload latency | p95 < 5s (includes storage) |
| `cert_gen_duration` | Certificate generation latency | p95 < 5s (includes rendering) |
| `dashboard_export_duration` | Dashboard export latency | p95 < 10s (includes DB query) |
| `http_req_failed` | Error rate | < 1% |

### Pass/Fail Thresholds

Default thresholds (can be overridden in script):

```javascript
thresholds: {
  http_req_failed: ["rate<0.01"],       // < 1% errors
  http_req_duration: ["p(95)<5000"],    // p95 < 5s overall
  qr_resolve_duration: ["p(95)<1000"],
  profile_submit_duration: ["p(95)<5000"],
  photo_upload_duration: ["p(95)<10000"],
  cert_gen_duration: ["p(95)<10000"],
  dashboard_export_duration: ["p(95)<15000"],
}
```

### Sample Output

```
     ✓ QR resolve returned 302
     ✓ Profile submit returned { success | error | redirect }
     ✓ Photo upload returned 200
     ✓ Certificate returned 200
     ✓ Dashboard export returned 200

     checks.........................: 100.00% ✓ 1450      ✗ 0
     data_received..................: 12 MB  780 kB/s
     data_sent......................: 2.4 MB  150 kB/s
     http_req_blocked...............: avg=12ms   min=2ms   med=8ms    ...
     http_req_duration..............: avg=1.2s   min=45ms  med=890ms  ...
     ✓ qr_resolve_duration..........: avg=34ms   min=12ms  med=28ms   ...
     ✓ profile_submit_duration......: avg=1.4s   min=320ms med=1.1s   ...
     ✓ photo_upload_duration........: avg=2.1s   min=550ms med=1.8s   ...
     ✓ cert_gen_duration............: avg=1.8s   min=400ms med=1.5s   ...
     ✓ dashboard_export_duration....: avg=3.2s   min=850ms med=2.9s   ...
```

---

## 🧪 Scenario Details

### Scenario 1: QR Resolve

- **VUs:** 10 → 50 (ramp-up over 30s, steady 60s)
- **Request:** `GET /c/{random checkin code}`
- **Expect:** 302 redirect to `/checkin/{code}`
- **Test:** Response time for edge redirect logic
- **Risk:** None (no auth, no DB write)

### Scenario 2: Profile Submit (Server Action)

- **VUs:** 5 → 20 (ramp-up over 30s, steady 60s)
- **Request:** `POST {action_url}` with FormData
- **Body:**
  - `displayName`: Random Thai name
  - `ageGroup`: Random age bucket
  - `originCountryId`: `1` (Thailand)
  - `originProvinceId`: Random (1-10)
  - `hasConsented`: `true`
  - `checkinCode`: Random valid code
- **Expect:** Success response (redirect or JSON)
- **Risk:** Creates tourist profiles + visits in DB. Run on staging/dev only.

### Scenario 3: Photo Upload

- **VUs:** 3 → 10 (ramp-up over 30s, steady 60s)
- **Respects rate limit:** 10 req/min/IP (enforced in k6 by pacing iterations)
- **Request:** `POST /api/upload/photo` (multipart)
- **Body:** 1KB JPEG image + valid visitId
- **Expect:** `200 { success, photoId, previewUrl }`
- **Risk:** Rate limit (429). Run with low VUs or use multiple test IPs.

### Scenario 4: Certificate Generate

- **VUs:** 2 → 5 (ramp-up over 30s, steady 60s)
- **Respects rate limit:** 5 req/min/IP (enforced in k6 by pacing)
- **Request:** `POST /api/certificate/generate` (JSON)
- **Body:** visitId + minimal PNG base64
- **Expect:** `200 { success, certificateId, stamp }`
- **Risk:** Rate limit (429). Requires valid visitId with photo and auth session.

### Scenario 5: Dashboard Export

- **VUs:** 1 → 5 (ramp-up over 30s, steady 60s)
- **Request:** `GET /api/admin/dashboard/export?date_range=all`
- **Expect:** `200` with CSV content
- **Risk:** Heavy DB query. Add DB index if slow.

---

## 🛠 Customization

### Changing Load Profile

Edit the `scenarios` object in `load-test.js`:

```javascript
export const options = {
  scenarios: {
    qr_resolve: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 50 },   // Ramp up
        { duration: '60s', target: 50 },   // Steady
        { duration: '15s', target: 0 },    // Ramp down
      ],
    },
    // ... adjust for each endpoint
  },
};
```

### Adding More Endpoints

Add a new scenario block and a corresponding helper function. See existing patterns.

### Running Individual Scenarios

Use k6's `--scenario` flag:

```bash
k6 run --scenario qr_resolve load-testing/load-test.js
k6 run --scenario photo_upload load-testing/load-test.js
```

---

## ⚠️ Production Safety

**Do NOT run the full load test against production without:**
1. Rate limit testing in staging first
2. DB read replica or connection pool sizing
3. Monitoring (CPU, memory, DB connections)
4. Rollback plan

**Recommended production test profile:**
- QR resolve only (read-only, low risk)
- Dashboard export with 1–3 concurrent VUs
- Skip profile submit, photo upload, certificate gen on production

---

## 🔧 Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| All requests fail | `BASE_URL` wrong or server not running | Check dev server |
| QR resolve 404 | Check-in code invalid | Use valid codes from DB seed: `SELECT code FROM checkin_codes WHERE is_active = true LIMIT 5;` |
| Profile submit 404 | Action URL wrong | Find correct URL from browser DevTools |
| Photo upload 429 | Rate limit hit | Reduce VUs or increase `pacePerIteration` |
| Certificate gen 401 | `visitId` doesn't belong to guest session | Get a valid visitId from the check-in flow |
| Dashboard 401/403 | Admin session cookie expired/missing | Re-login and copy fresh cookie |
| High latency | DB query performance | Check `EXPLAIN ANALYZE` on slow queries |
