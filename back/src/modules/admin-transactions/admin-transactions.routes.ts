import { t } from "elysia";
import { app } from "../../server";
import * as adminTransactionsController from "./admin-transactions.controller";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";

export function registerAdminTransactionsRoutes(appInstance: typeof app) {
	// GET /admin/transactions - List all transactions (paginated, filterable)
	appInstance.get(
		"/admin/transactions",
		adminTransactionsController.listTransactions,
		{
			beforeHandle: [
				requireAuth,
				requirePermission("transactions:read"),
			] as any,
		},
	);

	// GET /admin/transactions/:id - Get transaction by ID
	appInstance.get(
		"/admin/transactions/:id",
		adminTransactionsController.getTransactionById,
		{
			beforeHandle: [
				requireAuth,
				requirePermission("transactions:read"),
			] as any,
		},
	);

	// POST /admin/transactions/:id/refund - Refund a transaction
	appInstance.post(
		"/admin/transactions/:id/refund",
		adminTransactionsController.refundTransaction,
		{
			beforeHandle: [
				requireAuth,
				requirePermission("transactions:refund"),
			] as any,
			body: t.Object({
				reason: t.String(),
				refundAmount: t.Optional(t.Number()),
			}),
		},
	);

	// POST /admin/transactions/:id/reverse - Reverse a transaction
	appInstance.post(
		"/admin/transactions/:id/reverse",
		adminTransactionsController.reverseTransaction,
		{
			beforeHandle: [
				requireAuth,
				requirePermission("transactions:refund"),
			] as any,
			body: t.Object({
				reason: t.String(),
			}),
		},
	);
}
