export const requireRole = (role: string) => {
	return async (ctx: any) => {
		if (!ctx.user) {
			ctx.set.status = 401;
			return { error: "Unauthorized" };
		}
		if (ctx.user.role !== role) {
			ctx.set.status = 403;
			return { error: "Forbidden" };
		}
	};
};
