# PHASE_07_SURVEY_EXPENSE_SATISFACTION.md

## Status

Planned

## Objective

Collect optional post-certificate micro survey data for travel behavior, expenses, satisfaction, and sustainable tourism planning.

## Timing Rule

Survey must appear after certificate reward.

It must not block:

- certificate download
- stamp award
- guest passport
- sharing
- Google linking
- LINE linking

## Survey Topics

Optional micro survey may collect:

- travel companion
- group size
- transport mode
- travel purpose
- overnight or same-day trip
- number of nights
- spending range
- expense categories
- satisfaction score
- safety
- cleanliness
- accessibility
- information/signage
- value
- revisit intention
- recommendation intention
- optional comment

## UX Rules

- Use chips, segmented controls, sliders, rating buttons, and short optional comments.
- Use controlled values instead of free text where possible.
- Keep the survey short.
- Always provide skip.
- Missing satisfaction is `No data`, not `0`.
- Estimated spending is not revenue.

## Acceptance Criteria

- Survey appears only after certificate is available.
- Skip works and keeps certificate, stamp, visit, and passport progress.
- Survey links to visit and attraction.
- Dashboard can aggregate survey, expense, and satisfaction data.
- No sensitive personal data is required.

