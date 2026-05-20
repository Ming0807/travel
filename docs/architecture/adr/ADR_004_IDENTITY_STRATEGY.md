# ADR-004: Multi-Identity Strategy

## Status

Accepted

## Context

Tourists should be able to use the system without mandatory registration. However, the system should also:

- recognize returning tourists to avoid duplicate Tourist Profiles
- support guest participation on the same browser/device
- support passport persistence across devices when the tourist chooses account linking
- allow Thai tourists to optionally use LINE
- allow tourists to optionally use Google for profile, passport, and certificate history recovery
- support future email recovery where useful
- never force login before the tourist receives value through a certificate and stamp
- avoid using IP address as the main tourist identity mechanism

## Decision

Implement a **multi-identity system** with a central Tourist Profile and separate Tourist Identity records.

Supported identity providers:

```text
anonymous_device  -> default guest identity using first-party browser/device token
google            -> optional tourist account linking for cross-device recovery
line              -> optional LINE identity through LIFF
email             -> future optional email/magic-link recovery
```

Key design rules:

- Separate `tourists` from `tourist_identities`.
- One Tourist Profile can have multiple identities.
- Guest identity is created or reused automatically for the same browser/device.
- Google and LINE are optional for tourists and should be offered after certificate reward or from passport screens.
- Future email recovery must also remain optional.
- Identity linking must attach a new provider identity to the existing Tourist Profile when safe.
- Do not create a new Tourist Profile every time the same tourist visits a new attraction.
- IP address may be stored for security logs or aggregate system analytics only, not for primary tourist identity.
- Do not expose provider user IDs, Google subjects, LINE user IDs, guest tokens, internal tourist IDs, or internal visit IDs in public UI, dashboards, share URLs, or default exports.
- Admin authentication is separate from tourist identity linking and may use real authentication such as Google/Gmail where configured.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Mandatory LINE login | Excludes foreign tourists and blocks value before reward |
| Mandatory Google login for tourists | Adds friction and blocks guest-first QR participation |
| Mandatory email | Creates friction and reduces participation rate |
| Anonymous only | Cannot support cross-device passport recovery |
| IP-address identity | Unstable, privacy-risky, and unsuitable for identifying a tourist as the same person |
| Store provider IDs directly on tourists table | Mixes profile and identity concerns and makes multi-provider linking harder |

## Consequences

**Positive:**

- Zero friction for first-time tourists through guest access.
- Thai and foreign tourists can participate without LINE.
- Tourists can recover passport/certificate history through optional Google or LINE linking.
- Existing guest profile can be upgraded without losing stamps or certificates.
- Data model supports future email identity without redesign.
- Admin authentication can be robust without forcing tourist login.

**Negative:**

- Guest tokens can be lost if browser data is cleared.
- Identity linking and conflict handling add complexity.
- The platform must clearly explain that guest passport works only on the same browser/device unless linked.
- The dashboard must label Tourist Profiles carefully because they are not verified unique people.

