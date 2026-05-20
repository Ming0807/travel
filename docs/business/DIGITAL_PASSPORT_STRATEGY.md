# DIGITAL_PASSPORT_STRATEGY.md

## 1. Purpose

This document defines the strategy for the Digital Passport and Digital Stamp features.

The digital passport is a key engagement mechanism that encourages repeat visits and ongoing data collection.

---

## 2. Strategic Objective

> Use the Digital Passport as a gamification tool that motivates tourists to visit multiple attractions, earn stamps, and voluntarily share travel data.

```text
Build a tourism database → Use engagement to collect data → Use data for planning
```

---

## 3. Core Concepts

### 3.1 Digital Stamp

A digital stamp is a visual record proving that a tourist visited a specific attraction.

| Property   | Description                                           |
| ---------- | ----------------------------------------------------- |
| Earned by  | Completing a valid visit (photo + form + certificate) |
| Linked to  | Tourist + Attraction + Visit                          |
| Uniqueness | One stamp per attraction per tourist                  |
| Storage    | `tourist_stamps` table                                |

### 3.2 Digital Passport

A personal collection page showing all earned stamps.

| Property    | Description                                             |
| ----------- | ------------------------------------------------------- |
| Owner       | Tourist (guest token, LINE, or email)                   |
| Content     | Earned stamps, visit history, province progress         |
| Persistence | Device-based for guests, account-based for linked users |
| Goal        | Encourage collecting stamps across attractions          |

### 3.3 Stamp Definition

Each attraction has a stamp definition managed by admins:

```text
stamp_definition_id, attraction_id, stamp_name,
stamp_icon_url, description, rarity, is_active, created_at
```

---

## 4. Engagement Model

### 4.1 Collection Loop

```text
Tourist visits attraction → Earns stamp → Sees passport progress
    → Sees unvisited attractions → Visits more → More data collected
```

### 4.2 Progress Indicators

```text
ยะลา:     ████████░░  4/5 attractions
ปัตตานี:   ██████░░░░  3/5 attractions
นราธิวาส:  ██░░░░░░░░  1/5 attractions
Total: 8 / 15 stamps
```

### 4.3 Rarity System (Future)

| Rarity    | Criteria           | Example              |
| --------- | ------------------ | -------------------- |
| Common    | Easy-to-access     | City parks, markets  |
| Uncommon  | Requires travel    | District attractions |
| Rare      | Remote or seasonal | Mountain viewpoints  |
| Legendary | Special events     | Limited-time stamps  |

### 4.4 Achievement Milestones (Future)

- First Stamp → "เริ่มต้นเส้นทาง"
- 3 Provinces → "นักเดินทางชายแดนใต้"
- All province stamps → "ผู้พิชิตชายแดนใต้"

---

## 5. Identity and Persistence

### 5.1 Guest Passport

- Anonymous device token in browser
- Works on same device only
- Warn tourist about cache-clearing risk

### 5.2 Linked Passport

- Tourist links to Google or LINE
- Persists across devices
- Recoverable on new device

### 5.3 Identity Linking Flow

```text
Guest with stamps -> "Save your passport" prompt -> Link Google/LINE
    → Identity merged → Passport recoverable on any device
```

---

## 6. Data Collection Value

### 6.1 Direct Data per Stamp

- Visit record (attraction, date, photo spot)
- Tourist profile data
- Photo upload + Certificate
- Consent record

### 6.2 Behavioral Insights

| Insight                    | Measurement           |
| -------------------------- | --------------------- |
| Average stamps per tourist | Engagement level      |
| Province completion rate   | Cross-province travel |
| Time between stamps        | Trip duration         |
| Common stamp combinations  | Natural routes        |
| Drop-off point             | Where tourists stop   |

---

## 7. Tourist-Facing UX

### 7.1 Passport Page

```text
┌─────────────────────────┐
│  My Tourism Passport     │
│  Stamps: 4 / 15         │
├─────────────────────────┤
│  ยะลา (2/5)             │
│  [🟢] Betong Sky Walk   │
│  [⚪] ...               │
├─────────────────────────┤
│  [Save Passport] button  │
└─────────────────────────┘
```

### 7.2 Stamp Earned Celebration

Brief animation showing new stamp with message:
"Keep exploring! You need X more stamps to complete [province]."

---

## 8. Privacy Considerations

- Passport data belongs to the tourist
- No personal info displayed publicly
- Sharing is opt-in only
- Admin views aggregated data only
- Guest passport works on the same browser/device through an anonymous guest ID
- Cross-device recovery requires optional Google or LINE linking
- Do not expose provider_user_id, Google subject, LINE user ID, guest token, tourist_id, or visit_id in public passport UI

---

## 9. Implementation Phases

**Phase 1 (MVP):** Basic stamp assignment, simple stamp list, unique per tourist-attraction, guest persistence

**Phase 2:** Full passport page, stamp icons, province progress, optional Google/LINE identity linking, celebration UI

**Phase 3 (Future):** Rarity, badges, leaderboard, shareable passport card, campaign stamps

Identity linking means optional Google or LINE linking after the tourist receives value. It must not be required before certificate generation, stamp earning, or guest passport viewing on the same device.

---

## 10. Database Tables

```text
stamp_definitions
    stamp_definition_id (PK), attraction_id (FK),
    stamp_name, stamp_icon_url, rarity, is_active, created_at

tourist_stamps
    tourist_stamp_id (PK), tourist_id (FK),
    stamp_definition_id (FK), attraction_id (FK),
    visit_id (FK), earned_at
    UNIQUE(tourist_id, attraction_id)
```

---

## 11. Success Metrics

| Metric                     | Target                      |
| -------------------------- | --------------------------- |
| Passport creation rate     | >80% of certificate earners |
| Average stamps per tourist | >1.5                        |
| Identity link rate         | >20% of guest users         |
| Multi-province visitors    | >10% of stamp earners       |
| Repeat visit rate          | >15% of tourists            |

---

## 12. Latest Passport Product Rules

- Award one stamp after successful certificate generation.
- Allow repeat visits to the same attraction.
- Do not award duplicate stamps for the same tourist-attraction pair.
- Show earned stamps, attraction name, province, progress, and CTA to continue exploring.
- Keep guest passport usable on the same browser/device.
- Use Google or LINE linking only for optional cross-device recovery.
- Do not require LINE or Google for stamp earning.
