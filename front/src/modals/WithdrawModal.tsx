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
import { Input } from "@/components/ui/input";
import { withdrawFromWallet } from "@/lib/api/wallet";
import type { Wallet } from "@/types/wallet";
import { formatCurrency } from "@/lib/format";
import { ArrowUp, Loader2, AlertTriangle } from "lucide-react";
import { DirectionProvider } from "@/components/ui/direction";
import { SharedWalletSelector } from "@/components/shared/WalletSelector";

interface WithdrawModalProps {
	isOpen: boolean;
	onClose: () => void;
	wallet?: Wallet | null;
	wallets: Wallet[];
	onSuccess?: () => void;
}

export function WithdrawModal({
	isOpen,
	onClose,
	wallet,
	wallets,
	onSuccess,
}: WithdrawModalProps) {
	const [selectedWalletId, setSelectedWalletId] = useState<string>("");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Sync selectedWalletId when wallet prop changes or auto-select primary
	useEffect(() => {
		if (isOpen) {
			if (wallet) {
				setSelectedWalletId(wallet.id.toString());
			} else if (!selectedWalletId && wallets.length > 0) {
				// Auto-select primary wallet if none selected
				const primaryWallet = wallets.find((w) => w.primary);
				if (primaryWallet) {
					setSelectedWalletId(primaryWallet.id.toString());
				} else if (wallets.length > 0) {
					setSelectedWalletId(wallets[0].id.toString());
				}
			}
		}
	}, [wallet, isOpen, wallets]);

	// Get selected wallet
	const selectedWallet = wallets.find(
		(w) => w.id.toString() === selectedWalletId,
	);

	// Check if withdrawal amount exceeds balance
	const withdrawalAmount = parseFloat(amount) || 0;
	const canWithdraw =
		selectedWallet && withdrawalAmount <= parseFloat(selectedWallet.balance);

	// Reset state when modal opens/closes
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
			setSelectedWalletId("");
			setAmount("");
			setError(null);
		} else if (wallet) {
			setSelectedWalletId(wallet.id.toString());
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedWalletId) {
			setError("لطفا کیف پول را انتخاب کنید");
			return;
		}

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			setError("لطفا مبلغ معتبر وارد کنید");
			return;
		}

		if (!canWithdraw) {
			setError("موجودی کافی نیست");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			await withdrawFromWallet(parseInt(selectedWalletId), amountNum);
			onSuccess?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطا در برداشت وجه");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DirectionProvider dir="rtl">
			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent
					dir="rtl"
					className="sm:max-w-md [&>button]:left-4 [&>button]:right-auto"
				>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ArrowUp className="h-5 w-5 text-orange-600" />
							برداشت از کیف پول
						</DialogTitle>
						<DialogDescription className="text-right" dir="rtl">
							مبلغ را از کیف پول خود برداشت کنید
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Wallet Selection */}
						<SharedWalletSelector
							wallets={wallets}
							selectedWalletId={selectedWalletId}
							onSelect={setSelectedWalletId}
							placeholder="انتخاب کیف پول"
						/>

						{/* Amount Input */}
						<div className="space-y-2">
							<label className="text-sm font-medium">مبلغ (تومان)</label>
							<Input
								type="number"
								placeholder="مبلغ را وارد کنید"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min="1000"
								step="1000"
							/>
						</div>

						{/* Selected Wallet Balance Display */}
						{selectedWallet && (
							<div className="bg-muted p-3 rounded-lg text-sm space-y-2">
								<div className="flex justify-between">
									<p className="text-muted-foreground">موجودی فعلی:</p>
									<p className="font-semibold">
										{formatCurrency(selectedWallet.balance)}
									</p>
								</div>
								{amount && (
									<div className="flex justify-between">
										<p className="text-muted-foreground">مبلغ برداشت:</p>
										<p className="font-semibold text-orange-600">
											- {formatCurrency(amount)}
										</p>
									</div>
								)}
								{amount && (
									<div className="flex justify-between border-t pt-2">
										<p className="text-muted-foreground">
											موجودی بعد از برداشت:
										</p>
										<p
											className={`font-semibold ${
												canWithdraw ? "" : "text-destructive"
											}`}
										>
											{formatCurrency(
												parseFloat(selectedWallet.balance) - withdrawalAmount,
											)}
										</p>
									</div>
								)}
							</div>
						)}

						{/* Insufficient Balance Warning */}
						{selectedWallet && amount && !canWithdraw && (
							<div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
								<AlertTriangle className="h-4 w-4" />
								موجودی کافی نیست
							</div>
						)}

						{/* Error Message */}
						{error && (
							<p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
								{error}
							</p>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isLoading}
							>
								انصراف
							</Button>
							<Button
								type="submit"
								disabled={isLoading || !selectedWalletId || !canWithdraw}
							>
								{isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
								تایید و برداشت
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</DirectionProvider>
	);
}
