import { refreshAccessToken, getMe } from "@/lib/api/auth";
import type { User } from "@/types/auth";

export async function bootstrapAuth(): Promise<{ user: User | null }> {
	try {
		// 1. First attempt: assume access token might still be valid
		const me = await getMe();

		if (!me || !me.user) {
			return { user: null };
		}

		return { user: me.user as User };
	} catch {
		// 2. If /me failed, attempt refresh ONCE
		try {
			await refreshAccessToken();

			// 3. Retry /me after successful refresh
			const me = await getMe();

			if (!me || !me.user) {
				return { user: null };
			}

			return { user: me.user as User };
		} catch {
			// 4. Refresh failed → user is unauthenticated
			return { user: null };
		}
	}
}
