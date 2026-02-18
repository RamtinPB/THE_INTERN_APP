# Phase 2: Backend API Implementation Plan

## Overview

This document details the backend API implementation for the admin system. Based on Phase 0 decisions, we will use merged authentication (same login flow as regular users) and implement comprehensive admin endpoints.

---

## 1. Authentication Flow

### 1.1 Merged Authentication (Phase 0 Decision)

Admin authentication uses the **same login flow** as regular users:

```
User logs in with phone + password + OTP
    ↓
Backend validates credentials
    ↓
Backend checks if user has Admin record
    ↓
If Admin record exists:
  - Generate JWT with admin claims
  - Redirect to /admin dashboard
If no Admin record:
  - Generate regular JWT
  - Redirect to /dashboard
```

### 1.2 JWT Claims for Admin

```typescript
interface AdminJWTPayload {
	userId: number;
	adminId: number; // New: admin's ID
	adminPublicId: string; // New: admin's public ID
	adminType: AdminType; // New: SUPER_ADMIN, SUPPORT_ADMIN, etc.
	permissions: string[]; // New: granular permissions
	userType: UserType; // Existing: CUSTOMER, BUSINESS, ADMIN
	iat: number;
	exp: number;
}
```

---

## 2. API Endpoints

### 2.1 Authentication (uses existing `/auth/*`)

| Method | Endpoint   | Description                                          | Auth Required |
| ------ | ---------- | ---------------------------------------------------- | ------------- |
| GET    | `/auth/me` | Get current user (includes admin info if applicable) | Yes           |

**Response for admin user:**

```json
{
	"id": 1,
	"phoneNumber": "+989123456789",
	"userType": "CUSTOMER",
	"admin": {
		"id": 1,
		"publicId": "abc123",
		"adminType": "SUPER_ADMIN",
		"status": "ACTIVE",
		"permissions": ["*"]
	}
}
```

### 2.2 User Management

| Method | Endpoint                         | Description                            | Required Permission |
| ------ | -------------------------------- | -------------------------------------- | ------------------- |
| GET    | `/admin/users`                   | List all users (paginated, filterable) | users:read          |
| GET    | `/admin/users/:id`               | Get user details                       | users:read          |
| GET    | `/admin/users/:id/wallets`       | Get user's wallets                     | users:read          |
| GET    | `/admin/users/:id/transactions`  | Get user's transactions                | users:read          |
| POST   | `/admin/users/:id/suspend`       | Suspend a user                         | users:suspend       |
| POST   | `/admin/users/:id/unsuspend`     | Reactivate a user                      | users:suspend       |
| POST   | `/admin/users/:id/adjust-wallet` | Adjust wallet balance                  | wallets:adjust      |

### 2.3 Business User Management

| Method | Endpoint                           | Description                      | Required Permission |
| ------ | ---------------------------------- | -------------------------------- | ------------------- |
| GET    | `/admin/business`                  | List all business users          | business:read       |
| GET    | `/admin/business/:id`              | Get business user details        | business:read       |
| GET    | `/admin/business/:id/wallets`      | Get business user's wallets      | business:read       |
| GET    | `/admin/business/:id/transactions` | Get business user's transactions | business:read       |
| POST   | `/admin/business/:id/verify`       | Verify/approve business account  | business:verify     |
| POST   | `/admin/business/:id/reject`       | Reject business account          | business:verify     |
| GET    | `/admin/business/analytics`        | Business user analytics          | business:read       |

### 2.4 Transaction Management

| Method | Endpoint                          | Description             | Required Permission |
| ------ | --------------------------------- | ----------------------- | ------------------- |
| GET    | `/admin/transactions`             | List all transactions   | transactions:read   |
| GET    | `/admin/transactions/:id`         | Get transaction details | transactions:read   |
| POST   | `/admin/transactions/:id/refund`  | Refund a transaction    | transactions:refund |
| POST   | `/admin/transactions/:id/reverse` | Reverse a transaction   | transactions:refund |

### 2.5 Wallet Management

| Method | Endpoint                          | Description               | Required Permission |
| ------ | --------------------------------- | ------------------------- | ------------------- |
| GET    | `/admin/wallets`                  | List all wallets          | wallets:read        |
| GET    | `/admin/wallets/:id`              | Get wallet details        | wallets:read        |
| GET    | `/admin/wallets/:id/transactions` | Get wallet's transactions | wallets:read        |
| POST   | `/admin/wallets/:id/freeze`       | Freeze a wallet           | wallets:freeze      |
| POST   | `/admin/wallets/:id/unfreeze`     | Unfreeze a wallet         | wallets:freeze      |
| POST   | `/admin/wallets/:id/adjust`       | Adjust wallet balance     | wallets:adjust      |

### 2.6 Audit Logs

| Method | Endpoint                   | Description                 | Required Permission |
| ------ | -------------------------- | --------------------------- | ------------------- |
| GET    | `/admin/audit-logs`        | List audit logs (paginated) | audit:read          |
| GET    | `/admin/audit-logs/:id`    | Get audit log details       | audit:read          |
| GET    | `/admin/audit-logs/export` | Export audit logs (CSV)     | audit:export        |

### 2.7 Admin Management (SUPER_ADMIN only)

| Method | Endpoint                      | Description          | Required Permission |
| ------ | ----------------------------- | -------------------- | ------------------- |
| GET    | `/admin/admins`               | List all admins      | admins:read         |
| GET    | `/admin/admins/:id`           | Get admin details    | admins:read         |
| POST   | `/admin/admins`               | Create new admin     | admins:write        |
| PATCH  | `/admin/admins/:id`           | Update admin details | admins:write        |
| POST   | `/admin/admins/:id/suspend`   | Suspend an admin     | admins:suspend      |
| POST   | `/admin/admins/:id/unsuspend` | Reactivate an admin  | admins:suspend      |
| DELETE | `/admin/admins/:id`           | Delete an admin      | admins:write        |

### 2.8 Dashboard/Statistics

| Method | Endpoint                  | Description                           | Required Permission |
| ------ | ------------------------- | ------------------------------------- | ------------------- |
| GET    | `/admin/dashboard/stats`  | Dashboard statistics                  | dashboard:view      |
| GET    | `/admin/dashboard/charts` | Chart data (daily transactions, etc.) | dashboard:view      |

---

## 3. Request/Response Examples

### 3.1 List Users

**GET** `/admin/users?page=1&limit=20&userType=CUSTOMER&status=active`

```json
{
	"data": [
		{
			"id": 1,
			"publicId": "abc123",
			"phoneNumber": "+989123456789",
			"userType": "CUSTOMER",
			"status": "ACTIVE",
			"createdAt": "2026-01-15T10:00:00Z",
			"lastLoginAt": "2026-02-18T08:00:00Z"
		}
	],
	"pagination": {
		"page": 1,
		"limit": 20,
		"total": 150,
		"totalPages": 8
	}
}
```

### 3.2 Adjust Wallet Balance

**POST** `/admin/users/1/adjust-wallet`

```json
{
	"walletId": 1,
	"amount": 500.0,
	"type": "ADD", // ADD or SUBTRACT
	"reason": "Customer refund for order #12345"
}
```

Response:

```json
{
	"success": true,
	"newBalance": 1500.0,
	"transaction": {
		"id": 100,
		"publicId": "txn_abc123",
		"type": "ADMIN_ADJUSTMENT",
		"amount": 500.0,
		"status": "COMPLETED"
	},
	"auditLogId": 500
}
```

### 3.3 Refund Transaction

**POST** `/admin/transactions/100/refund`

```json
{
	"reason": "Customer requested refund",
	"refundAmount": 250.0
}
```

---

## 4. Middleware & Guards

### 4.1 Permission Middleware

```typescript
// middleware/permission.ts
const requirePermission = (permission: string) => {
	return async (ctx: any, next: any) => {
		// Check if user is admin
		if (!ctx.user.adminId) {
			ctx.set.status = 403;
			return { error: "Admin access required" };
		}

		// Check specific permission
		const permissions = ctx.user.permissions;
		const hasPermission =
			permissions.includes("*") || permissions.includes(permission);

		if (!hasPermission) {
			// Log permission denial for security monitoring
			await logPermissionDenial(ctx.user.adminId, permission);

			ctx.set.status = 403;
			return { error: "Insufficient permissions" };
		}

		await next();
	};
};
```

### 4.2 Audit Logging Middleware

```typescript
// middleware/audit.ts
const auditLog = (action: string, entityType: string) => {
	return async (ctx: any, next: any) => {
		const startTime = Date.now();
		const ipAddress = ctx.request.ip;
		const userAgent = ctx.request.headers["user-agent"];

		try {
			const result = await next();

			// Log successful action
			await createAuditLog({
				adminId: ctx.user.adminId,
				action,
				entityType,
				entityId: ctx.params.id || ctx.request.body?.id,
				metadata: {
					success: true,
					duration: Date.now() - startTime,
					requestBody: sanitizeBody(ctx.request.body),
					response: result,
				},
				ipAddress,
				userAgent,
			});

			return result;
		} catch (error) {
			// Log failed action
			await createAuditLog({
				adminId: ctx.user.adminId,
				action,
				entityType,
				entityId: ctx.params.id || ctx.request.body?.id,
				metadata: {
					success: false,
					error: error.message,
					duration: Date.now() - startTime,
				},
				ipAddress,
				userAgent,
			});

			throw error;
		}
	};
};
```

---

## 5. Service Layer Structure

```
src/modules/
├── admin/
│   ├── admin.controller.ts   # Request handling
│   ├── admin.service.ts      # Business logic
│   ├── admin.repository.ts   # Database operations
│   └── admin.routes.ts       # Route definitions
├── admin-auth/
│   ├── admin-auth.controller.ts
│   ├── admin-auth.service.ts
│   ├── admin-auth.repository.ts
│   └── admin-auth.routes.ts
├── admin-users/
│   ├── admin-users.controller.ts
│   ├── admin-users.service.ts
│   ├── admin-users.repository.ts
│   └── admin-users.routes.ts
├── admin-transactions/
│   ├── admin-transactions.controller.ts
│   ├── admin-transactions.service.ts
│   ├── admin-transactions.repository.ts
│   └── admin-transactions.routes.ts
├── admin-wallets/
│   ├── admin-wallets.controller.ts
│   ├── admin-wallets.service.ts
│   ├── admin-wallets.repository.ts
│   └── admin-wallets.routes.ts
├── admin-audit/
│   ├── admin-audit.controller.ts
│   ├── admin-audit.service.ts
│   ├── admin-audit.repository.ts
│   └── admin-audit.routes.ts
└── admin-business/
    ├── admin-business.controller.ts
    ├── admin-business.service.ts
    ├── admin-business.repository.ts
    └── admin-business.routes.ts
```

---

## 6. Implementation Order

1. **Update Auth Module**
   - Modify JWT provider to include admin claims
   - Update `/auth/me` to return admin info

2. **Create Admin Module Structure**
   - Set up controller, service, repository, routes

3. **Implement Admin Management**
   - CRUD operations for admins
   - Permission checking

4. **Implement User Management**
   - List, view, suspend/unsuspend users
   - Wallet adjustment

5. **Implement Transaction Management**
   - List, view, refund transactions

6. **Implement Wallet Management**
   - List, view, freeze/unfreeze, adjust

7. **Implement Audit Logs**
   - Create audit log service
   - List and export endpoints

8. **Implement Dashboard Statistics**
   - Stats and chart endpoints

---

## 7. Testing Requirements

- Unit tests for all services
- Integration tests for API endpoints
- Permission guard tests
- Audit log verification tests

---

_Document Version: 1.0_
_Last Updated: 2026-02-18_

_Phase: 2_
_Parent: admin_entity_plan_phase0.md, admin_entity_plan_phase1.md_
