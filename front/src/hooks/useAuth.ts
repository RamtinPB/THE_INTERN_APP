import { useAuthStore } from "@/stores/auth.store";
import { useCallback } from "react";
import { logout as apiLogout, setAccessToken } from "@/lib/api/auth";

// ─────────────────────────────────────────────────────────────────
// State Hooks - Selective subscriptions for optimal re-renders
// ─────────────────────────────────────────────────────────────────

export function useAuthUser() {
	return useAuthStore((state) => state.user);
}

export function useIsAuthenticated() {
	return useAuthStore((state) => !!state.user);
}

export function useAuthLoading() {
	return useAuthStore((state) => state.loading);
}

export function useUserRole() {
	return useAuthStore((state) => state.user?.role ?? null);
}

// ─────────────────────────────────────────────────────────────────
// Action Hooks - Memoized callbacks for stable references
// ─────────────────────────────────────────────────────────────────

export function useLogout() {
	const clearAuth = useAuthStore((state) => state.clearAuth);

	return useCallback(async () => {
		try {
			await apiLogout();
		} finally {
			setAccessToken(null);
			clearAuth();
		}
	}, [clearAuth]);
}

// Intent-based naming: reads like what it does, not what it sets
export function useAuthenticateUser() {
	const setUser = useAuthStore((state) => state.setUser);
	return setUser;
}
