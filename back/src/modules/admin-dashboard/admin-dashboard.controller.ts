import { requireAuth } from "../../infrastructure/auth/auth.guard";
import * as adminDashboardService from "./admin-dashboard.service";

// Get dashboard statistics
// GET /admin/dashboard/stats
export const getDashboardStats = async (ctx: any) => {
	try {
		const stats = await adminDashboardService.getDashboardStats(
			ctx.user.permissions || [],
		);

		return { stats };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get dashboard stats" };
	}
};

// Get dashboard chart data
// GET /admin/dashboard/charts?days=30
export const getDashboardCharts = async (ctx: any) => {
	const { days } = ctx.query || {};

	// Parse days query param with default of 30
	const parsedDays = days ? parseInt(days) : 30;

	if (isNaN(parsedDays) || parsedDays < 1) {
		ctx.set.status = 400;
		return { error: "Invalid days parameter" };
	}

	try {
		const charts = await adminDashboardService.getDashboardCharts(
			{ days: parsedDays },
			ctx.user.permissions || [],
		);

		return { charts };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to get dashboard charts" };
	}
};
