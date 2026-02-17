"use client";

import {
	ArrowUpRight,
	ArrowDownRight,
	ShoppingCart,
	RefreshCw,
	Banknote,
	Wallet,
	HelpCircle,
	ArrowDown,
	ArrowUp,
	Users,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransactionWithDetails } from "@/types/transaction";
import {
	transactionTypeLabels,
	transactionStatusLabels,
	transactionStatusIcons,
	TransactionType,
} from "@/types/transaction";
import { formatCurrency } from "@/lib/format";

interface TransactionRowProps {
	transaction: TransactionWithDetails;
	index: number;
	onViewReceipt: (transaction: TransactionWithDetails) => void;
}

// Get icon for transaction type
function getTransactionIcon(type: TransactionType) {
	switch (type) {
		case "PURCHASE":
			return <ShoppingCart className="h-4 w-4" />;
		case "TRANSFER":
			return <RefreshCw className="h-4 w-4" />;
		case "DEPOSIT":
			return <ArrowDown className="h-4 w-4" />;
		case "WITHDRAW":
			return <ArrowUp className="h-4 w-4" />;
		case "REFUND":
			return <Banknote className="h-4 w-4" />;
		case "ADMIN_ADJUSTMENT":
			return <Wallet className="h-4 w-4" />;
		default:
			return <HelpCircle className="h-4 w-4" />;
	}
}

// Check if transaction is incoming (positive amount for user)
function isIncoming(transaction: TransactionWithDetails): boolean {
	return (
		transaction.transactionType === "DEPOSIT" ||
		transaction.transactionType === "REFUND"
	);
}

// Get transfer type badge
function getTransferTypeBadge(transferType?: "OWN_WALLET" | "P2P") {
	if (transferType === "P2P") {
		return (
			<Badge className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
				<Users className="h-3 w-3" />
				P2P
			</Badge>
		);
	} else if (transferType === "OWN_WALLET") {
		return (
			<Badge className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
				<Wallet className="h-3 w-3" />
				به کیف پول خود
			</Badge>
		);
	}
	return null;
}

export function TransactionRow({
	transaction,
	index,
	onViewReceipt,
}: TransactionRowProps) {
	const amount = parseFloat(transaction.amount);
	const isIncomingTx = isIncoming(transaction);

	// Format date to Persian
	const formattedDate = new Date(transaction.createdAt).toLocaleDateString(
		"fa-IR",
		{
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		},
	);

	// Get description/recipient info
	let description = transaction.description || "";

	// For transfers, show the transfer type and recipient info
	if (transaction.transactionType === "TRANSFER") {
		if (transaction.receiverWallet) {
			description = `انتقال به: ${transaction.receiverWallet.publicId}`;
		} else if (transaction.payerWallet) {
			description = `انتقال از: ${transaction.payerWallet.publicId}`;
		}
	}

	return (
		<TableRow
			className="cursor-pointer hover:bg-muted/50"
			onClick={() => onViewReceipt(transaction)}
		>
			<TableCell className="font-medium text-center">{index + 1}</TableCell>
			<TableCell dir="rtl" className=" text-center">
				{formattedDate}
			</TableCell>
			<TableCell className="">
				<div className="flex flex-col items-center justify-center gap-1">
					<div className="flex items-center justify-center gap-1">
						{getTransactionIcon(transaction.transactionType)}
						<span>{transactionTypeLabels[transaction.transactionType]}</span>
					</div>
					{transaction.transactionType === "TRANSFER" && (
						<div className="mt-1">
							{getTransferTypeBadge(transaction.transferType)}
						</div>
					)}
				</div>
			</TableCell>
			<TableCell className=" text-center">
				<span className={isIncomingTx ? "text-green-600" : "text-red-600"}>
					{isIncomingTx ? "+" : "-"}
					{formatCurrency(Math.abs(amount))}
				</span>
			</TableCell>
			<TableCell className="">
				<Badge variant="outline" className="gap-1">
					<span>{transactionStatusIcons[transaction.status]}</span>
					<span>{transactionStatusLabels[transaction.status]}</span>
				</Badge>
			</TableCell>
			<TableCell className="text-muted-foreground text-center">
				{description || "-"}
			</TableCell>
			<TableCell className=" ">
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onViewReceipt(transaction);
					}}
				>
					مشاهده فاکتور
				</Button>
			</TableCell>
		</TableRow>
	);
}
