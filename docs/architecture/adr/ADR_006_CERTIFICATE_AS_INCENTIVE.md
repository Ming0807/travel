# ADR-006: Certificate as Data Collection Incentive

## Status

Accepted

## Context

The core challenge of the platform is:

> How to motivate tourists to provide structured tourism data voluntarily?

Traditional approaches (paper surveys, online forms) have extremely low completion rates because tourists have no incentive to participate.

## Decision

Use **digital certificate generation** as the primary incentive for data collection.

The certificate is a personalized digital souvenir that:

- Contains the tourist's name, photo, attraction name, and visit date
- Is beautifully designed with attraction-specific templates
- Can be downloaded and shared on social media
- Acts as a travel memory
- Does not expose email, phone, LINE ID, Google ID, provider_user_id, guest token, internal tourist ID, internal visit ID, national ID, or full address

**Data collection is embedded in the certificate creation flow:**

```text
Tourist wants certificate → Uploads photo → Fills minimal form → Gets certificate
                                                    ↓
                                            Data is collected
```

The minimal form (5 fields) is the "price" of the free certificate. This is acceptable because:

1. The form takes < 60 seconds
2. The certificate has clear personal value
3. The data requested is non-sensitive

The updated reward sequence is:

```text
QR landing -> Minimal form -> Photo upload -> Certificate download -> Stamp award -> Optional sharing -> Optional survey -> Optional Google/LINE linking
```

Certificate download must not be blocked by optional survey, optional sharing, LINE, Google, email, or phone number. Sharing is optional and user-initiated after download is available.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Survey without incentive | Very low completion rate (<5%) |
| Coupon/discount incentive | Requires partner agreements, adds cost |
| Gamification only (points) | Points have no tangible value |
| Social media contest | Complex to manage, not scalable |
| No incentive (mandatory survey) | Drives tourists away, reduces trust |

## Consequences

**Positive:**
- High expected participation rate (>70%)
- Natural data collection embedded in valuable experience
- Certificate has real emotional value for tourists
- Shareable certificates promote the attractions
- Progressive collection allows optional survey after certificate
- Stamp award after certificate supports passport motivation
- Optional sharing can support tourism promotion without forcing social login

**Negative:**
- Certificate rendering adds technical complexity
- Template management required for each attraction
- Photo upload requires storage infrastructure
- Must ensure certificate quality to maintain perceived value
- Must ensure public share URLs use random public tokens if public certificate pages are added
