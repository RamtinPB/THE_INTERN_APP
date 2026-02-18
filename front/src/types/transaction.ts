// Transaction types for the transactions page

export type TransactionType =
	| "PURCHASE"
	| "TRANSFER"
	| "DEPOSIT"
	| "WITHDRAW"
	| "REFUND"
	| "ADMIN_ADJUSTMENT";

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface TransactionMetadata {
	productName?: string;
	productId?: string;
	sellerName?: string;
	fee?: number;
}

export interface PayerWallet {
	id: number;
	publicId: string;
}

export interface ReceiverWalletInfo {
	id: number;
	publicId: string;
	user: {
		phoneNumber: string;
	};
}

export interface TransactionWithDetails {
	id: number;
	publicId: string;
	transactionType: TransactionType;
	status: TransactionStatus;
	transferType?: "OWN_WALLET" | "P2P";
	amount: string;
	description?: string;
	createdAt: string;
	payerWallet: PayerWallet;
	receiverWallet?: ReceiverWalletInfo;
	metadata?: TransactionMetadata;
}

export interface TransactionPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface TransactionsResponse {
	transactions: TransactionWithDetails[];
	pagination: TransactionPagination;
}

export interface TransactionsFilters {
	type?: TransactionType | "" | "all";
	status?: TransactionStatus | "" | "all";
	walletId?: number | "" | "all";
	fromDate?: string;
	toDate?: string;
	search?: string;
	page?: number;
	limit?: number;
}

// Helper to get Persian labels for transaction types
export const transactionTypeLabels: Record<TransactionType, string> = {
	PURCHASE: "خرید",
	TRANSFER: "انتقال",
	DEPOSIT: "واریز",
	WITHDRAW: "برداشت",
	REFUND: "بازگشت",
	ADMIN_ADJUSTMENT: "تعدیل",
};

// Helper to get Persian labels for transaction status
export const transactionStatusLabels: Record<TransactionStatus, string> = {
	COMPLETED: "تکمیل شده",
	PENDING: "در انتظار",
	FAILED: "ناموفق",
};

// Helper to get status icon
export const transactionStatusIcons: Record<TransactionStatus, string> = {
	COMPLETED: "✓",
	PENDING: "⏳",
	FAILED: "✗",
};

// Type options for filters
export const transactionTypeOptions = [
	{ value: "all", label: "همه" },
	{ value: "PURCHASE", label: "خرید" },
	{ value: "TRANSFER", label: "انتقال" },
	{ value: "DEPOSIT", label: "واریز" },
	{ value: "WITHDRAW", label: "برداشت" },
	{ value: "REFUND", label: "بازگشت" },
	{ value: "ADMIN_ADJUSTMENT", label: "تعدیل" },
];

export const transactionStatusOptions = [
	{ value: "all", label: "همه" },
	{ value: "COMPLETED", label: "تکمیل شده" },
	{ value: "PENDING", label: "در انتظار" },
	{ value: "FAILED", label: "ناموفق" },
];
