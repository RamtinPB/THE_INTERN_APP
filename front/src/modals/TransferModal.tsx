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
import { transferFunds, getWalletByPublicId } from "@/lib/api/wallet";
import type { Wallet } from "@/types/wallet";
import { formatCurrency } from "@/lib/format";
import {
	ArrowUpDown,
	Loader2,
	AlertTriangle,
	Wallet as WalletIcon,
	Users,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DirectionProvider } from "@/components/ui/direction";
import { SharedWalletSelector } from "@/components/shared/WalletSelector";

interface TransferModalProps {
	isOpen: boolean;
	onClose: () => void;
	wallet?: Wallet | null;
	wallets: Wallet[];
	onSuccess?: () => void;
}

export function TransferModal({
	isOpen,
	onClose,
	wallet,
	wallets,
	onSuccess,
}: TransferModalProps) {
	const [fromWalletId, setFromWalletId] = useState<string>("");
	const [toWalletId, setToWalletId] = useState("");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// P2P mode state
	const [isP2PMode, setIsP2PMode] = useState(false);
	const [recipientPublicId, setRecipientPublicId] = useState("");

	// Sync fromWalletId when wallet prop changes or auto-select primary
	useEffect(() => {
		if (isOpen) {
			if (wallet) {
				setFromWalletId(wallet.id.toString());
			} else if (!fromWalletId && wallets.length > 0) {
				// Auto-select primary wallet if none selected
				const primaryWallet = wallets.find((w) => w.primary);
				if (primaryWallet) {
					setFromWalletId(primaryWallet.id.toString());
				} else if (wallets.length > 0) {
					setFromWalletId(wallets[0].id.toString());
				}
			}
		}
	}, [wallet, isOpen, wallets]);

	// Get selected wallet
	const fromWallet = wallets.find((w) => w.id.toString() === fromWalletId);

	// Check if transfer amount is valid
	const transferAmount = parseFloat(amount) || 0;
	const canTransfer =
		fromWallet && transferAmount <= parseFloat(fromWallet.balance);

	// Reset state when modal opens/closes
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
			setFromWalletId("");
			setToWalletId("");
			setAmount("");
			setError(null);
			setIsP2PMode(false);
			setRecipientPublicId("");
		} else if (wallet) {
			setFromWalletId(wallet.id.toString());
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!fromWalletId) {
			setError("لطفا کیف پول مبدا را انتخاب کنید");
			return;
		}

		// Validation for Own Wallets mode
		if (!isP2PMode) {
			if (!toWalletId) {
				setError("لطفا کیف پول مقصد را انتخاب کنید");
				return;
			}

			if (fromWalletId === toWalletId) {
				setError("کیف پول مبدا و مقصد نمی‌توانند یکسان باشند");
				return;
			}
		} else {
			// Validation for P2P mode
			if (!recipientPublicId || recipientPublicId.trim() === "") {
				setError("لطفا شناسه کیف پول گیرنده را وارد کنید");
				return;
			}

			// Basic publicId format validation (alphanumeric, 6-50 characters)
			const publicIdRegex = /^[a-zA-Z0-9_-]{6,50}$/;
			if (!publicIdRegex.test(recipientPublicId.trim())) {
				setError("فرمت شناسه کیف پول نامعتبر است");
				return;
			}
		}

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			setError("لطفا مبلغ معتبر وارد کنید");
			return;
		}

		if (!canTransfer) {
			setError("موجودی کافی نیست");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			if (isP2PMode) {
				// P2P transfer - resolve publicId to wallet ID first
				try {
					const { wallet: recipientWallet } = await getWalletByPublicId(
						recipientPublicId.trim(),
					);

					// Use the resolved wallet ID for the transfer
					await transferFunds(
						parseInt(fromWalletId),
						recipientWallet.id,
						amountNum,
						"P2P",
					);
				} catch (resolveErr) {
					// If publicId resolution fails, show specific error
					setError(
						resolveErr instanceof Error
							? resolveErr.message
							: "شناسه کیف پول گیرنده نامعتبر است",
					);
					setIsLoading(false);
					return;
				}
			} else {
				await transferFunds(
					parseInt(fromWalletId),
					parseInt(toWalletId),
					amountNum,
					"OWN_WALLET",
				);
			}
			onSuccess?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطا در انتقال وجه");
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
							<ArrowUpDown className="h-5 w-5 text-blue-600" />
							انتقال بین کیف پول‌ها
						</DialogTitle>
						<DialogDescription className="text-right" dir="rtl">
							مبلغ را به کیف پول دیگری انتقال دهید
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Source Wallet Selection */}
						<SharedWalletSelector
							wallets={wallets}
							selectedWalletId={fromWalletId}
							onSelect={setFromWalletId}
							placeholder="انتخاب کیف پول مبدا"
							label="کیف پول مبدا"
							excludeWalletIds={isP2PMode ? [] : [toWalletId]}
						/>

						{/* Transfer Mode Toggle */}
						<div className="flex items-center justify-between bg-muted p-3 rounded-lg">
							<div className="flex items-center gap-2">
								{isP2PMode ? (
									<Users className="h-4 w-4 text-blue-600" />
								) : (
									<WalletIcon className="h-4 w-4 text-green-600" />
								)}
								<span className="text-sm font-medium">
									{isP2PMode ? "انتقال P2P" : "انتقال به کیف پول خود"}
								</span>
							</div>
							<Switch
								dir="ltr"
								checked={isP2PMode}
								onCheckedChange={(checked) => {
									setIsP2PMode(checked);
									setToWalletId("");
									setRecipientPublicId("");
									setError(null);
								}}
							/>
						</div>

						{/* Destination Wallet Selection */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{isP2PMode ? "شناسه کیف پول گیرنده" : "کیف پول مقصد"}
							</label>
							{isP2PMode ? (
								<Input
									type="text"
									placeholder="شناسه کیف پول گیرنده را وارد کنید"
									value={recipientPublicId}
									onChange={(e) => setRecipientPublicId(e.target.value)}
									dir="rtl"
								/>
							) : (
								<SharedWalletSelector
									wallets={wallets}
									selectedWalletId={toWalletId}
									onSelect={setToWalletId}
									placeholder="انتخاب کیف پول مقصد"
									excludeWalletIds={[fromWalletId]}
								/>
							)}
						</div>

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

						{/* Transfer Summary */}
						{fromWallet && amount && (
							<div className="bg-muted p-3 rounded-lg text-sm space-y-2">
								<div className="flex justify-between">
									<p className="text-muted-foreground">موجودی مبدا:</p>
									<p className="font-semibold">
										{formatCurrency(fromWallet.balance)}
									</p>
								</div>
								<div className="flex justify-between">
									<p className="text-muted-foreground">مبلغ انتقال:</p>
									<p className="font-semibold text-blue-600">
										-{formatCurrency(amount)}
									</p>
								</div>
								<div className="flex justify-between border-t pt-2">
									<p className="text-muted-foreground">موجودی جدید:</p>
									<p
										className={`font-semibold ${
											canTransfer ? "" : "text-destructive"
										}`}
									>
										{formatCurrency(
											parseFloat(fromWallet.balance) - transferAmount,
										)}
									</p>
								</div>
							</div>
						)}

						{/* Insufficient Balance Warning */}
						{fromWallet && amount && !canTransfer && (
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
								disabled={
									isLoading ||
									!fromWalletId ||
									(!isP2PMode && !toWalletId) ||
									(isP2PMode && !recipientPublicId) ||
									!canTransfer
								}
							>
								{isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
								تایید و انتقال
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</DirectionProvider>
	);
}
