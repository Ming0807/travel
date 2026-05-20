# ACCESSIBILITY_GUIDELINES.md

## 1. Document Purpose

This document defines accessibility guidelines for the **Southern Border Tourism Data & Intelligence Platform**.

Accessibility is required because the platform is intended for real public use, not only a classroom demo.

The system must be usable by people with different abilities, devices, languages, ages, and technical confidence levels.

---

## 2. Accessibility Mission

The mission is:

```text
Make the platform usable for as many tourists, staff, researchers, and planners as possible.
```

Accessibility supports:

- better tourist completion rate
- better public service quality
- more professional system design
- reduced user errors
- improved mobile usability
- inclusive tourism experience

---

## 3. Accessibility Scope

These guidelines apply to:

```text
public attraction pages
QR check-in page
tourist profile form
photo upload
certificate preview/download
digital passport
optional survey
admin CMS
dashboard analytics
report/export pages
error pages
```

---

## 4. Standards Direction

Aim to follow practical WCAG 2.1 AA principles where possible:

```text
Perceivable
Operable
Understandable
Robust
```

MVP does not need formal certification, but must follow core accessibility basics.

---

## 5. General Accessibility Principles

## 5.1 Use Semantic HTML

Use proper elements:

```text
button for actions
a for navigation
label for inputs
h1-h6 for headings
table for tabular data
main/nav/header/footer landmarks
```

Do not use divs as buttons unless fully accessible.

## 5.2 Keyboard Accessibility

Interactive elements must be keyboard accessible.

Required:

```text
Tab reaches controls
Enter/Space activates buttons
Escape closes modals where appropriate
focus trap in modal
visible focus state
```

## 5.3 Screen Reader Support

Important elements must have accessible names.

Examples:

```text
Icon-only buttons need aria-label.
Inputs need labels.
Images need alt text.
Errors should be announced or associated with fields.
```

## 5.4 Do Not Rely Only on Color

Status must include text or icon plus color.

Bad:

```text
red dot only
```

Good:

```text
Inactive badge with red style and text "Inactive"
```

---

## 6. Color and Contrast

## 6.1 Contrast

Text must have sufficient contrast.

Rules:

- normal text should have strong contrast against background.
- avoid light gray text on white.
- buttons should have readable text.
- chart labels must be readable.

## 6.2 Color Usage

Do not use color as the only meaning.

Examples:

- status badges must include text
- chart legends must include labels
- form errors must include messages
- required fields must be indicated by text/marker

---

## 7. Typography Accessibility

## 7.1 Font Size

Tourist mobile flow:

```text
body text at least 16px
buttons at least 16px
caption no smaller than 12-13px
```

Admin/dashboard:

```text
body text at least 14-16px
table text readable
KPI values clear
```

## 7.2 Line Height

Use comfortable line height:

```text
1.4 to 1.7
```

for readable paragraphs.

## 7.3 Thai Text Readability

Thai text must use readable fonts.

Recommended:

```text
Prompt
Sarabun
```

Avoid overly decorative fonts for Thai body text.

---

## 8. Touch Accessibility

Tourist flow is mobile-first.

Touch targets should be at least:

```text
44px x 44px
```

Recommended CTA height:

```text
48px to 56px
```

Spacing between touch targets should prevent accidental taps.

---

## 9. Form Accessibility

## 9.1 Labels

Every input must have a visible label.

Examples:

```text
Name on certificate
Origin country
Age group
Visit date
```

Do not rely only on placeholder text.

## 9.2 Error Messages

Error messages should:

- appear near the field
- clearly explain the issue
- not blame the user
- be accessible to screen readers where possible

Example:

```text
Please select where you are from.
```

## 9.3 Required Fields

Required fields should be clearly marked.

Example:

```text
Name on certificate *
```

Also explain:

```text
* Required
```

## 9.4 Input Types

Use correct input types:

```text
email
date
number
file
text
```

## 9.5 Field Help Text

Use short helper text for sensitive fields.

Example:

```text
Use the name you want to show on your certificate.
```

---

## 10. Button Accessibility

## 10.1 Button Text

Buttons should describe the action.

Good:

```text
Create My Certificate
Upload Photo
Download Certificate
Save Changes
```

Bad:

```text
OK
Submit
Click
```

unless context is very clear.

## 10.2 Icon Buttons

Icon-only buttons must have labels.

Example:

```html
<button aria-label="Copy check-in URL">
  <CopyIcon />
</button>
```

## 10.3 Disabled Buttons

If button is disabled, explain why if not obvious.

Example:

```text
Upload a photo before generating certificate.
```

---

## 11. Link Accessibility

Links should describe destination.

Good:

```text
View attraction details
Open dashboard
Download CSV export
```

Bad:

```text
Click here
Read more
```

unless context makes meaning clear.

---

## 12. Image Accessibility

## 12.1 Attraction Images

Use alt text.

Example:

```text
View of Aiyerweng Skywalk at sunrise
```

If alt text is unavailable:

```text
Attraction image
```

## 12.2 Decorative Images

Use empty alt text for decorative images:

```html
alt=""
```

## 12.3 Uploaded Tourist Photos

For tourist preview:

```text
Your uploaded travel photo
```

Do not expose private data in alt text.

## 12.4 Certificate Image

Alt text:

```text
Generated digital travel certificate
```

---

## 13. QR Check-in Accessibility

QR landing page must be clear and simple.

Required:

```text
h1 with attraction name
clear CTA
large buttons
short explanation
language option
friendly error messages
```

Invalid QR error should be readable and actionable.

---

## 14. Photo Upload Accessibility

Photo upload must support:

```text
visible file input or accessible custom button
clear accepted file types
clear size limit
preview with alt text
upload progress text
error messages
```

Do not hide file input in a way that blocks keyboard or screen reader users.

---

## 15. Certificate Accessibility

Certificate preview should not be the only source of information.

Also show text summary:

```text
Name
Attraction
Visit date
```

Download button should be accessible.

If sharing/download fails, show text instructions.

---

## 16. Digital Passport Accessibility

Passport stamp cards should include text, not only stamp images.

Each stamp should show:

```text
stamp name
attraction name
province
earned date
```

Progress should not rely only on a visual bar.

Also show text:

```text
3 of 10 stamps collected
```

---

## 17. Survey Accessibility

Survey controls should be accessible.

## 17.1 Rating Controls

If using stars, also include accessible labels.

Example:

```text
1 - Very dissatisfied
5 - Very satisfied
```

## 17.2 Choice Chips

Chips should behave like radio buttons or checkboxes.

Keyboard users must be able to select them.

## 17.3 Skip Option

Skip button must be visible and keyboard accessible.

---

## 18. Admin Accessibility

Admin pages must support keyboard and screen reader basics.

Requirements:

- form labels
- table headers
- sortable column labels if sorting exists
- accessible row actions
- confirmation dialogs with focus management
- clear status badges
- pagination labels

---

## 19. Data Table Accessibility

Data tables should use proper table structure.

Required:

```text
thead
tbody
th
td
caption or heading
```

If using custom table components, ensure accessible markup.

Pagination buttons should have labels:

```text
Next page
Previous page
Page 2
```

---

## 20. Dashboard Accessibility

Charts must not be the only way to understand data.

For each important chart, provide:

```text
title
summary
legend
tooltip
table alternative or key insight text
```

KPI cards should have clear labels.

Do not rely only on chart colors.

---

## 21. Modal and Dialog Accessibility

Modals must:

```text
trap focus
close with Escape
return focus after close
have title
have description where needed
block background interaction
```

Confirm dialogs must clearly state the action.

Example:

```text
Deactivate this check-in code?
Tourists will no longer be able to use this QR code.
```

---

## 22. Toast and Notification Accessibility

Toasts should:

- be visible long enough
- not contain critical information only
- be announced if possible
- not block user action

Critical errors should also appear near the related control or page section.

---

## 23. Language Accessibility

The system should support Thai and English.

Rules:

- allow language switch.
- do not mix languages randomly.
- use clear simple language.
- avoid technical jargon for tourists.
- use correct language for form labels and errors.

---

## 24. Cognitive Accessibility

Tourist flow should reduce cognitive load.

Do:

```text
one main action per screen
short text
step-by-step flow
clear progress
simple choices
friendly errors
```

Do not:

```text
show long survey first
show too many options at once
use technical language
ask unnecessary questions
```

---

## 25. Motion Accessibility

Animations should be subtle.

Avoid:

```text
rapid flashing
excessive movement
animations that block reading
```

Stamp earned animation is acceptable if brief and non-disruptive.

Future setting may allow reduced motion.

Use CSS media query:

```css
@media (prefers-reduced-motion: reduce) {
  /* reduce animation */
}
```

---

## 26. Focus Management

Focus should be managed after:

```text
route changes
modal open/close
form validation errors
step transitions
successful upload
certificate generation
```

For form error, move focus to first error or show clear error summary.

---

## 27. Error Accessibility

Errors should be:

- text-based
- near source
- clear
- not only color
- screen-reader friendly where possible

Bad:

```text
red border only
```

Good:

```text
red border + "Please select your age group."
```

---

## 28. Offline and Network Error Accessibility

If network fails, show readable text.

Example:

```text
You appear to be offline. Please reconnect and try again.
```

Do not show only a spinner forever.

---

## 29. Accessibility Testing Checklist

Test with:

```text
keyboard only
mobile touch
screen reader basics if available
browser zoom 200%
dark/light contrast if supported
Thai and English text
slow network
error states
```

Manual checks:

```text
Can user complete QR flow without mouse?
Can user understand form errors?
Can user upload photo with keyboard?
Can admin use table actions with keyboard?
Can dashboard meaning be understood without color?
```

---

## 30. MVP Accessibility Acceptance Checklist

```text
[ ] Pages use semantic headings.
[ ] Main actions are buttons.
[ ] Navigation uses links.
[ ] Inputs have labels.
[ ] Required fields are marked.
[ ] Errors include text messages.
[ ] Buttons have descriptive text.
[ ] Icon-only buttons have aria-label.
[ ] Color is not the only meaning.
[ ] Text contrast is readable.
[ ] Mobile touch targets are large enough.
[ ] Photo upload is accessible.
[ ] Certificate download button is accessible.
[ ] Passport stamp cards have text labels.
[ ] Survey controls are keyboard accessible.
[ ] Admin tables have headers.
[ ] Modals manage focus.
```

---

## 31. Do Not Do

Do not:

```text
Use div as button without accessibility.
Hide labels and rely only on placeholders.
Use tiny mobile buttons.
Use color alone for status.
Show chart without explanation.
Show spinner forever.
Make survey choices mouse-only.
Use icon-only buttons without aria-label.
Use low contrast text.
Trap keyboard focus accidentally.
```

---

## 32. Final Accessibility Rule

Accessibility is not an extra feature.

It improves usability for everyone and directly increases the chance that tourists complete the flow and provide useful data.
