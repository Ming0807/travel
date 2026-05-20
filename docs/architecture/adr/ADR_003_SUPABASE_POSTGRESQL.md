# ADR-003: Supabase PostgreSQL as Database

## Status

Accepted

## Context

The project requires:

- A relational database for highly structured tourism data (5 dimensions)
- Authentication service for admin users
- File storage for photos, certificates, and templates
- Row Level Security for safe client-side queries
- Managed hosting to reduce operational overhead
- Standard SQL for complex analytics queries

## Decision

Use **Supabase** as the backend platform, providing:

- **PostgreSQL 15+** as the primary database
- **Supabase Auth** for admin authentication
- **Supabase Storage** for file management
- **Supabase Realtime** (available but not required for MVP)

Database access patterns:

- Server-side: Service role client (full access)
- Client-side: Anon key client (RLS-restricted, read-only for public data)
- Admin: Server-side only through server actions

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Firebase + Firestore | Document-oriented, poor for relational tourism data |
| PlanetScale (MySQL) | No built-in auth, storage, or RLS |
| Self-hosted PostgreSQL | Requires server management, more operational overhead |
| MongoDB Atlas | Tourism data is highly relational, not document-oriented |
| AWS RDS + Cognito + S3 | More complex setup, higher cost for small project |

## Consequences

**Positive:**
- Single platform for database + auth + storage
- Standard PostgreSQL with full SQL capability
- Row Level Security for fine-grained access control
- Built-in dashboard for database management
- Free tier suitable for development and MVP
- Easy migration to self-hosted PostgreSQL if needed

**Negative:**
- Vendor dependency on Supabase platform
- Connection pooling limits on free tier
- Must manage RLS policies carefully
- Supabase-specific patterns (e.g., auth helpers) create some lock-in
