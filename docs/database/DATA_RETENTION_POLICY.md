# DATA_RETENTION_POLICY.md

## 1. Document Purpose

This document defines the initial data retention policy for the **Southern Border Tourism Data & Intelligence Platform**.

It explains how long different data types should be kept, why they are kept, and how they should be anonymized, archived, or deleted.

This document supports:

- Privacy-by-design
- PDPA-aware data handling
- Production readiness
- Academic and administrative trust
- Long-term database maintainability

This policy should be reviewed before any real deployment.

---

## 2. Important Disclaimer

This document is a technical and product planning policy.

It is not legal advice.

Before production use with real tourists, the project owner should review the policy with the responsible organization, university, or legal/privacy officer.

---

## 3. Retention Principles

## 3.1 Keep Only What Is Needed

Data should be kept only as long as it supports a valid purpose.

Valid purposes include:

- Certificate delivery
- Digital passport continuity
- Tourism planning
- Dashboard analytics
- Academic research
- System security
- Audit accountability
- Consent proof
- Legal or organizational requirements

---

## 3.2 Minimize Personal Data

The system should prefer:

- Display name instead of legal name
- Age group instead of date of birth
- Province/country instead of full address
- Optional contact instead of required contact
- Aggregated dashboard data instead of raw personal data

---

## 3.3 Separate Raw Data and Aggregated Data

Raw tourist-level data and aggregated dashboard data should have different retention periods.

Aggregated data can usually be kept longer because it has lower privacy risk.

---

## 3.4 Anonymize When Possible

When personal identification is no longer needed, data should be anonymized rather than fully deleted if it still supports planning.

Example:

Keep:

```text
visit date
attraction
province
age group
spending range
satisfaction score
```

Remove or anonymize:

```text
display name
email
LINE ID
device token
photo
```

---

## 3.5 Avoid Hard Deleting Data Needed for Reports

If a record is used in official reports or dashboards, deleting it may break historical analytics.

Use anonymization or archiving where appropriate.

---

## 4. Data Categories

This policy covers these data categories:

```text
Tourist profile data
Tourist identity data
Tourist contact data
Visit records
Uploaded photos
Generated certificates
Digital stamps
Survey and satisfaction data
Expense data
Funnel event data
Consent logs
Admin user data
Audit logs
Official imported data
Dashboard summary data
System logs
```

---

## 5. Data Classification

## 5.1 Public Data

Examples:

- Published attraction information
- Attraction images owned by project
- Public 360 media
- Province and district master data
- Attraction type master data

Risk level:

```text
Low
```

---

## 5.2 Internal Operational Data

Examples:

- Visit records
- QR scan counts
- Check-in code status
- Dashboard summaries
- Admin configuration

Risk level:

```text
Medium
```

---

## 5.3 Personal or Potentially Identifiable Data

Examples:

- Display name
- Uploaded tourist photo
- Email
- LINE user ID
- Device token
- Certificate with tourist photo
- Optional contact data

Risk level:

```text
Medium to High
```

---

## 5.4 Sensitive Data

The system should avoid collecting sensitive data.

Do not collect:

- National ID number
- Full home address
- Religion
- Ethnicity
- Health data
- Biometric analysis
- Precise movement history beyond project need

Risk level:

```text
High
```

If sensitive data is ever required, a separate formal approval and policy must be created.

---

## 6. Retention Table

## 6.1 Public Attraction Data

Examples:

```text
attractions
attraction_images
attraction_360_media
photo_spots
```

Recommended retention:

```text
Keep while attraction is active.
Archive after attraction is retired.
```

Action:

- Use `is_active = false`.
- Use `is_published = false`.
- Do not delete if historical visits exist.

Reason:

Attraction records are needed for historical visit interpretation.

---

## 6.2 Tourist Profile Data

Examples:

```text
tourists.display_name
tourists.origin_country_id
tourists.origin_province_id
tourists.age_group
tourists.preferred_language
```

Recommended retention:

```text
Keep active while tourist passport or certificate access is needed.
Review after 2 years of inactivity.
Anonymize after 3 years of inactivity unless there is a valid reason to keep.
```

Anonymization action:

- Replace display_name with anonymized label.
- Keep origin country/province.
- Keep age group if not identifying.
- Keep tourist_id for relational integrity if needed.
- Remove direct contact links if no longer needed.

Example anonymized display name:

```text
Anonymous Tourist 12345
```

---

## 6.3 Tourist Identity Data

Examples:

```text
anonymous device token
LINE user ID
email identity
Google identity
```

Recommended retention:

```text
Keep while passport recovery or returning user experience is active.
Review after 2 years of inactivity.
Delete or anonymize after 3 years of inactivity.
```

Action:

- Delete provider_user_id or replace with irreversible hash if needed.
- Remove inactive identity links when no longer required.
- Keep aggregated visit data.

Reason:

Identity data is higher risk than anonymous planning data.

---

## 6.4 Tourist Contact Data

Examples:

```text
email
phone
LINE contact metadata
```

Recommended retention:

```text
Keep only while needed for certificate delivery, passport recovery, or consented communication.
Review after 1 year of inactivity.
Delete after 2 years of inactivity unless user has active account/passport.
```

Action:

- Delete contact_value.
- Keep non-identifying contact type if needed for aggregate statistics.

Rules:

- Email and LINE must be optional.
- Contact data must not be exported in general planning exports.

---

## 6.5 Visit Records

Examples:

```text
visits
```

Recommended retention:

```text
Keep long-term for tourism planning.
Anonymize personal linkage after identity retention period if needed.
```

Action:

- Keep attraction_id.
- Keep visit_date.
- Keep travel behavior data.
- Keep spending range.
- Keep satisfaction relationship.
- Remove or anonymize tourist identity if required.

Reason:

Visit records are core planning data.

---

## 6.6 Uploaded Tourist Photos

Examples:

```text
visit_photos
storage files
```

Recommended retention:

```text
Keep while needed for certificate generation and tourist access.
Review after 6 to 12 months.
Delete or archive after 12 months unless user explicitly saved passport/certificate.
```

Action:

- Delete original uploaded file when no longer needed.
- Keep generated certificate only if user wants access.
- Keep metadata only if needed and not identifying.

Reason:

Photos are potentially identifiable and higher risk.

---

## 6.7 Generated Certificates

Examples:

```text
certificates
certificate image files
```

Recommended retention:

```text
Keep while tourist is expected to download or access certificate.
Review after 1 year.
Delete or archive after 2 years of inactivity unless user keeps passport active.
```

Action:

- Delete certificate file if no longer needed.
- Keep certificate database record if needed for aggregate count, but remove file path if deleted.
- Keep aggregate certificate count.

Reason:

Certificates may include tourist name and photo.

---

## 6.8 Digital Stamps

Examples:

```text
tourist_stamps
```

Recommended retention:

```text
Keep while passport feature is active.
If tourist identity is anonymized, keep stamp as anonymized planning data if needed.
```

Action:

- Keep attraction-level stamp count.
- Remove direct identity linkage if required.
- Preserve aggregate progress statistics.

Reason:

Stamps support repeat visit analysis and digital passport experience.

---

## 6.9 Survey and Satisfaction Data

Examples:

```text
satisfaction_surveys
survey_answers
```

Recommended retention:

```text
Keep long-term in anonymized or aggregated form.
Review direct tourist linkage after 3 years.
```

Action:

- Keep scores and attraction links.
- Keep comments only if safe and necessary.
- Remove identifying text from comments if found.
- Anonymize tourist linkage if needed.

Reason:

Satisfaction data is valuable for planning but should not require personal identity long-term.

---

## 6.10 Expense Data

Examples:

```text
visit_expenses
```

Recommended retention:

```text
Keep long-term in aggregated or visit-linked form.
Anonymize tourist linkage after identity retention period if needed.
```

Action:

- Keep spending range.
- Keep category.
- Keep attraction/province context.
- Avoid storing exact personal financial data unless necessary.

Reason:

Expense data supports local economic planning.

---

## 6.11 Funnel Event Data

Examples:

```text
funnel_events
```

Recommended retention:

```text
Keep raw funnel events for 6 to 12 months.
Keep aggregated funnel metrics long-term.
```

Action:

- Aggregate by date, attraction, and event name.
- Delete raw session-level data after retention period.
- Remove session_id and identity references if no longer needed.

Reason:

Raw funnel events are useful for UX improvement but do not need to be kept forever.

---

## 6.12 Consent Logs

Examples:

```text
consent_logs
```

Recommended retention:

```text
Keep as long as related personal data is retained.
Keep longer if required for accountability.
```

Action:

- Store consent version and timestamp.
- Avoid storing raw IP/user agent unless necessary.
- Use hashed technical metadata if needed.

Reason:

Consent logs prove that data collection was explained and accepted.

---

## 6.13 Audit Logs

Examples:

```text
audit_logs
```

Recommended retention:

```text
Keep for at least 2 to 5 years depending on organizational policy.
```

Action:

- Keep action history.
- Hash IP/user agent if stored.
- Do not store excessive personal data in audit logs.
- Do not store secrets in audit logs.

Reason:

Audit logs support accountability and security review.

---

## 6.14 Admin User Data

Examples:

```text
users
user_roles
role_permissions
```

Recommended retention:

```text
Keep while user is active.
Deactivate when user leaves.
Archive or anonymize after organizational retention period.
```

Action:

- Use `is_active = false`.
- Preserve audit log actor reference when needed.
- Avoid hard delete if audit logs reference user.

---

## 6.15 Official Imported Data

Examples:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

Recommended retention:

```text
Keep long-term.
```

Reason:

Official data supports historical comparison and academic reporting.

Action:

- Keep source information.
- Keep import logs.
- Do not overwrite old data without versioning or import history.

---

## 6.16 Dashboard Summary Data

Examples:

```text
daily_attraction_stats
monthly_province_stats
satisfaction_summary
expense_summary
dashboard_cache
```

Recommended retention:

```text
Keep long-term if aggregated and non-identifying.
```

Action:

- Rebuild from raw data if needed.
- Store calculation period and version.
- Keep summary data even if raw personal data is anonymized.

---

## 6.17 System Logs

Examples:

```text
application logs
error logs
server logs
storage logs
```

Recommended retention:

```text
Keep short-term, usually 30 to 180 days depending on deployment environment.
```

Action:

- Do not log secrets.
- Do not log raw personal data unnecessarily.
- Mask emails, tokens, and IDs where possible.

---

## 7. Suggested Retention Schedule Summary

| Data Type | Suggested Raw Retention | Suggested Long-Term Action |
|---|---:|---|
| Attraction data | While active | Archive/deactivate |
| Tourist profile | Review after 2 years inactive | Anonymize after 3 years inactive |
| Identity data | Review after 2 years inactive | Delete/anonymize after 3 years inactive |
| Contact data | Review after 1 year inactive | Delete after 2 years inactive |
| Visit records | Long-term | Keep, anonymize identity if needed |
| Uploaded photos | 6-12 months | Delete/archive |
| Certificates | 1-2 years | Delete file, keep aggregate |
| Digital stamps | While passport active | Anonymize if needed |
| Survey data | Long-term | Keep anonymized/aggregated |
| Expense data | Long-term | Keep anonymized/aggregated |
| Funnel events | 6-12 months raw | Keep aggregated |
| Consent logs | While related data exists | Keep for accountability |
| Audit logs | 2-5 years | Archive |
| Official imported data | Long-term | Keep with source |
| Dashboard summaries | Long-term | Keep non-identifying |

---

## 8. Anonymization Rules

## 8.1 Tourist Profile Anonymization

When anonymizing a tourist:

Remove or replace:

```text
display_name
contact data
identity provider_user_id
photo references
certificate personal file links
```

Keep if needed for planning:

```text
origin_country_id
origin_province_id
age_group
visit records
expense ranges
satisfaction scores
attraction visits
```

---

## 8.2 Identity Anonymization

Options:

1. Delete identity row.
2. Replace provider_user_id with irreversible hash.
3. Mark identity inactive.
4. Remove contact references.

Preferred approach depends on whether account recovery must remain possible.

---

## 8.3 Photo and Certificate Anonymization

Photos and certificates are often identifiable.

Options:

- Delete original uploaded photo.
- Delete generated certificate file.
- Keep non-identifying metadata:
  - file type
  - upload date
  - attraction
  - certificate count

---

## 8.4 Comment Anonymization

Survey comments may include personal data.

Rules:

- Do not require comments.
- Limit comment length.
- If exporting comments, review or filter sensitive content.
- Consider excluding comments from public reports.

---

## 9. Deletion Rules

## 9.1 Hard Delete

Hard delete should be rare.

Acceptable for:

- Failed temporary uploads
- Unused draft records
- Test data
- Expired anonymous session data
- Raw logs past retention period

Not recommended for:

- visits
- attractions with visits
- consent logs
- audit logs
- dashboard source data

---

## 9.2 Soft Delete or Deactivation

Use for:

- attractions
- photo spots
- check-in codes
- templates
- admin users
- master data

Fields:

```text
is_active
is_published
deleted_at
status
```

---

## 9.3 Anonymization

Use for:

- tourist profile after retention period
- identity data after inactivity
- contact data no longer needed
- photo/certificate references

---

## 10. Data Export Retention

Export files can create privacy risk.

Rules:

- Export files should not be stored permanently unless required.
- Temporary export files should expire.
- Export actions should be logged.
- Exports should avoid unnecessary personal data.
- Contact data should not be included in normal planning exports.
- Uploaded photos should not be included in data exports unless specifically approved.

Recommended temporary export lifetime:

```text
24 hours to 7 days
```

depending on deployment needs.

---

## 11. Backup Retention

Backups may contain personal data.

Rules:

- Backups must be protected.
- Backups should have a defined retention period.
- Backup access should be restricted.
- Backup deletion must be considered when deleting/anonymizing personal data.
- Do not use production backups for development unless anonymized.

Recommended MVP backup retention:

```text
7 to 30 days
```

Production retention depends on organization policy.

---

## 12. Development and Test Data

Rules:

- Do not use real tourist data in development.
- Use fake seed data.
- If production data is needed for testing, anonymize it first.
- Do not commit exported real data to repository.
- Do not include real photos in sample assets unless permission exists.

---

## 13. User Request Handling

If the platform supports user privacy requests in production, it should be able to handle:

- Request to view data
- Request to correct data
- Request to delete contact data
- Request to delete photo/certificate
- Request to stop communication
- Request to anonymize profile

MVP may not implement full self-service request handling, but data structure should allow admin-assisted handling.

---

## 14. Retention Responsibilities

Suggested responsibilities:

### System Administrator

- Configure retention settings
- Manage backups
- Delete expired files
- Review audit logs

### Data Protection or Project Owner

- Approve retention policy
- Review personal data handling
- Approve exports
- Handle privacy requests

### Developer

- Implement retention-supporting structure
- Avoid unnecessary data logging
- Build safe deletion/anonymization tools

### Researcher or Planner

- Use aggregated data where possible
- Avoid exporting unnecessary personal data
- Follow approved data use purpose

---

## 15. Retention Automation Roadmap

## 15.1 MVP

Manual review is acceptable.

MVP should at least:

- Store timestamps
- Store consent logs
- Separate identity and visit data
- Avoid unnecessary personal data
- Allow manual deletion of files
- Avoid hard delete of core historical records

## 15.2 Phase 2

Add admin tools:

- Find inactive tourist profiles
- Delete old photo files
- Delete expired export files
- Anonymize tourist identities
- View retention status

## 15.3 Production

Add scheduled jobs:

- Delete temporary uploads
- Delete expired exports
- Aggregate old funnel events
- Remove raw funnel events after retention period
- Flag inactive profiles for anonymization
- Generate retention reports

---

## 16. Retention Metadata Fields

Tables should include timestamps that support retention.

Important fields:

```text
created_at
updated_at
deleted_at
last_seen_at
uploaded_at
generated_at
earned_at
completed_at
consented_at
event_time
exported_at
imported_at
```

Identity tables should include:

```text
last_seen_at
```

File-related tables should include:

```text
uploaded_at
generated_at
```

---

## 17. Storage Retention Rules

## 17.1 Uploaded Photos

Storage paths must allow lifecycle management.

Recommended path pattern:

```text
visit-photos/{year}/{month}/{visit_id}/{file_name}
```

## 17.2 Certificates

Recommended path pattern:

```text
certificates/{year}/{month}/{visit_id}/{certificate_id}.png
```

## 17.3 Temporary Files

Recommended path pattern:

```text
temp/{session_id}/{file_name}
```

Temporary files should be easier to delete.

---

## 18. Retention and Dashboard Integrity

When personal data is deleted or anonymized, dashboard integrity should remain.

Example:

If a tourist identity is deleted, keep:

```text
visit count
attraction count
province distribution
expense range
satisfaction score
age group if safe
origin country/province if safe
```

Do not break historical dashboards.

---

## 19. Retention Checklist

Before production deployment, verify:

```text
[ ] Data categories are identified.
[ ] Personal data fields are minimized.
[ ] Consent logs are stored.
[ ] Uploaded photos have retention plan.
[ ] Certificates have retention plan.
[ ] Contact data has retention plan.
[ ] Identity data has retention plan.
[ ] Export files expire.
[ ] Audit logs do not store secrets.
[ ] Backups have retention policy.
[ ] Development does not use real data.
[ ] Anonymization approach is documented.
[ ] Admin deletion/anonymization process is defined.
```

---

## 20. Anti-Patterns

Do not:

```text
Keep all photos forever without reason.
Keep raw session events forever.
Store real tourist data in repository.
Use production data in development without anonymization.
Include emails in normal dashboard exports.
Hard delete attractions with historical visits.
Delete consent logs while personal data remains.
Store secrets in logs.
Store base64 photos in database.
```

---

## 21. Definition of Done for Retention-Aware Features

A feature is retention-aware when:

- It stores timestamps needed for lifecycle management.
- It avoids unnecessary personal data.
- It separates personal identity from planning data.
- It can be anonymized without destroying dashboard value.
- It does not write sensitive data to logs.
- It respects consent purpose.
- It documents retention impact.

---

## 22. Final Retention Rule

The system should keep planning value, not unnecessary personal risk.

Long-term data should be aggregated, anonymized, or clearly justified.

Raw identifiable data should have a clear purpose and a clear end date.
