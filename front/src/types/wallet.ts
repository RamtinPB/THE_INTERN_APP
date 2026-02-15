export interface Wallet {
	id: number;
	publicId: string;
	name?: string; // Optional wallet name
	balance: string; // Decimal from Prisma
	primary: boolean; // Whether this is the primary wallet
	createdAt: string;
	updatedAt: string;
}

export interface Transaction {
	id: number;
	publicId: string;
	status: "PENDING" | "OTP_VERIFIED" | "COMPLETED" | "FAILED";
	transactionType:
		| "TRANSFER"
		| "DEPOSIT"
		| "WITHDRAW"
		| "PURCHASE"
		| "REFUND"
		| "ADMIN_ADJUSTMENT";
	transferType?: "OWN_WALLET" | "P2P"; // Only for TRANSFER type
	amount: string;
	payerWalletId: number;
	receiverWalletId: number | null;
	createdAt: string;
	receiverWallet?: {
		user: {
			phoneNumber: string;
		};
	};
	payerWallet?: {
		user: {
			phoneNumber: string;
		};
	};
}
