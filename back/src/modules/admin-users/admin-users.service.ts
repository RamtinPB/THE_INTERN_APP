import { prisma } from "../../infrastructure/db/prisma.client";
import * as adminRepository from "../admin/admin.repository";
import { hasPermission } from "../../types/admin";

// List all users with pagination and filters
export const listUsers = async (params: {
	page: number;
	limit: number;
	userType?: string;
	phoneNumber?: string;
	adminPermissions: string[];
}) => {
	const { page, limit, userType, phoneNumber, adminPermissions } = params;

	// Check permission
	if (!hasPermission(adminPermissions, "users:read")) {
		throw new Error("Insufficient permissions");
	}

	const skip = (page - 1) * limit;

	const where: any = {};
	if (userType) where.userType = userType;
	if (phoneNumber) where.phoneNumber = { contains: phoneNumber };

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip,
			take: limit,
			select: {
				id: true,
				publicId: true,
				phoneNumber: true,
				userType: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.user.count({ where }),
	]);

	return {
		data: users,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

// Get user by ID
export const getUserById = async (id: number, adminPermissions: string[]) => {
	if (!hasPermission(adminPermissions, "users:read")) {
		throw new Error("Insufficient permissions");
	}

	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			publicId: true,
			phoneNumber: true,
			userType: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	return user;
};

// Get user's wallets
export const getUserWallets = async (
	userId: number,
	adminPermissions: string[],
) => {
	if (!hasPermission(adminPermissions, "users:read")) {
		throw new Error("Insufficient permissions");
	}

	return prisma.wallet.findMany({
		where: { userId },
		select: {
			id: true,
			publicId: true,
			balance: true,
			primary: true,
			createdAt: true,
		},
	});
};

// Get user's transactions
export const getUserTransactions = async (
	userId: number,
	params: { page: number; limit: number },
	adminPermissions: string[],
) => {
	if (!hasPermission(adminPermissions, "users:read")) {
		throw new Error("Insufficient permissions");
	}

	const { page, limit } = params;
	const skip = (page - 1) * limit;

	// Find user's wallets
	const wallets = await prisma.wallet.findMany({
		where: { userId },
		select: { id: true },
	});

	const walletIds = wallets.map((w) => w.id);

	const [transactions, total] = await Promise.all([
		prisma.transaction.findMany({
			where: {
				OR: [
					{ payerWalletId: { in: walletIds } },
					{ receiverWalletId: { in: walletIds } },
				],
			},
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.transaction.count({
			where: {
				OR: [
					{ payerWalletId: { in: walletIds } },
					{ receiverWalletId: { in: walletIds } },
				],
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

// Suspend user
export const suspendUser = async (
	userId: number,
	adminId: number,
	adminPermissions: string[],
	reason?: string,
) => {
	if (!hasPermission(adminPermissions, "users:suspend")) {
		throw new Error("Insufficient permissions");
	}

	// Update user status in database
	await prisma.user.update({
		where: { id: userId },
		data: { status: "SUSPENDED" },
	});

	await adminRepository.createAuditLog({
		adminId,
		action: "USER_SUSPENDED",
		entityType: "User",
		entityId: userId,
		description: reason || "User suspended",
	});

	return { success: true, message: "User suspended" };
};

// Unsuspend user
export const unsuspendUser = async (
	userId: number,
	adminId: number,
	adminPermissions: string[],
	reason?: string,
) => {
	if (!hasPermission(adminPermissions, "users:suspend")) {
		throw new Error("Insufficient permissions");
	}

	// Update user status in database
	await prisma.user.update({
		where: { id: userId },
		data: { status: "ACTIVE" },
	});

	await adminRepository.createAuditLog({
		adminId,
		action: "USER_REACTIVATED",
		entityType: "User",
		entityId: userId,
		description: reason || "User reactivated",
	});

	return { success: true, message: "User reactivated" };
};

// Adjust wallet balance
export const adjustWalletBalance = async (
	userId: number,
	params: {
		walletId: number;
		amount: number;
		type: "ADD" | "SUBTRACT";
		reason: string;
	},
	adminId: number,
	adminPermissions: string[],
) => {
	if (!hasPermission(adminPermissions, "wallets:adjust")) {
		throw new Error("Insufficient permissions");
	}

	const { walletId, amount, type, reason } = params;

	// Verify wallet belongs to user
	const wallet = await prisma.wallet.findFirst({
		where: { id: walletId, userId },
	});

	if (!wallet) {
		throw new Error("Wallet not found");
	}

	// Calculate new balance
	const balanceChange = type === "ADD" ? amount : -amount;
	const newBalance = Number(wallet.balance) + balanceChange;

	if (newBalance < 0) {
		throw new Error("Insufficient balance");
	}

	// Update wallet and create transaction in a transaction
	const result = await prisma.$transaction(async (tx) => {
		// Update wallet balance
		const updatedWallet = await tx.wallet.update({
			where: { id: walletId },
			data: { balance: newBalance },
		});

		// Create ADMIN_ADJUSTMENT transaction
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

		// Create ledger entries
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

	// Create audit log
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
