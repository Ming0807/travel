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
| destination_status | text | yes | Destination lifecycle: hidden, pilot, live, or retired. Never use for tourist origin filtering |
| destination_display_order | smallint | no | Ordering for destination selectors only |
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

`destination_status` controls public destination availability. It does not
replace `is_active`: `tourists.origin_province_id` uses this same master and
must continue to support every valid active Thai origin province.

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
| attraction_type_id | bigint | no | Compatibility primary attraction category; synchronized with `attraction_type_assignments` |
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

### 7.5 Table: attraction_type_assignments

Stores the controlled many-to-many category assignments for each attraction. A published attraction has exactly one primary assignment, while up to three additional assignments improve public and admin discovery.

| Column | Type | Required | Description |
|---|---:|---:|---|
| attraction_id | bigint | yes | Attraction foreign key; cascades on attraction deletion |
| attraction_type_id | bigint | yes | Attraction type foreign key |
| is_primary | boolean | yes | Whether this is the compatibility/dashboard primary category |
| display_order | integer | yes | Primary-first presentation order, zero or greater |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

Constraints include a composite primary key on `(attraction_id, attraction_type_id)` and a partial unique index allowing at most one primary assignment per attraction. Category sets are replaced atomically through `sync_attraction_types`. A database trigger rejects direct publication when `attractions.attraction_type_id` has no primary category, while the compatibility mirror keeps older primary-category consumers aligned.

---

## 8. Table: content_media

## 8.1 Purpose

Stores image, panorama, 360 media, embed, and external URL metadata for public content entities such as attractions, restaurants, accommodations, stories, and routes.

## 8.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| media_id | bigint identity | yes | Primary key |
| attraction_id | bigint | no | Foreign key to attractions |
| restaurant_id | bigint | no | Foreign key to restaurants |
| accommodation_id | bigint | no | Foreign key to accommodations |
| story_id | bigint | no | Foreign key to travel stories |
| route_id | bigint | no | Foreign key to suggested routes |
| media_type | varchar(50) | yes | image, panorama, video360, embed, external_url |
| storage_path | text | yes | Provider object reference or public external URL |
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
primary key(media_id)
foreign key(attraction_id) references attractions(attraction_id)
foreign key(restaurant_id) references restaurants(restaurant_id)
foreign key(accommodation_id) references accommodations(accommodation_id)
foreign key(story_id) references travel_stories(story_id)
foreign key(route_id) references suggested_routes(route_id)
check(exactly one entity foreign key is set)
check(media_type in ('image', 'panorama', 'video360', 'embed', 'external_url'))
```

---

## 9. Table: attraction_360_media

## 9.1 Purpose

Future normalized table for advanced 360-degree media workflows.

Current MVP stores 360 media and embed references in `content_media.media_type`.

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

Out of MVP as a separate table.

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
| tourist_id | uuid | yes | Primary key |
| display_name | varchar(150) | yes | Name shown on certificate |
| origin_country_id | bigint | no | Origin country |
| origin_province_id | bigint | no | Origin province for Thai tourists |
| age_group | varchar(50) | no | Age group |
| preferred_language | varchar(10) | no | Nullable controlled value: th, en, or ms. Missing detection remains null. |
| preferred_language_source | varchar(20) | no | Nullable provenance: detected or selected. |
| leaderboard_visibility | text | yes | Purpose-specific public leaderboard preference: private, alias, or display_name. Defaults to private. |
| leaderboard_alias | text | no | Optional public alias, 3-40 characters, used only for alias visibility. |
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

`display_name` is collected for the tourist experience and certificate. It must not be reused on a public leaderboard unless `leaderboard_visibility = 'display_name'` was explicitly selected.

Leaderboard withdrawal sets visibility back to `private` and records a purpose-specific consent withdrawal event. Public DTOs must never include `tourist_id` or provider identity values.

---

## 13. Table: tourist_identities

## 13.1 Purpose

Stores identity methods used to recognize a tourist.

## 13.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| identity_id | uuid | yes | Primary key |
| tourist_id | uuid | yes | Foreign key to tourists |
| provider | varchar(50) | yes | Identity provider |
| provider_user_id | text | yes | Provider-specific ID |
| is_primary | boolean | yes | Whether this is primary identity |
| linked_at | timestamptz | no | Time identity was linked |
| last_seen_at | timestamptz | no | Last time this identity was used |
| metadata_json | jsonb | no | Safe provider metadata |
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

This table is not part of the current MVP migrations. Optional LINE/Google/email links are represented by `tourist_identities`.

## 14.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| contact_id | bigint identity | yes | Primary key |
| tourist_id | uuid | yes | Foreign key to tourists |
| contact_type | varchar(50) | yes | email, phone, line |
| contact_value | text | yes | Contact value |
| is_verified | boolean | yes | Whether verified |
| is_primary | boolean | yes | Whether primary |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 14.3 MVP Status

Out of MVP as a separate table.

If email identity is implemented, contact may be useful.

---

## 15. Table: consent_records

## 15.1 Purpose

Stores consent records.

## 15.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| consent_id | uuid | yes | Primary key |
| tourist_id | uuid | no | Linked tourist |
| visit_id | uuid | no | Linked visit, added for account-linking/visit consent |
| consent_version | varchar(50) | yes | Consent notice version |
| purpose | text | yes | Purpose of data collection |
| consent_type | varchar(100) | no | Consent grouping, such as account_linking |
| purpose_key | varchar(150) | no | Stable purpose key, such as passport_recovery |
| has_consented | boolean | yes | Consent status |
| consented_at | timestamptz | yes | Consent timestamp |
| withdrawn_at | timestamptz | no | Withdrawal timestamp |
| source | varchar(100) | no | web, liff, admin, import |
| language | varchar(10) | no | Consent language |
| ip_hash | text | no | Optional hashed IP |
| user_agent_hash | text | no | Optional hashed user agent |
| metadata_json | jsonb | no | Safe consent metadata |

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
| visit_id | uuid | yes | Primary key |
| tourist_id | uuid | yes | Foreign key to tourists |
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
| entry_channel | varchar(30) | yes | Observed entry source: `qr`, `nfc`, `direct`, `admin_import`, or `unknown`; historical rows remain `unknown` when attribution is unsupported |
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
| photo_id | uuid | yes | Primary key |
| visit_id | uuid | yes | Foreign key to visits |
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

## 17.5 Storage Provider Notes

`storage_path` stores a provider reference, not a public URL.

MVP development and Vercel deployment may store Cloudinary-qualified references. Supabase Storage fallback may store plain object paths.

Do not expose this field in public UI, dashboards, or default exports.

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
unique default per language where attraction_id is null
unique default per attraction and language where attraction_id is not null
check(not is_default or is_active)
```

`layout_config_json.orientation` is normalized to `landscape` or `portrait`. Default switching is
performed atomically by `public.set_certificate_template_default(bigint)`, executable only by the
`service_role` after application-level permission checks.

Current `layout_config_json` contract (version 1):

```text
orientation, theme, photoShape
photoX, photoY, photoSize
contentX, contentY, contentWidth, textAlign
overlayOpacity, textColor, accentColor, titleScale
safeMargin, showProvince, showDate
```

Positions and sizes use bounded percentages so the same renderer works on mobile preview and the
generated certificate image.

---

## 19. Table: certificates

## 19.1 Purpose

Stores generated certificate records.

## 19.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| certificate_id | uuid | yes | Primary key |
| visit_id | uuid | yes | Foreign key to visits |
| template_id | bigint | yes | Foreign key to certificate_templates |
| photo_id | uuid | no | Foreign key to visit_photos |
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

## 19.4 Storage Provider Notes

`certificate_path` stores a provider reference, not a permanent signed URL.

Certificate display/download URLs must be generated server-side and should be short-lived or otherwise controlled.

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
| stamp_id | uuid | yes | Primary key |
| tourist_id | uuid | yes | Foreign key to tourists |
| attraction_id | bigint | yes | Foreign key to attractions |
| visit_id | uuid | yes | Visit that earned the stamp |
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

## 21A. Table: suggested_routes

## 21A.1 Purpose

Stores curated public travel routes. Route records are public content and should reference existing attraction records through `suggested_route_stops` instead of duplicating attraction data.

## 21A.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| route_id | bigint identity | yes | Primary key |
| slug | varchar(200) | yes | Public URL slug for `/routes/[slug]`, unique |
| name_th | varchar(255) | yes | Thai route name |
| name_en | varchar(255) | no | English route name |
| description_th | text | no | Thai route description |
| description_en | text | no | English route description |
| cover_image_path | text | no | Public-safe route cover image path |
| is_published | boolean | yes | Public visibility |
| is_active | boolean | yes | Active status |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 21A.3 Constraints

```text
primary key(route_id)
unique(slug)
unique(name_en) where name_en is not null
public read only when is_published = true and is_active = true
```

## 21A.4 Notes

The `slug` column was added by migration `20260528002000_add_suggested_route_slugs.sql` so admin route previews and public route pages use the same stable URL model.

---

## 21B. Table: suggested_route_stops

## 21B.1 Purpose

Stores the ordered attraction stops inside a curated travel route.

## 21B.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| stop_id | bigint identity | yes | Primary key |
| route_id | bigint | yes | Foreign key to suggested routes |
| attraction_id | bigint | yes | Foreign key to attractions |
| day_number | integer | yes | Route day number |
| display_order | integer | yes | Stop order within the day |
| stop_note_th | text | no | Thai stop note |
| stop_note_en | text | no | English stop note |
| created_at | timestamptz | yes | Record creation time |

## 21B.3 Constraints

```text
primary key(stop_id)
foreign key(route_id) references suggested_routes(route_id)
foreign key(attraction_id) references attractions(attraction_id)
unique(route_id, day_number, display_order)
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
| expense_id | uuid | yes | Primary key |
| visit_id | uuid | yes | Foreign key to visits |
| expense_category_id | bigint | no | Expense category |
| estimated_amount | numeric(12,2) | no | Optional self-reported estimated amount |
| spending_range_id | bigint | no | Spending range reference |
| created_at | timestamptz | yes | Record creation time |

## 26.3 Constraints

```text
primary key(expense_id)
foreign key(visit_id) references visits(visit_id)
foreign key(expense_category_id) references expense_categories(expense_category_id)
foreign key(spending_range_id) references spending_ranges(spending_range_id)
unique(visit_id)
check(estimated_amount is null or estimated_amount >= 0)
```

## 26.4 Notes

MVP should collect spending range rather than exact amount. The optional survey
stores at most one current expense answer per visit. Re-submission updates that
row, and clearing both expense fields removes it.

---

## 27. Table: satisfaction_surveys

## 27.1 Purpose

Stores structured satisfaction data.

## 27.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| survey_id | uuid | yes | Primary key |
| visit_id | uuid | yes | Foreign key to visits |
| tourist_id | uuid | yes | Foreign key to tourists |
| attraction_id | bigint | no | Denormalized attraction for dashboard filtering |
| overall_score | integer | no | Overall satisfaction score 1-5 |
| facility_score | integer | no | Current optional facility score 1-5 |
| safety_score | integer | no | Safety score 1-5 |
| cleanliness_score | integer | no | Cleanliness score 1-5 |
| accessibility_score | integer | no | Accessibility score 1-5 |
| information_score | integer | no | Information/signage score 1-5 |
| value_score | integer | no | Value score 1-5 |
| revisit_intention | varchar(50) | no | yes, no, maybe |
| recommend_intention | varchar(50) | no | yes, no, maybe |
| comments | text | no | Optional comment |
| submitted_at | timestamptz | yes | Submitted timestamp |
| completed_at | timestamptz | no | Preferred survey completion timestamp |
| survey_instrument_version | varchar(50) | no | Nullable non-empty version marker for the tourism survey instrument; final research instruments remain separate |

## 27.3 Constraints

```text
primary key(survey_id)
foreign key(visit_id) references visits(visit_id)
foreign key(tourist_id) references tourists(tourist_id)
foreign key(attraction_id) references attractions(attraction_id)
unique(visit_id)
check(overall_score between 1 and 5)
check(facility_score between 1 and 5)
check(safety_score between 1 and 5)
check(cleanliness_score between 1 and 5)
check(accessibility_score between 1 and 5)
check(information_score between 1 and 5)
check(value_score between 1 and 5)
```

Note:

PostgreSQL check constraints must handle nullable values correctly.

---

## 28. Future Table: survey_questions

## 28.1 Purpose

Stores configurable survey questions.

This table is not part of the current MVP migrations. The MVP uses fixed optional micro-survey columns in `visits`, `satisfaction_surveys`, and `visit_expenses`.

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

Out of MVP / future dynamic survey engine.

---

## 29. Future Table: survey_answers

## 29.1 Purpose

Stores configurable survey answers.

This table is not part of the current MVP migrations. Do not build dashboard or export logic against it until a future dynamic survey migration is added.

## 29.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| answer_id | bigint identity | yes | Primary key |
| visit_id | uuid | yes | Foreign key to visits |
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

Out of MVP / future dynamic survey engine.

---

## 30. Table: funnel_events

## 30.1 Purpose

Stores tourist flow events.

## 30.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| event_id | uuid | yes | Primary key |
| tourist_id | uuid | no | Linked tourist |
| visit_id | uuid | no | Linked visit |
| checkin_code_id | bigint | no | Linked check-in code |
| event_type | varchar(100) | yes | Event type |
| event_time | timestamptz | yes | Event timestamp |
| metadata | jsonb | no | Extra metadata |

## 30.3 Constraints

```text
primary key(event_id)
foreign key(tourist_id) references tourists(tourist_id)
foreign key(visit_id) references visits(visit_id)
foreign key(checkin_code_id) references checkin_codes(checkin_code_id)
```

## 30.4 Event Type Values

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

## 31. Table: admin_users

## 31.1 Purpose

Stores admin/staff user profile data.

If Supabase Auth is used, this table may reference auth user IDs.

## 31.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| admin_id | uuid | yes | Primary key |
| email | varchar(255) | yes | User email |
| auth_user_id | uuid | no | Optional Supabase auth user ID |
| display_name | varchar(150) | no | User display name |
| is_active | boolean | yes | Whether active |
| last_login_at | timestamptz | no | Last login timestamp |
| created_at | timestamptz | yes | Record creation time |
| updated_at | timestamptz | no | Last update time |

## 31.3 MVP Status

Required for admin auth and permission checks.

---

## 32. Table: roles

## 32.1 Purpose

Stores admin roles.

## 32.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| role_id | bigint identity | yes | Primary key |
| role_name | varchar(50) | yes | Stable role key/name |
| description | text | no | Description |
| is_active | boolean | yes | Whether active |
| created_at | timestamptz | yes | Record creation time |

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
| permission_name | varchar(100) | yes | Stable permission key |
| description | text | no | Permission description |
| created_at | timestamptz | yes | Record creation time |

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

## 34. Table: admin_user_roles

## 34.1 Purpose

Maps admin users to roles.

## 34.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| admin_id | uuid | yes | Admin user ID |
| role_id | bigint | yes | Role ID |
| assigned_at | timestamptz | yes | Assignment timestamp |

## 34.3 Constraints

```text
primary key(admin_id, role_id)
foreign key(admin_id) references admin_users(admin_id)
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
| log_id | uuid | yes | Primary key |
| admin_id | uuid | no | Admin user who performed action |
| action | varchar(150) | yes | Action key |
| entity_type | varchar(100) | no | Affected entity type |
| entity_id | text | no | Affected entity ID |
| old_data | jsonb | no | Previous safe values |
| new_data | jsonb | no | New safe values |
| ip_address | varchar(45) | no | Optional admin request IP if stored |
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

## 37. Table: travel_stories

## 37.1 Purpose

Stores public travel story content for the tourism portal and SEO-friendly discovery pages.

Stories are public content, not private tourist records. They must not contain private tourist identifiers.

## 37.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| story_id | bigint identity | yes | Primary key |
| slug | varchar(200) | yes | Public URL slug, unique |
| title | varchar(255) | yes | Story title |
| excerpt | text | no | Short summary for cards |
| content | text | no | Story body or editorial content |
| province_id | bigint | no | Optional related province |
| category | varchar(100) | no | Editorial category |
| image_url | text | no | Public image URL or safe media reference |
| is_published | boolean | yes | Whether story is public |
| published_at | timestamptz | no | Publication timestamp |
| created_at | timestamptz | yes | Created timestamp |
| updated_at | timestamptz | no | Updated timestamp |
| content_document | jsonb | no | Canonical versioned TipTap document for structured editorial content |
| content_schema_version | integer | yes | Structured document schema version, default 1 |
| primary_language | varchar(10) | yes | th, en, or ms |
| geographic_scope | varchar(30) | yes | province or cross_province |
| seo_title | varchar(255) | no | Story-specific SEO title |
| seo_description | varchar(320) | no | Story-specific SEO description |
| scheduled_at | timestamptz | no | Future publication time for scheduled stories |
| first_published_at | timestamptz | no | First publication time retained across later drafts |
| archived_at | timestamptz | no | Archive timestamp |
| reviewed_by | uuid | no | Admin who most recently reviewed the story |
| reviewed_at | timestamptz | no | Most recent review timestamp |
| reading_minutes | integer | no | Validated reading-time estimate from 1 to 240 minutes |
| content_quality_score | integer | no | Publish-readiness score from 0 to 100 |

## 37.3 Constraints and Access Rules

```text
primary key(story_id)
unique(slug)
foreign key(province_id) references provinces(province_id)
public read only when is_published = true
status is canonical; is_published is synchronized for compatibility
```

## 37.4 Editorial Supporting Tables (P2)

| Table | Purpose | Public access |
|---|---|---|
| story_topics | Controlled high-level story subjects | Active rows only |
| story_tags | Reusable specific labels | Active rows only |
| story_topic_links | Story-to-topic relationships | Published stories only |
| story_tag_links | Story-to-tag relationships | Published stories only |
| story_revisions | Immutable editorial recovery snapshots | Server/admin only |
| story_review_events | Moderation and workflow decision history | Server/admin only |
| story_recommendations | Ordered editorial story relationships | Only when source and target are published |

`story_revisions` and `story_review_events` have RLS enabled without public policies. Permission-controlled server code owns their access.

Curated recommendation changes use
`replace_story_recommendations(bigint, jsonb, uuid)`. The service-role-only
function validates the full ordered list before deleting the previous links, so
the CMS cannot leave a partially updated recommendation set. Public rendering
still applies canonical Story publication filters and managed-media readiness
checks before a target is displayed.

Legacy application writes using `pending` remain temporarily accepted by the publication-state trigger and are normalized to `submitted` for traveler stories or `in_review` for editorial stories before constraints are checked.

The P2 Editorial Studio persists meaningful changes through the service-role-only
`apply_story_editorial_change(...)` function. The function locks the story row,
checks the editor's expected `updated_at`, updates content and taxonomy, writes an
immutable revision, and records a status transition as one PostgreSQL transaction.
The existing visual editor remains on its compatibility action until the RPC
migration is applied and the structured editor rollout is complete.

---

## 38. Table: data_import_logs

## 38.1 Purpose

Stores official or bulk data import history.

## 38.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| import_log_id | uuid | yes | Primary key |
| source_name | varchar | no | Source name |
| source_url | varchar | no | Source URL |
| source_file_name | varchar | no | Uploaded or imported file name |
| import_type | varchar | yes | tourism_stats, attraction_refs, province_master, district_master, other |
| status | varchar | yes | pending, processing, success, partial_success, failed, cancelled |
| records_processed | integer | no | Number processed |
| records_inserted | integer | no | Number inserted |
| records_updated | integer | no | Number updated |
| records_failed | integer | no | Number failed |
| error_message | text | no | Safe error details |
| imported_by | uuid | no | Supabase auth user who imported data |
| imported_at | timestamptz | yes | Import timestamp |
| metadata_json | jsonb | no | Safe import metadata |

## 38.3 MVP Status

Optional admin foundation.

---

## 39. Table: official_tourism_stats

## 39.1 Purpose

Stores official tourism statistics for future comparison.

Official statistics are separate from local platform visits. They must not be counted as reward-first QR participation records.

## 39.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| official_stat_id | uuid | yes | Primary key |
| province_id | bigint | yes | Province |
| year | integer | yes | Year |
| month | integer | no | Month, nullable for annual stats |
| tourist_type | varchar | yes | thai, foreign, total, unknown |
| visitor_count | integer | yes | Official visitor count |
| revenue_amount | numeric(15,2) | no | Official revenue amount, distinct from platform estimated spending |
| currency_code | varchar | no | Currency code, default THB |
| source_name | varchar | yes | Source name |
| source_url | varchar | no | Source URL |
| source_file_name | varchar | no | Source file name |
| import_log_id | uuid | no | Related import log |
| imported_at | timestamptz | yes | Import timestamp |
| created_at | timestamptz | yes | Created timestamp |
| updated_at | timestamptz | yes | Updated timestamp |

## 39.3 MVP Status

Phase 2A / optional official data foundation.

---

## 40. Table: official_attraction_refs

## 40.1 Purpose

Stores links between local attractions and official attraction references.

## 40.2 Columns

| Column | Type | Required | Description |
|---|---:|---:|---|
| official_ref_id | uuid | yes | Primary key |
| attraction_id | bigint | no | Local attraction, nullable until matched |
| source_name | varchar | yes | Source name |
| external_id | varchar | no | External ID |
| external_url | varchar | no | External URL |
| official_name_th | varchar | yes | Official Thai attraction name |
| official_name_en | varchar | no | Official English attraction name |
| official_province_name | varchar | no | Official province text from source |
| official_district_name | varchar | no | Official district text from source |
| raw_data_json | jsonb | no | Raw imported metadata |
| linked_at | timestamptz | no | Linked timestamp |
| linked_by | uuid | no | Supabase auth user who linked the record |
| created_at | timestamptz | yes | Created timestamp |
| updated_at | timestamptz | yes | Updated timestamp |

## 40.3 MVP Status

Phase 2A / optional official data foundation.

---

## 41. Common Indexes

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

idx_funnel_events_event_type
idx_funnel_events_event_time
idx_funnel_events_attraction_id
idx_travel_stories_published
idx_official_tourism_stats_province
idx_official_tourism_stats_year_month
idx_official_attraction_refs_attraction
idx_data_import_logs_imported_at
```

---

## 42. MVP Required Tables Summary

The MVP should include at least:

```text
countries
provinces
districts
attraction_types
attractions
content_media
photo_spots
checkin_codes
tourists
tourist_identities
consent_records
visits
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
suggested_routes
suggested_route_stops
travel_stories
travel_companions
transport_modes
travel_purposes
expense_categories
visit_expenses
satisfaction_surveys
funnel_events
data_import_logs
official_tourism_stats
official_attraction_refs
```

---

## 43. Update Rule

When a database migration changes any table or column, update this file.

Do not let the data dictionary become outdated.

---

## 44. Story Engagement Tables

### `story_engagement_events`

Minimized raw Story signals retained for 30 days. Columns are limited to
`event_id`, `story_id`, optional `related_story_id`, `event_name`, `surface`,
`locale`, optional `position`, and server-generated `occurred_at`.

### `story_engagement_daily`

Long-term anonymous daily counts grouped by Story, related Story, event,
surface, and locale. `unique_session_count` represents accepted 24-hour
deduplicated signals, not verified unique people.

### `story_engagement_dedup`

Short-lived HMAC-SHA256 digests used for 24-hour event deduplication. It never
stores the source nonce.

### `story_engagement_rate_buckets`

Short-lived HMAC-SHA256 buckets used for distributed API rate limiting. It
never stores a raw IP address or origin.

All four tables use RLS with no public policies. Only service-role RPCs may
write or maintain them.

---

## 45. Research Evaluation and Attraction Improvement Tables

Phase 18 adds a versioned research boundary without changing normal tourist records into research data.

| Table | Purpose | Important constraints |
|---|---|---|
| `research_studies` | Protocol, notice, consent versions, geographic scope, approval gate, retention, lifecycle | Separates `pilot` and `final_collection`; stores the exact approved title, boundary, objectives, RQs, and analysis wording |
| `research_instruments` | Versioned instrument per participant audience | Published versions are immutable and must be frozen |
| `research_items` | Typed items and construct mapping | One typed answer format; item code unique inside instrument |
| `research_checkin_codes` | Explicit study-to-QR deployment and collection mode | One active study per check-in code |
| `research_sessions` | One consented participation episode | Separates tourist, operator, attraction manager and field/simulated/pilot modes |
| `research_consents` | Research-specific consent and withdrawal evidence | Purpose/version/notice/language/source are retained; one purpose per session |
| `research_responses` | One response for a frozen instrument and session | Final submissions are immutable |
| `research_answers` | Typed item answer | Exactly one of integer, text, or boolean is non-null |
| `research_operator_tasks` | Versioned dashboard decision task | Published task and scoring rule are immutable |
| `research_operator_task_attempts` | Start/end, rationale, confidence, reviewer outcome and evidence quality | One attempt per session and task; completed attempts require outcome |
| `research_activation_evidence` | Versioned expert review, cognitive pretest, and mobile-flow QA evidence | Append-only; the latest version of every required evidence type must pass or be documented as not required |
| `research_freeze_snapshots` | Immutable protocol, instrument, task, scoring, retention, language, inclusion, application, and database manifest | One snapshot per study; update and delete are blocked by a database trigger |
| `research_pilot_reviews` | Pilot quality review and activation decision | Append-only; the latest decision controls whether a linked final collection may activate |
| `attraction_feedback_issues` | Human-reviewed production feedback issue | Unique attraction/dimension/category/baseline evidence bundle |
| `attraction_improvement_actions` | Owned improvement work with due date and follow-up metric | One active action per issue; status transitions are controlled |
| `attraction_improvement_events` | Immutable workflow audit trail | Links issue/action events without tourist identity |

Research text is server-redacted for direct email, phone, and URL patterns before persistence. Research exports use participant codes and must never expose tourist, visit, identity-provider, photo, signed URL, or private storage identifiers.

Migrations, in order:

1. `20260808000000_add_research_core.sql`
2. `20260808001000_harden_research_data_quality.sql`
3. `20260808002000_add_attraction_improvement_workflow.sql`
4. `20260901000000_activate_research_pilot_and_attraction_analytics.sql`

The Phase 21 migration adds no study, participant, evidence, or response seed rows. Approval evidence and pilot decisions must be entered only after the corresponding real activity occurs. A Pilot cannot create `field_observation` sessions, and a final-collection study cannot create simulated or internal-pilot sessions.

---

## 46. Restaurant Category Tables

Migration `20260812000000_create_restaurant_categories.sql` replaces free-text restaurant categorization with controlled, reusable master data while retaining `restaurants.food_type` for one compatibility release.

| Table | Purpose | Important constraints |
|---|---|---|
| `restaurant_categories` | Thai-first category names, stable slug, editorial section, menu visibility, ordering, and lifecycle | Unique lowercase slug; section is `local`, `meals`, `cafes`, or `other`; archived rows remain for history |
| `restaurant_category_assignments` | Ordered many-to-many relationship between restaurants and categories | Composite primary key prevents duplicate assignment; foreign keys cascade with the parent records |

Restaurant create/update RPCs call `sync_restaurant_categories(bigint, bigint[], boolean)` inside the same transaction. They reject inactive or unknown categories and prevent a published restaurant from having no active category. `set_restaurant_category_active(...)` also prevents archiving the final active category of a published restaurant. Category usage and public navigation counts are aggregated by database functions rather than loading all assignments into application memory. Mutation execution is limited to `service_role`.

---

## 47. Attraction Related Content Intelligence

Migration `20260813002000_add_attraction_related_content_settings.sql` is
created locally but **has not been applied to any production database**. It adds
the explicit display contract for the four related-content sections on an
attraction detail page.

| Table / function | Purpose | Important constraints |
|---|---|---|
| `attraction_related_content_settings` | One display configuration per attraction and content type | Primary key is `(attraction_id, content_type)`; content types are `attractions`, `restaurants`, `accommodations`, and `stories`; mode is `automatic`, `manual`, `hybrid`, or `hidden`; `max_items` is 1 through 8 |
| `attraction_related_attractions` reverse index | Finds attractions that reference an attraction | `idx_ara_related_attraction_id`; new self-links are blocked by `attraction_related_attractions_no_self_link`; the constraint is `NOT VALID` so existing rows are preserved for review |
| `attraction_related_restaurants` reverse index | Finds attractions that reference a restaurant | `idx_arr_restaurant_id` |
| `attraction_related_accommodations` reverse index | Finds attractions that reference an accommodation | `idx_arac_accommodation_id` |
| `attraction_related_stories` reverse index | Finds attractions that reference a story | `idx_ars_story_id` |
| `sync_attraction_related_content_v2(...)` | Server-only atomic replacement of ordered curated relations plus the section setting | Validates source and target existence, rejects null/self/invalid IDs, deduplicates while preserving first order, raises failures, and does not modify content records |

Backfill creates four settings rows for every current attraction. A section
with existing legacy relation rows is marked `manual`; a section without rows
is marked `automatic`. The legacy `sync_attraction_related_content(...)`
function remains unchanged for compatibility. Public settings reads are
restricted by `is_public_attraction(attraction_id)` and mutation privileges are
limited to the server-side `service_role` RPC boundary.

### Apply and verify later

Do not run this migration as part of the current change. After the application
code that consumes the new settings/RPC contract is ready and the production
window is approved, apply it through the project's controlled migration process.
Migration `20260730111000_enforce_destination_launch_scope.sql` must already be
applied because the settings RLS policy uses `is_public_attraction(bigint)`.
Then verify the migration history with:

```sql
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE version = '20260813002000';
```

The expected result is exactly one row named
`20260813002000_add_attraction_related_content_settings`. Also verify the
objects without mutating data:

```sql
SELECT
  to_regclass('public.attraction_related_content_settings') AS settings_table,
  to_regclass('public.attraction_related_attractions') AS attraction_relations,
  to_regclass('public.attraction_related_restaurants') AS restaurant_relations,
  to_regclass('public.attraction_related_accommodations') AS accommodation_relations,
  to_regclass('public.attraction_related_stories') AS story_relations;

SELECT to_regprocedure(
  'public.sync_attraction_related_content_v2(bigint,text,bigint[],text,smallint)'
) AS related_content_rpc;
```

## Phase 23 NFC Registry (Local Foundation, 2026-09-04)

Migration: `20260904000000_add_nfc_tag_registry.sql`. Not applied to production
by the implementation agent; no existing tourism rows or channel values change.

### nfc_tags

| Field/group | Meaning |
|---|---|
| nfc_tag_id | Internal UUID primary key; operational reference, not tourist identity |
| public_token | Unique generated UUID for the public NDEF URL; public identifier, not authentication |
| checkin_code_id | Existing canonical check-in assignment; FK with delete restriction |
| code_snapshot, attraction_id_snapshot, photo_spot_id_snapshot, campaign_id_snapshot | Immutable provisioning context captured by trigger from the code; mismatch on later resolution is denied |
| label | Required human asset label, 1-80 trimmed characters |
| status | draft, active, inactive, revoked; revoked is terminal |
| replaces_tag_id | Unique optional predecessor, which must already be revoked; new token/row required |
| verification_reference, verified_by, verified_at | All-null or complete read-back evidence; recorded before activation and immutable once set |
| revoked_at | Database timestamp required only for revoked status |
| created_by, updated_by | Required staff actors, referencing admin_users |
| last_change_reason | Required operational reason, max 500 characters; no tourist data |
| created_at, updated_at, version | Database-maintained timestamps and monotonic per-tag revision |

The campaign snapshot deliberately is not a live FK: it retains an immutable
historical number and is compared against the live check-in code. No ownership
or permission decision relies on it. Identity/code/location snapshots cannot be
edited; create a replacement assignment instead. Check-in deletion and snapshot
location deletion are restricted while referenced by registry history.

### nfc_tag_events

Append-only transactional audit: event UUID, tag FK, event type, previous/current
status, version, actor, reason, timestamp. Unique `(nfc_tag_id, version)` prevents
duplicate revisions. Lifecycle writes and audit insertion succeed or fail
together. Event types: registered, verified, activated, deactivated, revoked,
updated. These are operational events, not tourist funnel events.

Both tables use RLS without anonymous/authenticated policies. Only service_role
may read registry data or insert/update tags; event writes are restricted to the
database trigger. Application delete is denied. The upcoming admin service must
still authorize the logged-in actor before using service_role.

Indexes: unique public token for point lookup; `(checkin_code_id, status)` for
code management; `(status, created_at DESC)` for lifecycle lists; unique tag/event
version for timeline order. No speculative analytics summary table is added.

The read-only resolver is not a transaction authorizing a later visit write.
Canonical integration must revalidate context at submission and define atomic
session/visit correlation before NFC traffic is enabled.

### Check-in Entry Sessions (Phase 23, Default-Off)

Migration `20260904001000_add_checkin_entry_sessions.sql` adds browser-bound
entry sessions and atomic begin/read/create-Visit RPCs. See
[Check-in Entry Session Contract](CHECKIN_ENTRY_SESSION_CONTRACT.md) for fields,
privacy, replay-safe XP and activation gates. The migration is not activated
in production by this implementation; existing Visits are not backfilled.
