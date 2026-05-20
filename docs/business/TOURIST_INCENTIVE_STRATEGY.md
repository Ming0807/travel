# TOURIST_INCENTIVE_STRATEGY.md

## 1. Purpose

This document explains how the platform uses incentives to motivate tourists to participate in data collection without coercion.

---

## 2. Core Problem

> Tourists have no natural motivation to fill in surveys or share personal data while traveling.

Traditional approaches fail because they offer no value to the tourist:

| Approach | Problem |
|---|---|
| Paper survey | Boring, no reward, low completion |
| Online form | No incentive, no connection to experience |
| Mandatory registration | Blocks participation, reduces volume |
| Interview | Labor-intensive, not scalable |

---

## 3. Incentive Framework

The platform uses a **value-exchange model**:

```text
Tourist gives:  Minimal personal data + optional survey
Tourist gets:   Certificate + Stamp + Passport + Memory
```

### 3.1 Incentive Layers

| Layer | Incentive | When | Cost |
|---|---|---|---|
| 1 | Digital Certificate (travel memory card) | After minimal form + photo | Free |
| 2 | Digital Stamp | Automatically with certificate | Free |
| 3 | Digital Passport (stamp collection) | Accumulates over visits | Free |
| 4 | Progress & Achievement | Ongoing engagement | Free |
| 5 | Social sharing (future) | After certificate | Free |

### 3.2 Incentive Timing

```text
QR Scan → See attraction info (free, no data needed)
    ↓
Photo Upload → Part of certificate experience
    ↓
Minimal Form → 5 fields, required for certificate
    ↓
🎁 Certificate Generated → IMMEDIATE REWARD
    ↓
🎁 Stamp Earned → IMMEDIATE REWARD
    ↓
Optional Survey → Asked AFTER rewards given
```

**Key principle:** Tourist receives value BEFORE optional data is requested.

---

## 4. Certificate as Primary Incentive

### 4.1 What Makes It Valuable

- **Personalized:** Contains tourist's name, photo, and visit date
- **Beautiful:** Professionally designed template with attraction branding
- **Shareable:** Can be downloaded and shared on social media
- **Memorable:** Acts as a digital souvenir of the trip
- **Instant:** Generated immediately after form submission

### 4.2 Certificate Design Requirements

- Must look premium and professional
- Must include attraction-specific visual elements
- Must render well on mobile screens
- Must be downloadable as high-quality image
- Should feel like a reward, not a receipt

---

## 5. Stamp as Secondary Incentive

### 5.1 Gamification Effect

The stamp system leverages collection psychology:

- Humans enjoy completing collections
- Visual progress motivates continued participation
- Earning is more engaging than being told to participate
- Stamps create a sense of accomplishment

### 5.2 Stamp Engagement Rules

- Each attraction has a unique stamp design
- Stamp is earned automatically on valid visit
- Cannot be earned without participation
- Creates a "collectible" motivation for repeat visits

---

## 6. Passport as Long-Term Incentive

### 6.1 Retention Strategy

The passport creates ongoing motivation:

- Tourists see their collection grow
- Province progress shows gaps to fill
- "Save your passport" encourages identity linking
- Linked passport survives device changes
- Creates reason to visit other attractions and provinces

### 6.2 Passport Persistence as Identity Incentive

```text
Guest passport → Limited to one device
    ↓
"Link Google or LINE to keep your passport across devices"
    ↓
Tourist links identity voluntarily
    ↓
Platform gains durable identity for analytics
```

---

## 7. Future Incentive Options

### 7.1 Partner Discounts (Future Phase)

```text
Show passport with 5+ stamps → Get discount at partner restaurant
Complete province collection → Free souvenir at tourism office
```

### 7.2 Community Recognition (Future Phase)

```text
Top collectors → Featured on attraction website
Province champion → Recognition from tourism office
```

### 7.3 Survey Completion Incentive (Future Phase)

```text
Complete optional survey → Earn special "contributor" badge
Survey badge → Unlocks exclusive content or future event priority
```

---

## 8. Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad |
|---|---|
| Require survey before certificate | Tourist abandons the flow |
| Require LINE login before any value | Excludes foreign tourists, reduces volume |
| Require Google login before any value | Adds friction and breaks guest-first participation |
| Force email collection | Creates friction, reduces participation |
| Make passport mandatory | Overwhelms casual visitors |
| Show long form first | Tourist leaves immediately |
| No visual reward | Tourist feels exploited for data |
| Automatic social posting | Creates privacy and trust risk |
| Block download until sharing | Turns reward into coercion |

---

## 9. Expected Impact

| Metric | Without Incentives | With Incentives |
|---|---|---|
| Participation rate | <5% | >70% |
| Form completion rate | <10% | >90% (minimal form) |
| Survey completion rate | <3% | 30-50% |
| Return visit rate | Unknown | 15%+ |
| Identity linking rate | N/A | 20%+ |

---

## 10. Latest Reward Sequence

The incentive sequence should be:

```text
QR landing context
    |
Certificate preview and CTA
    |
Minimal form + photo
    |
Certificate download
    |
Stamp award
    |
Optional share sheet
    |
Optional micro survey
    |
Optional Google / LINE passport linking
```

Rules:

- Certificate is the immediate reward.
- Stamp is awarded after successful certificate generation.
- Survey is optional and shown after reward.
- Sharing is optional and user-initiated.
- Google and LINE linking are optional recovery features, not entry gates.
- Guest mode must work for Thai tourists, foreign tourists, LINE users, non-LINE users, and users without Google login.

---

## 11. Summary

The incentive strategy transforms data collection from a burden into a valuable tourist experience. The certificate provides immediate gratification, the stamp creates collection motivation, and the passport drives long-term engagement — all while the platform collects structured tourism data for planning.
