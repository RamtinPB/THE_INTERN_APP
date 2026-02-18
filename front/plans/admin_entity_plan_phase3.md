# Phase 3: Frontend Implementation Plan

## Overview

This document details the frontend implementation for the admin system. Based on Phase 0 decisions, we will implement a complete admin panel with role-based access control and merged authentication.

**Note:** This plan follows the existing frontend structure in `front/src/` including the pages router pattern, existing API client pattern in `lib/api/`, and existing auth system in `stores/auth.store.ts`.

---

## 1. Authentication Flow

### 1.1 Merged Authentication (Phase 0 Decision)

Frontend uses the **same login flow** as regular users (existing flow in `front/src/lib/api/auth.ts`):

```
User logs in with phone + password + OTP
    ↓
Backend returns user data with admin info (if applicable)
    ↓
Frontend checks user.admin:
  - If exists → Store admin data in auth state → Redirect to /admin
  - If not exists → Redirect to /dashboard (or show "Access Denied")
```

### 1.2 Auth Store Updates

The existing auth store (`front/src/stores/auth.store.ts`) will be extended with **mode switching** support:

```typescript
// Extended for Admin with mode switching:
interface AuthState {
  user: User | null;
  admin: AdminInfo | null;  // Admin-specific data
  loading: boolean;
  isAdmin: boolean;          // Computed from admin
  permissions: string[];      // From admin.permissions
  mode: 'user' | 'admin';     // NEW: Current view mode
  // ... existing methods
}

// New methods to add:
setMode(mode: 'user' | 'admin'): void;  // Switch between user/admin mode
getMode(): 'user' | 'admin';            // Get current mode
}

// AdminInfo type (to add in front/src/types/admin.ts)
interface AdminInfo {
  id: number;
  publicId: string;
  adminType: AdminType;
  status: AdminStatus;
  permissions: string[];
}
```

---

## 2. Page Structure

### 2.1 Route Structure

Following the existing pages directory pattern (`front/pages/`):

```
front/pages/
├── admin/
│   ├── index.tsx             # Redirects to /admin/dashboard
│   ├── dashboard.tsx         # Admin overview
│   ├── users/
│   │   ├── index.tsx        # User list
│   │   └── [id].tsx         # User detail
│   ├── business/
│   │   ├── index.tsx        # Business user list
│   │   └── [id].tsx         # Business user detail
│   ├── transactions/
│   │   ├── index.tsx        # Transaction list
│   │   └── [id].tsx         # Transaction detail
│   ├── wallets/
│   │   ├── index.tsx        # Wallet list
│   │   └── [id].tsx         # Wallet detail
│   ├── audit-logs/
│   │   └── index.tsx        # Audit log viewer
│   ├── admins/
│   │   ├── index.tsx        # Admin list
│   │   └── create.tsx       # Create admin
│   └── settings/
│       └── index.tsx        # Settings page
```

### 2.2 Layout Structure

**Industry Standard: Separate Admin Layout**

Admin pages use a completely separate layout from regular user pages, with the **same structure** as [`front/src/components/MainLayout.tsx`](front/src/components/MainLayout.tsx:1). This includes:

- SidebarHeader
- SidebarContent (with admin nav items)
- SidebarFooter (with user profile and mode toggle)

**AdminLayout Structure (mirrors MainLayout):**

```tsx
// front/src/components/admin/AdminLayout.tsx
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarInset,
} from "@/components/ui/sidebar";
import { adminNavItems } from "@/config/admin-sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider dir="rtl">
			<Sidebar side="right">
				<SidebarHeader className="p-4">
					<h2 className="text-lg font-bold">پنل مدیریت</h2>
				</SidebarHeader>

				<SidebarContent>{/* Admin navigation items */}</SidebarContent>

				<SidebarFooter>
					{/* User profile + Mode toggle dropdown */}
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger />
				</header>
				<div className="p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
```

**Dual-Mode Toggle (in SidebarFooter):**

The admin can switch between Admin mode and User mode from the SidebarFooter dropdown (same pattern as lines 149-190 in MainLayout):

```tsx
// In SidebarFooter - DropdownMenu
<DropdownMenu>
	<DropdownMenuTrigger asChild>
		<button>{/* Admin info + role badge */}</button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuLabel>پنل مدیریت</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuItem>
			<User className="ml-2 h-4 w-4" />
			<span>پروفایل</span>
		</DropdownMenuItem>
		<DropdownMenuSeparator />
		{/* MODE TOGGLE - Switch to User View */}
		<DropdownMenuItem onClick={switchToUserMode}>
			<LayoutDashboard className="ml-2 h-4 w-4" />
			<span>تغییر به حالت کاربری</span>
		</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem onClick={handleLogout}>
			<LogOut className="ml-2 h-4 w-4" />
			<span>خروج</span>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

**How Dual-Mode Works:**

1. **Login Flow:**
   - User logs in with phone + password + OTP
   - Backend returns user with `admin` field (if admin record exists)
   - Frontend auth store updated with `admin` info

2. **Initial Redirect:**
   - If `authState.admin` exists → Redirect to `/admin/dashboard`
   - If not → Redirect to `/` (regular dashboard)

3. **Mode Toggle (in Admin SidebarFooter):**

   ```tsx
   const switchToUserMode = () => {
   	// Clear admin context (keep user context)
   	authStore.setMode("user");
   	router.push("/"); // Go to regular dashboard
   };
   ```

4. **User Mode Toggle (in regular SidebarFooter):**
   ```tsx
   const switchToAdminMode = () => {
   	// Ensure admin context is available
   	authStore.setMode("admin");
   	router.push("/admin/dashboard"); // Go to admin dashboard
   };
   ```

---

## 3. Component Architecture

### 3.1 Directory Structure

Following existing patterns in `front/src/`:

```
front/src/
├── pages/admin/              # NEW: Admin pages (following pages/ pattern)
│   ├── index.tsx            # Redirect to dashboard
│   ├── dashboard.tsx        # Dashboard page
│   ├── users/
│   │   ├── index.tsx       # User list
│   │   └── [id].tsx       # User detail
│   ├── business/
│   │   ├── index.tsx       # Business user list
│   │   └── [id].tsx       # Business user detail
│   ├── transactions/
│   │   ├── index.tsx       # Transaction list
│   │   └── [id].tsx       # Transaction detail
│   ├── wallets/
│   │   ├── index.tsx       # Wallet list
│   │   └── [id].tsx       # Wallet detail
│   ├── audit-logs/
│   │   └── index.tsx       # Audit log viewer
│   ├── admins/
│   │   ├── index.tsx       # Admin list
│   │   └── create.tsx      # Create admin
│   └── settings/
│       └── index.tsx       # Settings page
├── components/admin/         # NEW: Admin-specific components
│   ├── AdminLayout.tsx     # Admin layout (mirrors MainLayout)
│   ├── AdminSidebar.tsx    # Admin navigation sidebar
│   ├── AdminSidebarFooter.tsx # Sidebar footer with mode toggle
│   ├── DataTable.tsx      # Reusable data table
│   ├── FilterPanel.tsx    # Reusable filter panel
│   ├── StatsCard.tsx      # Dashboard stat cards
│   ├── UserForm.tsx       # User edit form
│   ├── WalletAdjustModal.tsx
│   ├── TransactionRefundModal.tsx
│   ├── AuditLogDetail.tsx
│   └── PermissionGuard.tsx
├── config/
│   └── admin-sidebar.ts    # NEW: Admin sidebar config
├── hooks/
│   ├── useAdminAuth.ts     # NEW: Admin auth hook (extends useAuth)
│   ├── useAdminPermissions.ts  # NEW: Permission checking hook
│   └── useAdminRoute.ts    # NEW: Route protection hook
├── lib/api/
│   ├── admin.ts            # NEW: Admin API client
│   ├── admin-users.ts      # NEW: Admin user management API
│   ├── admin-business.ts   # NEW: Admin business API
│   ├── admin-transactions.ts  # NEW: Admin transaction API
│   ├── admin-wallets.ts   # NEW: Admin wallet API
│   ├── admin-audit.ts     # NEW: Admin audit API
│   └── admin-dashboard.ts # NEW: Admin dashboard API
└── types/
    └── admin.ts            # NEW: Admin types
```

**Note:** Reuse existing components from `front/src/components/ui/` (Table, Card, Button, Dialog, Modal, etc.) and existing hooks from `front/src/hooks/` (useAuth, useTransactions).

---

## 4. Key Components

### 4.1 Permission Guard

Using existing hooks pattern from `front/src/hooks/useAuth.ts`:

```tsx
// front/src/components/admin/PermissionGuard.tsx
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

interface PermissionGuardProps {
	permission: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export const PermissionGuard = ({
	permission,
	children,
	fallback = null,
}: PermissionGuardProps) => {
	const { hasPermission } = useAdminPermissions();

	if (!hasPermission(permission)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

// Usage
<PermissionGuard permission="users:suspend">
	<Button onClick={suspendUser}>Suspend User</Button>
</PermissionGuard>;
```

### 4.2 Admin Sidebar

The admin sidebar will extend the existing [`front/src/config/sidebar.ts`](front/src/config/sidebar.ts) structure. A new admin-specific sidebar configuration will be created for the `/admin` routes:

```typescript
// front/src/config/admin-sidebar.ts
import {
	LayoutDashboard,
	Users,
	Building2,
	Wallet,
	FileText,
	Shield,
	Settings,
	LucideIcon,
} from "lucide-react";

interface AdminNavItem {
	key: string;
	name: string; // Persian/English
	href: string;
	icon: LucideIcon;
	permission?: string; // Required permission to show this item
	subNavItems?: AdminNavItem[];
}

export const adminNavItems: AdminNavItem[] = [
	{
		key: "dashboard",
		name: "داشبورد",
		href: "/admin/dashboard",
		icon: LayoutDashboard,
		permission: "dashboard:view",
	},
	{
		key: "users",
		name: "کاربران",
		href: "/admin/users",
		icon: Users,
		permission: "users:read",
	},
	{
		key: "business",
		name: "کسب‌وکارها",
		href: "/admin/business",
		icon: Building2,
		permission: "business:read",
	},
	{
		key: "transactions",
		name: "تراکنش‌ها",
		href: "/admin/transactions",
		icon: FileText,
		permission: "transactions:read",
	},
	{
		key: "wallets",
		name: "کیف پول‌ها",
		href: "/admin/wallets",
		icon: Wallet,
		permission: "wallets:read",
	},
	{
		key: "audit-logs",
		name: "لاگ‌های نظارتی",
		href: "/admin/audit-logs",
		icon: Shield,
		permission: "audit:read",
	},
	{
		key: "admins",
		name: "مدیران",
		href: "/admin/admins",
		icon: Shield,
		permission: "admins:read",
	},
	{
		key: "settings",
		name: "تنظیمات",
		href: "/admin/settings",
		icon: Settings,
		permission: "system:settings",
	},
];
```

The sidebar will filter items based on the admin's permissions, showing only accessible menu items.

**Reference:** See existing sidebar config in `front/src/config/sidebar.ts` for the pattern.

### 4.3 Data Table Component

```tsx
// Reusable data table for admin pages
interface AdminDataTableProps<T> {
	data: T[];
	columns: ColumnDef<T>[];
	loading: boolean;
	pagination: PaginationState;
	onPaginationChange: (page: number, limit: number) => void;
	onSort?: (field: string, order: "asc" | "desc") => void;
	onRowClick?: (row: T) => void;
}
```

---

## 5. Page Implementations

### 5.1 Dashboard Page

**Features:**

- Stats cards: Total Users, Total Transactions, Total Balance, Active Admins
- Charts: Daily transactions (line), User growth (bar)
- Recent suspicious activities
- Quick action buttons

### 5.2 Users Page

**Features:**

- Searchable user table
- Filters: User Type, Status, Date Range
- Columns: ID, Phone, Type, Status, Created, Last Login, Actions
- Actions: View, Suspend/Unsuspend, Adjust Wallet

### 5.3 Business Users Page

**Features:**

- Business user list with verification status
- Filters: Verification Status, Date Range
- Columns: ID, Business Name, Phone, Status, Created, Verified, Actions
- Actions: View Details, Verify, Reject
- Business analytics summary

### 5.4 Transactions Page

**Features:**

- Advanced filters: Date Range, Status, Type, Amount Range
- Transaction table with all details
- Export to CSV
- Actions: View Details, Refund

### 5.4 Audit Logs Page

**Features:**

- Filters: Admin, Action Type, Entity Type, Date Range
- Log table with expandable details
- Export to CSV/Excel
- Click to view full audit log details

### 5.5 Admins Page (SUPER_ADMIN only)

**Features:**

- Admin list table
- Create new admin modal/form
- Actions: Edit, Suspend/Unsuspend, Delete

---

## 6. API Integration

Following the existing API pattern in `front/src/lib/api/` (see existing `transaction.ts`, `wallet.ts`):

### 6.1 Admin API Client

```typescript
// front/src/lib/api/admin.ts
import { authenticatedFetch } from "./fetcher";

export const adminApi = {
	// Users
	getUsers: (params: UserFilters) =>
		authenticatedFetch("/admin/users", { params }),
	getUser: (id: number) => authenticatedFetch(`/admin/users/${id}`),
	suspendUser: (id: number, reason: string) =>
		authenticatedFetch(`/admin/users/${id}/suspend`, {
			method: "POST",
			body: JSON.stringify({ reason }),
		}),
	adjustWallet: (userId: number, data: WalletAdjustData) =>
		authenticatedFetch(`/admin/users/${userId}/adjust-wallet`, {
			method: "POST",
			body: JSON.stringify(data),
		}),

	// Transactions (following pattern from front/src/lib/api/transaction.ts)
	getTransactions: (params: TransactionFilters) =>
		authenticatedFetch("/admin/transactions", { params }),
	getTransaction: (id: number) =>
		authenticatedFetch(`/admin/transactions/${id}`),
	refundTransaction: (id: number, data: RefundData) =>
		authenticatedFetch(`/admin/transactions/${id}/refund`, {
			method: "POST",
			body: JSON.stringify(data),
		}),

	// ... other endpoints follow same pattern
};
```

**Reference:** See existing API implementations:

- `front/src/lib/api/transaction.ts` - Transaction API pattern
- `front/src/lib/api/wallet.ts` - Wallet API pattern
- `front/src/lib/api/fetcher.ts` - HTTP client

---

## 7. Implementation Order

1. **Update Auth System**
   - Modify `front/src/stores/auth.store.ts` to include admin info and mode switching
   - Add admin type definitions to `front/src/types/admin.ts`
   - Update login redirect logic in `front/src/components/login/`

2. **Create Admin Layout**
   - Create `front/src/components/admin/AdminLayout.tsx` (mirrors MainLayout structure)
   - Create `front/src/components/admin/AdminSidebar.tsx` (using pattern from `front/src/config/sidebar.ts`)
   - Create `front/src/components/admin/AdminSidebarFooter.tsx` (includes mode toggle)

3. **Update Regular User Layout**
   - Modify `front/src/components/MainLayout.tsx` SidebarFooter to include admin mode toggle
   - Add "Switch to Admin" menu item (visible only if user has admin record)

4. **Implement Dashboard**
   - Create `front/pages/admin/dashboard.tsx`
   - Use existing UI components from `front/src/components/ui/`
   - Use existing chart component from `front/src/components/ui/chart.tsx`

5. **Implement User Management**
   - Create `front/pages/admin/users/index.tsx`
   - Create `front/pages/admin/users/[id].tsx`
   - Create modals: `front/src/components/admin/WalletAdjustModal.tsx`

6. **Implement Business User Management**
   - Create `front/pages/admin/business/index.tsx`
   - Create `front/pages/admin/business/[id].tsx`

7. **Implement Transaction Management**
   - Create `front/pages/admin/transactions/index.tsx`
   - Create `front/pages/admin/transactions/[id].tsx`
   - Reuse existing transaction components from `front/src/components/transactions/`

8. **Implement Wallet Management**
   - Create `front/pages/admin/wallets/index.tsx`
   - Create `front/pages/admin/wallets/[id].tsx`

9. **Implement Audit Logs**
   - Create `front/pages/admin/audit-logs/index.tsx`

10. **Implement Admin Management**
    - Create `front/pages/admin/admins/index.tsx`
    - Create `front/pages/admin/admins/create.tsx`

---

## 8. Styling Guidelines

- Use existing UI components from `front/src/components/ui/` (already has: Table, Card, Button, Dialog, Modal, etc.)
- Use existing layout from `front/src/components/MainLayout.tsx` and extend for admin
- Use existing sidebar config from `front/src/config/sidebar.ts` as reference
- Follow the project's design system
- RTL support (Persian language)
- Consistent with existing user-facing pages

---

## 9. Testing Requirements

- Component unit tests
- Integration tests for admin API
- Permission-based UI rendering tests

---

_Document Version: 1.0_
_Last Updated: 2026-02-18_

_Phase: 3_
_Parent: admin_entity_plan_phase0.md, admin_entity_plan_phase1.md, admin_entity_plan_phase2.md_
