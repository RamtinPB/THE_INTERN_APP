import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";
import * as adminUsersService from "./admin-users.service";

// List users (paginated, filterable)
// GET /admin/users?page=1&limit=10&userType=CUSTOMER&phoneNumber=0912
export const listUsers = async (ctx: any) => {
	const { page, limit, userType, phoneNumber } = ctx.query || {};

	// Parse query params with defaults
	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;

	try {
		const result = await adminUsersService.listUsers({
			page: parsedPage,
			limit: parsedLimit,
			userType,
			phoneNumber,
			adminPermissions: ctx.user.permissions || [],
		});

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to list users" };
	}
};

// Get user details by ID
// GET /admin/users/:id
export const getUserById = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const user = await adminUsersService.getUserById(
			id,
			ctx.user.permissions || [],
		);

		return { user };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "User not found" };
	}
};

// Get user's wallets
// GET /admin/users/:id/wallets
export const getUserWallets = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const wallets = await adminUsersService.getUserWallets(
			id,
			ctx.user.permissions || [],
		);

		return { wallets };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get user wallets" };
	}
};

// Get user's transactions
// GET /admin/users/:id/transactions?page=1&limit=10
export const getUserTransactions = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const { page, limit } = ctx.query || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;

	try {
		const result = await adminUsersService.getUserTransactions(
			id,
			{ page: parsedPage, limit: parsedLimit },
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get user transactions" };
	}
};

// Suspend a user
// POST /admin/users/:id/suspend
export const suspendUser = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const result = await adminUsersService.suspendUser(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to suspend user" };
	}
};

// Reactivate a user
// POST /admin/users/:id/unsuspend
export const unsuspendUser = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	try {
		const result = await adminUsersService.unsuspendUser(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to reactivate user" };
	}
};

// Adjust wallet balance
// POST /admin/users/:id/adjust-wallet
export const adjustWalletBalance = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { walletId, amount, type, reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid user ID" };
	}

	if (!walletId || !amount || !type || !reason) {
		ctx.set.status = 400;
		return { error: "walletId, amount, type, and reason are required" };
	}

	if (!["ADD", "SUBTRACT"].includes(type)) {
		ctx.set.status = 400;
		return { error: "type must be either ADD or SUBTRACT" };
	}

	if (typeof amount !== "number" || amount <= 0) {
		ctx.set.status = 400;
		return { error: "amount must be a positive number" };
	}

	try {
		const result = await adminUsersService.adjustWalletBalance(
			id,
			{ walletId, amount, type, reason },
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to adjust wallet balance" };
	}
};

// Body schema for suspend/unsuspend endpoints
export const suspendBodySchema = t.Object({
	reason: t.Optional(t.String()),
});

// Body schema for adjust wallet endpoint
export const adjustWalletBodySchema = t.Object({
	walletId: t.Number(),
	amount: t.Number(),
	type: t.Union([t.Literal("ADD"), t.Literal("SUBTRACT")]),
	reason: t.String(),
});
