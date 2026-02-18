import * as authService from "./auth.service";
import * as adminRepository from "../admin/admin.repository";
import {
	verifyRefreshToken,
	parseExpiryToMs,
} from "../../infrastructure/auth/jwt.provider";

const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXPIRE_IN!;
const isDevMode = process.env.NODE_ENV === "development";
const isProdMode = process.env.NODE_ENV === "production";

export const requestOtp = async (ctx: any) => {
	const body = await ctx.body;
	const phoneNumber = body.phoneNumber;
	let purpose = body.purpose;

	// Convert to uppercase for Prisma enum
	if (purpose) {
		purpose = purpose.toUpperCase() as
			| "SIGNUP"
			| "LOGIN"
			| "VERIFY_TRANSACTION";
	}

	if (!phoneNumber) {
		ctx.set.status = 400;
		return { error: "Phone number is required" };
	}

	try {
		const result = await authService.generateAndStoreOTP(phoneNumber, purpose);
		return { success: true, otp: result.otp };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "Failed to generate OTP" };
	}
};

export const signup = async (ctx: any) => {
	const body = await ctx.body;
	const { phoneNumber, password, otp, userType } = body || {};
	if (!phoneNumber || !password || !otp) {
		ctx.set.status = 400;
		return {
			error: "Phone number, password and OTP are required",
		};
	}

	// Default to CUSTOMER if not provided
	const userAccountType = userType === "BUSINESS" ? "BUSINESS" : "CUSTOMER";

	try {
		const created = await authService.signupWithPasswordOtp(
			phoneNumber,
			password,
			otp,
			userAccountType,
		);

		// Set refresh token in httpOnly cookie
		ctx.cookie.refreshToken.set({
			value: created.refreshToken,
			httpOnly: true,
			sameSite: "none",
			secure: true,
			path: "/",
			maxAge: Math.floor(parseExpiryToMs(REFRESH_TOKEN_EXP!) / 1000),
		});

		// Return user and access token in response
		return { user: created.user, accessToken: created.accessToken };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "signup failed" };
	}
};

export const login = async (ctx: any) => {
	const body = await ctx.body;
	const { phoneNumber, password, otp } = body || {};
	if (!phoneNumber || !password || !otp) {
		ctx.set.status = 400;
		return { error: "Phone number, password and OTP are required" };
	}

	try {
		const res = await authService.loginWithPasswordOtp(
			phoneNumber,
			password,
			otp,
		);

		ctx.cookie.refreshToken.set({
			value: res.refreshToken,
			httpOnly: true,
			sameSite: "none",
			secure: true,
			path: "/",
			maxAge: Math.floor(parseExpiryToMs(REFRESH_TOKEN_EXP!) / 1000),
		});

		return { user: res.user, accessToken: res.accessToken };
	} catch (err: any) {
		ctx.set.status = 400;
		return { error: err.message || "login failed" };
	}
};

export const refresh = async (ctx: any) => {
	// Get the refresh token from cookie
	let raw = ctx.cookie.refreshToken.value;

	// Allow supplying the refresh token in the request body for Swagger testing
	if (!raw && isDevMode && !isProdMode) {
		const body = await ctx.body;
		raw = body?.refreshToken;
	}

	if (!raw) {
		ctx.set.status = 401;
		return { error: "Refresh token is required" };
	}

	try {
		// First verify the refresh token signature
		const payload = verifyRefreshToken(raw);

		// Then call service with both token and payload
		const tokens = await authService.refreshAccessToken(raw, payload);

		ctx.cookie.refreshToken.set({
			value: tokens.refreshToken,
			httpOnly: true,
			sameSite: "none",
			secure: true,
			path: "/",
			maxAge: Math.floor(parseExpiryToMs(REFRESH_TOKEN_EXP!) / 1000),
		});

		return { accessToken: tokens.accessToken };
	} catch (err: any) {
		ctx.set.status = 401;
		return { error: err.message || "Invalid refresh token" };
	}
};

export const logout = async (ctx: any) => {
	// Get the refresh token from cookie or body
	let refreshToken = ctx.cookie.refreshToken.value;

	// Allow supplying the refresh token in the request body for Swagger testing
	if (!refreshToken) {
		const body = await ctx.body;
		refreshToken = body?.refreshToken;
	}

	// Revoke refresh token if it exists
	if (refreshToken) {
		await authService.revokeRefreshToken(refreshToken);
	}

	// Clear the cookie (maxAge 0 = delete)
	ctx.cookie.refreshToken.set({
		value: "",
		httpOnly: true,
		sameSite: "none",
		secure: true,
		path: "/",
		maxAge: 0, // delete immediately
	});

	return { ok: true };
};

export const me = async (ctx: any) => {
	// The auth guard has already validated the token and attached user info to ctx.user
	try {
		// ctx.user should contain { id: userId, role: userRole, adminId, adminType, permissions } from the guard
		if (!ctx.user) {
			ctx.set.status = 401;
			return { error: "User not authenticated" };
		}

		// Build response with user info
		const response: any = {
			id: ctx.user.id,
			phoneNumber: ctx.user.phoneNumber || "", // May not be in token
			userType: ctx.user.userType,
		};

		// If admin claims exist in token, include admin info
		if (ctx.user.adminId) {
			response.admin = {
				id: ctx.user.adminId,
				publicId: ctx.user.adminPublicId,
				adminType: ctx.user.adminType,
				permissions: ctx.user.permissions,
			};
		} else {
			// Try to fetch from DB to get fresh admin info
			const admin = await adminRepository.findAdminByUserId(ctx.user.id);
			if (admin && admin.status === "ACTIVE") {
				response.admin = {
					id: admin.id,
					publicId: admin.publicId,
					adminType: admin.adminType,
					status: admin.status,
					permissions: admin.permissions,
				};
			}
		}

		return { user: response };
	} catch (error) {
		ctx.set.status = 401;
		return { error: "Invalid token" };
	}
};
