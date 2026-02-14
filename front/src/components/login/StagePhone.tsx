"use client";

import { ButtonGroup } from "@/components/ui/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";

import PhoneIcon from "../../../public/assets/login/Phone.svg";
import EyeIcon from "../../../public/assets/login/eye-solid-full.svg";
import EyeSlashIcon from "../../../public/assets/login/eye-slash-regular-full.svg";
import { Button } from "../../components/ui/button";
import { useState } from "react";

export function StagePhone({
	password,
	setPassword,
	phone,
	setPhone,
}: {
	password: string;
	setPassword: (v: string) => void;
	phone: string;
	setPhone: (v: string) => void;
}) {
	const [showPassword, setShowPassword] = useState(false);
	return (
		<div className="flex flex-col justify-between gap-3">
			<div className=" group flex border border-[#EDEDED] rounded-xl w-full focus-within:border-[#FF6A29] ">
				<InputGroup className="rounded-none rounded-l-xl h-[46px]! w-[calc(100%-46px)]! ring-0 focus:ring-0 focus-visible:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-transparent shadow-none ">
					<InputGroupInput
						placeholder="09xx-xxx-xxxx"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="focus:border-[#FF6A29] focus:ring-[#FF6A29]"
					/>
				</InputGroup>
				<InputGroupAddon className="rounded-r-xl w-[46px]! h-[46px]! p-2 bg-[#F7F7F7] border border-[#EDEDED]  group-focus-within:border-[#FF6A29] ">
					<PhoneIcon className="w-fit! h-fit!" />
				</InputGroupAddon>
			</div>

			<ButtonGroup className=" group flex flex-row-reverse border border-[#EDEDED] rounded-xl w-full focus-within:border-[#FF6A29] ">
				<InputGroup className="rounded-none rounded-l-xl h-[46px] w-[calc(100%-46px)]! ring-0 focus:ring-0 focus-visible:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-transparent shadow-none ">
					<InputGroupInput
						placeholder="***************"
						value={password}
						type={showPassword ? "text" : "password"}
						onChange={(e) => setPassword(e.target.value)}
						className="focus:border-[#FF6A29] focus:ring-[#FF6A29]"
					/>
				</InputGroup>
				<Button
					className="rounded-r-xl w-[46px]! h-[46px]! p-2 bg-[#F7F7F7] border border-[#EDEDED] group-focus-within:border-[#FF6A29] "
					onClick={() => setShowPassword(!showPassword)}
				>
					{showPassword ? (
						<EyeIcon className="w-fit! h-fit! " />
					) : (
						<EyeSlashIcon className="w-fit! h-fit!" />
					)}
				</Button>
			</ButtonGroup>
		</div>
	);
}
