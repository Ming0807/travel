# Safe CMS Delete Design

## Goal

Add a clear delete control to the attraction, restaurant, accommodation, route, and story CMS without destroying historical tourism, QR/NFC, review, analytics, or media records. After administrators reduce the pilot scope, only active content remains available in public pages and content pickers.

## Decisions

1. The visible destructive command is labelled `ลบออกจากระบบ` and always requires a confirmation dialog.
2. The command performs a reversible archive, not a physical database delete:
   - attractions, restaurants, accommodations, and routes become `is_active = false` and `is_published = false`;
   - stories transition to `archived`, clear publication, and retain revision history.
3. Archived records remain available through an explicit admin filter and can be restored using the existing activate/draft workflow.
4. Public queries and relationship candidates must require active and published records. Historical analytics continue to resolve archived attraction IDs.
5. Admin pickers used to create new QR points, photo spots, route stops, and hospitality relationships show active attractions only. Existing historical relationships are not physically deleted.
6. Every archive operation is permission-checked on the server and writes an audit event containing only lifecycle fields.

## CMS Coverage

| CMS | Permission | Archive mutation | Default list |
| --- | --- | --- | --- |
| Attractions | `attraction.delete` | unpublish + deactivate | active only |
| Restaurants | `restaurant.delete` | unpublish + deactivate | active only |
| Accommodations | `attraction.delete` (current module ownership) | unpublish + deactivate | active only |
| Routes | `route.delete` | unpublish + deactivate | active only |
| Stories | `story.delete` | status `archived`, unpublish | excludes archived |

## Restaurant Relationships

Restaurant Add/Edit receives a nearby-attraction picker populated only by active attractions in the pilot destination scope. Saving replaces that restaurant's links atomically through a PostgreSQL RPC. Public restaurant details already filter linked attractions by active, published, and live province; regression tests will lock that behavior.

## UI

- Use one reusable client confirmation control with a trash icon, item name, consequence summary, pending state, and actionable error message.
- Place the control in list row/card actions and the edit toolbar where the existing action pattern allows it.
- Red is reserved for this destructive command. Touch targets are at least 44 px on mobile edit screens and accessible names include the content name.
- After success, refresh the list or redirect from an edit page to the module list.

## Error Handling

- Missing record: return a safe `ไม่พบเนื้อหาที่ต้องการลบ` result.
- Missing permission: map to existing admin authorization copy.
- Database/RPC failure: retain the record and show `ยังลบเนื้อหาไม่ได้ กรุณาลองอีกครั้ง`.
- No raw Supabase or SQL errors reach the browser.

## Verification

- Unit tests for each archive action verify permission, lifecycle patch, audit event, and cache invalidation.
- Component tests verify confirmation, pending state, success refresh, and failure copy.
- Repository tests verify active-only attraction picker and atomic restaurant relationship payload.
- Public hospitality tests verify inactive/unpublished linked attractions remain hidden.
- Run targeted tests, ESLint, TypeScript, and production build before release.

## Out Of Scope

- The implementation does not choose or archive production records automatically.
- Permanent deletion and media-file cleanup are intentionally excluded.
- Historical visits, QR/NFC events, reviews, surveys, and analytics are never rewritten.
