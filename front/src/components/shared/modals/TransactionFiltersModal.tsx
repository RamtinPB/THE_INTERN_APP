"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar, SlidersHorizontal, Loader2, Star } from "lucide-react";
import type { TransactionsFilters } from "@/types/transaction";
import type { Wallet } from "@/types/wallet";
import {
	transactionTypeOptions,
	transactionStatusOptions,
	transactionTypeLabels,
	transactionStatusLabels,
} from "@/types/transaction";

interface TransactionFiltersModalProps {
	isOpen: boolean;
	onClose: () => void;
	filters: TransactionsFilters;
	wallets: Wallet[];
	onApply: (filters: TransactionsFilters) => void;
	onClear: () => void;
}

export function TransactionFiltersModal({
	isOpen,
	onClose,
	filters,
	wallets,
	onApply,
	onClear,
}: TransactionFiltersModalProps) {
	const [localFilters, setLocalFilters] =
		useState<TransactionsFilters>(filters);
	const [isLoadingWallets, setIsLoadingWallets] = useState(false);

	// Sync local filters with prop filters when modal opens
	useEffect(() => {
		if (isOpen) {
			setLocalFilters(filters);
		}
	}, [isOpen, filters]);

	// Handle apply filters
	const handleApply = () => {
		onApply(localFilters);
		onClose();
	};

	// Handle clear all filters
	const handleClear = () => {
		const emptyFilters: TransactionsFilters = {
			page: 1,
			limit: localFilters.limit || 20,
		};
		setLocalFilters(emptyFilters);
		onClear();
		onClose();
	};

	// Handle modal close
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	// Update a specific filter
	const updateFilter = (
		key: keyof TransactionsFilters,
		value: string | number | undefined,
	) => {
		setLocalFilters((prev) => ({ ...prev, [key]: value }));
	};

	// Check if any filters are active (excluding pagination)
	const hasActiveFilters = !!(
		localFilters.type ||
		localFilters.status ||
		localFilters.walletId ||
		localFilters.fromDate ||
		localFilters.toDate
	);

	// Get selected wallet for display
	const selectedWallet = wallets.find((w) => w.id === localFilters.walletId);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				dir="rtl"
				className="sm:max-w-lg [&>button]:left-4 [&>button]:right-auto"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SlidersHorizontal className="h-5 w-5" />
						فیلترهای تراکنش
					</DialogTitle>
					<DialogDescription className="text-right" dir="rtl">
						فیلترهای مورد نظر خود را انتخاب کنید
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Wallet Filter */}
					<div className="space-y-2">
						<label className="text-sm font-medium">کیف پول</label>
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
								<SelectValue placeholder="همه کیف پول‌ها">
									{localFilters.walletId && selectedWallet ? (
										<div className="flex items-center gap-2">
											{selectedWallet.primary && (
												<Badge
													variant="secondary"
													className="bg-yellow-100 text-yellow-800 gap-1"
												>
													<Star className="h-3 w-3 fill-yellow-500" />
													اصلی
												</Badge>
											)}
											<span>
												{selectedWallet.name ||
													`**** ${selectedWallet.publicId.slice(-4)}`}
											</span>
										</div>
									) : (
										"همه کیف پول‌ها"
									)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent dir="rtl">
								<SelectItem value="all">همه کیف پول‌ها</SelectItem>
								{wallets.map((wallet) => (
									<SelectItem key={wallet.id} value={wallet.id.toString()}>
										<div className="flex items-center gap-2">
											<span>
												{wallet.name || `**** ${wallet.publicId.slice(-4)}`}
											</span>
											{wallet.primary && (
												<Badge
													variant="secondary"
													className="bg-yellow-100 text-yellow-800 gap-1"
												>
													اصلی
													<Star className="h-3 w-3 fill-yellow-500" />
												</Badge>
											)}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Transaction Type Filter */}
					<div className="space-y-2">
						<label className="text-sm font-medium">نوع تراکنش</label>
						<Select
							value={localFilters.type || ""}
							onValueChange={(value) =>
								updateFilter("type", value === "all" ? undefined : value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="همه انواع">
									{localFilters.type ? (
										<Badge variant="secondary" className="ml-2">
											{
												transactionTypeLabels[
													localFilters.type as keyof typeof transactionTypeLabels
												]
											}
										</Badge>
									) : (
										"همه انواع"
									)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent dir="rtl">
								{transactionTypeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Status Filter */}
					<div className="space-y-2">
						<label className="text-sm font-medium">وضعیت</label>
						<Select
							value={localFilters.status || ""}
							onValueChange={(value) =>
								updateFilter("status", value === "all" ? undefined : value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="همه انواع">
									{localFilters.status ? (
										<Badge variant="secondary" className="ml-2">
											{
												transactionStatusLabels[
													localFilters.status as keyof typeof transactionStatusLabels
												]
											}
										</Badge>
									) : (
										"همه انواع"
									)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent dir="rtl">
								{transactionStatusOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Range Filters */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">از تاریخ</label>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="date"
									value={localFilters.fromDate || ""}
									onChange={(e) =>
										updateFilter("fromDate", e.target.value || undefined)
									}
									className="pl-10"
									dir="rtl"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">تا تاریخ</label>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="date"
									value={localFilters.toDate || ""}
									onChange={(e) =>
										updateFilter("toDate", e.target.value || undefined)
									}
									className="pl-10"
									dir="rtl"
								/>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={handleClear}
						disabled={!hasActiveFilters}
					>
						پاک کردن
					</Button>
					<Button type="button" onClick={handleApply}>
						اعمال فیلتر
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
