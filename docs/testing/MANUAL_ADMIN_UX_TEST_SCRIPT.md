# Manual Admin UX Test Script

This script covers the critical admin workflows that should be tested manually before each release.

## Prerequisites

- Admin account with `super_admin` or full content management permissions
- Running dev server (`npm run dev`)
- Supabase project (local or remote) with seed data applied
- Docker desktop running (if using local Supabase)

---

## Test 1: Admin Login & Protected Routes

| Step | Action | Expected Result |
|---|---|---|
| 1.1 | Navigate to `/admin/attractions` while logged out | Redirected to `/admin/login` |
| 1.2 | Navigate to `/admin/login` | Login form is displayed |
| 1.3 | Enter valid admin credentials and submit | Redirected to `/admin` dashboard overview |
| 1.4 | Verify sidebar navigation is visible | All expected admin modules appear in sidebar |

**Pass / Fail / Notes:**

---

## Test 2: Attraction CRUD

| Step | Action | Expected Result |
|---|---|---|
| 2.1 | Navigate to `/admin/attractions` | List page shows existing attractions with search, filters, pagination |
| 2.2 | Click "Create Attraction" | Attraction form opens |
| 2.3 | Leave required fields empty and submit | Error summary shows: "กรุณาตรวจสอบข้อมูลให้ถูกต้อง" |
| 2.4 | Fill in all required fields (province, slug, Thai name) and submit | Success message shown, redirected to visual editor |
| 2.5 | Edit the attraction's Thai name in the editor | Changes are saved |
| 2.6 | Click "Preview" link | Navigates to `/attractions/[slug]` showing the content |
| 2.7 | From the attraction list, toggle Publish/Unpublish | Badge updates from "Draft" to "Published" |
| 2.8 | Use search to find the attraction by name | Results filter correctly |
| 2.9 | Use province filter to narrow results | Only matching province attractions shown |

**Pass / Fail / Notes:**

---

## Test 3: Attraction Media Management

| Step | Action | Expected Result |
|---|---|---|
| 3.1 | Navigate to an attraction's edit page | Visual editor sections are displayed |
| 3.2 | Click "Gallery" section | Media manager opens |
| 3.3 | Upload a JPEG image (< 5MB) | Image uploads and appears in gallery |
| 3.4 | Set the uploaded image as cover | Cover badge appears on the image |
| 3.5 | Remove the cover image | Image is removed from gallery |
| 3.6 | Upload an invalid file type (e.g., .gif, .pdf) | Error: file type not allowed |
| 3.7 | Upload a file > 10MB | Error: file too large |

**Pass / Fail / Notes:**

---

## Test 4: Photo Spot & QR Check-in Code

| Step | Action | Expected Result |
|---|---|---|
| 4.1 | Navigate to `/admin/photo-spots/new` | Photo spot form opens |
| 4.2 | Select the attraction created in Test 2 | Attraction name appears |
| 4.3 | Fill in Thai name, leave other fields optional | Form accepts submission |
| 4.4 | After creation, click "Create QR/check-in code" | Redirected to check-in code form with pre-filled attraction |
| 4.5 | Enter a unique URL-safe code and submit | Success: QR code is created |
| 4.6 | On the check-in codes list, click "Test QR" link | Opens `/c/[code]` in new tab |
| 4.7 | Verify the QR landing page displays correctly | Attraction info, photo spot context visible |
| 4.8 | Copy the QR URL | Clipboard has `/c/[code]` |

**Pass / Fail / Notes:**

---

## Test 5: Check-in Code List & Status

| Step | Action | Expected Result |
|---|---|---|
| 5.1 | Navigate to `/admin/checkin-codes` | List shows all codes with status badges |
| 5.2 | Verify status badges are visible and color-coded | Active (green), Inactive (red), Expired (gray) |
| 5.3 | Toggle a code from Active to Inactive | Badge updates to Inactive |
| 5.4 | Verify if attraction is unpublished, warning is visible | Warning badge: "Attraction draft" |
| 5.5 | Click the Download QR button | QR image downloads as PNG |

**Pass / Fail / Notes:**

---

## Test 6: Story CRUD

| Step | Action | Expected Result |
|---|---|---|
| 6.1 | Navigate to `/admin/stories` | Story list with search and filter |
| 6.2 | Click "Create Story" | Story form opens |
| 6.3 | Enter title, slug, and body content | Content is saved |
| 6.4 | Toggle Published | Story shows as Published in list |
| 6.5 | Click public preview link | `/stories/[id]` page renders correctly |
| 6.6 | Verify the story page shows cover image and content | Both render without errors |

**Pass / Fail / Notes:**

---

## Test 7: Route CRUD with Stops

| Step | Action | Expected Result |
|---|---|---|
| 7.1 | Navigate to `/admin/routes` | Route list page |
| 7.2 | Click "Create Route" | Route form opens |
| 7.3 | Enter name and slug | Route saved |
| 7.4 | Navigate to route stops management | Stop manager shows ordered list |
| 7.5 | Add 3 attractions as route stops with day numbers | Stops appear in order |
| 7.6 | Reorder a stop using arrow buttons | Display order updates |
| 7.7 | Save route stops | Changes are preserved after page reload |
| 7.8 | Click public preview | `/routes/[slug]` shows all stops in order |

**Pass / Fail / Notes:**

---

## Test 8: Settings Console

| Step | Action | Expected Result |
|---|---|---|
| 8.1 | Navigate to `/admin/settings` | Settings grouped by: Homepage, Public Pages, Contact & Footer, SEO, System |
| 8.2 | Click "Homepage" tab | Homepage settings displayed |
| 8.3 | Change homepage hero title text | Field updates |
| 8.4 | Click Save | Success message; changes persist after reload |
| 8.5 | Navigate to Homepage | Hero title shows updated text |
| 8.6 | Navigate back to settings, click "Contact & Footer" | Contact settings displayed |
| 8.7 | Update contact email and save | Changes persist |
| 8.8 | Navigate to Contact page | Updated email is displayed |
| 8.9 | Try to save an unknown setting key via API | Rejected with error |

**Pass / Fail / Notes:**

---

## Test 9: Media Library

| Step | Action | Expected Result |
|---|---|---|
| 9.1 | Navigate to `/admin/media` | Media Library loads with asset grid |
| 9.2 | Upload a new asset via drag-and-drop | Asset appears in grid |
| 9.3 | Search for an asset by filename | Results filter |
| 9.4 | Click "Archive" on an asset | Confirmation dialog appears |
| 9.5 | Confirm archive | Asset moved to archived state |
| 9.6 | Toggle "Show Archived" toggle | Archived assets appear with reduced opacity |
| 9.7 | Click "Restore" on an archived asset | Asset returns to active state |
| 9.8 | Verify Active/Archived count badges update | Counts reflect the current state |

**Pass / Fail / Notes:**

---

## Test 10: Public Page Verification

| Step | Action | Expected Result |
|---|---|---|
| 10.1 | Navigate to homepage (`/`) | Popular destinations section shows published attractions |
| 10.2 | Click a province tab (ยะลา) | Only Yala attractions shown |
| 10.3 | Click "ทั้งหมด" | All attractions shown again |
| 10.4 | Navigate to `/attractions/[slug]` for a published attraction | Full detail page renders correctly |
| 10.5 | Navigate to `/stories/[id]` for a published story | Story renders with content and image |
| 10.6 | Navigate to `/routes/[slug]` for a published route | Route page renders with all stops |
| 10.7 | Navigate to `/restaurants/[slug]` for a published restaurant | Restaurant page renders correctly |

**Pass / Fail / Notes:**

---

## Test 11: Error & Empty States

| Step | Action | Expected Result |
|---|---|---|
| 11.1 | Navigate to `/admin/visits` without visit data | Empty state with informative message |
| 11.2 | Navigate to `/admin/checkin-codes` with no matching filters | Empty state with "try changing filters" message |
| 11.3 | Submit an admin form with invalid data | Error summary at top of form with actionable message |
| 11.4 | Navigate to a non-existent admin page | 404 page or graceful error |
| 11.5 | Verify no raw technical errors appear in user-facing UI | All errors are translated to Thai where practical |

**Pass / Fail / Notes:**

---

## Test 12: Accessibility Checks

| Step | Action | Expected Result |
|---|---|---|
| 12.1 | Tab through admin sidebar navigation | All items are keyboard-focusable |
| 12.2 | Tab through admin form fields | Each field receives focus in expected order |
| 12.3 | Hover over icon-only buttons | Tooltip appears with descriptive label |
| 12.4 | Verify status badges have visible text labels | Status is readable without relying on color alone |
| 12.5 | Resize browser to tablet width (768px) | Admin UI remains usable, no horizontal overflow |
| 12.6 | Resize browser to mobile width (375px) | Content stacks vertically, no cutoff |

**Pass / Fail / Notes:**

---

## Summary

| Test | Result (Pass/Fail) | Notes |
|---|---|---|
| 1. Admin Login | | |
| 2. Attraction CRUD | | |
| 3. Attraction Media | | |
| 4. Photo Spot & QR | | |
| 5. Check-in Codes | | |
| 6. Story CRUD | | |
| 7. Route CRUD | | |
| 8. Settings | | |
| 9. Media Library | | |
| 10. Public Pages | | |
| 11. Error States | | |
| 12. Accessibility | | |

**Tested by:** __________ **Date:** __________ **Build/Commit:** __________
