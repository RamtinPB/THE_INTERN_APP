import { prisma } from "../../infrastructure/db/prisma.client";
import * as adminRepository from "../admin/admin.repository";
import { hasPermission } from "../../types/admin";

// List all wallets with pagination and filters
export const listWallets = async (params: {
	page: number;
	limit: number;
	userType?: string;
	minBalance?: number;
	maxBalance?: number;
	adminPermissions: string[];
}) => {
	const { page, limit, userType, minBalance, maxBalance, adminPermissions } =
		params;

	if (!hasPermission(adminPermissions, "wallets:read")) {
		throw new Error("Insufficient permissions");
	}

	const skip = (page - 1) * limit;

	const where: any = {};
	if (userType) {
		where.user = { userType };
	}
	if (minBalance || maxBalance) {
		where.balance = {};
		if (minBalance) where.balance.gte = minBalance;
		if (maxBalance) where.balance.lte = maxBalance;
	}

	const [wallets, total] = await Promise.all([
		prisma.wallet.findMany({
			where,
			skip,
			take: limit,
			include: {
				user: {
					select: { id: true, phoneNumber: true, userType: true },
				},
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.wallet.count({ where }),
	]);

	return {
		data: wallets,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

// Get wallet by ID
export const getWalletById = async (id: number, adminPermissions: string[]) => {
	if (!hasPermission(adminPermissions, "wallets:read")) {
		throw new Error("Insufficient permissions");
	}

	const wallet = await prisma.wallet.findUnique({
		where: { id },
		include: {
			user: {
				select: { id: true, phoneNumber: true, userType: true },
			},
			ledgerEntries: {
				orderBy: { createdAt: "desc" },
				take: 50,
			},
		},
	});

	if (!wallet) {
		throw new Error("Wallet not found");
	}

	return wallet;
};

// Get wallet's transactions
export const getWalletTransactions = async (
	walletId: number,
	params: { page: number; limit: number },
	adminPermissions: string[],
) => {
	if (!hasPermission(adminPermissions, "wallets:read")) {
		throw new Error("Insufficient permissions");
	}

	const { page, limit } = params;
	const skip = (page - 1) * limit;

	const [transactions, total] = await Promise.all([
		prisma.transaction.findMany({
			where: {
				OR: [{ payerWalletId: walletId }, { receiverWalletId: walletId }],
			},
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.transaction.count({
			where: {
				OR: [{ payerWalletId: walletId }, { receiverWalletId: walletId }],
			},
		}),
	]);

	return {
		data: transactions,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

// Freeze wallet
export const freezeWallet = async (
	walletId: number,
	adminId: number,
	adminPermissions: string[],
	reason?: string,
) => {
	if (!hasPermission(adminPermissions, "wallets:freeze")) {
		throw new Error("Insufficient permissions");
	}

	// Update wallet frozen status in database
	await prisma.wallet.update({
		where: { id: walletId },
		data: { frozen: true },
	});

	await adminRepository.createAuditLog({
		adminId,
		action: "WALLET_FROZEN",
		entityType: "Wallet",
		entityId: walletId,
		description: reason || "Wallet frozen",
	});

	return { success: true, message: "Wallet frozen" };
};

// Unfreeze wallet
export const unfreezeWallet = async (
	walletId: number,
	adminId: number,
	adminPermissions: string[],
	reason?: string,
) => {
	if (!hasPermission(adminPermissions, "wallets:freeze")) {
		throw new Error("Insufficient permissions");
	}

	// Update wallet frozen status in database
	await prisma.wallet.update({
		where: { id: walletId },
		data: { frozen: false },
	});

	await adminRepository.createAuditLog({
		adminId,
		action: "WALLET_UNFROZEN",
		entityType: "Wallet",
		entityId: walletId,
		description: reason || "Wallet unfrozen",
	});

	return { success: true, message: "Wallet unfrozen" };
};

// Adjust wallet balance
export const adjustWalletBalance = async (
	walletId: number,
	params: { amount: number; type: "ADD" | "SUBTRACT"; reason: string },
	adminId: number,
	adminPermissions: string[],
) => {
	if (!hasPermission(adminPermissions, "wallets:adjust")) {
		throw new Error("Insufficient permissions");
	}

	const { amount, type, reason } = params;

	const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
	if (!wallet) {
		throw new Error("Wallet not found");
	}

	const balanceChange = type === "ADD" ? amount : -amount;
	const newBalance = Number(wallet.balance) + balanceChange;

	if (newBalance < 0) {
		throw new Error("Insufficient balance");
	}

	const result = await prisma.$transaction(async (tx) => {
		const updatedWallet = await tx.wallet.update({
			where: { id: walletId },
			data: { balance: newBalance },
		});

		const transaction = await tx.transaction.create({
			data: {
				status: "COMPLETED",
				transactionType: "ADMIN_ADJUSTMENT",
				amount: amount,
				payerWalletId: walletId,
				description: reason,
				metadata: { type, reason },
			},
		});

		await tx.ledgerEntry.create({
			data: {
				walletId,
				transactionId: transaction.id,
				type: type === "ADD" ? "DEPOSIT" : "WITHDRAW",
				amount: balanceChange,
			},
		});

		return { wallet: updatedWallet, transaction };
	});

	await adminRepository.createAuditLog({
		adminId,
		action: "WALLET_ADJUSTED",
		entityType: "Wallet",
		entityId: walletId,
		description: `${type === "ADD" ? "Added" : "Subtracted"} ${amount}. Reason: ${reason}`,
		metadata: {
			previousBalance: wallet.balance,
			newBalance: result.wallet.balance,
		},
	});

	return {
		success: true,
		newBalance: result.wallet.balance,
		transaction: result.transaction,
	};
};
