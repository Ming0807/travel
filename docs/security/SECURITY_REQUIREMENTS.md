# SECURITY_REQUIREMENTS.md

## 1. Document Purpose

This document defines the security requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The platform stores tourist profiles, visit records, photos, certificates, survey responses, spending ranges, satisfaction scores, admin data, exports, and dashboard analytics.

Security must be planned from the beginning because this system is intended to look and behave like a real production system.

---

## 2. Security Mission

The security mission is:

```text
Protect tourist data, admin operations, system integrity, and public trust while still enabling useful tourism planning analytics.
```

Security must protect:

```text
tourist privacy
uploaded photos
certificate files
admin accounts
database integrity
exports
dashboard access
storage buckets
API routes
environment secrets
audit trail
```

---

## 3. Security Scope

This document applies to:

```text
frontend application
backend APIs/server actions
Supabase/PostgreSQL database
Supabase Storage
admin authentication
tourist guest identity
optional LINE LIFF identity
dashboard
exports
background jobs
deployment environment
developer workflow
```

---

## 4. Security Principles

## 4.1 Privacy by Design

Collect only the data needed for:

```text
certificate generation
tourist database
travel behavior analysis
expense analysis
satisfaction analysis
dashboard planning
```

Avoid unnecessary personal data.

## 4.2 Least Privilege

Users and services should have only the permissions they need.

Examples:

- public users cannot access admin APIs.
- tourists cannot access other tourists' records.
- viewers cannot export detailed data.
- service role key is server-only.
- storage buckets are not all public.

## 4.3 Defense in Depth

Use multiple layers:

```text
frontend UX restrictions
backend authentication
backend authorization
input validation
database constraints
RLS policies where appropriate
storage policies
audit logs
environment secret protection
```

## 4.4 Secure Defaults

Default behavior should be safe.

Examples:

- survey comments are not exported by default.
- tourist photos are not public by default.
- guest access is limited to own flow/passport.
- admin actions require authentication.
- exports are permission-controlled.

## 4.5 Do Not Trust the Client

Never trust:

```text
role from localStorage
tourist_id from localStorage
visit_id without ownership check
file type from frontend only
hidden input values
frontend-only validation
```

---

## 5. Data Classification

## 5.1 Public Data

Examples:

```text
published attraction information
published attraction images
province/district names
public tourism content
public stamp graphics
```

Access:

```text
public read
admin write
```

## 5.2 Internal Operational Data

Examples:

```text
check-in codes
admin attraction drafts
photo spots
visit records
dashboard metrics
funnel events
audit logs
```

Access:

```text
authenticated admin or authorized backend only
```

## 5.3 Personal Data

Examples:

```text
tourist display name
origin country/province
age group
preferred language
LINE-linked identity
email future
uploaded photo
certificate image
survey comments
visit history
```

Access:

```text
strictly limited by role/ownership
```

## 5.4 Sensitive Secrets

Examples:

```text
Supabase service role key
database password
LINE channel secret
CRON_SECRET
storage credentials
deployment tokens
```

Access:

```text
server environment only
never committed
never exposed to browser
```

---

## 6. Data Minimization Requirements

Do collect:

```text
display name for certificate
origin country/province
age group
preferred language
visit date
travel behavior
spending range
satisfaction score
optional comment
```

Avoid collecting:

```text
national ID
full address
phone number
exact date of birth
religion
ethnicity
health information
income
precise home address
```

Do not add sensitive fields unless there is a clear requirement and privacy/legal review.

---

## 7. Authentication Requirements

## 7.1 Admin Authentication

Admin routes require authentication.

Recommended:

```text
Supabase Auth
```

Protected routes:

```text
/admin/*
/api/admin/*
/api/dashboard/*
/api/exports/*
```

Admin sessions must be checked server-side.

## 7.2 Tourist Authentication

Tourist flow should not require login.

Supported:

```text
guest token
LINE optional
email optional future
```

Tourist identity must not grant admin access.

## 7.3 Optional LINE Identity

LINE LIFF can be used to save passport identity, but must be optional.

Foreign tourists or users without LINE must still be able to use guest flow.

---

## 8. Authorization Requirements

Authorization must be enforced server-side.

Required role/permission model:

```text
super_admin
admin
viewer
staff future
researcher future
```

Important permissions:

```text
dashboard.read
attraction.create
attraction.update
checkin_code.create
visit.read
survey.read
export.create
user.manage
audit.read
```

See:

```text
docs/backend/AUTHORIZATION_RBAC.md
docs/security/ROLE_PERMISSION_MATRIX.md
```

---

## 9. Tourist Ownership Requirements

Tourists can access only their own data.

Backend must verify:

```text
guest token maps to tourist
visit belongs to tourist
photo belongs to visit
certificate belongs to visit
survey belongs to visit
passport belongs to tourist
```

Do not trust:

```text
tourist_id from browser
visit_id from localStorage
role from client
```

---

## 10. API Security Requirements

Every API/server action must:

```text
validate input
check authentication if required
check permission if required
verify ownership if tourist data
return safe response
avoid raw internal errors
```

Public APIs must only return safe public data.

Admin APIs must require admin auth.

Export APIs must require export permission.

---

## 11. Input Validation Requirements

Validate:

```text
QR/check-in code
tourist profile form
visit creation
photo upload
certificate generation
survey submission
admin attraction form
photo spot form
check-in code form
dashboard filters
export filters
```

Use:

```text
Zod or equivalent
```

Server-side validation is mandatory.

Frontend validation is not enough.

---

## 12. File Upload Security

File uploads are high risk.

## 12.1 Tourist Photos

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Recommended max size:

```text
5 MB
```

Do not allow SVG for tourist upload.

## 12.2 Storage Path

Backend must generate path.

Do not include:

```text
tourist name
email
LINE ID
device token
original filename
```

## 12.3 File Content

MVP:

```text
validate MIME and size
```

Production:

```text
strip EXIF
generate thumbnails
scan/inspect uploads if possible
moderation workflow if needed
```

See:

```text
docs/backend/STORAGE_FILE_UPLOADS.md
docs/security/IMAGE_UPLOAD_SECURITY.md
```

---

## 13. Storage Security Requirements

Recommended buckets:

```text
attraction-media
visit-photos
certificate-files
stamp-assets
export-files
official-imports
temp-uploads
```

Access strategy:

```text
attraction-media: public read, admin write
stamp-assets: public read, admin write
visit-photos: private/signed URL
certificate-files: private/signed URL or controlled public share
export-files: private/signed URL, short retention
official-imports: private
temp-uploads: private, cleanup
```

Never expose service role key to frontend.

---

## 14. Certificate Security Requirements

Certificate includes:

```text
display name
photo
attraction
visit date
```

This may identify a person.

Rules:

- do not publish certificate publicly by default.
- do not include email, LINE ID, internal tourist ID, or device token.
- use signed URL or controlled sharing where possible.
- public share must be user-initiated.
- storage path must not contain personal data.

---

## 15. Dashboard Security Requirements

Dashboard requires:

```text
admin authentication
dashboard.read permission
```

Dashboard must not show direct personal identifiers by default.

Do not show:

```text
email
LINE user ID
provider_user_id
device token
raw uploaded photo path
private certificate URL
```

Dashboard must use aggregated data where possible.

---

## 16. Export Security Requirements

Exports are high risk.

Every export must:

```text
require permission
validate filters
exclude personal identifiers by default
create audit log
use private download if stored
expire stored export files
```

Default exports must not include:

```text
email
LINE user ID
provider_user_id
device token
raw photo path
private certificate URL
raw comments unless permitted
```

See:

```text
docs/backend/EXPORT_REPORTING_SERVICES.md
```

---

## 17. Survey and Comment Security

Survey data may include personal or sensitive content, especially in free-text comments.

Rules:

- comment field is optional.
- limit comment length.
- do not show raw comments to all admin users.
- restrict comment export.
- consider moderation/topic tagging later.
- avoid collecting sensitive personal attributes.

---

## 18. Consent Requirements

The system must collect consent before saving required tourist data.

Consent should explain:

```text
data used to create certificate
data used for tourism planning in aggregated form
photo used for certificate
survey is optional
passport save is optional
```

Record:

```text
tourist_id
visit_id optional
consent_version
purpose
has_consented
consented_at
source
```

See:

```text
docs/security/CONSENT_MANAGEMENT.md
docs/security/PDPA_PRIVACY_DESIGN.md
```

---

## 19. PDPA-Oriented Privacy Requirements

The project is in Thailand, so design should consider PDPA principles.

Core requirements:

```text
purpose limitation
data minimization
consent where needed
access control
secure storage
retention policy
data subject request readiness
privacy notice
audit logs for sensitive actions
```

This document is not legal advice, but the system should be designed responsibly.

---

## 20. Database Security Requirements

Database must enforce:

```text
foreign keys
unique constraints
check constraints
indexes
least-privilege access
RLS policies if direct client access is used
```

Critical constraints:

```text
unique attractions.slug
unique checkin_codes.code
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
unique satisfaction_surveys(visit_id) recommended
score range checks
status value checks
```

---

## 21. Row Level Security Requirements

If using Supabase direct client access, RLS must be enabled and carefully designed.

Recommended:

- public read only for published attraction content.
- no public read for tourist identities.
- no public read for visit photos.
- admin writes go through secure server actions or RLS-backed policies.
- storage access controlled by bucket policies.

See:

```text
docs/security/ROW_LEVEL_SECURITY.md
```

---

## 22. Environment Secret Requirements

Secrets must be stored only in environment variables.

Examples:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
```

Public-safe variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LIFF_ID
```

Rules:

- never commit `.env`.
- never expose service role key.
- never log secrets.
- rotate secrets if leaked.
- use `.env.example` for documentation.

---

## 23. Frontend Security Requirements

Frontend must not contain:

```text
service role key
database password
LINE channel secret
admin-only tokens
hardcoded private credentials
```

Frontend may contain:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
public LIFF ID
```

Frontend must treat all localStorage/sessionStorage values as untrusted.

---

## 24. Admin Security Requirements

Admin UI must:

```text
require login
hide actions by permission
still enforce backend permissions
protect export actions
confirm destructive actions
avoid displaying sensitive fields by default
log important actions
```

Destructive actions:

```text
deactivate attraction
deactivate check-in code
deactivate photo spot
delete/archive file
export data
change user role
```

must require confirmation and permission.

---

## 25. Audit Logging Requirements

Audit important actions:

```text
admin login failure if available
attraction create/update/publish/deactivate
photo spot create/update/deactivate
check-in code create/update/deactivate
media upload/deactivate
export generated
official data imported
role/user updated
permission denied for sensitive action
```

Audit fields:

```text
actor_user_id
action
entity_type
entity_id
old_values_json
new_values_json
metadata_json
created_at
```

Do not log secrets.

See:

```text
docs/security/AUDIT_LOGGING.md
```

---

## 26. Error Handling Security

Do not expose:

```text
stack traces
SQL queries
SQLSTATE details
Supabase internal error object
storage bucket internals
secret values
```

Use safe messages:

```text
Could not save changes. Please try again.
You do not have permission to perform this action.
This QR code is currently not available.
```

See:

```text
docs/backend/VALIDATION_ERROR_HANDLING.md
```

---

## 27. Rate Limiting and Abuse Protection

Production should consider rate limits for:

```text
photo upload
certificate generation
funnel event creation
survey submission
admin login
export generation
cron endpoints
```

MVP may not implement full rate limiting, but should avoid unlimited upload abuse.

At minimum:

- file size limits
- auth checks
- permission checks
- duplicate prevention
- reasonable validation

---

## 28. Background Job Security

Background jobs must be protected.

If using cron endpoints:

```text
Authorization: Bearer CRON_SECRET
```

or platform-protected cron.

Jobs must not be public.

Sensitive jobs:

```text
cleanup files
refresh summaries
generate exports
anonymize data
official data import
```

must use secure server-side credentials only.

See:

```text
docs/backend/BACKGROUND_JOBS.md
```

---

## 29. Data Retention Requirements

The platform must define retention rules for:

```text
tourist profiles
visit records
uploaded photos
certificate files
survey responses
funnel events
export files
audit logs
official import files
temp uploads
```

General principle:

```text
keep planning data as long as needed
delete or anonymize personal data when no longer needed
expire exports quickly
cleanup temp/orphan files
```

See:

```text
docs/database/DATA_RETENTION_POLICY.md
docs/security/DATA_ANONYMIZATION.md
```

---

## 30. Data Anonymization Requirements

Future anonymization should:

```text
remove direct identifiers
preserve aggregate planning value
preserve visit/attraction/province metrics
remove or anonymize display name
unlink identity provider data
remove private photos if required
```

Do not break dashboard aggregates unnecessarily.

---

## 31. LINE LIFF Security Requirements

If using LINE LIFF:

- verify LINE identity token server-side.
- do not trust frontend LINE profile alone.
- store provider identity in `tourist_identities`.
- do not expose LINE user ID in dashboard/export.
- LINE linking must be optional.
- separate passport saving from marketing notification consent.
- do not send messages without consent.

See:

```text
docs/modules/MODULE_12_LINE_LIFF_OPTIONAL.md
```

---

## 32. QR and Check-in Security

QR codes are public entry points.

Rules:

- QR code resolves only active check-in code.
- inactive/expired QR returns safe error.
- QR scan does not create full tourist visit automatically.
- check-in code values must be unique and URL-safe.
- admin can deactivate QR codes.
- QR endpoints should not expose admin data.

---

## 33. PWA and Browser Storage Security

Browser storage can be modified by users.

Allowed in localStorage/sessionStorage:

```text
guest token
language preference
non-sensitive flow context
session id
```

Do not store:

```text
admin role
service key
email
LINE user ID
uploaded photo base64
large personal profile data
private certificate URL long-term
```

All browser-stored IDs must be verified server-side.

---

## 34. Content Security Considerations

Public attraction content may include rich text, URLs, and 360 media.

Rules:

- sanitize rich text.
- validate external URLs.
- avoid unsafe script embeds.
- control iframe/embed sources.
- avoid rendering untrusted HTML directly.

Future production should consider:

```text
Content Security Policy
allowed image domains
allowed iframe domains
```

---

## 35. Dependency Security

Use trusted packages.

Requirements:

```text
keep dependencies updated
avoid abandoned packages
review packages that handle auth, upload, image rendering, CSV export
run npm audit or equivalent
avoid installing random packages from unknown sources
```

Codex or AI agents should not add dependencies without reason.

---

## 36. Deployment Security

Production deployment must ensure:

```text
HTTPS
secure environment variables
no debug mode
no public service keys
protected admin routes
database backups
storage bucket policies
log access control
cron secret protection
```

See:

```text
DEPLOYMENT.md
ENVIRONMENT.md
```

---

## 37. Backup and Recovery

Production should plan:

```text
database backup
storage backup strategy
migration rollback
export of critical data
recovery procedure
```

MVP may rely on Supabase backup capabilities, but production should document clearly.

---

## 38. Security Testing Requirements

Test:

```text
anonymous cannot access admin
viewer cannot export
tourist cannot access another tourist passport
invalid QR does not leak details
inactive QR blocked
file upload invalid type rejected
large file rejected
service role not exposed in browser
admin API rejects unauthenticated request
export excludes personal identifiers
storage private files not public
RLS policies if enabled
cron endpoints protected
```

---

## 39. Security Acceptance Checklist

```text
[ ] Admin routes require authentication.
[ ] Admin write actions require permission.
[ ] Export actions require permission.
[ ] Tourist ownership checks exist.
[ ] Server-side validation exists.
[ ] Service role key is server-only.
[ ] No secrets are committed.
[ ] Tourist photos are not public by default.
[ ] Certificate files use controlled access.
[ ] Default exports exclude direct identifiers.
[ ] Consent is recorded.
[ ] Audit logs exist or are planned.
[ ] Storage buckets have access strategy.
[ ] Error messages do not leak internals.
[ ] File uploads validate type and size.
[ ] QR code resolution is safe.
[ ] Browser storage is not trusted.
```

---

## 40. Do Not Do

Do not:

```text
Expose Supabase service role key in frontend.
Trust admin role from localStorage.
Trust tourist_id from localStorage.
Make all storage buckets public.
Export personal data by default.
Show LINE user IDs in dashboard.
Allow SVG tourist uploads.
Store uploaded files as base64 in database.
Show raw SQL errors.
Skip backend permission checks because UI hides buttons.
Leave cron endpoints public.
Store secrets in git.
```

---

## 41. Future Security Enhancements

Possible future improvements:

```text
full RLS policy set
security event monitoring
admin IP/session monitoring
2FA for admins
file malware scanning
EXIF stripping pipeline
privacy request workflow
data anonymization admin tool
export approval workflow
CSP hardening
automated dependency scanning
penetration testing checklist
```

---

## 42. Final Security Rule

Security is not a final step before deployment.

It is part of database design, API design, UX design, dashboard design, export design, and operational workflow from the beginning.
