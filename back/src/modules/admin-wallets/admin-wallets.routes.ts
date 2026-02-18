import { t } from "elysia";
import { app } from "../../server";
import * as adminWalletsController from "./admin-wallets.controller";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";

export function registerAdminWalletsRoutes(appInstance: typeof app) {
	// GET /admin/wallets - List all wallets (paginated, filterable)
	appInstance.get("/admin/wallets", adminWalletsController.listWallets, {
		beforeHandle: [requireAuth, requirePermission("wallets:read")] as any,
	});

	// GET /admin/wallets/:id - Get wallet by ID
	appInstance.get("/admin/wallets/:id", adminWalletsController.getWalletById, {
		beforeHandle: [requireAuth, requirePermission("wallets:read")] as any,
	});

	// GET /admin/wallets/:id/transactions - Get wallet's transactions
	appInstance.get(
		"/admin/wallets/:id/transactions",
		adminWalletsController.getWalletTransactions,
		{
			beforeHandle: [requireAuth, requirePermission("wallets:read")] as any,
		},
	);

	// POST /admin/wallets/:id/freeze - Freeze a wallet
	appInstance.post(
		"/admin/wallets/:id/freeze",
		adminWalletsController.freezeWallet,
		{
			beforeHandle: [requireAuth, requirePermission("wallets:freeze")] as any,
			body: adminWalletsController.freezeBodySchema,
		},
	);

	// POST /admin/wallets/:id/unfreeze - Unfreeze a wallet
	appInstance.post(
		"/admin/wallets/:id/unfreeze",
		adminWalletsController.unfreezeWallet,
		{
			beforeHandle: [requireAuth, requirePermission("wallets:freeze")] as any,
			body: adminWalletsController.freezeBodySchema,
		},
	);

	// POST /admin/wallets/:id/adjust - Adjust wallet balance
	appInstance.post(
		"/admin/wallets/:id/adjust",
		adminWalletsController.adjustWalletBalance,
		{
			beforeHandle: [requireAuth, requirePermission("wallets:adjust")] as any,
			body: adminWalletsController.adjustWalletBodySchema,
		},
	);
}
