import { t } from "elysia";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";
import * as adminAuditController from "./admin-audit.controller";

export function registerAdminAuditRoutes(appInstance: any) {
	// List audit logs (paginated, filterable)
	// GET /admin/audit-logs
	appInstance.get("/admin/audit-logs", adminAuditController.listAuditLogs, {
		beforeHandle: [requireAuth, requirePermission("audit:read")],
	});

	// Get audit log by ID
	// GET /admin/audit-logs/:id
	appInstance.get(
		"/admin/audit-logs/:id",
		adminAuditController.getAuditLogById,
		{
			beforeHandle: [requireAuth, requirePermission("audit:read")],
		},
	);

	// Export audit logs as CSV
	// GET /admin/audit-logs/export
	appInstance.get(
		"/admin/audit-logs/export",
		adminAuditController.exportAuditLogs,
		{
			beforeHandle: [requireAuth, requirePermission("audit:export")],
		},
	);
}
