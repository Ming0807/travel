# AUTHENTICATION_ARCHITECTURE.md

## 1. Purpose

This document describes the authentication and identity architecture for both tourists and admin users.

---

## 2. Dual Identity Model

The system has two separate identity systems:

```text
┌────────────────────────┐    ┌────────────────────────┐
│   TOURIST IDENTITY      │    │   ADMIN IDENTITY        │
│   (No auth required)    │    │   (Supabase Auth)       │
│                         │    │                         │
│   ┌──────────────────┐  │    │   ┌──────────────────┐  │
│   │ anonymous_device  │  │    │   │ email/password    │  │
│   │ line (optional)   │  │    │   │ JWT session       │  │
│   │ email (optional)  │  │    │   │ role-based        │  │
│   └──────────────────┘  │    │   └──────────────────┘  │
│                         │    │                         │
│   tourists table        │    │   users table           │
│   tourist_identities    │    │   user_roles            │
└────────────────────────┘    └────────────────────────┘
```

---

## 3. Tourist Identity

### 3.1 Guest Identity (Primary)

```text
Flow:
1. Tourist opens check-in page
2. System checks localStorage for existing guest_token
3. If not found → generate UUID v4 → store in localStorage
4. Send guest_token as header with requests
5. Server looks up tourist_identities WHERE
   provider = 'anonymous_device' AND provider_key = guest_token
6. If found → load tourist profile
7. If not found → create new tourist + identity on form submit
```

**Storage:** Browser localStorage (`sbdt_guest_token`)

**Persistence:** Survives browser sessions, cleared on cache clear

### 3.2 LINE Identity (Optional)

```text
Flow:
1. Tourist chooses "Save passport with LINE"
2. LIFF SDK initializes
3. Tourist authorizes LINE access
4. System receives LINE user ID + profile
5. System creates tourist_identity with provider = 'line'
6. If guest identity exists → link to same tourist_id
7. Future visits via LINE → tourist recognized cross-device
```

### 3.3 Email Identity (Optional)

```text
Flow:
1. Tourist chooses "Save passport with email"
2. Tourist enters email address
3. System sends magic link (or simple verification)
4. Tourist confirms email
5. System creates tourist_identity with provider = 'email'
6. If guest identity exists → link to same tourist_id
```

### 3.4 Identity Merging

When a guest tourist links Google or LINE:

```text
Before:
    tourist_id: 123
    identities: [{ provider: 'anonymous_device', key: 'uuid-abc' }]

After linking LINE:
    tourist_id: 123
    identities: [
        { provider: 'anonymous_device', key: 'uuid-abc' },
        { provider: 'line', key: 'U1234567890' }
    ]
```

**Critical rule:** Never create a new tourist profile when linking. Always merge to existing.

### 3.5 Identity Conflict Resolution

| Scenario | Resolution |
|---|---|
| Guest links LINE, LINE already exists for another tourist | Show conflict, ask tourist to choose |
| Same Google account used by different guest tokens | Merge visits to Google-linked tourist |
| Multiple devices, same LINE | All resolve to same tourist_id |
| Guest token lost (cache cleared) | Tourist can recover via Google or LINE if previously linked |

---

## 4. Admin Authentication

### 4.1 Login Flow

```text
1. Admin navigates to /admin/login
2. Admin enters email + password
3. Supabase Auth validates credentials
4. JWT issued and stored in httpOnly cookie
5. Redirect to /admin dashboard
```

### 4.2 Session Management

| Aspect | Implementation |
|---|---|
| Token storage | httpOnly cookie (not localStorage) |
| Token lifetime | 1 hour (refreshable) |
| Refresh | Automatic via Supabase client |
| Logout | Clear cookie + revoke session |

### 4.3 Route Protection

```text
middleware.ts:
    For /admin/* routes:
        1. Check for valid Supabase session
        2. If no session → redirect to /admin/login
        3. If session exists → allow access
        4. Role check in page-level server component
```

### 4.4 Role-Based Authorization

```text
After auth middleware passes:
    1. Load user_roles for authenticated user
    2. Check if user has required role for the page/action
    3. If insufficient role → show 403 page
    4. If authorized → proceed
```

---

## 5. Database Schema

```text
-- Tourist identity
tourist_identities
    identity_id     UUID PK
    tourist_id      UUID FK → tourists
    provider        TEXT ('anonymous_device' | 'line' | 'email')
    provider_key    TEXT (device token | LINE user ID | email)
    provider_data   JSONB (LINE profile data, etc.)
    is_primary      BOOLEAN
    linked_at       TIMESTAMPTZ
    UNIQUE(provider, provider_key)

-- Admin identity
users
    user_id         UUID PK (Supabase Auth UID)
    email           TEXT UNIQUE
    display_name    TEXT
    is_active       BOOLEAN
    created_at      TIMESTAMPTZ

user_roles
    user_id         UUID FK → users
    role_id         UUID FK → roles
    assigned_at     TIMESTAMPTZ
    assigned_by     UUID FK → users
```

---

## 6. Security Considerations

| Concern | Mitigation |
|---|---|
| Guest token theft | Token only grants tourist-level access, no admin ops |
| JWT expiry | Auto-refresh with sliding window |
| CSRF | Server actions use built-in CSRF protection |
| Session fixation | New session on login |
| Brute force | Rate limiting on login endpoint |
| Role escalation | Role checks at database + application level |
