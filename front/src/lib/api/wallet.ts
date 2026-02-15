import { authenticatedFetch } from "./auth";
import type { Wallet, Transaction } from "@/types/wallet";

// Re-export types for convenience
export type { Wallet, Transaction };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Get all user wallets
export async function getUserWallets(): Promise<{ wallets: Wallet[] }> {
	const response = await authenticatedFetch(`${API_BASE}/wallet`, {
		method: "GET",
	});

	if (!response.ok) {
		let errMsg = "Failed to fetch wallets";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Get wallet by ID
export async function getWalletById(
	walletId: number,
): Promise<{ wallet: Wallet }> {
	const response = await authenticatedFetch(`${API_BASE}/wallet/${walletId}`, {
		method: "GET",
	});

	if (!response.ok) {
		let errMsg = "Failed to fetch wallet";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Get wallet by publicId
export async function getWalletByPublicId(
	publicId: string,
): Promise<{ wallet: Wallet }> {
	const response = await authenticatedFetch(
		`${API_BASE}/wallet/publicId/${publicId}`,
		{
			method: "GET",
		},
	);

	if (!response.ok) {
		let errMsg = "Wallet not found";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Get wallet transactions (recent)
export async function getWalletTransactions(
	walletId: number,
	limit: number = 10,
): Promise<{ transactions: Transaction[] }> {
	const response = await authenticatedFetch(
		`${API_BASE}/transactions/wallet/${walletId}`,
		{
			method: "GET",
		},
	);

	if (!response.ok) {
		let errMsg = "Failed to fetch transactions";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	const data = await response.json();
	// Limit transactions on client side if needed
	return {
		transactions: data.transactions?.slice(0, limit) || [],
	};
}

// Create a new wallet
export async function createWallet(): Promise<{ wallet: Wallet }> {
	const response = await authenticatedFetch(`${API_BASE}/wallet`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		let errMsg = "Failed to create wallet";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Deposit funds to wallet
export async function depositToWallet(
	walletId: number,
	amount: number,
): Promise<{ transaction: Transaction }> {
	const response = await authenticatedFetch(
		`${API_BASE}/wallet/${walletId}/deposit`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount }),
		},
	);

	if (!response.ok) {
		let errMsg = "Failed to deposit";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Withdraw funds from wallet
export async function withdrawFromWallet(
	walletId: number,
	amount: number,
): Promise<{ transaction: Transaction }> {
	const response = await authenticatedFetch(
		`${API_BASE}/wallet/${walletId}/withdraw`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount }),
		},
	);

	if (!response.ok) {
		let errMsg = "Failed to withdraw";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Transfer funds between wallets
export async function transferFunds(
	fromWalletId: number,
	toWalletId: number,
	amount: number,
	transferType: "OWN_WALLET" | "P2P" = "P2P",
): Promise<{ transaction: Transaction }> {
	const response = await authenticatedFetch(
		`${API_BASE}/transaction/transfer`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				fromWalletId,
				toWalletId,
				amount,
				transferType,
			}),
		},
	);

	if (!response.ok) {
		let errMsg = "Failed to transfer";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Transfer funds to another user by their publicId (P2P transfer)
export async function transferFundsByPublicId(
	fromWalletId: number,
	recipientPublicId: string,
	amount: number,
): Promise<{ transaction: Transaction }> {
	const response = await authenticatedFetch(
		`${API_BASE}/transaction/transfer/p2p`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				fromWalletId,
				recipientPublicId,
				amount,
			}),
		},
	);

	if (!response.ok) {
		let errMsg = "Failed to transfer";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Set wallet as primary
export async function setPrimaryWallet(
	walletId: number,
): Promise<{ wallet: Wallet }> {
	const response = await authenticatedFetch(
		`${API_BASE}/wallet/${walletId}/primary`,
		{
			method: "PUT",
		},
	);

	if (!response.ok) {
		let errMsg = "Failed to set primary wallet";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}
