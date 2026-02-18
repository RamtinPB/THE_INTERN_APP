import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";
import * as adminDashboardController from "./admin-dashboard.controller";

export function registerAdminDashboardRoutes(appInstance: any) {
	// Get dashboard statistics
	// GET /admin/dashboard/stats
	appInstance.get(
		"/admin/dashboard/stats",
		adminDashboardController.getDashboardStats,
		{
			beforeHandle: [requireAuth, requirePermission("dashboard:view")],
		},
	);

	// Get dashboard chart data
	// GET /admin/dashboard/charts
	appInstance.get(
		"/admin/dashboard/charts",
		adminDashboardController.getDashboardCharts,
		{
			beforeHandle: [requireAuth, requirePermission("dashboard:view")],
			query: t.Object({
				days: t.Optional(t.Numeric()),
			}),
		},
	);
}
