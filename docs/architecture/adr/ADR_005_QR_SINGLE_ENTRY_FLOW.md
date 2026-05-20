# ADR-005: Single QR Entry Flow

## Status

Accepted

## Context

The system uses QR codes at attractions and photo spots to connect physical locations to the digital platform. A key design question:

> Should different QR codes be created for LINE users, guest users, foreign tourists, etc.?

## Decision

**Use one QR code per photo spot or attraction entry point.** Do not create separate QR codes for different identity types.

The QR code opens a neutral route:

```text
/c/[checkinCode]
```

The system then detects the context:

- Attraction and photo spot (from check-in code)
- Browser language (for Thai/English display)
- LINE environment (if opened inside LINE app)
- Existing guest token (for returning guest)
- Existing optional Google/LINE identity if authenticated
- Campaign (if encoded in check-in code)

The landing page adapts based on detected context and offers appropriate identity options.

The landing page must show attraction/photo spot context, certificate preview, privacy/trust cue, and a clear CTA such as "Create my certificate" before any form. It must not open a long form immediately.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Separate QR per identity type | Confusing for tourists, multiple QR codes at same spot |
| LINE-only QR (LIFF URL) | Excludes non-LINE users, blocks foreign tourists |
| Google-only QR | Adds login friction and excludes guest-first use |
| Deep link with parameters | Adds complexity, QR codes become longer |

## Consequences

**Positive:**
- One QR per location = simple physical setup
- All tourist types can use the same QR code
- Context detection happens automatically
- Easy to print, display, and manage QR codes
- Campaign tracking via check-in code, not QR variation
- QR scans can be analyzed as funnel events without being confused with visits

**Negative:**
- Landing page must handle multiple identity flows
- Context detection logic is more complex
- Cannot force LINE login via QR (but this is by design)
- Cannot force Google login via QR (also by design)
