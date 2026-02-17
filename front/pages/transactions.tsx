import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { getUserWallets } from "@/lib/api/wallet";
import type { Wallet } from "@/types/wallet";
import type {
	TransactionWithDetails,
	TransactionsFilters,
} from "@/types/transaction";
import {
	TransactionSearch,
	ActiveFilters,
	TransactionTable,
	TransactionPagination,
	ReceiptModal,
} from "@/components/transactions";
import { TransactionFiltersModal } from "@/components/shared/modals/TransactionFiltersModal";

export default function TransactionsPage() {
	const [showFilters, setShowFilters] = useState(false);
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [selectedTransaction, setSelectedTransaction] =
		useState<TransactionWithDetails | null>(null);
	const [showReceiptModal, setShowReceiptModal] = useState(false);

	const {
		transactions,
		pagination,
		isLoading,
		error,
		filters,
		setFilters,
		setPage,
		setLimit,
	} = useTransactions({ initialPage: 1, initialLimit: 20 });

	// Load wallets on mount and set primary wallet as default filter
	useEffect(() => {
		const loadWallets = async () => {
			try {
				const response = await getUserWallets();
				const userWallets = response.wallets || [];
				setWallets(userWallets);

				// Auto-select primary wallet for initial filter
				const primaryWallet = userWallets.find((w: Wallet) => w.primary);
				if (primaryWallet) {
					setFilters({ walletId: primaryWallet.id });
				}
			} catch (err) {
				console.error("Failed to load wallets:", err);
			}
		};
		loadWallets();
	}, [setFilters]);

	// Handle search
	const handleSearch = (search: string) => {
		setFilters({ search: search || undefined });
	};

	// Handle apply filters
	const handleApplyFilters = (newFilters: TransactionsFilters) => {
		setFilters(newFilters);
		setShowFilters(false);
	};

	// Handle clear filters - reset to primary wallet
	const handleClearFilters = () => {
		// Reset to primary wallet - this is the default state
		const primaryWallet = wallets.find((w) => w.primary);
		if (primaryWallet) {
			setFilters({ walletId: primaryWallet.id });
		} else {
			setFilters({});
		}
	};

	// Handle remove single filter - for walletId, reset to primary wallet instead of removing
	const handleRemoveFilter = (key: keyof TransactionsFilters) => {
		// If removing walletId, reset to primary wallet instead of truly removing
		if (key === "walletId") {
			const primaryWallet = wallets.find((w) => w.primary);
			if (primaryWallet) {
				setFilters({ ...filters, walletId: primaryWallet.id });
			}
			return;
		}

		// For other filters, remove them
		const newFilters = { ...filters };
		delete newFilters[key];
		setFilters(newFilters);
	};

	// Handle view receipt
	const handleViewReceipt = (transaction: TransactionWithDetails) => {
		setSelectedTransaction(transaction);
		setShowReceiptModal(true);
	};

	// Handle close receipt modal
	const handleCloseReceipt = () => {
		setShowReceiptModal(false);
		setSelectedTransaction(null);
	};

	// Check if any filters are active (excluding search)
	// Note: walletId is always active since we default to primary wallet
	const hasActiveFilters = !!(
		filters.type ||
		filters.status ||
		filters.fromDate ||
		filters.toDate ||
		filters.walletId
	);

	// Get the current wallet being displayed
	const getCurrentWallet = () => {
		if (filters.walletId) {
			return wallets.find((w) => w.id === filters.walletId);
		}
		return null;
	};

	const currentWallet = getCurrentWallet();

	// Current wallet ID for passing to components
	const currentWalletId = filters.walletId
		? Number(filters.walletId)
		: undefined;

	return (
		<>
			<Head>
				<title>تاریخچه تراکنش‌ها | مدر</title>
			</Head>

			<MainLayout>
				<div className="space-y-6">
					{/* Page Header */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-2xl font-bold">تاریخچه تراکنش‌ها</h1>
							<p className="text-muted-foreground text-sm mt-1">
								Transaction History
							</p>
						</div>
					</div>

					{/* Search and Filter Bar */}
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<TransactionSearch
								value={filters.search || ""}
								onChange={handleSearch}
							/>
						</div>
						<Button
							variant="outline"
							onClick={() => setShowFilters(true)}
							className="gap-2"
						>
							<SlidersHorizontal className="h-4 w-4" />
							فیلترها
							{hasActiveFilters && (
								<span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
									!
								</span>
							)}
						</Button>
					</div>

					{/* Active Filters Tags - Always show when filters are active */}
					{hasActiveFilters && (
						<ActiveFilters
							filters={filters}
							wallets={wallets}
							onRemove={handleRemoveFilter}
							onClearAll={handleClearFilters}
						/>
					)}

					{/* Wallet Badge - Shows which wallet's transactions are being displayed */}
					{!hasActiveFilters && currentWallet && (
						<div className="flex flex-wrap items-center gap-2">
							<div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
								<span>
									کیف پول:{" "}
									{currentWallet.name ||
										`**** ${currentWallet.publicId.slice(-4)}`}
								</span>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="bg-destructive/10 text-destructive p-4 rounded-lg">
							{error}
						</div>
					)}

					{/* Transactions Table */}
					<TransactionTable
						transactions={transactions}
						isLoading={isLoading}
						onViewReceipt={handleViewReceipt}
						currentWalletId={currentWalletId}
					/>

					{/* Pagination */}
					{pagination && pagination.totalPages > 0 && (
						<TransactionPagination
							page={pagination.page}
							limit={pagination.limit}
							total={pagination.total}
							totalPages={pagination.totalPages}
							onPageChange={setPage}
							onLimitChange={setLimit}
						/>
					)}

					{/* Filters Modal */}
					<TransactionFiltersModal
						isOpen={showFilters}
						onClose={() => setShowFilters(false)}
						filters={filters}
						wallets={wallets}
						onApply={handleApplyFilters}
						onClear={handleClearFilters}
					/>

					{/* Receipt Modal */}
					<ReceiptModal
						transaction={selectedTransaction}
						isOpen={showReceiptModal}
						onClose={handleCloseReceipt}
						currentWalletId={currentWalletId}
					/>
				</div>
			</MainLayout>
		</>
	);
}
