"use client";

import { X, FilterX, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
	TransactionsFilters,
	TransactionType,
	TransactionStatus,
} from "@/types/transaction";
import {
	transactionTypeLabels,
	transactionStatusLabels,
} from "@/types/transaction";
import type { Wallet } from "@/types/wallet";

interface ActiveFiltersProps {
	filters: TransactionsFilters;
	wallets: Wallet[];
	onRemove: (key: keyof TransactionsFilters) => void;
	onClearAll: () => void;
}

export function ActiveFilters({
	filters,
	wallets,
	onRemove,
	onClearAll,
}: ActiveFiltersProps) {
	// Get active filters as an array - include primary flag for wallet filter
	const activeFilters: {
		key: keyof TransactionsFilters;
		label: string;
		primary?: boolean;
	}[] = [];

	// Handle type filter - show "همه" when "all" is selected
	if (filters.type && filters.type !== "all") {
		activeFilters.push({
			key: "type",
			label: `نوع: ${transactionTypeLabels[filters.type as TransactionType] || filters.type}`,
		});
	} else if (filters.type === "all") {
		activeFilters.push({
			key: "type",
			label: `نوع: همه`,
		});
	}

	// Handle status filter - show "همه" when "all" is selected
	if (filters.status && filters.status !== "all") {
		activeFilters.push({
			key: "status",
			label: `وضعیت: ${transactionStatusLabels[filters.status as TransactionStatus] || filters.status}`,
		});
	} else if (filters.status === "all") {
		activeFilters.push({
			key: "status",
			label: `وضعیت: همه`,
		});
	}

	// Handle wallet filter - show "همه" when explicitly set to all
	if (filters.walletId === "all") {
		activeFilters.push({
			key: "walletId",
			label: `کیف پول: همه`,
		});
	} else if (filters.walletId) {
		const wallet = wallets.find((w) => w.id === filters.walletId);
		const walletLabel =
			wallet?.name || `**** ${wallet?.publicId.slice(-4) || filters.walletId}`;

		activeFilters.push({
			key: "walletId",
			label: `کیف پول: ${walletLabel}`,
			primary: wallet?.primary,
		});
	}

	if (filters.fromDate) {
		activeFilters.push({
			key: "fromDate",
			label: `از: ${filters.fromDate}`,
		});
	}

	if (filters.toDate) {
		activeFilters.push({
			key: "toDate",
			label: `تا: ${filters.toDate}`,
		});
	}

	if (filters.search) {
		activeFilters.push({
			key: "search",
			label: `جستجو: ${filters.search}`,
		});
	}

	if (activeFilters.length === 0) {
		return null;
	}

	// Render each filter badge
	return (
		<div className="flex flex-wrap items-center gap-2">
			{activeFilters.map((filter) => (
				<div
					key={filter.key}
					className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm"
				>
					<span>{filter.label}</span>
					{filter.key === "walletId" && filter.primary && (
						<Badge
							variant="secondary"
							className="bg-yellow-100 text-yellow-800 gap-1"
						>
							اصلی
							<Star className="h-3 w-3 fill-yellow-500" />
						</Badge>
					)}
					<button
						onClick={() => onRemove(filter.key)}
						className="mr-1 hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}
		</div>
	);
}
