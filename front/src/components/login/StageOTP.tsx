"use client";

export function StageOTP({
	code,
	setCode,
}: {
	code: string[];
	setCode: (v: string[]) => void;
}) {
	return (
		<div dir="ltr" className="flex justify-between w-full gap-5">
			{code.map((digit, i) => (
				<input
					key={i}
					maxLength={1}
					value={digit}
					onChange={(e) => {
						const v = e.target.value.replace(/\D/, "");
						const next = [...code];
						next[i] = v;
						setCode(next);
					}}
					className=" w-full h-14 border border-[#EDEDED] rounded-lg text-center text-xl focus:border-[#FF6A29] focus:outline-none "
				/>
			))}
		</div>
	);
}
