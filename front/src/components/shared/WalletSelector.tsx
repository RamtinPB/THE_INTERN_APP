"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "@/types/wallet";
import { formatCurrency } from "@/lib/format";
import { Star } from "lucide-react";

export interface SharedWalletSelectorProps {
	wallets: Wallet[];
	selectedWalletId: string | number | null | undefined;
	onSelect: (walletId: string) => void;
	placeholder?: string;
	label?: string;
	disabled?: boolean;
	excludeWalletIds?: (string | number)[];
	isLoading?: boolean;
	/** If true, use publicId as value; otherwise use internal id */
	usePublicId?: boolean;
}

/**
 * Get display name for a wallet
 * Priority: custom name > "کیف‌پول {publicId}"
 */
function getWalletDisplayName(wallet: Wallet): string {
	if (wallet.name) return wallet.name;
	return `کیف‌پول ${wallet.publicId.slice(-8)}`;
}

/**
 * Unified wallet selector component for the entire application.
 * Supports:
 * - Auto-selection of primary wallet on initial load
 * - Filtering out specific wallets (e.g., source wallet when selecting destination)
 * - Primary wallet badge display
 * - Both internal ID and publicId as value types
 */
export function SharedWalletSelector({
	wallets,
	selectedWalletId,
	onSelect,
	placeholder = "انتخاب کیف‌پول",
	label,
	disabled = false,
	excludeWalletIds = [],
	isLoading = false,
	usePublicId = false,
}: SharedWalletSelectorProps) {
	// Convert selectedWalletId to string for comparison
	const selectedIdStr = selectedWalletId?.toString();

	// Filter out excluded wallets
	const availableWallets = wallets.filter((wallet) => {
		const walletIdStr = wallet.id.toString();
		const walletPublicIdStr = wallet.publicId;
		return (
			!excludeWalletIds.includes(walletIdStr) &&
			!excludeWalletIds.includes(walletPublicIdStr)
		);
	});

	// Auto-select primary wallet if none selected
	const getDefaultValue = (): string => {
		if (selectedIdStr) {
			// Return the currently selected wallet
			// When usePublicId is true, selectedIdStr is already the publicId
			// When usePublicId is false, selectedIdStr is the internal id
			return selectedIdStr;
		}

		// Auto-select primary wallet
		const primaryWallet = availableWallets.find((w) => w.primary);
		if (primaryWallet) {
			return usePublicId ? primaryWallet.publicId : primaryWallet.id.toString();
		}

		// Fallback to first available wallet
		if (availableWallets.length > 0) {
			return usePublicId
				? availableWallets[0].publicId
				: availableWallets[0].id.toString();
		}

		return "";
	};

	// Handle loading state
	if (isLoading) {
		return (
			<div className="space-y-2">
				{label && <label className="text-sm font-medium">{label}</label>}
				<div className="h-10 w-full bg-muted animate-pulse rounded-md" />
			</div>
		);
	}

	// Handle empty state
	if (wallets.length === 0) {
		return (
			<div className="space-y-2">
				{label && <label className="text-sm font-medium">{label}</label>}
				<div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
					کیف‌پولی یافت نشد
				</div>
			</div>
		);
	}

	// Get the wallet value for display
	const getWalletValue = (wallet: Wallet): string => {
		return usePublicId ? wallet.publicId : wallet.id.toString();
	};

	// Find currently selected wallet for display
	const selectedWallet = wallets.find((w) => {
		if (usePublicId) {
			return w.publicId === selectedIdStr;
		}
		return w.id.toString() === selectedIdStr;
	});

	return (
		<div className="space-y-2">
			{label && <label className="text-sm font-medium">{label}</label>}
			<Select
				dir="rtl"
				value={getDefaultValue()}
				onValueChange={onSelect}
				disabled={disabled || availableWallets.length === 0}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={placeholder}>
						{selectedWallet && (
							<div className="flex items-center gap-2">
								<span>{getWalletDisplayName(selectedWallet)}</span>
								<span className="text-muted-foreground text-sm">
									({formatCurrency(selectedWallet.balance)})
								</span>
								{selectedWallet.primary && (
									<Badge
										variant="secondary"
										className="mr-2 bg-yellow-100 text-yellow-800 gap-1"
									>
										<Star className="h-3 w-3 fill-yellow-500" />
										اصلی
									</Badge>
								)}
							</div>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{availableWallets.map((wallet) => (
						<SelectItem
							key={getWalletValue(wallet)}
							value={getWalletValue(wallet)}
						>
							<div className="flex items-center justify-between w-full gap-4">
								<div className="flex items-center gap-2">
									<span>{getWalletDisplayName(wallet)}</span>
									{wallet.primary && (
										<Badge
											variant="secondary"
											className="bg-yellow-100 text-yellow-800 gap-1"
										>
											<Star className="h-3 w-3 fill-yellow-500" />
											اصلی
										</Badge>
									)}
								</div>
								<span className="text-muted-foreground text-sm">
									{formatCurrency(wallet.balance)}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
