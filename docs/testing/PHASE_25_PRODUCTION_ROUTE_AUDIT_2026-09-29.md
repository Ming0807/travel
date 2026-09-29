# Phase 25 production route data audit

Date: 2026-09-29. Method: read-only Supabase REST query with server credentials held locally; no credentials or personal records exported. This is a data-state snapshot, not a field-access or mobile-device acceptance test.

| ID | Route slug | Active | Published | Active cover | Stored coordinates in its pilot stops |
| --- | --- | --- | --- | --- | --- |
| 17 | `na-tham-temple-heritage` | Yes | No | No | 0 of 4 |
| 18 | `na-tham-art-and-community` | Yes | No | No | 0 of 3 |
| 19 | `na-tham-kampan-cave-learning` | Yes | Yes | Yes | 0 of 3 |

The eight distinct attractions used by these routes currently have null `latitude` and `longitude`. Route 19 returns HTTP 200 publicly but displays the missing-coordinate notice. The other two routes are drafts and intentionally absent from the public route directory. Admin records are under `/admin/routes`, not the homepage route picker.

The seed creates editorial route records and ordered stops only; it does not insert coordinates or publish routes. Coordinates are owned by each attraction's CMS record. Because an archaeological-site coordinate does not establish the road entrance or cave meeting point, no location values were inferred or written during this task.

Before using these routes for visitor navigation:

1. Confirm the entrance or meeting point with the local caretaker for every stop, especially Khao Kampan and Samphao Thong cave.
2. Enter verified coordinates via each attraction's `พิกัด & แผนที่` editor. Check the route review map and every Google Maps link on a real iPhone and Android device.
3. Add licensed route covers to drafts 17 and 18, and confirm all route images persist after refresh.
4. Review the already-published route 19 with the caretaker. Unpublish it through CMS if the published cave itinerary cannot yet be safely followed; do not assume publication certifies access.
5. Complete create/edit/preview/publish/unpublish/restore acceptance with the deployed database. These checks remain pending.

Google Maps URLs do not require a Maps API key. A directions URL can omit `origin` so Maps uses the device's relevant current location when available; `dir_action=navigate` may launch navigation or a route preview depending on the platform and location state. See [Google Maps URLs documentation](https://developers.google.com/maps/documentation/urls/get-started).
