# ROW_LEVEL_SECURITY.md

## 1. Document Purpose

This document defines Row Level Security (RLS) strategy for the **Southern Border Tourism Data & Intelligence Platform** when using Supabase/PostgreSQL.

RLS is important because the platform stores tourist profiles, identities, visits, photos, certificates, surveys, dashboard data, admin data, and exports.

This document explains which tables should be public, which should be protected, which should be accessed only through server-side code, and how policies should be designed.

---

## 2. RLS Mission

The RLS mission is:

```text
Ensure database-level protection so users can only access rows they are allowed to access.
```

RLS is a safety layer below frontend and backend authorization.

Even if frontend code is bypassed, database access should still be protected.

---

## 3. Important Supabase Security Rule

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

The service role bypasses RLS.

It must be used only in trusted server-side environments.

Browser clients should use:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

with RLS policies.

---

## 4. Architecture Choice

There are two safe patterns.

## 4.1 Server-Controlled Access Pattern

Frontend calls:

```text
Next.js Server Actions / API routes
```

Backend uses:

```text
server-side Supabase client
```

with either:

```text
user session + RLS
```

or carefully controlled:

```text
service role
```

Business rules are enforced in services.

This is recommended for complex tourist/admin workflows.

## 4.2 Direct Client Access Pattern

Frontend directly queries Supabase using anon/auth client.

This requires strict RLS on every table.

Use only for simple public reads or well-defined authenticated reads.

## 4.3 Recommended MVP

Recommended MVP approach:

```text
Public attraction reads can be direct or server-rendered.
Tourist writes should go through server actions/API routes.
Admin writes should go through server actions/API routes.
Sensitive storage access should go through server-side signed URLs.
```

This reduces RLS complexity while still allowing database security.

---

## 5. RLS Design Principles

## 5.1 Public Data Must Be Explicitly Public

Only published and active attraction content should be public.

## 5.2 Tourist Data Must Be Owner-Scoped

A tourist can access only their own:

```text
profile
passport
visits
photos
certificates
survey responses
```

## 5.3 Admin Data Must Require Admin Role

Admin access should be based on authenticated admin user and permissions.

## 5.4 Service Role Must Be Controlled

If service role is used, backend must enforce authorization manually.

## 5.5 No Broad Public Select

Avoid policies like:

```sql
using (true)
```

on sensitive tables.

---

## 6. Table Classification

## 6.1 Public Read Tables

Possible public read:

```text
provinces
districts
countries
attraction_types
published attractions
published attraction_images
published public_360_media
stamp_assets
```

## 6.2 Tourist-Owned Tables

Tourist-owned or flow-owned:

```text
tourists
tourist_identities
visits
visit_photos
certificates
tourist_stamps
satisfaction_surveys
visit_expenses
consent_records
```

## 6.3 Admin-Only Tables

Admin-only:

```text
admin_users
roles
permissions
role_permissions
admin_user_roles
checkin_codes admin fields
audit_logs
export_jobs
data_import_logs
official_tourism_stats management
background_job_runs
```

## 6.4 System/Internal Tables

System/internal:

```text
funnel_events
summary tables
analytics tables
materialized views
job tables
```

Usually accessed by backend services.

---

## 7. Public Content RLS

## 7.1 Attractions Public Read

Public users should only read:

```text
is_published = true
and is_active = true
```

Conceptual policy:

```sql
create policy "Public can read published active attractions"
on attractions
for select
to anon, authenticated
using (
  is_published = true
  and is_active = true
);
```

Admin full read should use admin policy or server-side access.

---

## 7.2 Attraction Images Public Read

Public users should only read active images for published attractions.

Conceptual policy:

```sql
create policy "Public can read active images for published attractions"
on attraction_images
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from attractions a
    where a.attraction_id = attraction_images.attraction_id
      and a.is_published = true
      and a.is_active = true
  )
);
```

---

## 7.3 Reference Tables Public Read

Reference tables can be public if they contain no sensitive data.

Examples:

```text
provinces
districts
countries
attraction_types
transport_modes
travel_purposes
travel_companions
expense_categories
```

Conceptual policy:

```sql
create policy "Public can read reference table"
on provinces
for select
to anon, authenticated
using (true);
```

This is acceptable only for safe master/reference data.

---

## 8. Check-in Code RLS

Check-in codes are tricky.

Tourists need to resolve active QR codes, but admin details should be protected.

Recommended:

- do not expose full `checkin_codes` table directly to public.
- use server route `GET /api/checkin/[code]`.
- backend returns safe public check-in context only.

If direct RLS is used, expose only via a view:

```text
public_active_checkin_codes
```

The view should include only:

```text
code
attraction_id
photo_spot_id
safe label
active status
```

Avoid exposing admin notes or internal metadata.

---

## 9. Tourist Identity RLS

Table:

```text
tourist_identities
```

This is sensitive.

Recommendation:

```text
No direct public select.
No direct public insert from browser.
Use server actions/API routes.
```

If RLS is used for direct access, policies must be extremely strict.

Important:

```text
anonymous_device provider_user_id is effectively a token.
Do not expose it.
LINE provider_user_id is personal identifier.
Do not expose it.
```

---

## 10. Tourist Profile RLS

Table:

```text
tourists
```

Recommendation:

```text
No broad public read.
Tourist own access through server-side identity verification.
Admin access through server-side permission checks.
```

Potential policy for authenticated app users is complicated because tourists may not use Supabase Auth.

Therefore, MVP recommendation:

```text
tourist access through server actions/API routes only
```

Backend verifies guest token/LINE identity and returns safe data.

---

## 11. Visit RLS

Table:

```text
visits
```

Recommendation:

```text
No public direct access.
Tourist own access via server action/API.
Admin dashboard access via backend service.
```

Reasons:

- visits link tourist behavior to locations.
- visits are personal/pseudonymous.
- dashboard needs aggregated data, not raw direct table exposure.

---

## 12. Visit Photos RLS

Table:

```text
visit_photos
```

Storage bucket:

```text
visit-photos
```

Recommendation:

```text
Private bucket.
No public list.
Access through signed URL.
Upload through server action/API.
```

RLS:

```text
No broad select.
Admin restricted access only.
Tourist own access through backend verification.
```

Important:

Tourist photos may contain faces and personal details.

---

## 13. Certificate RLS

Table:

```text
certificates
```

Storage bucket:

```text
certificate-files
```

Recommendation:

```text
Private or controlled public.
No broad public select.
Tourist own access through backend verification.
```

If public sharing is implemented later, use:

```text
share_tokens
public certificate view
revocation flag
expiration optional
```

Do not make the whole certificate table public.

---

## 14. Survey RLS

Tables:

```text
satisfaction_surveys
visit_expenses
```

Recommendation:

```text
No public direct access.
Tourist can submit own survey via server action/API.
Admin can view aggregate or detail based on permission.
Raw comments restricted.
```

RLS direct access is not recommended for MVP.

---

## 15. Consent Records RLS

Table:

```text
consent_records
```

Recommendation:

```text
No public direct access.
Insert through server action/API.
Tourist can request own consent records future.
Admin view restricted.
```

Consent records contain legal/privacy evidence.

Protect them.

---

## 16. Admin Tables RLS

Tables:

```text
admin_users
roles
permissions
role_permissions
admin_user_roles
audit_logs
```

Recommendation:

```text
RLS enabled.
No anon access.
Authenticated admin access only through backend checks.
```

If direct Supabase authenticated admin client is used, policies must check admin role/permissions.

MVP simpler:

```text
admin operations through server-side API routes
```

---

## 17. Audit Logs RLS

Table:

```text
audit_logs
```

Recommendation:

```text
super_admin/auditor only
```

No public or normal admin access by default.

Audit logs may include sensitive metadata.

---

## 18. Export Jobs RLS

Table:

```text
export_jobs
```

Recommendation:

- admin users can see their own export jobs.
- super_admin can see all.
- export files stored in private bucket.
- signed URLs generated server-side after permission check.

Conceptual:

```text
export_jobs.requested_by = current_admin_user_id
```

for normal admin.

---

## 19. Official Data RLS

Tables:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Official aggregate stats may be readable to dashboard users.

Imports/logs should be restricted.

Policies:

```text
official_tourism_stats: dashboard.read
data_import_logs: official_data.import or super_admin
official_attraction_refs: admin read/write based on permission
```

---

## 20. Funnel Events RLS

Table:

```text
funnel_events
```

Recommendation:

```text
Insert through server API.
No public select.
Dashboard aggregate only.
```

Reason:

Funnel events may include behavioral/session data.

Public direct insert could allow spam.

MVP route:

```text
POST /api/funnel-events
```

Backend validates and rate-limits later.

---

# Storage RLS

---

## 21. Storage Bucket Strategy

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

---

## 22. attraction-media Bucket

Access:

```text
public read
admin write
```

Rules:

- only active/published media should be used publicly.
- writes require admin permission.
- avoid direct public upload.

---

## 23. stamp-assets Bucket

Access:

```text
public read
admin write
```

Stamp graphics are public assets.

Tourist uploads are not allowed here.

---

## 24. visit-photos Bucket

Access:

```text
private
server-side upload
signed URL read
```

Do not allow public listing.

Do not make bucket public.

---

## 25. certificate-files Bucket

Recommended access:

```text
private
signed URL read
server-side write
```

Alternative MVP:

```text
public but unguessable paths
```

Privacy-safe recommendation:

```text
private/signed URL
```

---

## 26. export-files Bucket

Access:

```text
private
signed URL
short expiration
```

Never public.

---

## 27. official-imports Bucket

Access:

```text
private
admin import only
```

Do not expose uploaded import files publicly.

---

## 28. temp-uploads Bucket

Access:

```text
private
server-side only
cleanup job
```

---

# Admin RLS Strategy

---

## 29. Admin Permission Functions

If implementing RLS with PostgreSQL functions, create helper functions:

```sql
is_admin()
is_active_admin()
has_permission(permission_key text)
```

Conceptual:

```sql
create function has_permission(permission_key text)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from admin_users au
    join admin_user_roles aur on aur.admin_user_id = au.admin_user_id
    join role_permissions rp on rp.role_id = aur.role_id
    join permissions p on p.permission_id = rp.permission_id
    where au.auth_user_id = auth.uid()
      and au.is_active = true
      and p.permission_key = permission_key
  );
$$;
```

Important:

- SECURITY DEFINER functions must be written carefully.
- Set search_path safely in production.
- Avoid exposing functions that leak data.

---

## 30. Admin Policy Example

Example for attraction update:

```sql
create policy "Admins with attraction.update can update attractions"
on attractions
for update
to authenticated
using (has_permission('attraction.update'))
with check (has_permission('attraction.update'));
```

MVP may skip direct client updates and use server-side APIs instead.

---

## 31. Read vs Write Policies

Separate policies for:

```text
select
insert
update
delete
```

Do not use one broad policy for all actions.

Example:

```text
viewer can select
admin can insert/update
almost nobody can delete
```

---

## 32. Delete Policy

Hard deletes should be rare.

Prefer:

```text
is_active = false
deactivated_at
deactivated_by
```

RLS delete policies should be restrictive.

Most tables should have:

```text
no delete policy
```

or super_admin only.

---

# Tourist Access Strategy

---

## 33. Tourist Guest Token Challenge

Tourists may not be Supabase authenticated users.

They may use:

```text
guest token in browser storage
LINE identity future
email identity future
```

RLS cannot easily verify arbitrary guest token unless using secure server functions.

Therefore:

```text
Tourist data access should go through server-side APIs.
```

Backend verifies guest token and ownership.

---

## 34. Tourist-Owned Read Example

Instead of direct select:

```text
GET /api/passport
```

Backend:

```text
read guest token
find tourist identity
load passport data
return safe response
```

This avoids complicated public RLS on tourist tables.

---

## 35. Tourist-Owned Write Example

Instead of direct insert:

```text
POST /api/photos/upload
```

Backend:

```text
verify visit ownership
validate file
upload to storage
insert visit_photos
return safe result
```

---

## 36. Tourist RLS Recommendation

For MVP:

```text
Enable RLS on tourist tables.
Do not create broad anon policies.
Use server-side service or authenticated server context with strict service logic.
```

This keeps tables protected even if someone uses anon key directly.

---

# Public Views Strategy

---

## 37. Public Safe Views

To reduce risk, expose public data through views.

Possible views:

```text
public_attractions
public_attraction_images
public_photo_spots
public_reference_locations
```

These views should exclude:

```text
admin notes
draft content
private storage paths
internal metadata
inactive records
```

---

## 38. Dashboard Views

Dashboard views or materialized views should contain aggregated data only.

Examples:

```text
dashboard_daily_attraction_stats
dashboard_monthly_province_stats
dashboard_funnel_summary
```

These can be safer than raw table access.

Still protect via:

```text
dashboard.read
```

---

# Policy Testing

---

## 39. RLS Testing Strategy

Test using:

```text
anon client
authenticated non-admin client
viewer admin
admin user
super_admin user
server service role
```

For each sensitive table, test:

```text
select
insert
update
delete
```

---

## 40. Required RLS Tests

Test:

```text
anon can read published attractions
anon cannot read unpublished attractions
anon cannot read tourists
anon cannot read tourist_identities
anon cannot read visits
anon cannot read visit_photos
anon cannot read certificates
anon cannot read survey data
viewer cannot update attractions
admin can update attractions if policy allows
viewer cannot export
super_admin can read audit logs
private storage files not publicly accessible
public attraction media accessible
service role not exposed to browser
```

---

## 41. Policy Failure Modes

Watch for:

```text
using (true) on sensitive tables
public bucket for tourist photos
anon insert into funnel_events without rate limits
direct public access to checkin_codes admin fields
direct public access to tourist_identities
RLS disabled on sensitive table
service role used in browser
storage object policies too broad
```

---

## 42. MVP RLS Acceptance Checklist

```text
[ ] RLS is enabled on sensitive tables.
[ ] Public attraction content is safely readable.
[ ] Unpublished attractions are not publicly readable.
[ ] tourist_identities is not publicly readable.
[ ] tourists is not publicly readable.
[ ] visits is not publicly readable.
[ ] visit_photos is not publicly readable.
[ ] certificates is not publicly readable.
[ ] survey tables are not publicly readable.
[ ] admin tables are not publicly readable.
[ ] audit_logs is restricted.
[ ] export_jobs is restricted.
[ ] visit-photos bucket is private.
[ ] certificate-files bucket is controlled.
[ ] export-files bucket is private.
[ ] service role key is server-only.
```

---

## 43. Do Not Do

Do not:

```text
Disable RLS on sensitive tables in production.
Use public bucket for tourist photos.
Expose service role key in frontend.
Create anon select policy on tourists.
Create anon select policy on tourist_identities.
Create anon select policy on visits.
Allow anon update/insert on admin tables.
Make all check-in code fields public.
Use broad using (true) for private data.
Assume frontend route protection is enough.
```

---

## 44. Future Enhancements

Possible future improvements:

```text
full permission-based RLS functions
scoped staff policies by assigned attraction
researcher anonymized views
public-safe dashboard views
data subject self-service policies
certificate share token RLS
audit log RLS by auditor role
automated RLS tests in CI
```

---

## 45. Final RLS Rule

RLS is the database safety net.

Frontend and backend should still enforce rules, but RLS helps ensure sensitive rows are not exposed if a client tries to access the database directly.
