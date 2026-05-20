# ADR-008: Privacy by Design

## Status

Accepted

## Context

The platform collects personal data from tourists. Thailand's PDPA (Personal Data Protection Act) requires:

- Clear consent before data collection
- Data minimization (collect only what's necessary)
- Purpose limitation (use data only for stated purposes)
- Security safeguards for personal data
- Data subject rights (access, correction, deletion)

Additionally, tourists may be uncomfortable sharing data if they feel it's excessive or unclear.

## Decision

Adopt **Privacy by Design** as a core architectural principle. Privacy protections are built into the system from the start, not added as an afterthought.

### Key Design Rules

| Principle | Implementation |
|---|---|
| **Data Minimization** | Collect display name (not legal name), country/province (not address), age group (not birthdate) |
| **Progressive Collection** | Minimal form first, optional survey after value is given |
| **Purpose Limitation** | Data used for tourism planning only, stated in consent |
| **Consent First** | Consent checkbox required before form submission |
| **No Sensitive Data** | No national ID, no GPS, no full address, no health data |
| **Aggregation** | Dashboard shows aggregated data, not individual records |
| **Anonymization** | Export data is anonymized (no personal identifiers) |
| **Access Control** | Tourist data accessible only through admin roles |
| **Audit Trail** | All admin data access is logged |
| **Secure Storage** | Data encrypted at rest (Supabase default) |
| **Guest Identity** | Anonymous browser/device ID is used for guest continuity; IP address is not the tourist identity |
| **Optional Linking** | Google and LINE linking are optional and require clear user action |
| **Optional Sharing** | Certificates/photos remain private unless the tourist explicitly shares |

### Prohibited Data Collection

The system must **never** collect:

- National ID number (เลขบัตรประชาชน)
- Full legal name (unless tourist chooses to use it as display name)
- Full home address
- Phone number (unless tourist opts in for contact)
- GPS coordinates of tourist (only attraction has coordinates)
- Health information
- Political or religious beliefs
- Criminal records
- Biometric data
- Provider user IDs, guest tokens, Google subjects, LINE user IDs, internal tourist IDs, or internal visit IDs in public UI/share URLs/default exports

### Consent Model

```text
consent_logs
    consent_id (PK)
    tourist_id (FK)
    consent_type ('data_collection' | 'marketing' | 'research')
    consent_version (e.g., 'v1.0')
    is_granted (boolean)
    granted_at (timestamp)
    ip_address (hashed, for security/audit only)
    user_agent (for audit)
```

IP address must not be used to identify a tourist as the same person across visits.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Collect everything, anonymize later | Violates PDPA data minimization |
| No consent mechanism | Legally non-compliant |
| Mandatory GPS tracking | Invasive, reduces trust |
| Full name + ID for verification | Unnecessary for tourism planning |
| IP-based tourist identity | Unstable, privacy-risky, and unsuitable as a main identity mechanism |
| Public certificate URLs with internal IDs | Exposes private identifiers and creates avoidable tracking risk |

## Consequences

**Positive:**
- PDPA compliance from day one
- Tourist trust is maintained
- Data quality is higher (tourists provide data willingly)
- Reduces legal risk
- Simplified data management (less sensitive data to protect)

**Negative:**
- Some data is approximate (age group instead of exact age)
- Cannot verify tourist identity (by design)
- Spending data is ranges, not exact amounts
- Limited ability to contact tourists (unless they opt in)
- Guest passport is limited to the same browser/device unless the tourist links Google or LINE
