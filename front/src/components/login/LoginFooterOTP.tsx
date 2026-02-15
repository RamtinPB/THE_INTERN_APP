"use client";

import { Button } from "@/components/ui/button";
import { Clock, Edit } from "lucide-react";

export function LoginFooterOTP({
	timeLeft,
	resendDisabled,
	editPhone,
	resend,
}: {
	timeLeft: string;
	resendDisabled: boolean;
	editPhone: () => void;
	resend: () => void;
}) {
	return (
		<div
			dir="rtl"
			className="flex justify-between items-center w-full mt-4 pt-4 border-t border-gray-100"
		>
			<Button
				variant="ghost"
				className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium"
				onClick={editPhone}
			>
				<span className="text-gray-500 font-normal text-[14px]">
					ویرایش شماره
				</span>
				<Edit className="w-4 h-4 mr-1" />
			</Button>

			<div className="flex items-center gap-3">
				<span className="text-gray-600 bg-gray-100 border border-gray-200 text-[13px] rounded-lg px-3 py-1.5 font-medium">
					{timeLeft}
				</span>

				<Button
					variant="ghost"
					disabled={resendDisabled}
					onClick={resend}
					className={`
                    font-medium text-sm
                    ${resendDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
                  `}
				>
					دریافت مجدد کد
					<Clock className="w-4 h-4 mr-1" />
				</Button>
			</div>
		</div>
	);
}
