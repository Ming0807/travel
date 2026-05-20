# Issue

## 1. Issue Type

```text
[ ] Feature request
[ ] Bug report
[ ] UX/UI issue
[ ] Database/schema issue
[ ] Backend/API issue
[ ] Frontend issue
[ ] Dashboard/analytics issue
[ ] Security/privacy issue
[ ] Performance issue
[ ] Testing/QA issue
[ ] Documentation issue
[ ] Deployment issue
```

---

## 2. Title

Use a clear title.

```text
Example:
QR check-in should show safe expired-code page instead of generic error
```

---

## 3. Summary

Describe the issue or requested work.

```text
...
```

---

## 4. Context / Why This Matters

Explain the project impact.

```text
[ ] Improves tourist completion
[ ] Improves data quality
[ ] Improves admin workflow
[ ] Improves dashboard accuracy
[ ] Improves security/privacy
[ ] Improves performance
[ ] Improves academic/report quality
[ ] Fixes production readiness issue
```

Details:

```text
...
```

---

## 5. Affected User / Role

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

---

## 6. Affected Area

```text
[ ] Public attraction pages
[ ] QR/check-in
[ ] Tourist profile/consent
[ ] Photo upload
[ ] Certificate generation
[ ] Digital passport/stamp
[ ] Optional survey
[ ] Admin CMS
[ ] Dashboard
[ ] Export/report
[ ] Authentication/authorization
[ ] Database
[ ] Storage
[ ] Documentation
[ ] Deployment
```

---

## 7. Expected Behavior

What should happen?

```text
...
```

---

## 8. Current Behavior

What happens now?

```text
...
```

---

## 9. Steps to Reproduce

For bugs, provide steps.

```text
1.
2.
3.
```

Environment:

```text
Browser:
Device:
URL/Route:
User role:
```

---

## 10. Acceptance Criteria

Define done clearly.

```text
[ ] ...
[ ] ...
[ ] ...
```

Examples:

```text
[ ] Active QR resolves correctly.
[ ] Invalid QR shows safe error.
[ ] Inactive QR shows unavailable page.
[ ] QR scan does not create a visit.
[ ] No private fields are exposed.
```

---

## 11. Security / Privacy Considerations

Does this issue involve personal data, permissions, files, exports, or dashboard privacy?

```text
[ ] No
[ ] Yes
```

If yes, describe:

```text
...
```

Checklist:

```text
[ ] No service role key exposure.
[ ] Server-side validation required.
[ ] Server-side permission check required.
[ ] Tourist ownership check required.
[ ] Consent required or affected.
[ ] Private storage affected.
[ ] Dashboard/export privacy affected.
[ ] Audit log required.
```

---

## 12. Dashboard / Metric Considerations

Complete if this affects dashboard numbers.

```text
[ ] QR scans are separate from visits.
[ ] Tourist Profiles are not verified unique people.
[ ] Estimated Spending is not Revenue.
[ ] Missing satisfaction is No data/null, not 0.
[ ] Zero denominator returns No data/null.
[ ] Metric definition should be updated.
[ ] Tests should verify formula.
```

Metric affected:

```text
...
```

---

## 13. Database Considerations

Complete if this affects schema/data.

```text
[ ] Migration required.
[ ] Data dictionary update required.
[ ] ERD update required.
[ ] Index required.
[ ] Constraint required.
[ ] Seed update required.
[ ] RLS/storage policy affected.
```

Details:

```text
...
```

---

## 14. Testing Requirements

Recommended tests:

```text
[ ] Unit test
[ ] Integration test
[ ] E2E test
[ ] Security/privacy test
[ ] Dashboard metric test
[ ] Export privacy test
[ ] Performance check
[ ] Manual mobile QA
```

Specific cases:

```text
...
```

---

## 15. Design / UX Notes

For UI work, include wireframe, screenshot, or description.

```text
...
```

UX guardrails:

```text
[ ] Do not require LINE for core flow.
[ ] Do not require email/phone/national ID before certificate.
[ ] Do not make survey mandatory before certificate.
[ ] Keep mobile-first design.
[ ] Include loading/empty/error states.
```

---

## 16. Related Documents

Relevant docs:

```text
- CODEX_MAIN_PROMPT.md
- docs/...
- checklists/...
- .codex/skills/...
```

---

## 17. Priority

```text
[ ] Critical
[ ] High
[ ] Medium
[ ] Low
```

Priority guidance:

```text
Critical = data leak, broken QR-to-certificate, service role exposure, ownership bypass, export privacy leak, wrong core dashboard metric.
High = important feature broken, admin workflow blocked, mobile flow broken, missing permission.
Medium = important improvement but not blocking.
Low = polish or documentation refinement.
```

---

## 18. Notes / Attachments

Add screenshots, logs, or references.

```text
...
```

Do not paste secrets, private tokens, real personal data, or production credentials.
