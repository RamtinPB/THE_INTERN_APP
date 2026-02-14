"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { bootstrapAuth } from "@/lib/auth/bootstrap";
import { Helix } from "ldrs/react";
import "ldrs/react/Helix.css";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup"];

interface AuthBootstrapProps {
	children: React.ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, setUser, setLoading, loading } = useAuthStore();

	// Check if current route is public
	const isPublicRoute = publicRoutes.includes(pathname);

	const handleUnauthorized = useCallback(() => {
		// Don't redirect if already on a public route
		if (!isPublicRoute) {
			router.push("/login");
		}
	}, [isPublicRoute, router]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const { user: bootstrappedUser } = await bootstrapAuth();

				if (!cancelled) {
					setUser(bootstrappedUser);
					setLoading(false);

					// If not authenticated and not on public route, redirect
					if (!bootstrappedUser) {
						handleUnauthorized();
					}
				}
			} catch {
				if (!cancelled) {
					setUser(null);
					setLoading(false);

					// If not authenticated and not on public route, redirect
					handleUnauthorized();
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [setUser, setLoading, handleUnauthorized]);

	// Show loading spinner while checking auth
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

	// If on public route (login/signup), always allow access
	if (isPublicRoute) {
		return <>{children}</>;
	}

	// For protected routes, only show content if user is authenticated
	if (!user) {
		return (
			<div
				style={{
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontFamily: "var(--font-vazir)",
					direction: "rtl",
				}}
			>
				در حال انتقال به صفحه ورود...
			</div>
		);
	}

	return <>{children}</>;
}
