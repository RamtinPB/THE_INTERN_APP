"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import type { TransactionsFilters } from "@/types/transaction";
import type { Wallet } from "@/types/wallet";
import {
	transactionTypeOptions,
	transactionStatusOptions,
} from "@/types/transaction";
import { getUserWallets } from "@/lib/api/wallet";

interface TransactionFiltersProps {
	filters: TransactionsFilters;
	onApply: (filters: TransactionsFilters) => void;
	onClear: () => void;
}

export function TransactionFilters({
	filters,
	onApply,
	onClear,
}: TransactionFiltersProps) {
	const [localFilters, setLocalFilters] =
		useState<TransactionsFilters>(filters);
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [isLoadingWallets, setIsLoadingWallets] = useState(true);

	// Load wallets on mount
	useEffect(() => {
		const loadWallets = async () => {
			try {
				const response = await getUserWallets();
				setWallets(response.wallets || []);
			} catch (error) {
				console.error("Failed to load wallets:", error);
			} finally {
				setIsLoadingWallets(false);
			}
		};
		loadWallets();
	}, []);

	const handleApply = () => {
		onApply(localFilters);
	};

	const handleClear = () => {
		const emptyFilters: TransactionsFilters = {
			page: 1,
			limit: localFilters.limit || 20,
		};
		setLocalFilters(emptyFilters);
		onClear();
	};

	const updateFilter = (
		key: keyof TransactionsFilters,
		value: string | number | undefined,
	) => {
		setLocalFilters((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="bg-card rounded-lg border p-4 space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Transaction Type Filter */}
				<div>
					<label className="text-sm font-medium mb-2 block">نوع تراکنش</label>
					<Select
						value={localFilters.type || ""}
						onValueChange={(value) => updateFilter("type", value || undefined)}
					>
						<SelectTrigger>
							<SelectValue placeholder="همه" />
						</SelectTrigger>
						<SelectContent>
							{transactionTypeOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Status Filter */}
				<div>
					<label className="text-sm font-medium mb-2 block">وضعیت</label>
					<Select
						value={localFilters.status || ""}
						onValueChange={(value) =>
							updateFilter("status", value || undefined)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="همه" />
						</SelectTrigger>
						<SelectContent>
							{transactionStatusOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Wallet Filter */}
				<div>
					<label className="text-sm font-medium mb-2 block">کیف پول</label>
					<Select
						value={localFilters.walletId?.toString() || ""}
						onValueChange={(value) =>
							updateFilter(
								"walletId",
								value === "all" ? undefined : parseInt(value),
							)
						}
						disabled={isLoadingWallets}
					>
						<SelectTrigger>
							<SelectValue placeholder="همه" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">همه</SelectItem>
							{wallets.map((wallet) => (
								<SelectItem key={wallet.id} value={wallet.id.toString()}>
									{wallet.name || `**** ${wallet.publicId.slice(-4)}`}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Date Range Filters */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="text-sm font-medium mb-2 block">از تاریخ</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="date"
							value={localFilters.fromDate || ""}
							onChange={(e) => updateFilter("fromDate", e.target.value)}
							className="pl-10"
							dir="rtl"
						/>
					</div>
				</div>

				<div>
					<label className="text-sm font-medium mb-2 block">تا تاریخ</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="date"
							value={localFilters.toDate || ""}
							onChange={(e) => updateFilter("toDate", e.target.value)}
							className="pl-10"
							dir="rtl"
						/>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-2 justify-end">
				<Button variant="outline" onClick={handleClear}>
					پاک کردن
				</Button>
				<Button onClick={handleApply}>اعمال فیلتر</Button>
			</div>
		</div>
	);
}
