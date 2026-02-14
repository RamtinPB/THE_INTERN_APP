"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { bootstrapAuth } from "@/lib/auth/bootstrap";
import CustomSpinner from "@/features/ShoppingCartPage/CustomSpinner";
import { Helix } from "ldrs/react";
import "ldrs/react/Helix.css";

interface AuthBootstrapProps {
	children: React.ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
	const { setUser, setLoading, loading } = useAuthStore();

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const { user } = await bootstrapAuth();

				if (!cancelled) {
					setUser(user);
					setLoading(false);
				}
			} catch {
				if (!cancelled) {
					setUser(null);
					setLoading(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [setUser, setLoading]);

	if (loading) {
		return (
			<div
				className="flex flex-col gap-3"
				style={{
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontFamily: "var(--font-vazir)",
					direction: "rtl",
				}}
			>
				در حال بارگذاری
				<Helix size="45" speed="2.5" color="#FF6A29" />
			</div>
		);
	}

	return <>{children}</>;
}
