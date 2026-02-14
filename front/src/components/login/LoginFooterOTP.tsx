"use client";

import { Button } from "@/components/ui/button";
import ClockIcon from "../../../public/assets/login/clock.svg";
import EditIcon from "../../../public/assets/login/edit.svg";

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
		<div dir="ltr" className="flex justify-between items-center w-full mt-2">
			<Button
				variant="ghost"
				className="text-[#FF6A29] font-medium"
				onClick={editPhone}
			>
				<span className="text-[#787471] font-normal text-[16px]">
					ویرایش شماره
				</span>
				<EditIcon className="w-fit! h-fit!" />
			</Button>

			<div className="flex items-center gap-2">
				<span className="text-[#FF5500] bg-[#FAFAFA] border border-[#EDEDED] text-[14px] rounded-lg px-2 py-1">
					{timeLeft}
				</span>

				<Button
					variant="ghost"
					disabled={resendDisabled}
					onClick={resend}
					className={`
                    font-medium
                    ${resendDisabled ? "text-[#C0C0C0]" : "text-[#787471]"}
                  `}
				>
					دریافت مجدد کد
					<ClockIcon className="w-fit! h-fit!" />
				</Button>
			</div>
		</div>
	);
}
