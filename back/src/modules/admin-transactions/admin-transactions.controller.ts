import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import * as adminTransactionsService from "./admin-transactions.service";

// List all transactions (paginated, filterable)
// GET /admin/transactions?page=1&limit=10&status=COMPLETED&transactionType=TRANSFER&minAmount=100&maxAmount=1000&startDate=2024-01-01&endDate=2024-12-31
export const listTransactions = async (ctx: any) => {
	const {
		page,
		limit,
		status,
		transactionType,
		minAmount,
		maxAmount,
		startDate,
		endDate,
	} = ctx.query || {};

	// Parse query params with defaults
	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;
	const parsedMinAmount = minAmount ? parseFloat(minAmount) : undefined;
	const parsedMaxAmount = maxAmount ? parseFloat(maxAmount) : undefined;
	const parsedStartDate = startDate ? new Date(startDate) : undefined;
	const parsedEndDate = endDate ? new Date(endDate) : undefined;

	try {
		const result = await adminTransactionsService.listTransactions({
			page: parsedPage,
			limit: parsedLimit,
			status,
			transactionType,
			minAmount: parsedMinAmount,
			maxAmount: parsedMaxAmount,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
			adminPermissions: ctx.user.permissions || [],
		});

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to list transactions" };
	}
};

// Get transaction details by ID
// GET /admin/transactions/:id
export const getTransactionById = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid transaction ID" };
	}

	try {
		const transaction = await adminTransactionsService.getTransactionById(
			id,
			ctx.user.permissions || [],
		);

		return { transaction };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Transaction not found" };
	}
};

// Refund a transaction
// POST /admin/transactions/:id/refund
export const refundTransaction = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason, refundAmount } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid transaction ID" };
	}

	if (!reason) {
		ctx.set.status = 400;
		return { error: "Reason is required" };
	}

	try {
		const result = await adminTransactionsService.refundTransaction(
			id,
			{ reason, refundAmount },
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to refund transaction" };
	}
};

// Reverse a transaction
// POST /admin/transactions/:id/reverse
export const reverseTransaction = async (ctx: any) => {
	const id = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { reason } = body || {};

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid transaction ID" };
	}

	if (!reason) {
		ctx.set.status = 400;
		return { error: "Reason is required" };
	}

	try {
		const result = await adminTransactionsService.reverseTransaction(
			id,
			{ reason },
			ctx.user.adminId,
			ctx.user.permissions || [],
		);

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to reverse transaction" };
	}
};

// Body schema for refund endpoint
export const refundBodySchema = t.Object({
	reason: t.String(),
	refundAmount: t.Optional(t.Number()),
});

// Body schema for reverse endpoint
export const reverseBodySchema = t.Object({
	reason: t.String(),
});
