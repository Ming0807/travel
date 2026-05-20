# DATA_DICTIONARY.md

## 1. Document Purpose

This document defines the initial data dictionary for the **Southern Border Tourism Data & Intelligence Platform**.

It describes the main database tables, columns, data types, purposes, constraints, and notes.

This document is written for MVP planning and should be updated whenever the database schema changes.

---

## 2. Data Dictionary Rules

## 2.1 Naming

Use snake_case for table and column names.

Examples:

```text
tourist_id
attraction_id
created_at
is_active
```

## 2.2 Primary Keys

Use descriptive primary keys.

Examples:

```text
tourist_id
visit_id
attraction_id
certificate_id
```

## 2.3 Data Types

The exact SQL type may vary depending on migration style, but PostgreSQL/Supabase is assumed.

Common types:

```text
bigint generated always as identity
uuid
text
varchar
integer
numeric
boolean
date
timestamptz
jsonb
```

## 2.4 Required Timestamps

Most tables should include:

```text
created_at timestamptz default now()
updated_at timestamptz
```

Transactional event tables may use specific timestamps such as:

```text
visited_at
uploaded_at
generated_at
earned_at
completed_at
consented_at
event_time
```

## 2.5 Soft Delete and Status

Important records should usually be deactivated instead of hard deleted.

Use:

```text
is_active
is_published
status
deleted_at
```

where appropriate.

---

## 3. Table: countries

## 3.1 Purpose

Stores country master data for tourist origin and foreign tourist support.

## 3.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| country_id | bigint identity | yes | Primary key |
| country_name_en | varchar(150) | yes | Country name in English |
| country_name_th | varchar(150) | no | Country name in Thai |
| iso2_code | char(2) | no | ISO 3166-1 alpha-2 code |
| iso3_code | char(3) | no | ISO 3166-1 alpha-3 code |
| is_active | boolean | yes | Whether this country is active for selection |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 3.3 Constraints

```text
primary key(country_id)
unique(iso2_code)
unique(iso3_code)
```

## 3.4 Notes

Use this for foreign tourist origin instead of free-text country fields.

---

## 4. Table: provinces

## 4.1 Purpose

Stores Thai provinces.

Used for attraction location and domestic tourist origin.

## 4.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| province_id | bigint identity | yes | Primary key |
| province_name_th | varchar(150) | yes | Province name in Thai |
| province_name_en | varchar(150) | yes | Province name in English |
| region_name | varchar(150) | no | Region name |
| is_target_area | boolean | yes | True for Yala, Pattani, Narathiwat |
| is_active | boolean | yes | Whether available for selection |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 4.3 Constraints

```text
primary key(province_id)
unique(province_name_th)
unique(province_name_en)
```

## 4.4 Notes

Target provinces:

```text
Yala
Pattani
Narathiwat
```

---

## 5. Table: districts

## 5.1 Purpose

Stores districts under provinces.

## 5.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| district_id | bigint identity | yes | Primary key |
| province_id | bigint | yes | Foreign key to provinces |
| district_name_th | varchar(150) | yes | District name in Thai |
| district_name_en | varchar(150) | no | District name in English |
| is_active | boolean | yes | Whether available for selection |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 5.3 Constraints

```text
primary key(district_id)
foreign key(province_id) references provinces(province_id)
unique(province_id, district_name_th)
```

---

## 6. Table: attraction_types

## 6.1 Purpose

Stores attraction type master data.

## 6.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| attraction_type_id | bigint identity | yes | Primary key |
| type_name_th | varchar(150) | yes | Type name in Thai |
| type_name_en | varchar(150) | yes | Type name in English |
| description | text | no | Optional description |
| is_active | boolean | yes | Whether active |
| display_order | integer | no | Display order |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 6.3 Example Values

```text
Nature
Cultural
Religious
Historical
Community-based
Beach/Coastal
Food tourism
Viewpoint
Adventure
```

---

## 7. Table: attractions

## 7.1 Purpose

Stores tourism attraction master data.

This is one of the core tables in the platform.

## 7.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| attraction_id | bigint identity | yes | Primary key |
| province_id | bigint | yes | Province where attraction is located |
| district_id | bigint | no | District where attraction is located |
| attraction_type_id | bigint | no | Attraction type |
| slug | varchar(200) | yes | URL-friendly unique slug |
| name_th | varchar(255) | yes | Attraction name in Thai |
| name_en | varchar(255) | no | Attraction name in English |
| short_description_th | text | no | Short Thai description |
| short_description_en | text | no | Short English description |
| description_th | text | no | Full Thai description |
| description_en | text | no | Full English description |
| history_th | text | no | Thai history/background |
| history_en | text | no | English history/background |
| latitude | numeric(10,7) | no | Latitude |
| longitude | numeric(10,7) | no | Longitude |
| address_text | text | no | Non-sensitive public address |
| opening_hours | varchar(255) | no | Opening hours text |
| contact_info | varchar(255) | no | Public contact info |
| sustainability_category | varchar(100) | no | Sustainability category |
| estimated_capacity_per_day | integer | no | Estimated visitor capacity |
| is_published | boolean | yes | Public visibility |
| is_active | boolean | yes | Active status |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 7.3 Constraints

```text
primary key(attraction_id)
foreign key(province_id) references provinces(province_id)
foreign key(district_id) references districts(district_id)
foreign key(attraction_type_id) references attraction_types(attraction_type_id)
unique(slug)
```

## 7.4 Notes

This table should support public attraction pages and dashboard filters.

---

## 8. Table: attraction_images

## 8.1 Purpose

Stores attraction image gallery metadata.

## 8.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| image_id | bigint identity | yes | Primary key |
| attraction_id | bigint | yes | Foreign key to attractions |
| storage_path | text | yes | File path in storage |
| alt_text_th | varchar(255) | no | Thai alt text |
| alt_text_en | varchar(255) | no | English alt text |
| caption_th | varchar(255) | no | Thai caption |
| caption_en | varchar(255) | no | English caption |
| display_order | integer | no | Display order |
| is_cover | boolean | yes | Whether image is cover image |
| is_active | boolean | yes | Whether image is active |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 8.3 Constraints

```text
primary key(image_id)
foreign key(attraction_id) references attractions(attraction_id)
```

---

## 9. Table: attraction_360_media

## 9.1 Purpose

Stores 360-degree media references for attractions.

## 9.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| media_id | bigint identity | yes | Primary key |
| attraction_id | bigint | yes | Foreign key to attractions |
| media_type | varchar(50) | yes | panorama, video360, embed, external_url |
| media_url | text | yes | Media URL or storage path |
| title_th | varchar(255) | no | Thai title |
| title_en | varchar(255) | no | English title |
| description_th | text | no | Thai description |
| description_en | text | no | English description |
| display_order | integer | no | Display order |
| is_active | boolean | yes | Whether active |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 9.3 MVP Status

Optional in MVP.

---

## 10. Table: photo_spots

## 10.1 Purpose

Stores prepared photo spots at attractions.

## 10.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| photo_spot_id | bigint identity | yes | Primary key |
| attraction_id | bigint | yes | Foreign key to attractions |
| spot_name_th | varchar(255) | yes | Photo spot name in Thai |
| spot_name_en | varchar(255) | no | Photo spot name in English |
| description_th | text | no | Thai description |
| description_en | text | no | English description |
| sample_image_path | text | no | Optional sample image path |
| latitude | numeric(10,7) | no | Optional latitude |
| longitude | numeric(10,7) | no | Optional longitude |
| display_order | integer | no | Display order |
| is_active | boolean | yes | Whether active |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 10.3 Constraints

```text
primary key(photo_spot_id)
foreign key(attraction_id) references attractions(attraction_id)
```

---

## 11. Table: checkin_codes

## 11.1 Purpose

Stores QR/check-in codes.

A check-in code is the database record behind a physical QR code.

## 11.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| checkin_code_id | bigint identity | yes | Primary key |
| code | varchar(100) | yes | Unique public code used in URL |
| attraction_id | bigint | yes | Linked attraction |
| photo_spot_id | bigint | no | Linked photo spot |
| campaign_id | bigint | no | Future campaign reference |
| label | varchar(255) | no | Admin label |
| is_active | boolean | yes | Whether QR is active |
| starts_at | timestamptz | no | Optional start time |
| ends_at | timestamptz | no | Optional end time |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 11.3 Constraints

```text
primary key(checkin_code_id)
unique(code)
foreign key(attraction_id) references attractions(attraction_id)
foreign key(photo_spot_id) references photo_spots(photo_spot_id)
```

## 11.4 Notes

Do not create separate QR codes for LINE, guest, and foreign users.

One QR should route to the same PWA entry point.

---

## 12. Table: tourists

## 12.1 Purpose

Stores tourist profile-level data.

This table should not store visit-specific information.

## 12.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| tourist_id | bigint identity | yes | Primary key |
| display_name | varchar(150) | yes | Name shown on certificate |
| origin_country_id | bigint | no | Origin country |
| origin_province_id | bigint | no | Origin province for Thai tourists |
| age_group | varchar(50) | no | Age group |
| preferred_language | varchar(10) | no | th, en, ms, etc. |
| profile_completed_at | timestamptz | no | When minimal profile was completed |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 12.3 Constraints

```text
primary key(tourist_id)
foreign key(origin_country_id) references countries(country_id)
foreign key(origin_province_id) references provinces(province_id)
```

## 12.4 Privacy Notes

Do not require legal name.

Do not store full address.

---

## 13. Table: tourist_identities

## 13.1 Purpose

Stores identity methods used to recognize a tourist.

## 13.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| identity_id | bigint identity | yes | Primary key |
| tourist_id | bigint | yes | Foreign key to tourists |
| provider | varchar(50) | yes | Identity provider |
| provider_user_id | text | yes | Provider-specific ID |
| is_primary | boolean | yes | Whether this is primary identity |
| last_seen_at | timestamptz | no | Last time this identity was used |
| created_at | timestamptz | yes | Record creation time |

## 13.3 Allowed Providers

```text
anonymous_device
line
email
google
```

## 13.4 Constraints

```text
primary key(identity_id)
foreign key(tourist_id) references tourists(tourist_id)
unique(provider, provider_user_id)
```

---

## 14. Table: tourist_contacts

## 14.1 Purpose

Stores optional contact details.

## 14.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| contact_id | bigint identity | yes | Primary key |
| tourist_id | bigint | yes | Foreign key to tourists |
| contact_type | varchar(50) | yes | email, phone, line |
| contact_value | text | yes | Contact value |
| is_verified | boolean | yes | Whether verified |
| is_primary | boolean | yes | Whether primary |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 14.3 MVP Status

Optional.

If email identity is implemented, contact may be useful.

---

## 15. Table: consent_logs

## 15.1 Purpose

Stores consent records.

## 15.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| consent_id | bigint identity | yes | Primary key |
| tourist_id | bigint | no | Linked tourist |
| visit_id | bigint | no | Linked visit |
| consent_version | varchar(50) | yes | Consent notice version |
| purpose | text | yes | Purpose of data collection |
| has_consented | boolean | yes | Consent status |
| consented_at | timestamptz | yes | Consent timestamp |
| source | varchar(100) | no | web, liff, admin, import |
| ip_hash | text | no | Optional hashed IP |
| user_agent_hash | text | no | Optional hashed user agent |

## 15.3 Constraints

```text
primary key(consent_id)
foreign key(tourist_id) references tourists(tourist_id)
foreign key(visit_id) references visits(visit_id)
```

## 15.4 Notes

Use hashed metadata if tracking technical context.

Do not store unnecessary raw personal data.

---

## 16. Table: visits

## 16.1 Purpose

Stores each tourist visit or participation event.

This is the main transactional tourism data table.

## 16.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| visit_id | bigint identity | yes | Primary key |
| tourist_id | bigint | yes | Foreign key to tourists |
| attraction_id | bigint | yes | Foreign key to attractions |
| photo_spot_id | bigint | no | Foreign key to photo_spots |
| checkin_code_id | bigint | no | Foreign key to checkin_codes |
| visit_date | date | yes | Date tourist visited |
| visited_at | timestamptz | no | Exact participation timestamp |
| travel_companion_id | bigint | no | Travel companion reference |
| transport_mode_id | bigint | no | Transport mode reference |
| travel_purpose_id | bigint | no | Travel purpose reference |
| group_size | integer | no | Number of people in group |
| overnight_status | varchar(50) | no | same_day, overnight, unknown |
| nights | integer | no | Number of nights |
| completion_status | varchar(50) | yes | Flow status |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 16.3 Constraints

```text
primary key(visit_id)
foreign key(tourist_id) references tourists(tourist_id)
foreign key(attraction_id) references attractions(attraction_id)
foreign key(photo_spot_id) references photo_spots(photo_spot_id)
foreign key(checkin_code_id) references checkin_codes(checkin_code_id)
foreign key(travel_companion_id) references travel_companions(travel_companion_id)
foreign key(transport_mode_id) references transport_modes(transport_mode_id)
foreign key(travel_purpose_id) references travel_purposes(travel_purpose_id)
check(group_size is null or group_size >= 1)
check(nights is null or nights >= 0)
```

## 16.4 Completion Status Values

```text
started
minimal_form_completed
photo_uploaded
certificate_generated
survey_completed
abandoned
```

---

## 17. Table: visit_photos

## 17.1 Purpose

Stores uploaded tourist photo metadata.

## 17.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| photo_id | bigint identity | yes | Primary key |
| visit_id | bigint | yes | Foreign key to visits |
| storage_path | text | yes | Storage path |
| thumbnail_path | text | no | Thumbnail path |
| original_filename | varchar(255) | no | Original file name |
| mime_type | varchar(100) | yes | File MIME type |
| file_size_bytes | integer | yes | File size |
| width | integer | no | Image width |
| height | integer | no | Image height |
| approval_status | varchar(50) | yes | pending, approved, rejected |
| uploaded_at | timestamptz | yes | Upload timestamp |

## 17.3 Constraints

```text
primary key(photo_id)
foreign key(visit_id) references visits(visit_id)
check(file_size_bytes > 0)
```

## 17.4 Allowed MIME Types

```text
image/jpeg
image/png
image/webp
```

---

## 18. Table: certificate_templates

## 18.1 Purpose

Stores certificate template configuration.

## 18.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| template_id | bigint identity | yes | Primary key |
| template_name | varchar(150) | yes | Template name |
| attraction_id | bigint | no | Optional attraction-specific template |
| background_path | text | no | Background image path |
| layout_config_json | jsonb | no | Layout configuration |
| language | varchar(10) | no | Template language |
| is_default | boolean | yes | Whether default template |
| is_active | boolean | yes | Whether active |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 18.3 Constraints

```text
primary key(template_id)
foreign key(attraction_id) references attractions(attraction_id)
```

---

## 19. Table: certificates

## 19.1 Purpose

Stores generated certificate records.

## 19.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| certificate_id | bigint identity | yes | Primary key |
| visit_id | bigint | yes | Foreign key to visits |
| template_id | bigint | yes | Foreign key to certificate_templates |
| photo_id | bigint | no | Foreign key to visit_photos |
| certificate_path | text | yes | Generated certificate file path |
| share_url | text | no | Public or signed share URL |
| generated_at | timestamptz | yes | Generation timestamp |
| download_count | integer | yes | Number of downloads |
| created_at | timestamptz | yes | Record creation time |

## 19.3 Constraints

```text
primary key(certificate_id)
foreign key(visit_id) references visits(visit_id)
foreign key(template_id) references certificate_templates(template_id)
foreign key(photo_id) references visit_photos(photo_id)
check(download_count >= 0)
```

---

## 20. Table: stamp_definitions

## 20.1 Purpose

Stores stamp metadata and design references.

## 20.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| stamp_definition_id | bigint identity | yes | Primary key |
| attraction_id | bigint | yes | Linked attraction |
| stamp_name_th | varchar(150) | yes | Thai stamp name |
| stamp_name_en | varchar(150) | no | English stamp name |
| description_th | text | no | Thai description |
| description_en | text | no | English description |
| stamp_image_path | text | no | Stamp image path |
| is_active | boolean | yes | Whether active |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 20.3 Constraints

```text
primary key(stamp_definition_id)
foreign key(attraction_id) references attractions(attraction_id)
```

---

## 21. Table: tourist_stamps

## 21.1 Purpose

Stores earned tourist stamps.

## 21.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| stamp_id | bigint identity | yes | Primary key |
| tourist_id | bigint | yes | Foreign key to tourists |
| attraction_id | bigint | yes | Foreign key to attractions |
| visit_id | bigint | yes | Visit that earned the stamp |
| stamp_definition_id | bigint | yes | Stamp definition |
| earned_at | timestamptz | yes | Earned timestamp |
| status | varchar(50) | yes | earned, revoked |

## 21.3 Constraints

```text
primary key(stamp_id)
foreign key(tourist_id) references tourists(tourist_id)
foreign key(attraction_id) references attractions(attraction_id)
foreign key(visit_id) references visits(visit_id)
foreign key(stamp_definition_id) references stamp_definitions(stamp_definition_id)
unique(tourist_id, attraction_id)
```

---

## 22. Table: travel_companions

## 22.1 Purpose

Stores travel companion options.

## 22.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| travel_companion_id | bigint identity | yes | Primary key |
| name_th | varchar(150) | yes | Thai name |
| name_en | varchar(150) | yes | English name |
| display_order | integer | no | Display order |
| is_active | boolean | yes | Whether active |

## 22.3 Example Values

```text
Alone
Family
Friends
Partner
Tour group
School group
Work group
```

---

## 23. Table: transport_modes

## 23.1 Purpose

Stores transport mode options.

## 23.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| transport_mode_id | bigint identity | yes | Primary key |
| name_th | varchar(150) | yes | Thai name |
| name_en | varchar(150) | yes | English name |
| display_order | integer | no | Display order |
| is_active | boolean | yes | Whether active |

## 23.3 Example Values

```text
Private car
Motorcycle
Van
Bus
Train
Airplane
Walking
Tour vehicle
```

---

## 24. Table: travel_purposes

## 24.1 Purpose

Stores travel purpose options.

## 24.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| travel_purpose_id | bigint identity | yes | Primary key |
| name_th | varchar(150) | yes | Thai name |
| name_en | varchar(150) | yes | English name |
| display_order | integer | no | Display order |
| is_active | boolean | yes | Whether active |

## 24.3 Example Values

```text
Leisure
Nature tourism
Cultural tourism
Religious tourism
Food tourism
Family visit
Work
Education
```

---

## 25. Table: expense_categories

## 25.1 Purpose

Stores expense category options.

## 25.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| expense_category_id | bigint identity | yes | Primary key |
| name_th | varchar(150) | yes | Thai name |
| name_en | varchar(150) | yes | English name |
| display_order | integer | no | Display order |
| is_active | boolean | yes | Whether active |

## 25.3 Example Values

```text
Food
Accommodation
Transport
Shopping
Souvenir
Activity
Guide
Other
```

---

## 26. Table: visit_expenses

## 26.1 Purpose

Stores spending data linked to a visit.

## 26.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| expense_id | bigint identity | yes | Primary key |
| visit_id | bigint | yes | Foreign key to visits |
| expense_category_id | bigint | no | Expense category |
| spending_range | varchar(100) | yes | Spending range label/code |
| amount_min | numeric(12,2) | no | Minimum estimated amount |
| amount_max | numeric(12,2) | no | Maximum estimated amount |
| currency_code | char(3) | yes | Currency code, default THB |
| created_at | timestamptz | yes | Record creation time |

## 26.3 Constraints

```text
primary key(expense_id)
foreign key(visit_id) references visits(visit_id)
foreign key(expense_category_id) references expense_categories(expense_category_id)
```

## 26.4 Notes

MVP should collect spending range rather than exact amount.

---

## 27. Table: satisfaction_surveys

## 27.1 Purpose

Stores structured satisfaction data.

## 27.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| satisfaction_id | bigint identity | yes | Primary key |
| visit_id | bigint | yes | Foreign key to visits |
| attraction_id | bigint | yes | Foreign key to attractions |
| overall_score | integer | no | Overall satisfaction score 1-5 |
| safety_score | integer | no | Safety score 1-5 |
| cleanliness_score | integer | no | Cleanliness score 1-5 |
| transport_score | integer | no | Transport/accessibility score 1-5 |
| information_score | integer | no | Information/signage score 1-5 |
| service_score | integer | no | Service score 1-5 |
| value_for_money_score | integer | no | Value for money score 1-5 |
| revisit_intention | boolean | no | Whether tourist intends to revisit |
| recommendation_intention | boolean | no | Whether tourist would recommend |
| comment | text | no | Optional comment |
| completed_at | timestamptz | no | Completion timestamp |

## 27.3 Constraints

```text
primary key(satisfaction_id)
foreign key(visit_id) references visits(visit_id)
foreign key(attraction_id) references attractions(attraction_id)
unique(visit_id)
check(overall_score between 1 and 5)
check(safety_score between 1 and 5)
check(cleanliness_score between 1 and 5)
check(transport_score between 1 and 5)
check(information_score between 1 and 5)
check(service_score between 1 and 5)
check(value_for_money_score between 1 and 5)
```

Note:

PostgreSQL check constraints must handle nullable values correctly.

---

## 28. Table: survey_questions

## 28.1 Purpose

Stores configurable survey questions.

## 28.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| question_id | bigint identity | yes | Primary key |
| question_key | varchar(100) | yes | Stable question key |
| question_text_th | text | yes | Thai question |
| question_text_en | text | no | English question |
| answer_type | varchar(50) | yes | text, number, single_choice, multi_choice, rating |
| options_json | jsonb | no | Options for choice questions |
| is_required | boolean | yes | Whether required |
| is_active | boolean | yes | Whether active |
| display_order | integer | no | Display order |
| created_at | timestamptz | yes | Record creation time |

## 28.3 MVP Status

Optional.

---

## 29. Table: survey_answers

## 29.1 Purpose

Stores configurable survey answers.

## 29.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| answer_id | bigint identity | yes | Primary key |
| visit_id | bigint | yes | Foreign key to visits |
| question_id | bigint | yes | Foreign key to survey_questions |
| answer_text | text | no | Text answer |
| answer_number | numeric | no | Numeric answer |
| answer_json | jsonb | no | Structured answer |
| answered_at | timestamptz | yes | Answer timestamp |

## 29.3 Constraints

```text
primary key(answer_id)
foreign key(visit_id) references visits(visit_id)
foreign key(question_id) references survey_questions(question_id)
```

## 29.4 MVP Status

Optional.

---

## 30. Table: funnel_events

## 30.1 Purpose

Stores tourist flow events.

## 30.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| event_id | bigint identity | yes | Primary key |
| session_id | varchar(150) | no | Anonymous session ID |
| tourist_id | bigint | no | Linked tourist |
| visit_id | bigint | no | Linked visit |
| attraction_id | bigint | no | Linked attraction |
| photo_spot_id | bigint | no | Linked photo spot |
| checkin_code_id | bigint | no | Linked check-in code |
| event_name | varchar(100) | yes | Event name |
| event_time | timestamptz | yes | Event timestamp |
| metadata_json | jsonb | no | Extra metadata |

## 30.3 Constraints

```text
primary key(event_id)
foreign key(tourist_id) references tourists(tourist_id)
foreign key(visit_id) references visits(visit_id)
foreign key(attraction_id) references attractions(attraction_id)
foreign key(photo_spot_id) references photo_spots(photo_spot_id)
foreign key(checkin_code_id) references checkin_codes(checkin_code_id)
```

## 30.4 Event Name Values

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

---

## 31. Table: users

## 31.1 Purpose

Stores admin/staff user profile data.

If Supabase Auth is used, this table may reference auth user IDs.

## 31.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| user_id | uuid | yes | Primary key, may match Supabase auth user ID |
| display_name | varchar(150) | yes | User display name |
| email | varchar(255) | yes | User email |
| is_active | boolean | yes | Whether active |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 31.3 MVP Status

Required if admin auth is custom or role profile is needed.

---

## 32. Table: roles

## 32.1 Purpose

Stores admin roles.

## 32.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| role_id | bigint identity | yes | Primary key |
| role_key | varchar(100) | yes | Stable role key |
| role_name | varchar(150) | yes | Human-readable role name |
| description | text | no | Description |
| is_active | boolean | yes | Whether active |

## 32.3 Example Values

```text
super_admin
admin
staff
viewer
researcher
```

---

## 33. Table: permissions

## 33.1 Purpose

Stores permission keys.

## 33.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| permission_id | bigint identity | yes | Primary key |
| permission_key | varchar(150) | yes | Stable permission key |
| description | text | no | Permission description |

## 33.3 Example Values

```text
attraction.create
attraction.update
visit.read
dashboard.read
export.create
user.manage
```

---

## 34. Table: user_roles

## 34.1 Purpose

Maps users to roles.

## 34.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| user_id | uuid | yes | User ID |
| role_id | bigint | yes | Role ID |
| assigned_at | timestamptz | yes | Assignment timestamp |

## 34.3 Constraints

```text
primary key(user_id, role_id)
foreign key(user_id) references users(user_id)
foreign key(role_id) references roles(role_id)
```

---

## 35. Table: role_permissions

## 35.1 Purpose

Maps roles to permissions.

## 35.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| role_id | bigint | yes | Role ID |
| permission_id | bigint | yes | Permission ID |

## 35.3 Constraints

```text
primary key(role_id, permission_id)
foreign key(role_id) references roles(role_id)
foreign key(permission_id) references permissions(permission_id)
```

---

## 36. Table: audit_logs

## 36.1 Purpose

Stores important admin actions.

## 36.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| audit_log_id | bigint identity | yes | Primary key |
| actor_user_id | uuid | no | Admin user who performed action |
| action | varchar(150) | yes | Action key |
| entity_type | varchar(100) | no | Affected entity type |
| entity_id | text | no | Affected entity ID |
| old_values_json | jsonb | no | Previous values |
| new_values_json | jsonb | no | New values |
| ip_hash | text | no | Optional hashed IP |
| user_agent_hash | text | no | Optional hashed user agent |
| created_at | timestamptz | yes | Action timestamp |

## 36.3 Example Actions

```text
attraction.create
attraction.update
attraction.deactivate
photo_spot.create
checkin_code.deactivate
data.export
user.role_update
```

---

## 37. Table: data_import_logs

## 37.1 Purpose

Stores official or bulk data import history.

## 37.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| import_log_id | bigint identity | yes | Primary key |
| source_name | varchar(150) | yes | Source name |
| source_url | text | no | Source URL |
| import_type | varchar(100) | yes | attractions, stats, master_data |
| status | varchar(50) | yes | pending, success, failed |
| records_processed | integer | no | Number processed |
| error_message | text | no | Error details |
| imported_by | uuid | no | User ID |
| imported_at | timestamptz | yes | Import timestamp |

## 37.3 MVP Status

Optional.

---

## 38. Table: official_tourism_stats

## 38.1 Purpose

Stores official tourism statistics for future comparison.

## 38.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| official_stat_id | bigint identity | yes | Primary key |
| province_id | bigint | yes | Province |
| year | integer | yes | Year |
| month | integer | no | Month, nullable for annual stats |
| tourist_type | varchar(50) | no | thai, foreign, total |
| visitor_count | integer | no | Official visitor count |
| revenue_amount | numeric(14,2) | no | Official revenue amount |
| source_name | varchar(150) | no | Source name |
| source_url | text | no | Source URL |
| imported_at | timestamptz | yes | Import timestamp |

## 38.3 MVP Status

Phase 2.

---

## 39. Table: official_attraction_refs

## 39.1 Purpose

Stores links between local attractions and official attraction references.

## 39.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| official_ref_id | bigint identity | yes | Primary key |
| attraction_id | bigint | yes | Local attraction |
| source_name | varchar(150) | yes | Source name |
| external_id | varchar(150) | no | External ID |
| external_url | text | no | External URL |
| raw_data_json | jsonb | no | Raw imported metadata |
| linked_at | timestamptz | yes | Linked timestamp |

## 39.3 MVP Status

Phase 2.

---

## 40. Common Indexes

Recommended indexes:

```text
idx_attractions_province_id
idx_attractions_district_id
idx_attractions_type_id
idx_attractions_slug

idx_checkin_codes_code
idx_checkin_codes_attraction_id
idx_checkin_codes_photo_spot_id

idx_tourist_identities_provider_user
idx_tourists_origin_country
idx_tourists_origin_province

idx_visits_tourist_id
idx_visits_attraction_id
idx_visits_photo_spot_id
idx_visits_checkin_code_id
idx_visits_visit_date
idx_visits_created_at
idx_visits_attraction_date

idx_visit_photos_visit_id
idx_certificates_visit_id
idx_tourist_stamps_tourist_id
idx_tourist_stamps_attraction_id

idx_visit_expenses_visit_id
idx_visit_expenses_category_id
idx_satisfaction_surveys_visit_id
idx_satisfaction_surveys_attraction_id

idx_funnel_events_event_name
idx_funnel_events_event_time
idx_funnel_events_attraction_id
```

---

## 41. MVP Required Tables Summary

The MVP should include at least:

```text
countries
provinces
districts
attraction_types
attractions
attraction_images
photo_spots
checkin_codes
tourists
tourist_identities
consent_logs
visits
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
travel_companions
transport_modes
travel_purposes
expense_categories
visit_expenses
satisfaction_surveys
funnel_events
```

---

## 42. Update Rule

When a database migration changes any table or column, update this file.

Do not let the data dictionary become outdated.
