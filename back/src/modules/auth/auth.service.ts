import { hashPassword, comparePassword } from "../../shared/security/hash";
import {
	signAccessToken,
	signRefreshToken,
	parseExpiryToMs,
} from "../../infrastructure/auth/jwt.provider";
import * as authRepository from "./auth.repository";
import bcrypt from "bcryptjs";

const OTP_LENGTH = 4;
const OTP_EXP = parseInt(process.env.OTP_EXPIRE_IN!, 10);
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRE_IN;

const generateNumericOtp = (length: number) => {
	// ensures leading zeros allowed
	return String(Math.floor(Math.random() * Math.pow(10, length))).padStart(
		length,
		"0",
	);
};

export const generateAndStoreOTP = async (
	phoneNumber: string,
	purpose: "SIGNUP" | "LOGIN" | "VERIFY_TRANSACTION",
) => {
	// Business logic: validate user existence based on purpose
	const user = await authRepository.findUserByPhoneNumber(phoneNumber);
	if (purpose === "LOGIN" && !user) {
		throw new Error("User not found, redirect to signup");
	}

	if (purpose === "SIGNUP" && user) {
		throw new Error("User already exists, redirect to login");
	}

	// Generate OTP and hash it
	const otp = generateNumericOtp(OTP_LENGTH);
	const codeHash = await bcrypt.hash(otp, 10);
	const expiresAt = new Date(Date.now() + OTP_EXP * 60 * 1000);

	// Store OTP in database
	await authRepository.createOTP(
		phoneNumber,
		codeHash,
		expiresAt,
		purpose,
		user?.id,
	);

	return { success: true, otp: otp };
};

export const validateOtpAndConsume = async (
	phoneNumber: string,
	otpPlain: string,
) => {
	// Find valid OTP from repository
	const otpRow = await authRepository.findValidOTP(phoneNumber);
	if (!otpRow) throw new Error("invalid or expired OTP");

	// Compare OTP
	const match = await bcrypt.compare(otpPlain, otpRow.codeHash);
	if (!match) {
		throw new Error("invalid OTP");
	}

	// Consume the OTP
	await authRepository.consumeOTP(otpRow.id);

	return true;
};

export const signupWithPasswordOtp = async (
	phoneNumber: string,
	password: string,
	otp: string,
) => {
	// Business logic: validate user doesn't exist
	const existingUser = await authRepository.findUserByPhoneNumber(phoneNumber);
	if (existingUser) throw new Error("User already exists");

	// Validate and consume OTP
	await validateOtpAndConsume(phoneNumber, otp);

	// Hash password and create user
	const passwordHash = await hashPassword(password);
	const newUser = await authRepository.createUser(phoneNumber, passwordHash);

	// Generate tokens
	const accessToken = signAccessToken({
		userId: newUser.id,
		userType: newUser.userType,
	});
	const refreshToken = signRefreshToken({ userId: newUser.id });

	// Store refresh token
	const refreshHash = await bcrypt.hash(refreshToken, 10);
	const refreshExpiryMs = parseExpiryToMs(REFRESH_EXP!);
	const expiresAt = new Date(Date.now() + refreshExpiryMs);
	await authRepository.createRefreshToken(refreshHash, expiresAt, newUser.id);

	return {
		user: {
			id: newUser.id,
			phoneNumber: newUser.phoneNumber,
			userType: newUser.userType,
		},
		accessToken,
		refreshToken,
	};
};

export const loginWithPasswordOtp = async (
	phoneNumber: string,
	password: string,
	otp: string,
) => {
	// Find user by phone number
	const user = await authRepository.findUserByPhoneNumber(phoneNumber);
	if (!user) throw new Error("User not found");

	// Verify password
	const okPass = await comparePassword(password, user.passwordHash);
	if (!okPass) throw new Error("Invalid password");

	// Validate and consume OTP
	await validateOtpAndConsume(user.phoneNumber, otp);

	// Generate tokens
	const accessToken = signAccessToken({
		userId: user.id,
		userType: user.userType,
	});
	const refreshToken = signRefreshToken({ userId: user.id });

	// Store refresh token
	const refreshHash = await bcrypt.hash(refreshToken, 10);
	const refreshExpiryMs = parseExpiryToMs(REFRESH_EXP!);
	const expiresAt = new Date(Date.now() + refreshExpiryMs);
	await authRepository.createRefreshToken(refreshHash, expiresAt, user.id);

	return {
		user: {
			id: user.id,
			phoneNumber: user.phoneNumber,
			userType: user.userType,
		},
		accessToken,
		refreshToken,
	};
};

export const refreshAccessToken = async (
	refreshToken: string,
	payload: any,
) => {
	// Business logic: Validate refresh token against stored tokens
	const userId = payload.userId;
	const user = await authRepository.findUserById(userId);
	if (!user) throw new Error("User not found");

	// Find stored refresh tokens for this user that are not revoked and not expired
	const tokens = await authRepository.findValidRefreshTokens(userId);

	// Compare the raw token with hashed stored token(s)
	for (const t of tokens) {
		const match = await bcrypt.compare(refreshToken, t.tokenHash);
		if (match) {
			// valid refresh token -> issue new access token (and optionally refresh rotation)
			const accessToken = signAccessToken({ userId, userType: user.userType });
			// Optionally rotate refresh token: issue new refresh token and revoke old one
			const newRefreshToken = signRefreshToken({ userId });
			const newHash = await bcrypt.hash(newRefreshToken, 10);
			const refreshExpiryMs = parseExpiryToMs(REFRESH_EXP!);
			const expiresAt = new Date(Date.now() + refreshExpiryMs);

			// revoke old
			await authRepository.revokeRefreshTokenById(t.id);

			// store new
			await authRepository.createRefreshToken(newHash, expiresAt, userId);
			return { accessToken, refreshToken: newRefreshToken };
		}
	}
	throw new Error("Refresh token not found");
};

export const revokeRefreshToken = async (rawRefreshToken: string) => {
	// Get all refresh tokens from repository
	const tokens = await authRepository.findAllRefreshTokens();

	// Find and revoke the matching token
	for (const t of tokens) {
		const match = await bcrypt.compare(rawRefreshToken, t.tokenHash);
		if (match) {
			await authRepository.revokeRefreshTokenById(t.id);
			return true;
		}
	}
	return false;
};

export const revokeAccessToken = async (rawAccessToken: string) => {
	// Note: This function should be called with an access token that has already been validated
	// The JWT verification should happen in the guard or controller layer

	try {
		// For now, this is a simplified implementation
		// In a complete implementation, you would pass the payload from the verified token
		throw new Error("This function requires a validated token payload");
	} catch (error) {
		// If token is invalid, we can't revoke it, but that's okay
		return false;
	}
};

export const isAccessTokenRevoked = async (tokenHash: string) => {
	// Check if token hash exists in revoked tokens
	const revoked = await authRepository.findRevokedAccessToken(tokenHash);
	return !!revoked;
};

// Clean up expired revoked tokens periodically
export const cleanupExpiredRevokedTokens = async () => {
	try {
		await authRepository.cleanupExpiredRevokedTokens();
	} catch (error) {
		console.error("Failed to cleanup expired revoked tokens:", error);
	}
};
