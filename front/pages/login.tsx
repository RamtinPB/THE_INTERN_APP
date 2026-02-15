"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Phone, Eye, EyeClosed, Clock, Edit } from "lucide-react";

import { useLoginStages } from "@/components/login/hooks/useLoginStages";
import { useOTPCountdown } from "@/components/login/hooks/useOTPCountdown";
import { useOTPSonner } from "@/toasts/useOTPSonner";
import { formatTime } from "@/components/login/utils/formatTime";

import { requestOtp, login as apiLogin, setAccessToken } from "@/lib/api/auth";
import { useAuthenticateUser } from "@/hooks/useAuth";
import { FieldErrors } from "react-hook-form";

// Validation schemas
const loginStage0Schema = z.object({
	phone: z
		.string()
		.min(1, "شماره موبایل الزامی است")
		.regex(
			/^09\d{9}$/,
			"شماره موبایل باید فرمت صحیح داشته باشد (09xx-xxx-xxxx)",
		),
	password: z
		.string()
		.min(1, "رمز عبور الزامی است")
		.min(3, "رمز عبور باید حداقل ۳ کاراکتر باشد"),
});

const loginStage1Schema = z.object({
	code: z
		.array(z.string().length(1, "هر رقم را وارد کنید"))
		.length(6, "کد باید ۶ رقم باشد"),
});

type LoginStage0FormData = z.infer<typeof loginStage0Schema>;
type LoginStage1FormData = z.infer<typeof loginStage1Schema>;

export default function LoginPage() {
	const router = useRouter();
	const setUser = useAuthenticateUser();
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const {
		stage,
		setStage,
		password,
		setPassword,
		phone,
		setPhone,
		code,
		setCode,
	} = useLoginStages();

	const { timeLeft, resendDisabled, reset } = useOTPCountdown(stage === 1);
	const { displayOTP } = useOTPSonner({ phoneNumber: phone });

	// React Hook Form for Stage 0 (Phone + Password)
	const {
		register: registerStage0,
		handleSubmit: handleSubmitStage0,
		formState: { errors: errorsStage0 },
		watch: watchStage0,
	} = useForm<LoginStage0FormData>({
		resolver: zodResolver(loginStage0Schema),
		defaultValues: {
			phone: "",
			password: "",
		},
	});

	// React Hook Form for Stage 1 (OTP)
	const {
		register: registerStage1,
		handleSubmit: handleSubmitStage1,
		formState: { errors: errorsStage1 },
		setValue: setCodeValue,
	} = useForm<LoginStage1FormData>({
		resolver: zodResolver(loginStage1Schema),
		defaultValues: {
			code: ["", "", "", "", "", ""],
		},
	});

	// Watch form values to sync with useLoginStages for button validation
	const watchedPhone = watchStage0("phone");
	const watchedPassword = watchStage0("password");

	// Sync with useLoginStages
	const handleRequestOTP = async (data: LoginStage0FormData) => {
		setPhone(data.phone);
		setPassword(data.password);

		setError(null);
		setLoading(true);
		try {
			const { otp } = await requestOtp(data.phone, "login");
			displayOTP(otp);
			reset();
			setStage(1);
		} catch (err: any) {
			setError(err.message || "خطا در ارسال کد. لطفا دوباره تلاش کنید.");
		} finally {
			setLoading(false);
		}
	};

	const handleLogin = async (data: LoginStage1FormData) => {
		setError(null);
		setLoading(true);
		try {
			const otpCode = data.code.join("");
			const data_response = await apiLogin(phone, password, otpCode);

			if (data_response.accessToken) {
				setAccessToken(data_response.accessToken);
			}
			if (data_response.user) {
				setUser(data_response.user);
			}

			router.push("/");
		} catch (err: any) {
			setError(err.message || "خطا در ورود. لطفا دوباره تلاش کنید.");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (value: string) => { const codeArray = value.padEnd(6, "").split(""); setCode(codeArray); setCodeValue("code", codeArray); };

	// Check validity for button state
	const isValidPhone = /^09\d{9}$/.test(watchedPhone || "");
	const isValidPassword = (watchedPassword || "").length >= 3;
	const isValidCode = code.every((d) => d.length === 1);

	/* ------------------------------------------------------------
	 * RENDER
	 * ------------------------------------------------------------ */
	return (
		<div dir="rtl" className="min-h-screen flex flex-col bg-gray-50">
			{/* MAIN CONTENT */}
			<main className="flex flex-col justify-center items-center relative z-20 flex-1 py-10 px-4">
				{/* Card Container */}
				<Card className="w-full max-w-md shadow-lg border-0 bg-white rounded-2xl">
					<CardContent className="p-6">
						{/* TITLE */}
						<div className="flex flex-col gap-3 mb-6">
							<span className="font-semibold text-2xl text-gray-800">ورود</span>

							<p className="text-gray-500 text-sm">
								{stage === 0 && "شماره موبایل و رمز عبور خود را وارد کنید"}
								{stage === 1 &&
									`کد ارسال شده به شماره موبایل ${phone} را وارد کن`}
							</p>
						</div>

						{/* STAGE CONTENT */}
						{stage === 0 && (
							<form onSubmit={handleSubmitStage0(handleRequestOTP)}>
								<div className="flex flex-col justify-between gap-4">
									{/* Phone Input */}
									<InputGroup>
										<InputGroupInput
											placeholder="09xx-xxx-xxxx"
											{...registerStage0("phone")}
										/>
										<InputGroupAddon align="inline-end" className="px-2">
											<Phone className="size-4" />
										</InputGroupAddon>
									</InputGroup>
									{errorsStage0.phone && (
										<p className="text-red-500 text-sm mt-1">
											{errorsStage0.phone.message as string}
										</p>
									)}

									{/* Password Input */}
									<InputGroup>
										<InputGroupInput
											placeholder="رمز عبور"
											type={showPassword ? "text" : "password"}
											{...registerStage0("password")}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												size="icon-sm"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<Eye className="size-4" />
												) : (
													<EyeClosed className="size-4" />
												)}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									{errorsStage0.password && (
										<p className="text-red-500 text-sm mt-1">
											{errorsStage0.password.message as string}
										</p>
									)}
								</div>

								{/* Error Message */}
								{error && (
									<div className="mt-3 text-right text-red-500 text-sm">
										{error}
									</div>
								)}

								{/* MAIN ACTION BUTTON */}
								<Button
									type="submit"
									className={`w-full text-white rounded-xl h-12 mt-6 ${
										isValidPhone && isValidPassword && !loading
											? "bg-gray-700 hover:bg-gray-800"
											: "bg-gray-400 cursor-not-allowed"
									}`}
									disabled={loading || !isValidPhone || !isValidPassword}
								>
									{loading ? "در حال پردازش..." : "ادامه"}
								</Button>

								{/* FOOTER LINK */}
								<p className="mt-4 text-center text-gray-500 text-sm">
									حساب کاربری ندارید؟{" "}
									<a
										href="/signup"
										className="text-gray-700 hover:underline font-medium"
									>
										ثبت نام
									</a>
								</p>
							</form>
						)}

						{stage === 1 && (
							<form onSubmit={handleSubmitStage1(handleLogin)}>
								<div dir="ltr" className="flex justify-center w-full">
									<InputOTP
										maxLength={6}
										value={code.join("")}
										onChange={handleChange}
									>
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

								{errorsStage1.code && (
									<p className="mt-2 text-right text-red-500 text-sm">
										{errorsStage1.code.message as string}
									</p>
								)}

								{/* Error Message */}
								{error && (
									<div className="mt-3 text-right text-red-500 text-sm">
										{error}
									</div>
								)}

								{/* MAIN ACTION BUTTON */}
								<Button
									type="submit"
									className={`w-full text-white rounded-xl h-12 mt-6 ${
										isValidCode && !loading
											? "bg-gray-700 hover:bg-gray-800"
											: "bg-gray-400 cursor-not-allowed"
									}`}
									disabled={loading || !isValidCode}
								>
									{loading ? "در حال پردازش..." : "تایید"}
								</Button>

								{/* FOOTER */}
								<div
									dir="rtl"
									className="flex justify-between items-center w-full mt-4 pt-4 border-t border-gray-100"
								>
									<Button
										variant="ghost"
										className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium"
										onClick={() => setStage(0)}
									>
										<span className="text-gray-500 font-normal text-[14px]">
											ویرایش شماره
										</span>
										<Edit className="w-4 h-4 mr-1" />
									</Button>

									<div className="flex items-center gap-3">
										<span className="text-gray-600 bg-gray-100 border border-gray-200 text-[13px] rounded-lg px-3 py-1.5 font-medium">
											{formatTime(timeLeft)}
										</span>

										<Button
											variant="ghost"
											disabled={resendDisabled}
											onClick={async () => {
												setError(null);
												setLoading(true);
												try {
													const { otp } = await requestOtp(phone, "login");
													displayOTP(otp);
													reset();
													setStage(1);
												} catch (err: any) {
													setError(err.message || "خطا در ارسال کد");
												} finally {
													setLoading(false);
												}
											}}
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
							</form>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

