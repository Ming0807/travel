# FRONTEND_CHECKLIST.md

## 1. Document Purpose

This checklist defines frontend readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist before and during frontend development with Codex.

The frontend must support:

```text
public tourism pages
QR/check-in landing
tourist certificate flow
photo upload
digital passport/stamps
optional survey
admin backoffice
dashboard analytics
exports
PWA/mobile usage
Thai/English UX
accessibility
performance
```

The frontend is not only a visual layer. It directly affects whether tourists are willing to give useful data.

---

## 2. Frontend Mission

The frontend mission is:

```text
Make the system easy enough for tourists to complete the flow and professional enough for administrators to manage real tourism data.
```

The frontend must be:

```text
mobile-first
fast
clear
reward-driven
privacy-aware
accessible
responsive
professional
dashboard-ready
admin-friendly
```

---

## 3. Related Documents

This checklist must align with:

```text
docs/frontend/FRONTEND_REQUIREMENTS.md
docs/frontend/UI_UX_PRINCIPLES.md
docs/frontend/DESIGN_SYSTEM.md
docs/frontend/ROUTES_STRUCTURE.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/frontend/ADMIN_SIDE_PAGES.md
docs/frontend/FORM_UX_RULES.md
docs/frontend/PWA_REQUIREMENTS.md
docs/frontend/RESPONSIVE_GUIDELINES.md
docs/frontend/ACCESSIBILITY_GUIDELINES.md
docs/modules/MODULE_02_QR_CHECKIN.md
docs/modules/MODULE_05_PHOTO_UPLOAD.md
docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
```

---

## 4. Frontend Technology Checklist

Recommended stack:

```text
Next.js App Router
TypeScript
Tailwind CSS
React components
Server Actions / Route Handlers
Zod validation
shadcn/ui optional
Recharts optional
Playwright
Vitest
```

Checklist:

```text
[ ] Next.js App Router is configured.
[ ] TypeScript strict mode is enabled.
[ ] Tailwind CSS is configured.
[ ] Global CSS is organized.
[ ] Component folders are separated by domain.
[ ] Public/tourist/admin areas are separated.
[ ] Shared UI components exist.
[ ] Form validation strategy is defined.
[ ] Chart library is selected if dashboard charts are implemented.
[ ] Test strategy for frontend exists.
```

---

## 5. Frontend Folder Structure

Recommended:

```text
src/
  app/
    (public)/
    (tourist)/
    admin/
    api/
  components/
    ui/
    public/
    tourist/
    admin/
    dashboard/
    certificate/
    forms/
  lib/
    constants/
    utils/
    validation/
    types/
  styles/
```

Checklist:

```text
[ ] Public pages are not mixed with admin pages.
[ ] Tourist flow components are separated.
[ ] Admin components are separated.
[ ] Dashboard components are separated.
[ ] Certificate components are separated.
[ ] Shared UI components are reusable.
[ ] Utility functions are not duplicated across pages.
[ ] Route-specific logic does not pollute global components.
```

---

# Public Website Checklist

---

## 6. Public Home Page

Checklist:

```text
[ ] Home page loads without authentication.
[ ] Page explains southern border tourism project clearly.
[ ] Page links to attractions.
[ ] Page supports Thai text.
[ ] Page supports English text if multilingual is enabled.
[ ] Page is mobile responsive.
[ ] Page does not expose admin-only information.
[ ] Page loads quickly.
```

Optional:

```text
[ ] Province highlights for Yala, Pattani, Narathiwat.
[ ] Featured attractions.
[ ] Sustainable tourism message.
[ ] Digital passport explanation.
```

---

## 7. Public Attraction List

Checklist:

```text
[ ] Attraction list shows only published active attractions.
[ ] Attraction cards show name, province, image, and short description.
[ ] Province filter exists or is planned.
[ ] Search exists or is planned.
[ ] Empty state exists.
[ ] Loading state exists.
[ ] Error state exists.
[ ] Cards are clickable.
[ ] Mobile layout works.
[ ] Images are optimized.
```

---

## 8. Public Attraction Detail Page

Checklist:

```text
[ ] Page shows attraction name.
[ ] Page shows province/district.
[ ] Page shows description/history.
[ ] Page shows images.
[ ] Page shows 360 media if configured.
[ ] Page shows visitor-friendly information.
[ ] Page shows CTA to check in if appropriate.
[ ] Page supports Thai/English content.
[ ] Page handles missing English content gracefully.
[ ] Page uses optimized images.
[ ] Page is mobile responsive.
[ ] Unpublished/inactive attraction returns safe 404/unavailable page.
```

Must not show:

```text
[ ] admin notes
[ ] private storage paths
[ ] draft content
[ ] internal IDs unnecessarily
```

---

# QR and Tourist Flow Checklist

---

## 9. QR / Check-in Landing Page

Checklist:

```text
[ ] Route exists for /checkin/[code] or equivalent.
[ ] Active QR code loads correct attraction context.
[ ] Inactive QR code shows safe unavailable page.
[ ] Expired QR code shows safe expired page.
[ ] Invalid QR code shows safe error page.
[ ] Attraction name is visible.
[ ] Photo spot context is visible if configured.
[ ] Certificate reward is explained within first screen.
[ ] Primary CTA is obvious.
[ ] Page works without login.
[ ] Page works without LINE.
[ ] Language switch is available if required.
[ ] Mobile CTA is not hidden below confusing content.
```

UX rule:

```text
Tourist should understand within 5 seconds that they can create a digital certificate or travel memory.
```

---

## 10. Tourist Minimal Profile Form

Checklist:

```text
[ ] Display name field exists.
[ ] Origin country/province field exists.
[ ] Age group field exists.
[ ] Preferred language field exists if required.
[ ] Consent checkbox exists.
[ ] Consent checkbox is not pre-checked.
[ ] Privacy summary is visible.
[ ] Required fields are clearly marked.
[ ] Error messages appear near fields.
[ ] Form does not require LINE.
[ ] Form does not require email.
[ ] Form does not require phone.
[ ] Form does not require full address.
[ ] Form does not require national ID.
[ ] Submit button has loading state.
[ ] Duplicate submit is prevented.
[ ] Mobile keyboard behavior is acceptable.
```

---

## 11. Consent UX

Checklist:

```text
[ ] Consent text is short and clear.
[ ] Consent is available in Thai.
[ ] Consent is available in English if multilingual.
[ ] Consent explains certificate generation.
[ ] Consent explains aggregated tourism planning use.
[ ] Consent links to privacy notice.
[ ] Photo usage notice is shown before upload.
[ ] Survey optional notice is shown before survey.
[ ] LINE/passport save consent is separate if implemented.
```

Must not:

```text
[ ] pre-check consent.
[ ] hide consent text.
[ ] mix marketing consent with certificate consent.
```

---

## 12. Photo Upload UI

Checklist:

```text
[ ] Upload component accepts JPEG/PNG/WebP.
[ ] Accepted formats are shown to user.
[ ] Max file size is shown to user.
[ ] Invalid file type shows friendly error.
[ ] Oversized file shows friendly error.
[ ] Upload preview appears.
[ ] Upload loading/progress state exists.
[ ] Retry/re-upload is possible.
[ ] Camera/gallery upload works on mobile.
[ ] Upload UI works in small viewport.
[ ] HEIC unsupported case is handled gracefully if not supported.
[ ] Photo purpose is explained.
```

Must not:

```text
[ ] expose raw storage path.
[ ] store large base64 image in React state longer than needed.
[ ] proceed to certificate without successful upload.
```

---

## 13. Certificate Preview UI

Checklist:

```text
[ ] Certificate preview page exists.
[ ] Preview shows display name.
[ ] Preview shows attraction name.
[ ] Preview shows visit date.
[ ] Preview uses uploaded photo.
[ ] Template looks professional.
[ ] Thai text renders correctly.
[ ] English text renders correctly if applicable.
[ ] Long display names are handled.
[ ] Mobile preview does not overflow.
[ ] Generate button is clear.
[ ] Generate button has loading state.
[ ] Duplicate click is prevented.
```

---

## 14. Certificate Success Page

Checklist:

```text
[ ] Success message is clear.
[ ] Download button is visible.
[ ] Certificate image/file can be downloaded.
[ ] Stamp earned message is shown.
[ ] Already-earned stamp state is handled.
[ ] Optional survey CTA is shown.
[ ] Survey is clearly optional.
[ ] Passport save CTA is shown if implemented.
[ ] User can finish without LINE.
[ ] User can finish without survey.
```

---

## 15. Digital Passport / Stamp UI

Checklist:

```text
[ ] Passport page exists or is planned.
[ ] Earned stamps are visible.
[ ] Stamps group by attraction/province or clear list.
[ ] Stamp earned date is visible if useful.
[ ] Empty passport state exists.
[ ] Guest passport limitation is explained.
[ ] LINE/email save is optional if implemented.
[ ] Returning tourist flow is understandable.
[ ] Already-earned stamp state is not shown as error.
```

---

## 16. Optional Survey UI

Checklist:

```text
[ ] Survey appears after certificate.
[ ] Survey is optional.
[ ] Travel companion field exists.
[ ] Group size field exists.
[ ] Transport mode field exists.
[ ] Travel purpose field exists.
[ ] Overnight/nights fields exist.
[ ] Spending range field exists.
[ ] Satisfaction rating exists.
[ ] Revisit/recommendation fields exist.
[ ] Comment is optional.
[ ] Prefer not to answer is available where appropriate.
[ ] Survey can be completed within 1-2 minutes.
[ ] Submit button has loading state.
[ ] Thank-you state exists.
```

Must not:

```text
[ ] block certificate download.
[ ] ask too many questions before reward.
[ ] force sensitive comments.
```

---

# Admin Frontend Checklist

---

## 17. Admin Layout

Checklist:

```text
[ ] Admin shell exists.
[ ] Sidebar/topbar navigation exists.
[ ] Current page is clearly highlighted.
[ ] User/account menu exists.
[ ] Logout is available.
[ ] Responsive admin layout works on tablet/desktop.
[ ] Permission-based menu hiding exists.
[ ] Backend permissions still enforce access.
```

---

## 18. Admin Dashboard Page

Checklist:

```text
[ ] Dashboard page loads after login.
[ ] KPI cards are visible.
[ ] Date filter exists.
[ ] Province filter exists.
[ ] Attraction filter exists.
[ ] Filters have loading state.
[ ] Empty state exists.
[ ] Error state exists.
[ ] Data freshness note exists.
[ ] Metric tooltips exist where needed.
[ ] Estimated spending is labeled as estimated.
[ ] QR scans and visits are visually distinct.
```

---

## 19. Admin Attraction CMS UI

Checklist:

```text
[ ] Attraction list exists.
[ ] Search/filter exists or is planned.
[ ] Create attraction button exists.
[ ] Edit action exists.
[ ] Publish/unpublish action exists.
[ ] Deactivate action exists.
[ ] Form supports Thai content.
[ ] Form supports English content if multilingual.
[ ] Province/district selectors exist.
[ ] Slug field is auto-generated or validated.
[ ] Image/media upload UI exists.
[ ] Validation errors are clear.
[ ] Save loading state exists.
[ ] Confirmation dialog exists for destructive actions.
```

---

## 20. Admin Photo Spot UI

Checklist:

```text
[ ] Photo spot list exists.
[ ] Photo spot creation form exists.
[ ] Photo spot links to attraction.
[ ] QR placement description field exists or planned.
[ ] Active/inactive status visible.
[ ] Deactivate action exists.
[ ] Validation messages exist.
```

---

## 21. Admin Check-in Code UI

Checklist:

```text
[ ] Check-in code list exists.
[ ] Create check-in code form exists.
[ ] Code is generated or validated.
[ ] Attraction selector exists.
[ ] Photo spot selector exists.
[ ] Active/inactive status visible.
[ ] Start/end date fields exist if supported.
[ ] QR link copy works.
[ ] QR image/download works if implemented.
[ ] Deactivate confirmation exists.
[ ] Invalid/deactivated public behavior can be tested.
```

---

## 22. Admin Visit/Survey UI

Checklist:

```text
[ ] Visit list exists or is planned.
[ ] Visit list is paginated.
[ ] Visit filters exist.
[ ] Sensitive fields hidden by default.
[ ] Survey list/summary exists or planned.
[ ] Raw comments are hidden unless permission.
[ ] No private identifiers are shown by default.
```

---

## 23. Admin Export UI

Checklist:

```text
[ ] Export button/menu exists.
[ ] Export options are clear.
[ ] Export requires permission.
[ ] Viewer does not see detailed export options.
[ ] Privacy warning is visible.
[ ] Export loading state exists.
[ ] Export success state exists.
[ ] Export error state exists.
[ ] No-data export state exists.
```

---

# Dashboard Frontend Checklist

---

## 24. Dashboard Components

Required components:

```text
[ ] DashboardPageHeader
[ ] DashboardFilterBar
[ ] DataFreshnessNote
[ ] KpiCard
[ ] KpiGrid
[ ] ChartCard
[ ] MetricTooltip
[ ] EmptyState
[ ] LoadingState
[ ] ErrorState
[ ] ExportMenu
```

Recommended:

```text
[ ] InsightCard
[ ] FunnelChart
[ ] RankedTable
[ ] MetricDefinitionLink
```

---

## 25. Dashboard UX Rules

Checklist:

```text
[ ] Null metrics show No data.
[ ] Zero denominator does not show fake 0%.
[ ] Average satisfaction shows response count.
[ ] Estimated spending label includes Estimated.
[ ] QR scans are not labeled visits.
[ ] Tourist profiles are not labeled unique people.
[ ] Tooltips explain limitations.
[ ] Charts have titles.
[ ] Important chart data is available as table/text where possible.
```

---

## 26. Dashboard Filter UX

Checklist:

```text
[ ] Date range filter works.
[ ] Province filter works.
[ ] Attraction filter works.
[ ] Filters reset works.
[ ] URL query state works if implemented.
[ ] Loading state appears after filter change.
[ ] Empty data state is clear.
[ ] Filter options are not confusing.
```

---

# Responsive and Mobile Checklist

---

## 27. Mobile-First Requirements

Checklist:

```text
[ ] QR landing works on small mobile viewport.
[ ] Minimal form is easy on mobile.
[ ] Photo upload button is visible.
[ ] Certificate preview fits mobile screen.
[ ] Success/download buttons are visible.
[ ] Survey fields are not cramped.
[ ] No horizontal scrolling on tourist pages.
[ ] Touch targets are large enough.
[ ] Sticky CTA used where helpful.
```

Recommended touch target:

```text
at least 44px height
```

---

## 28. Tablet/Desktop Requirements

Checklist:

```text
[ ] Public pages look professional on desktop.
[ ] Admin layout works on desktop.
[ ] Dashboard charts/tables fit.
[ ] Tables have horizontal scroll where necessary.
[ ] Modals/dialogs are usable.
[ ] Sidebar/topbar does not overlap content.
```

---

# Accessibility Checklist

---

## 29. Form Accessibility

Checklist:

```text
[ ] Inputs have labels.
[ ] Required fields are indicated.
[ ] Error messages are associated with fields.
[ ] Keyboard navigation works.
[ ] Focus states are visible.
[ ] Buttons have accessible names.
[ ] Consent checkbox has clear label.
```

---

## 30. Visual Accessibility

Checklist:

```text
[ ] Text contrast is acceptable.
[ ] Small text is readable on mobile.
[ ] Color is not the only meaning.
[ ] Loading states include text where useful.
[ ] Icons have labels/tooltips where needed.
[ ] Images have alt text where meaningful.
```

---

## 31. Dashboard Accessibility

Checklist:

```text
[ ] KPI cards have readable labels.
[ ] Charts have titles.
[ ] Chart meaning is not color-only.
[ ] Important chart data has table alternative.
[ ] Empty/error states are screen-reader understandable.
[ ] Filter controls are keyboard accessible.
```

---

# Performance Checklist

---

## 32. Frontend Performance

Checklist:

```text
[ ] Public/tourist pages do not load admin-heavy code.
[ ] Dashboard charts are lazy-loaded if heavy.
[ ] 360 media is lazy-loaded.
[ ] Images are optimized.
[ ] Fonts are optimized.
[ ] Large client-side state is avoided.
[ ] Certificate generation does not freeze UI.
[ ] Loading states appear quickly.
```

---

## 33. Bundle Safety

Checklist:

```text
[ ] Service role key is not in frontend bundle.
[ ] Server-only code is not imported into client components.
[ ] Admin dashboard bundle is separate from public tourist bundle.
[ ] Heavy chart libraries are not imported into QR landing page.
```

---

# Error, Loading, and Empty States

---

## 34. Required States

Every important page/section should have:

```text
[ ] loading state
[ ] empty state
[ ] error state
[ ] success state where relevant
```

Important pages:

```text
[ ] QR landing
[ ] tourist profile form
[ ] photo upload
[ ] certificate preview
[ ] certificate success
[ ] survey
[ ] passport
[ ] admin list pages
[ ] dashboard sections
[ ] export actions
```

---

## 35. Safe Error Messages

Errors must not show:

```text
[ ] stack trace
[ ] SQL query
[ ] Supabase raw error
[ ] service key
[ ] private storage path
```

Errors should show:

```text
[ ] friendly message
[ ] retry action if useful
[ ] field errors where useful
```

---

# Security and Privacy Frontend Checklist

---

## 36. Frontend Secret Safety

Checklist:

```text
[ ] No service role key in client code.
[ ] No database URL in client code.
[ ] No LINE channel secret in client code.
[ ] No CRON_SECRET in client code.
[ ] No hardcoded admin token.
```

Allowed:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LIFF_ID optional
```

---

## 37. Privacy UI

Checklist:

```text
[ ] Consent is visible.
[ ] Photo usage is explained.
[ ] Survey optionality is clear.
[ ] LINE/email optionality is clear.
[ ] Public sharing is not automatic.
[ ] Dashboard does not display private identifiers.
[ ] Export warning is visible.
```

---

## 38. Browser Storage

Checklist:

```text
[ ] Browser storage contains no service secrets.
[ ] Browser storage contains no admin role as trusted source.
[ ] Guest token/session id is treated as untrusted by backend.
[ ] No large photo base64 stored persistently.
[ ] No LINE provider_user_id stored unnecessarily.
```

---

# Testing Checklist

---

## 39. Frontend Unit Tests

Recommended tests:

```text
[ ] MinimalProfileForm validation rendering.
[ ] Consent checkbox default unchecked.
[ ] PhotoUpload invalid type message.
[ ] KpiCard null displays No data.
[ ] Dashboard filters emit correct values.
[ ] ExportButton loading/error states.
[ ] CertificatePreview long name handling.
```

---

## 40. E2E Tests

Required:

```text
[ ] Public attraction page loads.
[ ] Active QR flow works.
[ ] Invalid QR safe error.
[ ] Tourist QR-to-certificate flow works.
[ ] Photo upload works.
[ ] Certificate download works.
[ ] Survey optional flow works.
[ ] Returning tourist flow works.
[ ] Admin login works.
[ ] Admin attraction CRUD works.
[ ] Dashboard filter works.
[ ] Export flow works.
[ ] Viewer permission denied works.
```

---

## 41. Manual UX Tests

Checklist:

```text
[ ] Real phone QR scan tested.
[ ] Mobile photo upload tested.
[ ] Certificate download on phone tested.
[ ] Thai language tested.
[ ] English/foreign tourist path tested.
[ ] LINE browser tested if LIFF used.
[ ] Admin can create QR without developer help.
[ ] Dashboard metrics understood by non-developer tester.
```

---

# Frontend Release Checklist

---

## 42. MVP Frontend Acceptance Checklist

```text
[ ] Public pages work.
[ ] QR landing works.
[ ] Tourist minimal profile works.
[ ] Consent UX works.
[ ] Photo upload UI works.
[ ] Certificate preview/generation UI works.
[ ] Certificate success/download works.
[ ] Stamp/passport UI works or is planned.
[ ] Optional survey UI works.
[ ] Admin login/layout works.
[ ] Admin attraction CMS works.
[ ] Admin photo spot/check-in UI works.
[ ] Dashboard page works.
[ ] Export UI works.
[ ] Mobile layout works.
[ ] Loading/empty/error states exist.
[ ] No private identifiers shown by default.
[ ] No frontend secrets exposed.
```

---

## 43. Do Not Do

Do not:

```text
require LINE for all tourists.
require email before certificate.
ask too many questions before reward.
hide certificate behind survey.
show raw storage paths.
trust admin role from localStorage.
put service role key in client code.
load dashboard bundle on QR landing page.
show missing satisfaction as 0.
call estimated spending revenue.
```

---

## 44. Final Frontend Rule

The frontend must reduce friction and increase trust.

If tourists do not complete the flow, the database will not have enough useful data for sustainable tourism planning.
