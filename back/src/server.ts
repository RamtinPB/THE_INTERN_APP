import "dotenv/config";
import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";

import { registerAuthRoutes } from "./modules/auth/auth.route";
import { registerWalletRoutes } from "./modules/wallet/wallet.route";
import { registerTransactionRoutes } from "./modules/transaction/transaction.route";

import { registerAdminDashboardRoutes } from "./modules/admin-dashboard/admin-dashboard.routes";
import { registerAdminAdminsRoutes } from "./modules/admin-admins/admin-admins.routes";
import { registerAdminAuditRoutes } from "./modules/admin-audit/admin-audit.routes";
import { registerAdminBusinessRoutes } from "./modules/admin-business/admin-business.routes";
import { registerAdminTransactionsRoutes } from "./modules/admin-transactions/admin-transactions.routes";
import { registerAdminUsersRoutes } from "./modules/admin-users/admin-users.routes";
import { registerAdminWalletsRoutes } from "./modules/admin-wallets/admin-wallets.routes";

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
				docExpansion: "list",
			},
		}),
	)
	.get("/", () => ({ status: "ok", message: "Backend is running" }));

registerAuthRoutes(app);
registerWalletRoutes(app);
registerTransactionRoutes(app);

// Admin routes
registerAdminDashboardRoutes(app);
registerAdminAdminsRoutes(app);
registerAdminAuditRoutes(app);
registerAdminBusinessRoutes(app);
registerAdminTransactionsRoutes(app);
registerAdminUsersRoutes(app);
registerAdminWalletsRoutes(app);

app.listen(4000);

console.log("🚀 Backend running on http://localhost:4000");
console.log("NODE_ENV:", process.env.NODE_ENV);
