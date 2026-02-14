import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRE_IN;
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRE_IN;

export const parseExpiryToMs = (expiry: string): number => {
	const match = expiry.match(/^(\d+)([smhd]?)$/);
	if (!match) return 0;
	const value = parseInt(match[1]!, 10);
	const unit = match[2] || "s"; // default to seconds if no unit
	switch (unit) {
		case "s":
			return value * 1000;
		case "m":
			return value * 60 * 1000;
		case "h":
			return value * 60 * 60 * 1000;
		case "d":
			return value * 24 * 60 * 60 * 1000;
		default:
			return value * 1000;
	}
};

export const signAccessToken = (payload: object) => {
	return jwt.sign(payload, ACCESS_SECRET, {
		expiresIn: `${ACCESS_EXP}` as jwt.SignOptions["expiresIn"],
	});
};

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, ACCESS_SECRET);
};

export const signRefreshToken = (payload: object) => {
	return jwt.sign(payload, REFRESH_SECRET, {
		expiresIn: REFRESH_EXP as jwt.SignOptions["expiresIn"],
	});
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, REFRESH_SECRET);
};
