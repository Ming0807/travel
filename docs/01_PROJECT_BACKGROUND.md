# 01_PROJECT_BACKGROUND.md

## 1. Purpose

This document provides the academic and domain background for the Southern Border Tourism Data & Intelligence Platform.

---

## 2. Background and Context

### 2.1 Tourism Development in Southern Border Provinces

Thailand's southern border provinces — Yala, Pattani, and Narathiwat — possess rich cultural heritage, natural attractions, and community-based tourism potential. However, tourism development in this region has been constrained by:

- Security concerns that reduce tourist confidence
- Limited marketing and national promotion
- Insufficient tourism data for evidence-based planning
- Lower tourism infrastructure compared to major destinations
- Difficulty measuring the impact of tourism development initiatives

### 2.2 The Tourism Data Problem

Effective tourism planning requires structured data about who visits, where they go, how they travel, what they spend, and how satisfied they are. Currently:

- **National statistics** provide macro-level data but lack attraction-level granularity
- **Provincial data** focuses on hotel occupancy and does not capture day-trip visitors
- **Attraction-level data** is rarely collected systematically
- **Tourist profile data** (origin, age, behavior) is unavailable at the local level
- **Satisfaction and spending data** relies on infrequent academic surveys

Without this data, tourism planners cannot make evidence-based decisions about which attractions to promote, which areas need improvement, or how to distribute tourism benefits across communities.

### 2.3 Academic Relevance

This project sits at the intersection of:

- **Information Systems:** Building a production-quality data collection and analytics platform
- **Tourism Management:** Applying tourism planning theory to a real-world context
- **Human-Computer Interaction:** Designing a mobile-first experience that motivates participation
- **Database Engineering:** Modeling complex tourism data relationships
- **Data Analytics:** Creating dashboards that translate raw data into planning insights

---

## 3. Problem Statement

> How can a digital platform encourage tourists to voluntarily provide structured tourism data while visiting attractions in Thailand's southern border provinces, and how can this data be organized and analyzed to support sustainable tourism planning?

### 3.1 Sub-Problems

1. **Engagement:** How to motivate tourists to provide data without coercion?
2. **Data Quality:** How to collect structured, analysis-ready data through a mobile-first experience?
3. **Identity:** How to recognize returning tourists without requiring mandatory registration?
4. **Privacy:** How to collect useful data while respecting tourist privacy?
5. **Analytics:** How to transform collected data into actionable planning insights?
6. **Sustainability:** How to measure whether tourism develops sustainably across the region?

---

## 4. Project Objectives

### 4.1 Primary Objectives

1. Design and develop a tourism data collection platform for the three southern border provinces
2. Implement a QR-based check-in system that connects physical attractions to digital data collection
3. Create a progressive data collection workflow that minimizes tourist burden
4. Build a structured relational database covering five core tourism dimensions
5. Develop planning dashboards that support sustainable tourism decision-making

### 4.2 Secondary Objectives

1. Implement digital certificate and stamp features as engagement incentives
2. Support multiple tourist identity methods (guest, LINE, email)
3. Create an admin content management system for attractions and tourism content
4. Enable data export for academic research and reporting
5. Design the system for potential production deployment

---

## 5. Five Core Data Dimensions

The platform organizes tourism data around five dimensions that together provide a comprehensive picture:

| Dimension | What It Measures | Why It Matters |
|---|---|---|
| **Tourist Profile** | Who visits (origin, age, language) | Understand tourist demographics |
| **Travel Behavior** | How they travel (companion, transport, overnight) | Plan infrastructure and routes |
| **Attractions Visited** | Where they go (attraction, province, frequency) | Measure attraction performance |
| **Expenses** | What they spend (categories, ranges) | Understand economic impact |
| **Satisfaction** | How they feel (rating, revisit, recommend) | Improve quality and promotion |

---

## 6. Proposed Solution Approach

### 6.1 Engagement-First Design

Instead of asking tourists to complete surveys, the platform offers a certificate and stamp experience. Data collection is embedded naturally within this experience.

```text
Traditional: "Please fill this survey" → Tourist ignores
Platform:    "Create your travel memory!" → Tourist participates → Data is collected
```

### 6.2 Technology Approach

- **PWA (Progressive Web App):** Works on any mobile browser without app installation
- **QR Codes:** Physical-to-digital bridge at each attraction
- **Supabase PostgreSQL:** Structured relational database with real-time capabilities
- **Next.js:** Modern full-stack framework for web application
- **Dashboard:** Data visualization for planning insights

---

## 7. Expected Contributions

### 7.1 Practical Contributions

- A working tourism data collection platform for the southern border
- Structured tourism database with real visitor data
- Dashboard tools for provincial tourism planning
- Digital engagement system (certificate, stamp, passport)

### 7.2 Academic Contributions

- Demonstration of progressive data collection methodology
- Case study of gamification in tourism data collection
- Database design for multi-dimensional tourism analysis
- Framework for sustainable tourism indicator measurement

---

## 8. Scope Limitations

- The platform focuses on three provinces (Yala, Pattani, Narathiwat)
- The system collects self-reported data, not verified visitor counts
- Privacy limitations mean some data points are approximate (spending ranges, not exact amounts)
- The MVP demonstrates the concept; full production deployment requires additional hardening
- Official data integration is reference-level, not real-time API integration
