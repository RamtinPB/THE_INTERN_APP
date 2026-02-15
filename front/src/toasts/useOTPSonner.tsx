import React from "react";
import { toast } from "sonner";

interface UseOTPSonnerOptions {
	phoneNumber?: string;
}

/**
 * OTP Sonner Hook
 *
 * Displays OTP code via Sonner toaster for simulation purposes.
 * This is used when no actual SMS gateway is connected - the OTP
 * is shown to the user in a toast so they can enter it.
 *
 * Usage:
 * - Login page
 * - Signup page
 * - Business purchase modal
 * - Any other OTP verification flow
 */
export function useOTPSonner({ phoneNumber }: UseOTPSonnerOptions = {}) {
	const displayOTP = (otpCode: string, customMessage?: string) => {
		const phoneDisplay = phoneNumber
			? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-4)}`
			: "";

		toast.success(
			<div className="flex flex-col items-center gap-2 py-2">
				<p className="text-base font-medium">
					{customMessage || "کد تایید برای شما ارسال شد"}
				</p>
				{phoneDisplay && (
					<p className="text-sm text-muted-foreground">{phoneDisplay}</p>
				)}
				<p className="text-3xl font-mono font-bold tracking-[0.5em] text-primary">
					{otpCode}
				</p>
				<p className="text-sm text-muted-foreground">این کد را وارد کنید</p>
			</div>,
			{
				duration: 15000, // Show for 15 seconds
				icon: "📱",
			},
		);
	};

	const displayOTPError = (message: string) => {
		toast.error(message);
	};

	return {
		displayOTP,
		displayOTPError,
	};
}
