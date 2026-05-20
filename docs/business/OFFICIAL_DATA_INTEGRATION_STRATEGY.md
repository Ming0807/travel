# OFFICIAL_DATA_INTEGRATION_STRATEGY.md

## 1. Purpose

This document outlines the strategy for integrating official tourism data with the platform's locally collected data to provide a comprehensive view for planning.

---

## 2. Official Data Sources

### 2.1 Government Agencies

| Agency | Data Type | Format |
|---|---|---|
| TAT (Tourism Authority of Thailand) | National/provincial visitor statistics | Reports, PDF, web |
| Ministry of Tourism and Sports | Tourism satellite accounts, revenue data | Annual reports |
| Provincial Tourism Offices | Local visitor counts, event data | Internal records |
| Immigration Bureau | Border crossing statistics | Database/reports |
| Department of National Parks | National park visitor counts | Database |
| TAO/Municipality | Local event and attraction data | Internal records |

### 2.2 Data Types Available

| Data Category | Granularity | Frequency |
|---|---|---|
| Visitor counts | Province level | Monthly/Annual |
| Tourism revenue | National/Regional | Annual |
| Hotel occupancy | Province level | Monthly |
| Border crossings | Checkpoint level | Monthly |
| National park visitors | Park level | Monthly |
| Event attendance | Event level | Per event |

---

## 3. Integration Strategy

### 3.1 Comparison Model

The platform does not replace official data. It complements it.

```text
Official Data (top-down)
    Province-level visitor counts
    National revenue estimates
    Hotel occupancy rates
        +
Platform Data (bottom-up)
    Attraction-level visits
    Tourist profiles and behavior
    Satisfaction and spending per attraction
        =
Comprehensive Planning View
    Provincial + local data combined
    Gap analysis between official and local
    Evidence for promotion decisions
```

### 3.2 Import Types

| Type | Description | Priority |
|---|---|---|
| Reference data | Province lists, attraction registrations | MVP |
| Benchmark data | Provincial visitor counts for comparison | Phase 2 |
| Event data | Tourism events and festivals calendar | Phase 2 |
| Geographic data | Map data, coordinates, boundaries | MVP |
| Historical data | Past year statistics for trend analysis | Phase 3 |

---

## 4. Database Design

### 4.1 Import Tables

```text
official_data_sources
    source_id (PK)
    source_name
    agency_name
    data_type
    url
    is_active

official_data_imports
    import_id (PK)
    source_id (FK)
    import_type
    period_start
    period_end
    data_json
    imported_by
    imported_at
    status
```

### 4.2 Benchmark Views

Create database views that combine official and platform data:

```text
v_province_comparison
    province_id
    official_visitor_count (from imports)
    platform_visitor_count (from visits)
    coverage_percentage
    period
```

---

## 5. Dashboard Integration

### 5.1 Comparison Charts

- Platform visits vs. official visitor counts by province
- Platform coverage rate (platform visits / official count)
- Trend comparison over time

### 5.2 Gap Analysis

- Provinces where platform coverage is low → need more QR deployment
- Attractions not in official registry → community tourism opportunities
- Official data gaps the platform can fill

---

## 6. Privacy and Legal Considerations

- Official data is typically aggregated and public
- Do not store personal-level data from official sources
- Cite data sources in dashboard and reports
- Clearly distinguish platform data from official data in exports
- Follow government data usage guidelines

---

## 7. Implementation Phases

**MVP:** Import geographic reference data (provinces, districts). Manual import.

**Phase 2:** Import benchmark visitor counts. Comparison dashboard. Admin import UI.

**Phase 3:** Scheduled imports. Historical trend analysis. API integration where available.

---

## 8. Quality Rules

- All imported data must include source attribution
- Import logs must be maintained for audit
- Data conflicts should be flagged, not silently overwritten
- Admin must review imports before they affect dashboard calculations

---

## 9. Latest Comparison Rules

Official data and platform participation data must not be treated as the same thing.

| Data Type | Correct Interpretation |
|---|---|
| QR scan | Funnel event, not a visit |
| Landing view | Engagement event, not a tourist count |
| Platform visit | Participation record after minimal profile/consent |
| Tourist Profile | System profile, not a verified unique person |
| Estimated Spending | Self-reported planning estimate, not official revenue |
| Official arrivals | External benchmark, not produced by this platform |

Dashboard comparisons should label coverage and limitations clearly. For example, platform visits may be compared with official visitor counts to estimate participation coverage, but they must not be presented as official tourism arrivals.
