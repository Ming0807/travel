# DESIGN_SYSTEM.md

## 1. Document Purpose

This document defines the design system for the **Southern Border Tourism Data & Intelligence Platform**.

The design system gives the project a consistent visual language, interaction pattern, component structure, and implementation direction.

It should be used by developers, designers, and AI coding agents when creating UI components and pages.

---

## 2. Design System Mission

The design system must support three product areas:

```text
Tourist-facing mobile/PWA flow
Public tourism website
Admin and dashboard backoffice
```

The design must feel:

```text
professional
premium
trustworthy
warm
tourism-inspired
mobile-first
data-oriented
```

It should not feel like:

```text
plain student CRUD
old government website
random template
overly playful gamified app
unstructured dashboard
```

---

## 3. Design Principles

## 3.1 Clarity First

Users should immediately understand:

- where they are
- what action is expected
- why the action matters
- what they will receive

## 3.2 Reward-Oriented Tourist UX

The certificate and stamp must feel valuable.

Tourist-facing screens should emphasize:

```text
travel memory
digital certificate
digital stamp
passport progress
```

## 3.3 Professional Admin UX

Admin pages should feel like a production-grade management system.

Use:

```text
tables
filters
status badges
forms
confirm dialogs
audit-friendly actions
```

## 3.4 Data Dashboard Credibility

Dashboard design must emphasize:

```text
correct numbers
clear definitions
filters
data freshness
insight tables
```

Avoid decorative charts without planning value.

---

## 4. Recommended Frontend Styling Stack

Recommended:

```text
Tailwind CSS
shadcn/ui style component patterns
Lucide icons
Recharts for charts
```

Optional:

```text
Framer Motion for subtle transitions
TanStack Table for admin tables
React Hook Form + Zod for forms
```

---

## 5. Visual Identity Direction

The platform should combine:

```text
southern border tourism
sustainable development
digital passport
academic/professional credibility
```

Recommended visual keywords:

```text
premium dark emerald
soft mist
white cards
gold certificate accent
subtle coral accent
modern app-like discovery
```

The latest homepage direction should feel like a premium smart tourism PWA with a discovery feed, bottom mobile navigation, certificate/passport reward cards, and dashboard credibility cues.

---

## 6. Color System

## 6.1 Primary Colors

Recommended primary palette:

```text
primary-950: premium dark emerald / #052E2B
primary-900: deep emerald / #064E3B
primary-800: dark teal forest / #115E59
primary-700: emerald teal / #0F766E
primary-600: active emerald / #059669
```

Usage:

- main navigation
- primary CTA
- dashboard headers
- admin active states
- trust-building elements

## 6.2 Accent Colors

Recommended accent palette:

```text
accent-gold: #DFAE3D
accent-soft-gold: #F7E2A7
accent-coral: #F9736B
accent-mist: #F3F7F4
accent-sky: #38BDF8
```

Usage:

- certificate highlight
- stamp reward
- success moments
- selected badges
- small emphasis

Do not overuse accent colors.

## 6.3 Neutral Colors

Recommended neutral palette:

```text
neutral-950: #020617
neutral-900: #0F172A
neutral-800: #1E293B
neutral-700: #334155
neutral-600: #475569
neutral-500: #64748B
neutral-400: #94A3B8
neutral-300: #CBD5E1
neutral-200: #E2E8F0
neutral-100: #F1F5F9
neutral-50: #F8FAFC
white: #FFFFFF
```

Usage:

- text
- borders
- backgrounds
- cards
- tables
- dashboard surfaces

## 6.4 Semantic Colors

```text
success: #16A34A
warning: #F59E0B
danger: #DC2626
info: #0284C7
```

Usage:

- status badges
- validation
- alerts
- admin actions

## 6.5 Color Rules

Do:

```text
Use primary color for main actions.
Use gold only for reward/certificate/stamp moments.
Use neutral backgrounds for dashboards.
Use semantic colors consistently.
```

Do not:

```text
Use too many gradients.
Use red for normal actions.
Use low contrast text.
Use random colors per page.
```

---

## 7. Typography System

## 7.1 Recommended Fonts

Thai-first UI:

```text
Prompt
Sarabun
```

English/supporting UI:

```text
Inter
```

Recommended stack:

```css
font-family: "Prompt", "Sarabun", "Inter", system-ui, sans-serif;
```

## 7.2 Font Usage

Use:

```text
Prompt for headings and buttons
Sarabun for longer Thai reading text
Inter for dashboard/admin numbers if needed
```

## 7.3 Type Scale

Recommended scale:

```text
display: 40-48px
h1: 32-36px
h2: 28-30px
h3: 22-24px
h4: 18-20px
body: 16px
small: 14px
caption: 12px
```

Mobile tourist flow:

```text
h1: 24-30px
body: 16px
button: 16px
caption: 13-14px
```

## 7.4 Typography Rules

Do:

```text
Use clear hierarchy.
Use readable line-height.
Use larger text on mobile tourist flow.
Use tabular numbers for dashboard KPIs if possible.
```

Do not:

```text
Use tiny form labels.
Use too many font weights.
Use decorative fonts for body text.
```

---

## 8. Spacing System

Use consistent spacing based on 4px scale.

Recommended:

```text
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
4xl: 64px
```

Tourist mobile pages should use generous spacing:

```text
page padding: 16px to 20px
card padding: 16px to 24px
section gap: 24px
button height: 48px to 56px
```

Admin pages:

```text
page padding: 24px to 32px
table cell padding: 12px to 16px
filter gap: 12px
```

---

## 9. Border Radius

Recommended:

```text
small: 8px
medium: 12px
large: 16px
xl: 20px
2xl: 24px
full: 9999px
```

Usage:

```text
buttons: 12px to 16px
cards: 16px to 24px
certificate preview: 24px
badges: full
modals: 20px to 24px
```

Avoid overly round admin tables.

---

## 10. Shadow System

Use soft shadows.

Recommended:

```text
card: 0 8px 24px rgba(15, 23, 42, 0.06)
elevated: 0 16px 40px rgba(15, 23, 42, 0.12)
button-hover: 0 8px 18px rgba(13, 148, 136, 0.25)
```

Do not use harsh black shadows.

---

## 11. Component System

## 11.1 Core Components

Required reusable components:

```text
Button
IconButton
Input
Textarea
Select
SearchSelect
Checkbox
RadioGroup
ChipGroup
DateInput
FileUpload
ImagePreview
Card
SectionHeader
StatusBadge
Toast
ConfirmDialog
Modal
Drawer
Tabs
EmptyState
LoadingState
ErrorState
LanguageSwitcher
```

## 11.2 Data Components

Required for admin/dashboard:

```text
DataTable
Pagination
FilterBar
KpiCard
ChartCard
InsightCard
MetricTooltip
ExportButton
DateRangePicker
```

## 11.3 Tourist Flow Components

Required for tourist flow:

```text
StepProgress
QrLandingCard
ProfileMiniForm
PhotoUploadCard
CertificatePreview
CertificateDownloadCard
StampEarnedCard
PassportStampCard
SurveyStepCard
SavePassportPrompt
```

---

## 12. Button System

## 12.1 Button Variants

Required variants:

```text
primary
secondary
outline
ghost
danger
success
premium
```

## 12.2 Primary Button

Use for main action.

Examples:

```text
Create My Certificate
Upload Photo
Generate Certificate
Download Certificate
Save
```

Visual:

```text
teal background
white text
medium/large height
clear hover state
```

## 12.3 Premium Button

Use for reward actions.

Examples:

```text
Download Certificate
View My Passport
```

Visual:

```text
gold/teal gradient or gold accent
```

Use sparingly.

## 12.4 Danger Button

Use only for destructive actions.

Examples:

```text
Deactivate
Delete
Revoke
```

Requires confirmation.

## 12.5 Button Sizes

```text
sm: 36px height
md: 44px height
lg: 52px height
mobile CTA: 52-56px height
```

---

## 13. Card System

## 13.1 Tourist Cards

Characteristics:

```text
large radius
soft shadow
clear icon/image
short text
strong CTA
```

## 13.2 Attraction Cards

Show:

```text
image
name
province
type badge
short description
CTA
```

## 13.3 Admin Cards

Use for:

```text
KPI summaries
form sections
settings blocks
```

Admin cards should be clean and compact.

## 13.4 Dashboard Cards

Dashboard cards should show:

```text
metric title
metric value
comparison if available
definition tooltip
data freshness where needed
```

---

## 14. Badge System

Badge variants:

```text
published
draft
active
inactive
generated
completed
pending
approved
rejected
warning
info
```

Examples:

```text
Published
Active
Survey Completed
Certificate Generated
QR Inactive
```

Rules:

- Use consistent colors.
- Badges should be short.
- Do not use only color to communicate status.

---

## 15. Form System

## 15.1 Tourist Forms

Tourist forms should be:

```text
short
step-based
mobile-first
large controls
low typing
clear errors
```

## 15.2 Admin Forms

Admin forms should be:

```text
sectioned
clear
validated
save/cancel pattern
status-aware
```

## 15.3 Form Field Rules

Every field must have:

```text
label
description if needed
error state
disabled state if needed
```

Required fields must be marked.

---

## 16. Table System

Admin tables should support:

```text
search
filters
pagination
sorting optional
status badges
row actions
empty state
loading state
```

Do not load all records.

Recommended row actions:

```text
View
Edit
Deactivate
Copy URL
Manage
```

Use dropdown menu for many actions.

---

## 17. Dashboard Chart System

## 17.1 Chart Rules

Charts must have:

```text
title
short explanation
clear axes
legend if needed
empty state
loading state
metric definition tooltip
```

## 17.2 Recommended Chart Types

```text
bar chart for categories
line chart for trends
donut chart for small distributions only
table for ranked insights
KPI cards for summary
```

Avoid too many pie charts.

---

## 18. Icon System

Recommended:

```text
Lucide icons
```

Use icons consistently.

Examples:

```text
MapPin for location
QrCode for check-in
Camera for photo
Award for certificate
Stamp for stamp
BarChart for dashboard
Download for export
Shield for privacy
Globe for language
```

Icons support meaning but should not replace text in critical actions.

---

## 19. Motion and Animation

Use subtle animation only.

Good:

```text
fade in
slide up
button hover
stamp earned celebration
loading skeleton
```

Avoid:

```text
excessive bouncing
slow animations
distracting effects
animations that block task completion
```

Stamp earned animation can be slightly celebratory.

---

## 20. Layout Patterns

## 20.1 Public Layout

```text
top navigation
hero section
content sections
card grid
footer
```

## 20.2 Tourist Flow Layout

```text
mobile container
progress indicator
main card
sticky bottom CTA
minimal navigation
```

## 20.3 Admin Layout

```text
sidebar
top bar
page header
filter bar
table/form/card grid
```

## 20.4 Dashboard Layout

```text
filter bar
KPI grid
main chart grid
insight tables
export/actions
```

---

## 21. Empty State Design

Empty state should include:

```text
icon
title
short explanation
action button if useful
```

Examples:

```text
No attractions found.
No visits in this date range.
No stamps collected yet.
No survey responses yet.
```

---

## 22. Loading State Design

Use:

```text
skeleton cards
spinner for buttons
progress for uploads
clear text for generation
```

Examples:

```text
Loading attraction...
Uploading photo...
Creating your certificate...
Generating export...
```

---

## 23. Error State Design

Error state should include:

```text
friendly message
what user can do
retry button if useful
```

Do not show raw error.

Examples:

```text
This QR code is not available.
We could not upload your photo. Please try again.
Could not load dashboard data.
```

---

## 24. Certificate Visual Requirements

Certificate should feel:

```text
premium
personal
shareable
tourism-inspired
```

Required visual elements:

```text
uploaded photo
display name
attraction name
visit date
project branding
decorative accent
```

Recommended:

```text
1080 x 1350 portrait
soft gradient
gold accent
clean typography
```

Avoid:

```text
plain white rectangle
crowded text
too many logos
low contrast
```

---

## 25. Stamp Visual Requirements

Stamp should feel collectible.

Required elements:

```text
stamp image or icon
stamp name
attraction name
province
earned date
```

Stamp cards should be visually distinct from normal data cards.

Use gold or accent color sparingly.

---

## 26. Accessibility Standards

All components should support:

```text
keyboard navigation
focus styles
aria labels when needed
semantic HTML
input labels
alt text
sufficient contrast
screen-reader friendly errors
```

Touch targets:

```text
minimum 44px
```

---

## 27. Responsive Breakpoints

Use Tailwind defaults or similar:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Tourist flow must work well at:

```text
360px width
390px width
430px width
```

Admin dashboard must work well at desktop sizes.

---

## 28. Implementation Rules for Codex

When creating UI:

```text
Use reusable components.
Do not duplicate styling everywhere.
Use Tailwind utility classes consistently.
Keep pages readable.
Use semantic HTML.
Use loading/empty/error states.
Use TypeScript types.
Keep server data fetching separate from UI rendering when possible.
```

Avoid:

```text
inline random colors
hardcoded attraction data
unlabeled forms
huge page components
duplicate card styles
```

---

## 29. Design Review Checklist

Before accepting a UI screen:

```text
[ ] Visual style matches the system.
[ ] Main action is clear.
[ ] Mobile layout works.
[ ] Loading state exists.
[ ] Empty state exists.
[ ] Error state exists.
[ ] Text is readable.
[ ] Buttons are touch-friendly.
[ ] Forms are labeled.
[ ] Status badges are consistent.
[ ] Private data is not exposed.
[ ] Component is reusable if pattern repeats.
```

---

## 30. Final Design System Rule

Consistency is a feature.

A consistent design system makes the project feel production-ready and helps users trust the platform.
