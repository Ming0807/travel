# UX_TEST_PLAN.md

## 1. Document Purpose

This document defines the UX test plan for the **Southern Border Tourism Data & Intelligence Platform**.

UX testing is critical because the project depends on voluntary tourist participation. The system will fail if tourists do not understand the benefit, feel the form is too long, struggle with photo upload, or abandon the optional survey.

The project challenge is:

```text
How do we encourage tourists to provide useful data without making the experience feel heavy or intrusive?
```

---

## 2. UX Testing Mission

The UX testing mission is:

```text
Make the tourist flow simple, rewarding, trustworthy, and fast enough that real tourists are willing to complete it.
```

UX testing must evaluate:

```text
QR landing clarity
certificate incentive value
form length
field clarity
privacy trust
photo upload ease
certificate preview quality
survey timing
passport/stamp motivation
admin usability
dashboard understandability
```

---

## 3. UX Principles to Test

The platform UX should be:

```text
fast
mobile-first
low-friction
privacy-aware
reward-driven
multilingual
accessible
clear
forgiving
professional
```

---

## 4. UX Testing Scope

UX testing applies to:

```text
tourist QR landing page
minimal profile form
photo upload screen
certificate preview/generation
success page
digital stamp/passport
optional survey
public attraction pages
admin CMS
dashboard
export/report workflow
```

---

## 5. Target Users for UX Testing

## 5.1 Tourist Testers

Recommended groups:

```text
Thai domestic tourists
local southern border visitors
students/young adults
family travelers
older users
foreign/English-speaking users
users without LINE
users with LINE
users without Google login
users who optionally link Google
```

## 5.2 Admin Testers

Recommended:

```text
project owner
instructor/evaluator
tourism staff
researcher
non-technical admin user
```

## 5.3 Developer/QA Testers

Use for technical flow validation, but do not rely only on developers for UX testing.

Developers already understand the system and may miss real-user friction.

---

## 6. UX Testing Methods

Recommended methods:

```text
task-based usability testing
think-aloud testing
mobile device testing
5-second landing page test
form friction review
survey completion test
admin task test
dashboard interpretation test
accessibility review
```

Optional:

```text
A/B test landing CTA
QR sign copy test
survey length comparison
post-certificate incentive test
```

---

## 7. Success Metrics

Recommended UX metrics:

```text
QR landing comprehension rate
certificate start rate
minimal form completion rate
photo upload success rate
certificate generation completion rate
survey completion rate
passport save rate
optional share open/completion rate
time to certificate
user satisfaction after flow
admin task completion rate
dashboard metric comprehension
```

Target MVP UX goals:

```text
tourist can understand benefit within 5 seconds
minimal form can be completed within 60-90 seconds
photo upload can be completed on mobile without help
certificate generation feels rewarding
survey feels optional and short
certificate download is not blocked by survey, sharing, Google, LINE, email, or phone
guest passport limitation is understood
admin can create QR/check-in code without developer help
```

---

# Tourist UX Test Plan

---

## 8. QR Landing Page UX Test

## 8.1 Goal

Verify that tourists understand what they get and what to do next.

## 8.2 Test Task

```text
You just scanned this QR code at a tourist attraction. Tell us what this page is for and what you would do next.
```

## 8.3 Observe

```text
Do they understand they can get a digital certificate?
Do they understand the location/attraction context?
Do they see the primary button?
Do they know whether it is free?
Do they trust the page?
Do they understand photo requirement?
```

## 8.4 Success Criteria

```text
user can explain the benefit
user can find the start button
user does not think LINE/app install is required
user does not feel the page is suspicious
```

## 8.5 Common Problems to Watch

```text
CTA unclear
too much text
certificate benefit hidden
QR sign context weak
language mismatch
page loads slowly
```

---

## 9. 5-Second Landing Page Test

## 9.1 Goal

Check immediate clarity.

## 9.2 Method

Show landing page for 5 seconds, then ask:

```text
What is this page about?
What can you get from it?
What would you click next?
Do you need to pay or log in?
```

## 9.3 Pass Criteria

At least most testers should answer:

```text
I can create/get a certificate or travel memory from this attraction.
```

They should know the next step.

---

## 10. Minimal Profile Form UX Test

## 10.1 Goal

Verify that the required form is short and understandable.

## 10.2 Test Task

```text
Fill in the information needed to create your certificate.
```

## 10.3 Required Fields to Test

```text
display name
origin country/province
age group
consent checkbox
```

Optional if included:

```text
preferred language
```

## 10.4 Observe

```text
Do users understand display name can be nickname?
Do users know what origin means?
Do users feel address is too personal?
Do users understand age group?
Do users notice consent?
Do users hesitate because of privacy?
```

## 10.5 Success Criteria

```text
completion within 60-90 seconds
no major confusion
no unnecessary required fields
user does not abandon due to privacy concern
```

## 10.6 UX Rules

Do not require:

```text
email
LINE
phone number
full address
national ID
exact birthdate
```

before certificate.

---

## 11. Consent UX Test

## 11.1 Goal

Verify consent is clear and not scary.

## 11.2 Test Questions

```text
What do you think the system will do with your data?
Do you understand what the photo is used for?
Do you think your certificate/photo will be public?
Would this make you stop?
```

## 11.3 Success Criteria

```text
user understands data is used for certificate and aggregated planning
user understands photo is for certificate
user understands public sharing is optional/not automatic
```

---

## 12. Photo Upload UX Test

## 12.1 Goal

Verify mobile photo upload is easy.

## 12.2 Test Task

```text
Upload a photo to create your certificate.
```

## 12.3 Observe

```text
Can user choose from camera/gallery?
Does preview appear?
Do they understand accepted formats?
What happens with large images?
Do they see progress/loading?
Can they retry?
Does LINE browser cause issues?
```

## 12.4 Success Criteria

```text
user can upload without help
error messages are clear
retry is possible
photo preview reassures user
```

## 12.5 Common Problems

```text
button hard to find
camera/gallery issue
file too large
slow upload with no progress
unsupported HEIC
LINE browser issue
```

---

## 13. Certificate Preview UX Test

## 13.1 Goal

Verify certificate feels valuable enough to motivate participation.

## 13.2 Test Task

```text
Review your certificate and generate/download it.
```

## 13.3 Observe

```text
Does certificate look professional?
Does user feel it is worth saving?
Is display name correct?
Is attraction name clear?
Is photo layout good?
Is download button obvious?
Does it work on mobile?
```

## 13.4 Success Criteria

```text
user recognizes it as a reward
user wants to download/save/share
certificate text is readable
layout does not crop important content
```

---

## 14. Certificate Success Page UX Test

## 14.1 Goal

Verify post-reward flow encourages optional survey/passport without blocking.

## 14.2 Observe

```text
Can user download certificate?
Do they notice stamp earned?
Do they understand optional survey?
Do they understand passport save benefit?
Do they feel forced?
```

## 14.3 Success Criteria

```text
certificate download is obvious
stamp/passport value is clear
survey is clearly optional
user can finish without survey
```

---

## 15. Digital Stamp/Passport UX Test

## 15.1 Goal

Verify stamp collection motivates repeat visits.

## 15.2 Test Task

```text
View your digital passport and explain what it shows.
```

## 15.3 Observe

```text
Does user understand stamp collection?
Do they know how to collect more?
Do they understand if stamp is already earned?
Do they understand guest passport limitation?
Do they understand Google/LINE save is optional?
```

## 15.4 Success Criteria

```text
user understands collection mechanic
user sees value in saving passport
foreign/non-LINE user still has path
```

---

## 16. Returning Tourist UX Test

## 16.1 Goal

Verify repeat users do not need to fill too much again.

## 16.2 Test Task

```text
You already got a certificate at one place. Now scan another attraction QR and get another certificate.
```

## 16.3 Observe

```text
Is profile prefilled?
Does user understand why less information is needed?
Does user avoid repeated form fatigue?
Is new stamp/certificate clear?
```

## 16.4 Success Criteria

```text
repeat flow is faster than first-time flow
user does not re-enter all details unnecessarily
```

---

## 17. Optional Survey UX Test

## 17.1 Goal

Verify users are willing to answer extra questions after receiving certificate.

## 17.2 Test Task

```text
Answer the optional survey after receiving your certificate.
```

## 17.3 Observe

```text
Does user understand survey is optional?
Does survey feel too long?
Which questions feel sensitive?
Does spending range feel acceptable?
Are satisfaction ratings easy?
Can user skip comment?
Does user still have access to certificate?
```

## 17.4 Success Criteria

```text
survey takes 1-2 minutes
questions feel relevant
user does not feel tricked
certificate is not blocked
```

## 17.5 Survey UX Rule

Ask only the most valuable questions.

Move heavier questions after the reward.

---

## 18. Spending Question UX Test

## 18.1 Goal

Verify expense question feels acceptable.

## 18.2 Test Question

```text
Which spending range best matches your trip spending today?
```

## 18.3 Observe

```text
Does user understand it is a range?
Does user feel it is too private?
Is "prefer not to answer" available if needed?
Are ranges easy to choose?
```

## 18.4 Success Criteria

```text
user can answer without discomfort
user understands it is approximate
```

---

## 19. Satisfaction Question UX Test

## 19.1 Goal

Verify ratings are clear.

## 19.2 Observe

```text
Do users understand 1-5 scale?
Are labels clear?
Are dimensions too many?
Do users understand comment is optional?
```

## 19.3 Success Criteria

```text
rating is quick
labels are understandable
comment is not required
```

---

## 20. Foreign Tourist UX Test

## 20.1 Goal

Verify tourists without LINE can still use the system.

## 20.2 Test Task

```text
Use the system in English as a tourist who does not have LINE.
```

## 20.3 Observe

```text
English text clarity
guest flow works
LINE not required
passport limitation is explained
certificate can be downloaded
survey can be completed
```

## 20.4 Success Criteria

```text
foreign/non-LINE tourist can complete core flow
no page forces LINE
English content is understandable
```

---

# Admin UX Test Plan

---

## 21. Admin Login and Navigation UX Test

## 21.1 Goal

Verify admin can find main functions.

## 21.2 Test Task

```text
Log in and find where to manage attractions, QR codes, and dashboard.
```

## 21.3 Success Criteria

```text
admin can navigate without instruction
main menu labels are clear
dashboard is easy to find
```

---

## 22. Attraction CMS UX Test

## 22.1 Test Task

```text
Create a new tourist attraction with public details, image, and province/district.
```

## 22.2 Observe

```text
Are fields understandable?
Is required/optional clear?
Is slug handled automatically?
Is image upload clear?
Is publish state clear?
Can admin save draft?
```

## 22.3 Success Criteria

```text
admin can create attraction without developer help
validation messages are clear
```

---

## 23. Photo Spot UX Test

## 23.1 Test Task

```text
Add a photo spot to an attraction.
```

## 23.2 Observe

```text
Does admin understand what a photo spot means?
Can admin link it to attraction?
Can admin describe QR placement?
Can admin activate/deactivate it?
```

## 23.3 Success Criteria

```text
admin can add and manage photo spots
```

---

## 24. QR / Check-in Code UX Test

## 24.1 Test Task

```text
Create a QR/check-in code for a photo spot and find the QR link.
```

## 24.2 Observe

```text
Can admin generate code?
Can admin copy/download QR?
Can admin see active/inactive status?
Can admin deactivate old QR?
Can admin understand expiration dates?
```

## 24.3 Success Criteria

```text
admin can create and test QR without developer help
```

---

## 25. Dashboard UX Test

## 25.1 Test Task

```text
Use the dashboard to answer: Which attraction has the most visits? Which attraction needs improvement? What is the survey completion rate?
```

## 25.2 Observe

```text
Can admin find KPI cards?
Can admin use filters?
Does admin understand difference between QR scans and visits?
Does admin understand estimated spending is not revenue?
Does admin understand satisfaction sample size?
```

## 25.3 Success Criteria

```text
admin can interpret key metrics correctly
admin does not confuse QR scans with visits
admin does not call estimated spending revenue
```

---

## 26. Export UX Test

## 26.1 Test Task

```text
Export visit or dashboard data for a report.
```

## 26.2 Observe

```text
Can admin find export button?
Does admin understand what data will be exported?
Is privacy warning visible?
Does file download work?
Does CSV open correctly?
```

## 26.3 Success Criteria

```text
admin can export safely
admin understands export excludes private identifiers by default
```

---

# Dashboard Interpretation UX Tests

---

## 27. Metric Comprehension Test

Ask admin/researcher:

```text
What does Tourist Profiles mean?
What is the difference between QR Scans and Visits?
What does Estimated Spending mean?
What does Survey Completion Rate mean?
Why is Average Satisfaction showing No data?
```

Pass if user understands:

```text
Tourist Profiles are system profiles, not verified unique people.
QR scans are not visits.
Estimated spending is self-reported range, not revenue.
Survey completion is optional survey completion after certificate.
No data means denominator/response count missing, not zero.
```

---

## 28. Insight Card Comprehension Test

Show sustainable tourism insight cards.

Ask:

```text
What action would you take from this insight?
How confident are you in this insight?
What data supports it?
```

Pass if:

```text
insight leads to reasonable planning action
user notices confidence/sample size
user does not overclaim official impact
```

---

# Mobile UX Tests

---

## 29. Mobile Viewport Test

Test tourist flow on:

```text
small Android viewport
iPhone viewport
tablet viewport
```

Check:

```text
no horizontal scroll
CTA visible
forms usable
upload button visible
certificate preview fits
success/download buttons visible
survey fields not cramped
```

---

## 30. Real Device Test

Use at least one real phone.

Tasks:

```text
scan QR from printed/sign image
open flow
upload camera/gallery photo
generate certificate
download/save image
answer survey
```

This is important because browser simulation may miss upload/download problems.

---

## 31. Slow Network UX Test

Simulate slow network.

Observe:

```text
loading states
upload progress
certificate generation feedback
retry behavior
does user think system is stuck?
```

Pass if:

```text
user sees clear loading states
user can retry safely
no duplicate records from repeated clicks
```

---

# Accessibility UX Tests

---

## 32. Form Accessibility Test

Check:

```text
labels attached to inputs
errors are readable
keyboard navigation works
focus states visible
color contrast acceptable
required fields clear
```

---

## 33. Dashboard Accessibility Test

Check:

```text
KPI text readable
charts have titles
important chart data available in table/text
color is not only indicator
filters keyboard accessible
empty/error states readable
```

---

## 34. Language UX Test

Test:

```text
Thai flow
English flow
language switch
mixed Thai/English attraction content fallback
date formatting
currency formatting
error messages
```

Pass if:

```text
language does not break flow
fallback content is understandable
```

---

# UX Findings and Severity

---

## 35. UX Issue Severity

## 35.1 Critical UX Issue

Examples:

```text
tourist cannot complete certificate
photo upload impossible on mobile
certificate download hidden/broken
LINE required for foreign tourist
consent unclear enough to stop flow
```

Release blocker.

## 35.2 High UX Issue

Examples:

```text
form feels too long
major CTA unclear
users confuse QR scans with visits on dashboard
admin cannot create QR without help
survey feels forced
```

Fix before release.

## 35.3 Medium UX Issue

Examples:

```text
some labels unclear
dashboard chart needs better tooltip
minor mobile spacing issue
export warning needs clearer wording
```

Fix before final submission if possible.

## 35.4 Low UX Issue

Examples:

```text
small visual polish
minor copy improvement
icon inconsistency
```

Fix when convenient.

---

## 36. UX Test Report Template

For each UX test session, record:

```text
tester type
device/browser
task
completed: yes/no
time to complete
confusion points
errors encountered
quotes/feedback
severity
recommended fix
```

Example:

```text
Task: Generate certificate from QR
Completed: Yes
Time: 2m 10s
Issue: User did not understand why origin province was required
Severity: Medium
Fix: Add helper text: "Used only for tourism statistics"
```

---

# UX Acceptance Criteria

---

## 37. Tourist Flow UX Acceptance

```text
[ ] Tourist understands certificate benefit within 5 seconds.
[ ] Tourist can start flow without help.
[ ] Minimal form does not require Google/LINE/email/phone.
[ ] Consent is clear and not pre-checked.
[ ] Photo upload works on mobile.
[ ] Certificate preview feels valuable.
[ ] Certificate download is obvious.
[ ] Survey is clearly optional.
[ ] Guest flow works.
[ ] Foreign/non-LINE path works.
[ ] Returning tourist does not repeat all fields unnecessarily.
```

---

## 38. Admin UX Acceptance

```text
[ ] Admin can log in.
[ ] Admin can create/edit/publish attraction.
[ ] Admin can create photo spot.
[ ] Admin can create/deactivate QR/check-in code.
[ ] Admin can understand active/inactive status.
[ ] Admin can use dashboard filters.
[ ] Admin can interpret core metrics correctly.
[ ] Admin can export data safely.
[ ] Viewer role is read-only in UI.
```

---

## 39. Dashboard UX Acceptance

```text
[ ] Dashboard clearly distinguishes QR scans and visits.
[ ] Tourist Profiles is not presented as verified unique people.
[ ] Estimated Spending is not labeled revenue.
[ ] Average Satisfaction shows sample/response count.
[ ] No data states are understandable.
[ ] Insight cards include evidence and action.
[ ] Filters are easy to use.
[ ] Export actions are clear and permission-controlled.
```

---

## 40. Survey UX Acceptance

```text
[ ] Survey appears after certificate reward.
[ ] Survey is optional.
[ ] Survey can be completed within 1-2 minutes.
[ ] Spending question uses ranges.
[ ] Prefer not to answer is available where appropriate.
[ ] Satisfaction scale is understandable.
[ ] Comment is optional.
```

---

## 41. Do Not Do

Do not:

```text
Force LINE login.
Require email before certificate.
Ask too many questions before reward.
Hide certificate download behind survey.
Use unclear consent wording.
Make photo upload mandatory without explaining why.
Show long academic text on QR landing page.
Make admin depend on developer to create QR codes.
Use dashboard terms that mislead users.
```

---

## 42. Future UX Enhancements

Possible future improvements:

```text
A/B test landing page CTA
A/B test QR sign copy
progress indicator optimization
certificate template preference test
stamp/passport gamification test
survey length experiment
foreign tourist language expansion
admin onboarding walkthrough
dashboard guided insights
```

---

## 43. Final UX Testing Rule

The best database design will not matter if tourists do not complete the flow.

UX testing must prove that the system earns user participation before asking for more data.
