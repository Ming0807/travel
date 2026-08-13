# Attraction Related Content Intelligence Design

## Goal

Turn the attraction detail page into a complete destination guide while keeping the admin workflow explicit, explainable, and safe for production data.

The system must connect each attraction to:

- nearby or relevant attractions;
- restaurants;
- accommodations; and
- directly related travel stories.

It must never invent relationships, show demo content, or silently replace an editor's curated choices.

## Product Decisions

Each related-content section has one of four modes:

| Mode | Public behavior | Admin behavior |
| --- | --- | --- |
| `automatic` | Rank eligible candidates using deterministic rules. | Explain why each item is suggested and allow preview. |
| `manual` | Show only the editor's ordered selections. | Preserve unavailable selections with a warning until removed. |
| `hybrid` | Show ordered selections first, then fill remaining slots automatically. | Clearly separate curated and suggested items. |
| `hidden` | Do not render the section or navigation item. | Keep saved selections so the section can be restored later. |

Backward compatibility is deterministic:

- an attraction with existing relation rows and no settings row behaves as `manual`;
- an attraction without relation rows and no settings row behaves as `automatic`;
- existing relation order remains authoritative;
- an unpublished curated item is omitted publicly, but is not silently replaced in `manual` mode;
- a section with no eligible items is hidden publicly and shown as incomplete in admin.

## Public Information Architecture

The attraction detail page uses this order:

1. Overview
2. Nearby attractions
3. Restaurants
4. Accommodations
5. Related stories
6. Travel tips
7. How to get there
8. Reviews

Only sections with real content appear in the public navigation. On mobile, related content uses a horizontal rail with the next card visibly peeking into the viewport. On desktop, it becomes a stable four-column grid.

Each automatically selected card must show a concise Thai reason, for example:

- `อยู่ห่างประมาณ 1.8 กม.`
- `อยู่ในอำเภอเดียวกัน`
- `หมวดหมู่ใกล้เคียงกัน`
- `เรื่องราวที่กล่าวถึงสถานที่นี้`

When coordinates are unavailable, the UI must say `อยู่ในพื้นที่เดียวกัน`; it must not claim that an item is nearby.

## Eligibility Rules

All recommended records must:

- exist in the production database;
- be published and active;
- be allowed by the current destination launch scope;
- have a usable Thai or English title and public slug;
- not be a mock, demo, or sample record;
- not duplicate another selected result; and
- not point back to the source attraction where that would create a self-link.

Curated items use the same public eligibility checks. An ineligible curated record stays visible to admins with a status warning, but never leaks onto the public page.

## Deterministic Ranking

Automatic ranking is performed in typed server code. Database queries produce bounded candidate sets; they do not fetch full content tables into memory.

### Related Attractions

| Signal | Weight |
| --- | ---: |
| Distance when both coordinates exist | 40 |
| Same district | 25 |
| Shared attraction category | 25 |
| Content readiness | 10 |

Distance scoring is monotonic and capped. When coordinates are missing, distance contributes zero and the explanation falls back to area or category evidence.

### Restaurants

| Signal | Weight |
| --- | ---: |
| Verified attraction relation | 50 |
| Distance when coordinates exist | 30 |
| Same district or province | 20 |

### Accommodations

| Signal | Weight |
| --- | ---: |
| Distance when coordinates exist | 50 |
| Same district or province | 25 |
| Content readiness | 25 |

### Stories

Stories must have a direct verified attraction relation. Matching only the province is not enough. Freshness and publication readiness may order verified candidates, but cannot create a relationship.

All rankings use stable tie-breakers so the same data produces the same order.

## Admin UX

Related content is managed in one workspace instead of four unrelated drawers. The workspace contains four section tabs, each with:

- a four-option mode control;
- selected items with real move-up/move-down ordering controls;
- server-side search with pagination;
- published, active, and unavailable status badges;
- automatic suggestion preview with reasons;
- an item limit control;
- dirty-state Save and Cancel actions; and
- a clear link to edit the selected content record.

There is no fake drag handle. Search results never load every attraction, restaurant, accommodation, or story at once. Thai labels are primary; internal entity names remain implementation details.

The attraction editor also enforces single field ownership:

- Header owns names, slug, and short descriptions;
- Content owns descriptions, history, travel tips, and directions copy;
- Location owns address, coordinates, opening hours, and contact details;
- Settings owns geography, categories, capacity, active state, and publication state;
- Media owns cover, gallery, and virtual-tour media; and
- Related content owns only the four relationship sections and their modes.

The create screen collects the minimum metadata needed to create a draft. It is not a second full CMS form. No edit workspace asks the admin to enter the same value in multiple drawers.

## Data Model

Add `attraction_related_content_settings` with one row per attraction and content type:

- `attraction_id`
- `content_type`: `attractions`, `restaurants`, `accommodations`, or `stories`
- `mode`: `automatic`, `manual`, `hybrid`, or `hidden`
- `max_items`
- timestamps

The four existing relation tables remain the ordered curated-selection source. A new transactional RPC synchronizes settings and ordered relations together. It validates source and target existence, rejects self-links, de-duplicates IDs while preserving order, and raises database errors instead of returning a false-success JSON payload.

The migration is backward compatible and can be applied before the application release. Until it is applied, public reads derive the legacy mode from existing relation rows.

## Performance And Failure Isolation

- Candidate queries are bounded and indexed by source, target, status, geography, and publication fields.
- Public recommendation failures are isolated per section; one unavailable relation type must not take down the entire attraction detail page.
- Existing exact curated lookups never backfill unrelated latest records.
- Public pages retain ISR behavior and return serializable read models only.
- Admin search is server-side and debounced; no full-table picker payload is sent to the browser.

## Acceptance Criteria

1. Existing curated relationships render in the same order after migration.
2. Empty legacy relationships become automatic without requiring an immediate admin edit.
3. Manual mode never fills missing slots with unrelated content.
4. Hybrid mode preserves curated order and fills only the remaining slots.
5. Hidden and empty sections do not appear in public navigation.
6. Every automatic result has a truthful, deterministic reason.
7. Unpublished or inactive records never render publicly.
8. Admin save cannot report success when the database RPC reports failure.
9. Admin search is paginated and does not load complete content tables.
10. Mobile and desktop layouts remain usable, accessible, and visually consistent with the public design system.
11. Public attraction detail continues to work before and after the migration is applied.
12. The migration is documented but is not run automatically by application code.
