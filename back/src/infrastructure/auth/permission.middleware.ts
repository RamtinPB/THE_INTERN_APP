import { hasPermission } from "../../types/admin";
import * as adminRepository from "../../modules/admin/admin.repository";

/**
 * Permission middleware factory
 * Creates middleware that checks if the admin has the required permission
 */
export const requirePermission = (requiredPermission: string) => {
	return async (ctx: any, next: any) => {
		// Check if user is admin
		if (!ctx.user.adminId) {
			ctx.set.status = 403;
			return { error: "Admin access required" };
		}

		// Check if admin is active
		const admin = await adminRepository.findAdminById(ctx.user.adminId);
		if (!admin) {
			ctx.set.status = 403;
			return { error: "Admin not found" };
		}

		if (admin.status !== "ACTIVE") {
			ctx.set.status = 403;
			return { error: "Admin account is not active" };
		}

		// Check specific permission
		const permissions = ctx.user.permissions || [];
		if (!hasPermission(permissions, requiredPermission)) {
			ctx.set.status = 403;
			return { error: "Insufficient permissions" };
		}

		// Attach admin to context for use in handlers
		ctx.admin = admin;

		await next();
	};
};

/**
 * Optional permission check - doesn't block if admin doesn't have permission
 * Useful for filtering UI elements
 */
export const checkPermission = (requiredPermission: string) => {
	return async (ctx: any, next: any) => {
		if (!ctx.user.adminId) {
			ctx.hasPermission = false;
		} else {
			const permissions = ctx.user.permissions || [];
			ctx.hasPermission = hasPermission(permissions, requiredPermission);
		}

		await next();
	};
};
