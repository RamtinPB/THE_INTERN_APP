import { t } from "elysia";
import { app } from "../../server";
import * as adminUsersController from "./admin-users.controller";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";

export function registerAdminUsersRoutes(appInstance: typeof app) {
	// GET /admin/users - List users (paginated, filterable)
	appInstance.get("/admin/users", adminUsersController.listUsers, {
		beforeHandle: [requireAuth, requirePermission("users:read")] as any,
	});

	// GET /admin/users/:id - Get user by ID
	appInstance.get("/admin/users/:id", adminUsersController.getUserById, {
		beforeHandle: [requireAuth, requirePermission("users:read")] as any,
	});

	// GET /admin/users/:id/wallets - Get user's wallets
	appInstance.get(
		"/admin/users/:id/wallets",
		adminUsersController.getUserWallets,
		{
			beforeHandle: [requireAuth, requirePermission("users:read")] as any,
		},
	);

	// GET /admin/users/:id/transactions - Get user's transactions
	appInstance.get(
		"/admin/users/:id/transactions",
		adminUsersController.getUserTransactions,
		{
			beforeHandle: [requireAuth, requirePermission("users:read")] as any,
		},
	);

	// POST /admin/users/:id/suspend - Suspend a user
	appInstance.post(
		"/admin/users/:id/suspend",
		adminUsersController.suspendUser,
		{
			beforeHandle: [requireAuth, requirePermission("users:suspend")] as any,
			body: t.Object({
				reason: t.Optional(t.String()),
			}),
		},
	);

	// POST /admin/users/:id/unsuspend - Reactivate a user
	appInstance.post(
		"/admin/users/:id/unsuspend",
		adminUsersController.unsuspendUser,
		{
			beforeHandle: [requireAuth, requirePermission("users:suspend")] as any,
			body: t.Object({
				reason: t.Optional(t.String()),
			}),
		},
	);

	// POST /admin/users/:id/adjust-wallet - Adjust wallet balance
	appInstance.post(
		"/admin/users/:id/adjust-wallet",
		adminUsersController.adjustWalletBalance,
		{
			beforeHandle: [requireAuth, requirePermission("wallets:adjust")] as any,
			body: t.Object({
				walletId: t.Number(),
				amount: t.Number(),
				type: t.Union([t.Literal("ADD"), t.Literal("SUBTRACT")]),
				reason: t.String(),
			}),
		},
	);
}
