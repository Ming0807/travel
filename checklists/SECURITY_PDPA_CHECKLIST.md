# SECURITY_PDPA_CHECKLIST.md

## 1. Document Purpose

This checklist defines security and PDPA/privacy readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist before:

```text
building authentication
building tourist data collection
building photo upload
building certificate generation
building dashboard
building export
deploying staging
deploying pilot/production
submitting academic demonstration
```

The platform handles tourist data, visit history, uploaded photos, certificates, optional survey answers, spending ranges, satisfaction data, admin accounts, exports, and dashboard analytics. These areas must be protected from the beginning.

---

## 2. Security and Privacy Mission

The mission is:

```text
Protect tourist data, uploaded files, certificates, admin operations, exports, and system trust while still enabling useful tourism planning analytics.
```

Security and privacy are not optional because the system collects real-world tourist participation data.

---

## 3. Related Documents

This checklist must align with:

```text
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/security/ROW_LEVEL_SECURITY.md
docs/security/AUDIT_LOGGING.md
docs/security/DATA_ANONYMIZATION.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/backend/AUTHORIZATION_RBAC.md
docs/backend/STORAGE_FILE_UPLOADS.md
docs/testing/SECURITY_TEST_PLAN.md
```

---

# Security Foundation Checklist

---

## 4. Security Baseline

Checklist:

```text
[ ] SECURITY.md exists.
[ ] Security requirements are documented.
[ ] PDPA/privacy design is documented.
[ ] Consent management is documented.
[ ] Role/permission matrix is documented.
[ ] RLS/storage strategy is documented.
[ ] Audit logging strategy is documented.
[ ] Data anonymization strategy is documented.
[ ] Image upload security strategy is documented.
[ ] Security test plan exists.
```

---

## 5. Environment Secret Safety

Checklist:

```text
[ ] .env.local is not committed.
[ ] .env.example contains variable names only.
[ ] SUPABASE_SERVICE_ROLE_KEY is server-only.
[ ] SUPABASE_DATABASE_URL is server-only.
[ ] DATABASE_URL is server-only if used.
[ ] LINE_CHANNEL_SECRET is server-only if used.
[ ] CRON_SECRET is server-only if used.
[ ] EXPORT_SIGNING_SECRET is server-only if used.
[ ] No private secrets appear in frontend bundle.
[ ] No private secrets appear in repository.
[ ] No secrets are logged.
```

Allowed public variables:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

Release blocker:

```text
SUPABASE_SERVICE_ROLE_KEY exposed to browser
```

---

## 6. Repository Secret Scan

Checklist:

```text
[ ] Repository has been checked for .env files.
[ ] Commit history has no known leaked service role key.
[ ] No API keys are hardcoded.
[ ] No database passwords are hardcoded.
[ ] No LINE secrets are hardcoded.
[ ] No test credentials for real accounts are committed.
```

Optional tools:

```text
gitleaks
trufflehog
git-secrets
```

---

# Authentication Checklist

---

## 7. Admin Authentication

Checklist:

```text
[ ] Admin login is implemented.
[ ] Admin logout is implemented.
[ ] Admin session is verified server-side.
[ ] Admin user must exist in admin_users table.
[ ] Inactive admin is blocked.
[ ] Anonymous user cannot access admin pages.
[ ] Anonymous user cannot access admin APIs.
[ ] Session expiry behavior is acceptable.
[ ] Login errors do not leak internals.
```

Protected areas:

```text
/admin
/admin/dashboard
/admin/attractions
/admin/checkin-codes
/admin/visits
/admin/reports
/admin/users
/api/admin/*
/api/dashboard/*
/api/exports/*
```

---

## 8. Tourist Authentication / Identity

Checklist:

```text
[ ] Tourist can use guest flow.
[ ] Guest flow does not require login.
[ ] Guest flow does not require LINE.
[ ] Guest flow does not require email.
[ ] Guest token/session id is random.
[ ] Guest token is not treated as admin identity.
[ ] Guest token is verified server-side.
[ ] Optional LINE identity linking is separate from required flow.
[ ] Optional email identity linking is future/planned only if needed.
```

Must not:

```text
[ ] require LINE for foreign tourists.
[ ] require email before certificate.
[ ] store admin permissions in browser as trusted authority.
```

---

# Authorization Checklist

---

## 9. Role and Permission Model

Required roles:

```text
[ ] super_admin
[ ] admin
[ ] viewer
```

Required permission groups:

```text
[ ] dashboard
[ ] attraction
[ ] photo_spot
[ ] checkin_code
[ ] media
[ ] visit
[ ] tourist
[ ] survey
[ ] certificate
[ ] stamp
[ ] export
[ ] official_data
[ ] audit
[ ] user
[ ] role
[ ] system
```

Checklist:

```text
[ ] Permission keys are documented.
[ ] Role-permission mapping is seeded.
[ ] Backend uses permission checks.
[ ] Frontend hides unavailable actions.
[ ] Backend does not rely only on frontend hiding.
[ ] Viewer role is read-only.
[ ] User/role management is super_admin-only.
```

---

## 10. Admin Permission Enforcement

Checklist:

```text
[ ] attraction.create requires permission.
[ ] attraction.update requires permission.
[ ] attraction.publish requires permission.
[ ] photo_spot.create requires permission.
[ ] checkin_code.create requires permission.
[ ] checkin_code.deactivate requires permission.
[ ] media.upload requires permission.
[ ] dashboard.read requires permission.
[ ] export actions require permission.
[ ] audit.read requires permission.
[ ] user.manage requires super_admin or equivalent.
```

Test direct API calls, not only UI buttons.

---

## 11. Tourist Ownership Enforcement

Checklist:

```text
[ ] Tourist can access only own passport.
[ ] Tourist can upload photo only to own visit.
[ ] Tourist can generate certificate only for own visit.
[ ] Tourist can submit survey only for own visit.
[ ] Tourist cannot access another tourist's certificate.
[ ] Tourist cannot access another tourist's uploaded photo.
[ ] Tourist cannot access another tourist's guest passport.
[ ] Ownership checks are server-side.
```

Safe response:

```text
403 forbidden
or 404 not found
```

Do not reveal unnecessary resource existence details.

---

# PDPA / Privacy Checklist

---

## 12. Data Minimization

Checklist:

```text
[ ] No national ID is collected.
[ ] No passport number is collected.
[ ] No full address is collected.
[ ] No exact birthdate is collected.
[ ] No phone number is required.
[ ] No email is required before certificate.
[ ] No LINE account is required before certificate.
[ ] Age group is used instead of exact age.
[ ] Origin is collected broadly.
[ ] Spending is collected as range.
[ ] Comment is optional.
```

The minimum tourist data before certificate should be:

```text
display name
origin country/province
age group
consent
photo for certificate
```

---

## 13. Purpose Limitation

Checklist:

```text
[ ] Each collected field has a documented purpose.
[ ] Certificate fields are used for certificate generation.
[ ] Travel behavior fields are used for planning analytics.
[ ] Expense fields are used for estimated economic insight.
[ ] Satisfaction fields are used for service improvement.
[ ] Funnel events are used for UX improvement.
[ ] Data is not reused for marketing without separate consent.
```

---

## 14. Privacy Notice

Checklist:

```text
[ ] Privacy notice exists.
[ ] Short privacy notice appears in tourist flow.
[ ] Full privacy notice page exists or is planned.
[ ] Notice explains certificate usage.
[ ] Notice explains aggregated planning usage.
[ ] Notice explains photo usage.
[ ] Notice explains survey optionality.
[ ] Notice explains passport save optionality.
[ ] Notice is available in Thai.
[ ] Notice is available in English if foreign users are supported.
```

---

## 15. Consent

Checklist:

```text
[ ] Consent checkbox exists before saving required tourist data.
[ ] Consent checkbox is not pre-checked.
[ ] Consent text is clear.
[ ] Consent version is stored.
[ ] Consent purpose is stored.
[ ] Consent source is stored.
[ ] Consent timestamp is stored.
[ ] Backend rejects missing consent.
[ ] Photo usage notice is shown before upload.
[ ] Survey optional notice is shown before survey.
[ ] LINE/email linking consent is separate if implemented.
[ ] Communication/marketing consent is separate if implemented.
```

Must not:

```text
[ ] combine certificate consent with marketing consent.
[ ] silently link LINE identity without notice.
[ ] require optional survey before certificate download.
```

---

## 16. Photo Privacy

Checklist:

```text
[ ] Tourist photo purpose is explained.
[ ] Tourist photo is used for certificate.
[ ] Tourist photo is not public by default.
[ ] Tourist photo storage is private/controlled.
[ ] Photo path contains no personal data.
[ ] Photo is not used for face recognition.
[ ] EXIF/GPS metadata is not used for hidden tracking.
[ ] EXIF stripping is planned for production if possible.
[ ] Photo deletion/anonymization strategy exists.
```

---

## 17. Certificate Privacy

Checklist:

```text
[ ] Certificate contains only necessary personal display data.
[ ] Certificate may contain display name and photo.
[ ] Certificate must not contain email.
[ ] Certificate must not contain LINE ID.
[ ] Certificate must not contain internal tourist ID.
[ ] Certificate must not contain full address.
[ ] Certificate file access is private/controlled.
[ ] Public sharing is user-initiated only if implemented.
[ ] Certificate deletion/revocation strategy exists.
```

---

## 18. Survey Privacy

Checklist:

```text
[ ] Survey is optional.
[ ] Survey appears after certificate reward.
[ ] Survey avoids sensitive personal questions.
[ ] Spending uses ranges, not exact income.
[ ] Comment is optional.
[ ] Comment length is limited.
[ ] Raw comments are not shown to all admins.
[ ] Raw comments are not exported by default.
[ ] Raw comments require special permission if exported.
```

---

## 19. Dashboard Privacy

Checklist:

```text
[ ] Dashboard is aggregated by default.
[ ] Dashboard does not show email.
[ ] Dashboard does not show LINE user ID.
[ ] Dashboard does not show provider_user_id.
[ ] Dashboard does not show guest token.
[ ] Dashboard does not show device token.
[ ] Dashboard does not show raw IP/user agent.
[ ] Dashboard does not show private photo path.
[ ] Dashboard does not show private certificate path.
[ ] Dashboard does not show raw comments by default.
```

---

## 20. Export Privacy

Default exports must exclude:

```text
[ ] email
[ ] LINE user ID
[ ] provider_user_id
[ ] guest token
[ ] device token
[ ] raw IP
[ ] raw user agent
[ ] raw photo path
[ ] private certificate path
[ ] raw comments unless permitted
```

Checklist:

```text
[ ] Export requires authentication.
[ ] Export requires permission.
[ ] Export filters are validated.
[ ] Export creates audit log.
[ ] Export file is private if stored.
[ ] Export file expires if stored.
[ ] CSV headers are privacy-safe.
[ ] Export does not include hidden internal identifiers unless intended.
```

---

# Database and RLS Checklist

---

## 21. Sensitive Tables

Sensitive tables should not be publicly readable:

```text
[ ] tourists
[ ] tourist_identities
[ ] visits
[ ] visit_photos
[ ] certificates
[ ] satisfaction_surveys
[ ] visit_expenses
[ ] consent_records
[ ] audit_logs
[ ] export_jobs
[ ] admin_users
[ ] roles
[ ] permissions
```

---

## 22. Public Tables / Views

Public-safe read may be allowed for:

```text
[ ] published active attractions
[ ] public attraction images
[ ] public reference data
[ ] stamp assets
```

Checklist:

```text
[ ] Public read is limited to published/active content.
[ ] Draft content is not public.
[ ] Admin notes are not public.
[ ] Private storage paths are not public.
```

---

## 23. RLS Requirements

Checklist:

```text
[ ] RLS strategy is documented.
[ ] RLS enabled on sensitive tables if direct Supabase client access exists.
[ ] Anonymous cannot read sensitive tables.
[ ] Viewer cannot update restricted tables.
[ ] Admin access is permission-based or server-controlled.
[ ] Service role key is never exposed to browser.
[ ] Storage policies match bucket privacy design.
```

---

# Storage Security Checklist

---

## 24. Bucket Access

Checklist:

```text
[ ] attraction-media bucket access is public read/admin write.
[ ] stamp-assets bucket access is public read/admin write.
[ ] visit-photos bucket is private/controlled.
[ ] certificate-files bucket is private/controlled.
[ ] export-files bucket is private.
[ ] official-imports bucket is private.
[ ] temp-uploads bucket is private.
[ ] Public write is disabled.
[ ] Bucket policies are reviewed.
```

---

## 25. Signed URL Safety

Checklist:

```text
[ ] Signed URLs are short-lived.
[ ] Signed URLs are generated server-side.
[ ] Signed URLs are not stored permanently.
[ ] Expired signed URLs fail.
[ ] Raw private storage paths are not exposed unnecessarily.
```

---

# Image Upload Security Checklist

---

## 26. Tourist Upload Validation

Checklist:

```text
[ ] JPEG accepted.
[ ] PNG accepted.
[ ] WebP accepted.
[ ] SVG rejected.
[ ] PDF rejected.
[ ] HTML/JS disguised as image rejected.
[ ] Empty file rejected.
[ ] Oversized file rejected.
[ ] MIME type checked server-side.
[ ] File extension not trusted alone.
[ ] File path generated server-side.
[ ] File path contains no personal data.
[ ] Visit ownership checked before upload.
```

---

## 27. Admin Upload Validation

Checklist:

```text
[ ] Admin upload requires permission.
[ ] Viewer upload is rejected.
[ ] Invalid file types rejected.
[ ] Large files rejected.
[ ] Storage path generated server-side.
[ ] Audit log created for admin media upload/update/delete.
```

---

# API Security Checklist

---

## 28. Public API Safety

Checklist:

```text
[ ] Public attraction API returns only public data.
[ ] QR resolve API returns only safe context.
[ ] Invalid QR response is safe.
[ ] Public APIs do not expose admin notes.
[ ] Public APIs do not expose private storage paths.
[ ] Public APIs do not expose raw database errors.
```

---

## 29. Admin API Safety

Checklist:

```text
[ ] Admin APIs require authentication.
[ ] Admin APIs check permissions.
[ ] Admin APIs validate input.
[ ] Admin APIs audit sensitive actions.
[ ] Admin APIs return safe errors.
[ ] Admin APIs do not expose secrets.
```

---

## 30. Tourist API Safety

Checklist:

```text
[ ] Tourist APIs validate guest/session token.
[ ] Tourist APIs verify ownership.
[ ] Tourist APIs validate input.
[ ] Tourist APIs do not expose other tourists' data.
[ ] Tourist APIs return safe errors.
```

---

# Error and Logging Checklist

---

## 31. Safe Error Responses

User-facing errors must not include:

```text
[ ] stack trace
[ ] SQL query
[ ] SQLSTATE details
[ ] Supabase raw error object
[ ] service role key
[ ] database URL
[ ] storage bucket internals
[ ] private file path
[ ] provider_user_id
```

Errors should include:

```text
[ ] stable error code
[ ] user-safe message
[ ] field-level errors where useful
```

---

## 32. Application Logs

Logs must not include:

```text
[ ] passwords
[ ] tokens
[ ] service role key
[ ] LINE token
[ ] raw guest token
[ ] raw provider_user_id
[ ] signed URL
[ ] raw uploaded file content
[ ] full request body with personal data
```

---

# Audit Logging Checklist

---

## 33. Required Audit Events

Audit:

```text
[ ] data export
[ ] personal data export attempt
[ ] raw comment export
[ ] attraction create/update/publish/deactivate
[ ] photo spot create/update/deactivate
[ ] check-in code create/update/deactivate
[ ] admin media upload/update/delete
[ ] user role assignment/removal
[ ] admin user deactivation
[ ] official data import
[ ] sensitive permission denied events
[ ] anonymization/deletion actions
```

---

## 34. Audit Log Safety

Checklist:

```text
[ ] Audit logs require audit.read permission.
[ ] Viewer cannot access audit logs.
[ ] Normal admin cannot access audit logs unless permitted.
[ ] Audit metadata is sanitized.
[ ] Audit logs do not store secrets.
[ ] Export audit includes filters and row count.
[ ] Audit log retention is documented.
```

---

# LINE LIFF Optional Checklist

---

## 35. LINE Optionality

Checklist:

```text
[ ] LINE is optional.
[ ] Guest flow works without LINE.
[ ] Foreign tourist path works without LINE.
[ ] LINE linking happens after certificate or as optional save.
[ ] LINE linking consent is separate.
[ ] LINE linking does not imply marketing consent.
```

---

## 36. LINE Security

If implemented:

```text
[ ] LINE ID token is verified server-side.
[ ] Frontend-provided LINE user ID is not trusted alone.
[ ] Invalid/expired token rejected.
[ ] Wrong audience token rejected.
[ ] LINE provider_user_id is not shown in dashboard.
[ ] LINE provider_user_id is not exported by default.
```

---

# Cron / Background Job Security Checklist

---

## 37. Cron Protection

Checklist:

```text
[ ] Cron endpoints require CRON_SECRET or platform protection.
[ ] Wrong/missing secret is rejected.
[ ] Cleanup jobs cannot be triggered by anonymous users.
[ ] Summary refresh jobs are protected.
[ ] Export cleanup jobs are protected.
[ ] Job logs are safe.
```

---

# Data Retention and Anonymization Checklist

---

## 38. Data Retention

Checklist:

```text
[ ] Data retention policy exists.
[ ] Export file retention is short.
[ ] Temp upload cleanup is planned.
[ ] Orphan file cleanup is planned.
[ ] Audit log retention is defined.
[ ] Tourist photo retention is defined or planned.
[ ] Certificate retention is defined or planned.
```

---

## 39. Anonymization

Checklist:

```text
[ ] Anonymization strategy exists.
[ ] Tourist direct identifiers can be removed.
[ ] Tourist identities can be unlinked/deleted.
[ ] Photos can be deleted.
[ ] Certificates can be deleted/revoked.
[ ] Raw comments can be redacted.
[ ] Planning analytics can be preserved where safe.
[ ] Anonymization action is audited.
```

---

# Security Testing Checklist

---

## 40. Required Security Tests

```text
[ ] Anonymous cannot access admin.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Admin cannot manage users unless permitted.
[ ] Tourist cannot access another tourist's data.
[ ] Consent is required.
[ ] Invalid file types are rejected.
[ ] Large files are rejected.
[ ] Private storage files are not public.
[ ] Dashboard excludes identifiers.
[ ] Export excludes identifiers.
[ ] Export creates audit log.
[ ] Service role key not in frontend bundle.
[ ] Error responses are safe.
```

---

# Release Blockers

---

## 41. Critical Security/PDPA Blockers

Do not release if:

```text
[ ] Service role key is exposed.
[ ] Anonymous user can access admin data.
[ ] Viewer can create/update/delete data.
[ ] Viewer can export detailed data.
[ ] Tourist can access another tourist's photo/certificate/passport.
[ ] Tourist photos are public unintentionally.
[ ] Certificates are public unintentionally.
[ ] Export includes email/LINE ID/provider_user_id by default.
[ ] Consent is not collected.
[ ] Dangerous file upload types are accepted.
[ ] Raw SQL/stack traces are visible to users.
[ ] LINE is required for all tourists.
```

---

## 42. MVP Security/PDPA Acceptance Checklist

```text
[ ] Data minimization is applied.
[ ] Consent is collected and recorded.
[ ] LINE/email are optional.
[ ] Admin auth works.
[ ] Permission checks work.
[ ] Tourist ownership checks work.
[ ] Storage buckets are configured safely.
[ ] File upload validation works.
[ ] Dashboard is aggregated and privacy-safe.
[ ] Exports are permission-controlled and privacy-safe.
[ ] Audit logging exists for exports and critical admin actions.
[ ] Secrets are server-only.
[ ] Safe error handling exists.
[ ] Data retention/anonymization is documented.
```

---

## 43. Do Not Do

Do not:

```text
put service role key in frontend.
trust localStorage role.
trust tourist_id from browser.
require LINE for every tourist.
collect national ID.
collect full address.
make tourist photos public by default.
export LINE IDs by default.
show raw comments to all admins.
log secrets.
store signed URLs permanently.
allow SVG tourist uploads.
skip audit log for exports.
```

---

## 44. Final Security/PDPA Rule

Security and privacy must be built into the product, not added after the UI is finished.

The system should collect useful tourism planning data without over-collecting or exposing personal data.
