// Admin type definitions - mirrors Prisma enums
// Using const assertions to match Prisma generated types

export const AdminType = {
	SUPER_ADMIN: "SUPER_ADMIN",
	SUPPORT_ADMIN: "SUPPORT_ADMIN",
	FINANCE_ADMIN: "FINANCE_ADMIN",
	RISK_ADMIN: "RISK_ADMIN",
	BUSINESS_ADMIN: "BUSINESS_ADMIN",
} as const;

export type AdminType = (typeof AdminType)[keyof typeof AdminType];

export const AdminStatus = {
	ACTIVE: "ACTIVE",
	SUSPENDED: "SUSPENDED",
	DEACTIVATED: "DEACTIVATED",
} as const;

export type AdminStatus = (typeof AdminStatus)[keyof typeof AdminStatus];

// JWT Payload types
export interface JWTPayload {
	userId: number;
	userType: string;
	adminId?: number;
	adminPublicId?: string;
	adminType?: AdminType;
	permissions?: string[];
	iat?: number;
	exp?: number;
}

// Admin info to include in responses
export interface AdminInfo {
	id: number;
	publicId: string;
	adminType: AdminType;
	status: AdminStatus;
	permissions: string[];
	department?: string;
}

// User with admin info (for /auth/me response)
export interface UserWithAdmin {
	id: number;
	phoneNumber: string;
	userType: string;
	admin?: AdminInfo | null;
}

// Default permissions by admin type
export const DEFAULT_PERMISSIONS: Record<AdminType, string[]> = {
	SUPER_ADMIN: ["*"],
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

// Permission checker helper
export function hasPermission(
	permissions: string[],
	requiredPermission: string,
): boolean {
	// Super admin has all permissions
	if (permissions.includes("*")) {
		return true;
	}
	return permissions.includes(requiredPermission);
}
