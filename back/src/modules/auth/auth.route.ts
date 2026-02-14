import { t } from "elysia";
import { app } from "../../server";
import * as authController from "./auth.controller";
import { requireAuth } from "../../infrastructure/auth/auth.guard";

export function registerAuthRoutes(appInstance: typeof app) {
	appInstance.post("/auth/request-otp", authController.requestOtp, {
		body: t.Object({
			phoneNumber: t.String(),
			purpose: t.Optional(
				t.Union([
					t.Literal("login"),
					t.Literal("signup"),
					t.Literal("verifyTransaction"),
				]),
			),
		}),
	});
	appInstance.post("/auth/signup", authController.signup, {
		body: t.Object({
			phoneNumber: t.String(),
			password: t.String(),
			otp: t.String(),
		}),
	});
	appInstance.post("/auth/login", authController.login, {
		body: t.Object({
			phoneNumber: t.String(),
			password: t.String(),
			otp: t.String(),
		}),
	});
	appInstance.post("/auth/refresh", authController.refresh, {});
	appInstance.get("/auth/me", authController.me, {
		beforeHandle: requireAuth,
	});
	appInstance.post("/auth/logout", authController.logout, {});
}
