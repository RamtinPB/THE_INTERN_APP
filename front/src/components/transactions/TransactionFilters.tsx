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
import { Calendar, Star } from "lucide-react";
import type { TransactionsFilters } from "@/types/transaction";
import type { Wallet } from "@/types/wallet";
import {
	transactionTypeOptions,
	transactionStatusOptions,
} from "@/types/transaction";
import { Badge } from "../ui/badge";

interface TransactionFiltersProps {
	filters: TransactionsFilters;
	wallets: Wallet[];
	onApply: (filters: TransactionsFilters) => void;
	onClear: () => void;
}

export function TransactionFilters({
	filters,
	wallets,
	onApply,
	onClear,
}: TransactionFiltersProps) {
	const [localFilters, setLocalFilters] =
		useState<TransactionsFilters>(filters);

	// Sync localFilters when filters prop changes (e.g., when parent clears filters)
	useEffect(() => {
		setLocalFilters(filters);
	}, [filters]);

	const handleApply = () => {
		// Pass filters to parent (including "all" values for display in ActiveFilters)
		// The useTransactions hook will clean "all" values before sending to API
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
						dir="rtl"
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
						dir="rtl"
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
						dir="rtl"
						value={
							localFilters.walletId?.toString() ||
							localFilters.walletId === "all"
								? "all"
								: ""
						}
						onValueChange={(value) =>
							updateFilter(
								"walletId",
								value === "all" ? "all" : parseInt(value),
							)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="همه" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">همه</SelectItem>
							{wallets.map((wallet) => (
								<SelectItem key={wallet.id} value={wallet.id.toString()}>
									{wallet.name || `**** ${wallet.publicId.slice(-4)}`}

									{wallet.primary && (
										<Badge
											variant="secondary"
											className="bg-yellow-100 text-yellow-800 gap-1"
										>
											اصلی
											<Star className="h-3 w-3 fill-yellow-500" />
										</Badge>
									)}
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
			<div className="flex gap-2 justify-start">
				<Button variant="outline" onClick={handleClear}>
					بازگشت به حالت پیش فرض
				</Button>
				<Button onClick={handleApply}>اعمال فیلتر</Button>
			</div>
		</div>
	);
}
