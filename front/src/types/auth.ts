export interface User {
	id: string;
	phoneNumber: string;
	role: "CUSTOMER" | "BUSINESS" | "ADMIN";
	createdAt: string;
	updatedAt: string;
}
