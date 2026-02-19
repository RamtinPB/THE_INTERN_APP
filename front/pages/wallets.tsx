"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Plus,
	Wallet as WalletIcon,
	ArrowUp,
	ArrowDown,
	ArrowUpDown,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	Star,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	createWallet,
	getUserWallets,
	setPrimaryWallet,
	type Wallet,
} from "@/lib/api/wallet";
import { formatCurrency, formatNumber } from "@/lib/format";

// Import modals
import {
	DepositModal,
	WithdrawModal,
	TransferModal,
} from "@/components/shared/modals/transactions.modals.export";

export default function WalletsPage() {
	const router = useRouter();
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

	// Modal states
	const [isDepositOpen, setIsDepositOpen] = useState(false);
	const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
	const [isTransferOpen, setIsTransferOpen] = useState(false);

	useEffect(() => {
		fetchWallets();
	}, []);

	const fetchWallets = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getUserWallets();
			setWallets(data.wallets || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "خطا در دریافت کیف‌ پول‌ها",
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Filter wallets based on search
	const filteredWallets = wallets.filter(
		(wallet) =>
			wallet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			wallet.publicId.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Calculate total balance
	const totalBalance = wallets.reduce(
		(acc, wallet) => acc + parseFloat(wallet.balance),
		0,
	);

	// Handle modal opens
	const openDepositModal = (wallet: Wallet) => {
		setSelectedWallet(wallet);
		setIsDepositOpen(true);
	};

	const openWithdrawModal = (wallet: Wallet) => {
		setSelectedWallet(wallet);
		setIsWithdrawOpen(true);
	};

	const openTransferModal = (wallet: Wallet) => {
		setSelectedWallet(wallet);
		setIsTransferOpen(true);
	};

	// Handle successful operations
	const handleOperationSuccess = () => {
		fetchWallets();
	};

	// Handle set primary wallet
	const handleSetPrimary = async (walletId: number, isPrimary: boolean) => {
		if (isPrimary) return; // Already primary, do nothing
		try {
			await setPrimaryWallet(walletId);
			fetchWallets(); // Refresh wallets to update primary status
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "خطا در تنظیم کیف پول پیش‌نما",
			);
		}
	};

	// Handle create wallet
	const handleCreateWallet = async () => {
		try {
			setError(null);
			await createWallet();
			await fetchWallets(); // Refresh wallets after creation
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطا در ایجاد کیف پول");
		}
	};

	// Format wallet public ID for display
	const formatPublicId = (publicId: string) => {
		if (publicId.length <= 8) return publicId;
		return `****${publicId.slice(-8)}`;
	};

	return (
		<MainLayout>
			<div className="space-y-6 p-6">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold">کیف‌ پول‌های من</h1>
						<p className="text-sm text-muted-foreground mt-1">
							مدیریت و مشاهده تمام کیف‌ پول‌های شما
						</p>
					</div>
					<Button onClick={handleCreateWallet}>
						<Plus className="h-4 w-4 ml-2" />
						کیف پول جدید
					</Button>
				</div>

				{/* Search and Total Balance */}
				<Card>
					<CardContent className="p-4">
						<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between px-5">
							<div className="flex flex-1 gap-4 w-full md:w-auto">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="جستجوی کیف پول..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pr-10"
									/>
								</div>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span className="text-muted-foreground">مجموع:</span>
								{isLoading ? (
									<Skeleton className="h-6 w-24" />
								) : (
									<span className="font-bold text-lg">
										{formatCurrency(totalBalance)}
									</span>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Error State */}
				{error && (
					<Card className="border-destructive">
						<CardContent className="p-4">
							<p className="text-destructive text-center">{error}</p>
							<Button variant="outline" className="mt-2" onClick={fetchWallets}>
								تلاش مجدد
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Loading State */}
				{isLoading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardContent className="p-4 space-y-4">
									<div className="flex items-center justify-between">
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
									<Skeleton className="h-8 w-40" />
									<Skeleton className="h-4 w-24" />
									<div className="flex gap-2">
										<Skeleton className="h-8 w-20" />
										<Skeleton className="h-8 w-20" />
										<Skeleton className="h-8 w-20" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && wallets.length === 0 && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<WalletIcon className="h-16 w-16 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								شما هنوز کیف پول ندارید
							</h3>
							<p className="text-muted-foreground mb-4 text-center">
								برای شروع، اولین کیف پول خود را ایجاد کنید
							</p>
							<Button onClick={handleCreateWallet}>
								<Plus className="h-4 w-4 ml-2" />
								ایجاد کیف پول جدید
							</Button>
						</CardContent>
					</Card>
				)}

				{/* No Search Results */}
				{!isLoading &&
					!error &&
					wallets.length > 0 &&
					filteredWallets.length === 0 && (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Search className="h-16 w-16 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									نتیجه‌ای یافت نشد
								</h3>
								<p className="text-muted-foreground text-center">
									کیف پولی با این مشخصات وجود ندارد
								</p>
							</CardContent>
						</Card>
					)}

				{/* Wallet Grid */}
				{!isLoading && !error && filteredWallets.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredWallets.map((wallet) => (
							<Card
								key={wallet.id}
								className="hover:shadow-md transition-shadow cursor-pointer "
							>
								<CardContent className="py-3 px-5 space-y-6">
									{/* Header */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 cursor-auto">
											<WalletIcon className="h-5 w-5 text-primary" />
											<span className="font-medium">{wallet.publicId}</span>
										</div>
										<button
											onClick={() =>
												handleSetPrimary(wallet.id, !!wallet.primary)
											}
											className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
										>
											<Badge
												variant="secondary"
												className={`flex items-center gap-1 ${
													wallet.primary
														? "bg-yellow-100 text-yellow-800 border-yellow-300"
														: ""
												}`}
											>
												<Star
													className={`h-3 w-3 ${
														wallet.primary
															? "fill-yellow-500 text-yellow-500"
															: "text-muted-foreground"
													}`}
												/>
												{wallet.primary ? "اصلی" : "انتخاب"}
											</Badge>
										</button>
									</div>

									{/* Balance */}
									<Link href={`/wallets/${wallet.publicId}`}>
										<div className="text-2xl font-bold">
											{formatCurrency(wallet.balance)}
										</div>
										<div className="text-sm text-muted-foreground">
											{formatPublicId(wallet.publicId)}
										</div>
									</Link>

									{/* Actions */}
									<div className="flex gap-2 flex-wrap">
										<Button
											variant="outline"
											size="sm"
											onClick={() => openDepositModal(wallet)}
										>
											<ArrowDown className="h-3 w-3 ml-1" />
											افزایش
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openWithdrawModal(wallet)}
										>
											<ArrowUp className="h-3 w-3 ml-1" />
											برداشت
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openTransferModal(wallet)}
										>
											<ArrowUpDown className="h-3 w-3 ml-1" />
											انتقال
										</Button>
									</div>

									{/* More Menu */}
									<div className="flex justify-end">
										<DropdownMenu dir="rtl">
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon-sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/wallets/${wallet.publicId}`}>
														<Eye className="h-4 w-4 ml-2" />
														مشاهده جزئیات
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Edit className="h-4 w-4 ml-2" />
													ویرایش نام
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive focus:text-destructive">
													<Trash2 className="h-4 w-4 ml-2" />
													حذف کیف پول
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Modals */}
			<DepositModal
				isOpen={isDepositOpen}
				onClose={() => setIsDepositOpen(false)}
				wallet={selectedWallet}
				wallets={wallets}
				onSuccess={handleOperationSuccess}
			/>

			<WithdrawModal
				isOpen={isWithdrawOpen}
				onClose={() => setIsWithdrawOpen(false)}
				wallet={selectedWallet}
				wallets={wallets}
				onSuccess={handleOperationSuccess}
			/>

			<TransferModal
				key={
					isTransferOpen
						? `transfer-${selectedWallet?.id || "new"}`
						: "transfer-closed"
				}
				isOpen={isTransferOpen}
				onClose={() => setIsTransferOpen(false)}
				wallet={selectedWallet}
				wallets={wallets}
				onSuccess={handleOperationSuccess}
			/>
		</MainLayout>
	);
}
