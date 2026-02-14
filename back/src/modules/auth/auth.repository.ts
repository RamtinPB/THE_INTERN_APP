import { prisma } from "../../infrastructure/db/prisma.client";

// User operations
export const findUserByPhoneNumber = async (phoneNumber: string) => {
	return prisma.user.findUnique({ where: { phoneNumber } });
};

export const findUserById = async (id: number) => {
	return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (
	phoneNumber: string,
	passwordHash: string,
	userType: "CUSTOMER" | "BUSINESS" = "CUSTOMER",
) => {
	return prisma.user.create({
		data: { phoneNumber, passwordHash, userType },
	});
};

// OTP operations
export const createOTP = async (
	phoneNumber: string,
	codeHash: string,
	expiresAt: Date,
	purpose: "LOGIN" | "SIGNUP" | "VERIFY_TRANSACTION", // Add this
	userId?: number | null,
) => {
	return prisma.oTP.create({
		data: {
			phoneNumber,
			codeHash,
			expiresAt,
			purpose,
			userId: userId ?? null,
		},
	});
};

export const findValidOTP = async (phoneNumber: string) => {
	return prisma.oTP.findFirst({
		where: {
			phoneNumber,
			consumed: false,
			expiresAt: { gte: new Date() },
		},
		orderBy: { createdAt: "desc" },
	});
};

export const consumeOTP = async (id: number) => {
	return prisma.oTP.update({
		where: { id },
		data: { consumed: true },
	});
};

// RefreshToken operations
export const createRefreshToken = async (
	tokenHash: string,
	expiresAt: Date,
	userId: number,
) => {
	return prisma.refreshToken.create({
		data: {
			tokenHash,
			expiresAt,
			userId,
		},
	});
};

export const findValidRefreshTokens = async (userId: number) => {
	return prisma.refreshToken.findMany({
		where: { userId, revoked: false, expiresAt: { gte: new Date() } },
		orderBy: { createdAt: "desc" },
	});
};

export const revokeRefreshTokenById = async (id: number) => {
	return prisma.refreshToken.update({
		where: { id },
		data: { revoked: true },
	});
};

export const findAllRefreshTokens = async () => {
	return prisma.refreshToken.findMany({
		where: { revoked: false },
	});
};

// RevokedAccessToken operations
export const createRevokedAccessToken = async (
	tokenHash: string,
	expiresAt: Date,
	userId: number,
) => {
	return prisma.revokedAccessToken.create({
		data: {
			tokenHash,
			expiresAt,
			userId,
		},
	});
};

export const findRevokedAccessToken = async (tokenHash: string) => {
	return prisma.revokedAccessToken.findFirst({
		where: {
			tokenHash,
			expiresAt: { gte: new Date() },
		},
	});
};

export const cleanupExpiredRevokedTokens = async () => {
	return prisma.revokedAccessToken.deleteMany({
		where: {
			expiresAt: { lt: new Date() },
		},
	});
};
