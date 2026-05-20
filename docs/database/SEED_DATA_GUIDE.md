# SEED_DATA_GUIDE.md

## 1. Document Purpose

This document defines the seed data strategy for the **Southern Border Tourism Data & Intelligence Platform**.

Seed data is required so the system can run, demonstrate, test, and produce useful dashboard data.

This document explains:

- Required master data
- Recommended seed order
- MVP seed values
- Sample attractions
- QR/check-in seed examples
- Certificate template seed
- Testing data rules
- Data quality rules for seeds

---

## 2. Seed Data Goals

Seed data should make the MVP usable immediately after database setup.

After running migrations and seed scripts, the system should be able to:

- Display public attraction pages
- Resolve sample QR/check-in codes
- Show dropdown options
- Create tourist profiles
- Record visits
- Generate certificates
- Assign stamps
- Submit expense and satisfaction data
- Display dashboard metrics after sample transactions

---

## 3. Seed Data Principles

## 3.1 Separate Master Data from Demo Data

Master data is required for real operation.

Demo data is only for testing and presentation.

Recommended folders:

```text
supabase/seed/master/
supabase/seed/demo/
```

or:

```text
seed/001_master_geography.sql
seed/010_demo_attractions.sql
```

---

## 3.2 Seeds Must Be Idempotent

Seed scripts should be safe to run more than once.

Use upsert where possible.

Example concept:

```sql
insert into provinces (...)
values (...)
on conflict (...) do update set ...
```

---

## 3.3 Use Stable Codes

Use stable codes for values used by application logic.

Examples:

```text
TH
MYS
transport_private_car
expense_food
age_18_24
```

Do not rely only on auto-generated IDs in application code.

If needed, add `code` columns to master tables.

---

## 3.4 Do Not Use Real Personal Data

Demo tourists must be fake.

Do not seed:

- real names
- real emails
- real LINE IDs
- real tourist photos
- real phone numbers
- real personal addresses

Use fake values only.

---

## 4. Recommended Seed Order

Seed data should be inserted in this order:

```text
1. countries
2. provinces
3. districts
4. attraction_types
5. travel_companions
6. transport_modes
7. travel_purposes
8. expense_categories
9. survey_questions
10. attractions
11. attraction_images
12. attraction_360_media
13. photo_spots
14. checkin_codes
15. certificate_templates
16. stamp_definitions
17. admin roles and permissions
18. demo tourists
19. demo visits
20. demo certificates/stamps/surveys
```

Master data should be separated from demo data.

---

## 5. Required Master Data for MVP

## 5.1 Countries

Required at minimum:

```text
Thailand
Malaysia
Indonesia
Singapore
China
Japan
South Korea
United Kingdom
United States
Other
Prefer not to answer
```

Recommended columns:

```text
country_name_en
country_name_th
iso2_code
iso3_code
is_active
```

Example:

| English | Thai | ISO2 | ISO3 |
|---|---|---|---|
| Thailand | ไทย | TH | THA |
| Malaysia | มาเลเซีย | MY | MYS |
| Indonesia | อินโดนีเซีย | ID | IDN |
| Singapore | สิงคโปร์ | SG | SGP |
| Other | อื่น ๆ | OT | OTH |

---

## 5.2 Provinces

For MVP, include at least:

```text
Yala
Pattani
Narathiwat
```

Recommended to include all Thai provinces later for domestic origin.

Target area flags:

| Province | is_target_area |
|---|---:|
| Yala | true |
| Pattani | true |
| Narathiwat | true |

---

## 5.3 Districts

Seed important districts for the target provinces.

### Yala

Examples:

```text
Mueang Yala
Betong
Bannang Sata
Than To
Yaha
Raman
Kabang
Krong Pinang
```

### Pattani

Examples:

```text
Mueang Pattani
Khok Pho
Nong Chik
Panare
Mayo
Yaring
Sai Buri
Mai Kaen
Yarang
Kapho
Thung Yang Daeng
Mae Lan
```

### Narathiwat

Examples:

```text
Mueang Narathiwat
Tak Bai
Bacho
Yi-ngo
Ra-ngae
Rueso
Si Sakhon
Waeng
Sukhirin
Su-ngai Kolok
Su-ngai Padi
Chanae
Cho-airong
```

District list should be verified before final production use.

---

## 5.4 Attraction Types

Recommended values:

| Code | English | Thai |
|---|---|---|
| nature | Nature | ธรรมชาติ |
| cultural | Cultural | วัฒนธรรม |
| religious | Religious | ศาสนา |
| historical | Historical | ประวัติศาสตร์ |
| community | Community-based | ท่องเที่ยวชุมชน |
| viewpoint | Viewpoint | จุดชมวิว |
| beach_coastal | Beach / Coastal | ชายหาด / ชายฝั่ง |
| food | Food Tourism | อาหาร |
| adventure | Adventure | ผจญภัย |
| city | City / Urban | เมือง |
| other | Other | อื่น ๆ |

---

## 5.5 Travel Companions

Recommended values:

| Code | English | Thai |
|---|---|---|
| alone | Alone | คนเดียว |
| family | Family | ครอบครัว |
| friends | Friends | เพื่อน |
| partner | Partner | คู่รัก |
| tour_group | Tour group | กรุ๊ปทัวร์ |
| school_group | School group | กลุ่มนักเรียน/นักศึกษา |
| work_group | Work group | กลุ่มที่ทำงาน |
| other | Other | อื่น ๆ |
| prefer_not | Prefer not to answer | ไม่ต้องการตอบ |

---

## 5.6 Transport Modes

Recommended values:

| Code | English | Thai |
|---|---|---|
| private_car | Private car | รถยนต์ส่วนตัว |
| motorcycle | Motorcycle | รถจักรยานยนต์ |
| van | Van | รถตู้ |
| bus | Bus | รถโดยสาร |
| train | Train | รถไฟ |
| airplane | Airplane | เครื่องบิน |
| taxi | Taxi / Ride-hailing | แท็กซี่ / รถรับจ้าง |
| tour_vehicle | Tour vehicle | รถนำเที่ยว |
| walking | Walking | เดินเท้า |
| other | Other | อื่น ๆ |
| prefer_not | Prefer not to answer | ไม่ต้องการตอบ |

---

## 5.7 Travel Purposes

Recommended values:

| Code | English | Thai |
|---|---|---|
| leisure | Leisure | พักผ่อน |
| nature | Nature tourism | ท่องเที่ยวธรรมชาติ |
| cultural | Cultural tourism | ท่องเที่ยววัฒนธรรม |
| religious | Religious tourism | ท่องเที่ยวศาสนา |
| historical | Historical tourism | ท่องเที่ยวประวัติศาสตร์ |
| food | Food tourism | ท่องเที่ยวอาหาร |
| family_visit | Family visit | เยี่ยมญาติ/ครอบครัว |
| education | Education | การศึกษา |
| work | Work / Official trip | ทำงาน / ราชการ |
| event | Event / Festival | งานกิจกรรม / เทศกาล |
| other | Other | อื่น ๆ |
| prefer_not | Prefer not to answer | ไม่ต้องการตอบ |

---

## 5.8 Expense Categories

Recommended values:

| Code | English | Thai |
|---|---|---|
| food | Food and drinks | อาหารและเครื่องดื่ม |
| accommodation | Accommodation | ที่พัก |
| transport | Transport | การเดินทาง |
| shopping | Shopping | ช้อปปิ้ง |
| souvenir | Souvenir | ของฝาก |
| activity | Activities | กิจกรรม |
| guide | Guide / Tour service | ไกด์ / บริการนำเที่ยว |
| entrance_fee | Entrance fee | ค่าเข้าชม |
| other | Other | อื่น ๆ |

---

## 5.9 Spending Ranges

Spending range values may be stored as constants or seed data depending on schema.

Recommended values:

| Code | Label | Min | Max |
|---|---|---:|---:|
| 0_500 | 0 - 500 THB | 0 | 500 |
| 501_1000 | 501 - 1,000 THB | 501 | 1000 |
| 1001_2000 | 1,001 - 2,000 THB | 1001 | 2000 |
| 2001_5000 | 2,001 - 5,000 THB | 2001 | 5000 |
| 5001_plus | More than 5,000 THB | 5001 | null |
| prefer_not | Prefer not to answer | null | null |

---

## 5.10 Age Groups

Age group values may be stored as constants or a master table.

Recommended values:

| Code | English | Thai |
|---|---|---|
| under_18 | Under 18 | ต่ำกว่า 18 ปี |
| 18_24 | 18 - 24 | 18 - 24 ปี |
| 25_34 | 25 - 34 | 25 - 34 ปี |
| 35_44 | 35 - 44 | 35 - 44 ปี |
| 45_54 | 45 - 54 | 45 - 54 ปี |
| 55_64 | 55 - 64 | 55 - 64 ปี |
| 65_plus | 65+ | 65 ปีขึ้นไป |
| prefer_not | Prefer not to answer | ไม่ต้องการตอบ |

---

## 6. Survey Question Seeds

If using `survey_questions`, seed these questions.

## 6.1 Travel Behavior Questions

| Key | Type | English | Thai |
|---|---|---|---|
| travel_companion | single_choice | Who are you traveling with? | คุณเดินทางมากับใคร |
| group_size | number | How many people are in your group? | กลุ่มของคุณมีกี่คน |
| transport_mode | single_choice | How did you travel here? | คุณเดินทางมาด้วยวิธีใด |
| overnight_status | single_choice | Are you staying overnight? | คุณพักค้างคืนหรือไม่ |
| travel_purpose | single_choice | What is your main travel purpose? | วัตถุประสงค์หลักในการเดินทางคืออะไร |

---

## 6.2 Expense Questions

| Key | Type | English | Thai |
|---|---|---|---|
| spending_range | single_choice | About how much did you spend on this trip? | คุณใช้จ่ายโดยประมาณเท่าไรในทริปนี้ |
| main_expense_category | single_choice | What did you spend most on? | คุณใช้จ่ายกับหมวดใดมากที่สุด |

---

## 6.3 Satisfaction Questions

| Key | Type | English | Thai |
|---|---|---|---|
| overall_score | rating | Overall, how satisfied are you? | โดยรวมคุณพึงพอใจแค่ไหน |
| safety_score | rating | How satisfied are you with safety? | คุณพึงพอใจด้านความปลอดภัยแค่ไหน |
| cleanliness_score | rating | How satisfied are you with cleanliness? | คุณพึงพอใจด้านความสะอาดแค่ไหน |
| transport_score | rating | How satisfied are you with transportation/access? | คุณพึงพอใจด้านการเดินทางแค่ไหน |
| information_score | rating | How satisfied are you with information/signage? | คุณพึงพอใจด้านข้อมูลและป้ายบอกทางแค่ไหน |
| service_score | rating | How satisfied are you with service? | คุณพึงพอใจด้านบริการแค่ไหน |
| value_for_money_score | rating | How satisfied are you with value for money? | คุณพึงพอใจด้านความคุ้มค่าแค่ไหน |
| revisit_intention | boolean | Would you like to visit again? | คุณอยากกลับมาเที่ยวอีกหรือไม่ |
| recommendation_intention | boolean | Would you recommend this place to others? | คุณจะแนะนำสถานที่นี้ให้ผู้อื่นหรือไม่ |
| comment | text | Any suggestions? | ข้อเสนอแนะเพิ่มเติม |

---

## 7. Sample Attraction Seeds

Sample attractions should be used for demo and testing.

These should be verified before final production use.

## 7.1 Yala Examples

Suggested sample attractions:

```text
Aiyerweng Skywalk
Betong Clock Tower
Piyamit Tunnel
Hala-Bala Wildlife Sanctuary
```

## 7.2 Pattani Examples

Suggested sample attractions:

```text
Pattani Central Mosque
Krue Se Mosque
Lim Ko Niao Shrine
Pattani Old Town
```

## 7.3 Narathiwat Examples

Suggested sample attractions:

```text
Narathat Beach
Ao Manao Narathiwat
Su-ngai Kolok Border Area
Sukhirin Nature Area
```

## 7.4 Sample Attraction Data Requirements

Each sample attraction should include:

```text
province_id
district_id
attraction_type_id
slug
name_th
name_en
short_description_th
short_description_en
description_th
description_en
latitude
longitude
is_published
is_active
```

If exact coordinates are not verified, use null or clearly marked demo coordinates.

Do not invent precise coordinates and present them as verified.

---

## 8. Sample Photo Spot Seeds

Each sample attraction should have at least one photo spot.

Example:

```text
Aiyerweng Skywalk
  - Main viewpoint photo spot
  - Skywalk entrance photo spot

Pattani Central Mosque
  - Front landmark photo spot

Narathat Beach
  - Beachfront photo spot
```

Photo spot seed should include:

```text
attraction_id
spot_name_th
spot_name_en
description_th
description_en
display_order
is_active
```

---

## 9. Sample Check-in Code Seeds

Each photo spot should have one check-in code.

Recommended code format:

```text
YLA-AIW-001
PTN-MOS-001
NWT-BCH-001
```

Or shorter:

```text
YLA001
PTN001
NWT001
```

Rules:

- Code must be unique.
- Code must be URL-safe.
- Code should not reveal private data.
- Code should be stable.

Example routes:

```text
/c/YLA001
/c/PTN001
/c/NWT001
```

---

## 10. Certificate Template Seed

MVP should include one default certificate template.

Required fields:

```text
template_name
background_path
layout_config_json
language
is_default
is_active
```

Example layout config concept:

```json
{
  "canvas": {
    "width": 1080,
    "height": 1350
  },
  "photo": {
    "x": 90,
    "y": 220,
    "width": 900,
    "height": 640,
    "borderRadius": 32
  },
  "displayName": {
    "x": 540,
    "y": 940,
    "fontSize": 54,
    "align": "center"
  },
  "attractionName": {
    "x": 540,
    "y": 1030,
    "fontSize": 36,
    "align": "center"
  },
  "visitDate": {
    "x": 540,
    "y": 1100,
    "fontSize": 28,
    "align": "center"
  }
}
```

This JSON is conceptual. The final implementation can adjust it.

---

## 11. Stamp Definition Seeds

Each attraction should have one default stamp definition.

Required fields:

```text
attraction_id
stamp_name_th
stamp_name_en
description_th
description_en
stamp_image_path
is_active
```

Example stamp names:

```text
Aiyerweng Explorer
Pattani Heritage Visitor
Narathiwat Coastal Traveler
```

---

## 12. Admin Role and Permission Seeds

If using custom role tables, seed these roles.

## 12.1 Roles

| Role Key | Description |
|---|---|
| super_admin | Full system access |
| admin | Manage system data and dashboard |
| staff | Manage attraction and visit records |
| viewer | View dashboard only |
| researcher | View and export allowed research data |

## 12.2 Permission Seeds

Recommended permissions:

```text
attraction.read
attraction.create
attraction.update
attraction.deactivate
photo_spot.read
photo_spot.create
photo_spot.update
photo_spot.deactivate
visit.read
tourist.read
survey.read
dashboard.read
export.create
user.read
user.manage
role.manage
audit.read
setting.manage
```

---

## 13. Demo Tourist Data

Demo tourists should be fake.

Example values:

```text
Amin Demo
Maria Demo
Visitor 001
Family Traveler
```

Do not use real emails or real LINE IDs.

If email is needed:

```text
demo1@example.com
demo2@example.com
```

Never seed real personal data.

---

## 14. Demo Visit Data

Demo visits should cover:

- Different provinces
- Different attractions
- Different origins
- Different age groups
- Different transport modes
- Different spending ranges
- Different satisfaction scores
- Completed and incomplete flows

This helps test dashboards.

Recommended demo count:

```text
20 to 100 demo visits
```

For early MVP, 10 visits are enough.

---

## 15. Demo Funnel Events

Seed or generate sample funnel events for dashboard testing.

Example session:

```text
qr_scanned
landing_viewed
certificate_started
photo_uploaded
minimal_form_completed
certificate_generated
survey_started
survey_completed
passport_saved
```

Also include incomplete sessions:

```text
qr_scanned
landing_viewed
```

or:

```text
qr_scanned
landing_viewed
certificate_started
```

This allows funnel dashboard testing.

---

## 16. Demo Satisfaction Data

Seed satisfaction data with varied scores.

Examples:

```text
overall_score: 5
overall_score: 4
overall_score: 3
```

Include at least one lower score to test improvement insights.

Do not make all demo data perfect.

---

## 17. Demo Expense Data

Seed spending ranges across values.

Examples:

```text
0_500
501_1000
1001_2000
2001_5000
5001_plus
prefer_not
```

This helps test charts.

---

## 18. Seed Data Quality Rules

## 18.1 Master Data

Rules:

- Must be stable.
- Must not duplicate values.
- Must use clear code if code column exists.
- Must be active unless intentionally disabled.
- Must include Thai and English names where possible.

## 18.2 Demo Data

Rules:

- Must be fake.
- Must not include real personal data.
- Must be clearly marked as demo.
- Must be removable.
- Must not be used as production facts.

## 18.3 Attraction Data

Rules:

- Do not invent precise facts and present them as verified.
- If data is placeholder, mark it as demo.
- Verify real attraction content before public deployment.

---

## 19. Seed Script Safety

Seed scripts should be safe to run multiple times.

Recommended approach:

```sql
insert into attraction_types (code, type_name_en, type_name_th)
values ('nature', 'Nature', 'ธรรมชาติ')
on conflict (code)
do update set
  type_name_en = excluded.type_name_en,
  type_name_th = excluded.type_name_th;
```

If table does not have a `code` column, consider adding one for master tables.

---

## 20. Recommended Code Columns for Master Tables

To make seed data stable, these tables should have code fields:

```text
countries.iso2_code
attraction_types.code
travel_companions.code
transport_modes.code
travel_purposes.code
expense_categories.code
survey_questions.question_key
roles.role_key
permissions.permission_key
```

If current schema does not include `code`, consider adding it before final migration.

---

## 21. Seed Data File Plan

Recommended seed files:

```text
001_seed_countries.sql
002_seed_provinces.sql
003_seed_districts.sql
004_seed_attraction_types.sql
005_seed_travel_behavior.sql
006_seed_expense_categories.sql
007_seed_survey_questions.sql
008_seed_sample_attractions.sql
009_seed_photo_spots_checkin_codes.sql
010_seed_certificate_templates.sql
011_seed_stamp_definitions.sql
012_seed_roles_permissions.sql
013_seed_demo_tourists.sql
014_seed_demo_visits.sql
015_seed_demo_dashboard_data.sql
```

If demo data is not needed in production, keep demo seeds separate.

---

## 22. Environment-Based Seeding

Recommended strategy:

```text
development:
  master data + demo data

staging:
  master data + limited demo data

production:
  master data only
```

Do not seed fake tourists into production unless clearly marked and removed before launch.

---

## 23. Verification Queries

After seeding, run checks.

## 23.1 Check Target Provinces

```sql
select province_name_en, is_target_area
from provinces
where is_target_area = true;
```

Expected:

```text
Yala
Pattani
Narathiwat
```

---

## 23.2 Check Attraction Count

```sql
select p.province_name_en, count(a.attraction_id) as attraction_count
from provinces p
left join attractions a on a.province_id = p.province_id
where p.is_target_area = true
group by p.province_name_en;
```

---

## 23.3 Check Check-in Codes

```sql
select code, is_active
from checkin_codes
order by code;
```

---

## 23.4 Check Default Certificate Template

```sql
select template_name, is_default, is_active
from certificate_templates
where is_default = true;
```

---

## 23.5 Check Stamp Definitions

```sql
select a.name_en, s.stamp_name_en
from stamp_definitions s
join attractions a on a.attraction_id = s.attraction_id;
```

---

## 24. Seed Data Acceptance Checklist

Seed setup is complete when:

```text
[ ] Countries exist.
[ ] Target provinces exist and are flagged.
[ ] Districts exist for target provinces.
[ ] Attraction types exist.
[ ] Travel companion options exist.
[ ] Transport mode options exist.
[ ] Travel purpose options exist.
[ ] Expense categories exist.
[ ] Sample attractions exist.
[ ] Sample photo spots exist.
[ ] Sample check-in codes exist.
[ ] Default certificate template exists.
[ ] Stamp definitions exist.
[ ] Admin roles exist if role system is implemented.
[ ] Demo data is fake and clearly separated.
[ ] Public pages can load seeded attractions.
[ ] QR route can resolve seeded check-in codes.
[ ] Forms can load dropdown values.
[ ] Dashboard can show data after demo visits.
```

---

## 25. Common Seed Data Mistakes

Avoid:

```text
Using real personal data.
Using real LINE IDs.
Using unverified precise attraction facts.
Mixing demo data with production seeds.
Using free-text values instead of master data.
Forgetting English labels for foreign tourists.
Creating QR codes that do not map to attractions.
Creating attractions without target province links.
Creating certificate templates with broken paths.
Creating demo visits without related tourist records.
```

---

## 26. Future Seed Enhancements

Future phases may add:

```text
campaign seed data
tourism route seed data
badge definitions
partner business categories
coupon examples
official tourism data samples
LINE rich menu configuration samples
email template samples
dashboard summary seed data
```

Do not add these before MVP needs them.

---

## 27. Final Seed Rule

Seed data should make the system useful, testable, and demo-ready without polluting the project with fake production facts.

Master data should be stable.

Demo data should be clearly fake.
