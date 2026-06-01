# Load Testing — Southern Border Tourism Platform

## 📋 Overview

Load testing script for 10 API routes using [k6](https://k6.io/).

### Tested Endpoints

| # | Endpoint | Method | Type | Auth | Rate Limit |
|---|----------|--------|------|------|------------|
| 1 | `/c/{code}` | GET | QR resolve (redirect) | None | No |
| 2 | Server Action `submitMinimalProfile` | POST | Profile submit (FormData) | Guest cookie | No |
| 3 | `/api/upload/photo` | POST | Photo upload (multipart) | Guest cookie | 10/min/IP |
| 4 | `/api/certificate/generate` | POST | Certificate generation (JSON) | Guest cookie | 5/min/IP |
| 5 | `/api/admin/dashboard/export` | GET | Dashboard CSV export | Admin session | No |
| 6 | `/api/admin/media` | GET | Media library list (with filters) | Admin session | No |
| 7 | `/api/admin/media/{id}` | DELETE+PATCH | Media archive + unarchive cycle | Admin session | No |
| 8 | `/api/admin/export/visits` | GET | Visit records CSV export | Admin session | No |
| 9 | `/api/admin/export/surveys` | GET | Survey responses CSV export | Admin session | No |
| 10 | `/api/health` | GET | Health check endpoint | None | No |

### Architecture

```
k6 Runner
  ├── Scenario 1:  QR Resolve            [5–50 VUs, simple GET]
  ├── Scenario 2:  Profile Submit         [2–15 VUs, FormData POST]
  ├── Scenario 3:  Photo Upload           [3 VUs × 8 iters, respectful of 10/min]
  ├── Scenario 4:  Certificate Gen        [2 VUs × 6 iters, respectful of 5/min]
  ├── Scenario 5:  Dashboard Export       [2 VUs, DB-heavy CSV]
  ├── Scenario 6:  Admin Media List       [2–20 VUs, read-heavy with filter combos]
  ├── Scenario 7:  Admin Media Archive    [2 VUs × 5 iters, archive+unarchive cycle]
  ├── Scenario 8:  Admin Visit Export     [2 VUs, DB-heavy CSV]
  ├── Scenario 9:  Admin Survey Export    [2 VUs, DB-heavy CSV]
  └── Scenario 10: Health Check           [5 VUs, baseline]
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
| `admin_media_list_duration` | Media list query | p95 < 3s |
| `admin_media_archive_duration` | Archive/unarchive operation | p95 < 5s |
| `admin_visit_export_duration` | Visit CSV export query | p95 < 15s |
| `admin_survey_export_duration` | Survey CSV export query | p95 < 15s |
| `health_check_duration` | Health endpoint | p95 < 200ms |

### Pass/Fail Thresholds

Default thresholds (can be overridden in script):

```javascript
thresholds: {
  http_req_failed: ["rate<0.01"],       // < 1% errors
  http_req_duration: ["p(95)<5000"],    // p95 < 5s overall
  qr_resolve_duration:        ["p(95)<1000"],
  profile_submit_duration:    ["p(95)<5000"],
  photo_upload_duration:      ["p(95)<10000"],
  cert_gen_duration:          ["p(95)<10000"],
  dashboard_export_duration:  ["p(95)<15000"],
  admin_media_list_duration:  ["p(95)<3000"],
  admin_media_archive_duration: ["p(95)<5000"],
  admin_visit_export_duration: ["p(95)<15000"],
  admin_survey_export_duration: ["p(95)<15000"],
  health_check_duration:      ["p(95)<200"],
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

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Target server URL | `http://localhost:3456` |
| `ADMIN_COOKIE` | Supabase session cookie for auth'd endpoints | `""` |
| `ADMIN_COOKIE_NAME` | Supabase auth cookie name | `sb-localhost-auth-token` |
| `ACTION_URL` | Server action path for profile submit | `/checkin-actions?submitMinimalProfile` |
| `CHECKIN_CODES` | Comma-separated valid check-in codes | `SUMMER-FUN-2025,WATERFALL-ADV,SOUTH-GATE` |
| `MEDIA_ASSET_IDS` | Comma-separated media asset IDs for archive tests | `1,2,3,4,5` |
| `MEDIA_ENTITY_ID` | Entity ID for media list tests | `1` |
| `DISABLE_AUTH_CHECK` | Set `"1"` to skip admin auth check | `false` |

---

## 🧪 Scenario Details

### Scenario 1: QR Resolve

- **VUs:** 5 → 50 (ramp 15s → peak 45s → down 10s)
- **Request:** `GET /c/{random checkin code}` (no redirects)
- **Expect:** 302 redirect to `/checkin/{code}`
- **Test:** Response time for edge redirect logic
- **Risk:** None (no auth, no DB write)

### Scenario 2: Profile Submit (Server Action)

- **VUs:** 2 → 15 (ramp 20s → peak 40s → down 10s)
- **Request:** `POST {action_url}` with FormData
- **Body:** Display name, age group, origin, consent, check-in code
- **Expect:** Success response (redirect or JSON)
- **Risk:** Creates tourist profiles + visits in DB. Run on staging/dev only.

### Scenario 3: Photo Upload

- **VUs:** 3 VUs × 8 iterations (~24 total, respectful of 10/min rate limit)
- **Request:** `POST /api/upload/photo` (multipart, 1KB JPEG)
- **Expect:** `200 { success }` or `429` (rate limit)
- **Risk:** Rate limit. Low VUs recommended.

### Scenario 4: Certificate Generate

- **VUs:** 2 VUs × 6 iterations (~12 total, respectful of 5/min rate limit)
- **Request:** `POST /api/certificate/generate` (JSON, minimal PNG)
- **Expect:** `200 { success }` or `429` (rate limit)
- **Risk:** Rate limit. Requires valid visitId.

### Scenario 5: Dashboard Export

- **VUs:** 2 constant VUs, 60s
- **Request:** `GET /api/admin/dashboard/export?{random filter}`
- **Expect:** `200` with CSV content
- **Risk:** Heavy DB query. Add DB index if slow.

### Scenario 6: Admin Media List

- **VUs:** 2 → 20 (ramp 15s → peak 30s → down 10s)
- **Request:** `GET /api/admin/media?{random filter}`
- **Expect:** `200` with JSON array of assets
- **Risk:** None (read-only). Cycles through filter combinations.

### Scenario 7: Admin Media Archive

- **VUs:** 2 VUs × 5 iterations (archive + unarchive cycle)
- **Request:** `DELETE /api/admin/media/{id}` then `PATCH /api/admin/media/{id}` with `{ action: "unarchive" }`
- **Expect:** `200` for both operations or handled gracefully (404, 403)
- **Risk:** Mutates `lifecycle_status` in DB. Uses random media IDs. 5-10s pacing.

### Scenario 8: Admin Visit Export

- **VUs:** 2 constant VUs, 60s
- **Request:** `GET /api/admin/export/visits?{random filter}`
- **Expect:** `200` with CSV or `413` (too large)
- **Risk:** Heavy DB query. Cycles through date/province filter combinations.

### Scenario 9: Admin Survey Export

- **VUs:** 2 constant VUs, 60s
- **Request:** `GET /api/admin/export/surveys?{random filter}`
- **Expect:** `200` with CSV or `413` (too large)
- **Risk:** Heavy DB query. Includes satisfaction filter.

### Scenario 10: Health Check

- **VUs:** 5 constant VUs, 30s
- **Request:** `GET /api/health`
- **Expect:** `200`
- **Risk:** None. Baseline for server responsiveness.

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
