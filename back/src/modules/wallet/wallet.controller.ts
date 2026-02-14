import * as walletService from "./wallet.service";

// Create a new wallet for the authenticated user
export const createWallet = async (ctx: any) => {
	// User ID comes from the auth guard (ctx.user)
	const userId = ctx.user.id;

	try {
		const wallet = await walletService.createWalletForUser(userId);
		return { wallet };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to create wallet" };
	}
};

// Get wallet by ID
export const getWallet = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const wallet = await walletService.getWallet(walletId);
		return { wallet };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Wallet not found" };
	}
};

// Get wallet by public ID
export const getWalletByPublicId = async (ctx: any) => {
	const publicId = ctx.params.publicId;

	try {
		const wallet = await walletService.getWalletByPublicId(publicId);
		return { wallet };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Wallet not found" };
	}
};

// Get all wallets for authenticated user
export const getUserWallets = async (ctx: any) => {
	const userId = ctx.user.id;

	try {
		const wallets = await walletService.getUserWallets(userId);
		return { wallets };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get wallets" };
	}
};

// Fund/deposit money into wallet
export const fundWallet = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { amount } = body;

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	if (!amount || amount <= 0) {
		ctx.set.status = 400;
		return { error: "Valid amount is required" };
	}

	try {
		const result = await walletService.fundWallet(walletId, amount);
		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to fund wallet" };
	}
};

// Withdraw money from wallet
export const withdrawFromWallet = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);
	const body = await ctx.body;
	const { amount } = body;

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	if (!amount || amount <= 0) {
		ctx.set.status = 400;
		return { error: "Valid amount is required" };
	}

	try {
		const result = await walletService.withdrawFromWallet(walletId, amount);
		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to withdraw from wallet" };
	}
};

// Get wallet balance
export const getWalletBalance = async (ctx: any) => {
	const walletId = parseInt(ctx.params.id);

	if (isNaN(walletId)) {
		ctx.set.status = 400;
		return { error: "Invalid wallet ID" };
	}

	try {
		const balance = await walletService.getWalletBalance(walletId);
		return balance;
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Wallet not found" };
	}
};
