"use client";

import { X, Share2, Download } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { TransactionWithDetails } from "@/types/transaction";
import {
	transactionTypeLabels,
	transactionStatusLabels,
	TransactionType,
} from "@/types/transaction";
import { formatCurrency } from "@/lib/format";

interface ReceiptModalProps {
	transaction: TransactionWithDetails | null;
	isOpen: boolean;
	onClose: () => void;
	currentWalletId?: number;
}

// Get Persian label for transaction type
function getReceiptTitle(type: TransactionType): string {
	switch (type) {
		case "PURCHASE":
			return "فاکتور خرید";
		case "TRANSFER":
			return "فاکتور انتقال";
		case "DEPOSIT":
			return "فاکتور واریز";
		case "WITHDRAW":
			return "فاکتور برداشت";
		case "REFUND":
			return "فاکتور بازگشت";
		case "ADMIN_ADJUSTMENT":
			return "فاکتور تعدیل";
		default:
			return "فاکتور";
	}
}

// Check if transaction is incoming based on wallet role
function isIncoming(
	transaction: TransactionWithDetails,
	currentWalletId?: number,
): boolean {
	// If no wallet specified, use transaction type logic
	if (!currentWalletId) {
		return (
			transaction.transactionType === "DEPOSIT" ||
			transaction.transactionType === "REFUND"
		);
	}

	// Compare current wallet with payer/receiver
	const isPayer = transaction.payerWallet?.id === currentWalletId;
	const isReceiver = transaction.receiverWallet?.id === currentWalletId;

	if (isReceiver) {
		return true;
	}
	if (isPayer) {
		return false;
	}

	// Fallback to transaction type logic
	return (
		transaction.transactionType === "DEPOSIT" ||
		transaction.transactionType === "REFUND"
	);
}

export function ReceiptModal({
	transaction,
	isOpen,
	onClose,
	currentWalletId,
}: ReceiptModalProps) {
	if (!transaction) return null;

	const amount = parseFloat(transaction.amount);
	const isIncomingTx = isIncoming(transaction, currentWalletId);
	const fee = transaction.metadata?.fee
		? parseFloat(String(transaction.metadata.fee))
		: 0;
	const totalAmount = amount + fee;

	// Format date and time
	const date = new Date(transaction.createdAt);
	const formattedDate = date.toLocaleDateString("fa-IR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const formattedTime = date.toLocaleTimeString("fa-IR", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Handle share functionality
	const handleShare = async () => {
		const shareData = {
			title: `تراکنش ${transaction.publicId}`,
			text: `
نوع: ${transactionTypeLabels[transaction.transactionType]}
مبلغ: ${formatCurrency(Math.abs(amount))}
وضعیت: ${transactionStatusLabels[transaction.status]}
تاریخ: ${formattedDate}
			`.trim(),
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				console.log("Share cancelled");
			}
		} else {
			// Fallback: copy to clipboard
			await navigator.clipboard.writeText(shareData.text);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="sm:max-w-md [&>button]:left-4 [&>button]:right-auto"
				dir="rtl"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="text-2xl">🧾</span>
						{getReceiptTitle(transaction.transactionType)}
					</DialogTitle>
					<DialogDescription className="text-right" dir="rtl">
						شماره فاکتور: {transaction.publicId}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Transaction Details */}
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-muted-foreground">نوع تراکنش:</span>
							<span>{transactionTypeLabels[transaction.transactionType]}</span>
						</div>

						<div className="flex justify-between">
							<span className="text-muted-foreground">مبلغ:</span>
							<span
								className={isIncomingTx ? "text-green-600" : "text-red-600"}
							>
								{isIncomingTx ? "+" : "-"}
								{formatCurrency(Math.abs(amount))}
							</span>
						</div>

						{fee > 0 && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">کارمزد:</span>
								<span>{formatCurrency(fee)}</span>
							</div>
						)}

						<Separator />

						<div className="flex justify-between font-bold">
							<span>مبلغ کل:</span>
							<span
								className={isIncomingTx ? "text-green-600" : "text-red-600"}
							>
								{isIncomingTx ? "+" : "-"}
								{formatCurrency(Math.abs(totalAmount))}
							</span>
						</div>
					</div>

					<Separator />

					{/* Additional Info */}
					<div className="space-y-3">
						{transaction.transactionType === "TRANSFER" && (
							<>
								<div className="flex justify-between">
									<span className="text-muted-foreground">کیف پول پرداخت:</span>
									<span>**** {transaction.payerWallet.publicId.slice(-4)}</span>
								</div>
								{transaction.receiverWallet && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">گیرنده:</span>
										<span>{transaction.receiverWallet.user.phoneNumber}</span>
									</div>
								)}
							</>
						)}

						{transaction.transactionType === "PURCHASE" &&
							transaction.metadata?.sellerName && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">فروشنده:</span>
									<span>{transaction.metadata.sellerName}</span>
								</div>
							)}

						{transaction.metadata?.productName && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">محصول:</span>
								<span>{transaction.metadata.productName}</span>
							</div>
						)}

						<div className="flex justify-between">
							<span className="text-muted-foreground">تاریخ:</span>
							<span>
								{formattedDate} - ساعت {formattedTime}
							</span>
						</div>

						<div className="flex justify-between">
							<span className="text-muted-foreground">وضعیت:</span>
							<span>{transactionStatusLabels[transaction.status]}</span>
						</div>

						{transaction.description && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">توضیحات:</span>
								<span className="wrap-break-word whitespace-pre-line text-left">
									{transaction.description}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-between gap-2 pt-4">
					<Button variant="outline" onClick={onClose}>
						بستن
					</Button>
					<Button variant="secondary" onClick={handleShare}>
						<Share2 className="h-4 w-4 ml-2" />
						اشتراک‌گذاری
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
