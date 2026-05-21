# DATA_FLOW.md

## 1. Purpose

This document describes how data flows through the system from QR scan to dashboard display.

---

## 2. End-to-End Data Flow

```text
                    TOURIST DEVICE                     SERVER                          DATABASE
                    ─────────────                     ──────                          ────────

1. QR Scan          ──▶ GET /c/[code]          ──▶ Resolve checkin_code      ──▶ checkin_codes
                                                    Load attraction               attractions
                                                    Load photo_spot              photo_spots
                                                    Track funnel event     ──▶ funnel_events

2. Landing Page     ◀── Attraction info        ◀── Query attraction data   ◀── attractions
                        Photo spot info                                        attraction_images

3. Photo Upload     ──▶ POST file              ──▶ Validate file
                                                    Upload to storage      ──▶ Storage adapter
                                                    Store metadata         ──▶ visit_photos

4. Minimal Form     ──▶ POST form data         ──▶ Validate with Zod
                                                    Create/find tourist    ──▶ tourists
                                                    Create identity        ──▶ tourist_identities
                                                    Log consent            ──▶ consent_logs
                                                    Create visit           ──▶ visits

5. Certificate      ◀── Generated image        ◀── Render template
                                                    Upload to storage      ──▶ Storage adapter
                                                    Store record           ──▶ certificates

6. Stamp            ◀── Stamp earned notice    ◀── Check uniqueness
                                                    Create stamp           ──▶ tourist_stamps

7. Survey           ──▶ POST survey data       ──▶ Validate answers
                                                    Update visit behavior  ──▶ visits (update)
                                                    Store expenses         ──▶ visit_expenses
                                                    Store satisfaction     ──▶ satisfaction_surveys

8. Dashboard        ◀── Charts & metrics       ◀── Aggregate queries     ◀── summary tables
                                                                              or direct queries
```

---

## 3. Data Flow by Module

### 3.1 Check-in Code Resolution

```text
Input:  checkinCode (string from URL)
Process:
    1. Query checkin_codes WHERE code = :code AND is_active = true
    2. Join attraction and photo_spot
    3. Check campaign if campaign_id exists
    4. Insert funnel_event (type: 'qr_scanned')
Output: { attraction, photoSpot, campaign } or error
```

### 3.2 Tourist Identity Resolution

```text
Input:  guestToken (from browser localStorage) OR lineUserId OR email
Process:
    1. Query tourist_identities WHERE provider_key = :token
    2. If found → load tourist profile
    3. If not found → prepare for new profile creation
    4. If Google/LINE → check for existing linked identity
    5. Handle identity merging if guest links to Google/LINE
Output: { tourist, isNew, identityType }
```

### 3.3 Visit Record Creation

```text
Input:  touristId, attractionId, photoSpotId, visitDate, formData
Process:
    1. Create or update tourist profile
    2. Insert consent_log
    3. Insert visit record
    4. Link photo to visit
    5. Insert funnel_event (type: 'form_completed')
Output: { visitId, touristId }
```

### 3.4 Certificate Generation

```text
Input:  visitId, touristName, attractionName, visitDate, photoUrl, templateId
Process:
    1. Load certificate template
    2. Compose certificate image (server-side rendering)
    3. Upload generated image through the storage adapter
    4. Insert certificate record with file path
    5. Insert funnel_event (type: 'certificate_generated')
Output: { certificateId, downloadUrl }
```

### 3.5 Dashboard Aggregation

```text
Input:  filters (dateRange, provinceId, attractionId)
Process:
    1. Query summary tables OR aggregate from raw tables
    2. Calculate metrics (totals, averages, distributions)
    3. Format for chart consumption
    4. Cache results if applicable
Output: { metrics, chartData, filters }
```

---

## 4. Data Transformation Points

| Point | Input Format | Output Format | Transformation |
|---|---|---|---|
| QR scan | URL string | Database lookup | Code resolution + validation |
| Photo upload | Binary file | Storage URL + metadata | Validation + upload + thumbnail |
| Form submission | JSON form data | Database rows | Zod validation + normalization |
| Certificate render | Data + template | Image file | Server-side rendering |
| Dashboard query | Raw table data | Chart-ready JSON | Aggregation + calculation |
| Data export | Database rows | CSV file | Filtering + formatting + anonymization |

---

## 5. Data Storage Locations

| Data Type | Storage | Format |
|---|---|---|
| Tourist profiles | PostgreSQL `tourists` | Relational rows |
| Visit records | PostgreSQL `visits` | Relational rows |
| Survey responses | PostgreSQL `satisfaction_surveys` | Relational rows |
| Photos (original) | Storage adapter logical `visit-photos` bucket/folder | Binary files (JPEG/PNG/WebP) |
| Photos (thumbnail) | Storage adapter logical `visit-photos` bucket/folder | Binary files (WebP), future |
| Certificates | Storage adapter logical `certificate-files` bucket/folder | Binary files (PNG/WebP) |
| Templates | Storage adapter logical `certificate-files` or public media bucket/folder | Binary files (PNG), future |
| Funnel events | PostgreSQL `funnel_events` | Relational rows |
| Dashboard cache | PostgreSQL `daily_attraction_stats` | Summary rows |
| Audit logs | PostgreSQL `audit_logs` | Relational rows |

---

## 6. Data Retention

| Data Type | Retention | Reason |
|---|---|---|
| Tourist profiles | Indefinite (anonymized after 2 years) | Planning analysis |
| Visit records | Indefinite | Historical analysis |
| Photos | 1 year after visit | Storage management |
| Certificates | Indefinite | Tourist value |
| Funnel events | 1 year | Analytics |
| Audit logs | 3 years | Compliance |
| Survey responses | Indefinite | Research value |

See `docs/database/DATA_RETENTION_POLICY.md` for full policy.
