# SEQUENCE_FLOWS.md

## 1. Purpose

This document provides sequence diagrams for the major system flows.

---

## 2. QR Check-in Flow

```text
Tourist          Browser          Server           Database        Storage
  │                │                │                │               │
  │  Scan QR       │                │                │               │
  │───────────────▶│                │                │               │
  │                │ GET /c/[code]  │                │               │
  │                │───────────────▶│                │               │
  │                │                │  Query checkin  │               │
  │                │                │  _codes         │               │
  │                │                │───────────────▶│               │
  │                │                │  Return code +  │               │
  │                │                │  attraction     │               │
  │                │                │◀───────────────│               │
  │                │                │  Insert funnel  │               │
  │                │                │  _event         │               │
  │                │                │───────────────▶│               │
  │                │  Landing page  │                │               │
  │                │◀───────────────│                │               │
  │  View page     │                │                │               │
  │◀───────────────│                │                │               │
```

---

## 3. Certificate Creation Flow

```text
Tourist          Browser          Server           Database        Storage
  │                │                │                │               │
  │  Tap "Create   │                │                │               │
  │  Certificate"  │                │                │               │
  │───────────────▶│                │                │               │
  │                │                │                │               │
  │  Select photo  │                │                │               │
  │───────────────▶│                │                │               │
  │                │ Upload photo   │                │               │
  │                │───────────────▶│                │               │
  │                │                │  Validate file  │               │
  │                │                │  Upload file    │               │
  │                │                │──────────────────────────────▶│
  │                │                │  Store metadata  │              │
  │                │                │───────────────▶│               │
  │                │  Show preview  │                │               │
  │                │◀───────────────│                │               │
  │                │                │                │               │
  │  Fill form +   │                │                │               │
  │  submit        │                │                │               │
  │───────────────▶│                │                │               │
  │                │ Server action  │                │               │
  │                │───────────────▶│                │               │
  │                │                │  Validate form  │               │
  │                │                │  Upsert tourist │               │
  │                │                │───────────────▶│               │
  │                │                │  Insert visit   │               │
  │                │                │───────────────▶│               │
  │                │                │  Log consent    │               │
  │                │                │───────────────▶│               │
  │                │                │  Render cert    │               │
  │                │                │  Upload cert    │               │
  │                │                │──────────────────────────────▶│
  │                │                │  Insert cert    │               │
  │                │                │  record         │               │
  │                │                │───────────────▶│               │
  │                │                │  Check stamp    │               │
  │                │                │  uniqueness     │               │
  │                │                │───────────────▶│               │
  │                │                │  Insert stamp   │               │
  │                │                │───────────────▶│               │
  │                │  Certificate   │                │               │
  │                │  preview +     │                │               │
  │                │  download link │                │               │
  │                │◀───────────────│                │               │
  │  Download cert │                │                │               │
  │◀───────────────│                │                │               │
```

---

## 4. Returning Tourist Flow

```text
Tourist          Browser          Server           Database
  │                │                │                │
  │  Scan QR       │                │                │
  │───────────────▶│                │                │
  │                │ Read guest     │                │
  │                │ token from     │                │
  │                │ localStorage   │                │
  │                │                │                │
  │                │ GET /c/[code]  │                │
  │                │ + guest_token  │                │
  │                │───────────────▶│                │
  │                │                │  Resolve code   │
  │                │                │───────────────▶│
  │                │                │  Find identity  │
  │                │                │  by token       │
  │                │                │───────────────▶│
  │                │                │  Load tourist   │
  │                │                │  profile        │
  │                │                │◀───────────────│
  │                │  "Welcome back │                │
  │                │   [name]!"     │                │
  │                │  Pre-filled    │                │
  │                │  form          │                │
  │                │◀───────────────│                │
  │  Confirm +     │                │                │
  │  submit        │                │                │
  │───────────────▶│                │                │
  │                │                │  New visit      │
  │                │                │  (not new       │
  │                │                │   tourist)      │
  │                │                │───────────────▶│
```

---

## 5. Identity Linking Flow

```text
Tourist          Browser          LINE/Email       Server           Database
  │                │                │                │                │
  │  Tap "Save     │                │                │                │
  │  Passport"     │                │                │                │
  │───────────────▶│                │                │                │
  │                │  Choose LINE   │                │                │
  │                │───────────────▶│                │                │
  │                │                │  LINE Auth      │                │
  │                │                │◀──────────────▶│                │
  │                │                │  Return token   │                │
  │                │◀───────────────│                │                │
  │                │  Send LINE ID  │                │                │
  │                │───────────────────────────────▶│                │
  │                │                │                │  Check if LINE │
  │                │                │                │  already linked│
  │                │                │                │───────────────▶│
  │                │                │                │  Add identity  │
  │                │                │                │  to existing   │
  │                │                │                │  tourist       │
  │                │                │                │───────────────▶│
  │                │  "Passport     │                │                │
  │                │   saved!"      │                │                │
  │                │◀──────────────────────────────│                │
```

---

## 6. Admin Dashboard Flow

```text
Admin            Browser          Server           Database
  │                │                │                │
  │  Open /admin   │                │                │
  │  /dashboard    │                │                │
  │───────────────▶│                │                │
  │                │ Server render  │                │
  │                │───────────────▶│                │
  │                │                │  Verify JWT     │
  │                │                │  Check role     │
  │                │                │                │
  │                │                │  Query summary  │
  │                │                │  tables         │
  │                │                │───────────────▶│
  │                │                │  Aggregate      │
  │                │                │  metrics        │
  │                │                │◀───────────────│
  │                │  Dashboard     │                │
  │                │  with charts   │                │
  │                │◀───────────────│                │
  │                │                │                │
  │  Apply filter  │                │                │
  │  (province)    │                │                │
  │───────────────▶│                │                │
  │                │ Re-query with  │                │
  │                │ filter params  │                │
  │                │───────────────▶│                │
  │                │                │  Filtered query │
  │                │                │───────────────▶│
  │                │  Updated       │                │
  │                │  charts        │                │
  │                │◀───────────────│                │
```
