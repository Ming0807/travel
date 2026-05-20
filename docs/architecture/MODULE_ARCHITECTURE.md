# MODULE_ARCHITECTURE.md

## 1. Purpose

This document describes how the 13 system modules are organized, their dependencies, and interaction patterns.

---

## 2. Module Dependency Map

```text
                    ┌──────────────┐
                    │ M01: Public   │
                    │ Attractions   │
                    └──────┬───────┘
                           │
┌──────────────┐    ┌──────▼───────┐    ┌──────────────┐
│ M13: Official │    │ M02: QR       │    │ M12: LINE    │
│ Data Import   │    │ Check-in      │    │ LIFF (opt)   │
└──────────────┘    └──────┬───────┘    └──────┬───────┘
                           │                    │
                    ┌──────▼───────┐            │
                    │ M03: Tourist  │◀───────────┘
                    │ Profile       │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ M04: Visit    │
                    │ Record        │
                    └──┬───┬───┬───┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            ▼              ▼              ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │ M05: Photo    │ │ M06: Cert │ │ M07: Stamp   │
    │ Upload        │ │ Generate  │ │ & Passport   │
    └──────────────┘ └──────────┘ └──────────────┘
                           │
                    ┌──────▼───────┐
                    │ M08: Survey   │
                    │ Expense/Sat.  │
                    └──────────────┘

    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ M09: Admin    │ │ M10: Dash    │ │ M11: Report  │
    │ CMS           │ │ Analytics    │ │ Export       │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. Module Definitions

### M01: Public Attractions
- **Depends on:** Database (attractions, images, provinces)
- **Depended by:** M02 (QR resolves to attraction)
- **Type:** Read-only presentation

### M02: QR Check-in
- **Depends on:** M01 (attraction data), Database (checkin_codes)
- **Depended by:** M03 (initiates tourist flow)
- **Type:** Entry point + routing

### M03: Tourist Profile
- **Depends on:** Database (tourists, identities)
- **Depended by:** M04, M06, M07, M12
- **Type:** Identity management + CRUD

### M04: Visit Record
- **Depends on:** M03 (tourist), M01 (attraction), M02 (check-in code)
- **Depended by:** M05, M06, M07, M08
- **Type:** Core data creation

### M05: Photo Upload
- **Depends on:** M04 (visit), Storage
- **Depended by:** M06 (photo for certificate)
- **Type:** File handling

### M06: Certificate Generation
- **Depends on:** M04 (visit), M05 (photo), Templates
- **Depended by:** M08 (survey shown after certificate)
- **Type:** Rendering + storage

### M07: Digital Stamp & Passport
- **Depends on:** M03 (tourist), M04 (visit), Database (stamp_definitions)
- **Type:** Gamification + engagement

### M08: Survey, Expense, Satisfaction
- **Depends on:** M04 (visit), M06 (must complete certificate first)
- **Type:** Optional data collection

### M09: Admin CMS
- **Depends on:** Auth, Database (all admin tables)
- **Type:** Content management

### M10: Dashboard Analytics
- **Depends on:** Database (all data tables, summary tables)
- **Type:** Data visualization

### M11: Report Export
- **Depends on:** Database, Auth (permission check)
- **Type:** Data output

### M12: LINE LIFF (Optional)
- **Depends on:** M03 (tourist identity linking), LINE Platform
- **Type:** External integration

### M13: Official Data Import
- **Depends on:** Database, Auth
- **Type:** Reference data management

---

## 4. Module Communication

Modules communicate through:

1. **Shared database:** All modules read/write to the same PostgreSQL database
2. **Service layer:** Services are called directly (no inter-module HTTP calls)
3. **Server actions:** UI components invoke server actions that use services
4. **Props/Context:** React components pass data via props and context

**No message queues or event buses in MVP.** Direct service calls keep the architecture simple.

---

## 5. Module Implementation Priority

| Phase | Modules | Rationale |
|---|---|---|
| Phase 1 | M01, M02, M03, M04, M05, M06, M09 | Core tourist flow + admin setup |
| Phase 2 | M07, M08, M10, M11 | Engagement + analytics |
| Phase 3 | M12, M13 | Optional integrations |
