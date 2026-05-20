# Service Layer

Business rules belong here rather than in React components.

Phase 01 only creates the boundary. Later phases should add services such as:

- `checkin-service.ts`
- `tourist-service.ts`
- `visit-service.ts`
- `photo-service.ts`
- `certificate-service.ts`
- `stamp-service.ts`
- `dashboard-service.ts`

Service methods should call validators, guards, repositories, and storage helpers before returning privacy-safe DTOs.
