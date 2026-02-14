const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

let accessToken: string | null = null;
let refreshPromise: Promise<any> | null = null;

const authEvents = new EventTarget();

export const onAuthChange = (cb: (token: string | null) => void) => {
	const handler = (e: Event) => cb((e as CustomEvent).detail?.token ?? null);
	authEvents.addEventListener("auth-change", handler as EventListener);
	return () =>
		authEvents.removeEventListener("auth-change", handler as EventListener);
};

export const setAccessToken = (token: string | null) => {
	accessToken = token;
	authEvents.dispatchEvent(
		new CustomEvent("auth-change", { detail: { token } }),
	);
};

export const getAccessToken = () => accessToken;

const clearTokens = () => {
	accessToken = null;
	authEvents.dispatchEvent(
		new CustomEvent("auth-change", { detail: { token: null } }),
	);
};

export async function authenticatedFetch(
	input: RequestInfo,
	init?: RequestInit,
) {
	init = init || {};
	init.credentials = init.credentials ?? "include";
	init.headers = init.headers ?? {};

	if (accessToken) {
		(init.headers as any)["Authorization"] = `Bearer ${accessToken}`;
	}

	let res = await fetch(input, init);

	if (res.status !== 401) return res;

	// try refresh flow once
	try {
		await refreshAccessToken();
	} catch (err) {
		clearTokens();
		return res;
	}

	// retry original request with new token
	if (accessToken)
		(init.headers as any)["Authorization"] = `Bearer ${accessToken}`;
	res = await fetch(input, init);
	return res;
}

export async function requestOtp(phoneNumber: string, purpose: string) {
	const response = await authenticatedFetch(`${API_BASE}/auth/request-otp`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ phoneNumber, purpose }),
	});

	if (!response.ok) {
		let errMsg = "Failed to request OTP";
		try {
			const body = await response.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	return response.json();
}

// Verifies refreshAccessToken returns boolean and never throws fatally
export async function refreshAccessToken(): Promise<boolean> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		try {
			const response = await fetch(`${API_BASE}/auth/refresh`, {
				method: "POST",
				credentials: "include",
			});

			if (!response.ok) {
				return false;
			}

			const data = await response.json();
			if (data.accessToken) setAccessToken(data.accessToken);
			return true;
		} catch {
			return false;
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

export async function login(
	phoneNumber: string,
	password: string,
	otp: string,
) {
	const res = await fetch(`${API_BASE}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ phoneNumber, password, otp }),
	});

	if (!res.ok) {
		let errMsg = "Login failed";
		try {
			const body = await res.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	const data = await res.json();
	if (data.accessToken) setAccessToken(data.accessToken);
	return data;
}

export async function signup(
	phoneNumber: string,
	password: string,
	otp: string,
) {
	const res = await fetch(`${API_BASE}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ phoneNumber, password, otp }),
	});

	if (!res.ok) {
		let errMsg = "Signup failed";
		try {
			const body = await res.json();
			errMsg = body?.error || errMsg;
		} catch (e) {}
		throw new Error(errMsg);
	}

	const data = await res.json();
	if (data.accessToken) setAccessToken(data.accessToken);
	return data;
}

export async function logout() {
	try {
		await fetch(`${API_BASE}/auth/logout`, {
			method: "POST",
			credentials: "include",
		});
	} catch (e) {
		// ignore network errors; still clear local state
	} finally {
		clearTokens();
	}
}

// Verifies getMe never throws on 401, returns null instead
export async function getMe(): Promise<{ user: unknown } | null> {
	try {
		const accToken = getAccessToken();

		if (!accToken) {
			throw new Error("No access token");
		}

		const response = await fetch(`${API_BASE}/auth/me`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accToken}`,
			},
			credentials: "include",
		});

		if (response.status === 401) {
			return null;
		}

		if (!response.ok) {
			return null;
		}

		return response.json();
	} catch (err) {
		// Only catch network errors, re-throw "No access token" to trigger refresh
		if (err instanceof Error && err.message === "No access token") {
			throw err;
		}
		return null;
	}
}
