# 04_USER_ROLES.md

## 1. Purpose

This document defines all user roles, their permissions, and access boundaries in the system.

---

## 2. Role Hierarchy

```text
Super Admin
    ├── Admin
    │     ├── Tourism Staff
    │     └── Viewer / Researcher
    └── Tourist (public, no admin access)
            ├── Guest Tourist
            ├── LINE-linked Tourist
            └── Email-linked Tourist
```

---

## 3. Role Definitions

### 3.1 Guest Tourist

**Identity:** Anonymous device token (no login)

**Can:**
- Scan QR code and open check-in page
- View attraction information
- Upload photo
- Fill minimal form
- Generate certificate
- Receive digital stamp
- Answer optional survey
- View own passport (device-bound)

**Cannot:**
- Access admin pages
- View other tourists' data
- Export data
- Manage attractions

### 3.2 LINE-Linked Tourist

**Identity:** LINE user ID linked to tourist profile

**Additional capabilities (beyond guest):**
- Recover passport across devices
- Receive optional notifications via LINE
- Persistent identity for returning visits

### 3.3 Email-Linked Tourist

**Identity:** Email address linked to tourist profile

**Additional capabilities (beyond guest):**
- Recover passport via email magic link
- Receive certificate via email (future)
- Persistent identity for returning visits

### 3.4 Tourism Staff

**Identity:** Authenticated admin account with `staff` role

**Can:**
- Access admin backoffice
- Manage attractions (create, edit, deactivate)
- Manage photo spots
- Manage check-in codes and QR
- Manage attraction images and media
- View visit records with filters
- View tourist records (aggregated)
- Export visit data (CSV)
- View dashboards

**Cannot:**
- Manage users or roles
- View audit logs
- Change system configuration
- Delete records permanently
- Access raw personal data beyond operational needs

### 3.5 Admin

**Identity:** Authenticated admin account with `admin` role

**Can (everything Staff can, plus):**
- Manage certificate templates
- Manage campaign settings
- View and search audit logs
- Manage master data (provinces, districts, attraction types)
- Access detailed analytics
- Configure system settings
- Manage data exports with full scope

**Cannot:**
- Manage other admin accounts
- Change role definitions
- Access production secrets

### 3.6 Viewer / Researcher

**Identity:** Authenticated admin account with `viewer` role

**Can:**
- View dashboards (read-only)
- Export allowed aggregated data
- Filter and explore analytics
- View attraction performance metrics

**Cannot:**
- Modify any records
- Access individual tourist data
- Manage attractions or content
- View audit logs

### 3.7 Super Admin

**Identity:** Authenticated admin account with `super_admin` role

**Can (everything Admin can, plus):**
- Create and manage admin user accounts
- Assign and modify roles
- Access complete audit logs
- Configure security settings
- Manage data retention policies
- Perform system-level operations

---

## 4. Permission Matrix

| Permission | Guest | Tourist (linked) | Staff | Admin | Viewer | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View public attractions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create certificate | ✅ | ✅ | — | — | — | — |
| View own passport | ✅ | ✅ | — | — | — | — |
| Manage attractions | — | — | ✅ | ✅ | — | ✅ |
| Manage photo spots | — | — | ✅ | ✅ | — | ✅ |
| View visit records | — | — | ✅ | ✅ | — | ✅ |
| Export data | — | — | ✅ | ✅ | ⚠️ | ✅ |
| View dashboard | — | — | ✅ | ✅ | ✅ | ✅ |
| Manage templates | — | — | — | ✅ | — | ✅ |
| View audit logs | — | — | — | ✅ | — | ✅ |
| Manage users | — | — | — | — | — | ✅ |
| Manage roles | — | — | — | — | — | ✅ |
| System settings | — | — | — | ✅ | — | ✅ |

⚠️ = Limited scope (aggregated data only)

---

## 5. Database Representation

```text
users
    user_id (PK)
    email
    display_name
    is_active
    created_at

roles
    role_id (PK)
    role_name (super_admin, admin, staff, viewer)
    description

user_roles
    user_id (FK)
    role_id (FK)
    assigned_at
    assigned_by

permissions
    permission_id (PK)
    permission_name
    description

role_permissions
    role_id (FK)
    permission_id (FK)
```

---

## 6. Access Control Implementation

### 6.1 Route Protection

- All `/admin/*` routes require authentication
- Role check on server-side before rendering
- API routes validate user role before processing

### 6.2 Data Scoping

- Staff see data for their assigned scope
- Viewers see only aggregated/dashboard data
- Tourist APIs never expose other tourists' data

### 6.3 Audit

- All admin actions logged with user_id, action, timestamp
- Role changes logged with old and new role
- Data exports logged with scope and requester
