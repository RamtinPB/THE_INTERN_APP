"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginHeader() {
	const router = useRouter();

	return (
		<header className="flex h-[72px] z-50 bg-white w-full items-center border-b px-6">
			<Button
				variant="ghost"
				className="h-8 w-8 p-0"
				onClick={() => router.push("/")}
			>
				<ArrowRight className="w-fit! h-fit!" />
			</Button>
		</header>
	);
}
