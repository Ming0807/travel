# UI_UX_CHECKLIST.md

## 1. Document Purpose

This checklist defines UI/UX quality requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The system depends on voluntary tourist participation. Good UX is not decoration; it directly affects whether tourists complete the QR-to-certificate flow and whether the system can collect useful planning data.

Use this checklist when designing, implementing, reviewing, and testing:

```text
public attraction pages
QR/check-in landing
minimal tourist profile form
photo upload
certificate preview/success
digital passport/stamps
optional survey
admin CMS
dashboard
export/report UI
```

---

## 2. UI/UX Mission

The UI/UX mission is:

```text
Make tourists want to complete the flow and make administrators able to manage tourism data confidently.
```

The product must feel:

```text
trustworthy
fast
mobile-first
simple
rewarding
privacy-aware
professional
accessible
not overwhelming
```

---

## 3. Core UX Risk

The main UX risk is:

```text
Tourists scan the QR code but abandon the flow before giving useful data.
```

Common abandonment causes:

```text
unclear benefit
too much text
too many required fields
privacy concern
LINE required
photo upload difficulty
slow page
certificate reward not attractive
survey appears before reward
survey too long
```

The UX should solve these issues before asking for more data.

---

## 4. Related Documents

This checklist must align with:

```text
docs/frontend/UI_UX_PRINCIPLES.md
docs/frontend/DESIGN_SYSTEM.md
docs/frontend/FORM_UX_RULES.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/frontend/ADMIN_SIDE_PAGES.md
docs/frontend/RESPONSIVE_GUIDELINES.md
docs/frontend/ACCESSIBILITY_GUIDELINES.md
docs/testing/UX_TEST_PLAN.md
docs/testing/E2E_TEST_PLAN.md
docs/business/TOURIST_INCENTIVE_STRATEGY.md
docs/business/DIGITAL_PASSPORT_STRATEGY.md
docs/security/PDPA_PRIVACY_DESIGN.md
```

---

# Global UX Checklist

---

## 5. Visual Design Baseline

Checklist:

```text
[ ] UI looks professional enough for university/institutional demonstration.
[ ] Visual style is consistent across public/tourist/admin pages.
[ ] Color palette is consistent.
[ ] Typography is consistent.
[ ] Spacing is consistent.
[ ] Buttons are visually clear.
[ ] Cards have consistent style.
[ ] Forms have consistent style.
[ ] Icons are used consistently.
[ ] Loading/empty/error states match the design system.
[ ] Layout does not feel like a basic CRUD template.
```

---

## 6. Brand and Tone

Checklist:

```text
[ ] Tone is welcoming and trustworthy.
[ ] Tourist-facing text is short and friendly.
[ ] Admin-facing text is clear and professional.
[ ] Academic/dashboard terms are accurate.
[ ] Avoid overly technical wording for tourists.
[ ] Avoid confusing government/official claims unless verified.
[ ] Estimated spending is not called revenue.
[ ] Tourist profiles are not called verified unique people.
```

---

## 7. Mobile-First UX

Checklist:

```text
[ ] Main tourist flow works well on mobile.
[ ] No horizontal scroll on tourist pages.
[ ] CTA buttons are visible on mobile.
[ ] Touch targets are large enough.
[ ] Form inputs are easy to tap.
[ ] Photo upload works from camera/gallery.
[ ] Certificate preview fits screen.
[ ] Download button is visible.
[ ] Survey is not cramped.
[ ] Important instructions appear before actions.
```

Recommended minimum touch target:

```text
44px height
```

---

## 8. Speed Perception UX

Checklist:

```text
[ ] Page shows meaningful content quickly.
[ ] Loading states appear immediately after actions.
[ ] Long actions show progress or clear loading text.
[ ] Upload does not look frozen.
[ ] Certificate generation does not look frozen.
[ ] Submit buttons are disabled while loading.
[ ] Duplicate clicks are prevented.
[ ] User can retry failed actions.
```

---

## 9. Trust UX

Checklist:

```text
[ ] QR landing page clearly explains why the system exists.
[ ] Tourist understands what they will receive.
[ ] Data use is explained simply.
[ ] Photo use is explained before upload.
[ ] Certificate is not public by default.
[ ] Survey is clearly optional.
[ ] LINE/email are optional.
[ ] No suspicious-looking forms.
[ ] No unnecessary personal fields.
[ ] Privacy notice is accessible.
```

---

# Tourist Flow UX Checklist

---

## 10. QR Landing Page UX

Goal:

```text
Tourist understands the benefit within 5 seconds.
```

Checklist:

```text
[ ] Attraction name is visible.
[ ] Province/location context is visible.
[ ] Photo spot context is visible if used.
[ ] Certificate/reward benefit is visible above the fold.
[ ] Primary CTA is obvious.
[ ] Page does not start with long academic explanation.
[ ] Tourist does not need to log in.
[ ] Tourist does not need LINE.
[ ] Page supports Thai.
[ ] Page supports English if multilingual.
[ ] Invalid/inactive QR error messages are friendly.
```

Good CTA examples:

```text
Create My Certificate
Get My Travel Memory
สร้างใบประกาศของฉัน
รับบัตรที่ระลึก
```

Avoid CTA:

```text
Submit Data
Register Information
Proceed to Database
```

---

## 11. Certificate Incentive UX

Checklist:

```text
[ ] Certificate preview looks attractive.
[ ] Tourist understands they get something back.
[ ] Certificate feels shareable/savable.
[ ] Stamp/passport reward is shown after completion.
[ ] The reward appears before the optional survey.
[ ] Certificate is visually better than a plain text confirmation.
[ ] Certificate includes attraction identity.
[ ] Certificate includes tourist photo in a polished layout.
```

---

## 12. Minimal Profile Form UX

Goal:

```text
Collect essential data without scaring users away.
```

Checklist:

```text
[ ] Required fields are minimal.
[ ] Form can be completed in 60-90 seconds.
[ ] Display name label explains nickname is acceptable if desired.
[ ] Origin field is non-specific.
[ ] Age group uses ranges.
[ ] Consent is short and clear.
[ ] Field errors are clear.
[ ] Form does not ask for national ID.
[ ] Form does not ask for full address.
[ ] Form does not require phone number.
[ ] Form does not require email.
[ ] Form does not require LINE.
[ ] Next step is clear after submit.
```

Recommended required fields:

```text
display name
origin country/province
age group
consent
```

---

## 13. Form Label UX

Checklist:

```text
[ ] Labels are clear.
[ ] Required fields are marked.
[ ] Helper text is short.
[ ] Placeholder text is not the only label.
[ ] Error messages are specific.
[ ] Dropdown values are understandable.
[ ] "Prefer not to answer" exists where appropriate.
[ ] Thai wording is natural.
[ ] English wording is natural.
```

Example helper text for origin:

```text
Used only for tourism statistics.
```

Thai:

```text
ใช้เพื่อวิเคราะห์ภาพรวมการท่องเที่ยวเท่านั้น
```

---

## 14. Consent UX

Checklist:

```text
[ ] Consent checkbox is not pre-checked.
[ ] Consent text is short.
[ ] Consent explains certificate use.
[ ] Consent explains aggregated planning use.
[ ] Privacy notice link exists.
[ ] Photo notice appears before upload.
[ ] Survey optional notice appears before survey.
[ ] LINE linking consent is separate if implemented.
[ ] Marketing/notification consent is separate if implemented.
```

Must not:

```text
[ ] hide consent in small gray text.
[ ] force consent to marketing.
[ ] make public sharing automatic.
```

---

## 15. Photo Upload UX

Checklist:

```text
[ ] Upload button is easy to find.
[ ] Accepted formats are visible.
[ ] Max file size is visible.
[ ] Camera/gallery use works on mobile.
[ ] Preview appears after upload.
[ ] Re-upload is possible.
[ ] Upload progress/loading is clear.
[ ] Invalid file message is understandable.
[ ] Large file message is understandable.
[ ] HEIC unsupported case is handled if not supported.
[ ] User understands photo is for certificate.
```

Good error:

```text
This photo is too large. Please upload a smaller image.
```

Bad error:

```text
Payload Too Large
```

---

## 16. Certificate Preview UX

Checklist:

```text
[ ] Preview is visually polished.
[ ] Display name is readable.
[ ] Long names do not break layout.
[ ] Attraction name is readable.
[ ] Visit date is readable.
[ ] Photo is not badly cropped.
[ ] Template branding is appropriate.
[ ] Generate button is clear.
[ ] Loading state appears during generation.
[ ] User can go back/re-upload if needed.
```

---

## 17. Certificate Success UX

Checklist:

```text
[ ] Success message is positive.
[ ] Download button is highly visible.
[ ] Stamp earned message is visible.
[ ] Already-earned stamp state is friendly.
[ ] Optional survey CTA is visible but not forced.
[ ] Passport/save CTA is visible but optional.
[ ] User can finish immediately.
[ ] User understands how to collect more stamps.
```

Bad UX:

```text
forcing survey before showing download
```

Good UX:

```text
show certificate first, then ask for optional survey
```

---

## 18. Digital Passport UX

Checklist:

```text
[ ] Passport concept is easy to understand.
[ ] Earned stamps are visually clear.
[ ] Empty state encourages collecting first stamp.
[ ] Already-earned state is not treated as error.
[ ] Guest passport limitation is explained.
[ ] Save with LINE/email is optional.
[ ] Non-LINE tourists can continue.
[ ] Passport works on mobile.
```

---

## 19. Optional Survey UX

Goal:

```text
Ask useful questions after the tourist receives the reward.
```

Checklist:

```text
[ ] Survey appears after certificate generation.
[ ] Survey is clearly optional.
[ ] Survey can be completed in 1-2 minutes.
[ ] Questions are grouped logically.
[ ] Spending uses ranges.
[ ] Satisfaction uses clear scale.
[ ] Comment is optional.
[ ] Skip/finish path exists.
[ ] Submit loading state exists.
[ ] Thank-you state exists.
```

Must not:

```text
[ ] ask too many questions before certificate.
[ ] make survey feel like a condition for reward.
[ ] ask exact income.
[ ] ask sensitive personal questions.
```

---

## 20. Foreign Tourist UX

Checklist:

```text
[ ] English path works.
[ ] LINE is not required.
[ ] Guest path works.
[ ] Origin country selection works.
[ ] Certificate can be generated in English or bilingual style.
[ ] Survey is understandable in English.
[ ] Privacy notice is understandable.
[ ] Passport limitation is explained without LINE.
```

---

## 21. Returning Tourist UX

Checklist:

```text
[ ] Existing profile is reused.
[ ] Repeat user does not fill all data again.
[ ] New attraction check-in is quick.
[ ] User understands they can collect another stamp.
[ ] Same attraction repeat visit handles already-earned stamp politely.
[ ] User does not see confusing duplicate errors.
```

---

# Admin UX Checklist

---

## 22. Admin Navigation UX

Checklist:

```text
[ ] Admin sidebar/topbar is clear.
[ ] Dashboard is easy to find.
[ ] Attractions are easy to find.
[ ] Photo spots/check-in codes are easy to find.
[ ] Reports/exports are easy to find.
[ ] User/role management is hidden from non-super-admin.
[ ] Current page is highlighted.
[ ] Logout is available.
```

---

## 23. Admin CRUD UX

Checklist:

```text
[ ] Tables are readable.
[ ] Search/filter exists where useful.
[ ] Create buttons are obvious.
[ ] Edit/delete/deactivate actions are clear.
[ ] Destructive actions require confirmation.
[ ] Save buttons have loading states.
[ ] Validation errors are clear.
[ ] Success messages are clear.
[ ] Empty states guide next action.
[ ] Pagination or bounded lists exist for growing data.
```

---

## 24. Attraction CMS UX

Checklist:

```text
[ ] Admin understands published/draft/inactive status.
[ ] Province/district selection is easy.
[ ] Slug is auto-generated or clearly validated.
[ ] Thai/English content sections are organized.
[ ] Image upload is clear.
[ ] 360 media input is clear.
[ ] Preview public page is available or planned.
[ ] Required fields are not overwhelming.
```

---

## 25. QR / Check-in Admin UX

Checklist:

```text
[ ] Admin can create QR/check-in code without developer help.
[ ] QR code status is clear.
[ ] QR link can be copied.
[ ] QR image can be downloaded if implemented.
[ ] Admin can test QR link.
[ ] Admin can deactivate code.
[ ] Admin understands which attraction/photo spot the QR belongs to.
[ ] Expiration dates are understandable if used.
```

---

## 26. Admin Export UX

Checklist:

```text
[ ] Export options are understandable.
[ ] Export button is easy to find.
[ ] Export explains what data is included.
[ ] Privacy warning is visible.
[ ] Permission restrictions are clear.
[ ] Loading state is visible.
[ ] Download success is clear.
[ ] No-data export state is clear.
[ ] Too-large export error is clear.
```

---

# Dashboard UX Checklist

---

## 27. Dashboard Readability

Checklist:

```text
[ ] Dashboard has clear page title.
[ ] Data freshness note is visible.
[ ] Filters are easy to use.
[ ] KPI cards are readable.
[ ] Charts have titles.
[ ] Tables have clear columns.
[ ] Tooltips explain definitions.
[ ] Empty states are meaningful.
[ ] Error states do not break whole dashboard unnecessarily.
```

---

## 28. Dashboard Metric Meaning

Checklist:

```text
[ ] Tourist Profiles is not labeled Unique People.
[ ] QR Scans and Visits are separate.
[ ] Estimated Spending is not called Revenue.
[ ] Average Satisfaction shows response count or context.
[ ] Survey Completion Rate shows denominator logic.
[ ] Missing data shows No data, not fake zero.
[ ] Small sample warnings exist where useful.
[ ] Data limitations are visible.
```

---

## 29. Dashboard Actionability

Checklist:

```text
[ ] Dashboard helps answer planning questions.
[ ] Top attractions are visible.
[ ] Low satisfaction areas are visible.
[ ] Promotion opportunities are visible or planned.
[ ] Expense/spending patterns are visible.
[ ] Travel behavior patterns are visible.
[ ] Funnel drop-off is visible.
[ ] Export/report path exists.
```

---

# Accessibility Checklist

---

## 30. Basic Accessibility

Checklist:

```text
[ ] All inputs have labels.
[ ] Buttons have clear text.
[ ] Icons have accessible labels where needed.
[ ] Keyboard navigation works.
[ ] Focus states are visible.
[ ] Text contrast is acceptable.
[ ] Error messages are readable.
[ ] Color is not the only meaning.
```

---

## 31. Mobile Accessibility

Checklist:

```text
[ ] Text is not too small.
[ ] Buttons are easy to tap.
[ ] Form controls are not too close together.
[ ] Sticky/footer buttons do not cover fields.
[ ] Certificate preview can be scrolled/zoomed if needed.
[ ] Modal/dialogs fit on small screens.
```

---

## 32. Dashboard Accessibility

Checklist:

```text
[ ] Chart information is also available in text/table where important.
[ ] Chart legends are readable.
[ ] Color-only meaning is avoided.
[ ] Tooltips are accessible or definitions are available elsewhere.
[ ] Filters are keyboard accessible.
```

---

# Content and Language Checklist

---

## 33. Thai Language UX

Checklist:

```text
[ ] Thai wording is natural.
[ ] Thai text does not overflow.
[ ] Thai font renders correctly.
[ ] Error messages are translated.
[ ] Buttons are translated.
[ ] Consent text is translated.
[ ] Dashboard terms are translated carefully.
```

---

## 34. English Language UX

Checklist:

```text
[ ] English flow is complete for foreign tourists.
[ ] English is not mixed awkwardly with Thai unless intentional.
[ ] Error messages are translated.
[ ] Consent/privacy text is translated.
[ ] Survey is understandable.
```

---

## 35. Content Tone

Checklist:

```text
[ ] Tourist text is concise.
[ ] Admin text is precise.
[ ] Dashboard text is analytically correct.
[ ] Error messages are helpful.
[ ] Success messages are positive.
[ ] Privacy messages are clear but not scary.
```

---

# Error/Loading/Empty State Checklist

---

## 36. Loading States

Checklist:

```text
[ ] QR landing loading state exists.
[ ] Form submit loading state exists.
[ ] Photo upload loading/progress exists.
[ ] Certificate generation loading exists.
[ ] Survey submit loading exists.
[ ] Dashboard section loading exists.
[ ] Export loading state exists.
```

---

## 37. Empty States

Checklist:

```text
[ ] No attractions state.
[ ] No passport stamps state.
[ ] No survey data state.
[ ] No dashboard data state.
[ ] No export data state.
[ ] Empty state tells user what to do next.
```

---

## 38. Error States

Checklist:

```text
[ ] Invalid QR error is friendly.
[ ] Inactive QR error is friendly.
[ ] Upload error is friendly.
[ ] Certificate error is friendly.
[ ] Survey error is friendly.
[ ] Dashboard section error is friendly.
[ ] Export error is friendly.
[ ] Errors do not show technical internals.
```

---

# UX Testing Checklist

---

## 39. Tourist UX Test Checklist

Test with real or representative users:

```text
[ ] User understands QR landing within 5 seconds.
[ ] User can complete minimal form.
[ ] User understands consent.
[ ] User can upload photo on phone.
[ ] User likes/understands certificate.
[ ] User can download certificate.
[ ] User understands stamp/passport.
[ ] User knows survey is optional.
[ ] User can complete survey in 1-2 minutes.
[ ] Foreign/non-LINE user can complete flow.
```

---

## 40. Admin UX Test Checklist

Test with non-developer/admin-like user:

```text
[ ] Admin can log in.
[ ] Admin can create attraction.
[ ] Admin can add photo spot.
[ ] Admin can create QR/check-in code.
[ ] Admin can test QR link.
[ ] Admin can interpret dashboard.
[ ] Admin can export safely.
[ ] Admin understands active/inactive status.
```

---

## 41. Dashboard Interpretation Test

Ask tester:

```text
[ ] What is the difference between QR scans and visits?
[ ] What does Tourist Profiles mean?
[ ] What does Estimated Spending mean?
[ ] Why is Average Satisfaction No data?
[ ] Which attraction should be improved?
[ ] Which attraction should be promoted?
```

Pass if tester does not misinterpret key metrics.

---

# UI/UX Acceptance Checklist

---

## 42. MVP UI/UX Acceptance

```text
[ ] Tourist can understand the QR landing page.
[ ] Tourist can complete certificate flow on mobile.
[ ] Minimal form is short.
[ ] Consent is clear.
[ ] Photo upload is usable.
[ ] Certificate looks rewarding.
[ ] Survey is optional and short.
[ ] Guest/non-LINE flow works.
[ ] Returning tourist flow is faster.
[ ] Admin can create attractions and QR codes.
[ ] Dashboard is understandable.
[ ] Exports are clear and privacy-aware.
[ ] Loading/empty/error states exist.
[ ] Thai/English text works where required.
[ ] No misleading dashboard labels.
```

---

## 43. Critical UX Release Blockers

Do not release if:

```text
[ ] QR landing does not explain benefit.
[ ] Tourist cannot complete flow on mobile.
[ ] LINE is required for all users.
[ ] Survey blocks certificate.
[ ] Photo upload is unusable.
[ ] Certificate download is hidden/broken.
[ ] Consent is missing or pre-checked.
[ ] Dashboard calls estimated spending revenue.
[ ] Admin cannot create QR code without developer.
```

---

## 44. Do Not Do

Do not:

```text
start with a long academic paragraph on QR landing.
ask too many questions before certificate.
require LINE/email/phone before certificate.
hide download button after certificate.
force survey before reward.
show raw technical errors.
use color-only dashboard meaning.
call QR scans visits.
call tourist profiles verified unique people.
```

---

## 45. Future UX Enhancements

Possible future improvements:

```text
A/B test QR landing copy.
A/B test certificate templates.
A/B test survey length.
Guided admin onboarding.
Dashboard insight explanations.
Public share experience.
Gamified passport progress.
Multi-language expansion.
Offline/PWA enhancement.
```

---

## 46. Final UI/UX Rule

The UX should reward the tourist first, then respectfully ask for more data.

A frictionless, trustworthy experience is the strongest data collection strategy.
