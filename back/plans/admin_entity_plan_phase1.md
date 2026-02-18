# Phase 1: Prisma Schema Implementation Plan

## Overview

This document details the Prisma schema changes required to implement the admin entity system. Based on Phase 0 decisions, we will create a separate Admin entity with 5 admin types and comprehensive audit logging.

---

## 1. Current Schema State

### Existing `UserType` Enum (to be modified)

```prisma
enum UserType {
  CUSTOMER
  BUSINESS
  ADMIN   // Will be deprecated - admin handled by separate Admin entity
}
```

---

## 2. Target Schema

### 2.1 New Enums

```prisma
// =============================================================================
// NEW ENUMS TO ADD
// =============================================================================

/// Admin types - supports multiple roles with different permissions
/// Based on Phase 0 decisions: 5 admin types
enum AdminType {
  SUPER_ADMIN      // Full system access
  SUPPORT_ADMIN    // Customer support, account management
  FINANCE_ADMIN    // Finance operations
  RISK_ADMIN       // Risk management, fraud detection
  BUSINESS_ADMIN   // Business user management
}

/// Admin account status
enum AdminStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}
```

### 2.2 Updated User Model

```prisma
// =============================================================================
// UPDATED USER MODEL
// =============================================================================

model User {
  // Existing fields
  id           Int      @id @default(autoincrement())
  publicId     String   @unique @default(cuid())
  phoneNumber  String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Existing relations
  otps                  OTP[]
  refreshTokens         RefreshToken[]
  revokedAccessTokens   RevokedAccessToken[]

  // Keep ADMIN in UserType for backward compatibility during migration
  // Will be deprecated after full migration
  userType              UserType  @default(CUSTOMER)

  wallets        Wallet[]
  paymentIntents PaymentIntent[]

  // NEW: Optional 1:1 relation to Admin (only exists for admin users)
  // Admin is a User with additional admin properties
  admin         Admin?

  @@index([phoneNumber])
}
```

### 2.3 New Admin Model

```prisma
// =============================================================================
// NEW ADMIN MODEL
// =============================================================================

/// Separate admin entity - 1:1 relation with User
/// Allows multiple admin types and admin-specific metadata
model Admin {
  /// Primary key
  id            Int          @id @default(autoincrement())

  /// Public-facing ID for sharing/admin references
  publicId      String       @unique @default(cuid())

  /// Type of admin - determines permissions (Phase 0 decision: 5 types)
  adminType     AdminType

  /// Account status
  status        AdminStatus  @default(ACTIVE)

  /// Department (e.g., "Finance", "Support", "Operations", "Risk")
  department    String?

  /// Granular permissions array (can override type-based defaults)
  /// Stored as string array: ['users:read', 'users:write', ...]
  permissions   String[]

  /// Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  /// Last login timestamp
  lastLoginAt   DateTime?

  // ========================================================================
  // RELATIONS
  // ========================================================================

  /// 1:1 relation to User - admin is a User with additional admin properties
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        Int          @unique

  /// Audit trail of all admin actions
  adminAuditLogs AdminAuditLog[]

  // ========================================================================
  // INDEXES
  // ========================================================================
  @@index([adminType])
  @@index([status])
}
```

### 2.4 New AdminAuditLog Model

```prisma
// =============================================================================
// NEW ADMIN AUDIT LOG MODEL
// =============================================================================

/// Comprehensive audit log for ALL admin actions
/// Tracks who did what, when, and from where
/// Based on Phase 0 decisions: include PASSWORD_CHANGED, LOGIN_FAILED
model AdminAuditLog {
  /// Primary key
  id          Int       @id @default(autoincrement())

  /// Action performed
  /// Examples: USER_SUSPENDED, WALLET_ADJUSTED, TRANSACTION_REFUNDED,
  ///            ADMIN_CREATED, PASSWORD_CHANGED, LOGIN_FAILED
  action      String

  /// Type of entity affected (e.g., "Transaction", "Wallet", "User", "Admin")
  entityType  String

  /// ID of the affected entity
  entityId    Int

  /// Human-readable description of the action
  description String?

  /// Flexible metadata storage
  /// Stores: old/new values, request details, response data, etc.
  metadata    Json?

  /// IP address of the admin when performing the action
  ipAddress   String?

  /// User agent string
  userAgent   String?

  /// Timestamp of the action
  createdAt   DateTime  @default(now())

  // ========================================================================
  // RELATIONS
  // ========================================================================

  /// The admin who performed this action
  admin      Admin    @relation(fields: [adminId], references: [id])
  adminId    Int

  // ========================================================================
  // INDEXES
  // ========================================================================
  @@index([adminId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@index([action])
}
```

---

## 3. Complete Schema Diff

| Change                | Type    | Description                                                                           |
| --------------------- | ------- | ------------------------------------------------------------------------------------- |
| `AdminType` enum      | **Add** | 5 admin types (SUPER_ADMIN, SUPPORT_ADMIN, FINANCE_ADMIN, RISK_ADMIN, BUSINESS_ADMIN) |
| `AdminStatus` enum    | **Add** | Admin account status (ACTIVE, SUSPENDED, DEACTIVATED)                                 |
| `User.admin` relation | **Add** | Optional 1:1 to Admin                                                                 |
| `Admin` model         | **Add** | New admin entity with all fields                                                      |
| `AdminAuditLog` model | **Add** | Comprehensive audit trail                                                             |

---

## 4. Default Permissions by Admin Type

```typescript
const DEFAULT_PERMISSIONS: Record<AdminType, string[]> = {
	SUPER_ADMIN: [
		"*", // All permissions
	],
	SUPPORT_ADMIN: [
		"users:read",
		"users:write",
		"users:suspend",
		"transactions:read",
		"wallets:read",
		"dashboard:view",
	],
	FINANCE_ADMIN: [
		"users:read",
		"transactions:read",
		"transactions:refund",
		"wallets:read",
		"wallets:adjust",
		"dashboard:view",
		"audit:read",
	],
	RISK_ADMIN: [
		"users:read",
		"transactions:read",
		"wallets:read",
		"wallets:freeze",
		"dashboard:view",
		"audit:read",
	],
	BUSINESS_ADMIN: [
		"business:read",
		"business:write",
		"business:verify",
		"transactions:read",
		"wallets:read",
		"dashboard:view",
	],
};
```

---

## 5. Implementation Checklist

- [ ] Create `AdminType` enum in schema.prisma (5 types)
- [ ] Create `AdminStatus` enum in schema.prisma
- [ ] Add optional `admin` relation to `User` model
- [ ] Create `Admin` model with all fields
- [ ] Create `AdminAuditLog` model with all fields
- [ ] Run `prisma migrate dev` to generate and apply migration
- [ ] Run `prisma generate` to update client

---

## 6. Post-Implementation Notes

### Creating First Super Admin

After the schema is applied, create the first SUPER_ADMIN through the backend API or direct database access:

1. Create a User with phone number
2. Create an Admin record linked to that User with adminType: SUPER_ADMIN

### Next Steps (Backend API)

This plan covers **schema only**. For backend implementation (Phase 2):

- Update auth service to check Admin record after login
- Add admin info to JWT claims
- Implement permission guards
- Add audit logging middleware

---

_Document Version: 1.1_
_Last Updated: 2026-02-18_

_Phase: 1_
_Parent: admin_entity_plan_phase0.md_
