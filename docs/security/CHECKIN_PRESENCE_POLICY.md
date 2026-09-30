# Check-in presence and reward policy

Updated: 30 September 2026. Supports attraction visit data quality and tourist engagement.

## Enforced now

- `/checkin/try` is a static instruction page. It performs no database lookup,
  starts no check-in session and creates no Visit, certificate, stamp or XP.
- Codes with the reserved `Demo QR:` label are unavailable through QR, NFC,
  direct landing and minimal-profile submission. Keep this label on synthetic
  seed codes; removing it deliberately promotes a code into real collection.
- The existing Visit owner query includes the code label. The certificate API
  and service reject owned demo Visits, including historical demo Visits. The
  API rejects them before upload or stamp award. Already-issued owner downloads
  remain available; historical demo analytics are not deleted or backfilled.
- With `CHECKIN_ENTRY_SESSIONS_ENABLED=true`, deleting the `flow` query or
  `entrySessionId` field cannot downgrade to legacy collection. The
  browser-bound, code-bound session must be current, match its exact ID and
  match the live attraction/photo-spot assignment.
- Existing RPCs enforce expiry, immutable assignment and one Visit per
  session under a row lock. Same-tourist retries reuse the Visit; a different
  tourist is rejected. Guest/LINE ownership and optional consent are preserved.

No new migration or production flag activation is part of this work. Session
enforcement is **default-off** and requires existing migrations, a stable
server-only HMAC secret and deployment acceptance. While disabled, the legacy
path remains compatible and does not offer the session's replay restrictions.

## A QR URL does not prove presence

Static QR and registered static NFC URLs can be copied and opened remotely.
A session establishes freshness and browser ownership, not physical presence.
Photos, browser GPS, IP addresses and NFC query parameters are not tamper-proof
evidence. GPS can be spoofed and may fail indoors. Requiring it for every tourist
would contradict the current privacy policy.

Do not label QR events, certificates or rewards as verified attendance. The
current certificate is a tourist-created travel memory; the existing rule
allowing completion later at a hotel remains compatible with that meaning.

## Planned next delivery: verification at the venue

If certificates must assert physical attendance, introduce an explicit venue
verification policy before making that assertion:

1. Keep one neutral QR per venue entry point and guest-first identity. Opening
   QR context alone must not authorize verified rewards.
2. At staffed venues, staff validate the visitor and issue a short-lived,
   cryptographically random single-use challenge. Bind redemption to the
   current browser session, venue and owner Visit. At unstaffed venues, a venue
   display may rotate signed short-lived challenges, but live relay remains
   possible and provides weaker evidence than staff verification.
3. Redeem atomically on the server. Store only token hash, expiry, venue/session
   binding, verification method and redeemed Visit. Enforce one-time use across
   server instances; browser localStorage or an in-memory flag is insufficient.
4. Allow verified visitors to finish the photo/certificate later within a
   bounded session. Issuance must check saved server evidence, including direct
   API calls, without trusting query-string claims.
5. Show clear states: travel memory, awaiting verification, verified at venue.
   Separate verified and self-reported Visits in analytics. Historical Visits
   stay unknown/self-reported unless reviewed. Do not infer presence from QR
   channel or research evidence scope.
6. Provide staff assistance when the challenge is inaccessible. Optional,
   consented proximity may add a risk signal using ephemeral coordinates,
   without raw coordinates in stored Visits/logs. It is insufficient alone.

This delivery requires schema/RPC work, staff permissions, a venue operating
process, retention rules, privacy notice and full-schema QA. It is planned,
not activated. The session patch does not block remotely shared QR URLs.

## Performance and acceptance

The guide is statically renderable without scanner/GPS dependencies. Session
checks use the existing read; certificate eligibility uses the existing Visit
owner query. No extra serial database request is added. Regressions cover
removed flow, stale evidence, demo direct entry, historical demo generation,
ownership denial and genuine venue flow.

Before enabling session enforcement, test cookie binding, RPC grants/RLS,
expired/reassigned session rejection, same-owner retry and different-owner
replay against a disposable full-schema database. Reward E2E tests require
`E2E_CHECKIN_CODE` for an explicitly provisioned non-demo code in that database.
Never use production venues as automated reward fixtures.
