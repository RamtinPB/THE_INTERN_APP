import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import * as adminAdminsService from "./admin-admins.service";

// List all admins (paginated, filterable)
// GET /admin/admins?page=1&limit=10&adminType=SUPER_ADMIN&status=ACTIVE
export const listAdmins = async (ctx: any) => {
	const { page, limit, adminType, status } = ctx.query || {};

	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;

	try {
		const result = await adminAdminsService.listAdmins({
			page: parsedPage,
			limit: parsedLimit,
			adminType: adminType || undefined,
			status: status || undefined,
			adminPermissions: ctx.user.permissions || [],
		});

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to list admins" };
	}
};

// Get admin details by ID
// GET /admin/admins/:id
export const getAdminById = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid admin ID" };
	}

	try {
		const admin = await adminAdminsService.getAdminById(
			id,
			ctx.user.permissions || [],
		);

		return { admin };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Admin not found" };
	}
};

// Create new admin
// POST /admin/admins
export const createAdmin = async (ctx: any) => {
	const body = await ctx.body;
	const { userId, adminType, department } = body || {};

	if (!userId || !adminType) {
		ctx.set.status = 400;
		return { error: "userId and adminType are required" };
	}

	try {
		const admin = await adminAdminsService.createAdmin(
			{ userId, adminType, department },
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		ctx.set.status = 201;
		return { admin };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to create admin" };
	}
};

// Update admin details
// PATCH /admin/admins/:id
export const updateAdmin = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { adminType, department, permissions } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid admin ID" };
	}

	try {
		const admin = await adminAdminsService.updateAdmin(
			id,
			{ adminType, department, permissions },
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		return { admin };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to update admin" };
	}
};

// Suspend an admin
// POST /admin/admins/:id/suspend
export const suspendAdmin = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid admin ID" };
	}

	try {
		const admin = await adminAdminsService.suspendAdmin(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return { admin };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to suspend admin" };
	}
};

// Unsuspend (reactivate) an admin
// POST /admin/admins/:id/unsuspend
export const unsuspendAdmin = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid admin ID" };
	}

	try {
		const admin = await adminAdminsService.unsuspendAdmin(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return { admin };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to unsuspend admin" };
	}
};

// Delete an admin
// DELETE /admin/admins/:id
export const deleteAdmin = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid admin ID" };
	}

	try {
		const result = await adminAdminsService.deleteAdmin(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to delete admin" };
	}
};

// Body schemas for route validation
export const createAdminBodySchema = t.Object({
	userId: t.Number(),
	adminType: t.String(),
	department: t.Optional(t.String()),
});

export const updateAdminBodySchema = t.Object({
	adminType: t.Optional(t.String()),
	department: t.Optional(t.String()),
	permissions: t.Optional(t.Array(t.String())),
});

export const suspendBodySchema = t.Object({
	reason: t.Optional(t.String()),
});
