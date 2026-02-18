import { verifyAccessToken } from "./jwt.provider";

export const requireAuth = async (ctx: any) => {
	const auth = ctx.request.headers.get("authorization") || "";
	const parts = auth.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		ctx.set.status = 401;
		return { error: "Unauthorized" };
	}

	const token = parts[1];
	try {
		const payload: any = verifyAccessToken(token);
		// attach user info to context (includes admin claims if present)
		ctx.user = {
			id: payload.userId,
			userType: payload.userType,
			adminId: payload.adminId,
			adminPublicId: payload.adminPublicId,
			adminType: payload.adminType,
			permissions: payload.permissions,
		};
	} catch (error) {
		ctx.set.status = 401;
		return { error: "Invalid token" };
	}
};
