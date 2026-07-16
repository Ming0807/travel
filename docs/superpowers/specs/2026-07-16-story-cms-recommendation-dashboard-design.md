# Story CMS, Content Recommendation, and Admin Dashboard Design

Status: Approved for P2 implementation
Date: 2026-07-16
Priority boundary: P2 only. Existing P0 and P1 production work remains unchanged.

## 1. Purpose

This design turns the existing travel story feature into a production-oriented editorial platform, adds an explainable content recommendation system, and gives the admin area a clearer operational and analytical hierarchy.

The work supports the project's main objective: build a trustworthy southern-border tourism data platform that helps tourists discover useful local content and helps staff improve content and tourism planning.

## 2. Decisions

### 2.1 Separate the two admin dashboards

- `/admin` is the operational command center. It answers: "What needs attention today?"
- `/admin/dashboard` is the analytics center. It answers: "What does the tourism data mean?"

The operational page may show counts, queues, readiness, and direct actions. It must not duplicate the full analytical charts.

### 2.2 Share one content platform, but separate workflows

- Editorial stories use draft, review, approval, scheduling, publishing, and archive states.
- Tourist stories use submission, moderation, change request, approval, publishing, rejection, and archive states.
- Both use shared media, taxonomy, search, public rendering, relationships, and recommendation infrastructure.

Editorial and tourist submissions must not be mixed into one undifferentiated work queue.

### 2.3 Use hybrid structured content

The editor behaves like a rich-text editor, while the canonical document is structured TipTap JSON. A sanitized HTML representation is retained for rendering and compatibility with existing stories.

Supported first-release blocks:

- paragraph and headings
- ordered and unordered lists
- links
- inline images from Media Library
- figure caption and alt text
- quote or callout
- divider

Gallery, attraction callout, route callout, table, and embed blocks are extension points. Arbitrary scripts, iframes, inline event handlers, and unmanaged external media are not allowed.

### 2.4 Use explainable hybrid recommendations

The first production recommendation engine is curated plus deterministic scoring. It is not labeled AI.

Priority order:

1. Explicit editorial relationship
2. Same province
3. Shared attraction or route relationship
4. Shared topics or tags
5. Same content category
6. Freshness and content readiness
7. Privacy-safe engagement after enough samples exist

Every recommendation result carries reason keys such as `editor_selected`, `same_province`, or `shared_topic`. Public UI may translate one reason into a short Thai label.

### 2.5 Keep P0 and P1 frozen

This design does not replace or delay production release gates, migration drift checks, QR-to-certificate verification, storage privacy, backup, rollback, or staging work. Those remain separate priorities and are not modified in this P2 stream.

## 3. Current-State Findings

The existing system already has:

- admin story list, create, edit, publish, unpublish, and export
- TipTap rich-text editing
- story cover selection from Media Library
- editorial and tourist-authored stories
- public story list and detail pages
- attraction-to-story curated relationships
- permission checks and audit logging

Important gaps:

- the story schema is limited to title, slug, excerpt, HTML content, province, category, cover, and status
- public related stories are currently selected from the latest published stories rather than relevance
- no structured taxonomy, SEO metadata, scheduled publishing, revision recovery, or table of contents
- editorial and UGC workflows are visually mixed
- list filters do not cover author type, province, topic, date, readiness, or moderation state
- the visual editor contains planned English placeholders and does not yet match a full editorial workflow
- dashboard information is accurate but distributed across many equally weighted tabs
- current UI documentation does not describe the intended P2 content platform

## 4. Information Architecture

### 4.1 Operational command center: `/admin`

Desktop order:

1. Page heading, global search, and primary create action
2. Four compact operational KPIs
3. "งานที่ต้องจัดการ" priority queue
4. Content readiness and publishing schedule
5. Recent activity and shortcuts

Recommended KPIs:

- รอตรวจเนื้อหา
- ร่างที่ยังไม่พร้อมเผยแพร่
- เนื้อหาที่กำหนดเผยแพร่
- ปัญหาเนื้อหาและสื่อ

The page should adopt the reference image's calm density, restrained sidebar, compact metrics, and clear task list. It should not copy project-management concepts that do not belong to tourism administration.

### 4.2 Analytics center: `/admin/dashboard`

Desktop order:

1. Title, data freshness, and export
2. Sticky filter bar
3. Four executive KPIs
4. Main trend with comparison
5. Province and attraction distribution
6. Decision alerts and recommended actions
7. Funnel, satisfaction, spending, and sustainability drill-downs

The first viewport should answer:

- How much platform participation was recorded?
- Is participation rising or falling?
- Which province or attraction needs attention?
- Is the sample sufficient to interpret?

Dashboard rules remain unchanged: QR scans are not visits, estimated spending is not revenue, missing satisfaction is not zero, and local platform participation is not official arrivals.

### 4.3 Story administration

Primary routes:

- `/admin/stories` editorial library
- `/admin/stories/submissions` tourist submission moderation
- `/admin/stories/new` editorial creation
- `/admin/stories/[id]/edit` editorial studio
- `/admin/stories/[id]/revisions` revision history
- `/admin/stories/taxonomy` topics and tags

The story library provides saved views or tabs for Draft, In review, Scheduled, Published, and Archived. The UGC queue provides Submitted, In review, Changes requested, Approved, Published, and Rejected.

## 5. Content Model

### 5.1 Extend `travel_stories`

The existing table remains the content identity to avoid a high-risk rename.

Planned fields:

- `content_document jsonb`
- `content_schema_version integer`
- `primary_language varchar`
- `seo_title varchar`
- `seo_description varchar`
- `scheduled_at timestamptz`
- `first_published_at timestamptz`
- `archived_at timestamptz`
- `reviewed_by uuid`
- `reviewed_at timestamptz`
- `reading_minutes integer`
- `content_quality_score integer`

`status` is canonical. `is_published` remains temporarily for compatibility and must be synchronized by database logic or a single repository mutation path.

### 5.2 Taxonomy

- `story_topics`: controlled high-level subjects such as nature, culture, food, community, and travel guide
- `story_tags`: reusable specific labels
- `story_tag_links`: many-to-many story/tag relation

Categories should not remain unconstrained free text after migration. Existing category values are mapped to a controlled topic or retained as a legacy label until reviewed.

### 5.3 Revisions and review history

- `story_revisions` stores immutable snapshots of editorial fields and structured content
- revisions record actor, source action, schema version, and creation time
- revision access requires story read permission; restore requires story update permission
- the audit log remains the security record, while revisions are the editor recovery record

### 5.4 Curated recommendations

- `story_recommendations` stores source story, target story, order, optional reason, active status, and editor identity
- self-links and duplicate links are rejected
- only published, public-ready targets are returned publicly

### 5.5 Engagement

First release events:

- story impression
- story open
- related-content click
- meaningful read completion

Do not store email, LINE identifier, provider user ID, guest token, raw IP, tourist ID, or visit ID in content engagement events. Use a short-lived, rotating anonymous session hash only if deduplication is necessary. Aggregate and expire raw events according to the retention policy.

## 6. Workflow Rules

### 6.1 Editorial

`draft -> in_review -> approved -> scheduled|published -> archived`

- authors may edit drafts
- reviewers cannot silently publish incomplete content
- scheduling requires a future timestamp and publish-ready content
- returning to draft clears approval but does not erase revision history

### 6.2 Tourist submissions

`submitted -> in_review -> changes_requested|approved|rejected -> published -> archived`

- tourist UGC remains plain text or a restricted structured subset
- tourist content never renders through unrestricted HTML
- moderation decisions require a reason for rejection or change request
- public pages distinguish traveler stories from editorial articles

### 6.3 Readiness gates

Publishing requires:

- title and unique slug
- excerpt
- valid content document or sanitized legacy content
- active cover media with alt text
- province or explicit cross-province scope
- topic
- SEO description or an explicitly generated fallback
- no unresolved blocking content-health issue

## 7. Recommendation Service

### 7.1 Candidate filtering

Exclude:

- current story
- unpublished, scheduled-future, archived, or rejected stories
- inactive or missing-cover content when the target surface requires an image
- manually excluded relationships

### 7.2 Score

Initial deterministic weights:

- curated relationship: fixed top priority
- same province: 30
- shared attraction/route: 25
- tag overlap: up to 20
- same topic: 10
- freshness: up to 10
- quality/readiness: up to 5
- engagement: up to 10 only after minimum sample threshold

Weights are configuration, not UI settings in the first release. The service must apply diversity rules so one topic or province does not occupy every slot when alternatives exist.

### 7.3 Fallback

If no scored candidates exist, return the latest public-ready editorial stories. Never fabricate recommendations or return unpublished records.

## 8. UX and Visual System

- Thai-first labels; English only where the active locale requires it
- 8px maximum card radius unless an existing component standard requires otherwise
- no nested cards for page sections
- use white, slate, teal, coral, and gold with restrained contrast; do not make the interface a one-hue green dashboard
- icons represent actions; text buttons are reserved for explicit commands
- fixed chart heights and stable grid tracks prevent layout shift
- desktop sidebar remains compact; mobile uses a focus-safe drawer
- tables have a mobile card or condensed row strategy
- all async actions expose loading, success, error, retry, and unsaved-change states
- charts have text summaries, tooltips, keyboard-readable legends, and table drill-downs

## 9. Security and Privacy

- server-side Zod validation for every mutation and filter
- permissions enforced in server actions and route handlers, never UI only
- sanitization occurs server-side before HTML is stored or rendered
- UGC and editorial HTML policies remain separate
- no raw personal identifiers in recommendation events, dashboards, or default exports
- all publish, moderation, restore, taxonomy, and curated recommendation changes are audited
- public recommendation endpoints return public DTOs only

## 10. Performance

- server-side pagination and filtering for story libraries and moderation queues
- targeted indexes for status, author type, province, scheduled time, and publication time
- cache public story list/detail and deterministic recommendations with explicit invalidation after publish changes
- use thumbnails for story cards and full optimized media for detail content
- lazy-load below-fold images and dashboard drill-downs
- dashboard charts receive aggregated payloads, never unrestricted raw rows

## 11. Testing

Required automated coverage:

- migration constraints and compatibility mapping
- workflow transition matrix
- permission matrix
- revision creation and restore
- structured document validation and sanitization
- scheduled publication eligibility
- recommendation filtering, scoring, ordering, diversity, and fallback
- public DTO privacy
- editorial and UGC list filters
- operational dashboard queues
- dashboard metric presentation and no-data rules
- responsive and accessibility tests
- Playwright editorial create-review-publish journey using staging data

## 12. Delivery Slices

1. Documentation and contracts
2. Database/content-domain foundation
3. Editorial library and workflow
4. Structured editor and revision recovery
5. Public Blog/Story experience
6. Explainable recommendations
7. Operational admin command center
8. Analytics dashboard visual hierarchy
9. Production QA, performance, accessibility, and rollout

Each slice must be independently testable and must not claim later slices are implemented.

## 13. Acceptance Criteria

- Admin can distinguish editorial work from traveler submissions immediately.
- Admin can create, preview, review, schedule, publish, archive, and recover a story without editing raw storage paths.
- Public story pages render structured content, table of contents, correct media, and relevant recommendations.
- Recommendation results are explainable and never include unpublished content.
- `/admin` prioritizes operational work; `/admin/dashboard` prioritizes analytical decisions.
- Dashboard remains Thai-first, responsive, privacy-safe, and metrically honest.
- UI documentation and task status match the implemented system.
