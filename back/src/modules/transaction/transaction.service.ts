import * as transactionRepository from "./transaction.repository";
import { prisma } from "../../infrastructure/db/prisma.client";

// Helper function to verify wallet ownership
const verifyWalletOwnership = async (walletId: number, userId: number) => {
	const wallet = await prisma.wallet.findUnique({
		where: { id: walletId },
	});

	if (!wallet) {
		throw new Error("Wallet not found");
	}

	if (wallet.userId !== userId) {
		throw new Error("Not authorized to access this wallet");
	}

	return wallet;
};

// Transfer funds between two wallets
export const transferFunds = async (
	payerWalletId: number,
	receiverWalletId: number,
	amount: number,
	userId: number,
	transferType: "OWN_WALLET" | "P2P" = "P2P",
) => {
	// Validate amount
	if (amount <= 0) {
		throw new Error("Amount must be greater than 0");
	}

	// Verify ownership of payer wallet
	await verifyWalletOwnership(payerWalletId, userId);

	// Check if receiver wallet exists
	const receiverWallet = await prisma.wallet.findUnique({
		where: { id: receiverWalletId },
	});

	if (!receiverWallet) {
		throw new Error("Receiver wallet not found");
	}

	// Get payer wallet balance
	const payerWallet = await prisma.wallet.findUnique({
		where: { id: payerWalletId },
	});

	// Check balance
	if (Number(payerWallet!.balance) < amount) {
		throw new Error("Insufficient balance");
	}

	// Use Prisma transaction for atomicity
	const result = await prisma.$transaction(async (tx) => {
		// Create transaction record
		const transaction = await tx.transaction.create({
			data: {
				payerWalletId,
				receiverWalletId,
				amount,
				transactionType: "TRANSFER",
				transferType,
				status: "COMPLETED",
			},
		});

		// Deduct from payer wallet
		await tx.wallet.update({
			where: { id: payerWalletId },
			data: {
				balance: {
					decrement: amount,
				},
			},
		});

		// Add to receiver wallet
		await tx.wallet.update({
			where: { id: receiverWalletId },
			data: {
				balance: {
					increment: amount,
				},
			},
		});

		// Create ledger entry for payer (withdraw)
		await tx.ledgerEntry.create({
			data: {
				walletId: payerWalletId,
				transactionId: transaction.id,
				type: "P2P",
				amount: -amount, // Negative for withdrawal
			},
		});

		// Create ledger entry for receiver (deposit)
		await tx.ledgerEntry.create({
			data: {
				walletId: receiverWalletId,
				transactionId: transaction.id,
				type: "P2P",
				amount: amount,
			},
		});

		return transaction;
	});

	return {
		transaction: result,
		message: `Successfully transferred ${amount} to wallet ${receiverWalletId}`,
	};
};

// Withdraw funds from wallet (to external account)
export const withdrawFunds = async (
	walletId: number,
	amount: number,
	userId: number,
) => {
	// Validate amount
	if (amount <= 0) {
		throw new Error("Amount must be greater than 0");
	}

	// Verify wallet ownership
	await verifyWalletOwnership(walletId, userId);

	// Check if wallet has sufficient balance
	const wallet = await prisma.wallet.findUnique({
		where: { id: walletId },
	});

	if (Number(wallet!.balance) < amount) {
		throw new Error("Insufficient balance");
	}

	// Use Prisma transaction for atomicity
	const result = await prisma.$transaction(async (tx) => {
		// Create transaction record
		const transaction = await tx.transaction.create({
			data: {
				payerWalletId: walletId,
				receiverWalletId: null,
				amount,
				transactionType: "WITHDRAW",
				status: "COMPLETED",
			},
		});

		// Deduct from wallet
		await tx.wallet.update({
			where: { id: walletId },
			data: {
				balance: {
					decrement: amount,
				},
			},
		});

		// Create ledger entry
		await tx.ledgerEntry.create({
			data: {
				walletId,
				transactionId: transaction.id,
				type: "WITHDRAW",
				amount: -amount,
			},
		});

		return transaction;
	});

	return {
		transaction: result,
		message: `Successfully withdrew ${amount} from wallet`,
	};
};

// Deposit funds to wallet (from external source)
export const depositFunds = async (
	walletId: number,
	amount: number,
	userId: number,
) => {
	// Validate amount
	if (amount <= 0) {
		throw new Error("Amount must be greater than 0");
	}

	// Verify wallet ownership
	await verifyWalletOwnership(walletId, userId);

	// Use Prisma transaction for atomicity
	const result = await prisma.$transaction(async (tx) => {
		// Create transaction record
		const transaction = await tx.transaction.create({
			data: {
				payerWalletId: walletId,
				receiverWalletId: walletId,
				amount,
				transactionType: "DEPOSIT",
				status: "COMPLETED",
			},
		});

		// Add to wallet
		await tx.wallet.update({
			where: { id: walletId },
			data: {
				balance: {
					increment: amount,
				},
			},
		});

		// Create ledger entry
		await tx.ledgerEntry.create({
			data: {
				walletId,
				transactionId: transaction.id,
				type: "DEPOSIT",
				amount,
			},
		});

		return transaction;
	});

	return {
		transaction: result,
		message: `Successfully deposited ${amount} to wallet`,
	};
};

// Get transaction by ID
export const getTransaction = async (transactionId: number) => {
	const transaction =
		await transactionRepository.findTransactionById(transactionId);

	if (!transaction) {
		throw new Error("Transaction not found");
	}

	return transaction;
};

// Get transaction by public ID
export const getTransactionByPublicId = async (publicId: string) => {
	const transaction =
		await transactionRepository.findTransactionByPublicId(publicId);

	if (!transaction) {
		throw new Error("Transaction not found");
	}

	return transaction;
};

// Get transaction history for a wallet
export const getWalletTransactions = async (
	walletId: number,
	userId: number,
) => {
	// Verify wallet ownership
	await verifyWalletOwnership(walletId, userId);

	return transactionRepository.findTransactionsByWalletId(walletId);
};

// Get ledger entries for a wallet
export const getWalletLedger = async (walletId: number, userId: number) => {
	// Verify wallet ownership
	await verifyWalletOwnership(walletId, userId);

	return transactionRepository.findLedgerEntriesByWalletId(walletId);
};
