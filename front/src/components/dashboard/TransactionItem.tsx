import { Transaction } from "@/lib/api/wallet";
import { formatCurrency } from "@/lib/format";
import { getRelativeTime } from "@/lib/date";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	ArrowLeftRight,
	ShoppingCart,
	RefreshCcw,
	ShieldAlert,
	Users,
	Wallet,
} from "lucide-react";

interface TransactionItemProps {
	transaction: Transaction;
	currentWalletId: number;
}

function getTransactionIcon(type: Transaction["transactionType"]) {
	switch (type) {
		case "DEPOSIT":
			return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
		case "WITHDRAW":
			return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
		case "TRANSFER":
			return <ArrowLeftRight className="h-5 w-5 text-blue-600" />;
		case "PURCHASE":
			return <ShoppingCart className="h-5 w-5 text-orange-600" />;
		case "REFUND":
			return <RefreshCcw className="h-5 w-5 text-purple-600" />;
		case "ADMIN_ADJUSTMENT":
			return <ShieldAlert className="h-5 w-5 text-yellow-600" />;
		default:
			return <ArrowLeftRight className="h-5 w-5 text-gray-600" />;
	}
}

function getTransactionTitle(
	type: Transaction["transactionType"],
	isPayer: boolean,
): string {
	switch (type) {
		case "DEPOSIT":
			return "واریز";
		case "WITHDRAW":
			return "برداشت";
		case "TRANSFER":
			return "انتقال";
		case "PURCHASE":
			return "خرید";
		case "REFUND":
			return "بازگشت وجه";
		case "ADMIN_ADJUSTMENT":
			return "تعدیل";
		default:
			return "تراکنش";
	}
}

function getTransferTypeBadge(transferType?: "OWN_WALLET" | "P2P") {
	if (transferType === "P2P") {
		return (
			<span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
				<Users className="h-3 w-3" />
				P2P
			</span>
		);
	} else if (transferType === "OWN_WALLET") {
		return (
			<span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
				<Wallet className="h-3 w-3" />
				به کیف پول خود
			</span>
		);
	}
	return null;
}

function getTransactionSubtitle(
	transaction: Transaction,
	isPayer: boolean,
): string {
	if (transaction.transactionType === "TRANSFER") {
		if (isPayer && transaction.receiverWallet) {
			return `به: ${transaction.receiverWallet.user.phoneNumber}`;
		} else if (!isPayer && transaction.payerWallet) {
			return `از: ${transaction.payerWallet.user.phoneNumber}`;
		}
	}
	return "";
}

export function TransactionItem({
	transaction,
	currentWalletId,
}: TransactionItemProps) {
	const isPayer = transaction.payerWalletId === currentWalletId;
	const amount = parseFloat(transaction.amount);
	const isPositive =
		!isPayer ||
		transaction.transactionType === "DEPOSIT" ||
		transaction.transactionType === "REFUND";

	return (
		<div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
			<div className="shrink-0">
				{getTransactionIcon(transaction.transactionType)}
			</div>
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm">
					{getTransactionTitle(transaction.transactionType, isPayer)}
				</p>
				{getTransactionSubtitle(transaction, isPayer) && (
					<p className="text-xs text-muted-foreground truncate">
						{getTransactionSubtitle(transaction, isPayer)}
					</p>
				)}
				{transaction.transactionType === "TRANSFER" && (
					<div className="mt-1">
						{getTransferTypeBadge(transaction.transferType)}
					</div>
				)}
			</div>
			<div className="text-left">
				<p
					className={`font-medium text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
				>
					{isPositive ? "+" : "-"}
					{formatCurrency(amount)}
				</p>
				<p className="text-xs text-muted-foreground">
					{getRelativeTime(transaction.createdAt)}
				</p>
			</div>
		</div>
	);
}
