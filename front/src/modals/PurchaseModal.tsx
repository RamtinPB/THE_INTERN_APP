"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DirectionProvider } from "@/components/ui/direction";
import { SharedWalletSelector } from "@/components/shared/WalletSelector";
import { useOTPSonner } from "@/toasts/useOTPSonner";
import { useOTPCountdown } from "@/components/login/hooks/useOTPCountdown";
import { formatTime } from "@/components/login/utils/formatTime";
import { formatCurrency } from "@/lib/format";
import type { Wallet } from "@/types/wallet";
import type { Product } from "@/components/business/ProductCard";
import {
	ShoppingCart,
	Loader2,
	ShieldCheck,
	User,
	Wallet as WalletIcon,
} from "lucide-react";

const FEE_PERCENTAGE = 0.01; // 1% fee

interface PurchaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: Product | null;
	wallets: Wallet[];
	onSuccess?: () => void;
}

// Mock business user data - in real app, fetch from backend
const BUSINESS_SELLER = {
	name: "فروشگاه پرمیوم",
	nameEn: "Premium Store",
};

export function PurchaseModal({
	isOpen,
	onClose,
	product,
	wallets,
	onSuccess,
}: PurchaseModalProps) {
	const [selectedWalletId, setSelectedWalletId] = useState<string>("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { displayOTP } = useOTPSonner({ phoneNumber });
	const { timeLeft, reset: resetCountdown } = useOTPCountdown(
		otpSent,
		120, // 120 seconds = 2 minutes
	);

	// Calculate fees and totals
	const amount = product?.price || 0;
	const fee = Math.round(amount * FEE_PERCENTAGE);
	const total = amount + fee;

	// Get selected wallet
	const selectedWallet = wallets.find(
		(w) => w.id.toString() === selectedWalletId,
	);
	const canPurchase =
		selectedWallet && parseFloat(selectedWallet.balance) >= total;

	// Auto-select primary wallet on open
	useEffect(() => {
		if (isOpen && wallets.length > 0 && !selectedWalletId) {
			const primaryWallet = wallets.find((w) => w.primary);
			if (primaryWallet) {
				setSelectedWalletId(primaryWallet.id.toString());
			} else {
				setSelectedWalletId(wallets[0].id.toString());
			}
		}
	}, [isOpen, wallets, selectedWalletId]);

	// Reset state when modal closes
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
			setPhoneNumber("");
			setOtpCode("");
			setOtpSent(false);
			setError(null);
			resetCountdown();
		}
	};

	// Validate Iranian phone number
	const isValidPhone = /^09\d{9}$/.test(phoneNumber);

	// Validate OTP code (6 digits)
	const isValidOtp = /^\d{6}$/.test(otpCode);

	// Form is valid when phone and OTP are both valid
	const isFormValid = isValidPhone && isValidOtp;

	// Handle OTP send
	const handleSendOTP = async () => {
		if (!isValidPhone) {
			setError("شماره موبایل نامعتبر است");
			return;
		}

		try {
			setIsSendingOtp(true);
			setError(null);

			// Simulate OTP API call - in real app, this would call the backend
			// const { otp } = await requestOtp(phoneNumber, "VERIFY_TRANSACTION");
			const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();

			// Display OTP via sonner (simulation)
			displayOTP(mockOTP);

			setOtpSent(true);
		} catch (err) {
			setError("خطا در ارسال کد تایید");
		} finally {
			setIsSendingOtp(false);
		}
	};

	// Handle purchase submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid || !selectedWalletId || !product) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			// In a real implementation, this would call the backend purchase endpoint
			// For now, we'll simulate the purchase with a delay
			// The backend would:
			// 1. Verify OTP
			// 2. Check wallet balance
			// 3. Deduct from sender wallet
			// 4. Add to business wallet (with fee)
			// 5. Create transaction record
			// 6. Return result

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// For demo purposes, simulate success
			// In real app: await purchaseProduct(fromWalletId, toUserId, amount, fee, product.id, otpCode);

			// Show success
			onSuccess?.();
			handleOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطا در پرداخت");
		} finally {
			setIsLoading(false);
		}
	};

	// Render countdown timer
	const renderCountdown = () => {
		if (!otpSent || timeLeft <= 0) return null;

		return (
			<p className="text-sm text-muted-foreground text-center">
				ارسال مجدد: {formatTime(timeLeft)}
			</p>
		);
	};

	if (!product) return null;

	return (
		<DirectionProvider dir="rtl">
			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent
					dir="rtl"
					className="sm:max-w-md [&>button]:left-4 [&>button]:right-auto"
				>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ShoppingCart className="h-5 w-5 text-blue-600" />
							تایید خرید
						</DialogTitle>
						<DialogDescription className="text-right" dir="rtl">
							لطفا اطلاعات را تکمیل کنید
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Product Summary */}
						<div className="bg-muted/50 rounded-lg p-4 space-y-3">
							<div className="flex gap-3">
								<div className="aspect-video w-24 relative bg-muted rounded overflow-hidden shrink-0">
									{product.image ? (
										<Image
											src={product.image}
											alt={product.name}
											fill
											className="object-cover"
											unoptimized
										/>
									) : (
										<div className="flex items-center justify-center h-full">
											<ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="font-medium text-sm truncate">
										{product.name}
									</h4>
									<p className="text-sm text-muted-foreground truncate">
										{product.nameFa}
									</p>
									<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
										<User className="h-3 w-3" />
										<span>{BUSINESS_SELLER.name}</span>
									</div>
								</div>
							</div>

							<Separator />

							{/* Price Breakdown */}
							<div className="space-y-1.5 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">مبلغ:</span>
									<span>{formatCurrency(amount)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">کارمزد (۱٪):</span>
									<span>{formatCurrency(fee)}</span>
								</div>
								<Separator />
								<div className="flex justify-between font-semibold">
									<span>مجموع:</span>
									<span className="text-blue-600">{formatCurrency(total)}</span>
								</div>
							</div>
						</div>

						{/* Wallet Selection */}
						<div className="space-y-2">
							<label className="text-sm font-medium">کیف پول</label>
							<SharedWalletSelector
								wallets={wallets}
								selectedWalletId={selectedWalletId}
								onSelect={setSelectedWalletId}
								placeholder="انتخاب کیف پول"
								label=""
							/>
							{selectedWallet && (
								<p className="text-xs text-muted-foreground">
									موجودی: {formatCurrency(selectedWallet.balance)}
								</p>
							)}
						</div>

						{/* Insufficient Balance Warning */}
						{selectedWallet && !canPurchase && (
							<div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
								موجودی کافی نیست
							</div>
						)}

						{/* Phone Input */}
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="phone">
								شماره موبایل
							</label>
							<Input
								id="phone"
								type="tel"
								placeholder="09123456789"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								dir="ltr"
								maxLength={11}
							/>
						</div>

						{/* OTP Input with Send Button */}
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="otp">
								کد تایید
							</label>
							<div className="flex gap-2">
								<Input
									id="otp"
									type="text"
									placeholder="xxxxxx"
									value={otpCode}
									onChange={(e) => setOtpCode(e.target.value)}
									maxLength={6}
									className="font-mono tracking-widest"
									dir="ltr"
								/>
								<Button
									type="button"
									onClick={handleSendOTP}
									disabled={
										!isValidPhone || isSendingOtp || (otpSent && timeLeft > 0)
									}
									className="whitespace-nowrap"
								>
									{isSendingOtp ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : otpSent && timeLeft > 0 ? (
										"ارسال مجدد"
									) : (
										"ارسال کد"
									)}
								</Button>
							</div>
						</div>

						{/* OTP Countdown */}
						{renderCountdown()}

						{/* Error Message */}
						{error && (
							<div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
								{error}
							</div>
						)}

						{/* Security Note */}
						<div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
							<ShieldCheck className="h-4 w-4" />
							<span>خرید امن با تایید پیامکی</span>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isLoading}
							>
								انصراف
							</Button>
							<Button
								type="submit"
								disabled={!isFormValid || !canPurchase || isLoading}
								className="min-w-[140px]"
							>
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 ml-2 animate-spin" />
										در حال پرداخت...
									</>
								) : (
									"تایید و پرداخت"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</DirectionProvider>
	);
}
