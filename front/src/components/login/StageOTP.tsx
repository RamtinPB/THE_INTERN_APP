"use client";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";

export function StageOTP({
	code,
	setCode,
}: {
	code: string[];
	setCode: (v: string[]) => void;
}) {
	// Convert string array to single string for InputOTP
	const codeString = code.join("");

	const handleChange = (value: string) => {
		// Pad with empty strings to always have 6 characters
		const padded = value.padEnd(6, "");
		setCode(padded.split(""));
	};

	return (
		<div dir="ltr" className="flex justify-center w-full">
			<InputOTP maxLength={6} value={codeString} onChange={handleChange}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
		</div>
	);
}
