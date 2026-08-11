# MODULE_07_DIGITAL_STAMP_PASSPORT.md

## 1. Module Name

**Digital Stamp and Passport Module**

---

## 2. Module Purpose

The Digital Stamp and Passport Module gives tourists a collectible reward after completing a valid visit flow.

The module encourages repeat visits across attractions and provinces by allowing tourists to collect digital stamps in a travel passport.

This module is an engagement mechanism that supports the main project objective:

> Collect structured tourism data for sustainable tourism planning in Yala, Pattani, and Narathiwat.

---

## 3. Business Purpose

Tourists are more likely to participate when they receive something valuable.

The digital stamp and passport system provides:

- motivation to complete the certificate flow
- motivation to visit more attractions
- motivation to optionally save identity with Google or LINE
- better returning tourist recognition
- repeat visit insights
- province-level travel progress
- future campaign and reward foundation

The passport should make tourists feel they are collecting memories, not filling out a government survey.

---

## 4. Core Design Decision

A visit and a stamp are different records.

Correct:

```text
visits = every tourist visit or participation event
tourist_stamps = earned stamp records
```

Incorrect:

```text
one visit always means one new stamp
```

Reason:

A tourist may visit the same attraction multiple times, but should normally earn the attraction stamp only once.

Example:

```text
Tourist 1001 visits Aiyerweng Skywalk on 2026-05-18
  -> visit record created
  -> stamp earned

Tourist 1001 visits Aiyerweng Skywalk again on 2026-06-02
  -> new visit record created
  -> no duplicate stamp
```

---

## 5. Primary Users

## 5.1 Tourist

Tourists collect stamps and view passport progress.

## 5.2 Returning Tourist

Returning tourists can continue collecting stamps across attractions.

## 5.3 Foreign Tourist

Foreign tourists can use guest passport first and optional Google linking for cross-device recovery.

They must not be forced to use LINE.

## 5.4 Admin

Admins can manage stamp definitions in future phases.

## 5.5 Planner

Planners can analyze stamp progress and repeat participation.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Stamp definition per attraction
- Stamp assignment after certificate generation
- Duplicate stamp prevention
- Stamp linked to tourist, attraction, visit, and stamp definition
- Basic passport view
- Stamp count by tourist
- Stamp count by attraction
- Guest passport on same device
- Integration with certificate flow

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Full digital passport page
- Province progress
- Badge system
- Campaign stamps
- Reward milestones
- Google passport recovery
- LINE passport save
- Future email passport recovery
- Share passport card
- Stamp animation
- Stamp rarity or themed collections
- Admin stamp editor
- Passport QR/share link

## 6.3 Out of Scope

This module does not directly handle:

- QR code resolution
- Tourist profile form
- Photo upload
- Certificate rendering
- Survey questions
- Admin attraction editing

It depends on those modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_12_LINE_LIFF_OPTIONAL.md
```

---

## 8. Required Data Tables

This module uses:

```text
stamp_definitions
tourist_stamps
tourists
visits
attractions
provinces
tourist_identities
```

It may use later:

```text
campaigns
badges
tourist_badges
passport_share_links
reward_rules
```

---

## 9. Stamp Definition

A stamp definition describes the stamp available for an attraction.

Table:

```text
stamp_definitions
```

Required fields:

```text
stamp_definition_id
attraction_id
stamp_name_th
stamp_name_en
description_th
description_en
stamp_image_path
is_active
created_at
updated_at
```

Rules:

- MVP can use one stamp definition per attraction.
- Stamp definition must link to attraction.
- Inactive stamp definition cannot be newly earned.
- Old earned stamps should remain visible even if stamp definition is later deactivated.

---

## 10. Tourist Stamp

A tourist stamp is an earned stamp record.

Table:

```text
tourist_stamps
```

Required fields:

```text
stamp_id
tourist_id
attraction_id
visit_id
stamp_definition_id
earned_at
status
```

Allowed status values:

```text
earned
revoked
```

Recommended unique rule:

```text
unique(tourist_id, attraction_id)
```

This prevents duplicate attraction stamps.

---

## 11. Stamp Assignment Trigger

Recommended MVP trigger:

```text
After certificate_generated succeeds
```

Reason:

Certificate generation proves that the tourist completed the core engagement flow.

Alternative triggers:

```text
after minimal form completed
after photo uploaded
after survey completed
```

Do not require survey completion to earn the stamp.

Survey should remain optional.

---

## 12. Stamp Assignment Flow

Recommended flow:

```text
Certificate generated
    |
System checks tourist_id and attraction_id
    |
System finds active stamp definition for attraction
    |
System checks if tourist already has stamp for attraction
    |
If not earned:
    create tourist_stamps record
    show "New stamp earned"
If already earned:
    show "You already have this stamp"
    still keep visit record
```

---

## 13. Duplicate Stamp Rule

A tourist normally earns one stamp per attraction.

Required database constraint:

```text
unique(tourist_id, attraction_id)
```

Business behavior:

- If insert succeeds, tourist earned new stamp.
- If unique constraint fails, do not treat as fatal for visit flow.
- Show friendly message that stamp already exists.
- Do not delete or reject the repeat visit.

---

## 14. Repeat Visit Rule

Repeat visits are allowed.

Do not apply uniqueness to:

```text
visits(tourist_id, attraction_id)
```

Only apply uniqueness to:

```text
tourist_stamps(tourist_id, attraction_id)
```

This is critical for dashboard accuracy.

---

## 15. Digital Passport

The digital passport is a tourist-facing view of earned stamps.

## 15.1 MVP Passport

MVP passport can be simple.

Required:

```text
tourist display name
list of earned stamps
attraction name
province
earned date
stamp image or placeholder
total stamps earned
```

Optional:

```text
province progress
certificate links
share button
```

## 15.2 Phase 2 Passport

Phase 2 passport can include:

```text
province completion progress
map of visited attractions
badge milestones
campaign progress
recommended next attractions
LINE save
Google recovery
future email recovery
shareable passport card
```

---

## 16. Passport Identity Rules

## 16.1 Guest Passport

Guest passport works only on the same device/browser.

Rules:

- Use anonymous device identity.
- Show warning that passport may be lost if browser data is cleared.
- Offer optional save with Google or LINE after certificate/stamp.

Example message:

```text
Save your passport with Google or LINE so you can access it later.
```

## 16.2 LINE Passport

LINE passport is useful for Thai users.

Rules:

- Optional.
- Do not require before certificate generation, certificate download, stamp award, or optional survey.
- Offer LINE linking only after the tourist already receives value, such as certificate/download/stamp, or on the passport page.
- Verify LINE token server-side before linking.
- Link server-derived LINE identity to the existing tourist.
- Do not expose LINE ID or `provider_user_id` in passport UI, dashboard, share URL, or default exports.
- Do not claim returning LINE recovery, unlinking, or LINE messaging is production-complete unless separately implemented and verified.

## 16.3 Google Passport

Google passport is useful for cross-device recovery and for tourists who do not use LINE.

Rules:

- Optional.
- Do not require before certificate generation.
- Link Google identity to the existing guest Tourist Profile when safe.
- Do not expose Google subject or provider_user_id in passport UI, dashboard, or default exports.

## 16.4 Future Email Passport

Email passport is a future recovery option.

Rules:

- Optional.
- Use email magic link in future.
- Do not require before certificate generation.

---

## 17. Passport Progress Metrics

Possible passport progress metrics:

```text
total_stamps_earned
stamps_by_province
visited_province_count
visited_attraction_count
target_area_completion_rate
latest_stamp_earned_at
```

MVP can show only:

```text
total stamps
list of earned stamps
```

---

## 18. Province Progress

For Yala, Pattani, and Narathiwat, future passport can show:

```text
Yala: 2 / 5 stamps
Pattani: 1 / 5 stamps
Narathiwat: 0 / 5 stamps
```

This requires:

```text
attractions.province_id
tourist_stamps.attraction_id
```

---

## 19. Badge and Reward Foundation

Future badge examples:

```text
First Stamp
Yala Explorer
Pattani Heritage Visitor
Narathiwat Coastal Traveler
Southern Border Explorer
Community Tourism Supporter
```

These should not be built before MVP is stable.

Possible future tables:

```text
badges
tourist_badges
reward_rules
campaign_rewards
```

---

## 20. Stamp UI Requirements

## 20.1 Stamp Earned Screen

After certificate generation, show:

```text
New stamp earned!
```

or:

```text
You already collected this stamp.
```

Thai:

```text
คุณได้รับตราประทับใหม่แล้ว!
```

or:

```text
คุณมีตราประทับนี้แล้ว
```

## 20.2 Stamp Card

Stamp card should show:

```text
stamp image
stamp name
attraction name
province
earned date
```

## 20.3 Passport CTA

After stamp earned, show:

```text
View My Passport
Answer Short Survey
Save Passport
```

Do not force survey before showing passport.

---

## 21. Stamp Image Requirements

Stamp image should be:

- clear
- attractive
- small file size
- visually tied to attraction/province
- usable on mobile

MVP can use placeholder stamp graphics.

Production should use designed assets.

---

## 22. Data Validation Rules

## 22.1 Stamp Definition

Rules:

- attraction_id required.
- stamp name required.
- only active stamp definitions can be newly earned.
- one default active stamp per attraction recommended for MVP.

## 22.2 Tourist Stamp

Rules:

- tourist_id required.
- attraction_id required.
- visit_id required.
- stamp_definition_id required.
- earned_at required.
- status controlled.
- duplicate tourist-attraction prevented.

---

## 23. API or Service Responsibilities

Recommended service functions:

```text
getActiveStampDefinition(attractionId)
hasTouristEarnedStamp(touristId, attractionId)
awardStampForVisit(visitId)
getTouristPassport(touristId)
getTouristStamps(touristId)
getProvinceStampProgress(touristId)
revokeStamp(stampId, reason)
```

MVP key function:

```text
awardStampForVisit(visitId)
```

---

## 24. Suggested Award Logic

Conceptual logic:

```text
function awardStampForVisit(visitId):
    visit = get visit with tourist_id and attraction_id
    stampDefinition = get active stamp definition for attraction

    if no stampDefinition:
        return no_stamp_available

    existingStamp = find tourist_stamps by tourist_id and attraction_id

    if existingStamp exists:
        return already_earned

    create tourist_stamps
    return earned
```

Important:

Unique constraint should still protect against race conditions.

---

## 25. Error Handling

## 25.1 No Stamp Definition

Message:

```text
Your visit was recorded, but this attraction does not have a stamp yet.
```

Do not fail certificate flow.

## 25.2 Duplicate Stamp

Message:

```text
You already collected this stamp. Your new visit was still recorded.
```

## 25.3 Stamp Insert Failed

Message:

```text
Your certificate was created, but we could not add the stamp. Please try again later.
```

Do not delete certificate.

## 25.4 Tourist Not Found

Message:

```text
We could not find your travel profile.
```

## 25.5 Visit Not Found

Message:

```text
We could not find your visit record.
```

---

## 26. Dashboard Impact

Stamp data supports:

```text
total stamps earned
stamps by attraction
stamps by province
passport participation rate
repeat visit comparison
most collected stamps
stamp completion by province
```

Important:

Stamp count is not equal to visit count.

A tourist may visit multiple times but earn one stamp.

---

## 27. Analytics Interpretation

## 27.1 High Visit, Low Stamp

May indicate:

- repeat visits
- stamp assignment problem
- some visits did not complete certificate flow

## 27.2 High Stamp, Low Survey

May indicate:

- certificate/stamp incentive works
- survey prompt needs improvement

## 27.3 High Passport Save Rate

May indicate strong engagement and likelihood of return visits.

---

## 28. Export Rules

Exports can include:

```text
stamp_id
tourist_id or anonymized tourist reference
attraction
province
earned_at
status
```

Normal public/planning exports should not include:

```text
email
Google subject
LINE user ID
device token
```

---

## 29. Security and Privacy

## 29.1 Access Rules

Tourists should only see their own passport.

Admins can view aggregate stamp metrics.

Detailed tourist stamp records require appropriate permission.

## 29.2 Privacy Rules

Do not expose:

```text
provider_user_id
email
Google subject
LINE ID
device token
private certificate URL
```

on passport page.

## 29.3 Public Sharing

If passport sharing is added:

- sharing must be user-initiated.
- shared passport should hide private data.
- use display name only.
- allow disabling share link in future.

---

## 30. Retention Rules

Digital stamps can be kept while passport is active.

If tourist identity is anonymized:

- keep aggregate stamp count.
- remove or anonymize direct identity.
- preserve attraction/province analytics.

See:

```text
docs/database/DATA_RETENTION_POLICY.md
```

---

## 31. Performance Requirements

Indexes:

```text
tourist_stamps(tourist_id)
tourist_stamps(attraction_id)
tourist_stamps(tourist_id, attraction_id)
tourist_stamps(earned_at)
stamp_definitions(attraction_id)
```

Passport query should be fast.

Do not load unnecessary certificate or photo data on passport overview.

---

## 32. Edge Cases

## 32.1 Same Tourist Visits Same Attraction Twice

Create new visit.

Do not create duplicate stamp.

## 32.2 Stamp Definition Missing

Certificate still works.

Show no stamp available message.

## 32.3 Stamp Definition Inactive

Do not award new stamp.

Old stamps remain visible.

## 32.4 Tourist Changes Identity

Passport should follow tourist_id, not provider identity.

## 32.5 Guest Clears Browser

Guest passport may be lost if no Google/LINE link exists.

## 32.6 Duplicate Stamp Race Condition

Database unique constraint should prevent duplicates.

Handle error gracefully.

---

## 33. Example User Stories

## 33.1 Tourist Earns New Stamp

As a tourist, I want to receive a stamp after creating a certificate.

Acceptance:

```text
Given I completed certificate generation for an attraction
And I do not already have that attraction stamp
Then the system creates a tourist_stamps record
And I see a new stamp earned message
```

---

## 33.2 Tourist Already Has Stamp

As a returning tourist, I want my repeat visit recorded without duplicate stamp.

Acceptance:

```text
Given I already earned a stamp for this attraction
When I complete the certificate flow again
Then the system creates a new visit
But does not create a duplicate tourist_stamps record
```

---

## 33.3 Tourist Views Passport

As a tourist, I want to view my collected stamps.

Acceptance:

```text
Given I have earned stamps
When I open my passport
Then I see my stamps with attraction names and earned dates
```

---

## 33.4 Guest Saves Passport Later

As a guest tourist, I want to save my passport after receiving a stamp.

Acceptance:

```text
Given I completed as guest
When I choose save with Google or LINE
Then the new identity is linked to my existing tourist profile
```

---

## 34. MVP Acceptance Checklist

```text
[ ] stamp_definitions table exists.
[ ] tourist_stamps table exists.
[ ] Each MVP attraction has a stamp definition.
[ ] Stamp is awarded after certificate generation.
[ ] Stamp links to tourist.
[ ] Stamp links to attraction.
[ ] Stamp links to visit.
[ ] Duplicate tourist-attraction stamp is prevented.
[ ] Repeat visit still creates visit record.
[ ] Basic passport view exists or is planned in route.
[ ] Guest passport works on same device.
[ ] No LINE requirement exists.
[ ] No Google requirement exists.
[ ] Stamp metrics can be used by dashboard.
```

---

## 35. Do Not Do

Do not:

```text
Make stamp the same as visit.
Apply unique tourist-attraction rule to visits.
Require survey completion to earn stamp.
Require LINE to save stamp.
Require LINE before certificate download, stamp award, passport view, or optional survey.
Require Google to save stamp.
Create duplicate stamps for same tourist and attraction.
Store stamp progress only in local storage.
Show private identity values in passport.
Delete old stamps when stamp definition changes.
Treat stamp count as actual visit count.
```

---

## 36. Future Enhancements

Possible future additions:

```text
province passport progress
campaign stamp collections
badges
reward milestones
shareable passport card
LINE rich menu passport
Google passport recovery
email magic link passport recovery
stamp animation
admin stamp designer
passport recommendation engine
community tourism stamp set
```

---

## 37. Definition of Done

This module is done when:

```text
[ ] Stamp definition exists for attraction.
[ ] Stamp award logic works.
[ ] Duplicate stamp prevention works.
[ ] Repeat visits still work.
[ ] Passport can display earned stamps.
[ ] Guest users are supported.
[ ] Google/LINE are optional.
[ ] LINE linking, if offered, happens after reward and uses server-side token verification.
[ ] LINE ID and provider_user_id are not exposed.
[ ] Dashboard can count stamps.
[ ] Privacy rules are followed.
[ ] Documentation and tests are updated.
```

---

## 38. Public Leaderboard Privacy

The public leaderboard is optional and purpose-specific. Certificate names are private by default and are not automatically reused for ranking.

Supported visibility values:

```text
private      = excluded from public ranking
alias        = public alias or server-generated anonymous alias
display_name = certificate/passport display name after explicit confirmation
```

Public leaderboard output may include only rank, public name, XP, level, stamp count, badge count, and whether the row belongs to the current tourist. It must not include `tourist_id`, provider IDs, guest tokens, certificate IDs, or visit history.

Preference changes and withdrawal are handled atomically by `set_tourist_leaderboard_preference(...)` and recorded under `purpose_key = leaderboard_public_profile`.
