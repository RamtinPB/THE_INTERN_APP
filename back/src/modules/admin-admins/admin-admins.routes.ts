import { t } from "elysia";
import { app } from "../../server";
import * as adminAdminsController from "./admin-admins.controller";
import { requireAuth } from "../../infrastructure/auth/auth.guard";
import { requirePermission } from "../../infrastructure/auth/permission.middleware";

export function registerAdminAdminsRoutes(appInstance: typeof app): void {
	// GET /admin/admins - List all admins (paginated, filterable)
	appInstance.get("/admin/admins", adminAdminsController.listAdmins, {
		beforeHandle: [requireAuth, requirePermission("admins:read")] as any,
	});

	// GET /admin/admins/:id - Get admin by ID
	appInstance.get("/admin/admins/:id", adminAdminsController.getAdminById, {
		beforeHandle: [requireAuth, requirePermission("admins:read")] as any,
	});

	// POST /admin/admins - Create new admin
	appInstance.post("/admin/admins", adminAdminsController.createAdmin, {
		beforeHandle: [requireAuth, requirePermission("admins:write")] as any,
		body: t.Object({
			userId: t.Number(),
			adminType: t.String(),
			department: t.Optional(t.String()),
		}),
	});

	// PATCH /admin/admins/:id - Update admin details
	appInstance.patch("/admin/admins/:id", adminAdminsController.updateAdmin, {
		beforeHandle: [requireAuth, requirePermission("admins:write")] as any,
		body: t.Object({
			adminType: t.Optional(t.String()),
			department: t.Optional(t.String()),
			permissions: t.Optional(t.Array(t.String())),
		}),
	});

	// POST /admin/admins/:id/suspend - Suspend an admin
	appInstance.post(
		"/admin/admins/:id/suspend",
		adminAdminsController.suspendAdmin,
		{
			beforeHandle: [requireAuth, requirePermission("admins:suspend")] as any,
			body: t.Object({
				reason: t.Optional(t.String()),
			}),
		},
	);

	// POST /admin/admins/:id/unsuspend - Unsuspend (reactivate) an admin
	appInstance.post(
		"/admin/admins/:id/unsuspend",
		adminAdminsController.unsuspendAdmin,
		{
			beforeHandle: [requireAuth, requirePermission("admins:suspend")] as any,
			body: t.Object({
				reason: t.Optional(t.String()),
			}),
		},
	);

	// DELETE /admin/admins/:id - Delete an admin
	appInstance.delete("/admin/admins/:id", adminAdminsController.deleteAdmin, {
		beforeHandle: [requireAuth, requirePermission("admins:write")] as any,
	});
}
