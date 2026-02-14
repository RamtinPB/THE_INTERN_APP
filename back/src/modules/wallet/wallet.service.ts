import * as walletRepository from "./wallet.repository";

// Create a wallet for a user
export const createWalletForUser = async (userId: number) => {
	// Check if user already has a wallet
	const existingWallets = await walletRepository.findWalletsByUserId(userId);

	if (existingWallets.length > 0) {
		// User already has wallet(s), return existing primary wallet
		// For now, allow multiple wallets per user (e.g., savings, checking)
		// You might want to add a "isPrimary" field later
	}

	const wallet = await walletRepository.createWallet(userId, 0);
	return wallet;
};

// Get wallet by ID
export const getWallet = async (walletId: number) => {
	const wallet = await walletRepository.findWalletById(walletId);

	if (!wallet) {
		throw new Error("Wallet not found");
	}

	return wallet;
};

// Get wallet by public ID
export const getWalletByPublicId = async (publicId: string) => {
	const wallet = await walletRepository.findWalletByPublicId(publicId);

	if (!wallet) {
		throw new Error("Wallet not found");
	}

	return wallet;
};

// Get all wallets for a user
export const getUserWallets = async (userId: number) => {
	return walletRepository.findWalletsByUserId(userId);
};

// Fund/deposit money into wallet
export const fundWallet = async (walletId: number, amount: number) => {
	// Validate amount
	if (amount <= 0) {
		throw new Error("Amount must be greater than 0");
	}

	// Check if wallet exists
	const wallet = await walletRepository.findWalletById(walletId);
	if (!wallet) {
		throw new Error("Wallet not found");
	}

	// Update balance
	const updatedWallet = await walletRepository.updateWalletBalance(
		walletId,
		amount,
	);

	return {
		wallet: updatedWallet,
		message: `Successfully added ${amount} to wallet`,
	};
};

// Withdraw money from wallet
export const withdrawFromWallet = async (walletId: number, amount: number) => {
	// Validate amount
	if (amount <= 0) {
		throw new Error("Amount must be greater than 0");
	}

	// Check if wallet exists and has sufficient balance
	const wallet = await walletRepository.findWalletById(walletId);
	if (!wallet) {
		throw new Error("Wallet not found");
	}

	// Convert Decimal to number for comparison
	const currentBalance = Number(wallet.balance);
	if (currentBalance < amount) {
		throw new Error("Insufficient balance");
	}

	// Update balance (negative amount for withdrawal)
	const updatedWallet = await walletRepository.updateWalletBalance(
		walletId,
		-amount,
	);

	return {
		wallet: updatedWallet,
		message: `Successfully withdrew ${amount} from wallet`,
	};
};

// Get wallet balance
export const getWalletBalance = async (walletId: number) => {
	const wallet = await walletRepository.findWalletById(walletId);

	if (!wallet) {
		throw new Error("Wallet not found");
	}

	return {
		walletId: wallet.id,
		publicId: wallet.publicId,
		balance: wallet.balance,
	};
};
