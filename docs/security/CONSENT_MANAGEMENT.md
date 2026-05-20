# CONSENT_MANAGEMENT.md

## 1. Document Purpose

This document defines consent management requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Consent management covers how the system explains data use, asks for permission, records consent, handles optional data collection, and prepares for future withdrawal or data subject requests.

The platform collects tourist data to create digital certificates and support sustainable tourism planning. The consent flow must be simple enough for tourists while still being clear and responsible.

---

## 2. Consent Management Mission

The mission is:

```text
Make data use understandable, voluntary where appropriate, recorded, and auditable.
```

The system must avoid:

```text
hidden data collection
pre-checked consent
forcing LINE/Google/email
forcing optional survey
unclear photo usage
mixing certificate consent with marketing consent
```

---

## 3. Consent Scope

Consent management applies to:

```text
tourist profile/visit data
photo usage for certificate
aggregated tourism planning analytics
optional survey responses
optional passport saving
optional Google/LINE linking
future optional email linking
future communication/marketing consent
future public certificate sharing
```

---

## 4. Consent Design Principles

## 4.1 Clear

Consent text must be understandable.

Avoid legal-heavy text in the main flow.

Use short notice with link to full privacy notice.

## 4.2 Specific

Separate consent purposes where needed.

Do not combine:

```text
certificate creation
analytics
marketing
public sharing
LINE notifications
```

into one unclear checkbox.

## 4.3 Voluntary

Optional features must be optional.

Examples:

```text
survey
LINE linking
Google linking
email linking future
marketing notification future
public sharing future
```

## 4.4 Recorded

Consent must be stored with:

```text
version
purpose
timestamp
source
tourist/visit context
```

## 4.5 Withdrawable Future

Production should allow withdrawal or data deletion/anonymization workflow.

MVP should at least design schema to support it.

---

## 5. Consent Types

## 5.1 Required Flow Consent

Required to create certificate and save visit record.

Covers:

```text
saving minimal tourist profile
saving visit record
using photo and display name for certificate
using submitted data for aggregated tourism planning
```

This consent is required before certificate generation.

## 5.2 Optional Survey Consent / Notice

Survey participation is optional.

The survey intro should explain:

```text
answers help improve tourism planning
questions are optional where possible
certificate is already available
```

No extra checkbox may be needed if the survey submit clearly states the purpose, but consent/notice should be recorded as part of survey submission if required.

## 5.3 Optional Identity Linking Consent

Required for:

```text
LINE linking
Google linking
email linking future
```

Purpose:

```text
save passport and access stamps later
```

This is separate from certificate generation.

## 5.4 Optional Communication Consent

Future only.

Required before sending:

```text
LINE messages
email messages
campaign reminders
survey reminders
promotional messages
```

Must be separate from identity linking.

## 5.5 Optional Public Sharing Consent

Future only.

Required before publishing certificate/passport page publicly.

Download does not mean public sharing.

---

## 6. Consent UX Placement

## 6.1 Tourist Profile Step

Place required consent before submit button.

Example flow:

```text
Minimal form fields
Privacy notice summary
Consent checkbox
Continue button
```

## 6.2 Photo Upload Step

Show photo-specific notice near upload area.

Example:

```text
Your photo will be used to create your digital certificate and will not be shown publicly unless you choose to share it.
```

## 6.3 Certificate Success Step

Show optional save/link consent separately.

Example:

```text
Save your passport with Google or LINE so you can access your stamps later.
```

## 6.4 Survey Step

Show optional survey notice before questions.

Example:

```text
Your answers help improve tourism in this area. This survey is optional.
```

---

## 7. Required Consent Copy

## 7.1 English Short Consent

```text
I agree that my information will be used to create my digital certificate and analyzed in aggregated form for tourism planning.
```

## 7.2 Thai Short Consent

```text
ฉันยินยอมให้ระบบใช้ข้อมูลของฉันเพื่อสร้างใบประกาศดิจิทัล และนำไปวิเคราะห์ในรูปแบบสถิติเพื่อการวางแผนพัฒนาการท่องเที่ยว
```

## 7.3 Checkbox Rules

The checkbox must:

```text
not be pre-checked
be required before submission
have accessible label
link to privacy notice
record consent version
```

---

## 8. Photo Usage Notice

## 8.1 English

```text
Your photo and display name are used to create your certificate. They will not be shown publicly unless you choose to share the certificate.
```

## 8.2 Thai

```text
รูปภาพและชื่อที่แสดงจะใช้เพื่อสร้างใบประกาศของคุณ และจะไม่ถูกแสดงสาธารณะหากคุณไม่ได้เลือกแชร์ใบประกาศ
```

## 8.3 Rule

Show this before or during photo upload.

---

## 9. Optional Survey Notice

## 9.1 English

```text
Help improve tourism in this area by answering a few quick questions. This survey is optional and your certificate is already available.
```

## 9.2 Thai

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ด้วยการตอบคำถามสั้น ๆ แบบสอบถามนี้เป็นทางเลือก และคุณยังสามารถดาวน์โหลดใบประกาศได้ตามปกติ
```

## 9.3 Rule

Do not block certificate download behind survey completion.

---

## 10. Passport Save / Optional Identity Link Notice

## 10.1 English

```text
Save your passport with Google or LINE so you can access your stamps later. This is optional.
```

## 10.2 Thai

```text
บันทึกพาสปอร์ตด้วย LINE เพื่อเปิดดูตราประทับภายหลังได้ การบันทึกนี้เป็นทางเลือก
```

## 10.3 Rule

Google and LINE linking are optional and must not be required for certificate creation.

---

## 11. Communication Consent Future

If future messaging is added, use a separate consent.

## 11.1 English

```text
I agree to receive tourism-related messages or reminders through the selected channel.
```

## 11.2 Thai

```text
ฉันยินยอมรับข้อความหรือการแจ้งเตือนเกี่ยวกับการท่องเที่ยวผ่านช่องทางที่เลือก
```

## 11.3 Rule

Do not send marketing or reminders just because user linked LINE.

Identity linking and communication consent are different.

---

## 12. Public Sharing Consent Future

If public share page is added:

## 12.1 English

```text
I understand that this certificate will be accessible to anyone with the share link until I disable sharing.
```

## 12.2 Thai

```text
ฉันเข้าใจว่าใบประกาศนี้จะสามารถเปิดดูได้โดยผู้ที่มีลิงก์แชร์ จนกว่าฉันจะปิดการแชร์
```

## 12.3 Rule

Public sharing must be user-initiated.

---

## 13. Consent Database Model

Recommended table:

```text
consent_records
```

Suggested fields:

```text
consent_id
tourist_id
visit_id
consent_version
consent_type
purpose_key
has_consented
consented_at
withdrawn_at
source
language
ip_hash optional
user_agent_hash optional
metadata_json optional
created_at
```

MVP can simplify but should include:

```text
tourist_id
visit_id
consent_version
purpose_key
has_consented
consented_at
source
```

---

## 14. Consent Type Values

Recommended consent_type values:

```text
required_flow
photo_certificate
analytics_aggregated
survey_optional
identity_link_line
identity_link_google
identity_link_email
communication_line
communication_email
public_certificate_share
```

MVP required:

```text
required_flow
photo_certificate
analytics_aggregated
```

Optional:

```text
survey_optional
identity_link_google
identity_link_line
```

---

## 15. Purpose Keys

Recommended `purpose_key` values:

```text
certificate_generation
tourism_planning_analytics
photo_for_certificate
digital_passport_access
optional_survey_analysis
line_identity_linking
google_identity_linking
email_identity_linking
marketing_communication
public_certificate_sharing
```

---

## 16. Consent Versioning

Consent text should be versioned.

Example versions:

```text
privacy_notice_v1
certificate_flow_consent_v1
survey_notice_v1
line_link_consent_v1
google_link_consent_v1
```

Rules:

- store version with consent record.
- if consent text changes materially, create new version.
- do not overwrite old consent text without history.

---

## 17. Consent Source Values

Recommended source values:

```text
tourist_profile_form
photo_upload_screen
survey_intro
passport_save_prompt
line_link_prompt
google_link_prompt
email_link_prompt
admin_manual_future
```

This helps audit where consent was collected.

---

## 18. Consent Recording Flow

## 18.1 Required Flow Consent

On minimal profile submit:

```text
validate checkbox true
create/reuse tourist
create visit
insert consent_records for required purposes
continue to photo upload
```

Required purposes:

```text
certificate_generation
tourism_planning_analytics
photo_for_certificate if photo step follows
```

Depending on design, photo consent may be recorded at photo upload.

## 18.2 Survey Consent/Notice

On survey start or submit:

```text
record survey notice/consent if required
save survey answers
```

## 18.3 Optional Identity Link Consent

On Google or LINE link:

```text
show provider-specific link notice
verify provider identity server-side
record consent
link identity
```

Do not link Google or LINE silently.

---

## 19. Consent Service

Recommended file:

```text
server/services/consent-service.ts
```

Recommended methods:

```ts
recordConsent(input: RecordConsentInput): Promise<ServiceResult<ConsentRecord>>;
recordMultipleConsents(input: RecordMultipleConsentInput): Promise<ServiceResult<ConsentRecord[]>>;
getLatestConsent(touristId: number, purposeKey: string): Promise<ServiceResult<ConsentRecord | null>>;
hasActiveConsent(touristId: number, purposeKey: string): Promise<ServiceResult<boolean>>;
withdrawConsent(input: WithdrawConsentInput): Promise<ServiceResult<void>>;
```

MVP can implement `recordConsent` and `hasActiveConsent`.

---

## 20. Consent Input Type

Conceptual TypeScript:

```ts
type RecordConsentInput = {
  touristId: number;
  visitId?: number;
  consentVersion: string;
  consentType: string;
  purposeKey: string;
  hasConsented: boolean;
  source: string;
  language: "th" | "en";
  metadata?: Record<string, unknown>;
};
```

Rules:

- metadata must not contain secrets.
- metadata must not dump full request body.
- hasConsented must be explicitly true for required consent.

---

## 21. Backend Validation Rules

Before saving tourist/visit data:

```text
has_consented must be true
consent_version required
purpose_key required
source required
```

If missing:

```text
return CONSENT_REQUIRED
```

User message:

```text
Please confirm consent so we can create your certificate and store your visit record.
```

Thai:

```text
กรุณายืนยันความยินยอมเพื่อให้ระบบสร้างใบประกาศและบันทึกข้อมูลการเยี่ยมชมของคุณ
```

---

## 22. Consent and Form Validation

Frontend should validate:

```text
checkbox checked
privacy notice visible/link available
```

Backend must also validate:

```text
hasConsented === true
```

Do not rely only on frontend checkbox.

---

## 23. Consent Withdrawal Future

Production should support withdrawal.

Possible withdrawal actions:

```text
withdraw communication consent
unlink Google/LINE/email
delete or anonymize tourist profile
delete photo/certificate
stop public sharing
```

Important:

Withdrawal may not always delete already aggregated anonymized analytics.

The privacy notice should explain this clearly.

---

## 24. Consent Withdrawal Data Model

For withdrawal, update:

```text
withdrawn_at
```

rather than deleting the original consent record.

Reason:

```text
auditability
```

Also record:

```text
withdrawal_source
withdrawal_reason optional
processed_by optional
```

---

## 25. Consent and Data Deletion

If a user requests deletion, possible approach:

```text
anonymize tourist profile
delete direct identity records
delete or detach photos
delete certificate files if requested
preserve aggregated visit analytics where allowed
```

Exact policy must align with project/legal requirements.

See:

```text
docs/security/DATA_ANONYMIZATION.md
docs/database/DATA_RETENTION_POLICY.md
```

---

## 26. Consent for Children / Under 18

The system collects age group, including under_18.

MVP should avoid collecting sensitive data from minors.

If under_18 is selected:

Possible safe design:

```text
keep required data minimal
do not collect contact data
do not ask sensitive questions
do not require Google/LINE/email
avoid public sharing by default
```

Future production may require additional guardian consent depending on policy/legal context.

---

## 27. Consent UX for Foreign Tourists

Consent copy must be available in:

```text
Thai
English
```

Future languages:

```text
Malay
Chinese
Arabic optional depending on tourism context
```

Rules:

- do not require LINE.
- privacy notice must still be understandable.
- guest flow must work.

---

## 28. Consent and Dashboard

Dashboard should not expose individual consent records by default.

Admin privacy/audit page future may show:

```text
consent version counts
consent status summary
withdrawal count
```

Do not show individual tourists unless permission allows.

---

## 29. Consent and Export

Default exports should not include detailed consent records.

Possible admin/research export may include:

```text
consent_version
consent_status
consented_at
```

only if needed and permission allows.

Do not export:

```text
raw guest token
LINE ID
Google subject
provider_user_id
raw IP
raw user agent
```

---

## 30. Consent and Audit Logs

Consent records are separate from audit logs.

Audit logs should record admin/system actions.

Consent records should record tourist consent.

Do not store consent only in audit logs.

---

## 31. Consent Error Codes

Recommended error codes:

```text
CONSENT_REQUIRED
CONSENT_VERSION_MISSING
CONSENT_PURPOSE_INVALID
CONSENT_RECORD_FAILED
CONSENT_WITHDRAWAL_FAILED
```

Messages:

```text
Please confirm consent to continue.
Consent information is incomplete. Please reload and try again.
We could not save your consent record. Please try again.
```

Thai:

```text
กรุณายืนยันความยินยอมเพื่อดำเนินการต่อ
ข้อมูลความยินยอมไม่ครบถ้วน กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง
ไม่สามารถบันทึกความยินยอมได้ กรุณาลองใหม่
```

---

## 32. Consent Testing Checklist

Test:

```text
checkbox unchecked
checkbox checked
consent version missing
invalid consent purpose
Thai language consent
English language consent
photo upload notice visible
survey optional notice visible
LINE link consent separate
Google link consent separate
communication consent not assumed
backend rejects missing consent
consent record saved with timestamp
consent record saved with version
```

---

## 33. MVP Acceptance Checklist

```text
[ ] Consent checkbox exists in tourist profile form.
[ ] Consent checkbox is not pre-checked.
[ ] Consent is required before visit/profile save.
[ ] Consent text explains certificate and aggregated planning use.
[ ] Photo usage notice exists.
[ ] Survey optional notice exists.
[ ] Google/LINE passport save consent is separate or planned.
[ ] Consent version is stored.
[ ] Consent timestamp is stored.
[ ] Consent source is stored.
[ ] Backend validates consent.
[ ] Consent records table exists or is planned.
[ ] Marketing/notification consent is not assumed.
```

---

## 34. Do Not Do

Do not:

```text
Pre-check consent box.
Hide consent text.
Use one vague consent for everything.
Require LINE to give consent.
Require Google to give consent.
Treat LINE linking as marketing consent.
Treat Google linking as marketing consent.
Publish certificate without sharing consent.
Send messages without communication consent.
Save tourist data if required consent is missing.
Store consent only in frontend state.
Overwrite consent text without versioning.
```

---

## 35. Future Enhancements

Possible future improvements:

```text
full privacy notice page
consent management page for tourists
withdraw consent flow
unlink Google/LINE/email flow
delete/anonymize request flow
communication preference center
public sharing management
consent version migration report
admin consent dashboard
```

---

## 36. Final Consent Rule

Consent should be clear, specific, recorded, and respectful.

The tourist should understand why data is collected and should never be forced into optional tracking, communication, or public sharing.
