# Attraction Rich Image Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve intentional rich-content spacing and let admins control inline attraction image size and alignment.

**Architecture:** Add a shared layout-value contract, extend the existing Tiptap image node with validated HTML attributes, and render those attributes through the server sanitizer. A shared CSS class applies the same layout in the editor, admin preview, and public page.

**Tech Stack:** TypeScript, React, Tiptap 3, Tailwind CSS 4, sanitize-html, Vitest, Testing Library.

## Global Constraints

- No database migration.
- Existing images default to full width and centered.
- Only managed Media Library images are rendered.
- Mobile images use full content width and cannot overflow.
- Multi-image rows and drag resizing are outside this hotfix.

---

### Task 1: Image layout contract and sanitizer

**Files:**
- Create: `lib/content/rich-image-layout.ts`
- Modify: `lib/content/admin-rich-html.ts`
- Test: `tests/unit/attraction-rich-content.test.tsx`

**Interfaces:**
- Produces: `RichImageSize`, `RichImageAlign`, `normalizeRichImageSize`, and `normalizeRichImageAlign`.
- Sanitizer emits `data-image-size` and `data-image-align` using normalized values only.

- [x] Write failing tests for valid, missing, and invalid layout attributes.
- [x] Run `npx vitest run tests/unit/attraction-rich-content.test.tsx --maxWorkers=1` and verify failure.
- [x] Implement the shared layout contract and sanitizer transformation.
- [x] Run the targeted test and verify it passes.

### Task 2: Tiptap insertion and existing-image controls

**Files:**
- Modify: `components/admin/forms/FormRichText.tsx`
- Modify: `components/admin/attractions/AttractionForm.tsx`
- Modify: `components/admin/attractions/visual-editor/SectionForms.tsx`
- Test: `tests/unit/form-rich-text-media.test.tsx`

**Interfaces:**
- `FormRichText` consumes `imageLayoutControls?: boolean`.
- Managed image HTML emits `data-image-size` and `data-image-align`.

- [x] Write failing tests for insertion metadata, a trailing editable paragraph, and layout controls.
- [x] Run `npx vitest run tests/unit/form-rich-text-media.test.tsx --maxWorkers=1` and verify failure.
- [x] Add image-node attributes, modal segmented controls, and selected-image toolbar controls.
- [x] Enable the controls only on attraction rich-content forms.
- [x] Run the targeted test and verify it passes.

### Task 3: Shared editor and public layout

**Files:**
- Modify: `app/globals.css`
- Modify: `components/attractions/AttractionRichContent.tsx`
- Modify: `components/admin/attractions/visual-editor/AttractionVisualEditor.tsx`
- Test: `tests/unit/attraction-rich-content.test.tsx`

**Interfaces:**
- Produces: `.rich-content-media` behavior shared by editor, preview, and public content.

- [x] Write a failing source/render regression assertion for the shared class and empty-paragraph contract.
- [x] Add responsive width, alignment, spacing, selection, and empty-paragraph styles.
- [x] Apply the shared class to all three rendering surfaces.
- [x] Run focused tests, lint, typecheck, full tests, and production build.
