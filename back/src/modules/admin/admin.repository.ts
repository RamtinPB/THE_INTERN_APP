import { prisma } from "../../infrastructure/db/prisma.client";
import { AdminType, AdminStatus, DEFAULT_PERMISSIONS } from "../../types/admin";

// Find admin by user ID
export const findAdminByUserId = async (userId: number) => {
	return prisma.admin.findUnique({
		where: { userId },
		include: {
			user: {
				select: {
					id: true,
					phoneNumber: true,
					userType: true,
				},
			},
		},
	});
};

// Find admin by ID
export const findAdminById = async (id: number) => {
	return prisma.admin.findUnique({
		where: { id },
		include: {
			user: {
				select: {
					id: true,
					phoneNumber: true,
					userType: true,
				},
			},
		},
	});
};

// Find admin by public ID
export const findAdminByPublicId = async (publicId: string) => {
	return prisma.admin.findUnique({
		where: { publicId },
		include: {
			user: {
				select: {
					id: true,
					phoneNumber: true,
					userType: true,
				},
			},
		},
	});
};

// Create admin
export const createAdmin = async (
	userId: number,
	adminType: AdminType,
	department?: string,
) => {
	const permissions = DEFAULT_PERMISSIONS[adminType];
	return prisma.admin.create({
		data: {
			userId,
			adminType,
			department,
			permissions,
			status: "ACTIVE",
		},
	});
};

// Update admin
export const updateAdmin = async (
	id: number,
	data: {
		adminType?: AdminType;
		status?: AdminStatus;
		department?: string;
		permissions?: string[];
	},
) => {
	return prisma.admin.update({
		where: { id },
		data,
	});
};

// Update last login
export const updateLastLogin = async (id: number) => {
	return prisma.admin.update({
		where: { id },
		data: { lastLoginAt: new Date() },
	});
};

// Delete admin
export const deleteAdmin = async (id: number) => {
	return prisma.admin.delete({
		where: { id },
	});
};

// List admins with pagination
export const listAdmins = async (params: {
	page: number;
	limit: number;
	adminType?: AdminType;
	status?: AdminStatus;
}) => {
	const { page, limit, adminType, status } = params;
	const skip = (page - 1) * limit;

	const where: any = {};
	if (adminType) where.adminType = adminType;
	if (status) where.status = status;

	const [admins, total] = await Promise.all([
		prisma.admin.findMany({
			where,
			skip,
			take: limit,
			include: {
				user: {
					select: {
						id: true,
						phoneNumber: true,
						userType: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.admin.count({ where }),
	]);

	return {
		data: admins,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

// Create audit log
export const createAuditLog = async (data: {
	adminId: number;
	action: string;
	entityType: string;
	entityId: number;
	description?: string;
	metadata?: object;
	ipAddress?: string;
	userAgent?: string;
}) => {
	return prisma.adminAuditLog.create({
		data,
	});
};

// Get audit logs with pagination
export const getAuditLogs = async (params: {
	page: number;
	limit: number;
	adminId?: number;
	action?: string;
	entityType?: string;
	entityId?: number;
}) => {
	const { page, limit, adminId, action, entityType, entityId } = params;
	const skip = (page - 1) * limit;

	const where: any = {};
	if (adminId) where.adminId = adminId;
	if (action) where.action = action;
	if (entityType) where.entityType = entityType;
	if (entityId) where.entityId = entityId;

	const [logs, total] = await Promise.all([
		prisma.adminAuditLog.findMany({
			where,
			skip,
			take: limit,
			include: {
				admin: {
					include: {
						user: {
							select: {
								phoneNumber: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.adminAuditLog.count({ where }),
	]);

	return {
		data: logs,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

// Get single audit log
export const getAuditLogById = async (id: number) => {
	return prisma.adminAuditLog.findUnique({
		where: { id },
		include: {
			admin: {
				include: {
					user: {
						select: {
							phoneNumber: true,
						},
					},
				},
			},
		},
	});
};
