import "dotenv/config";
import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";

import { registerAuthRoutes } from "./modules/auth/auth.route";
import { registerWalletRoutes } from "./modules/wallet/wallet.route";

export const app = new Elysia()
	.use(
		cors({
			origin: "http://localhost:3000",
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.use(
		swagger({
			documentation: {
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
					},
				},
				security: [{ bearerAuth: [] }],
			},
			swaggerOptions: {
				persistAuthorization: true,
				docExpansion: "none",
			},
		}),
	)
	.get("/", () => ({ status: "ok", message: "Backend is running" }));

registerAuthRoutes(app);
registerWalletRoutes(app);

app.listen(4000);

console.log("🚀 Backend running on http://localhost:4000");
console.log("NODE_ENV:", process.env.NODE_ENV);
