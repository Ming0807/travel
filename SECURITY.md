# SECURITY.md

## Security Policy

### Reporting Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do not** open a public issue
2. Contact the project maintainers directly
3. Provide a clear description of the vulnerability and steps to reproduce

### Security Principles

This project follows these security practices:

- **Environment variables** for all secrets (API keys, database URLs, service role keys)
- **Row Level Security (RLS)** on Supabase tables for client-side access
- **Server-side authorization** for all admin operations
- **Role-based access control (RBAC)** with defined permission matrix
- **Audit logging** for administrative actions
- **Input validation** using Zod schemas on all user inputs
- **File upload validation** (type, size, content checks)
- **Server-only storage adapter** for Cloudinary/Supabase/future university storage
- **Consent logging** for PDPA compliance
- **No sensitive data in client code** (no service role keys, no database URLs)

### Environment Security

Required environment variables are documented in `ENVIRONMENT.md`.

**Never commit:**

- `.env` or `.env.local` files
- Supabase service role key
- Cloudinary API secret
- LINE channel secret
- Production database URLs
- Private API keys
- Real user data exports

### Data Privacy

The platform follows Privacy by Design principles:

- Minimal data collection (display name, not legal name)
- No national ID numbers
- No full addresses
- Optional LINE and email
- Progressive consent
- Aggregated dashboard data
- Data anonymization for exports

For detailed security documentation, see:

- [SECURITY_REQUIREMENTS.md](docs/security/SECURITY_REQUIREMENTS.md)
- [PDPA_PRIVACY_DESIGN.md](docs/security/PDPA_PRIVACY_DESIGN.md)
- [ROLE_PERMISSION_MATRIX.md](docs/security/ROLE_PERMISSION_MATRIX.md)
- [ROW_LEVEL_SECURITY.md](docs/security/ROW_LEVEL_SECURITY.md)
- [AUDIT_LOGGING.md](docs/security/AUDIT_LOGGING.md)
- [CONSENT_MANAGEMENT.md](docs/security/CONSENT_MANAGEMENT.md)
