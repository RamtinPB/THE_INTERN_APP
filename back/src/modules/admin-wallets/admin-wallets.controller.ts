import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import * as adminWalletsService from "./admin-wallets.service";

// List all wallets (paginated, filterable)
// GET /admin/wallets?page=1&limit=10&userType=CUSTOMER&minBalance=0&maxBalance=1000
export const listWallets = async (ctx: any) => {
	const { page, limit, userType, minBalance, maxBalance } = ctx.query || {};

	// Parse query params with defaults
	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;
	const parsedMinBalance = minBalance ? parseFloat(minBalance) : undefined;
	const parsedMaxBalance = maxBalance ? parseFloat(maxBalance) : undefined;

	try {
		const result = await adminWalletsService.listWallets({
			page: parsedPage,
			limit: parsedLimit,
			userType,
			minBalance: parsedMinBalance,
			maxBalance: parsedMaxBalance,
			adminPermissions: ctx.user.permissions || [],
		});

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to list wallets" };
	}
};

// Get wallet details by ID
// GET /admin/wallets/:id
export const getWalletById = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const wallet = await adminWalletsService.getWalletById(
			id,
			ctx.user.permissions || [],
		);

		return { wallet };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Wallet not found" };
	}
};

// Get wallet's transactions
// GET /admin/wallets/:id/transactions?page=1&limit=10
export const getWalletTransactions = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const { page, limit } = ctx.query || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;

	try {
		const result = await adminWalletsService.getWalletTransactions(
			id,
			{ page: parsedPage, limit: parsedLimit },
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get wallet transactions" };
	}
};

// Freeze a wallet
// POST /admin/wallets/:id/freeze
export const freezeWallet = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const result = await adminWalletsService.freezeWallet(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to freeze wallet" };
	}
};

// Unfreeze a wallet
// POST /admin/wallets/:id/unfreeze
export const unfreezeWallet = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const result = await adminWalletsService.unfreezeWallet(
			id,
			ctx.user.adminId,
			ctx.user.permissions || [],
			reason,
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to unfreeze wallet" };
	}
};

// Adjust wallet balance
// POST /admin/wallets/:id/adjust
export const adjustWalletBalance = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { amount, type, reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	if (!amount || !type || !reason) {
		ctx.set.status = 400;
		return { error: "amount, type, and reason are required" };
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
		const result = await adminWalletsService.adjustWalletBalance(
			id,
			{ amount, type, reason },
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to adjust wallet balance" };
	}
};

// Body schema for freeze/unfreeze endpoints
export const freezeBodySchema = t.Object({
	reason: t.Optional(t.String()),
});

// Body schema for adjust wallet endpoint
export const adjustWalletBodySchema = t.Object({
	amount: t.Number(),
	type: t.Union([t.Literal("ADD"), t.Literal("SUBTRACT")]),
	reason: t.String(),
});
