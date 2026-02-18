import { requireAuth } from "../../infrastructure/auth/auth.guard";
import * as adminAuditService from "./admin-audit.service";

// List audit logs (paginated, filterable)
// GET /admin/audit-logs?page=1&limit=10&adminId=1&action=CREATE&entityType=USER
export const listAuditLogs = async (ctx: any) => {
	const { page, limit, adminId, action, entityType } = ctx.query || {};

	// Parse query params with defaults
	const parsedPage = parseInt(page) || 1;
	const parsedLimit = parseInt(limit) || 10;
	const parsedAdminId = adminId ? parseInt(adminId) : undefined;

	try {
		const result = await adminAuditService.getAuditLogs({
			page: parsedPage,
			limit: parsedLimit,
			adminId: parsedAdminId,
			action,
			entityType,
			adminPermissions: ctx.user.permissions || [],
		});

		return result;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to list audit logs" };
	}
};

// Get audit log details by ID
// GET /admin/audit-logs/:id
export const getAuditLogById = async (ctx: any) => {
	const id = parseInt(ctx.params.id);

	if (!id || isNaN(id)) {
		ctx.set.status = 400;
		return { error: "Invalid audit log ID" };
	}

	try {
		const log = await adminAuditService.getAuditLogById(
			id,
			ctx.user.permissions || [],
		);

		return { auditLog: log };
	} catch (err: any) {
		ctx.set.status = 404;
		return { error: err.message || "Audit log not found" };
	}
};

// Export audit logs as CSV
// GET /admin/audit-logs/export?adminId=1&action=CREATE&entityType=USER&startDate=2024-01-01&endDate=2024-12-31
export const exportAuditLogs = async (ctx: any) => {
	const { adminId, action, entityType, startDate, endDate } = ctx.query || {};

	const parsedAdminId = adminId ? parseInt(adminId) : undefined;
	const parsedStartDate = startDate ? new Date(startDate) : undefined;
	const parsedEndDate = endDate ? new Date(endDate) : undefined;

	try {
		const logs = await adminAuditService.exportAuditLogs({
			adminId: parsedAdminId,
			action,
			entityType,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
			adminPermissions: ctx.user.permissions || [],
		});

		// Convert to CSV format
		const csvHeader =
			"ID,Admin ID,Action,Entity Type,Entity ID,Description,IP Address,Created At\n";
		const csvRows = logs
			.map(
				(log: any) =>
					`${log.id},${log.adminId},"${log.action}","${log.entityType}",${log.entityId || ""},"${log.description || ""}","${log.ipAddress || ""}",${log.createdAt}`,
			)
			.join("\n");

		const csv = csvHeader + csvRows;

		// Set headers for CSV download
		ctx.set.headers = {
			"Content-Type": "text/csv",
			"Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
		};

		return csv;
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to export audit logs" };
	}
};
