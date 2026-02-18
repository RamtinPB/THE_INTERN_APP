import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";
import * as adminBusinessController from "./admin-business.controller";

export function registerAdminBusinessRoutes(appInstance: any) {
	// List all business users
	// GET /admin/business
	appInstance.get(
		"/admin/business",
		adminBusinessController.listBusinessUsers,
		{
			beforeHandle: [requireAuth, requirePermission("business:read")],
		},
	);

	// Get business user by ID
	// GET /admin/business/:id
	appInstance.get(
		"/admin/business/:id",
		adminBusinessController.getBusinessUserById,
		{
			beforeHandle: [requireAuth, requirePermission("business:read")],
		},
	);

	// Get business user's wallets
	// GET /admin/business/:id/wallets
	appInstance.get(
		"/admin/business/:id/wallets",
		adminBusinessController.getBusinessUserWallets,
		{
			beforeHandle: [requireAuth, requirePermission("business:read")],
		},
	);

	// Get business user's transactions
	// GET /admin/business/:id/transactions
	appInstance.get(
		"/admin/business/:id/transactions",
		adminBusinessController.getBusinessUserTransactions,
		{
			beforeHandle: [requireAuth, requirePermission("business:read")],
		},
	);

	// Verify business user
	// POST /admin/business/:id/verify
	appInstance.post(
		"/admin/business/:id/verify",
		adminBusinessController.verifyBusinessUser,
		{
			body: t.Object({
				notes: t.Optional(t.String()),
			}),
			beforeHandle: [requireAuth, requirePermission("business:verify")],
		},
	);

	// Reject business user
	// POST /admin/business/:id/reject
	appInstance.post(
		"/admin/business/:id/reject",
		adminBusinessController.rejectBusinessUser,
		{
			body: t.Object({
				reason: t.String(),
			}),
			beforeHandle: [requireAuth, requirePermission("business:verify")],
		},
	);

	// Get business analytics
	// GET /admin/business/analytics
	appInstance.get(
		"/admin/business/analytics",
		adminBusinessController.getBusinessAnalytics,
		{
			beforeHandle: [requireAuth, requirePermission("business:read")],
		},
	);
}
