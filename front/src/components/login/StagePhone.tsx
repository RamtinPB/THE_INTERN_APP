"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";

import { Phone, Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { FieldErrors } from "react-hook-form";

interface StagePhoneProps {
	password: string;
	setPassword: (v: string) => void;
	phone: string;
	setPhone: (v: string) => void;
	register?: any;
	errors?: FieldErrors;
}

export function StagePhone({
	password,
	setPassword,
	phone,
	setPhone,
	register,
	errors,
}: StagePhoneProps) {
	const [showPassword, setShowPassword] = useState(false);

	// If react-hook-form is used (register is provided)
	if (register) {
		return (
			<div className="flex flex-col justify-between gap-4">
				{/* Phone Input */}
				<InputGroup>
					<InputGroupInput placeholder="09xx-xxx-xxxx" {...register("phone")} />
					<InputGroupAddon align="inline-end" className="px-2">
						<Phone className="size-4" />
					</InputGroupAddon>
				</InputGroup>
				{errors?.phone && (
					<p className="text-red-500 text-sm mt-1">
						{errors.phone.message as string}
					</p>
				)}

				{/* Password Input */}
				<InputGroup>
					<InputGroupInput
						placeholder="رمز عبور"
						type={showPassword ? "text" : "password"}
						{...register("password")}
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
				{errors?.password && (
					<p className="text-red-500 text-sm mt-1">
						{errors.password.message as string}
					</p>
				)}
			</div>
		);
	}

	// Legacy support without react-hook-form
	return (
		<div className="flex flex-col justify-between gap-4">
			{/* Phone Input */}
			<InputGroup>
				<InputGroupInput
					placeholder="09xx-xxx-xxxx"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
				/>
				<InputGroupAddon align="inline-end" className="px-2">
					<Phone className="size-4" />
				</InputGroupAddon>
			</InputGroup>

			{/* Password Input */}
			<InputGroup>
				<InputGroupInput
					placeholder="رمز عبور"
					value={password}
					type={showPassword ? "text" : "password"}
					onChange={(e) => setPassword(e.target.value)}
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
		</div>
	);
}
