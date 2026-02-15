import * as transactionService from "./transaction.service";

// Transfer funds between wallets
export const transfer = async (ctx: any) => {
	const body = await ctx.body;
	const { fromWalletId, toWalletId, amount, transferType } = body;
	const userId = ctx.user.id;

	if (!fromWalletId || !toWalletId || !amount) {
		ctx.set.status = 400;
		return { error: "fromWalletId, toWalletId, and amount are required" };
	}

	try {
		const result = await transactionService.transferFunds(
			parseInt(fromWalletId),
			parseInt(toWalletId),
			parseFloat(amount),
			userId,
			transferType || "P2P",
		);
		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Transfer failed" };
	}
};

// Withdraw funds from wallet
export const withdraw = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { amount } = body;
	const userId = ctx.user.id;

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	if (!amount || amount <= 0) {
		ctx.set.status = 400;
		return { error: "Valid amount is required" };
	}

	try {
		const result = await transactionService.withdrawFunds(
			walletId,
			parseFloat(amount),
			userId,
		);
		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Withdrawal failed" };
	}
};

// Deposit funds to wallet
export const deposit = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { amount } = body;
	const userId = ctx.user.id;

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	if (!amount || amount <= 0) {
		ctx.set.status = 400;
		return { error: "Valid amount is required" };
	}

	try {
		const result = await transactionService.depositFunds(
			walletId,
			parseFloat(amount),
			userId,
		);
		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Deposit failed" };
	}
};

// Get transaction by ID
export const getTransaction = async (ctx: any) => {
	const transactionId = parseInt(ctx.params.id);

	if (isNaN(transactionId)) {
		ctx.set.status = 400;
		return { error: "Invalid transaction ID" };
	}

	try {
		const transaction = await transactionService.getTransaction(transactionId);
		return { transaction };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Transaction not found" };
	}
};

// Get transaction by public ID
export const getTransactionByPublicId = async (ctx: any) => {
	const publicId = ctx.params.publicId;

	try {
		const transaction =
			await transactionService.getTransactionByPublicId(publicId);
		return { transaction };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Transaction not found" };
	}
};

// Get wallet transaction history
export const getWalletTransactions = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);
	const userId = ctx.user.id;

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const transactions = await transactionService.getWalletTransactions(
			walletId,
			userId,
		);
		return { transactions };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get transactions" };
	}
};

// Get wallet ledger entries
export const getWalletLedger = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);
	const userId = ctx.user.id;

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const ledger = await transactionService.getWalletLedger(walletId, userId);
		return { ledger };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get ledger" };
	}
};
