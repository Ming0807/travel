# SUSTAINABLE_TOURISM_INDICATORS.md

## 1. Purpose

This document defines the sustainable tourism indicators that the platform should measure and report. These indicators help planners understand whether tourism is developing in a balanced and sustainable way.

---

## 2. Indicator Categories

### Category 1: Attraction Load Distribution

Measures whether tourism is concentrated or distributed across attractions.

| Indicator | Formula | Data Source |
|---|---|---|
| Visit concentration index | Top 3 attraction visits / total visits | visits |
| Attraction utilization rate | Attractions with visits / total active attractions | visits, attractions |
| Province visit balance | Std deviation of visits per province | visits |
| Under-visited attractions | Attractions with <10 visits in period | visits |

**Planning value:** Identifies over-concentrated or neglected attractions for rebalancing.

---

### Category 2: Tourist Satisfaction Quality

| Indicator | Formula | Data Source |
|---|---|---|
| Average satisfaction score | Mean of overall_score | satisfaction_surveys |
| Low satisfaction rate | Surveys with score ≤2 / total surveys | satisfaction_surveys |
| Attraction satisfaction rank | Ranked average score per attraction | satisfaction_surveys |
| Problem category distribution | Count per problem type | survey_answers |
| Revisit intention rate | "Yes" answers / total respondents | satisfaction_surveys |
| Recommendation rate (NPS proxy) | "Yes recommend" / total respondents | satisfaction_surveys |

**Planning value:** Identifies attractions needing improvement and those performing well.

---

### Category 3: Economic Distribution

| Indicator | Formula | Data Source |
|---|---|---|
| Spending range distribution | Count per range bracket | visit_expenses |
| Province spending comparison | Average spending range per province | visit_expenses |
| Spending by attraction type | Average spending per attraction type | visit_expenses, attractions |
| Community tourism spending ratio | Community attraction spending / total | visit_expenses, attractions |
| High-value tourist ratio | Tourists in top spending range / total | visit_expenses |

**Planning value:** Shows whether tourism benefits reach communities and distribute across areas.

---

### Category 4: Travel Behavior Patterns

| Indicator | Formula | Data Source |
|---|---|---|
| Overnight stay rate | Overnight visits / total visits | visits |
| Average group size | Mean group size | visits |
| Transport mode distribution | Count per mode | visits |
| Multi-attraction visitors | Tourists with 2+ stamps / total | tourist_stamps |
| Cross-province visitors | Tourists with stamps in 2+ provinces / total | tourist_stamps |
| Average attractions per tourist | Total stamps / tourists with stamps | tourist_stamps |

**Planning value:** Helps design routes, accommodation capacity, and transportation plans.

---

### Category 5: Community Tourism Engagement

| Indicator | Formula | Data Source |
|---|---|---|
| Community attraction visit share | Community attraction visits / total | visits, attractions |
| Community attraction satisfaction | Mean score for community attractions | satisfaction_surveys |
| Community attraction spending | Mean spending at community attractions | visit_expenses |
| Community attraction coverage | Community attractions with visits / total community attractions | visits, attractions |

**Planning value:** Measures whether community-based tourism receives adequate attention.

---

### Category 6: Tourist Diversity

| Indicator | Formula | Data Source |
|---|---|---|
| Origin diversity index | Unique origins / total tourists | tourists |
| International tourist ratio | Foreign tourists / total | tourists |
| Age group distribution | Count per age group | tourists |
| Returning tourist rate | Tourists with 2+ visits / total | visits |
| Identity link rate | Linked tourists / total tourists | tourist_identities |

**Planning value:** Shows whether tourism attracts diverse segments or depends on narrow groups.

---

### Category 7: Data Collection Effectiveness

| Indicator | Formula | Data Source |
|---|---|---|
| Survey completion rate | Completed surveys / total visits | satisfaction_surveys, visits |
| Certificate generation rate | Certificates / visits | certificates, visits |
| Funnel conversion rate | certificate_generated / qr_scanned | funnel_events |
| Data completeness score | Fields filled / total possible fields | visits, tourists |

**Planning value:** Monitors whether the data collection system is working effectively.

---

## 3. Dashboard Integration

Each indicator should appear in the **Sustainable Tourism Dashboard** with:

- Current value
- Trend (compared to previous period)
- Province breakdown
- Attraction-level drill-down where applicable
- Visual chart (bar, line, or map)

---

## 4. Interpretation Guidelines

| Signal | Meaning | Suggested Action |
|---|---|---|
| High concentration index | Tourism depends on few attractions | Promote under-visited attractions |
| Low satisfaction at specific attraction | Quality issues exist | Investigate and improve |
| Low community tourism share | Community attractions are overlooked | Create promotion campaigns |
| Low overnight rate | Most tourists are day-trippers | Develop overnight packages |
| Low cross-province rate | Tourists stay in one province | Promote cross-province routes |
| High spending at few attractions | Economic benefit is concentrated | Distribute tourism activities |
| Low survey completion | Incentives or UX need improvement | Improve survey experience |

---

## 5. Reporting Frequency

| Level | Frequency | Audience |
|---|---|---|
| Executive overview | Monthly | Provincial administrators |
| Detailed indicators | Quarterly | Tourism planners |
| Academic analysis | Semester / Annual | Researchers |
| Real-time dashboard | Continuous | System administrators |

---

## 6. Latest Dashboard Interpretation Rules

Sustainable tourism indicators must preserve metric honesty:

- QR Scans are not Visits.
- Tourist Profiles are not verified unique people.
- Estimated Spending is not Revenue.
- Missing Satisfaction is `No data`, not `0`.
- Zero denominator is `No data`.
- Dashboard views must use aggregated data only.
- Dashboard views must not expose provider_user_id, guest token, Google subject, LINE user ID, tourist_id, visit_id, private photo paths, or private certificate paths by default.

Funnel analytics should help planners understand where tourists drop off between QR scan, landing view, certificate creation, stamp award, optional sharing, and optional survey completion.
