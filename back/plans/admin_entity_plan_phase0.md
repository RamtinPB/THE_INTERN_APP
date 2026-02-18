# Phase 0: Admin System Planning

## Executive Summary

This document outlines the complete administrative control system for Madar Digital Wallet. Based on the existing project infrastructure and industry standards, we will implement a separate admin entity with multiple admin types, comprehensive audit logging, and a full-featured admin panel.

---

## 1. Admin Types & Authority Separation

### 1.1 Admin Type Definitions

| Admin Type       | Persian Name | Description                           | Scope                       |
| ---------------- | ------------ | ------------------------------------- | --------------------------- |
| `SUPER_ADMIN`    | مدیر ارشد    | Full system access                    | All operations              |
| `SUPPORT_ADMIN`  | پشتیبانی     | Customer support & account management | View + limited actions      |
| `FINANCE_ADMIN`  | مالی         | Finance operations                    | Financial transactions only |
| `RISK_ADMIN`     | ریسک         | Risk management                       | Fraud detection + limits    |
| `BUSINESS_ADMIN` | کسب‌وکار     | Business user management              | Business accounts only      |

### 1.2 Permission Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                     PERMISSION MATRIX                         │
├──────────────────────────┬──────────┬────────────┬──────────┤
│ Permission               │ SUPER    │ SUPPORT    │ FINANCE  │
├──────────────────────────┼──────────┼────────────┼──────────┤
│ VIEW_ALL_USERS          │    ✓     │     ✓      │    ✓     │
│ MANAGE_USERS            │    ✓     │     ✓      │    ✗     │
│ SUSPEND_USER            │    ✓     │     ✓      │    ✗     │
│ VIEW_ALL_TRANSACTIONS  │    ✓     │     ✓      │    ✓     │
│ REFUND_TRANSACTION     │    ✓     │     ✗      │    ✓     │
│ ADJUST_WALLET_BALANCE  │    ✓     │     ✗      │    ✓     │
│ VIEW_AUDIT_LOGS        │    ✓     │     ✗      │    ✓     │
│ MANAGE_ADMINS          │    ✓     │     ✗      │    ✗     │
│ VIEW_DASHBOARD         │    ✓     │     ✓      │    ✓     │
│ SYSTEM_SETTINGS        │    ✓     │     ✗      │    ✗     │
└──────────────────────────┴──────────┴────────────┴──────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PERMISSION MATRIX (continued)            │
├──────────────────────────┬──────────┬────────────┬──────────┤
│ Permission               │ RISK     │ BUSINESS   │          │
├──────────────────────────┼──────────┼────────────┼──────────┤
│ VIEW_ALL_USERS          │    ✓     │     ✓      │          │
│ MANAGE_USERS            │    ✗     │     ✗      │          │
│ SUSPEND_USER            │    ✗     │     ✗      │          │
│ VIEW_ALL_TRANSACTIONS  │    ✓     │     ✓      │          │
│ REFUND_TRANSACTION     │    ✗     │     ✗      │          │
│ ADJUST_WALLET_BALANCE  │    ✗     │     ✗      │          │
│ VIEW_AUDIT_LOGS        │    ✓     │     ✗      │          │
│ MANAGE_ADMINS          │    ✗     │     ✗      │          │
│ VIEW_DASHBOARD         │    ✓     │     ✓      │          │
│ SYSTEM_SETTINGS        │    ✗     │     ✗      │          │
│ VIEW_BUSINESS_USERS    │    ✗     │     ✓      │          │
│ VERIFY_BUSINESS        │    ✗     │     ✓      │          │
│ FREEZE_WALLET          │    ✓     │     ✗      │          │
└──────────────────────────┴──────────┴────────────┴──────────┘
```

### 1.3 Granular Permissions (String Array)

```typescript
// Stored in Admin.permissions field
type Permission =
	// User Management
	| "users:read"
	| "users:write"
	| "users:suspend"
	| "users:delete"
	// Transaction Management
	| "transactions:read"
	| "transactions:refund"
	| "transactions:reverse"
	// Wallet Management
	| "wallets:read"
	| "wallets:adjust"
	| "wallets:freeze"
	// Business User Management
	| "business:read"
	| "business:write"
	| "business:verify"
	// Audit & Compliance
	| "audit:read"
	| "audit:export"
	// Admin Management
	| "admins:read"
	| "admins:write"
	| "admins:suspend"
	// Dashboard
	| "dashboard:view"
	// System
	| "system:settings"
	| "system:logs";
```

---

## 2. Admin Pages (Frontend)

### 2.1 Page Structure

```
/admin
├── /dashboard              # Admin overview dashboard
├── /users                  # User management
│   ├── /                   # User list with search/filter
│   └── /[userId]           # User detail view
├── /business               # Business user management (BUSINESS_ADMIN)
│   ├── /                   # Business user list
│   └── /[userId]           # Business user detail
├── /transactions           # Transaction management
│   ├── /                   # All transactions
│   └── /[transactionId]    # Transaction detail
├── /wallets                # Wallet oversight
│   ├── /                   # All wallets
│   └── /[walletId]         # Wallet detail
├── /audit-logs             # Audit log viewer
├── /admins                 # Admin management (SUPER_ADMIN only)
│   ├── /                   # Admin list
│   └── /create             # Create new admin
└── /settings               # System settings (SUPER_ADMIN only)
```

### 2.2 Page Details

#### Dashboard (`/admin/dashboard`)

- **Access**: All admin types
- **Components**:
  - Total users count (with daily change)
  - Total transactions (daily volume)
  - Total wallet balance (system-wide)
  - Recent suspicious activities
  - Quick action buttons

#### Users (`/admin/users`)

- **Access**: All admin types
- **Features**:
  - Searchable/filterable user table
  - Columns: ID, Phone, Type, Status, Created, Last Login
  - Actions: View, Suspend, Adjust Wallet
  - Bulk operations

#### User Detail (`/admin/users/[userId]`)

- **Access**: All admin types
- **Sections**:
  - Profile information
  - Wallet list with balances
  - Transaction history
  - Action buttons: Suspend, Adjust Balance

#### Business Users (`/admin/business`)

- **Access**: BUSINESS_ADMIN, SUPER_ADMIN
- **Features**:
  - Business user list with verification status
  - Columns: ID, Business Name, Phone, Status, Created, Verified
  - Actions: View Details, Verify, Reject
  - Business analytics

#### Business User Detail (`/admin/business/[userId]`)

- **Access**: BUSINESS_ADMIN, SUPER_ADMIN
- **Sections**:
  - Business profile information
  - Business documents
  - Wallet list with balances
  - Transaction history
  - Action buttons: Verify, Reject, Suspend

#### Transactions (`/admin/transactions`)

- **Access**: All admin types
- **Features**:
  - Advanced filters (date, status, type, amount range)
  - Transaction table with all details
  - Export to CSV/Excel
  - Actions: View Details, Refund (where applicable)

#### Transaction Detail (`/admin/transactions/[transactionId]`)

- **Access**: All admin types
- **Sections**:
  - Transaction metadata
  - Payer/Receiver info
  - Ledger entries
  - Action: Refund (for completed transactions)

#### Wallets (`/admin/wallets`)

- **Access**: FINANCE_ADMIN, RISK_ADMIN, BUSINESS_ADMIN, SUPER_ADMIN
- **Features**:
  - All wallets in system
  - Filter by user, balance range, status
  - Actions: Freeze/Unfreeze, Adjust Balance

#### Audit Logs (`/admin/audit-logs`)

- **Access**: All admin types (filtered by permission)
- **Features**:
  - Searchable log table
  - Filters: Admin, Action Type, Entity, Date Range
  - Export functionality
  - Detail view for each log entry

#### Admin Management (`/admin/admins`)

- **Access**: SUPER_ADMIN only
- **Features**:
  - Admin list table
  - Create new admin form
  - Edit admin details
  - Suspend/Reactivate admins
  - View admin activity

---

## 3. Backend API Endpoints

### 3.1 Authentication (Uses Existing /auth/\* Endpoints)

| Method | Endpoint   | Description                                          | Access |
| ------ | ---------- | ---------------------------------------------------- | ------ |
| GET    | `/auth/me` | Get current user (includes admin info if applicable) | User   |

**Note:** Admin authentication uses the same login flow as regular users (phone + password + OTP). After login, the backend checks if the user has an Admin record and includes admin info in the response and JWT token if present.

### 3.2 User Management

| Method | Endpoint                         | Description                | Access         |
| ------ | -------------------------------- | -------------------------- | -------------- |
| GET    | `/admin/users`                   | List all users (paginated) | users:read     |
| GET    | `/admin/users/:id`               | Get user details           | users:read     |
| POST   | `/admin/users/:id/suspend`       | Suspend a user             | users:suspend  |
| POST   | `/admin/users/:id/unsuspend`     | Reactivate a user          | users:suspend  |
| POST   | `/admin/users/:id/adjust-wallet` | Adjust wallet balance      | wallets:adjust |

### 3.3 Transaction Management

| Method | Endpoint                          | Description             | Access              |
| ------ | --------------------------------- | ----------------------- | ------------------- |
| GET    | `/admin/transactions`             | List all transactions   | transactions:read   |
| GET    | `/admin/transactions/:id`         | Get transaction details | transactions:read   |
| POST   | `/admin/transactions/:id/refund`  | Refund a transaction    | transactions:refund |
| POST   | `/admin/transactions/:id/reverse` | Reverse a transaction   | transactions:refund |

### 3.4 Wallet Management

| Method | Endpoint                      | Description           | Access         |
| ------ | ----------------------------- | --------------------- | -------------- |
| GET    | `/admin/wallets`              | List all wallets      | wallets:read   |
| GET    | `/admin/wallets/:id`          | Get wallet details    | wallets:read   |
| POST   | `/admin/wallets/:id/freeze`   | Freeze a wallet       | wallets:freeze |
| POST   | `/admin/wallets/:id/unfreeze` | Unfreeze a wallet     | wallets:freeze |
| POST   | `/admin/wallets/:id/adjust`   | Adjust wallet balance | wallets:adjust |

### 3.5 Audit Logs

| Method | Endpoint                   | Description           | Access       |
| ------ | -------------------------- | --------------------- | ------------ |
| GET    | `/admin/audit-logs`        | List audit logs       | audit:read   |
| GET    | `/admin/audit-logs/:id`    | Get audit log details | audit:read   |
| GET    | `/admin/audit-logs/export` | Export audit logs     | audit:export |

### 3.6 Admin Management (SUPER_ADMIN only)

| Method | Endpoint                    | Description       | Access         |
| ------ | --------------------------- | ----------------- | -------------- |
| GET    | `/admin/admins`             | List all admins   | admins:read    |
| GET    | `/admin/admins/:id`         | Get admin details | admins:read    |
| POST   | `/admin/admins`             | Create new admin  | admins:write   |
| PATCH  | `/admin/admins/:id`         | Update admin      | admins:write   |
| POST   | `/admin/admins/:id/suspend` | Suspend admin     | admins:suspend |
| DELETE | `/admin/admins/:id`         | Delete admin      | admins:write   |

### 3.7 Dashboard/Statistics

| Method | Endpoint                  | Description              | Access         |
| ------ | ------------------------- | ------------------------ | -------------- |
| GET    | `/admin/dashboard/stats`  | Get dashboard statistics | VIEW_DASHBOARD |
| GET    | `/admin/dashboard/charts` | Get chart data           | VIEW_DASHBOARD |

---

## 4. Audit Logging Requirements

### 4.1 Logged Actions

Every admin action must create an audit log entry with:

```typescript
interface AuditLogEntry {
	// What happened
	action: string; // e.g., "USER_SUSPENDED", "WALLET_ADJUSTED"
	entityType: string; // e.g., "User", "Wallet", "Transaction"
	entityId: number;
	description?: string; // Human-readable summary

	// Who did it
	adminId: number;
	adminPublicId: string;
	adminType: AdminType;

	// Change details (JSON)
	metadata: {
		previousValue?: any;
		newValue?: any;
		reason?: string;
		ipAddress: string;
		userAgent?: string;
	};

	// When
	createdAt: DateTime;
}
```

### 4.2 Action Categories

| Category          | Actions                                                         |
| ----------------- | --------------------------------------------------------------- |
| User Management   | USER_CREATED, USER_SUSPENDED, USER_REACTIVATED, USER_DELETED    |
| Wallet Management | WALLET_CREATED, WALLET_ADJUSTED, WALLET_FROZEN, WALLET_UNFROZEN |
| Transaction       | TRANSACTION_REFUNDED, TRANSACTION_REVERSED, TRANSACTION_VIEWED  |
| Admin             | ADMIN_CREATED, ADMIN_SUSPENDED, ADMIN_UPDATED, ADMIN_LOGIN      |
| System            | SETTINGS_CHANGED, CONFIG_UPDATED                                |

### 4.3 Log Retention

- **Standard logs**: 1 year online, 7 years archived
- **Sensitive actions**: 7 years (immutable)

---

## 5. Security Requirements

### 5.1 Authentication

- Separate admin login endpoint (`/admin/auth/*`)
- JWT tokens with admin-specific claims:
  ```typescript
  interface AdminJWTPayload {
  	userId: number;
  	adminId: number;
  	adminType: AdminType;
  	permissions: string[];
  	iat: number;
  	exp: number;
  }
  ```
- Two-factor authentication for admin accounts (future)
- Session timeout: 30 minutes idle

### 5.2 Authorization

- Permission-based access control (PBAC)
- Route-level middleware checking permissions
- Action-level permission verification in services
- Audit logging of permission denials

### 5.3 Additional Security

- IP whitelist for admin panel (optional)
- Login attempt limiting (5 attempts, then 15 min lockout)
- All admin actions require re-authentication for sensitive operations
- Encryption of sensitive data in audit logs

---

## 6. Data Models (Prisma Schema)

### 6.1 Enums

```prisma
enum AdminType {
  SUPER_ADMIN
  SUPPORT_ADMIN
  FINANCE_ADMIN
  RISK_ADMIN
}

enum AdminStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}
```

### 6.2 Admin Model

```prisma
model Admin {
  id            Int          @id @default(autoincrement())
  publicId      String       @unique @default(cuid())
  adminType     AdminType
  status        AdminStatus  @default(ACTIVE)
  department    String?
  permissions   String[]
  lastLoginAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        Int          @unique

  adminAuditLogs AdminAuditLog[]

  @@index([adminType])
  @@index([status])
}
```

### 6.3 AdminAuditLog Model

```prisma
model AdminAuditLog {
  id          Int       @id @default(autoincrement())
  action      String
  entityType  String
  entityId    Int
  description String?
  metadata    Json?
  ipAddress   String?
  createdAt   DateTime  @default(now())

  admin       Admin     @relation(fields: [adminId], references: [id])
  adminId     Int

  @@index([adminId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@index([action])
}
```

---

## 7. Implementation Phases

### Phase 1: Prisma Schema

- [ ] Add AdminType and AdminStatus enums
- [ ] Add Admin model with all fields
- [ ] Add AdminAuditLog model
- [ ] Update User model with admin relation
- [ ] Create migration

### Phase 2: Backend API

- [ ] Admin authentication endpoints
- [ ] User management endpoints
- [ ] Transaction management endpoints
- [ ] Wallet management endpoints
- [ ] Audit log endpoints
- [ ] Admin management endpoints
- [ ] Dashboard/statistics endpoints
- [ ] Permission middleware
- [ ] Audit logging service

### Phase 3: Frontend

- [ ] Admin layout and routing
- [ ] Admin authentication (login page)
- [ ] Dashboard page
- [ ] Users management page
- [ ] Transactions page
- [ ] Wallets page
- [ ] Audit logs page
- [ ] Admins management page
- [ ] Permission-based UI rendering

---

## 8. Migration Strategy

### Step 1: Pre-migration

- Create backup of database
- Notify users of maintenance window

### Step 2: Schema Migration

1. Create new enum types (AdminType, AdminStatus)
2. Create Admin table with foreign key to User
3. Create AdminAuditLog table
4. Migrate existing ADMIN users to Admin table
5. Remove ADMIN from UserType (or deprecate)

### Step 3: Post-migration

- Verify data integrity
- Update application configuration
- Deploy new backend
- Deploy new frontend

---

## 9. Production Considerations

### Monitoring

- Admin login alerts
- Suspicious activity detection
- Rate limiting metrics
- Audit log storage monitoring

### Compliance

- GDPR: Right to access/delete user data
- PCI DSS: Secure transaction handling
- Financial audit trails

### Performance

- Indexed queries on audit logs
- Pagination for all list endpoints
- Caching for dashboard statistics

---

_Document Version: 1.0_
_Last Updated: 2026-02-18_
