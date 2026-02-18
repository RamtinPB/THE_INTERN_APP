import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import * as adminBusinessService from "./admin-business.service";

// List all business users (paginated)
// GET /admin/business?page=1&limit=10
export const listBusinessUsers = async (ctx: any) => {
	const { page, limit } = ctx.query || {};

	// Parse query params with defaults
	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;

	try {
		const result = await adminBusinessService.listBusinessUsers({
			page: parsedPage,
			limit: parsedLimit,
			adminPermissions: ctx.user.permissions || [],
		});

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to list business users" };
	}
};

// Get business user details by ID
// GET /admin/business/:id
export const getBusinessUserById = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const user = await adminBusinessService.getBusinessUserById(
			id,
			ctx.user.permissions || [],
		);

		return { user };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Business user not found" };
	}
};

// Get business user's wallets
// GET /admin/business/:id/wallets
export const getBusinessUserWallets = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const wallets = await adminBusinessService.getBusinessUserWallets(
			id,
			ctx.user.permissions || [],
		);

		return { wallets };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get business user wallets" };
	}
};

// Get business user's transactions
// GET /admin/business/:id/transactions?page=1&limit=10
export const getBusinessUserTransactions = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const { page, limit } = ctx.query || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;

	try {
		const result = await adminBusinessService.getBusinessUserTransactions(
			id,
			{ page: parsedPage, limit: parsedLimit },
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get business user transactions" };
	}
};

// Verify/approve business account
// POST /admin/business/:id/verify
export const verifyBusinessUser = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { notes } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const result = await adminBusinessService.verifyBusinessUser(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			notes,
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to verify business user" };
	}
};

// Reject business account
// POST /admin/business/:id/reject
export const rejectBusinessUser = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	if (!reason) {
		ctx.set.status = 400;
		return { error: "Reason is required" };
	}

	try {
		const result = await adminBusinessService.rejectBusinessUser(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to reject business user" };
	}
};

// Get business user analytics
// GET /admin/business/analytics
export const getBusinessAnalytics = async (ctx: any) => {
	try {
		const analytics = await adminBusinessService.getBusinessAnalytics(
			ctx.user.permissions || [],
		);

		return { analytics };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get business analytics" };
	}
};

// Body schema for verify endpoint
export const verifyBodySchema = t.Object({
	notes: t.Optional(t.String()),
});

// Body schema for reject endpoint
export const rejectBodySchema = t.Object({
	reason: t.String(),
});
