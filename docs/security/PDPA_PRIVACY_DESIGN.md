# PDPA_PRIVACY_DESIGN.md

## 1. Document Purpose

This document defines privacy-by-design and PDPA-oriented design requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The platform collects tourist-related data for certificate generation, digital passport/stamp collection, dashboard analytics, and sustainable tourism planning.

Because the system may collect personal data such as display name, photo, visit history, origin, age group, and optional survey comments, privacy must be considered from the beginning.

This document is not legal advice. It is a technical and product design guide to support responsible privacy practices.

---

## 2. Privacy Design Mission

The privacy mission is:

```text
Collect only what is necessary, explain why it is collected, protect it properly, and use it mainly for certificate generation and aggregated tourism planning.
```

The system should be able to answer:

```text
What data do we collect?
Why do we collect it?
Is it required or optional?
How is it used?
Who can access it?
How long is it kept?
How can it be deleted or anonymized?
```

---

## 3. PDPA-Oriented Principles

The design should follow these principles:

```text
purpose limitation
data minimization
transparency
consent where appropriate
security safeguards
limited access
retention control
data subject request readiness
privacy-safe analytics
auditability
```

---

## 4. Key Privacy Rule

The system should not collect sensitive or unnecessary personal data.

Do not collect:

```text
national ID
passport number
full address
phone number as required field
exact date of birth
religion
ethnicity
health data
political opinions
precise home location
income
```

Unless a future legal/official requirement clearly exists and is reviewed.

For this project, the database should focus on tourism planning, not personal surveillance.

---

## 5. Personal Data Inventory

## 5.1 Tourist Profile Data

Collected:

```text
display_name
origin_country_id
origin_province_id
age_group
preferred_language
created_at
```

Purpose:

```text
create certificate
analyze tourist profile distribution
support language/content planning
```

Privacy level:

```text
personal data / pseudonymous planning data
```

Required before certificate:

```text
display_name
origin
age_group
consent
```

Notes:

```text
display_name does not need to be legal name
origin is non-specific
age is collected as age group only
```

---

## 5.2 Tourist Identity Data

Stored in:

```text
tourist_identities
```

Possible providers:

```text
anonymous_device
google
line
email future
```

Purpose:

```text
allow returning tourist/passport access
avoid asking the same tourist to fill data repeatedly
support optional identity linking
```

Privacy level:

```text
personal / identifier data
```

Rules:

- provider_user_id must not be displayed in dashboards.
- Google subject must not be displayed in dashboards or default exports.
- LINE ID must not be exported by default.
- guest token must not be treated as secure admin identity.
- identity linking must be optional.
- IP address must not be used as the main tourist identity mechanism.

---

## 5.3 Visit Data

Collected:

```text
tourist_id
attraction_id
photo_spot_id
checkin_code_id
visit_date
completion_status
travel behavior optional
```

Purpose:

```text
record tourism participation
generate dashboard analytics
analyze travel behavior
support sustainable tourism planning
```

Privacy level:

```text
pseudonymous personal data when linked to tourist_id
aggregated planning data when summarized
```

Rules:

- QR scan alone should not create full tourist record.
- visit data should be used for aggregated analysis by default.
- admin detail access should be permission-controlled.

---

## 5.4 Uploaded Tourist Photos

Stored in:

```text
visit_photos
```

Purpose:

```text
create digital certificate / travel memory card
```

Privacy level:

```text
personal data and potentially identifying image
```

Rules:

- photo is required only for certificate.
- photo should not be public by default.
- photo must not be used for facial recognition.
- photo should not be used for unrelated marketing without explicit consent.
- photo paths must not include personal data.
- EXIF/GPS should not be used without consent.

---

## 5.5 Certificate Files

Stored in:

```text
certificates
certificate-files logical storage bucket/folder
```

Contains:

```text
display name
tourist photo
attraction name
visit date
project branding
```

Purpose:

```text
provide tourist reward / digital souvenir
```

Privacy level:

```text
personal data
```

Rules:

- certificate is not public by default.
- public sharing must be user-initiated.
- do not include email, LINE ID, Google ID, provider_user_id, guest token, internal tourist ID, internal visit ID, or device token.
- use signed URL or controlled sharing where possible.
- Cloudinary-first deployment must keep Cloudinary credentials server-only and must not expose storage references in dashboard/default exports.

---

## 5.6 Survey Data

Collected:

```text
travel behavior
expense range
satisfaction scores
revisit intention
recommendation intention
optional comment
```

Purpose:

```text
tourism planning
service improvement
dashboard analytics
academic reporting
```

Privacy level:

```text
planning data / personal data when linked to visit/tourist
```

Rules:

- survey is optional.
- do not block certificate behind survey.
- comments are high-risk because users may type personal data.
- raw comments should be restricted.
- dashboard should aggregate survey data.

---

## 5.7 Funnel Event Data

Collected:

```text
event_name
event_time
session_id
attraction_id
photo_spot_id
checkin_code_id
visit_id optional
tourist_id optional
metadata_json optional
```

Purpose:

```text
improve UX flow
identify drop-off points
optimize data collection strategy
```

Privacy level:

```text
behavioral event data
```

Rules:

- do not store personal data in metadata.
- avoid raw IP/user agent unless necessary.
- use aggregated dashboard by default.
- session_id should be random and non-personal.

---

## 5.8 Admin User Data

Collected:

```text
email
display_name
role
permissions
audit actions
```

Purpose:

```text
admin authentication
authorization
auditability
```

Privacy level:

```text
internal personal/admin data
```

Rules:

- admin access must be authenticated.
- admin actions must be audit logged.
- do not use shared admin accounts in production.

---

## 6. Data Minimization Rules

## 6.1 Required Tourist Fields Before Certificate

Required:

```text
display_name
origin country/province
age_group
visit_date
consent
photo
```

Do not require:

```text
email
LINE account
Google account
phone number
full address
national ID
exact age/date of birth
```

## 6.2 Optional Fields After Certificate

Optional:

```text
travel companion
group size
transport mode
travel purpose
overnight status
nights
spending range
satisfaction scores
comment
passport save/link
```

Reason:

```text
Collecting optional data after reward improves completion and respects user effort.
```

---

## 7. Purpose Limitation

Each data field must have a purpose.

## 7.1 Certificate Purpose

Uses:

```text
display_name
photo
attraction
visit date
```

## 7.2 Planning Analytics Purpose

Uses:

```text
origin
age group
travel behavior
expense range
satisfaction
visit records
funnel events
```

## 7.3 Passport Purpose

Uses:

```text
tourist identity
stamps
visit history
```

## 7.4 Admin Operations Purpose

Uses:

```text
attractions
photo spots
check-in codes
visits
reports
audit logs
```

Do not reuse data for unrelated advertising, profiling, or direct marketing unless a separate lawful basis and consent flow is designed.

---

## 8. Consent Strategy

Consent should be collected for:

```text
saving tourist profile/visit data
using photo for certificate
using submitted data for aggregated tourism planning
optional communication or marketing future
optional Google/LINE linking
future optional email linking
```

Consent should be separate from:

```text
survey participation
marketing notifications
public sharing
```

See:

```text
docs/security/CONSENT_MANAGEMENT.md
```

---

## 9. Privacy Notice Requirements

A short privacy notice should appear in tourist flow before submission.

It should explain:

```text
what data is collected
why it is collected
photo usage
survey optionality
aggregated analytics use
passport save optionality
```

Example short text:

```text
We use your information to create your digital certificate and analyze tourism trends in aggregated form. Your photo and display name are used for your certificate and will not be shown publicly unless you choose to share it.
```

Thai:

```text
ระบบใช้ข้อมูลของคุณเพื่อสร้างใบประกาศดิจิทัล และวิเคราะห์ภาพรวมการท่องเที่ยวในรูปแบบสถิติ รูปภาพและชื่อที่แสดงจะใช้สำหรับใบประกาศของคุณ และจะไม่ถูกแสดงสาธารณะหากคุณไม่ได้เลือกแชร์
```

---

## 10. Consent Checkbox Rules

The consent checkbox must:

```text
not be pre-checked
be required before saving required tourist data
link to privacy notice
record consent version
record timestamp
record source/context
```

Do not hide privacy notice behind unclear text.

---

## 11. Guest Flow Privacy

Guest flow must be supported.

Rules:

- no app installation required.
- no LINE required.
- no Google required.
- no email required.
- guest passport may be device/session-limited.
- guest token should be random and non-personal.
- guest data still deserves privacy protection.

Guest warning:

```text
Your passport is saved on this device only. Save it with Google or LINE if you want to access it later.
```

Thai:

```text
พาสปอร์ตของคุณจะถูกเก็บไว้บนอุปกรณ์นี้เท่านั้น หากต้องการเปิดดูภายหลังจากอุปกรณ์อื่น สามารถบันทึกด้วย LINE หรืออีเมลได้
```

---

## 12. Optional Identity Linking Privacy

Google and LINE linking are optional for tourists.

Rules:

- verify Google/LINE identity server-side before linking.
- for LINE, verify the LINE token server-side and derive the LINE user ID on the server.
- store provider identity only in tourist_identities.
- record separate consent/notice for LINE linking.
- do not show Google subject, LINE ID, or `provider_user_id` in public UI, certificates, share URLs, dashboards, or default exports.
- do not send LINE messages without separate communication consent.
- do not make Google or LINE required because guest mode must work first.
- do not require LINE before certificate generation, certificate download, stamp award, or optional survey.
- do not describe returning LINE recovery, unlinking, or notifications as production-complete until implemented and verified.

---

## 13. Photo Privacy

Tourist photo is high-risk personal data.

Rules:

- explain photo purpose.
- use photo for certificate.
- do not publish by default.
- do not use face recognition.
- do not analyze biometric features.
- do not extract EXIF/GPS for hidden tracking.
- consider EXIF stripping in production.
- protect photo storage bucket.

---

## 14. Certificate Privacy

Certificate includes name and photo.

Rules:

- private or signed access by default.
- public sharing only by user action.
- no internal IDs on certificate.
- no email/LINE/Google/provider ID on certificate.
- no full address or national ID.
- certificate download should not require exposing private storage paths.

---

## 15. Survey Privacy

Survey is optional.

Rules:

- avoid sensitive questions.
- use controlled choices.
- keep comments optional.
- limit comment length.
- raw comments are restricted.
- exports exclude comments unless permission allows.
- do not ask for exact income; use spending ranges only.

---

## 16. Dashboard Privacy

Dashboard should show aggregated metrics.

Default dashboards must not include:

```text
display_name
email
Google subject
LINE ID
provider_user_id
device token
guest token
raw photo path
private certificate URL
raw comment list
```

Allowed:

```text
counts
percentages
averages
distribution charts
ranked attraction/province metrics
```

Small group caution:

If dashboard becomes public, consider suppressing very small groups.

Phase 09 implementation note:

```text
The admin dashboard route returns aggregated DTOs only and requires dashboard.read.
It does not expose display_name, provider_user_id, Google subject, LINE user ID, guest token, raw comments, photo paths, certificate paths, tourist_id, or visit_id in the rendered dashboard model.
```

---

## 17. Export Privacy

Exports must be privacy-safe by default.

Default exports should exclude:

```text
display_name
email
Google subject
LINE user ID
provider_user_id
device token
raw guest token
photo path
private certificate path
raw comments
```

Use:

```text
anonymized_tourist_ref
```

for visit/profile-level export if needed.

All exports require:

```text
permission check
filter validation
audit log
```

---

## 18. Access Control and Roles

Privacy depends on authorization.

Roles:

```text
super_admin
admin
viewer
researcher future
staff future
```

Rules:

- viewer should not export detailed data.
- researcher may export anonymized datasets.
- raw comments require special permission.
- admin user management requires super_admin.
- tourist can access only own passport/certificates.

See:

```text
docs/backend/AUTHORIZATION_RBAC.md
docs/security/ROLE_PERMISSION_MATRIX.md
```

---

## 19. Data Retention Design

Data should not be kept forever without purpose.

Define retention for:

```text
tourist profiles
tourist identities
visit records
photos
certificates
survey responses
comments
funnel events
exports
audit logs
official imports
```

Suggested high-level retention:

```text
visit analytics: keep for planning if anonymized/pseudonymized
photos: delete/archive after defined period unless user keeps certificate
export files: expire quickly
temp files: delete quickly
audit logs: keep longer for accountability
```

See:

```text
docs/database/DATA_RETENTION_POLICY.md
```

---

## 20. Data Anonymization Strategy

Future anonymization should:

```text
remove display name
unlink identity provider
delete or detach photos
remove direct contact fields
preserve non-identifying analytics fields
preserve attraction/province/date aggregates
```

Do not break planning metrics unnecessarily.

See:

```text
docs/security/DATA_ANONYMIZATION.md
```

---

## 21. Data Subject Request Readiness

Production should be ready to support requests such as:

```text
access my data
correct my data
delete my data
withdraw consent
unlink Google/LINE/email
delete photo/certificate
```

MVP may not implement full self-service, but schema and services should not block future support.

Recommended future service methods:

```text
getTouristDataExport(touristId)
updateTouristProfile(touristId)
deleteOrAnonymizeTourist(touristId)
unlinkTouristIdentity(touristId, provider)
deleteTouristPhoto(photoId)
withdrawConsent(touristId)
```

---

## 22. Privacy-Safe Database Design

Recommended:

- store direct identity separately in `tourist_identities`.
- use age group instead of date of birth.
- use origin province/country instead of full address.
- use spending range instead of exact income.
- use optional comments with restrictions.
- keep storage path separate from public URL.
- avoid storing signed URLs permanently.

---

## 23. Privacy-Safe Analytics Design

Analytics should use:

```text
aggregated counts
averages
percentages
distributions
ranked attractions
ranked provinces
```

Avoid analytics that target individuals.

Do not build:

```text
individual tourist tracking dashboard
individual spending profile
individual movement surveillance
LINE user ID lookup dashboard
Google subject lookup dashboard
```

---

## 24. Privacy-Safe Logging

Logs should not include:

```text
LINE tokens
Google OAuth tokens
service role key
raw uploaded files
raw guest tokens if avoidable
full personal data
certificate signed URLs
```

Logs may include:

```text
request id
safe user/admin id
entity id
error code
action name
timestamp
safe metadata
```

---

## 25. Privacy-Safe Metadata

Metadata JSON fields are flexible and therefore risky.

Rules:

- do not store personal data in metadata unless necessary.
- do not store secrets in metadata.
- document expected metadata fields.
- validate metadata shape where possible.
- avoid dumping entire request bodies into metadata.

---

## 26. Third-Party Services

If using third-party services such as:

```text
LINE LIFF
Google OAuth
hosting provider
Supabase
analytics/error monitoring
email future
```

Document:

```text
what data is sent
why it is sent
whether it contains personal data
how long it is retained
```

Do not add third-party tracking casually.

---

## 27. Public Sharing Design

If certificate sharing is added:

Rules:

- user initiates share.
- share link uses random token.
- share can be revoked in future.
- shared page shows limited data.
- share does not expose storage path.
- no email/LINE ID/Google ID/provider_user_id/guest token/internal ID appears.

MVP can skip public share and support download only.

---

## 28. Admin Privacy UX

Admin UI should:

- show privacy labels for sensitive sections.
- hide direct identifiers by default.
- warn before export.
- require permission for raw comments.
- show audit logs for sensitive actions.
- use deactivate/anonymize rather than hard delete when preserving analytics.

---

## 29. Privacy Review Checklist for New Features

Before adding a feature, ask:

```text
What data does it collect?
Is the data necessary?
Is it required or optional?
Can it be aggregated?
Can it be anonymized?
Who can access it?
Will it appear in exports?
How long is it kept?
Does it need separate consent?
Does it expose foreign tourists or non-LINE users unfairly?
Does it expose guests or non-Google users unfairly?
```

---

## 30. MVP Privacy Acceptance Checklist

```text
[ ] Required tourist fields are minimal.
[ ] No full address is collected.
[ ] No national ID is collected.
[ ] Age group is used instead of exact birthdate.
[ ] LINE is optional.
[ ] Google is optional for tourists.
[ ] Guest flow exists.
[ ] Guest identity does not use IP address as the main identity mechanism.
[ ] Consent checkbox is required and not pre-checked.
[ ] Consent version is recorded.
[ ] Photo purpose is explained.
[ ] Tourist photos are not public by default.
[ ] Certificate does not include private identifiers.
[ ] Survey is optional.
[ ] Dashboard is aggregated.
[ ] Exports exclude direct identifiers by default.
[ ] Raw comments are restricted or excluded.
[ ] Data retention is documented.
```

---

## 31. Do Not Do

Do not:

```text
Require LINE login.
Require Google login for tourists.
Require email.
Collect national ID.
Collect full address.
Ask exact date of birth.
Use photo for facial recognition.
Publish certificates automatically.
Show LINE user ID in dashboard.
Show Google subject or provider_user_id in dashboard.
Export personal identifiers by default.
Use QR scans for personal surveillance.
Store secrets in metadata.
Keep export files forever.
```

---

## 32. Future Enhancements

Possible future improvements:

```text
privacy request portal
self-service data export
self-service delete/anonymize request
consent withdrawal workflow
photo deletion workflow
certificate share revocation
small-group suppression for public dashboard
automated retention cleanup
admin privacy review queue
```

---

## 33. Final Privacy Rule

The system should produce useful tourism planning data without collecting more personal information than necessary.

A privacy-safe system is more trustworthy and more suitable for real-world academic or government-related deployment.

---

## 34. Privacy-Safe Story Engagement

Story engagement exists only to improve content quality and explainable
recommendations. It is not a tourist profile or cross-page tracking system.

Allowed events:

```text
story_impression
story_open
related_content_click
meaningful_read_complete
```

The browser sends only Story IDs, event, surface, locale, optional list
position, and a random session nonce. The API may read an IP address
transiently to derive an HMAC rate-limit digest, but must immediately discard
the raw value. The database must not store identity, IP, URL, referrer, title,
or arbitrary metadata.

Privacy controls:

- Exact same-origin requests only.
- Browser Global Privacy Control and Do Not Track disable client recording.
- Session nonce expires after 24 hours and is not a login or tourist identity.
- Raw events expire after 30 days.
- Public reading never waits for or depends on event recording.
- Engagement affects recommendations only after at least 100 deduplicated
  Story opens.
- Small-sample engagement values are not shown publicly.

---

## 35. Research Privacy and Reproducibility

Phase 18 follows data minimization and purpose separation:

- Normal visits have no research session unless the user separately consents.
- `field_observation`, `simulated_usability`, and `pilot_internal` are structurally separated and filters default to real field observation.
- Stakeholder sessions do not require tourist profiles and cannot link to tourist, visit, or check-in identity fields.
- Direct email, phone, and URL patterns are redacted from optional research text before storage. Raw short/long-text answers are never included in a research microdata export; exports contain only a response-present flag for restricted human review.
- Research microdata export is rejected when the study is not frozen and approved, when the result is truncated, when fewer than 10 eligible sessions exist, or when any released participant/mode/instrument/item/event/attraction/task subgroup has fewer than 10 distinct sessions.
- Exports replace internal IDs with study participant codes and exclude display names, identity providers, photos, storage paths, signed URLs, IP/user-agent hashes, rationale, and reviewer coded notes.
- Dashboard cells below `n = 10` show “ปกปิด”; missing values remain missing, never zero.
- Analytics are descriptive/associational. The system must not label the pilot as causal evidence or province-wide population estimates.
- AI/LLM processing of raw participant or visitor feedback is outside Phase 18.
