# FUNNEL_ANALYTICS_DASHBOARD.md

## 1. Document Purpose

This document defines the Funnel Analytics Dashboard for the **Southern Border Tourism Data & Intelligence Platform**.

The funnel dashboard measures how tourists move through the QR-to-certificate-to-survey journey.

This dashboard is critical because the main project risk is not only technical implementation. The main product risk is:

```text
Tourists may scan the QR code but may not complete the form, photo upload, certificate generation, or survey.
```

The funnel dashboard helps the team improve the flow based on real behavior.

---

## 2. Dashboard Mission

The mission of the Funnel Analytics Dashboard is:

```text
Identify where tourists drop out and improve the QR-to-certificate data collection flow.
```

It should answer:

```text
How many tourists scan QR codes?
How many continue from landing page to profile form?
How many complete the minimal form?
How many upload a photo?
How many generate certificates?
How many download or share certificates?
How many answer the optional survey?
How many save their passport?
Which attractions have high or low conversion?
Which photo spots perform best?
Which step causes the most drop-off?
```

---

## 3. Why Funnel Analytics Matters

The project depends on tourist participation.

The system can have:

```text
good database design
beautiful UI
professional dashboard
```

but still fail if tourists do not complete the flow.

Funnel analytics helps improve:

```text
QR placement
landing page copy
form length
photo upload UX
certificate reward value
survey timing
passport save prompt
tourist incentive strategy
```

---

## 4. Dashboard Audience

Primary users:

```text
product owner
admin
tourism planner
researcher
UX designer/developer
instructor/project evaluator
```

Secondary users:

```text
tourism staff
attraction managers
campaign managers
```

---

## 5. Route

Recommended future route:

```text
/admin/dashboard/funnel
```

MVP can include this as a section inside:

```text
/admin/dashboard
```

---

## 6. Required Permission

Required permission:

```text
dashboard.read
```

Detailed session-level export, if ever implemented, requires stronger permission:

```text
export.funnel_data
```

MVP should use aggregated funnel data only.

---

## 7. Privacy Principle

Funnel analytics should use anonymous/aggregated event data by default.

Do not show:

```text
email
Google subject
LINE user ID
provider_user_id
device token
guest token
raw IP address
raw user agent
tourist display name
private photo path
private certificate URL
```

Allowed fields:

```text
event name
event time/date
session count aggregated
event count
attraction
photo spot
province
check-in code
device/browser category if privacy-safe future
```

---

## 8. Funnel Event Sources

Primary source table:

```text
funnel_events
```

Related tables:

```text
visits
tourists
attractions
photo_spots
checkin_codes
provinces
certificates
satisfaction_surveys
```

The funnel dashboard should primarily use `funnel_events`, while cross-checking with visits/certificates/surveys where useful.

---

## 9. Required Funnel Events

MVP event names:

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
certificate_downloaded
share_opened optional
share_completed optional
survey_started
survey_completed
passport_saved
```

Future event names:

```text
language_changed
profile_validation_failed
photo_upload_failed
certificate_downloaded
share_opened
share_completed
passport_link_started
passport_link_completed
google_link_started
google_link_completed
line_link_started
line_link_completed
email_link_started
email_link_completed
```

---

## 10. Event Meaning

## 10.1 qr_scanned

Triggered when QR check-in route is opened from QR code or check-in URL.

Meaning:

```text
Tourist reached the check-in entry route.
```

Limitation:

```text
May include duplicate scans, staff tests, reloads, or bots.
```

## 10.2 landing_viewed

Triggered when landing page successfully renders usable attraction/check-in context.

Meaning:

```text
Tourist saw the landing page.
```

## 10.3 certificate_started

Triggered when tourist clicks primary CTA to begin certificate flow.

Meaning:

```text
Tourist expressed intent to create certificate.
```

## 10.4 minimal_form_completed

Triggered when required minimal profile/visit form is saved.

Meaning:

```text
System collected core tourist/visit data.
```

## 10.5 photo_uploaded

Triggered after tourist photo upload succeeds and metadata is stored.

Meaning:

```text
Tourist completed photo requirement.
```

## 10.6 certificate_generated

Triggered when certificate record is created or confirmed.

Meaning:

```text
Tourist completed the core reward flow.
```

## 10.6.1 certificate_downloaded

Triggered when tourist downloads or saves the generated certificate image.

Meaning:

```text
Tourist received the immediate reward.
```

## 10.6.2 share_opened / share_completed

Triggered when the optional share sheet opens or a supported share action completes.

Meaning:

```text
Tourist considered or completed optional sharing.
```

Sharing is not required for visit completion and must not block certificate download.

## 10.7 survey_started

Triggered when tourist opens optional survey page or clicks survey CTA.

Meaning:

```text
Tourist showed interest in answering additional planning questions.
```

## 10.8 survey_completed

Triggered when optional survey is successfully submitted.

Meaning:

```text
System collected travel behavior, expense, and satisfaction data.
```

## 10.9 passport_saved

Triggered when tourist links or saves passport through Google, LINE, or future email identity.

Meaning:

```text
Tourist took action to retain passport access beyond guest session.
```

---

## 11. Event Recording Rules

Events should include:

```text
event_name
event_time
session_id
tourist_id optional
visit_id optional
attraction_id optional
photo_spot_id optional
checkin_code_id optional
metadata_json optional
```

Rules:

- Do not put personal data in metadata.
- Use consistent event names.
- Avoid duplicate events where possible.
- Accept that some event counts may include repeated attempts.
- Do not record sensitive values such as LINE ID or email.

---

## 12. Session Tracking

Funnel analysis should use:

```text
session_id
```

Session ID should be:

```text
random
non-personal
not guessable
not an auth credential
```

Session ID helps calculate:

```text
unique sessions per stage
event count per stage
drop-off per session
```

MVP can start with event counts.

Production should prefer session-based funnel conversion where possible.

---

## 13. Count Types

The dashboard should distinguish count types.

## 13.1 Event Count

```text
Number of event records.
```

Pros:

- easy to record
- useful for activity volume

Cons:

- may count duplicate reloads/clicks

## 13.2 Session Count

```text
Number of unique session_id values reaching a stage.
```

Pros:

- better funnel conversion estimate

Cons:

- depends on consistent session tracking

## 13.3 Visit Count

```text
Number of visit records.
```

This is not the same as funnel event count.

## 13.4 Recommended MVP

Use:

```text
event_count
```

and where possible:

```text
unique_session_count
```

Clearly label which is displayed.

---

## 14. Page Structure

Recommended structure:

```text
Page Header
Global Filter Bar
Funnel KPI Cards
Main Funnel Chart
Stage Conversion Table
Drop-off Analysis
Funnel by Attraction
Funnel by Photo Spot
Funnel Trend Over Time
Error/Failure Events optional
UX Improvement Insight Cards
Export Actions
```

---

## 15. Page Header

## 15.1 Title

```text
Funnel Analytics Dashboard
```

Thai:

```text
แดชบอร์ดวิเคราะห์ Funnel การใช้งาน
```

## 15.2 Description

```text
Analyze how tourists move from QR scan to certificate generation, survey completion, and passport saving.
```

Thai:

```text
วิเคราะห์เส้นทางการใช้งานของนักท่องเที่ยวตั้งแต่สแกน QR จนถึงการสร้างใบประกาศ ตอบแบบสอบถาม และบันทึกพาสปอร์ต
```

## 15.3 Required Note

```text
Funnel counts measure platform interaction events. They are not the same as official tourist arrivals.
```

Thai:

```text
ตัวเลข Funnel เป็นข้อมูลกิจกรรมการใช้งานระบบ ไม่ใช่จำนวนนักท่องเที่ยวอย่างเป็นทางการทั้งหมด
```

---

## 16. Global Filters

Required filters:

```text
date range
province
attraction
```

Optional filters:

```text
photo spot
check-in code
event name
language
device type future
identity provider future
```

Date field:

```text
funnel_events.event_time
```

When combining with visit/certificate metrics, state date field clearly.

---

# KPI Cards

---

## 17. Required KPI Cards

```text
QR Scans
Certificate Start Rate
Minimal Form Completion Rate
Photo Upload Rate
Certificate Generation Rate
Survey Completion Rate
Passport Save Rate
Largest Drop-off Step
```

---

## 18. KPI: QR Scans

## 18.1 Metric Key

```text
qr_scan_count
```

## 18.2 Meaning

Number of QR scan/open events.

## 18.3 Calculation

```sql
count(funnel_events.event_id)
where event_name = 'qr_scanned'
```

## 18.4 Display

```text
1,245 scans
```

## 18.5 Tooltip

```text
Number of recorded QR scan/open events. This is not the same as completed visits.
```

---

## 19. KPI: Certificate Start Rate

## 19.1 Metric Key

```text
certificate_start_rate
```

## 19.2 Meaning

Percentage of QR/landing users who start the certificate flow.

## 19.3 Recommended Calculation

```text
certificate_started_count / landing_viewed_count
```

Alternative:

```text
certificate_started_count / qr_scanned_count
```

The selected denominator must be documented.

## 19.4 Zero Denominator Rule

If denominator is zero:

```text
return null
display No data
```

## 19.5 Interpretation

Low rate may indicate:

```text
CTA is unclear
reward value is not strong enough
landing page loads too slowly
tourist does not understand benefit
QR placement context is weak
```

---

## 20. KPI: Minimal Form Completion Rate

## 20.1 Metric Key

```text
minimal_form_completion_rate
```

## 20.2 Meaning

Percentage of started certificate flows that complete the minimal profile form.

## 20.3 Calculation

```text
minimal_form_completed_count / certificate_started_count
```

## 20.4 Interpretation

Low rate may indicate:

```text
form asks too many questions
fields are confusing
privacy concern
language issue
network error
```

---

## 21. KPI: Photo Upload Rate

## 21.1 Metric Key

```text
photo_upload_rate
```

## 21.2 Meaning

Percentage of minimal form completions that successfully upload photo.

## 21.3 Calculation

```text
photo_uploaded_count / minimal_form_completed_count
```

## 21.4 Interpretation

Low rate may indicate:

```text
photo upload is difficult
file size limit is too strict
browser compatibility problem
LINE browser issue
network problem
```

---

## 22. KPI: Certificate Generation Rate

## 22.1 Metric Key

```text
certificate_generation_rate
```

## 22.2 Meaning

Percentage of photo uploads that result in generated certificate.

## 22.3 Calculation

```text
certificate_generated_count / photo_uploaded_count
```

## 22.4 Interpretation

Low rate may indicate:

```text
certificate rendering problem
template/photo loading issue
storage failure
generation button unclear
```

---

## 23. KPI: Survey Completion Rate

## 23.1 Metric Key

```text
survey_completion_rate_from_certificate
```

## 23.2 Meaning

Percentage of certificate-generated users who complete the optional survey.

## 23.3 Calculation

```text
survey_completed_count / certificate_generated_count
```

## 23.4 Interpretation

Low rate is expected if survey is optional, but very low rate may mean:

```text
survey is too long
survey CTA is weak
reward already received
no additional incentive
questions feel sensitive
```

---

## 24. KPI: Passport Save Rate

## 24.1 Metric Key

```text
passport_save_rate
```

## 24.2 Meaning

Percentage of certificate-generated users who save/link passport.

## 24.3 Calculation

```text
passport_saved_count / certificate_generated_count
```

## 24.4 Interpretation

Low rate may mean:

```text
guest users do not see value in saving
Google/LINE save prompt appears too late
passport benefit is unclear
foreign tourists cannot use LINE
```

---

## 25. KPI: Largest Drop-off Step

## 25.1 Metric Key

```text
largest_funnel_dropoff_step
```

## 25.2 Meaning

Stage transition with the highest drop-off percentage.

## 25.3 Calculation

For each adjacent stage:

```text
dropoff = 1 - (current_stage_count / previous_stage_count)
```

Pick highest valid drop-off.

## 25.4 Display

Example:

```text
Photo Upload
42% drop-off
```

## 25.5 Planning Use

Directly tells the team where to improve first.

---

# Main Analytics Sections

---

## 26. Main Funnel Chart

## 26.1 Purpose

Visualize the full tourist journey.

## 26.2 Recommended Chart

```text
funnel chart
```

Alternative:

```text
vertical step chart
bar chart by stage
```

## 26.3 Required Stages

```text
QR Scanned
Landing Viewed
Certificate Started
Minimal Form Completed
Photo Uploaded
Certificate Generated
Survey Started
Survey Completed
Passport Saved
```

## 26.4 Display Values

Each stage should show:

```text
stage count
conversion from previous stage
drop-off from previous stage
```

## 26.5 Rule

If previous stage count is zero:

```text
conversion = null
dropoff = null
```

Do not show misleading 0%.

---

## 27. Stage Conversion Table

## 27.1 Purpose

Provide exact numbers behind the funnel chart.

## 27.2 Columns

```text
stage_order
stage_name
event_name
event_count
unique_session_count optional
conversion_from_previous
dropoff_from_previous
```

## 27.3 Planning Use

This table is important for analysis and reporting.

Charts alone are not enough.

---

## 28. Drop-off Analysis

## 28.1 Purpose

Identify and explain the biggest UX/data collection problems.

## 28.2 Required Output

```text
largest_dropoff_step
dropoff_rate
affected_count
possible_causes
recommended_actions
```

## 28.3 Example

If drop-off is at `minimal_form_completed`:

```text
Possible causes:
- form is too long
- required fields are unclear
- privacy concern
- language mismatch

Recommended actions:
- reduce required fields
- improve helper text
- move more questions after certificate
```

## 28.4 Rule

Causes should be framed as hypotheses unless tested.

---

## 29. Funnel by Attraction

## 29.1 Purpose

Compare funnel performance across attractions.

## 29.2 Recommended Table Columns

```text
attraction_name
province_name
qr_scanned
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
survey_completed
certificate_conversion_rate
survey_completion_rate
largest_dropoff_step
```

## 29.3 Planning Use

Helps identify:

```text
poor QR placement
weak attraction page
staff explanation differences
photo spot issues
location-specific network problems
```

---

## 30. Funnel by Photo Spot

## 30.1 Purpose

Compare performance across prepared photo spots.

## 30.2 Recommended Table Columns

```text
photo_spot_name
attraction_name
province_name
qr_scanned
certificate_generated
certificate_conversion_rate
survey_completed
largest_dropoff_step
```

## 30.3 Planning Use

Helps determine:

```text
which photo spots motivate participation
which QR locations are ineffective
which physical signs may need redesign
```

---

## 31. Funnel by Check-in Code

## 31.1 Purpose

Analyze each QR/check-in code.

## 31.2 Recommended Table Columns

```text
checkin_code
label
attraction_name
photo_spot_name
qr_scanned
landing_viewed
certificate_generated
conversion_rate
active_status
```

## 31.3 Planning Use

Useful when each attraction has multiple QR codes.

---

## 32. Funnel Trend Over Time

## 32.1 Purpose

Show whether flow performance improves after UX changes or campaigns.

## 32.2 Recommended Chart

```text
line chart
```

Metrics:

```text
qr_scanned_count
certificate_generated_count
survey_completed_count
certificate_conversion_rate
```

## 32.3 Date Grouping

```text
daily
weekly
monthly
```

based on date range.

## 32.4 Planning Use

Helps measure:

```text
campaign effect
UI change effect
QR rollout effect
tourist seasonality
```

---

## 33. Error and Failure Events

## 33.1 MVP Status

Optional.

## 33.2 Useful Future Events

```text
profile_validation_failed
photo_upload_failed
certificate_generation_failed
survey_submit_failed
```

## 33.3 Purpose

Connect drop-off with actual technical failures.

## 33.4 Example Insight

```text
Photo upload drop-off is high and upload failure events are also high. Investigate file size, network, and browser compatibility.
```

---

## 34. Language/Browser Breakdown

## 34.1 MVP Status

Optional.

## 34.2 Possible Dimensions

```text
language
browser type
LINE browser vs normal browser
device category
```

## 34.3 Privacy Rule

Use aggregated safe device/browser categories only.

Do not store or expose full raw user agent unnecessarily.

## 34.4 Planning Use

Useful for:

```text
foreign tourist flow
LINE browser issues
mobile compatibility
language UX
```

---

## 35. UX Improvement Insight Cards

## 35.1 Landing Page CTA Issue

Condition:

```text
low certificate_start_rate
```

Insight:

```text
Many users view the landing page but do not start. Improve the reward message, CTA, and QR sign explanation.
```

## 35.2 Form Friction Issue

Condition:

```text
low minimal_form_completion_rate
```

Insight:

```text
Users may be dropping at the profile form. Reduce required fields and improve privacy/helper text.
```

## 35.3 Photo Upload Issue

Condition:

```text
low photo_upload_rate
```

Insight:

```text
Photo upload may be causing friction. Test mobile browsers, file size limits, and LINE browser behavior.
```

## 35.4 Survey Timing Issue

Condition:

```text
low survey_completion_rate
```

Insight:

```text
Survey completion is low. Keep survey short, show it after certificate, and explain how answers improve tourism.
```

## 35.5 Passport Save Issue

Condition:

```text
low passport_save_rate
```

Insight:

```text
Tourists may not understand the value of saving passport. Improve post-certificate prompt and support non-LINE options.
```

---

## 36. Backend Services

Recommended methods:

```ts
DashboardService.getFunnelMetrics(filters)
DashboardService.getFunnelByAttraction(filters)
DashboardService.getFunnelByPhotoSpot(filters)
DashboardService.getFunnelByCheckinCode(filters)
DashboardService.getFunnelTrend(filters)
DashboardService.getFunnelDropoffInsights(filters)
```

Possible combined method:

```ts
DashboardService.getFunnelDashboard(filters)
```

---

## 37. Response Type

Conceptual TypeScript:

```ts
type FunnelDashboardResponse = {
  kpis: {
    qrScanCount: number;
    certificateStartRate: number | null;
    minimalFormCompletionRate: number | null;
    photoUploadRate: number | null;
    certificateGenerationRate: number | null;
    surveyCompletionRate: number | null;
    passportSaveRate: number | null;
    largestDropoffStep?: {
      fromStage: string;
      toStage: string;
      dropoffRate: number;
      affectedCount: number;
    };
  };
  stages: Array<{
    stageOrder: number;
    eventName: string;
    label: string;
    eventCount: number;
    uniqueSessionCount?: number;
    conversionFromPrevious: number | null;
    dropoffFromPrevious: number | null;
  }>;
  byAttraction: Array<{
    attractionId: number;
    attractionName: string;
    provinceName: string;
    qrScanned: number;
    certificateGenerated: number;
    certificateConversionRate: number | null;
    surveyCompleted: number;
    surveyCompletionRate: number | null;
    largestDropoffStep?: string;
  }>;
  byPhotoSpot: Array<{
    photoSpotId: number;
    photoSpotName: string;
    attractionName: string;
    qrScanned: number;
    certificateGenerated: number;
    conversionRate: number | null;
  }>;
  trend: Array<{
    dateLabel: string;
    qrScanned: number;
    certificateGenerated: number;
    surveyCompleted: number;
    certificateConversionRate: number | null;
  }>;
  insights: Array<{
    insightKey: string;
    title: string;
    evidence: string;
    suggestedAction: string;
    confidence: "low" | "medium" | "high";
  }>;
  limitations: string[];
};
```

---

## 38. Conversion Calculation Rules

For stage counts:

```text
conversion_from_previous = current_count / previous_count
dropoff_from_previous = 1 - conversion_from_previous
```

If previous_count = 0:

```text
conversion_from_previous = null
dropoff_from_previous = null
```

Do not show 0%.

---

## 39. Recommended Stage Order

```text
1 qr_scanned
2 landing_viewed
3 certificate_started
4 minimal_form_completed
5 photo_uploaded
6 certificate_generated
7 survey_started
8 survey_completed
9 passport_saved
```

This order should be centralized in constants to avoid inconsistent charts.

---

## 40. Data Quality Requirements

Funnel data quality depends on consistent event recording.

Dashboard should show data quality notes:

```text
event tracking coverage
unknown session count
events missing attraction_id
events missing photo_spot_id
duplicate event possibility
```

MVP can show limitations in tooltip.

---

## 41. Empty States

Required empty states:

```text
No funnel events recorded for the selected filters.
No QR scan events yet.
No certificate generation events yet.
No survey completion events yet.
No photo spot funnel data available.
```

---

## 42. Loading States

Use:

```text
KPI skeletons
funnel chart skeleton
table skeletons
trend chart skeleton
```

---

## 43. Error States

Examples:

```text
Could not load funnel analytics.
Could not load funnel by attraction.
Could not load funnel trend.
Could not load drop-off insights.
```

Use section-level errors where possible.

---

## 44. Export Requirements

Export option:

```text
Export Funnel Summary CSV
```

Default columns:

```text
event_date
province_name
attraction_name
photo_spot_name
checkin_code
event_name
event_count
unique_session_count
```

Optional conversion export:

```text
stage_order
stage_name
event_count
conversion_from_previous
dropoff_from_previous
```

Excluded by default:

```text
tourist display name
email
LINE user ID
device token
provider_user_id
raw user agent
raw IP
photo path
certificate path
```

---

## 45. Privacy and Security Requirements

Do:

```text
aggregate by default
avoid raw identifiers
avoid raw user agent unless necessary
limit session-level exports
permission-check exports
audit exports
```

Do not:

```text
show individual tourist behavior timeline by default
expose guest token
expose LINE ID
expose IP address
use funnel data for personal surveillance
```

---

## 46. Planning Interpretation Examples

## 46.1 Low Landing-to-Start Conversion

```text
Many users see the landing page but do not start certificate creation. Improve the reward message, make the CTA clearer, and ensure QR sign explains the benefit.
```

## 46.2 Low Form Completion

```text
Tourists may consider the form too long or unclear. Keep required fields minimal and move more questions after the certificate reward.
```

## 46.3 Low Photo Upload

```text
Photo upload may be difficult on some phones or browsers. Test camera/gallery upload, file size, and LINE browser behavior.
```

## 46.4 Low Survey Completion

```text
Survey completion is low after the certificate. Keep the survey short, optional, and explain how answers improve tourism.
```

## 46.5 Low Passport Save

```text
Users may not understand why they should save the passport. Highlight stamp collection and future access benefits.
```

---

## 47. Testing Checklist

Test:

```text
no funnel events
QR scan only
full successful flow
survey skipped
passport not saved
duplicate QR scans
multiple attractions
multiple photo spots
zero denominator conversion
date filter
province filter
attraction filter
photo spot filter
export permission
export output
section error
```

---

## 48. MVP Acceptance Checklist

```text
[ ] Funnel dashboard section exists.
[ ] Required funnel event names are defined.
[ ] QR scan count exists.
[ ] Main funnel chart/table exists.
[ ] Conversion rate handles zero denominator.
[ ] Drop-off rate handles zero denominator.
[ ] Funnel by attraction exists or is planned.
[ ] Funnel by photo spot exists or is planned.
[ ] Largest drop-off step is calculated.
[ ] Survey completion rate is shown.
[ ] Passport save rate is shown or planned.
[ ] Privacy-safe aggregation is used.
[ ] No personal identifiers are displayed.
[ ] Export is permission-controlled.
```

---

## 49. Do Not Do

Do not:

```text
Count QR scans as visits.
Treat event counts as unique people without session logic.
Show conversion as 0 when denominator is zero.
Expose guest token or device token.
Expose LINE user ID.
Use funnel analytics for personal tracking.
Hide drop-off problems.
Blame tourists for not completing forms.
```

---

## 50. Future Enhancements

Possible future improvements:

```text
A/B testing landing page CTA
QR sign variant tracking
browser/device compatibility dashboard
language-based funnel comparison
LINE browser vs normal browser comparison
campaign source tracking
session-based funnel attribution
error event correlation
automatic UX recommendations
```

---

## 51. Final Funnel Dashboard Rule

The funnel dashboard exists to improve completion.

If tourists drop out, the system should learn from it and reduce friction rather than asking for more data too early.
