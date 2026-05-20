# Pull Request

## 1. Summary

Describe what this PR changes.

```text
Example:
Implemented QR check-in resolution for active, invalid, inactive, and expired check-in codes.
```

---

## 2. Related Task / Phase

Phase:

```text
[ ] PHASE_01_PROJECT_SETUP
[ ] PHASE_02_DATABASE_SCHEMA
[ ] PHASE_03_AUTH_IDENTITY
[ ] PHASE_04_PUBLIC_ATTRACTION_PAGES
[ ] PHASE_05_QR_CHECKIN_FLOW
[ ] PHASE_06_CERTIFICATE_GENERATION
[ ] PHASE_07_SURVEY_EXPENSE_SATISFACTION
[ ] PHASE_08_ADMIN_BACKOFFICE
[ ] PHASE_09_DASHBOARD
[ ] PHASE_10_REPORT_EXPORT
[ ] PHASE_11_LINE_LIFF_OPTIONAL
[ ] PHASE_12_TESTING_HARDENING
[ ] PHASE_13_DEPLOYMENT
```

Related issue/task:

```text
Closes #
```

---

## 3. Type of Change

```text
[ ] Feature
[ ] Bug fix
[ ] Refactor
[ ] Database migration
[ ] Documentation
[ ] Test
[ ] Security/privacy
[ ] Performance
[ ] Deployment
```

---

## 4. Files / Areas Changed

```text
- src/...
- docs/...
- supabase/migrations/...
```

---

## 5. User Impact

Who is affected?

```text
[ ] Tourist
[ ] Returning tourist
[ ] Foreign/non-LINE tourist
[ ] Admin
[ ] Viewer
[ ] Super admin
[ ] Dashboard user
[ ] Export/report user
[ ] Developer/maintainer
```

Describe the impact:

```text
...
```

---

## 6. Functional Checklist

```text
[ ] Feature works as described.
[ ] Failure states are handled.
[ ] Loading states are included where needed.
[ ] Empty states are included where needed.
[ ] Duplicate submit/click is handled where relevant.
[ ] Thai text works where relevant.
[ ] English/non-LINE path works where relevant.
[ ] Mobile behavior checked for tourist-facing pages.
```

---

## 7. UX Checklist

```text
[ ] QR/certificate flow remains low-friction.
[ ] Certificate is not blocked by survey.
[ ] LINE is not required for core tourist flow.
[ ] Email/phone/national ID are not required before certificate.
[ ] Consent is clear and not pre-checked.
[ ] Photo upload has preview/loading/error/retry where relevant.
[ ] Dashboard labels are not misleading.
```

---

## 8. Security / Privacy Checklist

```text
[ ] No secrets committed.
[ ] No service role key exposed to frontend.
[ ] Server-side validation exists.
[ ] Server-side permission checks exist where relevant.
[ ] Tourist ownership checks exist where relevant.
[ ] Consent is required where relevant.
[ ] Private storage buckets remain private/controlled.
[ ] Dashboard response excludes private identifiers.
[ ] Export excludes private identifiers by default.
[ ] Safe errors are returned to users.
```

Private identifiers that must not appear by default:

```text
email
LINE user ID
provider_user_id
guest token
device token
private photo path
private certificate path
raw comments
```

---

## 9. Database Checklist

Complete if this PR changes schema or database behavior.

```text
[ ] Migration added.
[ ] Migration tested locally or reason documented.
[ ] Foreign keys added where needed.
[ ] Unique constraints added where needed.
[ ] Check constraints added where needed.
[ ] Indexes added for expected queries.
[ ] Data dictionary updated.
[ ] ERD/docs updated if relationship changed.
[ ] Repeat visits remain allowed.
[ ] Duplicate stamps remain prevented.
[ ] QR scans are not modeled as visits.
```

---

## 10. Dashboard Checklist

Complete if this PR changes dashboard metrics.

```text
[ ] Metric definition matches DASHBOARD_METRICS_DICTIONARY.md.
[ ] Metric is calculated server-side.
[ ] Filters are validated server-side.
[ ] Response is aggregated and privacy-safe.
[ ] QR scans are not counted as visits.
[ ] Estimated Spending is not labeled Revenue.
[ ] Missing satisfaction is not treated as 0.
[ ] Zero denominator returns No data/null.
[ ] Tests added or updated for formulas.
[ ] Tooltips/definitions updated.
```

---

## 11. Export Checklist

Complete if this PR changes export/report behavior.

```text
[ ] Export requires authentication.
[ ] Export requires permission.
[ ] Filters are validated.
[ ] Row limits are enforced.
[ ] CSV escaping works.
[ ] Thai text preserved.
[ ] Audit log created.
[ ] Private identifiers excluded by default.
[ ] Raw comments excluded by default unless permission allows.
```

---

## 12. File Upload / Storage Checklist

Complete if this PR changes upload/storage behavior.

```text
[ ] File type validated server-side.
[ ] File size validated server-side.
[ ] SVG/PDF/HTML/JS rejected for tourist upload.
[ ] Storage path generated server-side.
[ ] Storage path contains no personal data.
[ ] Original filename not used as final path.
[ ] Signed URL not stored permanently.
[ ] Private files remain private/controlled.
```

---

## 13. Testing

Commands run:

```text
[ ] npm run typecheck
[ ] npm run lint
[ ] npm run test
[ ] npm run test:unit
[ ] npm run test:integration
[ ] npm run test:e2e
[ ] npm run build
[ ] Other:
```

Results:

```text
typecheck:
lint:
test:
build:
```

If not run, explain why:

```text
...
```

---

## 14. Manual QA

Manual checks performed:

```text
[ ] Tourist QR flow
[ ] Mobile photo upload
[ ] Certificate generation/download
[ ] Stamp/passport
[ ] Optional survey
[ ] Admin CMS
[ ] Dashboard filters
[ ] Export
[ ] Permission denied path
[ ] Error state
```

Notes:

```text
...
```

---

## 15. Screenshots / Evidence

Add screenshots or recordings if UI changed.

```text
- QR landing:
- Certificate:
- Admin:
- Dashboard:
```

---

## 16. Risks / Limitations

List known risks, limitations, or follow-up work.

```text
...
```

---

## 17. Documentation Updated

```text
[ ] README.md
[ ] PRODUCT_REQUIREMENTS.md
[ ] MVP_SCOPE.md
[ ] docs/database/
[ ] docs/frontend/
[ ] docs/backend/
[ ] docs/dashboard/
[ ] docs/security/
[ ] docs/testing/
[ ] docs/reports/
[ ] Not needed
```

---

## 18. Reviewer Focus

Ask reviewers to focus on:

```text
[ ] Business logic correctness
[ ] UX
[ ] Security/privacy
[ ] Database design
[ ] Dashboard formulas
[ ] Export safety
[ ] Performance
[ ] Tests
[ ] Documentation
```

---

## 19. Final Confirmation

```text
[ ] I did not expose secrets.
[ ] I did not require LINE/email/phone/national ID before certificate.
[ ] I did not make survey mandatory before certificate.
[ ] I did not count QR scans as visits.
[ ] I did not label estimated spending as revenue.
[ ] I did not treat missing satisfaction as zero.
[ ] I did not export private identifiers by default.
```
